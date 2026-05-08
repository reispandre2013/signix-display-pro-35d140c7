package com.signix.tvplayer

import android.app.Activity
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.bumptech.glide.Glide
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class PlayerActivity : AppCompatActivity() {

    private lateinit var store: SecureStore
    private lateinit var rootContainer: FrameLayout
    private lateinit var pairView: View
    private lateinit var pairCodeText: TextView
    private lateinit var pairStatusText: TextView
    private lateinit var contentImage: ImageView
    private lateinit var contentVideo: PlayerView
    private var exo: ExoPlayer? = null
    private var radioPlayer: ExoPlayer? = null
    @Volatile private var currentRadioUrl: String? = null

    private val scope = CoroutineScope(Dispatchers.Main)
    private val ui = Handler(Looper.getMainLooper())

    @Volatile private var items: List<Api.SyncItem> = emptyList()
    @Volatile private var index = 0
    @Volatile private var syncSec: Long = Config.DEFAULT_SYNC_SEC
    @Volatile private var hbSec: Long = Config.DEFAULT_HEARTBEAT_SEC
    private var syncJob: Job? = null
    private var hbJob: Job? = null
    private var playRunnable: Runnable? = null
    private val volumePresses = ArrayList<Long>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        store = SecureStore.get(this)

        buildUi()
        startService(Intent(this, PlayerService::class.java))

        // Restaura payload offline imediatamente
        store.lastPayload?.let { payload ->
            try {
                items = Api.parsePayloadItems(payload)
                if (items.isNotEmpty()) showCurrent()
            } catch (_: Exception) {}
        }

        ensureRegistered()
        startLoops()
        enterKiosk()
    }

    override fun onResume() {
        super.onResume()
        hideSystemUi()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemUi()
    }

    private fun buildUi() {
        rootContainer = FrameLayout(this).apply {
            setBackgroundColor(Color.BLACK)
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        contentImage = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            visibility = View.GONE
        }
        contentVideo = PlayerView(this).apply {
            useController = false
            visibility = View.GONE
            setShutterBackgroundColor(Color.BLACK)
        }
        rootContainer.addView(contentImage, FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        rootContainer.addView(contentVideo, FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))

        pairView = layoutInflater.inflate(R.layout.view_pairing, rootContainer, false)
        pairCodeText = pairView.findViewById(R.id.pair_code)
        pairStatusText = pairView.findViewById(R.id.pair_status)
        rootContainer.addView(pairView)

        setContentView(rootContainer)
    }

    private fun showPairing(code: String?, msg: String) {
        ui.post {
            pairView.visibility = View.VISIBLE
            contentImage.visibility = View.GONE
            contentVideo.visibility = View.GONE
            pairCodeText.text = code ?: "------"
            pairStatusText.text = msg
        }
    }

    private fun hidePairing() {
        ui.post { pairView.visibility = View.GONE }
    }

    // -------- Boot/registro --------
    private fun ensureRegistered() {
        if (store.deviceToken != null) {
            // Já temos token: mostra loading discreto
            if (!store.paired) showPairing(store.pairingCode, "Aguardando pareamento no painel…")
            return
        }
        showPairing(null, "Registrando dispositivo…")
        scope.launch {
            try {
                val resp = withContext(Dispatchers.IO) {
                    Api.register(store.getOrCreateDeviceUuid())
                }
                store.deviceToken = resp.deviceToken
                store.pairingCode = resp.pairingCode
                store.paired = resp.paired
                if (resp.paired) hidePairing()
                else showPairing(resp.pairingCode, "Digite este código no painel para parear.")
            } catch (e: Exception) {
                showPairing(null, "Erro ao conectar. Tentando novamente…")
                ui.postDelayed({ ensureRegistered() }, 8000)
            }
        }
    }

    // -------- Loops --------
    private fun startLoops() {
        syncJob?.let { return }
        syncJob = scope.launch {
            while (true) {
                doSync()
                kotlinx.coroutines.delay(syncSec * 1000)
            }
        }
        hbJob = scope.launch {
            while (true) {
                kotlinx.coroutines.delay(hbSec * 1000)
                doHeartbeat()
            }
        }
    }

    private suspend fun doSync() {
        val token = store.deviceToken ?: return
        try {
            val resp = withContext(Dispatchers.IO) { Api.sync(token, store.lastEtag) }
            syncSec = resp.syncSec.coerceAtLeast(15)
            hbSec = resp.heartbeatSec.coerceAtLeast(20)
            if (!resp.paired) {
                store.paired = false
                showPairing(resp.pairingCode ?: store.pairingCode,
                    "Aguardando pareamento no painel…")
                return
            }
            store.paired = true
            hidePairing()
            if (resp.unchanged) return
            resp.etag?.let { store.lastEtag = it }
            resp.rawJson?.let { store.lastPayload = it }
            items = resp.items
            index = 0
            showCurrent()
        } catch (e: Exception) {
            val msg = e.message ?: ""
            if (msg.startsWith("auth ")) {
                // token inválido — força novo registro
                store.deviceToken = null
                store.paired = false
                ensureRegistered()
            }
            // mantém reprodução offline
        }
    }

    private suspend fun doHeartbeat() {
        val token = store.deviceToken ?: return
        withContext(Dispatchers.IO) { Api.heartbeat(token) }
    }

    // -------- Reprodução --------
    private fun showCurrent() {
        playRunnable?.let { ui.removeCallbacks(it) }
        if (items.isEmpty()) return
        val item = items[index % items.size]
        when (item.mediaType.lowercase()) {
            "video" -> playVideo(item)
            else -> playImage(item)
        }
    }

    private fun playImage(item: Api.SyncItem) {
        contentVideo.visibility = View.GONE
        releaseExo()
        contentImage.visibility = View.VISIBLE
        Glide.with(this).load(item.mediaUrl).into(contentImage)
        val ms = item.durationSec.coerceAtLeast(4) * 1000
        playRunnable = Runnable { advance() }
        ui.postDelayed(playRunnable!!, ms)
    }

    private fun playVideo(item: Api.SyncItem) {
        contentImage.visibility = View.GONE
        contentVideo.visibility = View.VISIBLE
        releaseExo()
        val player = ExoPlayer.Builder(this).build().also { exo = it }
        contentVideo.player = player
        player.setAudioAttributes(
            androidx.media3.common.AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA)
                .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
                .build(), true
        )
        player.repeatMode = Player.REPEAT_MODE_OFF
        player.setMediaItem(MediaItem.fromUri(Uri.parse(item.mediaUrl)))
        player.prepare()
        player.playWhenReady = true
        player.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                if (state == Player.STATE_ENDED) advance()
            }
            override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                advance()
            }
        })
    }

    private fun advance() {
        index = (index + 1) % items.size.coerceAtLeast(1)
        if (items.isNotEmpty()) showCurrent()
    }

    private fun releaseExo() {
        exo?.release()
        exo = null
        contentVideo.player = null
    }

    // -------- Kiosk / Lock Task --------
    private fun enterKiosk() {
        try {
            val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            if (am.lockTaskModeState == ActivityManager.LOCK_TASK_MODE_NONE) {
                startLockTask()
            }
        } catch (_: Exception) {}
        hideSystemUi()
    }

    private fun hideSystemUi() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let {
                it.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                it.systemBarsBehavior =
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        // Saída de emergência: VOLUME_UP 5x em 3s
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            val now = System.currentTimeMillis()
            volumePresses.add(now)
            volumePresses.removeAll { now - it > 3000 }
            if (volumePresses.size >= 5) {
                try { stopLockTask() } catch (_: Exception) {}
                volumePresses.clear()
            }
            return true
        }
        // Bloqueia BACK / HOME
        if (keyCode == KeyEvent.KEYCODE_BACK || keyCode == KeyEvent.KEYCODE_HOME) {
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() {
        super.onDestroy()
        releaseExo()
        playRunnable?.let { ui.removeCallbacks(it) }
        syncJob?.cancel()
        hbJob?.cancel()
    }
}

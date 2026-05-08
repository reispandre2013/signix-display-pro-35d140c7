package com.signix.tvplayer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/** Foreground service mantém o app vivo em segundo plano (caso o sistema tente matar). */
class PlayerService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(1, buildNotification())
        return START_STICKY
    }

    private fun buildNotification(): Notification {
        val channelId = "signix_player"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (nm.getNotificationChannel(channelId) == null) {
                nm.createNotificationChannel(
                    NotificationChannel(channelId, "Signix Player",
                        NotificationManager.IMPORTANCE_MIN)
                )
            }
        }
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Signix Player")
            .setContentText("Reproduzindo conteúdo")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(true)
            .build()
    }
}

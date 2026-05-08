package com.signix.tvplayer

import android.os.Build
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object Api {
    private val client by lazy {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }
    private val JSON = "application/json".toMediaType()

    data class RegisterResp(
        val deviceToken: String,
        val pairingCode: String,
        val paired: Boolean
    )

    data class SyncItem(
        val id: String,
        val mediaUrl: String,
        val mediaType: String,
        val durationSec: Long,
        val fitMode: String
    )

    data class SyncResp(
        val paired: Boolean,
        val pairingCode: String?,
        val unchanged: Boolean,
        val etag: String?,
        val items: List<SyncItem>,
        val syncSec: Long,
        val heartbeatSec: Long,
        val rawJson: String?
    )

    fun register(
        deviceUuid: String,
        manufacturer: String = Build.MANUFACTURER,
        model: String = Build.MODEL,
        androidVersion: String = Build.VERSION.RELEASE
    ): RegisterResp {
        val body = JSONObject()
            .put("device_uuid", deviceUuid)
            .put("manufacturer", manufacturer)
            .put("model", model)
            .put("android_version", androidVersion)
            .put("app_version", Config.APP_VERSION)
            .toString().toRequestBody(JSON)
        val req = Request.Builder().url(Config.ENDPOINT_REGISTER).post(body).build()
        client.newCall(req).execute().use { res ->
            val txt = res.body?.string().orEmpty()
            if (!res.isSuccessful) throw RuntimeException("register ${res.code}: $txt")
            val o = JSONObject(txt)
            return RegisterResp(
                deviceToken = o.getString("device_token"),
                pairingCode = o.getString("pairing_code"),
                paired = o.optBoolean("paired", false)
            )
        }
    }

    fun sync(token: String, etag: String?): SyncResp {
        val body = JSONObject().apply { etag?.let { put("etag", it) } }
            .toString().toRequestBody(JSON)
        val req = Request.Builder()
            .url(Config.ENDPOINT_SYNC)
            .header("Authorization", "Bearer $token")
            .post(body).build()
        client.newCall(req).execute().use { res ->
            val txt = res.body?.string().orEmpty()
            if (res.code == 401 || res.code == 403)
                throw RuntimeException("auth ${res.code}")
            if (!res.isSuccessful) throw RuntimeException("sync ${res.code}: $txt")
            val o = JSONObject(txt)
            val intervals = o.optJSONObject("intervals")
            val syncSec = intervals?.optLong("sync", Config.DEFAULT_SYNC_SEC) ?: Config.DEFAULT_SYNC_SEC
            val hbSec = intervals?.optLong("heartbeat", Config.DEFAULT_HEARTBEAT_SEC) ?: Config.DEFAULT_HEARTBEAT_SEC

            val paired = o.optBoolean("paired", false)
            if (!paired) {
                return SyncResp(
                    paired = false,
                    pairingCode = o.optString("pairing_code", null),
                    unchanged = false, etag = null, items = emptyList(),
                    syncSec = syncSec, heartbeatSec = hbSec, rawJson = null
                )
            }
            if (o.optBoolean("unchanged", false)) {
                return SyncResp(true, null, true, o.optString("etag", null), emptyList(),
                    syncSec, hbSec, null)
            }
            val arr = o.optJSONArray("items") ?: JSONArray()
            val items = ArrayList<SyncItem>(arr.length())
            for (i in 0 until arr.length()) {
                val it = arr.getJSONObject(i)
                items.add(
                    SyncItem(
                        id = it.optString("id"),
                        mediaUrl = it.optString("media_url"),
                        mediaType = it.optString("media_type", "image"),
                        durationSec = it.optLong("duration_seconds", 8L),
                        fitMode = it.optString("fit_mode", "cover")
                    )
                )
            }
            return SyncResp(
                paired = true,
                pairingCode = null,
                unchanged = false,
                etag = o.optString("etag", null),
                items = items,
                syncSec = syncSec, heartbeatSec = hbSec,
                rawJson = txt
            )
        }
    }

    fun heartbeat(token: String, lastError: String? = null) {
        val body = JSONObject()
            .put("app_version", Config.APP_VERSION)
            .apply { lastError?.let { put("last_error", it) } }
            .toString().toRequestBody(JSON)
        val req = Request.Builder()
            .url(Config.ENDPOINT_HEARTBEAT)
            .header("Authorization", "Bearer $token")
            .post(body).build()
        try { client.newCall(req).execute().close() } catch (_: Exception) {}
    }

    fun parsePayloadItems(json: String): List<SyncItem> {
        val o = JSONObject(json)
        val arr = o.optJSONArray("items") ?: return emptyList()
        val items = ArrayList<SyncItem>(arr.length())
        for (i in 0 until arr.length()) {
            val it = arr.getJSONObject(i)
            items.add(
                SyncItem(
                    id = it.optString("id"),
                    mediaUrl = it.optString("media_url"),
                    mediaType = it.optString("media_type", "image"),
                    durationSec = it.optLong("duration_seconds", 8L),
                    fitMode = it.optString("fit_mode", "cover")
                )
            )
        }
        return items
    }
}

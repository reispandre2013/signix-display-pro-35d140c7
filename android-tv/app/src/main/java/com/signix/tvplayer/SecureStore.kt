package com.signix.tvplayer

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.util.UUID

/** Armazena device_uuid + device_token criptografados. NUNCA é apagado em reinício. */
class SecureStore private constructor(ctx: Context) {

    private val masterKey = MasterKey.Builder(ctx)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        ctx,
        "signix_secure",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun getOrCreateDeviceUuid(): String {
        var v = prefs.getString(K_UUID, null)
        if (v.isNullOrBlank()) {
            v = UUID.randomUUID().toString()
            prefs.edit().putString(K_UUID, v).apply()
        }
        return v
    }

    var deviceToken: String?
        get() = prefs.getString(K_TOKEN, null)
        set(value) { prefs.edit().putString(K_TOKEN, value).apply() }

    var pairingCode: String?
        get() = prefs.getString(K_CODE, null)
        set(value) { prefs.edit().putString(K_CODE, value).apply() }

    var paired: Boolean
        get() = prefs.getBoolean(K_PAIRED, false)
        set(value) { prefs.edit().putBoolean(K_PAIRED, value).apply() }

    var lastEtag: String?
        get() = prefs.getString(K_ETAG, null)
        set(value) { prefs.edit().putString(K_ETAG, value).apply() }

    var lastPayload: String?
        get() = prefs.getString(K_PAYLOAD, null)
        set(value) { prefs.edit().putString(K_PAYLOAD, value).apply() }

    companion object {
        private const val K_UUID = "device_uuid"
        private const val K_TOKEN = "device_token"
        private const val K_CODE = "pairing_code"
        private const val K_PAIRED = "paired"
        private const val K_ETAG = "etag"
        private const val K_PAYLOAD = "payload"

        @Volatile private var INSTANCE: SecureStore? = null
        fun get(ctx: Context): SecureStore =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: SecureStore(ctx.applicationContext).also { INSTANCE = it }
            }
    }
}

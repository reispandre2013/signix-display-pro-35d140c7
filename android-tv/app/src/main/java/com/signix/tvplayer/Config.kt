package com.signix.tvplayer

object Config {
    /** URL pública do painel SigPlayer (sem barra final). */
    const val BASE_URL = "https://sigplayer.com.br"

    const val ENDPOINT_REGISTER = "$BASE_URL/api/public/android/register"
    const val ENDPOINT_SYNC = "$BASE_URL/api/public/android/sync"
    const val ENDPOINT_HEARTBEAT = "$BASE_URL/api/public/android/heartbeat"

    const val APP_VERSION = "1.0.0"

    /** Intervalos padrão (sobrescritos pelo backend via /sync). */
    const val DEFAULT_SYNC_SEC = 90L
    const val DEFAULT_HEARTBEAT_SEC = 60L

    /** Cache de mídia (bytes). */
    const val MEDIA_CACHE_BYTES = 512L * 1024 * 1024 // 512 MB
}

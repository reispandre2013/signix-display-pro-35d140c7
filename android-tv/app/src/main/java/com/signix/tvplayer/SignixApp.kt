package com.signix.tvplayer

import android.app.Application

class SignixApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Pré-aquece store
        SecureStore.get(this).getOrCreateDeviceUuid()
    }
}

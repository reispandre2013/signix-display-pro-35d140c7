package com.signix.tvplayer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.content.ContextCompat

/**
 * Inicia o PlayerActivity automaticamente após boot/reboot da TV,
 * atualização do app, ou eventos equivalentes em diferentes fabricantes.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent?) {
        // Garante o foreground service vivo (mantém app priorizado pelo SO)
        try {
            val svc = Intent(ctx, PlayerService::class.java)
            ContextCompat.startForegroundService(ctx, svc)
        } catch (_: Exception) {}

        // Lança a Activity em primeiro plano (auto-start)
        try {
            val launch = Intent(ctx, PlayerActivity::class.java).apply {
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK
                        or Intent.FLAG_ACTIVITY_CLEAR_TOP
                        or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
                )
            }
            ctx.startActivity(launch)
        } catch (_: Exception) {}
    }
}

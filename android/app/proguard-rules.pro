# ProGuard rules para o Signix Player TV.
# minifyEnabled + shrinkResources estão ativos no build release.

# Capacitor: preserva pontes JS<->Java
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod *;
}

# Plugin nativo do projeto
-keep class com.signix.player.tv.** { *; }

# WebView <-> JS
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Atributos úteis para stack traces legíveis
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

(function (global) {
  "use strict";

  var C = global.SIGNIX_TIZEN_CONSTANTS || {};
  var Storage = global.signixStorage || {};
  var Adapter = global.signixAdapter || {};
  var Remote = global.signixRemote || {};

  function $(id) {
    return document.getElementById(id);
  }

  function readConfig() {
    var cfg = global.SIGNIX_CONFIG || {};
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      throw new Error(
        "Configure window.SIGNIX_CONFIG no index.html (supabaseUrl e supabaseAnonKey).",
      );
    }
    var supabaseUrl = String(cfg.supabaseUrl).trim();
    var supabaseAnonKey = String(cfg.supabaseAnonKey).trim();
    if (supabaseUrl.indexOf("SEU_PROJETO") !== -1 || supabaseAnonKey.indexOf("COLE_AQUI") !== -1) {
      throw new Error(
        "Substitua em index.html os valores reais de supabaseUrl e supabaseAnonKey (Project Settings → API no Supabase). Os placeholders provocam «Failed to fetch» na TV.",
      );
    }
    return {
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey,
      debugMode: !!cfg.debugMode,
    };
  }

  function setNetBadge() {
    var el = $("net-badge");
    if (!el) return;
    var online = typeof navigator !== "undefined" ? navigator.onLine : true;
    el.textContent = online ? "Online" : "Offline";
    el.classList.toggle("is-offline", !online);
  }

  /** screenId obrigatório; resolve com token de dispositivo ou código / só id (legado). */
  function hasPlaybackCredentials(creds) {
    return !!(creds && creds.screenId);
  }

  function showStage(name) {
    var pairing = $("stage-pairing");
    var player = $("stage-player");
    if (pairing) pairing.hidden = name !== "pairing";
    if (player) player.hidden = name !== "player";
  }

  function boot() {
    var config;
    try {
      config = readConfig();
    } catch (e) {
      document.body.innerHTML =
        '<div class="fatal">' + (e instanceof Error ? e.message : "Config em falta.") + "</div>";
      return;
    }

    var logger = global.signixCreateLogger(config.debugMode);
    var api;
    try {
      api = global.signixCreateApi(config);
    } catch (e) {
      logger.error(e);
      document.body.innerHTML =
        '<div class="fatal">API: ' + (e instanceof Error ? e.message : e) + "</div>";
      return;
    }

    var stagePairing = $("stage-pairing");
    var stagePlayer = $("stage-player");
    var pairingCodeDisplay = $("pairing-code-display");
    var pairingExpires = $("pairing-expires");
    var pairingStatusEl = $("pairing-status");
    var pairingError = $("pairing-error");
    var btnNewPairingCode = $("btn-new-pairing-code");
    var videoEl = $("media-video");
    var imgEl = $("media-image");
    var iframeEl = $("media-html");
    var barCounter = $("bar-counter");
    var offlineBanner = $("offline-banner");
    var heartbeatBadgeEl = $("heartbeat-badge");
    var fallbackMessageEl = $("fallback-message");
    var debugPanel = $("debug-panel");
    var debugPre = $("debug-pre");
    var syncBtn = $("btn-sync");
    var btnReset = $("btn-reset");
    var adminMenu = $("admin-menu");
    var adminTvName = $("admin-tv-name");
    var adminDeviceStatus = $("admin-device-status");
    var adminPlaylist = $("admin-playlist");
    var btnAdminClose = $("btn-admin-close");
    var btnAdminRepair = $("btn-admin-repair");
    var btnAdminUnlink = $("btn-admin-unlink");
    var btnRotatePairing = $("btn-rotate-pairing");

    var debugVisible = false;
    var pollTimer = null;
    var autoRenewTimer = null;
    var enterHoldTimer = null;
    var currentPairingCode = null;

    function clearPoll() {
      if (pollTimer != null) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    function clearAutoRenew() {
      if (autoRenewTimer != null) {
        clearTimeout(autoRenewTimer);
        autoRenewTimer = null;
      }
    }

    function runPairingError(msg) {
      if (!pairingError) return;
      pairingError.textContent = msg || "";
      pairingError.hidden = !msg;
    }

    function renderCodeVisual(rawCode) {
      if (!pairingCodeDisplay || !rawCode) return;
      pairingCodeDisplay.innerHTML = "";
      var s = String(rawCode);
      for (var i = 0; i < s.length; i += 1) {
        var ch = s.charAt(i);
        var span = document.createElement("span");
        if (ch === "-") {
          span.className = "pairing-sep";
          span.textContent = "·";
        } else {
          span.className = "pairing-char";
          span.textContent = ch;
        }
        pairingCodeDisplay.appendChild(span);
      }
    }

    function updatePairingStatus(res) {
      if (!pairingStatusEl) return;
      if (!res) {
        pairingStatusEl.textContent = "";
        return;
      }
      if (res.status === "paired") {
        pairingStatusEl.textContent = "Pareamento concluído. A iniciar…";
        return;
      }
      if (res.status === "expired") {
        pairingStatusEl.textContent = "Código expirado. Gerando novo código...";
        return;
      }
      pairingStatusEl.textContent = "Aguardando pareamento...";
    }

    function updateDebug() {
      if (!debugPre || !debugVisible) return;
      var ring = logger.getRing().slice(-80);
      var creds = Storage.getCredentials();
      debugPre.textContent = JSON.stringify(
        {
          creds: creds
            ? {
                screenId: creds.screenId,
                pairingCode: creds.pairingCode ? "***" : null,
                screenName: creds.screenName,
                pairedAt: creds.pairedAt,
              }
            : null,
          logRing: ring,
        },
        null,
        2,
      );
    }

    function setHeartbeatStatus(ok, message) {
      if (!heartbeatBadgeEl) return;
      var text = message || (ok ? "Heartbeat: OK" : "Heartbeat: falhou");
      heartbeatBadgeEl.textContent = text;
      heartbeatBadgeEl.classList.toggle("is-warning", !ok);
    }

    function getDeviceStatusLabel() {
      var creds = Storage.getCredentials();
      if (!creds) return "Aguardando pareamento";
      var st = player.getRuntimeStatus();
      if (typeof navigator !== "undefined" && navigator.onLine === false) return "Offline";
      if (st.lastSyncOk === false || st.lastError) return "Conectado com alerta";
      return "Conectado";
    }

    function refreshAdminMenu() {
      var creds = Storage.getCredentials();
      var st = player.getRuntimeStatus();
      if (adminTvName)
        adminTvName.textContent =
          (creds && creds.screenName) || (creds && creds.screenId) || "Não pareada";
      if (adminDeviceStatus) adminDeviceStatus.textContent = getDeviceStatusLabel();
      if (adminPlaylist) adminPlaylist.textContent = st.playlistId || "Nenhuma playlist carregada";
    }

    function openAdminMenu() {
      if (!adminMenu) return;
      refreshAdminMenu();
      adminMenu.hidden = false;
    }

    function closeAdminMenu() {
      if (adminMenu) adminMenu.hidden = true;
    }

    function updateFallbackOverlay(stage, status) {
      if (!fallbackMessageEl) return;
      var total = status && typeof status.total === "number" ? status.total : 0;
      var hasContent = total > 0;
      var shouldShow = (stage === "fallback" || stage === "empty") && !hasContent;
      fallbackMessageEl.hidden = !shouldShow;

      if (!shouldShow) return;
      var fm = $("fallback-text");
      if (fm) {
        fm.textContent =
          status && status.lastError
            ? status.lastError
            : "Sem itens para reproduzir. Aguarde sincronização ou verifique a campanha.";
      }
    }

    var player = global.signixCreatePlayerController({
      api: api,
      logger: logger,
      media: { video: videoEl, img: imgEl, iframe: iframeEl },
      onStage: function (stage, status) {
        logger.info("[stage]", stage, status);
        var online = typeof navigator !== "undefined" ? navigator.onLine : true;
        var hasItems = status && typeof status.total === "number" && status.total > 0;
        var isPlayback = stage === "playing" && hasItems;
        var d = status && status.display ? status.display : null;

        var topBar = stagePlayer ? stagePlayer.querySelector(".top-bar") : null;
        if (topBar) {
          var hideControls = isPlayback && d && d.hide_controls !== false;
          topBar.hidden = !!hideControls;
        }

        if (offlineBanner) {
          var showOffline = false;
          if (!online) {
            showOffline = true;
          } else if (status && status.fromOfflineCache) {
            var hideOverlayWhenPlaying = isPlayback && d && d.hide_overlay !== false;
            showOffline = !hideOverlayWhenPlaying;
          }
          offlineBanner.hidden = !showOffline;
        }
        if (barCounter && status) {
          barCounter.textContent = status.total > 0 ? status.index + 1 + " / " + status.total : "—";
        }
        if (stage === "pairing") {
          showStage("pairing");
        } else {
          showStage("player");
        }
        updateFallbackOverlay(stage, status);
        if (adminMenu && !adminMenu.hidden) refreshAdminMenu();
        updateDebug();
      },
      onIndexChange: function (idx, total) {
        if (barCounter) barCounter.textContent = total > 0 ? idx + 1 + " / " + total : "—";
        updateDebug();
      },
    });

    function flushLogQueue() {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      var creds = Storage.getCredentials();
      if (!creds) return;
      var batch = Storage.dequeueLogBatch(12);
      if (!batch.length) return;
      var chain = Promise.resolve();
      batch.forEach(function (entry) {
        chain = chain.then(function () {
          return api
            .sendPlaybackLog({
              screenId: entry.screenId,
              campaignId: entry.campaignId,
              playlistId: entry.playlistId,
              mediaAssetId: entry.mediaAssetId,
              durationPlayed: entry.durationPlayed,
              playbackStatus: entry.playbackStatus,
              localEventId: entry.localEventId,
            })
            .catch(function (e) {
              Storage.enqueuePlaybackLog(entry);
              logger.warn("[logs] re-queue", e);
            });
        });
      });
      return chain;
    }

    function sendHeartbeat() {
      var creds = Storage.getCredentials();
      if (!creds) return;
      var st = player.getRuntimeStatus();
      var online = typeof navigator !== "undefined" ? navigator.onLine : true;
      api
        .sendHeartbeat({
          screenId: creds.screenId,
          isOk: st.lastSyncOk !== false && !st.lastError,
          errorMessage: st.lastError || null,
          networkStatus: online ? "online" : "offline",
        })
        .then(function () {
          setHeartbeatStatus(true, "Heartbeat: OK");
        })
        .catch(function (e) {
          var errMsg = e instanceof Error ? e.message : String(e || "");
          setHeartbeatStatus(false, "Heartbeat: falhou");
          logger.warn("[heartbeat]", e);
          if (debugVisible && debugPre) updateDebug();
          if (errMsg) logger.warn("[heartbeat] detalhe:", errMsg);
        });
    }

    function afterPairSuccess(creds) {
      clearAutoRenew();
      Storage.setCredentials(creds);
      runPairingError("");
      closeAdminMenu();
      showStage("player");
      player.syncPlaylist().catch(function (e) {
        logger.error(e);
      });
    }

    function pollOnce() {
      if (!currentPairingCode) return;
      api
        .checkAnonymousPairingStatus(currentPairingCode)
        .then(function (res) {
          updatePairingStatus(res);
          if (res.status === "expired") {
            clearPoll();
            runPairingError("Este código expirou. Gerando novo automaticamente...");
            clearAutoRenew();
            autoRenewTimer = setTimeout(startPairingFlow, 1000);
            return;
          }
          if (res.paired && res.screen_id) {
            clearPoll();
            var normalized = Adapter.normalizePairingCode(currentPairingCode);
            var fpPair =
              "fp-tizen-" +
              (typeof navigator !== "undefined" && navigator.userAgent
                ? navigator.userAgent.length
                : 8);
            api
              .pairScreen(normalized, fpPair)
              .then(function (body) {
                var c = Adapter.credentialsFromPairScreen(body);
                afterPairSuccess({
                  screenId: c.screenId,
                  pairingCode: normalized,
                  screenName: c.screenName || "",
                  playerDeviceId: c.playerDeviceId,
                  authToken: c.authToken,
                  organizationId: c.organizationId || "",
                  pairedAt: new Date().toISOString(),
                });
              })
              .catch(function (e) {
                runPairingError(
                  e instanceof Error ? e.message : "Falha ao finalizar pareamento na TV.",
                );
              });
          }
        })
        .catch(function (e) {
          logger.warn("[pairing poll]", e);
        });
    }

    function requestNewPairingCode() {
      clearPoll();
      clearAutoRenew();
      currentPairingCode = null;
      showStage("pairing");
      runPairingError("");
      updatePairingStatus(null);
      if (pairingCodeDisplay) pairingCodeDisplay.innerHTML = "";
      if (pairingExpires) pairingExpires.textContent = "";
      if (pairingStatusEl) pairingStatusEl.textContent = "Aguardando pareamento...";

      api
        .createAnonymousPairingCode("tizen")
        .then(function (res) {
          var raw = res && res.code ? String(res.code) : "";
          if (!raw) throw new Error("Resposta inválida do servidor.");
          currentPairingCode = Adapter.normalizePairingCode(raw);
          renderCodeVisual(raw.trim().toUpperCase());
          if (pairingExpires && res.expires_at) {
            try {
              var d = new Date(res.expires_at);
              pairingExpires.textContent =
                "Válido até " + d.toLocaleString() + " (renove se expirar).";
            } catch (e) {
              pairingExpires.textContent = "";
            }
          }
          updatePairingStatus({ status: "pending" });
          pollOnce();
          pollTimer = setInterval(pollOnce, C.PAIRING_POLL_MS || 4000);
        })
        .catch(function (e) {
          logger.error("[pairing create]", e);
          runPairingError(e instanceof Error ? e.message : "Falha ao gerar código.");
          if (pairingStatusEl) pairingStatusEl.textContent = "";
        });
    }

    function startPairingFlow() {
      requestNewPairingCode();
    }

    function resetPairing(options) {
      var opts = options || {};
      clearPoll();
      clearAutoRenew();
      closeAdminMenu();
      player.reset();
      Storage.clearCredentials();
      if (opts.clearCache !== false) Storage.clearCachedPayload();
      requestNewPairingCode();
    }

    function autoConnect() {
      var creds = Storage.getCredentials();
      if (hasPlaybackCredentials(creds)) {
        showStage("player");
        player.syncPlaylist().catch(function (e) {
          logger.error(e);
          startPairingFlow();
        });
      } else {
        startPairingFlow();
      }
    }

    function onReset() {
      if (!global.confirm("Repor pareamento neste dispositivo?")) return;
      resetPairing();
    }

    if (btnNewPairingCode) {
      btnNewPairingCode.addEventListener("click", function () {
        requestNewPairingCode();
      });
    }
    if (btnReset) btnReset.addEventListener("click", onReset);

    function runDeviceRotatePairing() {
      var creds = Storage.getCredentials();
      if (!creds || !creds.playerDeviceId || !creds.authToken) {
        runPairingError("Sem token de dispositivo. Use Repor para novo pareamento completo.");
        return;
      }
      api
        .resetDevicePairing(creds.playerDeviceId, creds.authToken)
        .then(function (r) {
          runPairingError("");
          creds.authToken = null;
          creds.pairingCode = r.pairing_code;
          creds.playerDeviceId = r.device_id;
          Storage.setCredentials(creds);
          player.reset();
          Storage.clearCachedPayload();
          showStage("pairing");
          renderCodeVisual(r.pairing_code);
          if (pairingStatusEl) {
            pairingStatusEl.textContent =
              "Novo código. Confirme no painel e prima Enter para voltar a reproduzir.";
          }
        })
        .catch(function (e) {
          logger.error("[rotate-pairing]", e);
          runPairingError(e instanceof Error ? e.message : "Falha ao gerar novo código.");
        });
    }

    if (btnAdminClose) btnAdminClose.addEventListener("click", closeAdminMenu);
    if (btnAdminRepair) {
      btnAdminRepair.addEventListener("click", function () {
        var creds = Storage.getCredentials();
        if (creds && creds.playerDeviceId && creds.authToken) {
          closeAdminMenu();
          runDeviceRotatePairing();
        } else {
          resetPairing({ clearCache: false });
        }
      });
    }
    if (btnAdminUnlink) {
      btnAdminUnlink.addEventListener("click", function () {
        resetPairing();
      });
    }
    if (btnRotatePairing) {
      btnRotatePairing.addEventListener("click", function () {
        runDeviceRotatePairing();
      });
    }
    if (syncBtn) {
      syncBtn.addEventListener("click", function () {
        player.syncPlaylist().catch(function (e) {
          logger.error(e);
        });
      });
    }

    global.setInterval(sendHeartbeat, C.HEARTBEAT_MS || 60000);
    global.setInterval(function () {
      var creds = Storage.getCredentials();
      if (creds) {
        player.syncPlaylist().catch(function (e) {
          logger.warn("[sync]", e);
        });
      }
    }, C.SYNC_MS || 90000);
    global.setInterval(function () {
      flushLogQueue().catch(function () {});
    }, C.LOG_FLUSH_MS || 15000);

    global.addEventListener("online", function () {
      setNetBadge();
      flushLogQueue().catch(function () {});
      if (Storage.getCredentials()) player.syncPlaylist().catch(function () {});
    });
    global.addEventListener("offline", setNetBadge);
    setNetBadge();

    Remote.installRemoteControl({
      onLeft: function () {
        if (!stagePlayer || stagePlayer.hidden) return;
        player.prevItem();
      },
      onRight: function () {
        if (!stagePlayer || stagePlayer.hidden) return;
        player.nextItem();
      },
      onEnter: function () {
        if (stagePairing && !stagePairing.hidden) {
          var st = Storage.getCredentials();
          if (st && st.screenId && st.pairingCode && !st.authToken) {
            var fpE = "fp-tizen-enter";
            api
              .pairScreen(Adapter.normalizePairingCode(st.pairingCode), fpE)
              .then(function (body) {
                var c = Adapter.credentialsFromPairScreen(body);
                afterPairSuccess({
                  screenId: c.screenId,
                  pairingCode: Adapter.normalizePairingCode(st.pairingCode),
                  screenName: c.screenName || "",
                  playerDeviceId: c.playerDeviceId,
                  authToken: c.authToken,
                  organizationId: c.organizationId || "",
                  pairedAt: new Date().toISOString(),
                });
              })
              .catch(function (e) {
                runPairingError(e instanceof Error ? e.message : "Código inválido ou expirado.");
              });
            return;
          }
          pollOnce();
          return;
        }
        if (!Storage.getCredentials()) return;
        player.syncPlaylist().catch(function () {});
      },
      onEnterDown: function () {
        if (enterHoldTimer != null) return;
        enterHoldTimer = setTimeout(function () {
          enterHoldTimer = null;
          openAdminMenu();
        }, 5000);
      },
      onEnterUp: function () {
        if (enterHoldTimer != null) {
          clearTimeout(enterHoldTimer);
          enterHoldTimer = null;
        }
      },
      onUp: function () {
        debugVisible = true;
        if (debugPanel) debugPanel.hidden = false;
        logger.setDebug(true);
        updateDebug();
      },
      onDown: function () {
        debugVisible = false;
        if (debugPanel) debugPanel.hidden = true;
      },
      onBack: function () {
        if (adminMenu && !adminMenu.hidden) {
          closeAdminMenu();
          return;
        }
        if (debugVisible) {
          debugVisible = false;
          if (debugPanel) debugPanel.hidden = true;
          return;
        }
        Remote.tryExitApplication();
      },
    });

    global.signixTizenAdmin = {
      autoConnect: autoConnect,
      openAdminMenu: openAdminMenu,
      resetPairing: resetPairing,
      requestNewPairingCode: requestNewPairingCode,
    };

    autoConnect();

    flushLogQueue().catch(function () {});
    sendHeartbeat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);

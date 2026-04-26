(function (global) {
  "use strict";

  var C = global.SIGNIX_TIZEN_CONSTANTS || {};
  var DEVICE_ID_KEY = C.STORAGE_DEVICE_ID || "device_id";
  var AUTH_TOKEN_KEY = C.STORAGE_AUTH_TOKEN || "auth_token";

  function parseJson(raw, fallback) {
    if (raw == null || raw === "") return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function getCredentials() {
    var raw = localStorage.getItem(C.STORAGE_CREDENTIALS || "signix_tizen_credentials");
    var creds = parseJson(raw, null);
    if (creds && creds.screenId) return creds;

    var deviceId = localStorage.getItem(DEVICE_ID_KEY);
    var authToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!deviceId || !authToken) return null;
    return {
      screenId: deviceId,
      deviceId: deviceId,
      authToken: authToken,
      screenName: localStorage.getItem("screen_name") || "",
      platform: "tizen",
      pairedAt: localStorage.getItem("paired_at") || null,
    };
  }

  function setCredentials(creds) {
    localStorage.setItem(
      C.STORAGE_CREDENTIALS || "signix_tizen_credentials",
      JSON.stringify(creds),
    );
    if (creds && creds.screenId) localStorage.setItem(DEVICE_ID_KEY, String(creds.screenId));
    if (creds && creds.authToken) localStorage.setItem(AUTH_TOKEN_KEY, String(creds.authToken));
    if (creds && creds.screenName) localStorage.setItem("screen_name", String(creds.screenName));
    if (creds && creds.pairedAt) localStorage.setItem("paired_at", String(creds.pairedAt));
  }

  function clearCredentials() {
    localStorage.removeItem(C.STORAGE_CREDENTIALS || "signix_tizen_credentials");
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("screen_name");
    localStorage.removeItem("paired_at");
  }

  function getCachedPayload() {
    var raw = localStorage.getItem(C.STORAGE_PAYLOAD_CACHE || "signix_tizen_payload_cache");
    return parseJson(raw, null);
  }

  function setCachedPayload(payload) {
    localStorage.setItem(
      C.STORAGE_PAYLOAD_CACHE || "signix_tizen_payload_cache",
      JSON.stringify(payload),
    );
  }

  function clearCachedPayload() {
    localStorage.removeItem(C.STORAGE_PAYLOAD_CACHE || "signix_tizen_payload_cache");
  }

  function loadLogQueue() {
    var raw = localStorage.getItem(C.STORAGE_LOG_QUEUE || "signix_tizen_log_queue");
    var q = parseJson(raw, []);
    return Array.isArray(q) ? q : [];
  }

  function saveLogQueue(q) {
    var max = C.LOG_QUEUE_MAX || 200;
    while (q.length > max) q.shift();
    localStorage.setItem(C.STORAGE_LOG_QUEUE || "signix_tizen_log_queue", JSON.stringify(q));
  }

  function enqueuePlaybackLog(entry) {
    var q = loadLogQueue();
    q.push(entry);
    saveLogQueue(q);
  }

  function dequeueLogBatch(max) {
    var q = loadLogQueue();
    var n = Math.min(max || 10, q.length);
    var batch = q.splice(0, n);
    saveLogQueue(q);
    return batch;
  }

  global.signixStorage = {
    getCredentials: getCredentials,
    setCredentials: setCredentials,
    clearCredentials: clearCredentials,
    getCachedPayload: getCachedPayload,
    setCachedPayload: setCachedPayload,
    clearCachedPayload: clearCachedPayload,
    enqueuePlaybackLog: enqueuePlaybackLog,
    dequeueLogBatch: dequeueLogBatch,
    loadLogQueue: loadLogQueue,
  };
})(typeof window !== "undefined" ? window : globalThis);

const CACHE_NAME = "signix-web-player-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (!/^https?:/i.test(req.url)) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      try {
        const fresh = await fetch(req);
        if (fresh.ok && req.url.includes("/storage/v1/object/")) {
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        if (cached) return cached;
        throw new Error("offline");
      }
    }),
  );
});

const CACHE_NAME = "edge-v1";
const STATIC_ASSETS = ["/", "/home", "/train", "/edge", "/mind", "/progress"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// --- Protein Pace push notifications ---
// The server sends a JSON payload: { title, body, url }. We show it as a
// notification; tapping it deep-links straight to the meal-log screen so the
// client can act on the nudge without hunting through the app.
self.addEventListener("push", (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch {
    data = { title: "Back2Strong", body: e.data ? e.data.text() : "" };
  }

  const title = data.title || "Back2Strong";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    // Where to go when tapped — defaults to the Fuel meal-log screen.
    data: { url: data.url || "/nutrition" },
    // Collapse repeats so a client never sees a stack of protein nudges.
    tag: data.tag || "protein-pace",
    renotify: false,
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "/nutrition";

  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it and route to the meal-log screen.
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(target);
          return;
        }
      }
      // Otherwise open a fresh window straight to the meal-log screen.
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});

/*
  Service worker: shows my Endless Dash game when a page can't load.

  A service worker is a small script the browser keeps running in the background for my site.
  This one does a single job. When someone opens a page of my portfolio and
  - they have no internet, or
  - the page hasn't answered after 6 seconds (a very slow connection),
  it shows the game (/dash.html, which my site also shows at /dash-game, saved in the browser the first time they visit) instead of
  the browser's own error page, like the dinosaur in Chrome. The game has a "Try again" button.

  It never changes a page that loads normally, and it leaves /admin and /api alone, so signing in
  and saving are never interrupted. Only normal page visits are looked at: images, scripts and
  data requests are not touched.

  When I change /dash.html, I change VERSION below so visitors get the new copy.
*/
const VERSION = "endless-dash-v1";
const GAME = "/dash.html";
const SLOW_AFTER_MS = 6000;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.add(GAME)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const game = () => caches.match(GAME);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only a person opening a page of my own site
  if (req.mode !== "navigate" || req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // The game's own addresses: the live page, or the saved copy when there is no internet
  if (url.pathname === GAME || url.pathname === "/dash-game") {
    event.respondWith(fetch(req).catch(async () => (await game()) || Response.error()));
    return;
  }
  // The admin area and the API are never replaced by the game
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    (async () => {
      let timer;
      const tooSlow = new Promise((resolve) => {
        timer = setTimeout(() => resolve(null), SLOW_AFTER_MS);
      });
      try {
        const res = await Promise.race([fetch(req), tooSlow]);
        clearTimeout(timer);
        if (res) return res;
        return (await game()) || fetch(req);
      } catch {
        clearTimeout(timer);
        // No internet (the request failed straight away)
        return (await game()) || Response.error();
      }
    })(),
  );
});

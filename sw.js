const CACHE_NAME = "lexiverse-cache-v7";
const ASSETS_TO_CACHE = [
  "./",
  "index.html",
  "story.html",
  "select.html",
  "allwords.html",
  "practice.html",
  "grammar.html",
  "manifest.json",
  "sw.js",
  "css/style.css",
  "js/app.js",
  "js/allwords.js",
  "js/select.js",
  "js/modal.js",
  "js/storyLoader.js",
  "js/passages.js",
  "js/practice.js",
  "js/grammar.js",
  "js/grammar_questions.json",
  "js/word_list.json",
  "js/A.json",
  "js/B.json",
  "js/C.json",
  "js/D.json",
  "js/E.json",
  "js/F.json",
  "js/G.json",
  "js/H.json",
  "js/I.json",
  "js/J.json",
  "js/K.json",
  "js/L.json",
  "js/M.json",
  "js/N.json",
  "js/O.json",
  "js/P.json",
  "js/Q.json",
  "js/R.json",
  "js/S.json",
  "js/T.json",
  "js/U.json",
  "js/V.json",
  "js/W.json",
  "js/X.json",
  "js/Y.json",
  "js/Z.json",
  "assets/images/background.jpg",
  "assets/images/logo.png"
];

// Install Event - Pre-cache Static Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Pre-caching App Shell");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve from Cache, dynamic network caching
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // We want to handle JSON files with a network-first strategy so updates are picked up.
  if (requestUrl.pathname.endsWith(".json")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Put fresh copy in cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first strategy for static resources (images, JS, CSS, HTML)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Cache dynamically fetched resources (e.g. external voices or dynamic images)
          if (response.status === 200 && event.request.method === "GET") {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

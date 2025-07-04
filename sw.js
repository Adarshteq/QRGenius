const CACHE_NAME = "qr-generator-v1";
const ASSETS = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
    "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
const CACHE_NAME = "bar-pwa-v3";
const urlsToCache = [
"./",
"./index.html",
"./orders.html",
"./manifest.json",
"./icon-512.png",
"./icon-192.png",
"./icon-180.png", 
"./icon-32.png",   
"./sex.png",

// Изображения блюд
"./reserve/IMG_1006.JPG",
"./reserve/IMG_1010.JPG", 
"./reserve/IMG_1012.JPG",   
"./reserve/barbekiu.png",
"./reserve/bavarska.png",
"./reserve/carbonara.png",
"./reserve/chotyry-miasa.png",
"./reserve/chotyry-syry.png",
"./reserve/diablo.png",
"./reserve/fieria.png",
"./reserve/havayska.png",
"./reserve/marharyta.png",
"./reserve/meksykanska.png",
"./reserve/paperoni.png",
 "./reserve/provans.png",
"./reserve/selianska.png",
"./reserve/syrne-kurcha.png",
 "./reserve/z-hrybamy.png"   
];

// Установка
self.addEventListener("install", event => {

event.waitUntil(
    caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
        .then(() => self.skipWaiting())
);
});

// Активация
self.addEventListener("activate", event => {

event.waitUntil(
    caches.keys()
        .then(names => Promise.all(
            names
                .filter(name =>
                    name.startsWith("bar-pwa-") &&
                    name !== CACHE_NAME
                )
                .map(name => caches.delete(name))
        ))
        .then(() => self.clients.claim())
);
});

// Запросы
self.addEventListener("fetch", event => {

if (event.request.method !== "GET") return;

event.respondWith(
    caches.match(event.request)
        .then(response => {

            if (response) return response;

            return fetch(event.request);

        })
        .catch(() => {

            if (event.request.mode === "navigate") {
                return caches.match("./index.html");
            }

        })
);
});


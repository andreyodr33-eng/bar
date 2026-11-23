const APP_CACHE = "bar-pwa-v5";
const IMAGE_CACHE = "bar-images-v3";

// Основные файлы приложения
const APP_FILES = [
"./",
"./index.html",
"./orders.html",
"./manifest.json",
"./icon-512.png",
"./icon-192.png",
"./icon-180.png",
"./icon-32.png",
"./sex.png"
];

// Резервные фотографии.
// Отсутствие отдельной фотографии не должно мешать установке.
const RESERVE_IMAGES = [
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
Promise.all([
caches.open(APP_CACHE).then(async cache => {
for (const file of APP_FILES) {
try {
await cache.add(file);
} catch (error) {
console.warn("Не удалось сохранить файл:", file);
}
}
}),

        caches.open(IMAGE_CACHE).then(async cache => {
            for (const file of RESERVE_IMAGES) {
                try {
                    await cache.add(file);
                } catch (error) {
                    console.warn("Нет резервного изображения:", file);
                }
            }
        })
    ]).then(() => self.skipWaiting())
);
});

// Активация
self.addEventListener("activate", event => {
event.waitUntil(
caches.keys()
.then(names => Promise.all(
names
.filter(name =>
(name.startsWith("bar-pwa-") &&
name !== APP_CACHE) ||
(name.startsWith("bar-images-") &&
name !== IMAGE_CACHE)
)
.map(name => caches.delete(name))
))
.then(() => self.clients.claim())
);
});
// Получение адресов фотографий из menuData
self.addEventListener("message", event => {

if (event.data?.type !== "CACHE_MENU_IMAGES") return;

const urls = event.data.urls;

if (!Array.isArray(urls)) return;

event.waitUntil((async () => {

    const cache = await caches.open(IMAGE_CACHE);

    await Promise.all(urls.map(async url => {

        try {
            const request = new Request(url, {
                mode: "no-cors"
            });

            // Если фотография уже сохранена — повторно не загружаем
            const saved = await cache.match(request, {
                ignoreVary: true
            });

            if (saved) return;

            const response = await fetch(request);

            if (response.ok || response.type === "opaque") {
                await cache.put(request, response.clone());
            }

        } catch (error) {
            console.warn("Не удалось сохранить фотографию:", url, error);
        }

    }));

})());
});
// Запросы
self.addEventListener("fetch", event => {

if (event.request.method !== "GET") return;

// Фотографии: сначала кэш, затем интернет
if (event.request.destination === "image") {

event.respondWith(
    (async () => {

        const cache = await caches.open(IMAGE_CACHE);

        // Сначала ищем сохранённую фотографию
        const savedImage = await cache.match(event.request);

        if (savedImage) {
            return savedImage;
        }

        // Если фотографии нет в кэше — обращаемся к интернету
        try {
            const response = await fetch(event.request);

            if (response.ok || response.type === "opaque") {
                await cache.put(
                    event.request,
                    response.clone()
                );
            }

            return response;

        } catch (error) {

            return new Response("", {
                status: 503,
                statusText: "Изображение недоступно офлайн"
            });

        }

    })()
);

return;
}

// Остальные запросы
event.respondWith(
    (async () => {
        const cached = await caches.match(event.request);

        if (cached) return cached;

        try {
            return await fetch(event.request);
        } catch (error) {

            if (event.request.mode === "navigate") {
                const index = await caches.match("./index.html");
                if (index) return index;
            }

            throw error;
        }
    })()
);
});




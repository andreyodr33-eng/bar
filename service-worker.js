const CACHE_NAME = "bar-pwa-v7";

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

// =====================================
// УСТАНОВКА
// =====================================

self.addEventListener("install", event => {

event.waitUntil((async () => {

const cache = await caches.open(CACHE_NAME);

for (const file of APP_FILES) {

  try {
    await cache.add(file);
  } catch (error) {
    console.warn("Не удалось сохранить файл:", file, error);
  }

}

await self.skipWaiting();
})());

});

// =====================================
// АКТИВАЦИЯ
// =====================================

self.addEventListener("activate", event => {

event.waitUntil((async () => {

const names = await caches.keys();

await Promise.all(
  names
    .filter(name =>
      name.startsWith("bar-pwa-") &&
      name !== CACHE_NAME
    )
    .map(name => caches.delete(name))
);

await self.clients.claim();
})());

});

// =====================================
// ЗАПРОСЫ
// =====================================

self.addEventListener("fetch", event => {

const request = event.request;

if (request.method !== "GET") return;

event.respondWith((async () => {

const cache = await caches.open(CACHE_NAME);

// Проверяем наличие файла в кэше
const saved = await cache.match(request);

if (saved) {
  return saved;
}

// Если файл отсутствует в кэше,
// загружаем его из интернета
try {

  const response = await fetch(request);

  // Сохраняем успешный ответ
  if (response.ok || response.type === "opaque") {

    try {
      await cache.put(request, response.clone());
    } catch (error) {
      console.warn("Не удалось сохранить:", request.url, error);
    }

  }

  return response;

} catch (error) {

  // Если нет интернета,
  // возвращаем сохранённую главную страницу
  if (request.mode === "navigate") {

    const index = await cache.match("./index.html");

    if (index) return index;

  }

  // Остальные недоступные файлы
  return new Response("", {
    status: 503,
    statusText: "Файл недоступен офлайн"
  });

}
})());

});







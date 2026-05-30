const CACHE_NAME = "app-manutencao-etapa7-leitor-qr-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/base.css",
  "./css/layout.css",
  "./css/componentes.css",
  "./css/inicio.css",
  "./css/chamados.css",
  "./css/modal.css",
  "./css/painel.css",
  "./css/perfil.css",
  "./css/comunicados.css",
  "./css/notificacoes.css",
  "./css/areas.css",
  "./css/responsive.css",
  "./js/state.js",
  "./js/firebase-service.js",
  "./js/utils.js",
  "./js/navigation.js",
  "./js/notificacoes.js",
  "./js/chamados.js",
  "./js/modal-chamado.js",
  "./js/painel.js",
  "./js/perfil.js",
  "./js/comunicados.js",
  "./js/ativos.js",
  "./js/leitor-qr.js",
  "./js/preventivas.js",
  "./js/app.js",
  "./img/senac-predio.png",
  "./img/icon-192.png",
  "./img/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

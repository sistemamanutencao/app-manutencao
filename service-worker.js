const CACHE_NAME = "app-manutencao-etapa18-identidade-colaborador-v2";

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
  "./src/constants/andares.js",
  "./src/constants/locais.js",
  "./src/constants/categorias.js",
  "./src/constants/subcategorias.js",
  "./src/constants/status.js",
  "./src/constants/prioridades.js",
  "./src/constants/tiposOS.js",
  "./src/constants/perfis.js",
  "./src/constants/permissoes.js",
  "./src/constants/firebase.js",
  "./src/constants/exportacoes.js",
  "./src/constants/index.js",
  "./js/state.js",
  "./js/auth-permissions.js",
  "./js/firebase-service.js",
  "./js/utils.js",
  "./js/navigation.js",
  "./js/notificacoes.js",
  "./js/categorias.js",
  "./js/logs-tecnicos.js",
  "./js/chamados-form.js",
  "./js/chamados-render.js",
  "./js/chamados.js",
  "./js/exportacoes.js",
  "./js/modal-chamado.js",
  "./js/painel-indicadores.js",
  "./js/painel-cards.js",
  "./js/painel-status.js",
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
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames
        .filter(cacheName => cacheName !== CACHE_NAME && cacheName.startsWith("app-manutencao"))
        .map(cacheName => caches.delete(cacheName))
    ))
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const deveBuscarNaRedePrimeiro = url.pathname.endsWith(".html")
    || url.pathname.endsWith(".js")
    || url.pathname.endsWith(".css")
    || url.pathname.endsWith("/")
    || url.pathname.endsWith("service-worker.js");

  if (deveBuscarNaRedePrimeiro) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copia = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

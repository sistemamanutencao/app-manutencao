/* Firebase Cloud Messaging no mesmo Service Worker do PWA.
 * A v29 usa os pacotes compat para preservar a arquitetura atual sem bundler.
 */
try {
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

  firebase.initializeApp({
    apiKey: "AIzaSyC48Vz7xsw8Ikzp3yz3QqVFWWPrvp1D3z4",
    authDomain: "app-manutencao-2169f.firebaseapp.com",
    databaseURL: "https://app-manutencao-2169f-default-rtdb.firebaseio.com",
    projectId: "app-manutencao-2169f",
    storageBucket: "app-manutencao-2169f.firebasestorage.app",
    messagingSenderId: "729718839494",
    appId: "1:729718839494:web:d92add8d24aa1e3fc65fc7"
  });

  const messagingPush = firebase.messaging();

  messagingPush.onBackgroundMessage(payload => {
    const data = payload && payload.data ? payload.data : {};
    const titulo = data.title || "Novo chamado de manutenção";
    const corpo = data.body || "Há uma nova OS aguardando atendimento.";

    return self.registration.showNotification(titulo, {
      body: corpo,
      icon: "./img/icon-192.png",
      badge: "./img/notification-badge.png",
      tag: data.tag || (data.chamadoId ? `novo-chamado-${data.chamadoId}` : "novo-chamado"),
      renotify: true,
      requireInteraction: String(data.prioridade || "").toLowerCase() === "urgente",
      vibrate: [200, 100, 200],
      data: {
        chamadoId: data.chamadoId || "",
        url: data.url || ""
      }
    });
  });
} catch (erroFirebaseMessaging) {
  console.warn("Firebase Messaging indisponível no Service Worker:", erroFirebaseMessaging);
}

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const dados = event.notification.data || {};
  const chamadoId = dados.chamadoId || "";
  const destino = dados.url || (() => {
    const url = new URL("./", self.registration.scope);
    if (chamadoId) {
      url.searchParams.set("chamado", chamadoId);
    }
    return url.href;
  })();

  event.waitUntil((async () => {
    const janelas = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    const janelaApp = janelas.find(cliente => cliente.url.startsWith(self.registration.scope));

    if (janelaApp) {
      await janelaApp.focus();

      if (chamadoId) {
        janelaApp.postMessage({
          type: "OPEN_CHAMADO",
          chamadoId
        });
      }

      return;
    }

    if (self.clients.openWindow) {
      await self.clients.openWindow(destino);
    }
  })());
});

const CACHE_NAME = "app-manutencao-v29-badge-notificacao";

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
  "./css/diagnostico.css",
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
  "./src/constants/push.js",
  "./src/constants/exportacoes.js",
  "./src/constants/index.js",
  "./js/state.js",
  "./js/ui-feedback.js",
  "./js/auth-permissions.js",
  "./js/firebase-service.js",
  "./js/utils.js",
  "./js/navigation.js",
  "./js/notificacoes.js",
  "./js/push-notifications.js",
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
  "./js/preventivas.js",
  "./js/diagnostico.js",
  "./js/cadastro-colaboradores.js",
  "./js/app.js",
  "./js/event-action-maps.js",
  "./js/event-bindings.js",
  "./js/service-worker-register.js",
  "./img/senac-predio.png",
  "./img/engrenagem-painel-login.png",
  "./img/avatar-redefinicao-senha.png",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/apple-touch-icon.png",
  "./img/notification-badge.png",
  "./img/perfil-manutencao.png"
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

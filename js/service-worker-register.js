/*
 * Registro do Service Worker
 *
 * Responsabilidade:
 * - registrar o service-worker.js após o carregamento da página;
 * - manter a inicialização PWA fora do index.html.
 *
 * Observação:
 * - não altera regras de negócio, permissões, Firebase ou fluxo de OS.
 */

(function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js").catch(function (erro) {
      console.warn("Service worker não registrado:", erro);
    });
  });
})();

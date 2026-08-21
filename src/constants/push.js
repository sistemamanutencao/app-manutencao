/* =====================================================
   PUSH - CONFIGURAÇÃO DE ALERTAS NO CELULAR

   A v28 ativa a integração Firebase Cloud Messaging + Cloudflare Worker.
   Configuração pública de produção:
   - workerUrl: URL pública do Worker;
   - vapidPublicKey: chave pública Web Push criada no Firebase Console.

   Nunca coloque chave privada de service account neste arquivo.
===================================================== */

const PUSH_CONFIG = Object.freeze({
  enabled: true,
  workerUrl: "https://app-manutencao-push.sistemamanutencao.workers.dev",
  vapidPublicKey: "BAerdueBrLlfgzloEu8_NZHXKbI_K194bQAzENEWH8IdTD2ZLl5mxqO2Hg48VEKh4v_xOeRy2Ds5s9n35wBQsFU",
  maintenanceOnly: true,
  storageEnabledKey: "appManutencaoPushEnabled",
  storageTokenKey: "appManutencaoPushToken"
});

function pushConfiguradoParaUso() {
  return Boolean(
    PUSH_CONFIG
    && PUSH_CONFIG.enabled === true
    && String(PUSH_CONFIG.workerUrl || "").trim()
    && String(PUSH_CONFIG.vapidPublicKey || "").trim()
  );
}

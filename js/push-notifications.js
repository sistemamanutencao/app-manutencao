/* =====================================================
   PUSH NOTIFICATIONS - FCM + CLOUDFLARE WORKER

   Responsabilidades:
   - solicitar permissão de notificação por ação explícita do usuário;
   - obter/renovar token FCM usando o Service Worker já existente;
   - registrar/desregistrar o dispositivo no Worker;
   - disparar evento seguro de "novo chamado" após a criação da OS;
   - receber mensagens em primeiro plano;
   - abrir a OS quando o usuário toca em uma notificação.

   Segurança:
   - nenhuma chave privada fica no PWA;
   - chamadas ao Worker usam Firebase ID token do usuário autenticado;
   - o Worker valida o perfil da manutenção e busca a OS direto no Firestore.
===================================================== */

let firebaseMessagingApp = null;
let pushInicializado = false;
let chamadoPushPendente = null;

function pushEhSuportado() {
  return Boolean(
    "Notification" in window
    && "serviceWorker" in navigator
    && window.firebase
    && typeof firebase.messaging === "function"
  );
}

function obterElementosPush() {
  return {
    area: document.getElementById("areaAlertasPush"),
    status: document.getElementById("statusAlertasPush"),
    detalhe: document.getElementById("detalheAlertasPush"),
    botaoAtivar: document.getElementById("botaoAtivarAlertasPush"),
    botaoDesativar: document.getElementById("botaoDesativarAlertasPush")
  };
}

function pushAtivoLocalmente() {
  try {
    return localStorage.getItem(PUSH_CONFIG.storageEnabledKey) === "1";
  } catch (_) {
    return false;
  }
}

function salvarEstadoPushLocal(ativo, token = "") {
  try {
    localStorage.setItem(PUSH_CONFIG.storageEnabledKey, ativo ? "1" : "0");

    if (token) {
      localStorage.setItem(PUSH_CONFIG.storageTokenKey, token);
    } else if (!ativo) {
      localStorage.removeItem(PUSH_CONFIG.storageTokenKey);
    }
  } catch (_) {
    // O app continua funcionando mesmo se o armazenamento local estiver indisponível.
  }
}

function obterTokenPushLocal() {
  try {
    return localStorage.getItem(PUSH_CONFIG.storageTokenKey) || "";
  } catch (_) {
    return "";
  }
}

function usuarioPodeReceberPush() {
  if (!usuarioAtual || !usuarioAtual.id) {
    return false;
  }

  if (PUSH_CONFIG.maintenanceOnly === false) {
    return true;
  }

  return typeof usuarioEhManutencaoAutorizada === "function"
    ? usuarioEhManutencaoAutorizada()
    : usuarioAtual.perfil === "manutencao";
}

function atualizarInterfacePush() {
  const elementos = obterElementosPush();

  if (!elementos.area) {
    return;
  }

  const manutencao = usuarioPodeReceberPush();
  elementos.area.hidden = !manutencao;

  if (!manutencao) {
    return;
  }

  let tituloStatus = "Desativado";
  let detalhe = "Ative para receber alertas de novos chamados mesmo com o PWA em segundo plano.";
  let podeAtivar = true;
  let podeDesativar = false;

  if (!pushEhSuportado()) {
    tituloStatus = "Não suportado neste navegador";
    detalhe = "Use um navegador/PWA compatível com notificações push.";
    podeAtivar = false;
  } else if (!pushConfiguradoParaUso()) {
    tituloStatus = "Aguardando configuração";
    detalhe = "A estrutura está pronta. Falta vincular a chave Web Push e a URL do servidor gratuito.";
    podeAtivar = false;
  } else if (Notification.permission === "denied") {
    tituloStatus = "Bloqueado no navegador";
    detalhe = "As notificações foram bloqueadas. Libere a permissão nas configurações do navegador ou do aplicativo.";
    podeAtivar = false;
  } else if (Notification.permission === "granted" && pushAtivoLocalmente()) {
    tituloStatus = "Ativado neste aparelho";
    detalhe = "Novos chamados podem gerar alerta mesmo quando o app estiver em segundo plano.";
    podeAtivar = false;
    podeDesativar = true;
  }

  if (elementos.status) {
    elementos.status.textContent = tituloStatus;
  }

  if (elementos.detalhe) {
    elementos.detalhe.textContent = detalhe;
  }

  if (elementos.botaoAtivar) {
    elementos.botaoAtivar.hidden = !podeAtivar;
    elementos.botaoAtivar.disabled = !podeAtivar;
  }

  if (elementos.botaoDesativar) {
    elementos.botaoDesativar.hidden = !podeDesativar;
  }
}

async function obterRegistroServiceWorkerPush() {
  const registroExistente = await navigator.serviceWorker.getRegistration();

  if (registroExistente) {
    return registroExistente;
  }

  return navigator.serviceWorker.register("./service-worker.js");
}

function obterFirebaseMessaging() {
  if (!firebaseMessagingApp) {
    firebaseMessagingApp = firebase.messaging();

    firebaseMessagingApp.onMessage(payload => {
      tratarMensagemPushPrimeiroPlano(payload).catch(erro => {
        console.warn("Falha ao tratar push em primeiro plano:", erro);
      });
    });
  }

  return firebaseMessagingApp;
}

async function obterFirebaseIdToken() {
  const usuarioFirebase = firebaseAuth && firebaseAuth.currentUser
    ? firebaseAuth.currentUser
    : firebase.auth().currentUser;

  if (!usuarioFirebase) {
    throw new Error("Usuário Firebase não autenticado.");
  }

  return usuarioFirebase.getIdToken();
}

async function chamarWorkerPush(caminho, dados = {}) {
  if (!pushConfiguradoParaUso()) {
    throw new Error("Push ainda não configurado para produção.");
  }

  const idToken = await obterFirebaseIdToken();
  const base = String(PUSH_CONFIG.workerUrl).replace(/\/+$/, "");

  const resposta = await fetch(`${base}${caminho}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });

  let corpo = null;

  try {
    corpo = await resposta.json();
  } catch (_) {
    corpo = null;
  }

  if (!resposta.ok) {
    const detalhe = corpo && (corpo.error || corpo.message)
      ? corpo.error || corpo.message
      : `HTTP ${resposta.status}`;

    throw new Error(detalhe);
  }

  return corpo || {};
}

async function ativarAlertasPush() {
  if (!usuarioPodeReceberPush()) {
    return;
  }

  if (!pushEhSuportado()) {
    await appFeedback("Este navegador não oferece suporte às notificações push usadas pelo aplicativo.", {
      tipo: "aviso",
      titulo: "Alertas indisponíveis"
    });
    atualizarInterfacePush();
    return;
  }

  if (!pushConfiguradoParaUso()) {
    await appFeedback("A estrutura de alertas está pronta, mas a configuração do servidor e da chave Web Push ainda precisa ser concluída.", {
      tipo: "aviso",
      titulo: "Configuração pendente"
    });
    atualizarInterfacePush();
    return;
  }

  try {
    const permissao = await Notification.requestPermission();

    if (permissao !== "granted") {
      atualizarInterfacePush();
      return;
    }

    const registro = await obterRegistroServiceWorkerPush();
    const messaging = obterFirebaseMessaging();
    const token = await messaging.getToken({
      vapidKey: PUSH_CONFIG.vapidPublicKey,
      serviceWorkerRegistration: registro
    });

    if (!token) {
      throw new Error("O Firebase não retornou um token para este aparelho.");
    }

    await chamarWorkerPush("/register", {
      token,
      userAgent: navigator.userAgent || "",
      platform: navigator.platform || ""
    });

    salvarEstadoPushLocal(true, token);
    atualizarInterfacePush();

    await appFeedback("Alertas de novos chamados foram ativados neste aparelho.", {
      tipo: "sucesso",
      titulo: "Alertas ativados"
    });
  } catch (erro) {
    console.error("Erro ao ativar alertas push:", erro);

    await appFeedback(`Não foi possível ativar os alertas.\n${erro.message || "Verifique a configuração e tente novamente."}`, {
      tipo: "erro",
      titulo: "Falha nos alertas"
    });

    atualizarInterfacePush();
  }
}

async function desativarAlertasPush() {
  if (!pushEhSuportado()) {
    salvarEstadoPushLocal(false);
    atualizarInterfacePush();
    return;
  }

  try {
    const messaging = obterFirebaseMessaging();
    const token = obterTokenPushLocal();

    if (token && pushConfiguradoParaUso()) {
      try {
        await chamarWorkerPush("/unregister", { token });
      } catch (erroWorker) {
        console.warn("Não foi possível remover o token no Worker:", erroWorker);
      }
    }

    try {
      await messaging.deleteToken();
    } catch (erroToken) {
      console.warn("Não foi possível excluir o token FCM local:", erroToken);
    }

    salvarEstadoPushLocal(false);
    atualizarInterfacePush();

    await appFeedback("Este aparelho deixou de receber alertas de novos chamados.", {
      tipo: "sucesso",
      titulo: "Alertas desativados"
    });
  } catch (erro) {
    console.error("Erro ao desativar alertas push:", erro);
    salvarEstadoPushLocal(false);
    atualizarInterfacePush();
  }
}

async function sincronizarAlertasPushAutorizados() {
  atualizarInterfacePush();

  if (
    !usuarioPodeReceberPush()
    || !pushEhSuportado()
    || !pushConfiguradoParaUso()
    || Notification.permission !== "granted"
    || !pushAtivoLocalmente()
  ) {
    return;
  }

  try {
    const registro = await obterRegistroServiceWorkerPush();
    const messaging = obterFirebaseMessaging();
    const token = await messaging.getToken({
      vapidKey: PUSH_CONFIG.vapidPublicKey,
      serviceWorkerRegistration: registro
    });

    if (!token) {
      return;
    }

    await chamarWorkerPush("/register", {
      token,
      userAgent: navigator.userAgent || "",
      platform: navigator.platform || ""
    });

    salvarEstadoPushLocal(true, token);
  } catch (erro) {
    console.warn("Não foi possível sincronizar o token push:", erro);
  }
}

async function enviarAlertaPushNovoChamado(chamadoId) {
  if (!chamadoId || !pushConfiguradoParaUso()) {
    return;
  }

  try {
    await chamarWorkerPush("/notify-new-call", {
      chamadoId: String(chamadoId)
    });
  } catch (erro) {
    // A falha do push nunca pode impedir a abertura da OS.
    console.warn("OS criada, mas o alerta push não pôde ser enviado:", erro);
  }
}

async function tratarMensagemPushPrimeiroPlano(payload) {
  const data = payload && payload.data ? payload.data : {};
  const titulo = data.title || "Novo chamado de manutenção";
  const corpo = data.body || "Há uma nova OS aguardando atendimento.";

  if (Notification.permission === "granted") {
    const registro = await obterRegistroServiceWorkerPush();

    await registro.showNotification(titulo, {
      body: corpo,
      icon: "./img/icon-192.png",
      tag: data.tag || (data.chamadoId ? `novo-chamado-${data.chamadoId}` : "novo-chamado"),
      data: {
        chamadoId: data.chamadoId || "",
        url: data.url || ""
      }
    });
  }

  if (typeof appFeedback === "function") {
    await appFeedback(corpo, {
      tipo: data.prioridade === "Urgente" ? "aviso" : "info",
      titulo
    });
  }
}

function configurarAberturaPorPush() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener("message", evento => {
    const dados = evento.data || {};

    if (dados.type === "OPEN_CHAMADO" && dados.chamadoId) {
      abrirChamadoRecebidoPorPush(dados.chamadoId);
    }
  });

  const parametros = new URLSearchParams(window.location.search);
  const chamadoId = parametros.get("chamado");

  if (chamadoId) {
    chamadoPushPendente = chamadoId;
    limparParametroChamadoDaUrl();
  }
}

function limparParametroChamadoDaUrl() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("chamado");
    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
  } catch (_) {
    // Sem impacto no fluxo principal.
  }
}

function abrirChamadoRecebidoPorPush(chamadoId) {
  if (!chamadoId) {
    return;
  }

  const chamado = Array.isArray(chamados)
    ? chamados.find(item => idsIguais(item.id, chamadoId))
    : null;

  if (!chamado) {
    chamadoPushPendente = chamadoId;
    return;
  }

  chamadoPushPendente = null;
  openPage("chamados");

  setTimeout(() => {
    abrirDetalhesChamado(chamadoId);
  }, 100);
}

function tentarAbrirChamadoPushPendente() {
  if (chamadoPushPendente) {
    abrirChamadoRecebidoPorPush(chamadoPushPendente);
  }
}

function inicializarPushNotifications() {
  if (pushInicializado) {
    atualizarInterfacePush();
    return;
  }

  pushInicializado = true;
  configurarAberturaPorPush();

  if (pushEhSuportado() && firebase.apps && firebase.apps.length > 0) {
    try {
      obterFirebaseMessaging();
    } catch (erro) {
      console.warn("Firebase Messaging não pôde ser inicializado:", erro);
    }
  }

  atualizarInterfacePush();
}

window.ativarAlertasPush = ativarAlertasPush;
window.desativarAlertasPush = desativarAlertasPush;
window.atualizarInterfacePush = atualizarInterfacePush;
window.sincronizarAlertasPushAutorizados = sincronizarAlertasPushAutorizados;
window.enviarAlertaPushNovoChamado = enviarAlertaPushNovoChamado;
window.tentarAbrirChamadoPushPendente = tentarAbrirChamadoPushPendente;
window.inicializarPushNotifications = inicializarPushNotifications;

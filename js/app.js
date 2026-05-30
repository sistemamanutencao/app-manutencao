/* =====================================================
   INICIALIZAÇÃO DO APP
===================================================== */

document.addEventListener("DOMContentLoaded", inicializarAplicacao);

function inicializarAplicacao() {
  inicializarFirebaseServico();
  configurarEventosGlobais();
  prepararTelaSemSessao();

  observarAutenticacao(async usuarioFirebase => {
    await processarEstadoAutenticacao(usuarioFirebase);
  });
}

function configurarEventosGlobais() {
  document.querySelectorAll(".logout-button").forEach(botao => {
    botao.addEventListener("click", sairDaConta);
  });

  const modal = document.getElementById("modalChamado");

  if (modal) {
    modal.addEventListener("click", evento => {
      if (evento.target === modal) {
        fecharDetalhesChamado();
      }
    });
  }

  const modalFoto = document.getElementById("modalFotoChamado");

  if (modalFoto) {
    modalFoto.addEventListener("click", evento => {
      if (evento.target === modalFoto) {
        fecharVisualizacaoFoto();
      }
    });
  }

  const modalNotificacoes = document.getElementById("modalNotificacoes");

  if (modalNotificacoes) {
    modalNotificacoes.addEventListener("click", evento => {
      if (evento.target === modalNotificacoes) {
        fecharPainelNotificacoes();
      }
    });
  }
}

function prepararTelaSemSessao() {
  usuarioAtual = { ...USUARIO_PADRAO };
  chamados = [];
  comunicados = [];
  notificacoes = [];

  preencherFormularioPerfil();
  aplicarPermissoesNaTela();
  renderizarChamados();

  if (typeof renderizarNotificacoes === "function") {
    renderizarNotificacoes();
  }

  if (typeof renderizarComunicados === "function") {
    renderizarComunicados();
  }

  openPage("perfil");
}

async function processarEstadoAutenticacao(usuarioFirebase) {
  encerrarMonitoresDeDados();

  if (!usuarioFirebase) {
    prepararTelaSemSessao();
    return;
  }

  if (usuarioFirebase.isAnonymous) {
    if (!configurarColaboradorAnonimo(usuarioFirebase)) {
      prepararTelaSemSessao();
      return;
    }

    aplicarPermissoesNaTela();
    iniciarMonitoresDeDados();
    openPage("inicio");
    return;
  }

  try {
    const perfil = await buscarPerfilFirebase(usuarioFirebase.uid);

    if (!perfil) {
      alert("Login realizado, mas este usuário ainda não possui cadastro na coleção usuarios do Firestore.");
      await encerrarSessaoFirebase();
      return;
    }

    if (perfil.ativo !== true) {
      alert("Este usuário está inativo. Procure o administrador do sistema.");
      await encerrarSessaoFirebase();
      return;
    }

    usuarioAtual = normalizarUsuarioLogado(usuarioFirebase, perfil);

    preencherFormularioPerfil();
    aplicarPermissoesNaTela();
    iniciarMonitoresDeDados();
    openPage("inicio");
  } catch (erro) {
    console.error("Erro ao carregar usuário:", erro);
    alert("Não foi possível carregar o perfil do usuário no Firebase.");
    await encerrarSessaoFirebase();
  }
}

function configurarColaboradorAnonimo(usuarioFirebase) {
  const colaboradorLocal = typeof obterColaboradorLocal === "function" ? obterColaboradorLocal() : {};

  if (!colaboradorLocal.nome || !colaboradorLocal.setor) {
    return false;
  }

  usuarioAtual = {
    id: usuarioFirebase.uid,
    nome: colaboradorLocal.nome,
    setor: colaboradorLocal.setor,
    email: "",
    unidade: "Senac Campo Mourão",
    perfil: "colaborador",
    manutencaoAutorizado: false,
    perfilConfigurado: true
  };

  preencherFormularioPerfil();
  return true;
}

function normalizarUsuarioLogado(usuarioFirebase, perfil) {
  const tipoPerfil = normalizarPerfilUsuario(perfil.perfil);

  return {
    id: usuarioFirebase.uid,
    nome: perfil.nome || usuarioFirebase.email || "Usuário",
    setor: perfil.setor || "Não informado",
    email: perfil.email || usuarioFirebase.email || "",
    unidade: perfil.unidade || "Senac Campo Mourão",
    perfil: tipoPerfil,
    manutencaoAutorizado: tipoPerfil === "manutencao" || tipoPerfil === "admin",
    perfilConfigurado: true
  };
}

function normalizarPerfilUsuario(perfil) {
  const perfilTexto = String(perfil || "colaborador")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (perfilTexto === "manutencao") {
    return "manutencao";
  }

  if (perfilTexto === "admin" || perfilTexto === "administrador") {
    return "admin";
  }

  return "colaborador";
}

function iniciarMonitoresDeDados() {
  monitorChamados = observarChamadosFirebase(usuarioAtual, lista => {
    chamados = lista;
    renderizarChamados();
    atualizarPainelSeAberto();
  }, erro => {
    console.error("Erro ao carregar chamados:", erro);
    alert("Não foi possível carregar os chamados do Firebase.");
  });

  monitorComunicados = observarComunicadosFirebase(lista => {
    comunicados = lista;

    if (typeof renderizarComunicados === "function") {
      renderizarComunicados();
    }
  }, erro => {
    console.error("Erro ao carregar comunicados:", erro);
    alert("Não foi possível carregar os comunicados do Firebase.");
  });

  monitorNotificacoes = observarNotificacoesFirebase(usuarioAtual, lista => {
    notificacoes = lista;

    if (typeof renderizarNotificacoes === "function") {
      renderizarNotificacoes();
    }
  }, erro => {
    console.error("Erro ao carregar notificações:", erro);
    alert("Não foi possível carregar as notificações do Firebase.");
  });
}

function encerrarMonitoresDeDados() {
  if (typeof monitorChamados === "function") {
    monitorChamados();
    monitorChamados = null;
  }

  if (typeof monitorComunicados === "function") {
    monitorComunicados();
    monitorComunicados = null;
  }

  if (typeof monitorNotificacoes === "function") {
    monitorNotificacoes();
    monitorNotificacoes = null;
  }
}

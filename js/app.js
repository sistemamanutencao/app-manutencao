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
  ativos = [];
  planosPreventivos = [];

  preencherFormularioPerfil();
  aplicarPermissoesNaTela();
  aplicarPermissoesInterface();
  renderizarChamados();

  if (typeof renderizarNotificacoes === "function") {
    renderizarNotificacoes();
  }

  if (typeof renderizarComunicados === "function") {
    renderizarComunicados();
  }

  if (typeof renderizarAtivos === "function") {
    renderizarAtivos();
  }

  if (typeof renderizarPlanosPreventivos === "function") {
    renderizarPlanosPreventivos();
  }

  aplicarPermissoesInterface();
  openPage(usuarioPodeVerPainel() ? "painel" : "inicio");
}

async function processarEstadoAutenticacao(usuarioFirebase) {
  encerrarMonitoresDeDados();

  aplicarPermissoesInterface();

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
    aplicarPermissoesInterface();
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
    aplicarPermissoesInterface();
    iniciarMonitoresDeDados();
    openPage(usuarioEhManutencaoAutorizada() ? "painel" : "inicio");
  } catch (erro) {
    console.error("Erro ao carregar usuário:", erro);
    alert("Não foi possível carregar o perfil do usuário no Firebase.");
    await encerrarSessaoFirebase();
  }
}

function configurarColaboradorAnonimo(usuarioFirebase) {
  const colaboradorLocal = typeof obterColaboradorLocal === "function" ? obterColaboradorLocal() : {};
  const colaboradorChave = colaboradorLocal.colaboradorChave
    || (typeof gerarChaveColaborador === "function" ? gerarChaveColaborador(colaboradorLocal.nome, colaboradorLocal.setor) : "");
  const colaboradorLocalId = colaboradorLocal.colaboradorLocalId
    || (typeof obterIdColaboradorLocal === "function" ? obterIdColaboradorLocal() : "")
    || colaboradorChave
    || (typeof garantirIdColaboradorLocal === "function" ? garantirIdColaboradorLocal() : usuarioFirebase.uid);

  if (!colaboradorLocal.nome || !colaboradorLocal.setor) {
    return false;
  }

  if (!colaboradorLocal.colaboradorChave && typeof salvarColaboradorLocal === "function") {
    salvarColaboradorLocal({
      ...colaboradorLocal,
      colaboradorLocalId,
      colaboradorChave
    });
  }

  usuarioAtual = {
    id: usuarioFirebase.uid,
    colaboradorLocalId,
    colaboradorChave,
    nome: colaboradorLocal.nome,
    setor: colaboradorLocal.setor,
    email: "",
    unidade: "Senac Campo Mourão",
    perfil: PERFIS_USUARIO.COLABORADOR,
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
    manutencaoAutorizado: tipoPerfil === PERFIS_USUARIO.MANUTENCAO,
    perfilConfigurado: true
  };
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

  monitorAtivos = observarAtivosFirebase(lista => {
    ativos = lista;

    if (typeof renderizarAtivos === "function") {
      renderizarAtivos();
    }

    if (typeof prepararQRCodeInicial === "function") {
      prepararQRCodeInicial();
    }
  }, erro => {
    console.error("Erro ao carregar ativos:", erro);
    alert("Não foi possível carregar os ativos do Firebase.");
  });
  monitorPlanosPreventivos = observarPlanosPreventivosFirebase(lista => {
    planosPreventivos = lista;

    if (typeof renderizarPlanosPreventivos === "function") {
      renderizarPlanosPreventivos();
    }
  }, erro => {
    console.error("Erro ao carregar planos preventivos:", erro);
    alert("Não foi possível carregar os planos preventivos do Firebase.");
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

  if (typeof monitorAtivos === "function") {
    monitorAtivos();
    monitorAtivos = null;
  }

  if (typeof monitorNotificacoes === "function") {
    monitorNotificacoes();
    monitorNotificacoes = null;
  }

  if (typeof monitorPlanosPreventivos === "function") {
    monitorPlanosPreventivos();
    monitorPlanosPreventivos = null;
  }
}


function aplicarPermissoesInterface() {
  const manutencao = typeof usuarioEhManutencaoAutorizada === "function"
    ? usuarioEhManutencaoAutorizada()
    : Boolean(usuarioAtual && usuarioAtual.manutencaoAutorizado);

  document.querySelectorAll(".manut-only").forEach((elemento) => {
    elemento.style.display = manutencao ? "" : "none";
  });

  document.querySelectorAll("[data-permissao]").forEach(elemento => {
    const permissao = elemento.getAttribute("data-permissao");
    elemento.style.display = usuarioPode(permissao) ? "" : "none";
  });
}

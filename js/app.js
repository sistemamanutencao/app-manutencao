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
  diagnosticos = [];
  usuariosSistema = [];

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

  if (typeof renderizarDiagnosticos === "function") {
    renderizarDiagnosticos();
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
    await encerrarSessaoFirebase();
    prepararTelaSemSessao();
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

    if (typeof iniciarMonitorUsuariosSistema === "function") {
      iniciarMonitorUsuariosSistema();
    }

    openPage(usuarioPodeGerenciarUsuarios() ? "usuarios" : (usuarioEhManutencaoAutorizada() ? "painel" : "inicio"));
  } catch (erro) {
    console.error("Erro ao carregar usuário:", erro);
    alert("Não foi possível carregar o perfil do usuário no Firebase.");
    await encerrarSessaoFirebase();
  }
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
    colaboradorLocalId: perfil.colaboradorLocalId || perfil.colaboradorCodigo || "",
    colaboradorCodigo: perfil.colaboradorCodigo || perfil.colaboradorLocalId || "",
    colaboradorChave: perfil.colaboradorChave || "",
    manutencaoAutorizado: tipoPerfil === PERFIS_USUARIO.MANUTENCAO,
    primeiroAcesso: perfil.primeiroAcesso === true,
    ativo: perfil.ativo !== false,
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

  if (usuarioEhManutencaoAutorizada() && typeof observarDiagnosticosFirebase === "function") {
    monitorDiagnosticos = observarDiagnosticosFirebase(lista => {
      diagnosticos = lista;

      if (typeof renderizarDiagnosticos === "function") {
        renderizarDiagnosticos();
      }
    }, erro => {
      console.error("Erro ao carregar diagnóstico inicial:", erro);
      alert("Não foi possível carregar o diagnóstico inicial do Firebase.");
    });
  }

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

  if (typeof monitorDiagnosticos === "function") {
    monitorDiagnosticos();
    monitorDiagnosticos = null;
  }

  if (typeof encerrarMonitorUsuariosSistema === "function") {
    encerrarMonitorUsuariosSistema();
  }
}


function aplicarPermissoesInterface() {
  const manutencao = typeof usuarioEhManutencaoAutorizada === "function"
    ? usuarioEhManutencaoAutorizada()
    : Boolean(usuarioAtual && usuarioAtual.manutencaoAutorizado);

  const gerencia = typeof usuarioEhGerencia === "function" ? usuarioEhGerencia() : false;

  document.querySelectorAll(".manut-only").forEach((elemento) => {
    elemento.style.display = manutencao ? "" : "none";
  });

  document.querySelectorAll(".gerencia-only").forEach((elemento) => {
    elemento.style.display = gerencia ? "" : "none";
  });

  atualizarRotulosVisaoChamados();

  document.querySelectorAll("[data-permissao]").forEach(elemento => {
    const permissao = elemento.getAttribute("data-permissao");
    elemento.style.display = usuarioPode(permissao) ? "" : "none";
  });
}


function atualizarRotulosVisaoChamados() {
  const podeVerTodas = typeof usuarioPodeVerTodasOS === "function" && usuarioPodeVerTodasOS();
  const ehGerencia = typeof usuarioEhGerencia === "function" && usuarioEhGerencia();

  const tituloRapido = document.getElementById("tituloCardChamadosRapido");
  const textoRapido = document.getElementById("textoCardChamadosRapido");
  const tituloPagina = document.getElementById("tituloPaginaChamados");
  const textoPagina = document.getElementById("textoPaginaChamados");

  if (tituloRapido) {
    tituloRapido.textContent = podeVerTodas ? "Todas as OS" : "Minhas OS";
  }

  if (textoRapido) {
    textoRapido.textContent = podeVerTodas ? "Acompanhar chamados" : "Acompanhar";
  }

  if (tituloPagina) {
    tituloPagina.textContent = ehGerencia ? "Acompanhamento de OS" : "Ordens de Serviço";
  }

  if (textoPagina) {
    textoPagina.textContent = ehGerencia
      ? "Acompanhe chamados de todos os colaboradores, status e histórico, sem permissões operacionais da manutenção."
      : "Acompanhe as OS abertas, em triagem, execução, validação e encerramento.";
  }
}

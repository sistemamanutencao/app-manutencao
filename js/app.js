/* =====================================================
   APP - INICIALIZAÇÃO E CICLO DE AUTENTICAÇÃO

   Responsabilidades:
   - iniciar Firebase e eventos globais;
   - processar login/logout;
   - carregar monitores de dados após autenticação;
   - aplicar permissões visuais por perfil.

   Atenção:
   - arquivo sensível para login, permissões e carregamento geral;
   - não alterar ordem de inicialização sem teste completo no VS Code.
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

/* =====================
   Eventos globais de interface
===================== */

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

/* =====================
   Estado visual sem sessão
===================== */

function prepararTelaSemSessao() {
  usuarioAtual = { ...USUARIO_PADRAO };
  chamados = [];
  comunicados = [];
  notificacoes = [];
  ativos = [];
  planosPreventivos = [];
  diagnosticos = [];
  cadastrosColaboradores = [];

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

  if (typeof limparCadastrosColaboradoresTela === "function") {
    limparCadastrosColaboradoresTela();
  }

  aplicarPermissoesInterface();
  openPage(usuarioPodeVerPainel() ? "painel" : "inicio");
}

/* =====================
   Fluxo de autenticação
===================== */

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

    try {
      await garantirVinculoColaboradorAtual();
    } catch (erro) {
      console.error("Erro ao registrar vínculo do colaborador:", erro);
      alert("Não foi possível validar o vínculo do colaborador.\nVerifique as regras publicadas no Firebase e tente novamente.");
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
      if (window.APP_PRIMEIRO_ACESSO_COLABORADOR_EM_ANDAMENTO === true) {
        return;
      }

      alert("Login realizado, mas este usuário ainda não possui cadastro em usuarios/{uid}.\nCrie o documento do usuário no Firestore para liberar o acesso.");
      await encerrarSessaoFirebase();
      return;
    }

    if (perfil.ativo !== true) {
      alert("Este usuário está inativo.\nProcure o responsável pelo sistema para liberar o acesso.");
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
    alert("Não foi possível carregar o perfil do usuário.\nVerifique conexão, Firestore Rules e o documento usuarios/{uid}.");
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
    colaboradorCodigo: colaboradorLocalId,
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

  if (typeof registrarVinculoColaboradorFirebase === "function") {
    registrarVinculoColaboradorFirebase(colaboradorLocalId, {
      nome: colaboradorLocal.nome,
      setor: colaboradorLocal.setor
    }).catch(erro => console.warn("Não foi possível registrar o vínculo do colaborador:", erro));
  }

  return true;
}

async function garantirVinculoColaboradorAtual() {
  if (!usuarioAtual || usuarioAtual.perfil !== PERFIS_USUARIO.COLABORADOR) {
    return;
  }

  if (typeof registrarVinculoColaboradorFirebase !== "function") {
    return;
  }

  const codigo = usuarioAtual.colaboradorCodigo || usuarioAtual.colaboradorLocalId;

  if (!codigo) {
    throw new Error("Código fixo do colaborador não encontrado.");
  }

  await registrarVinculoColaboradorFirebase(codigo, {
    nome: usuarioAtual.nome,
    setor: usuarioAtual.setor
  });
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
    perfilConfigurado: true
  };
}


/* =====================
   Monitores Firestore
===================== */

function iniciarMonitoresDeDados() {
  monitorChamados = observarChamadosFirebase(usuarioAtual, lista => {
    chamados = lista;
    renderizarChamados();
    atualizarPainelSeAberto();
  }, erro => {
    console.error("Erro ao carregar chamados:", erro);
    alert("Não foi possível carregar as OS.\nVerifique sua conexão e tente atualizar a página.");
  });

  monitorComunicados = observarComunicadosFirebase(lista => {
    comunicados = lista;

    if (typeof renderizarComunicados === "function") {
      renderizarComunicados();
    }
  }, erro => {
    console.error("Erro ao carregar comunicados:", erro);
    alert("Não foi possível carregar os comunicados.\nVerifique sua conexão e tente atualizar a página.");
  });

  monitorNotificacoes = observarNotificacoesFirebase(usuarioAtual, lista => {
    notificacoes = lista;

    if (typeof renderizarNotificacoes === "function") {
      renderizarNotificacoes();
    }
  }, erro => {
    console.error("Erro ao carregar notificações:", erro);
    alert("Não foi possível carregar as notificações internas.\nVerifique sua conexão e tente atualizar a página.");
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
    alert("Não foi possível carregar ativos e QR Codes.\nVerifique sua conexão e tente atualizar a página.");
  });
  monitorPlanosPreventivos = observarPlanosPreventivosFirebase(lista => {
    planosPreventivos = lista;

    if (typeof renderizarPlanosPreventivos === "function") {
      renderizarPlanosPreventivos();
    }
  }, erro => {
    console.error("Erro ao carregar planos preventivos:", erro);
    alert("Não foi possível carregar as preventivas.\nVerifique sua conexão e tente atualizar a página.");
  });

  if (usuarioEhManutencaoAutorizada() && typeof observarDiagnosticosFirebase === "function") {
    monitorDiagnosticos = observarDiagnosticosFirebase(lista => {
      diagnosticos = lista;

      if (typeof renderizarDiagnosticos === "function") {
        renderizarDiagnosticos();
      }
    }, erro => {
      console.error("Erro ao carregar diagnóstico inicial:", erro);
      alert("Não foi possível carregar o Diagnóstico Inicial.\nVerifique sua conexão, permissões e regras do Firestore.");
    });
  }

  if (usuarioEhManutencaoAutorizada() && typeof observarCadastrosColaboradoresFirebase === "function") {
    monitorCadastrosColaboradores = observarCadastrosColaboradoresFirebase(lista => {
      cadastrosColaboradores = lista;

      if (typeof renderizarCadastrosColaboradores === "function") {
        renderizarCadastrosColaboradores();
      }
    }, erro => {
      console.error("Erro ao carregar cadastros de colaboradores:", erro);
      alert("Não foi possível carregar os cadastros de colaboradores.\nVerifique conexão, permissões e regras do Firestore.");
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

  if (typeof monitorCadastrosColaboradores === "function") {
    monitorCadastrosColaboradores();
    monitorCadastrosColaboradores = null;
  }
}


/* =====================
   Aplicação de permissões visuais
===================== */

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

  document.querySelectorAll(".hide-for-manut").forEach((elemento) => {
    elemento.style.display = manutencao ? "none" : "";
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

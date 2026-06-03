/* =====================================================
   PERFIL E PERMISSÕES
===================================================== */

const CHAVE_COLABORADOR_LOCAL = "appManutencaoColaborador";
const CHAVE_COLABORADOR_ID_LOCAL = "appManutencaoColaboradorId";
const PREFIXO_CODIGO_COLABORADOR = "COL";

function aplicarPermissoesNaTela() {
  const perfilSalvo = usuarioTemPerfilSalvo();
  const areaNavegacao = obterAreaNavegacao();
  const areaFormularioPerfil = document.getElementById("areaFormularioPerfil");
  const areaPerfilLogado = document.getElementById("areaPerfilLogado");
  const botaoPainel = document.getElementById("botaoPainelManutencao");
  const areaNovoComunicado = document.getElementById("areaNovoComunicado");
  const areaNovoAtivo = document.getElementById("areaNovoAtivo");
  const areaNovoPlanoPreventivo = document.getElementById("areaNovoPlanoPreventivo");

  if (areaNavegacao) {
    areaNavegacao.style.display = perfilSalvo ? "" : "none";
  }

  if (areaFormularioPerfil) {
    areaFormularioPerfil.style.display = perfilSalvo ? "none" : "grid";
  }

  if (areaPerfilLogado) {
    areaPerfilLogado.style.display = perfilSalvo ? "block" : "none";
  }


  if (botaoPainel) {
    botaoPainel.style.display = usuarioPodeVerPainel() ? "block" : "none";
  }

  if (areaNovoComunicado) {
    areaNovoComunicado.style.display = usuarioPodeCriarComunicado() ? "grid" : "none";
  }

  if (areaNovoAtivo) {
    areaNovoAtivo.style.display = usuarioPodeGerenciarAtivos() ? "grid" : "none";
  }

  if (areaNovoPlanoPreventivo) {
    areaNovoPlanoPreventivo.style.display = usuarioPodeGerenciarPreventivas() ? "grid" : "none";
  }

  if (typeof aplicarPermissoesInterface === "function") {
    aplicarPermissoesInterface();
  }

  preencherResumoUsuarioNaTela();

  if (typeof atualizarResumoPerfil === "function") {
    atualizarResumoPerfil();
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
}

function obterAreaNavegacao() {
  const primeiroItemNavegacao = document.querySelector(".nav-item");
  return primeiroItemNavegacao ? primeiroItemNavegacao.parentElement : null;
}

function preencherResumoUsuarioNaTela() {
  const nome = usuarioAtual.nome || "Colaborador";
  const setor = usuarioAtual.setor || "Manutenção";
  const email = usuarioAtual.email || "Não informado";
  const unidade = usuarioAtual.unidade || "Senac Campo Mourão";
  const perfilTextoFormatado = obterNomePerfilFormatado(usuarioAtual.perfil);

  setTextContent("perfilAcessoTexto", perfilTextoFormatado);
  setTextContent("perfilAvatar", gerarIniciaisUsuario(nome));
  setTextContent("perfilNomeTitulo", nome);
  setTextContent("perfilSubtitulo", `${perfilTextoFormatado} • ${unidade}`);
  setTextContent("perfilNomeValor", nome);
  setTextContent("perfilSetorValor", setor);
  setTextContent("perfilEmailValor", email);
  setTextContent("perfilUnidadeValor", unidade);
}


function preencherFormularioPerfil() {
  const nomeInput = document.getElementById("loginNomeColaborador");
  const setorInput = document.getElementById("loginSetorColaborador");
  const emailInput = document.getElementById("loginEmailUsuario");
  const senhaInput = document.getElementById("loginSenhaUsuario");
  const colaboradorLocal = obterColaboradorLocal();

  if (nomeInput) {
    nomeInput.value = colaboradorLocal.nome || "";
  }

  if (setorInput) {
    setorInput.value = colaboradorLocal.setor || "";
  }

  if (emailInput) {
    emailInput.value = usuarioEhManutencaoAutorizada() ? usuarioAtual.email || "" : "";
  }

  if (senhaInput) {
    senhaInput.value = "";
  }
}

function obterColaboradorLocal() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_COLABORADOR_LOCAL) || "{}");
  } catch (erro) {
    return {};
  }
}

function normalizarIdentificadorColaborador(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function gerarChaveColaborador(nome, setor) {
  const nomeNormalizado = normalizarIdentificadorColaborador(nome);
  const setorNormalizado = normalizarIdentificadorColaborador(setor);

  if (!nomeNormalizado || !setorNormalizado) {
    return "";
  }

  return `colaborador-${setorNormalizado}-${nomeNormalizado}`;
}

function obterChaveColaboradorLocal() {
  const colaboradorLocal = obterColaboradorLocal();
  return colaboradorLocal.colaboradorChave || gerarChaveColaborador(colaboradorLocal.nome, colaboradorLocal.setor);
}

function usuarioEhAutorChamado(chamado) {
  if (!chamado || !usuarioAtual || !usuarioTemPerfilSalvo()) {
    return false;
  }

  if (usuarioPodeVerTodasOS()) {
    return true;
  }

  const idsUsuario = [
    usuarioAtual.id,
    usuarioAtual.colaboradorLocalId,
    usuarioAtual.colaboradorChave
  ].filter(Boolean);

  const idsChamado = [
    chamado.criadoPorUid,
    chamado.solicitanteId,
    chamado.colaboradorLocalId,
    chamado.colaboradorChave,
    chamado.criadoPorColaboradorId
  ].filter(Boolean);

  return idsUsuario.some(idUsuario => idsChamado.some(idChamado => idsIguais(idUsuario, idChamado)));
}

function gerarIdColaboradorLocal() {
  const parteAleatoria = Math.random().toString(36).slice(2, 8).toUpperCase();
  const parteTempo = Date.now().toString(36).slice(-4).toUpperCase();
  return `${PREFIXO_CODIGO_COLABORADOR}-${parteTempo}-${parteAleatoria}`;
}

function obterIdColaboradorLocal() {
  return localStorage.getItem(CHAVE_COLABORADOR_ID_LOCAL) || "";
}

function garantirIdColaboradorLocal() {
  const idExistente = obterIdColaboradorLocal();

  if (idExistente) {
    return idExistente;
  }

  const novoId = gerarIdColaboradorLocal();
  localStorage.setItem(CHAVE_COLABORADOR_ID_LOCAL, novoId);
  return novoId;
}

function salvarColaboradorLocal(dados) {
  const colaboradorChave = dados.colaboradorChave || gerarChaveColaborador(dados.nome, dados.setor);
  const idExistente = dados.colaboradorLocalId || obterIdColaboradorLocal();
  const idLocal = idExistente || colaboradorChave || garantirIdColaboradorLocal();

  localStorage.setItem(CHAVE_COLABORADOR_ID_LOCAL, idLocal);
  localStorage.setItem(CHAVE_COLABORADOR_LOCAL, JSON.stringify({
    ...dados,
    colaboradorLocalId: idLocal,
    colaboradorChave
  }));
}

function removerColaboradorLocal() {
  localStorage.removeItem(CHAVE_COLABORADOR_LOCAL);
  // O código fixo do colaborador é preservado para manter o vínculo com OS antigas
  // mesmo quando a sessão anônima do Firebase muda após logout/login.
}

function removerDadosIdentificacaoColaborador() {
  localStorage.removeItem(CHAVE_COLABORADOR_LOCAL);
}

async function entrarComoColaborador(botao) {
  const nomeInput = document.getElementById("loginNomeColaborador");
  const setorInput = document.getElementById("loginSetorColaborador");

  if (!nomeInput || !setorInput) {
    alert("Campos de identificação do colaborador não encontrados no HTML.");
    return;
  }

  const nome = nomeInput.value.trim();
  const setor = setorInput.value.trim();

  if (!nome || !setor) {
    alert("Informe seu nome e o setor onde trabalha.");
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Entrando...";
    }

    salvarColaboradorLocal({ nome, setor, colaboradorChave: gerarChaveColaborador(nome, setor) });

    if (!firebaseAuth.currentUser || !firebaseAuth.currentUser.isAnonymous) {
      await autenticarColaboradorAnonimo();
      return;
    }

    if (typeof registrarVinculoColaboradorFirebase === "function") {
      await registrarVinculoColaboradorFirebase(obterIdColaboradorLocal(), { nome, setor });
    }

    configurarColaboradorAnonimo(firebaseAuth.currentUser);
    aplicarPermissoesNaTela();
    iniciarMonitoresDeDados();
    openPage("inicio");
  } catch (erro) {
    console.error("Erro ao entrar como colaborador:", erro);
    alert("Não foi possível entrar como colaborador. Verifique se o login anônimo está habilitado no Firebase Authentication.");
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Entrar como colaborador";
    }
  }
}

async function entrarComFirebase(botao) {
  const emailInput = document.getElementById("loginEmailUsuario");
  const senhaInput = document.getElementById("loginSenhaUsuario");

  if (!emailInput || !senhaInput) {
    alert("Campos de login não encontrados no HTML.");
    return;
  }

  const email = emailInput.value.trim();
  const senha = senhaInput.value;

  if (!email || !senha) {
    alert("Informe e-mail e senha para entrar como manutenção.");
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Entrando...";
    }

    removerColaboradorLocal();
    await autenticarUsuario(email, senha);
  } catch (erro) {
    console.error("Erro de login:", erro);
    alert("Não foi possível entrar. Confira o e-mail e a senha cadastrados no Firebase.");
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Entrar como manutenção";
    }
  }
}

async function sairDaConta() {
  try {
    if (usuarioEhManutencaoAutorizada()) {
      removerColaboradorLocal();
    } else {
      removerDadosIdentificacaoColaborador();
    }

    await encerrarSessaoFirebase();
    fecharDetalhesChamado();

    if (typeof fecharPainelNotificacoes === "function") {
      fecharPainelNotificacoes();
    }

    alert("Sessão encerrada.");
  } catch (erro) {
    console.error("Erro ao sair:", erro);
    alert("Não foi possível sair da conta.");
  }
}

function atualizarResumoPerfil() {
  const totalChamados = chamados.length;
  const meusChamados = chamados.filter(chamado => usuarioEhAutorChamado(chamado)).length;
  const chamadosAbertos = chamados.filter(chamado => !statusFinalizado(chamado.status)).length;
  const chamadosCancelados = chamados.filter(chamado => chamado.status === "CANCELADO").length;

  setTextContent("perfilTotalChamados", totalChamados);
  setTextContent("perfilMeusChamados", meusChamados);
  setTextContent("perfilChamadosAbertos", chamadosAbertos);
  setTextContent("perfilChamadosCancelados", chamadosCancelados);
}

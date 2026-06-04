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
  const botaoUsuariosAdmin = document.getElementById("botaoUsuariosAdmin");

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

  if (botaoUsuariosAdmin) {
    botaoUsuariosAdmin.style.display = usuarioPodeGerenciarUsuarios() ? "block" : "none";
  }

  document.querySelectorAll(".admin-only").forEach(elemento => {
    elemento.style.display = usuarioPodeGerenciarUsuarios() ? "grid" : "none";
  });

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
  const emailInput = document.getElementById("loginEmailUsuario");
  const senhaInput = document.getElementById("loginSenhaUsuario");

  if (emailInput && usuarioAtual && usuarioAtual.email) {
    emailInput.value = usuarioAtual.email;
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
  localStorage.removeItem(CHAVE_COLABORADOR_ID_LOCAL);
}

function removerDadosIdentificacaoColaborador() {
  removerColaboradorLocal();
}

async function entrarComoColaborador(botao) {
  return entrarComFirebase(botao);
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
    alert("Informe e-mail e senha para entrar.");
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
    alert("Não foi possível entrar. Confira o e-mail, a senha ou se sua conta já foi ativada pelo link enviado.");
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Entrar";
    }
  }
}

async function sairDaConta() {
  try {
    removerColaboradorLocal();
    removerDadosIdentificacaoColaborador();

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

async function enviarRedefinicaoSenhaLogin(botao) {
  const emailInput = document.getElementById("loginEmailUsuario");
  const email = emailInput ? emailInput.value.trim() : "";

  if (!email) {
    alert("Informe seu e-mail para receber o link de redefinição de senha.");
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Enviando...";
    }

    await enviarEmailRedefinicaoSenha(email);
    alert("Link enviado. Verifique a caixa de entrada do e-mail informado.");
  } catch (erro) {
    console.error("Erro ao enviar redefinição de senha:", erro);
    alert("Não foi possível enviar o link de senha. Verifique o e-mail informado.");
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Esqueci minha senha";
    }
  }
}

function atualizarResumoPerfil() {
  const totalChamados = chamados.length;
  const meusChamados = chamados.filter(chamado => usuarioEhAutorChamado(chamado)).length;
  const chamadosAbertos = chamados.filter(chamado => !statusFinalizado(chamado.status)).length;
  const chamadosCancelados = chamados.filter(chamado => chamado.status === "CANCELADO").length;

  setTextContent("perfilTotalOS", totalChamados);
  setTextContent("perfilMeusOS", meusChamados);
  setTextContent("perfilOSAbertos", chamadosAbertos);
  setTextContent("perfilOSCancelados", chamadosCancelados);
}

/* =====================================================
   PERFIL E PERMISSÕES
===================================================== */

const CHAVE_COLABORADOR_LOCAL = "appManutencaoColaborador";

function usuarioTemPerfilSalvo() {
  return usuarioAtual && usuarioAtual.perfilConfigurado === true;
}

function usuarioEhManutencaoAutorizada() {
  return usuarioTemPerfilSalvo()
    && (usuarioAtual.perfil === "manutencao" || usuarioAtual.perfil === "admin")
    && usuarioAtual.manutencaoAutorizado === true;
}

function usuarioEhAdmin() {
  return usuarioTemPerfilSalvo() && usuarioAtual.perfil === "admin";
}

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
    botaoPainel.style.display = usuarioEhManutencaoAutorizada() ? "block" : "none";
  }

  if (areaNovoComunicado) {
    areaNovoComunicado.style.display = usuarioEhManutencaoAutorizada() ? "grid" : "none";
  }

  if (areaNovoAtivo) {
    areaNovoAtivo.style.display = usuarioEhManutencaoAutorizada() ? "grid" : "none";
  }

  if (areaNovoPlanoPreventivo) {
    areaNovoPlanoPreventivo.style.display = usuarioEhManutencaoAutorizada() ? "grid" : "none";
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

function obterNomePerfilFormatado(perfil) {
  const nomes = {
    colaborador: "Colaborador",
    manutencao: "Manutenção",
    admin: "Administrador"
  };

  return nomes[perfil] || "Colaborador";
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

function salvarColaboradorLocal(dados) {
  localStorage.setItem(CHAVE_COLABORADOR_LOCAL, JSON.stringify(dados));
}

function removerColaboradorLocal() {
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

    salvarColaboradorLocal({ nome, setor });

    if (!firebaseAuth.currentUser || !firebaseAuth.currentUser.isAnonymous) {
      await autenticarColaboradorAnonimo();
      return;
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
    removerColaboradorLocal();
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
  const meusChamados = chamados.filter(chamado => idsIguais(chamado.criadoPorUid, usuarioAtual.id)).length;
  const chamadosAbertos = chamados.filter(chamado => !statusFinalizado(chamado.status)).length;
  const chamadosCancelados = chamados.filter(chamado => chamado.status === "CANCELADO").length;

  setTextContent("perfilTotalChamados", totalChamados);
  setTextContent("perfilMeusChamados", meusChamados);
  setTextContent("perfilChamadosAbertos", chamadosAbertos);
  setTextContent("perfilChamadosCancelados", chamadosCancelados);
}

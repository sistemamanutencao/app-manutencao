/* =====================================================
   CADASTRO DE COLABORADORES - V20

   Responsabilidades:
   - permitir que a manutenção autorize colaboradores por e-mail;
   - manter perfil fixo como colaborador;
   - permitir primeiro acesso com criação de senha pelo próprio colaborador;
   - preservar login anônimo como transição.

   Atenção:
   - módulo sensível de autenticação e permissões;
   - deve permanecer alinhado com firestore.rules.
===================================================== */

const STATUS_CADASTRO_COLABORADOR = Object.freeze({
  PENDENTE: "pendente",
  CONCLUIDO: "concluido",
  INATIVO: "inativo"
});

const PREFIXO_CODIGO_COLABORADOR_EMAIL = "colab-email";


function escapeHTML(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizarEmailCadastroColaborador(email) {
  return String(email || "").trim().toLowerCase();
}

function gerarEmailKeyCadastroColaborador(email) {
  const emailNormalizado = normalizarEmailCadastroColaborador(email);

  return emailNormalizado
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function gerarCodigoColaboradorPorEmail(emailKey) {
  return `${PREFIXO_CODIGO_COLABORADOR_EMAIL}-${emailKey}`;
}

function obterColecaoCadastrosColaboradores() {
  return firebaseDb.collection(COLLECTIONS.CADASTROS_COLABORADORES || "cadastrosColaboradores");
}

function obterReferenciaCadastroColaborador(email) {
  const emailKey = gerarEmailKeyCadastroColaborador(email);
  return obterColecaoCadastrosColaboradores().doc(emailKey);
}

function validarEmailCadastroColaborador(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizarEmailCadastroColaborador(email));
}

async function cadastrarColaboradorPendente(botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção pode cadastrar colaboradores.");
    return;
  }

  const nomeInput = document.getElementById("cadastroColaboradorNome");
  const emailInput = document.getElementById("cadastroColaboradorEmail");
  const setorInput = document.getElementById("cadastroColaboradorSetor");

  if (!nomeInput || !emailInput || !setorInput) {
    alert("Campos de cadastro não encontrados. Atualize a página e tente novamente.");
    return;
  }

  const nome = nomeInput.value.trim();
  const email = normalizarEmailCadastroColaborador(emailInput.value);
  const setor = setorInput.value.trim();

  if (!nome || !email || !setor) {
    alert("Informe nome, e-mail e setor do colaborador.");
    return;
  }

  if (!validarEmailCadastroColaborador(email)) {
    alert("Informe um e-mail válido para o colaborador.");
    return;
  }

  emailInput.value = email;

  const emailKey = gerarEmailKeyCadastroColaborador(email);
  const codigoColaborador = gerarCodigoColaboradorPorEmail(emailKey);
  const referencia = obterReferenciaCadastroColaborador(email);

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Autorizando...";
    }

    const existente = await referencia.get();

    if (existente.exists) {
      const cadastroExistente = existente.data() || {};
      const statusExistente = String(cadastroExistente.status || "").toLowerCase();

      if (statusExistente === STATUS_CADASTRO_COLABORADOR.PENDENTE) {
        alert("Este e-mail já possui cadastro pendente aguardando o primeiro acesso.");
        return;
      }

      if (statusExistente === STATUS_CADASTRO_COLABORADOR.CONCLUIDO) {
        alert("Este e-mail já concluiu o primeiro acesso e já possui conta como colaborador.");
        return;
      }

      if (statusExistente === STATUS_CADASTRO_COLABORADOR.INATIVO) {
        alert("Este e-mail está em um cadastro inativo. Reative ou ajuste o cadastro existente antes de autorizar novamente.");
        return;
      }

      alert("Já existe um cadastro para este e-mail. Verifique a lista antes de criar uma nova autorização.");
      return;
    }

    await referencia.set({
      emailKey,
      codigoColaborador,
      nome,
      email,
      setor,
      perfil: PERFIS_USUARIO.COLABORADOR,
      ativo: true,
      status: STATUS_CADASTRO_COLABORADOR.PENDENTE,
      criadoPorUid: usuarioAtual.id || "",
      criadoPorNome: usuarioAtual.nome || "Manutenção",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    nomeInput.value = "";
    emailInput.value = "";
    setorInput.value = "";

    alert("Colaborador autorizado. Ele já pode usar o Primeiro acesso com o e-mail cadastrado.");
  } catch (erro) {
    console.error("Erro ao cadastrar colaborador:", erro);
    alert("Não foi possível autorizar o colaborador. Verifique as regras do Firestore e tente novamente.");
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Autorizar colaborador";
    }
  }
}

function observarCadastrosColaboradoresFirebase(callback, callbackErro) {
  if (!usuarioEhManutencaoAutorizada()) {
    callback([]);
    return function cancelarObservacaoVazia() {};
  }

  return obterColecaoCadastrosColaboradores()
    .orderBy("criadoEm", "desc")
    .onSnapshot(snapshot => {
      const lista = snapshot.docs.map(documento => ({
        id: documento.id,
        ...documento.data()
      }));
      callback(lista);
    }, callbackErro);
}

function renderizarCadastrosColaboradores() {
  const lista = document.getElementById("listaCadastrosColaboradores");

  if (!lista) {
    return;
  }

  if (!usuarioEhManutencaoAutorizada()) {
    lista.innerHTML = "";
    return;
  }

  if (!cadastrosColaboradores.length) {
    lista.innerHTML = '<p class="empty-state">Nenhum colaborador autorizado ainda.</p>';
    return;
  }

  lista.innerHTML = cadastrosColaboradores.map(cadastro => {
    const status = cadastro.status || STATUS_CADASTRO_COLABORADOR.PENDENTE;
    const statusClasse = status === STATUS_CADASTRO_COLABORADOR.CONCLUIDO
      ? "status-green"
      : status === STATUS_CADASTRO_COLABORADOR.INATIVO
        ? "status-red"
        : "status-orange";

    return `
      <div class="cadastro-colaborador-item">
        <div>
          <strong>${escapeHTML(cadastro.nome || "Colaborador")}</strong>
          <span>${escapeHTML(cadastro.email || "E-mail não informado")}</span>
          <small>${escapeHTML(cadastro.setor || "Setor não informado")}</small>
        </div>
        <span class="status ${statusClasse}">${escapeHTML(formatarStatusCadastroColaborador(status))}</span>
      </div>
    `;
  }).join("");
}

function formatarStatusCadastroColaborador(status) {
  const statusNormalizado = String(status || "").toLowerCase();

  if (statusNormalizado === STATUS_CADASTRO_COLABORADOR.CONCLUIDO) {
    return "Concluído";
  }

  if (statusNormalizado === STATUS_CADASTRO_COLABORADOR.INATIVO) {
    return "Inativo";
  }

  return "Pendente";
}

async function criarPrimeiroAcessoColaborador(botao) {
  const emailInput = document.getElementById("primeiroAcessoEmailColaborador");
  const senhaInput = document.getElementById("primeiroAcessoSenhaColaborador");
  const confirmarSenhaInput = document.getElementById("primeiroAcessoConfirmarSenhaColaborador");

  if (!emailInput || !senhaInput || !confirmarSenhaInput) {
    alert("Campos de primeiro acesso não encontrados. Atualize a página e tente novamente.");
    return;
  }

  const email = normalizarEmailCadastroColaborador(emailInput.value);
  const senha = senhaInput.value;
  const confirmarSenha = confirmarSenhaInput.value;

  if (!email || !senha || !confirmarSenha) {
    alert("Informe e-mail, senha e confirmação de senha.");
    return;
  }

  if (!validarEmailCadastroColaborador(email)) {
    alert("Informe um e-mail válido.");
    return;
  }

  emailInput.value = email;

  if (senha.length < 6) {
    alert("A senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("A confirmação de senha não confere.");
    return;
  }

  const emailKey = gerarEmailKeyCadastroColaborador(email);
  const codigoColaborador = gerarCodigoColaboradorPorEmail(emailKey);
  let usuarioCriado = null;

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Criando acesso...";
    }

    window.APP_PRIMEIRO_ACESSO_COLABORADOR_EM_ANDAMENTO = true;

    const credencial = await firebaseAuth.createUserWithEmailAndPassword(email, senha);
    usuarioCriado = credencial.user;

    const referenciaCadastro = obterReferenciaCadastroColaborador(email);
    const documentoCadastro = await referenciaCadastro.get();

    if (!documentoCadastro.exists) {
      await removerUsuarioCriadoSemAutorizacao(usuarioCriado);
      alert("Este e-mail ainda não foi autorizado pela manutenção.");
      return;
    }

    const cadastro = documentoCadastro.data();

    if (cadastro.ativo !== true || cadastro.status !== STATUS_CADASTRO_COLABORADOR.PENDENTE || cadastro.perfil !== PERFIS_USUARIO.COLABORADOR) {
      await removerUsuarioCriadoSemAutorizacao(usuarioCriado);
      alert("Este cadastro não está disponível para primeiro acesso.");
      return;
    }

    if (normalizarEmailCadastroColaborador(cadastro.email) !== email) {
      await removerUsuarioCriadoSemAutorizacao(usuarioCriado);
      alert("O e-mail informado não confere com o cadastro autorizado.");
      return;
    }

    await firebaseDb.collection(COLLECTIONS.USUARIOS).doc(usuarioCriado.uid).set({
      nome: cadastro.nome || email,
      email,
      setor: cadastro.setor || "Não informado",
      unidade: "Senac Campo Mourão",
      perfil: PERFIS_USUARIO.COLABORADOR,
      ativo: true,
      origem: "cadastro_colaborador_v20",
      cadastroColaboradorEmailKey: emailKey,
      colaboradorCodigo: cadastro.codigoColaborador || codigoColaborador,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    await firebaseDb.collection(COLLECTIONS.COLABORADORES).doc(cadastro.codigoColaborador || codigoColaborador).set({
      codigo: cadastro.codigoColaborador || codigoColaborador,
      nome: cadastro.nome || email,
      setor: cadastro.setor || "Não informado",
      uidsAutorizados: [usuarioCriado.uid],
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    await referenciaCadastro.update({
      status: STATUS_CADASTRO_COLABORADOR.CONCLUIDO,
      uidCriado: usuarioCriado.uid,
      concluidoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    removerColaboradorLocal();
    emailInput.value = "";
    senhaInput.value = "";
    confirmarSenhaInput.value = "";

    const perfil = await buscarPerfilFirebase(usuarioCriado.uid);
    usuarioAtual = normalizarUsuarioLogado(usuarioCriado, perfil);
    preencherFormularioPerfil();
    aplicarPermissoesNaTela();
    aplicarPermissoesInterface();
    iniciarMonitoresDeDados();
    openPage("inicio");

    alert("Primeiro acesso concluído. Você já está logado como colaborador.");
  } catch (erro) {
    console.error("Erro no primeiro acesso do colaborador:", erro);

    if (erro && erro.code === "auth/email-already-in-use") {
      alert("Este e-mail já possui conta no Firebase. Use Entrar com e-mail ou peça conferência do cadastro.");
      return;
    }

    alert("Não foi possível concluir o primeiro acesso. Verifique o e-mail autorizado, a senha e as regras do Firestore.");
  } finally {
    window.APP_PRIMEIRO_ACESSO_COLABORADOR_EM_ANDAMENTO = false;

    if (botao) {
      botao.disabled = false;
      botao.textContent = "Criar senha e entrar";
    }
  }
}

async function removerUsuarioCriadoSemAutorizacao(usuario) {
  try {
    if (usuario && typeof usuario.delete === "function") {
      await usuario.delete();
    }
  } catch (erro) {
    console.warn("Não foi possível remover usuário sem autorização:", erro);
  }

  try {
    await encerrarSessaoFirebase();
  } catch (erro) {
    console.warn("Não foi possível encerrar sessão sem autorização:", erro);
  }
}

function limparCadastrosColaboradoresTela() {
  cadastrosColaboradores = [];
  renderizarCadastrosColaboradores();
}

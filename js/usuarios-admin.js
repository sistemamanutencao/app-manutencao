/* =====================================================
   ADMINISTRAÇÃO DE USUÁRIOS
   Cadastro por convite via Cloud Functions + Firebase Auth.
===================================================== */

function iniciarMonitorUsuariosSistema() {
  if (monitorUsuarios || !usuarioPodeGerenciarUsuarios()) {
    return;
  }

  monitorUsuarios = observarUsuariosFirebase(lista => {
    usuariosSistema = lista;
    renderizarUsuariosSistema();
  }, erro => {
    console.error("Erro ao carregar usuários:", erro);
    alert("Não foi possível carregar os usuários. Verifique as regras do Firestore.");
  });
}

function encerrarMonitorUsuariosSistema() {
  if (typeof monitorUsuarios === "function") {
    monitorUsuarios();
  }
  monitorUsuarios = null;
  usuariosSistema = [];
}

function renderizarUsuariosSistema() {
  const lista = document.getElementById("listaUsuariosSistema");

  if (!lista) return;

  if (!usuarioPodeGerenciarUsuarios()) {
    lista.innerHTML = `<div class="empty-card">Acesso restrito ao administrador.</div>`;
    return;
  }

  if (!usuariosSistema.length) {
    lista.innerHTML = `<div class="empty-card">Nenhum usuário cadastrado.</div>`;
    return;
  }

  lista.innerHTML = usuariosSistema.map(usuario => {
    const perfil = obterNomePerfilFormatado(usuario.perfil);
    const ativo = usuario.ativo !== false;
    const uid = usuario.uid || usuario.id;
    const podeAlterarStatus = usuarioAtual.id !== uid;

    return `
      <div class="ticket-item usuario-admin-card">
        <div class="ticket-info">
          <h3>${escapeHtml(usuario.nome || "Usuário sem nome")}</h3>
          <p>${escapeHtml(usuario.email || "E-mail não informado")}</p>
          <p>${escapeHtml(usuario.setor || "Setor não informado")} • ${escapeHtml(perfil)}</p>
        </div>
        <span class="status ${ativo ? "status-green" : "status-orange"}">${ativo ? "ATIVO" : "INATIVO"}</span>
        <div class="usuario-admin-actions">
          <select onchange="alterarPerfilUsuarioAdmin('${uid}', this.value)" ${usuarioAtual.id === uid ? "disabled" : ""}>
            ${PERFIS_USUARIO_LISTA.map(perfilOpcao => `<option value="${perfilOpcao}" ${normalizarPerfilUsuario(usuario.perfil) === perfilOpcao ? "selected" : ""}>${obterNomePerfilFormatado(perfilOpcao)}</option>`).join("")}
          </select>
          <button type="button" class="secondary-button" onclick="reenviarConviteUsuarioAdmin('${uid}')">Reenviar convite</button>
          <button type="button" class="secondary-button" onclick="definirStatusUsuarioAdmin('${uid}', ${!ativo})" ${podeAlterarStatus ? "" : "disabled"}>${ativo ? "Desativar" : "Reativar"}</button>
        </div>
      </div>
    `;
  }).join("");
}

async function criarUsuarioAdmin(botao) {
  if (!usuarioPodeGerenciarUsuarios()) {
    alert("Acesso permitido somente ao administrador.");
    return;
  }

  const nome = obterValorCampo("adminUsuarioNome");
  const email = obterValorCampo("adminUsuarioEmail");
  const setor = obterValorCampo("adminUsuarioSetor");
  const cargo = obterValorCampo("adminUsuarioCargo");
  const perfil = obterValorCampo("adminUsuarioPerfil");

  if (!nome || !email || !setor || !perfil) {
    alert("Informe nome, e-mail, setor e perfil.");
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Enviando convite...";
    }

    await criarUsuarioPorConviteFirebase({ nome, email, setor, cargo, perfil });
    limparFormularioUsuarioAdmin();
    alert("Usuário cadastrado. O convite para criação de senha foi enviado por e-mail.");
  } catch (erro) {
    console.error("Erro ao criar usuário:", erro);
    alert(obterMensagemErroFuncao(erro, "Não foi possível cadastrar o usuário."));
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Cadastrar e enviar convite";
    }
  }
}

async function reenviarConviteUsuarioAdmin(uid) {
  if (!uid || !confirm("Reenviar link de criação/redefinição de senha para este usuário?")) return;

  try {
    await reenviarConviteUsuarioFirebase(uid);
    alert("Convite reenviado por e-mail.");
  } catch (erro) {
    console.error("Erro ao reenviar convite:", erro);
    alert(obterMensagemErroFuncao(erro, "Não foi possível reenviar o convite."));
  }
}

async function alterarPerfilUsuarioAdmin(uid, perfil) {
  if (!uid || !perfil) return;
  if (!confirm(`Alterar perfil para ${obterNomePerfilFormatado(perfil)}?`)) {
    renderizarUsuariosSistema();
    return;
  }

  try {
    await alterarPerfilUsuarioFirebase(uid, perfil);
    alert("Perfil atualizado.");
  } catch (erro) {
    console.error("Erro ao alterar perfil:", erro);
    alert(obterMensagemErroFuncao(erro, "Não foi possível alterar o perfil."));
    renderizarUsuariosSistema();
  }
}

async function definirStatusUsuarioAdmin(uid, ativo) {
  if (!uid) return;
  const acao = ativo ? "reativar" : "desativar";

  if (!confirm(`Deseja ${acao} este usuário?`)) return;

  try {
    await definirStatusUsuarioFirebase(uid, ativo);
    alert(`Usuário ${ativo ? "reativado" : "desativado"}.`);
  } catch (erro) {
    console.error("Erro ao alterar status do usuário:", erro);
    alert(obterMensagemErroFuncao(erro, "Não foi possível alterar o status do usuário."));
  }
}

function limparFormularioUsuarioAdmin() {
  ["adminUsuarioNome", "adminUsuarioEmail", "adminUsuarioSetor", "adminUsuarioCargo"].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  const perfil = document.getElementById("adminUsuarioPerfil");
  if (perfil) perfil.value = PERFIS_USUARIO.COLABORADOR;
}

function obterValorCampo(id) {
  const campo = document.getElementById(id);
  return campo ? String(campo.value || "").trim() : "";
}

function obterMensagemErroFuncao(erro, fallback) {
  return (erro && erro.message) || (erro && erro.details && erro.details.message) || fallback;
}

function escapeHtml(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

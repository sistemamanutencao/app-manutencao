const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");
const db = admin.firestore();

const PERFIS_VALIDOS = new Set(["colaborador", "gerencia", "manutencao", "administrador"]);
const APP_NOME = "Central de Manutenção";
const EMAIL_REMETENTE = process.env.EMAIL_REMETENTE || "Central de Manutenção <onboarding@resend.dev>";

function normalizarPerfil(perfil) {
  const valor = String(perfil || "colaborador")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  if (["gestor", "gestao", "gerente"].includes(valor)) return "gerencia";
  if (["tecnico", "tecnica", "manutencao_predial"].includes(valor)) return "manutencao";
  if (["admin", "administracao"].includes(valor)) return "administrador";

  return PERFIS_VALIDOS.has(valor) ? valor : "colaborador";
}

async function exigirAdministrador(contexto) {
  if (!contexto.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }

  const documento = await db.collection("usuarios").doc(contexto.auth.uid).get();
  const dados = documento.exists ? documento.data() : null;

  if (!dados || dados.ativo !== true || dados.perfil !== "administrador") {
    throw new HttpsError("permission-denied", "Ação permitida somente ao administrador.");
  }

  return { uid: contexto.auth.uid, ...dados };
}

function validarEmail(email) {
  const valor = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    throw new HttpsError("invalid-argument", "E-mail inválido.");
  }
  return valor;
}

function validarTextoObrigatorio(valor, campo) {
  const texto = String(valor || "").trim();
  if (!texto) {
    throw new HttpsError("invalid-argument", `Campo obrigatório: ${campo}.`);
  }
  return texto;
}

async function gerarLinkSenha(email) {
  return admin.auth().generatePasswordResetLink(email);
}

async function enviarEmailConvite({ email, nome, linkSenha }) {
  const apiKey = resendApiKey.value();

  if (!apiKey) {
    console.warn("RESEND_API_KEY não configurada. Link gerado, mas e-mail não enviado.");
    return { enviado: false, motivo: "RESEND_API_KEY não configurada." };
  }

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: EMAIL_REMETENTE,
      to: [email],
      subject: "Ative seu acesso à Central de Manutenção",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
          <h2>${APP_NOME}</h2>
          <p>Olá, ${nome}.</p>
          <p>Sua conta foi criada. Clique no botão abaixo para criar sua senha de acesso.</p>
          <p><a href="${linkSenha}" style="display:inline-block;background:#1f6fe5;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Criar minha senha</a></p>
          <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
          <p>${linkSenha}</p>
        </div>
      `
    })
  });

  if (!resposta.ok) {
    const texto = await resposta.text();
    console.error("Erro Resend:", resposta.status, texto);
    throw new HttpsError("internal", "Usuário criado, mas houve falha ao enviar o e-mail de convite.");
  }

  return { enviado: true };
}

exports.criarUsuario = onCall({ secrets: [resendApiKey] }, async request => {
  const adminAtual = await exigirAdministrador(request);
  const dados = request.data || {};

  const nome = validarTextoObrigatorio(dados.nome, "nome");
  const email = validarEmail(dados.email);
  const setor = validarTextoObrigatorio(dados.setor, "setor");
  const cargo = String(dados.cargo || "").trim();
  const perfil = normalizarPerfil(dados.perfil);

  let usuarioAuth;

  try {
    usuarioAuth = await admin.auth().getUserByEmail(email);
  } catch (erro) {
    if (erro.code !== "auth/user-not-found") throw erro;
    usuarioAuth = await admin.auth().createUser({
      email,
      displayName: nome,
      disabled: false,
      emailVerified: false
    });
  }

  await db.collection("usuarios").doc(usuarioAuth.uid).set({
    uid: usuarioAuth.uid,
    nome,
    email,
    setor,
    cargo,
    perfil,
    ativo: true,
    primeiroAcesso: true,
    criadoPor: adminAtual.uid,
    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await admin.auth().setCustomUserClaims(usuarioAuth.uid, { perfil, ativo: true });

  const linkSenha = await gerarLinkSenha(email);
  const envio = await enviarEmailConvite({ email, nome, linkSenha });

  return { uid: usuarioAuth.uid, email, perfil, conviteEnviado: envio.enviado };
});

exports.reenviarConvite = onCall({ secrets: [resendApiKey] }, async request => {
  await exigirAdministrador(request);
  const uid = validarTextoObrigatorio(request.data && request.data.uid, "uid");
  const documento = await db.collection("usuarios").doc(uid).get();

  if (!documento.exists) {
    throw new HttpsError("not-found", "Usuário não encontrado.");
  }

  const usuario = documento.data();
  const email = validarEmail(usuario.email);
  const nome = usuario.nome || email;
  const linkSenha = await gerarLinkSenha(email);
  const envio = await enviarEmailConvite({ email, nome, linkSenha });

  return { uid, email, conviteEnviado: envio.enviado };
});

exports.alterarPerfil = onCall(async request => {
  await exigirAdministrador(request);
  const uid = validarTextoObrigatorio(request.data && request.data.uid, "uid");
  const perfil = normalizarPerfil(request.data && request.data.perfil);

  await db.collection("usuarios").doc(uid).update({
    perfil,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
  });

  const documento = await db.collection("usuarios").doc(uid).get();
  await admin.auth().setCustomUserClaims(uid, {
    perfil,
    ativo: documento.exists ? documento.data().ativo !== false : true
  });

  return { uid, perfil };
});

exports.desativarUsuario = onCall(async request => {
  const adminAtual = await exigirAdministrador(request);
  const uid = validarTextoObrigatorio(request.data && request.data.uid, "uid");

  if (uid === adminAtual.uid) {
    throw new HttpsError("failed-precondition", "O administrador não pode desativar a própria conta.");
  }

  await admin.auth().updateUser(uid, { disabled: true });
  await db.collection("usuarios").doc(uid).update({
    ativo: false,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
  });

  const documento = await db.collection("usuarios").doc(uid).get();
  await admin.auth().setCustomUserClaims(uid, {
    perfil: documento.exists ? documento.data().perfil : "colaborador",
    ativo: false
  });

  return { uid, ativo: false };
});

exports.reativarUsuario = onCall(async request => {
  await exigirAdministrador(request);
  const uid = validarTextoObrigatorio(request.data && request.data.uid, "uid");

  await admin.auth().updateUser(uid, { disabled: false });
  await db.collection("usuarios").doc(uid).update({
    ativo: true,
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
  });

  const documento = await db.collection("usuarios").doc(uid).get();
  await admin.auth().setCustomUserClaims(uid, {
    perfil: documento.exists ? documento.data().perfil : "colaborador",
    ativo: true
  });

  return { uid, ativo: true };
});

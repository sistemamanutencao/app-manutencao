/*
 * Central de Manutenção — Push Worker
 * Cloudflare Worker + Firebase Cloud Messaging HTTP v1
 *
 * Rotas:
 *   GET  /health
 *   POST /register
 *   POST /unregister
 *   POST /notify-new-call
 *
 * Segredos esperados no Cloudflare:
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 *
 * Bindings:
 *   PUSH_DEVICES (Workers KV)
 *
 * Variáveis públicas:
 *   FIREBASE_PROJECT_ID
 *   APP_URL
 *   ALLOWED_ORIGIN
 */

const TOKEN_SCOPE = [
  "https://www.googleapis.com/auth/firebase.messaging",
  "https://www.googleapis.com/auth/datastore"
].join(" ");

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIREBASE_AUTH_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const DEVICE_PREFIX = "maint:";
const SENT_PREFIX = "sent:";
const DEVICE_TTL_SECONDS = 90 * 24 * 60 * 60;
const SENT_TTL_SECONDS = 7 * 24 * 60 * 60;

let jwksCache = { expiresAt: 0, keys: [] };
let googleAccessTokenCache = { token: "", expiresAt: 0 };

export default {
  async fetch(request, env) {
    try {
      if (request.method === "OPTIONS") {
        return corsResponse(request, env, null, 204);
      }

      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/health") {
        return corsResponse(request, env, {
          ok: true,
          service: "app-manutencao-push",
          projectId: env.FIREBASE_PROJECT_ID || "",
          configured: Boolean(
            env.FIREBASE_PROJECT_ID
            && env.FIREBASE_CLIENT_EMAIL
            && env.FIREBASE_PRIVATE_KEY
            && env.PUSH_DEVICES
          )
        });
      }

      if (request.method !== "POST") {
        return corsResponse(request, env, { error: "Método não permitido." }, 405);
      }

      validarOrigem(request, env);
      validarConfiguracao(env);

      const usuario = await autenticarRequisicao(request, env);
      const corpo = await lerJson(request);

      if (url.pathname === "/register") {
        return corsResponse(request, env, await registrarDispositivo(env, usuario, corpo));
      }

      if (url.pathname === "/unregister") {
        return corsResponse(request, env, await desregistrarDispositivo(env, usuario, corpo));
      }

      if (url.pathname === "/notify-new-call") {
        return corsResponse(request, env, await notificarNovoChamado(env, usuario, corpo));
      }

      return corsResponse(request, env, { error: "Rota não encontrada." }, 404);
    } catch (erro) {
      const status = Number(erro && erro.status) || 500;
      const mensagem = erro && erro.publicMessage
        ? erro.publicMessage
        : status >= 500
          ? "Falha interna no serviço de notificações."
          : erro.message || "Requisição inválida.";

      if (status >= 500) {
        console.error("Push Worker:", erro);
      }

      return corsResponse(request, env, { error: mensagem }, status);
    }
  }
};

function validarConfiguracao(env) {
  const ausentes = [];

  if (!env.FIREBASE_PROJECT_ID) ausentes.push("FIREBASE_PROJECT_ID");
  if (!env.FIREBASE_CLIENT_EMAIL) ausentes.push("FIREBASE_CLIENT_EMAIL");
  if (!env.FIREBASE_PRIVATE_KEY) ausentes.push("FIREBASE_PRIVATE_KEY");
  if (!env.PUSH_DEVICES) ausentes.push("PUSH_DEVICES");

  if (ausentes.length) {
    throw erroHttp(500, `Configuração ausente: ${ausentes.join(", ")}`, "Servidor push ainda não configurado.");
  }
}

function validarOrigem(request, env) {
  const origem = request.headers.get("Origin") || "";
  const permitida = String(env.ALLOWED_ORIGIN || "").trim();

  if (!origem || !permitida) {
    return;
  }

  const ehLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origem);

  if (origem !== permitida && !ehLocal) {
    throw erroHttp(403, `Origem bloqueada: ${origem}`, "Origem não autorizada.");
  }
}

async function autenticarRequisicao(request, env) {
  const cabecalho = request.headers.get("Authorization") || "";
  const match = cabecalho.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    throw erroHttp(401, "Bearer token ausente.", "Sessão não autenticada.");
  }

  return verificarFirebaseIdToken(match[1], env.FIREBASE_PROJECT_ID);
}

async function registrarDispositivo(env, usuario, corpo) {
  const token = limitarTexto(corpo && corpo.token, 4096);

  if (!token) {
    throw erroHttp(400, "Token FCM ausente.");
  }

  const perfil = await buscarPerfilUsuario(env, usuario.uid);

  if (!perfil || perfil.ativo !== true || normalizarTexto(perfil.perfil) !== "manutencao") {
    throw erroHttp(403, "Usuário não pertence ao perfil manutenção.", "Somente a manutenção pode registrar este aparelho para alertas.");
  }

  const hash = (await sha256Hex(token)).slice(0, 40);
  const chave = `${DEVICE_PREFIX}${usuario.uid}:${hash}`;

  await env.PUSH_DEVICES.put(chave, JSON.stringify({
    token,
    uid: usuario.uid,
    nome: limitarTexto(perfil.nome, 120),
    userAgent: limitarTexto(corpo && corpo.userAgent, 300),
    platform: limitarTexto(corpo && corpo.platform, 100),
    atualizadoEm: new Date().toISOString()
  }), {
    expirationTtl: DEVICE_TTL_SECONDS
  });

  return { ok: true, registered: true };
}

async function desregistrarDispositivo(env, usuario, corpo) {
  const token = limitarTexto(corpo && corpo.token, 4096);

  if (!token) {
    return { ok: true, removed: false };
  }

  const hash = (await sha256Hex(token)).slice(0, 40);
  const chave = `${DEVICE_PREFIX}${usuario.uid}:${hash}`;
  await env.PUSH_DEVICES.delete(chave);

  return { ok: true, removed: true };
}

async function notificarNovoChamado(env, usuario, corpo) {
  const chamadoId = sanitizarIdDocumento(corpo && corpo.chamadoId);

  if (!chamadoId) {
    throw erroHttp(400, "ID do chamado inválido.");
  }

  const chaveEnviada = `${SENT_PREFIX}${chamadoId}`;

  if (await env.PUSH_DEVICES.get(chaveEnviada)) {
    return { ok: true, duplicate: true, sent: 0 };
  }

  const acessoGoogle = await obterGoogleAccessToken(env);
  const chamado = await buscarDocumentoFirestore(env, "chamados", chamadoId, acessoGoogle);

  if (!chamado) {
    throw erroHttp(404, "Chamado não encontrado.");
  }

  const status = normalizarTexto(chamado.status);

  if (status !== "aberto") {
    throw erroHttp(409, `Chamado ${chamadoId} não está ABERTO.`, "A OS já não está no estado de novo chamado.");
  }

  const uidCriador = String(chamado.criadoPorUid || "");
  let remetenteAutorizado = uidCriador && uidCriador === usuario.uid;

  if (!remetenteAutorizado) {
    const perfilRemetente = await buscarPerfilUsuario(env, usuario.uid, acessoGoogle);
    remetenteAutorizado = Boolean(
      perfilRemetente
      && perfilRemetente.ativo === true
      && normalizarTexto(perfilRemetente.perfil) === "manutencao"
    );
  }

  if (!remetenteAutorizado) {
    throw erroHttp(403, "Usuário não autorizado a disparar alerta desta OS.");
  }

  const dispositivos = await listarDispositivosManutencao(env);

  if (!dispositivos.length) {
    return { ok: true, sent: 0, registeredDevices: 0 };
  }

  const prioridade = String(chamado.prioridade || "Normal");
  const urgente = normalizarTexto(prioridade) === "urgente";
  const numeroOS = String(chamado.numeroOS || "Nova OS");
  const local = String(chamado.local || chamado.andar || "Local não informado");
  const descricao = limitarTexto(chamado.descricao || "Novo chamado aberto.", 150);
  const titulo = urgente ? "URGENTE • Novo chamado" : "Novo chamado de manutenção";
  const texto = limitarTexto(`${numeroOS} • ${local} — ${descricao}`, 220);
  const appUrl = montarUrlChamado(env.APP_URL, chamadoId);
  const tag = `novo-chamado-${chamadoId}`;

  const resultados = await enviarParaDispositivos({
    env,
    acessoGoogle,
    dispositivos,
    data: {
      type: "NEW_CALL",
      chamadoId,
      title: titulo,
      body: texto,
      prioridade,
      tag,
      url: appUrl
    },
    urgente
  });

  if (resultados.enviadas > 0) {
    await env.PUSH_DEVICES.put(chaveEnviada, new Date().toISOString(), {
      expirationTtl: SENT_TTL_SECONDS
    });
  }

  return {
    ok: true,
    sent: resultados.enviadas,
    failed: resultados.falhas,
    removedInvalidTokens: resultados.removidos,
    registeredDevices: dispositivos.length
  };
}

async function listarDispositivosManutencao(env) {
  const dispositivos = [];
  let cursor = undefined;

  do {
    const pagina = await env.PUSH_DEVICES.list({
      prefix: DEVICE_PREFIX,
      limit: 1000,
      ...(cursor ? { cursor } : {})
    });

    const valores = await Promise.all(
      pagina.keys.map(async chave => {
        const valor = await env.PUSH_DEVICES.get(chave.name, "json");
        return valor && valor.token
          ? { key: chave.name, ...valor }
          : null;
      })
    );

    dispositivos.push(...valores.filter(Boolean));
    cursor = pagina.list_complete ? undefined : pagina.cursor;
  } while (cursor);

  return dispositivos;
}

async function enviarParaDispositivos({ env, acessoGoogle, dispositivos, data, urgente }) {
  let enviadas = 0;
  let falhas = 0;
  let removidos = 0;

  // Pequenos lotes evitam rajadas desnecessárias e são suficientes para a escala do app.
  for (let i = 0; i < dispositivos.length; i += 10) {
    const lote = dispositivos.slice(i, i + 10);

    const respostas = await Promise.all(lote.map(async dispositivo => {
      const resultado = await enviarFcm(env, acessoGoogle, dispositivo.token, data, urgente);

      if (resultado.ok) {
        return { ok: true };
      }

      if (resultado.invalidToken) {
        await env.PUSH_DEVICES.delete(dispositivo.key);
        return { ok: false, removed: true };
      }

      console.warn("Falha FCM:", resultado.status, resultado.error);
      return { ok: false };
    }));

    respostas.forEach(resultado => {
      if (resultado.ok) {
        enviadas += 1;
      } else {
        falhas += 1;
        if (resultado.removed) removidos += 1;
      }
    });
  }

  return { enviadas, falhas, removidos };
}

async function enviarFcm(env, acessoGoogle, token, data, urgente) {
  const endpoint = `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/messages:send`;

  const resposta = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${acessoGoogle}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: {
        token,
        data,
        webpush: {
          headers: {
            Urgency: urgente ? "high" : "normal",
            TTL: "86400"
          }
        }
      }
    })
  });

  if (resposta.ok) {
    return { ok: true };
  }

  let erro = null;

  try {
    erro = await resposta.json();
  } catch (_) {
    erro = { error: { message: await resposta.text() } };
  }

  const textoErro = JSON.stringify(erro || {});
  const invalidToken =
    resposta.status === 404
    || /UNREGISTERED|registration-token-not-registered/i.test(textoErro)
    || (resposta.status === 400 && /invalid.*token/i.test(textoErro));

  return {
    ok: false,
    invalidToken,
    status: resposta.status,
    error: erro
  };
}

async function buscarPerfilUsuario(env, uid, acessoGoogleOpcional = "") {
  if (!uid) return null;

  const acesso = acessoGoogleOpcional || await obterGoogleAccessToken(env);
  return buscarDocumentoFirestore(env, "usuarios", uid, acesso);
}

async function buscarDocumentoFirestore(env, colecao, id, acessoGoogle) {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/${encodeURIComponent(colecao)}/${encodeURIComponent(id)}`;

  const resposta = await fetch(endpoint, {
    headers: {
      "Authorization": `Bearer ${acessoGoogle}`
    }
  });

  if (resposta.status === 404) {
    return null;
  }

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw erroHttp(502, `Firestore REST ${resposta.status}: ${detalhe}`, "Não foi possível consultar os dados para enviar o alerta.");
  }

  const documento = await resposta.json();
  return converterCamposFirestore(documento.fields || {});
}

function converterCamposFirestore(campos) {
  const saida = {};

  Object.entries(campos).forEach(([chave, valor]) => {
    saida[chave] = converterValorFirestore(valor);
  });

  return saida;
}

function converterValorFirestore(valor) {
  if (!valor || typeof valor !== "object") return null;
  if ("stringValue" in valor) return valor.stringValue;
  if ("booleanValue" in valor) return valor.booleanValue;
  if ("integerValue" in valor) return Number(valor.integerValue);
  if ("doubleValue" in valor) return Number(valor.doubleValue);
  if ("timestampValue" in valor) return valor.timestampValue;
  if ("nullValue" in valor) return null;
  if ("referenceValue" in valor) return valor.referenceValue;

  if ("arrayValue" in valor) {
    return (valor.arrayValue.values || []).map(converterValorFirestore);
  }

  if ("mapValue" in valor) {
    return converterCamposFirestore(valor.mapValue.fields || {});
  }

  return null;
}

async function obterGoogleAccessToken(env) {
  const agora = Math.floor(Date.now() / 1000);

  if (
    googleAccessTokenCache.token
    && googleAccessTokenCache.expiresAt > agora + 60
  ) {
    return googleAccessTokenCache.token;
  }

  const assertion = await criarJwtServiceAccount(env, agora);

  const resposta = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  if (!resposta.ok) {
    throw erroHttp(502, `Falha OAuth Google: ${resposta.status} ${await resposta.text()}`, "Não foi possível autenticar o servidor push no Firebase.");
  }

  const dados = await resposta.json();
  googleAccessTokenCache = {
    token: dados.access_token,
    expiresAt: agora + Number(dados.expires_in || 3600)
  };

  return dados.access_token;
}

async function criarJwtServiceAccount(env, agora) {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const payload = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: TOKEN_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: agora,
    exp: agora + 3600
  };

  const parteHeader = base64UrlJson(header);
  const partePayload = base64UrlJson(payload);
  const dados = new TextEncoder().encode(`${parteHeader}.${partePayload}`);
  const chave = await importarChavePrivadaPem(env.FIREBASE_PRIVATE_KEY);

  const assinatura = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    chave,
    dados
  );

  return `${parteHeader}.${partePayload}.${base64UrlBytes(new Uint8Array(assinatura))}`;
}

async function verificarFirebaseIdToken(token, projectId) {
  const partes = String(token || "").split(".");

  if (partes.length !== 3) {
    throw erroHttp(401, "JWT inválido.", "Sessão inválida.");
  }

  const header = decodificarJwtJson(partes[0]);
  const claims = decodificarJwtJson(partes[1]);
  const agora = Math.floor(Date.now() / 1000);

  if (header.alg !== "RS256" || !header.kid) {
    throw erroHttp(401, "Algoritmo/kid inválido.", "Sessão inválida.");
  }

  if (
    claims.aud !== projectId
    || claims.iss !== `https://securetoken.google.com/${projectId}`
    || !claims.sub
    || claims.sub.length > 128
    || Number(claims.exp || 0) <= agora
    || Number(claims.iat || 0) <= 0
    || Number(claims.iat || 0) > agora + 60
    || Number(claims.auth_time || 0) > agora + 60
  ) {
    throw erroHttp(401, "Claims Firebase inválidos.", "Sessão expirada ou inválida.");
  }

  const jwk = await obterJwkFirebase(header.kid);

  if (!jwk) {
    throw erroHttp(401, "Chave pública Firebase não encontrada.", "Não foi possível validar a sessão.");
  }

  const chave = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["verify"]
  );

  const valido = await crypto.subtle.verify(
    { name: "RSASSA-PKCS1-v1_5" },
    chave,
    base64UrlToBytes(partes[2]),
    new TextEncoder().encode(`${partes[0]}.${partes[1]}`)
  );

  if (!valido) {
    throw erroHttp(401, "Assinatura Firebase inválida.", "Sessão inválida.");
  }

  return {
    uid: claims.sub,
    claims
  };
}

async function obterJwkFirebase(kid) {
  const agora = Date.now();

  if (jwksCache.expiresAt <= agora || !jwksCache.keys.length) {
    const resposta = await fetch(FIREBASE_AUTH_JWKS_URL);

    if (!resposta.ok) {
      throw erroHttp(502, "Não foi possível obter as chaves públicas do Firebase Auth.", "Falha temporária ao validar a sessão.");
    }

    const dados = await resposta.json();
    const cacheControl = resposta.headers.get("Cache-Control") || "";
    const maxAge = Number((cacheControl.match(/max-age=(\d+)/i) || [])[1] || 3600);

    jwksCache = {
      keys: Array.isArray(dados.keys) ? dados.keys : [],
      expiresAt: agora + maxAge * 1000
    };
  }

  return jwksCache.keys.find(chave => chave.kid === kid) || null;
}

async function importarChavePrivadaPem(pem) {
  const normalizado = String(pem || "").replace(/\\n/g, "\n");
  const base64 = normalizado
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  if (!base64) {
    throw erroHttp(500, "FIREBASE_PRIVATE_KEY inválida.", "Chave privada do servidor push não configurada corretamente.");
  }

  const binario = Uint8Array.from(atob(base64), caractere => caractere.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binario,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
}

async function sha256Hex(texto) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function montarUrlChamado(appUrl, chamadoId) {
  const base = String(appUrl || "").trim();

  if (!base) return "";

  const url = new URL(base);
  url.searchParams.set("chamado", chamadoId);
  return url.href;
}

function normalizarTexto(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sanitizarIdDocumento(valor) {
  const id = String(valor || "").trim();

  if (!id || id.length > 1500 || id.includes("/")) {
    return "";
  }

  return id;
}

function limitarTexto(valor, limite) {
  return String(valor || "").trim().slice(0, limite);
}

async function lerJson(request) {
  try {
    return await request.json();
  } catch (_) {
    throw erroHttp(400, "JSON inválido.");
  }
}

function erroHttp(status, message, publicMessage = "") {
  const erro = new Error(message);
  erro.status = status;
  erro.publicMessage = publicMessage;
  return erro;
}

function corsResponse(request, env, body, status = 200) {
  const origem = request.headers.get("Origin") || "";
  const permitida = String(env.ALLOWED_ORIGIN || "").trim();
  const ehLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origem);
  const origemResposta = origem && (origem === permitida || ehLocal)
    ? origem
    : permitida || "*";

  const headers = {
    "Access-Control-Allow-Origin": origemResposta,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body ?? {}), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function base64UrlJson(valor) {
  return base64UrlBytes(new TextEncoder().encode(JSON.stringify(valor)));
}

function base64UrlBytes(bytes) {
  let binario = "";

  for (const byte of bytes) {
    binario += String.fromCharCode(byte);
  }

  return btoa(binario)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(valor) {
  let base64 = String(valor || "").replace(/-/g, "+").replace(/_/g, "/");

  while (base64.length % 4) {
    base64 += "=";
  }

  const binario = atob(base64);
  return Uint8Array.from(binario, caractere => caractere.charCodeAt(0));
}

function decodificarJwtJson(valor) {
  try {
    const bytes = base64UrlToBytes(valor);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (_) {
    throw erroHttp(401, "JWT malformado.", "Sessão inválida.");
  }
}

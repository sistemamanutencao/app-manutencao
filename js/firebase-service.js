/* =====================================================
   FIREBASE
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyC48Vz7xsw8Ikzp3yz3QqVFWWPrvp1D3z4",
  authDomain: "app-manutencao-2169f.firebaseapp.com",
  databaseURL: "https://app-manutencao-2169f-default-rtdb.firebaseio.com",
  projectId: "app-manutencao-2169f",
  storageBucket: "app-manutencao-2169f.firebasestorage.app",
  messagingSenderId: "729718839494",
  appId: "1:729718839494:web:d92add8d24aa1e3fc65fc7"
};

let firebaseAuth = null;
let firebaseDb = null;

function inicializarFirebaseServico() {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  firebaseAuth = firebase.auth();
  firebaseDb = firebase.firestore();
}

function observarAutenticacao(callback) {
  return firebaseAuth.onAuthStateChanged(callback);
}

function autenticarUsuario(email, senha) {
  return firebaseAuth.signInWithEmailAndPassword(email, senha);
}

function autenticarColaboradorAnonimo() {
  return firebaseAuth.signInAnonymously();
}

function encerrarSessaoFirebase() {
  return firebaseAuth.signOut();
}

async function buscarPerfilFirebase(uid) {
  const documento = await firebaseDb.collection("usuarios").doc(uid).get();

  if (!documento.exists) {
    return null;
  }

  return {
    id: documento.id,
    ...documento.data()
  };
}

function observarChamadosFirebase(usuario, callback, callbackErro) {
  let consulta = firebaseDb.collection("chamados");

  if (usuario.perfil === "colaborador") {
    consulta = consulta.where("criadoPorUid", "==", usuario.id);
  } else {
    consulta = consulta.orderBy("criadoEm", "desc");
  }

  return consulta.onSnapshot(snapshot => {
    const lista = snapshot.docs.map(documento => normalizarChamadoFirebase(documento));
    callback(ordenarChamadosPorPrioridade(lista));
  }, callbackErro);
}

function observarComunicadosFirebase(callback, callbackErro) {
  return firebaseDb
    .collection("comunicados")
    .orderBy("criadoEm", "desc")
    .onSnapshot(snapshot => {
      const lista = snapshot.docs.map(documento => normalizarComunicadoFirebase(documento));
      callback(lista);
    }, callbackErro);
}

async function criarChamadoFirebase(chamado) {
  const agora = new Date();

  const documento = await firebaseDb.collection("chamados").add({
    ...chamado,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    criadoEmISO: agora.toISOString(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  return documento.id;
}

async function atualizarChamadoFirebase(id, dados) {
  await firebaseDb.collection("chamados").doc(String(id)).update({
    ...dados,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function adicionarItemArrayFirebase(item) {
  return firebase.firestore.FieldValue.arrayUnion(item);
}

async function criarComunicadoFirebase(comunicado) {
  await firebaseDb.collection("comunicados").add({
    ...comunicado,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function excluirComunicadoFirebase(id) {
  await firebaseDb.collection("comunicados").doc(String(id)).delete();
}


function observarNotificacoesFirebase(usuario, callback, callbackErro) {
  let consulta = firebaseDb.collection("notificacoes");

  if (usuario.perfil === "colaborador") {
    consulta = consulta.where("destinatarioUid", "==", usuario.id);
  } else {
    consulta = consulta.where("destinatarioPerfil", "==", "manutencao");
  }

  return consulta.onSnapshot(snapshot => {
    const lista = snapshot.docs.map(documento => normalizarNotificacaoFirebase(documento));
    callback(ordenarNotificacoesPorData(lista));
  }, callbackErro);
}

async function criarNotificacaoFirebase(notificacao) {
  await firebaseDb.collection("notificacoes").add({
    ...notificacao,
    lidaPorUids: Array.isArray(notificacao.lidaPorUids) ? notificacao.lidaPorUids : [],
    criadaEm: firebase.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function marcarNotificacaoComoLidaFirebase(id, uid) {
  await firebaseDb.collection("notificacoes").doc(String(id)).update({
    lidaPorUids: firebase.firestore.FieldValue.arrayUnion(uid),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function normalizarChamadoFirebase(documento) {
  const dados = documento.data();
  const criadoEm = converterTimestampParaData(dados.criadoEm) || new Date(dados.criadoEmISO || Date.now());
  const historico = Array.isArray(dados.historico) ? dados.historico : [];

  const fotos = normalizarFotosChamadoFirebase(dados);

  return {
    id: documento.id,
    descricao: dados.descricao || "Sem descrição",
    local: dados.local || "Não informado",
    setor: dados.setor || "Não informado",
    horario: dados.horario || "Não informado",
    precisaAcompanhamento: dados.precisaAcompanhamento || "Não informado",
    categoria: dados.categoria || "Outros",
    prioridade: dados.prioridade || "Baixa",
    status: dados.status || "ABERTO",
    data: dados.data || criadoEm.toLocaleDateString("pt-BR"),
    criadoEm: dados.criadoEmISO || criadoEm.toISOString(),
    foto: dados.foto || fotos.map(foto => foto.nome).join(", "),
    fotoNome: dados.fotoNome || (fotos[0] ? fotos[0].nome : ""),
    fotoData: dados.fotoData || (fotos[0] ? fotos[0].data : ""),
    fotos,
    fotosFinalizacao: normalizarFotosFinalizacaoChamadoFirebase(dados),
    solicitanteId: dados.solicitanteId || dados.criadoPorUid || "",
    solicitanteNome: dados.solicitanteNome || dados.criadoPorNome || "Não informado",
    solicitanteEmail: dados.solicitanteEmail || dados.criadoPorEmail || "",
    criadoPorUid: dados.criadoPorUid || dados.solicitanteId || "",
    criadoPorNome: dados.criadoPorNome || dados.solicitanteNome || "Não informado",
    criadoPorEmail: dados.criadoPorEmail || dados.solicitanteEmail || "",
    canceladoPorUid: dados.canceladoPorUid || "",
    canceladoPorNome: dados.canceladoPorNome || "",
    canceladoMotivo: dados.canceladoMotivo || "",
    justificativaAguardando: dados.justificativaAguardando || "",
    historico
  };
}

function normalizarFotosChamadoFirebase(dados) {
  const fotos = Array.isArray(dados.fotos)
    ? dados.fotos
        .map(foto => ({
          nome: foto && foto.nome ? String(foto.nome) : "Foto anexada",
          data: foto && foto.data ? String(foto.data) : ""
        }))
        .filter(foto => foto.data.startsWith("data:image"))
    : [];

  if (fotos.length > 0) {
    return fotos;
  }

  if (dados.fotoData && String(dados.fotoData).startsWith("data:image")) {
    return [
      {
        nome: dados.fotoNome || dados.foto || "Foto anexada",
        data: dados.fotoData
      }
    ];
  }

  return [];
}

function normalizarFotosFinalizacaoChamadoFirebase(dados) {
  if (!Array.isArray(dados.fotosFinalizacao)) {
    return [];
  }

  return dados.fotosFinalizacao
    .map(foto => ({
      nome: foto && foto.nome ? String(foto.nome) : "Foto de finalização",
      data: foto && foto.data ? String(foto.data) : "",
      adicionadaEm: foto && foto.adicionadaEm ? String(foto.adicionadaEm) : ""
    }))
    .filter(foto => foto.data.startsWith("data:image"));
}

function normalizarComunicadoFirebase(documento) {
  const dados = documento.data();
  const criadoEm = converterTimestampParaData(dados.criadoEm) || new Date();

  return {
    id: documento.id,
    titulo: dados.titulo || "Sem título",
    texto: dados.texto || "",
    origem: dados.origem || "Manutenção",
    data: dados.data || criadoEm.toLocaleDateString("pt-BR"),
    autor: dados.autor || "Não informado"
  };
}



function normalizarNotificacaoFirebase(documento) {
  const dados = documento.data();
  const criadaEm = converterTimestampParaData(dados.criadaEm) || new Date(dados.criadaEmISO || Date.now());

  return {
    id: documento.id,
    titulo: dados.titulo || "Notificação",
    mensagem: dados.mensagem || "",
    tipo: dados.tipo || "info",
    chamadoId: dados.chamadoId || "",
    chamadoDescricao: dados.chamadoDescricao || "",
    destinatarioUid: dados.destinatarioUid || "",
    destinatarioPerfil: dados.destinatarioPerfil || "",
    criadaPorUid: dados.criadaPorUid || "",
    criadaPorNome: dados.criadaPorNome || "Sistema",
    criadaPorPerfil: dados.criadaPorPerfil || "",
    criadaEmISO: dados.criadaEmISO || criadaEm.toISOString(),
    data: criadaEm.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    lidaPorUids: Array.isArray(dados.lidaPorUids) ? dados.lidaPorUids : []
  };
}

function ordenarNotificacoesPorData(lista) {
  return lista.sort((a, b) => {
    return new Date(b.criadaEmISO).getTime() - new Date(a.criadaEmISO).getTime();
  });
}

function converterTimestampParaData(valor) {
  if (!valor) {
    return null;
  }

  if (typeof valor.toDate === "function") {
    return valor.toDate();
  }

  const data = new Date(valor);

  return Number.isNaN(data.getTime()) ? null : data;
}

/* =====================================================
   FIREBASE SERVICE - CAMADA DE ACESSO AO FIREBASE

   Responsabilidades:
   - inicializar Firebase/Auth/Firestore;
   - autenticar usuários;
   - ler e gravar chamados, notificações, comunicados, ativos,
     preventivas e diagnósticos;
   - manter listeners em tempo real.

   Atenção:
   - arquivo de alto risco;
   - qualquer mudança pode afetar permissões, persistência e regras Firestore.
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

/* =====================
   Inicialização Firebase
===================== */

function inicializarFirebaseServico() {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  firebaseAuth = firebase.auth();
  firebaseDb = firebase.firestore();
}

/* =====================
   Autenticação
===================== */

function observarAutenticacao(callback) {
  return firebaseAuth.onAuthStateChanged(callback);
}

function autenticarUsuario(email, senha) {
  return firebaseAuth.signInWithEmailAndPassword(email, senha);
}

function solicitarRedefinicaoSenhaUsuario(email) {
  return firebaseAuth.sendPasswordResetEmail(email);
}

function autenticarColaboradorAnonimo() {
  return firebaseAuth.signInAnonymously();
}

function encerrarSessaoFirebase() {
  return firebaseAuth.signOut();
}

async function registrarVinculoColaboradorFirebase(codigoColaborador, dados = {}) {
  if (!codigoColaborador || !firebaseAuth.currentUser) {
    return;
  }

  const referencia = firebaseDb.collection(COLLECTIONS.COLABORADORES || "colaboradores").doc(codigoColaborador);
  const agora = new Date().toISOString();

  await referencia.set({
    codigo: codigoColaborador,
    nome: dados.nome || "",
    setor: dados.setor || "",
    uidsAutorizados: firebase.firestore.FieldValue.arrayUnion(firebaseAuth.currentUser.uid),
    atualizadoEm: agora,
    criadoEm: agora
  }, { merge: true });
}

async function buscarPerfilFirebase(uid) {
  const documento = await firebaseDb.collection(COLLECTIONS.USUARIOS).doc(uid).get();

  if (!documento.exists) {
    return null;
  }

  return {
    id: documento.id,
    ...documento.data()
  };
}

/* =====================
   Inventário da unidade
===================== */

function observarInventarioItensFirebase(callback, callbackErro) {
  return firebaseDb
    .collection(COLLECTIONS.INVENTARIO_ITENS || "inventarioItens")
    .onSnapshot(snapshot => {
      const itens = {};

      snapshot.docs.forEach(documento => {
        const dados = documento.data() || {};
        itens[documento.id] = {
          estoque: dados.estoque === null || dados.estoque === undefined
            ? null
            : Math.max(0, Number(dados.estoque) || 0),
          imagem: typeof dados.imagem === "string" && dados.imagem.startsWith("data:image/")
            ? dados.imagem
            : "",
          atualizadoEm: dados.atualizadoEm || null,
          atualizadoPorUid: dados.atualizadoPorUid || "",
          atualizadoPorNome: dados.atualizadoPorNome || ""
        };
      });

      callback(itens);
    }, callbackErro);
}

async function salvarItemInventarioFirebase(itemId, dados = {}) {
  if (!firebaseAuth.currentUser) {
    throw new Error("Sessão não autenticada. Entre novamente para salvar o inventário.");
  }

  const estoque = dados.estoque === null || dados.estoque === undefined || dados.estoque === ""
    ? null
    : Math.max(0, Number.parseInt(dados.estoque, 10) || 0);
  const imagem = typeof dados.imagem === "string" && dados.imagem.startsWith("data:image/")
    ? dados.imagem
    : "";

  await firebaseDb
    .collection(COLLECTIONS.INVENTARIO_ITENS || "inventarioItens")
    .doc(String(itemId))
    .set({
      estoque,
      imagem,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoPorUid: firebaseAuth.currentUser.uid,
      atualizadoPorNome: usuarioAtual && usuarioAtual.nome ? usuarioAtual.nome : "Manutenção"
    }, { merge: true });
}

/* =====================
   Chamados
===================== */

function observarChamadosFirebase(usuario, callback, callbackErro) {
  const colecaoChamados = firebaseDb.collection(COLLECTIONS.CHAMADOS);

  if (perfilPode(usuario.perfil, PERMISSOES_APP.VER_TODAS_OS)) {
    return colecaoChamados
      .orderBy("criadoEm", "desc")
      .onSnapshot(snapshot => {
        const lista = snapshot.docs.map(documento => normalizarChamadoFirebase(documento));
        callback(ordenarChamadosPorPrioridade(lista));
      }, callbackErro);
  }

  const consultasColaborador = [];

  // IMPORTANTE: após reforçar as regras do Firestore, o colaborador só pode ler
  // documentos cuja autoria esteja vinculada ao UID autenticado.
  // Consultas por colaboradorChave/colaboradorLocalId foram removidas porque esses
  // campos são locais e não provam, nas regras, que o documento pertence ao usuário.
  if (usuario.id) {
    consultasColaborador.push(colecaoChamados.where("criadoPorUid", "==", usuario.id));
    consultasColaborador.push(colecaoChamados.where("solicitanteId", "==", usuario.id));
  }

  if (usuario.colaboradorCodigo || usuario.colaboradorLocalId) {
    consultasColaborador.push(colecaoChamados.where("colaboradorCodigo", "==", usuario.colaboradorCodigo || usuario.colaboradorLocalId));
  }

  if (!consultasColaborador.length) {
    callback([]);
    return function cancelarObservacaoVazia() {};
  }

  const chamadosPorId = new Map();
  const publicarListaColaborador = () => {
    callback(ordenarChamadosPorPrioridade(Array.from(chamadosPorId.values())));
  };

  const canceladores = consultasColaborador.map(consulta => consulta.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(alteracao => {
      const id = alteracao.doc.id;

      if (alteracao.type === "removed") {
        chamadosPorId.delete(id);
        return;
      }

      chamadosPorId.set(id, normalizarChamadoFirebase(alteracao.doc));
    });

    publicarListaColaborador();
  }, callbackErro));

  return function cancelarObservacaoChamadosColaborador() {
    canceladores.forEach(cancelar => cancelar());
  };
}

/* =====================
   Ativos
===================== */

function observarAtivosFirebase(callback, callbackErro) {
  return firebaseDb
    .collection(COLLECTIONS.ATIVOS)
    .orderBy("codigo", "asc")
    .onSnapshot(snapshot => {
      const lista = snapshot.docs.map(documento => normalizarAtivoFirebase(documento));
      callback(lista);
    }, callbackErro);
}

async function criarAtivoFirebase(ativo) {
  await firebaseDb.collection(COLLECTIONS.ATIVOS).add({
    ...ativo,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function excluirAtivoFirebase(id) {
  await firebaseDb.collection(COLLECTIONS.ATIVOS).doc(String(id)).delete();
}

function normalizarAtivoFirebase(documento) {
  const dados = documento.data();

  return {
    id: documento.id,
    codigo: dados.codigo || documento.id,
    nome: dados.nome || "Ativo sem nome",
    localizacao: dados.localizacao || dados.local || "Não informado",
    categoria: dados.categoria || "Equipamento",
    criticidade: dados.criticidade || "Baixa",
    categoriaManutencao: dados.categoriaManutencao || "",
    observacoes: dados.observacoes || "",
    ativo: dados.ativo !== false,
    criadoPorUid: dados.criadoPorUid || "",
    criadoPorNome: dados.criadoPorNome || ""
  };
}


/* =====================
   Preventivas
===================== */

function observarPlanosPreventivosFirebase(callback, callbackErro) {
  return firebaseDb
    .collection(COLLECTIONS.PREVENTIVAS)
    .orderBy("proximaExecucaoISO", "asc")
    .onSnapshot(snapshot => {
      const lista = snapshot.docs.map(documento => normalizarPlanoPreventivoFirebase(documento));
      callback(lista);
    }, callbackErro);
}

async function criarPlanoPreventivoFirebase(plano) {
  await firebaseDb.collection(COLLECTIONS.PREVENTIVAS).add({
    ...plano,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function atualizarPlanoPreventivoFirebase(id, dados) {
  await firebaseDb.collection(COLLECTIONS.PREVENTIVAS).doc(String(id)).update({
    ...dados,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function excluirPlanoPreventivoFirebase(id) {
  await firebaseDb.collection(COLLECTIONS.PREVENTIVAS).doc(String(id)).delete();
}

function normalizarPlanoPreventivoFirebase(documento) {
  const dados = documento.data();

  return {
    id: documento.id,
    ativoCodigo: dados.ativoCodigo || dados.equipamentoCodigo || "",
    nome: dados.nome || "Preventiva sem nome",
    localizacao: dados.localizacao || dados.local || "Não informado",
    categoria: dados.categoria || "",
    subcategoria: dados.subcategoria || "",
    checklist: Array.isArray(dados.checklist) ? dados.checklist : [],
    responsavelPadrao: dados.responsavelPadrao || "Equipe de manutenção",
    quantidadeFrequencia: Number(dados.quantidadeFrequencia || 0),
    unidadeFrequencia: dados.unidadeFrequencia || "",
    frequenciaDias: Number(dados.frequenciaDias || 30),
    proximaExecucaoISO: dados.proximaExecucaoISO || new Date().toISOString(),
    ultimaExecucaoISO: dados.ultimaExecucaoISO || "",
    ultimaRealizacaoTipo: dados.ultimaRealizacaoTipo || "",
    ultimaRealizacaoPorUid: dados.ultimaRealizacaoPorUid || "",
    ultimaRealizacaoPorNome: dados.ultimaRealizacaoPorNome || "",
    ultimaRealizacaoObservacao: dados.ultimaRealizacaoObservacao || "",
    historicoRealizacoes: Array.isArray(dados.historicoRealizacoes) ? dados.historicoRealizacoes : [],
    observacoes: dados.observacoes || "",
    ultimaOS: dados.ultimaOS || "",
    ultimaOSId: dados.ultimaOSId || "",
    ativo: dados.ativo !== false,
    criadoPorUid: dados.criadoPorUid || "",
    criadoPorNome: dados.criadoPorNome || ""
  };
}


/* =====================
   Diagnóstico
===================== */

function observarDiagnosticosFirebase(callback, callbackErro) {
  return firebaseDb
    .collection(COLLECTIONS.DIAGNOSTICOS || "diagnosticos")
    .orderBy("criadoEm", "desc")
    .onSnapshot(snapshot => {
      const lista = snapshot.docs.map(documento => normalizarDiagnosticoFirebase(documento));
      callback(lista);
    }, callbackErro);
}

async function criarDiagnosticoFirebase(diagnostico) {
  await firebaseDb.collection(COLLECTIONS.DIAGNOSTICOS || "diagnosticos").add({
    ...diagnostico,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function atualizarDiagnosticoFirebase(id, dados) {
  await firebaseDb.collection(COLLECTIONS.DIAGNOSTICOS || "diagnosticos").doc(String(id)).update({
    ...dados,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function excluirDiagnosticoFirebase(id) {
  await firebaseDb.collection(COLLECTIONS.DIAGNOSTICOS || "diagnosticos").doc(String(id)).delete();
}

function normalizarDiagnosticoFirebase(documento) {
  const dados = documento.data() || {};

  return {
    id: documento.id,
    local: dados.local || "",
    sistema: dados.sistema || "",
    tipo: dados.tipo || "Inspeção",
    prioridade: dados.prioridade || "P3 - Normal",
    status: dados.status || "Pendente",
    descricao: dados.descricao || "",
    risco: dados.risco || "",
    acao: dados.acao || "",
    material: dados.material || "",
    data: dados.data || "",
    unidade: dados.unidade || "Senac Campo Mourão",
    criadoEmISO: dados.criadoEmISO || "",
    criadoPorUid: dados.criadoPorUid || "",
    criadoPorNome: dados.criadoPorNome || "",
    resolvidoEmISO: dados.resolvidoEmISO || "",
    resolvidoPorUid: dados.resolvidoPorUid || "",
    resolvidoPorNome: dados.resolvidoPorNome || ""
  };
}

/* =====================
   Comunicados
===================== */

function observarComunicadosFirebase(callback, callbackErro) {
  return firebaseDb
    .collection(COLLECTIONS.COMUNICADOS)
    .orderBy("criadoEm", "desc")
    .onSnapshot(snapshot => {
      const lista = snapshot.docs.map(documento => normalizarComunicadoFirebase(documento));
      callback(lista);
    }, callbackErro);
}

async function criarChamadoFirebase(chamado) {
  const agora = new Date();
  const chamadoComData = {
    ...chamado,
    criadoEmISO: chamado.criadoEmISO || agora.toISOString()
  };
  const camposSLA = typeof montarCamposSLAChamado === "function"
    ? montarCamposSLAChamado(chamadoComData, agora)
    : {};
  const historicoOriginal = Array.isArray(chamado.historico) ? chamado.historico : [];
  const itemHistoricoSLA = camposSLA.vencimentoSLAISO ? {
    data: agora.toLocaleString("pt-BR"),
    acao: "Prazo da OS definido",
    descricao: `Prazo inicial definido pela prioridade ${camposSLA.slaBasePrioridade || chamado.prioridade || "Baixa"}: ${camposSLA.prazoHoras}h. Vencimento: ${formatarDataHoraBR(camposSLA.vencimentoSLAISO)}.`
  } : null;

  const documento = await firebaseDb.collection(COLLECTIONS.CHAMADOS).add({
    ...chamadoComData,
    ...camposSLA,
    slaCriadoEmISO: agora.toISOString(),
    historico: itemHistoricoSLA ? [...historicoOriginal, itemHistoricoSLA] : historicoOriginal,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });

  return documento.id;
}

async function atualizarChamadoFirebase(id, dados) {
  await firebaseDb.collection(COLLECTIONS.CHAMADOS).doc(String(id)).update({
    ...dados,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function adicionarItemArrayFirebase(item) {
  return firebase.firestore.FieldValue.arrayUnion(item);
}

async function criarComunicadoFirebase(comunicado) {
  const agora = new Date();

  await firebaseDb.collection(COLLECTIONS.COMUNICADOS).add({
    ...comunicado,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    criadoEmISO: agora.toISOString(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function atualizarComunicadoFirebase(id, dados) {
  await firebaseDb.collection(COLLECTIONS.COMUNICADOS).doc(String(id)).update({
    ...dados,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function excluirComunicadoFirebase(id) {
  await firebaseDb.collection(COLLECTIONS.COMUNICADOS).doc(String(id)).delete();
}


/* =====================
   Notificações
===================== */

function observarNotificacoesFirebase(usuario, callback, callbackErro) {
  let consulta = firebaseDb.collection(COLLECTIONS.NOTIFICACOES);

  if (usuario && normalizarPerfilUsuario(usuario.perfil) === PERFIS_USUARIO.MANUTENCAO) {
    consulta = consulta.where("destinatarioPerfil", "==", PERFIS_USUARIO.MANUTENCAO);
  } else {
    consulta = consulta.where("destinatarioUid", "==", usuario.id);
  }

  return consulta.onSnapshot(snapshot => {
    const lista = snapshot.docs.map(documento => normalizarNotificacaoFirebase(documento));
    callback(ordenarNotificacoesPorData(lista));
  }, callbackErro);
}

async function criarNotificacaoFirebase(notificacao) {
  await firebaseDb.collection(COLLECTIONS.NOTIFICACOES).add({
    ...notificacao,
    lidaPorUids: Array.isArray(notificacao.lidaPorUids) ? notificacao.lidaPorUids : [],
    criadaEm: firebase.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function marcarNotificacaoComoLidaFirebase(id, uid) {
  await firebaseDb.collection(COLLECTIONS.NOTIFICACOES).doc(String(id)).update({
    lidaPorUids: firebase.firestore.FieldValue.arrayUnion(uid),
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

/* =====================
   Normalização de dados Firestore
===================== */

function normalizarChamadoFirebase(documento) {
  const dados = documento.data();
  const criadoEm = converterTimestampParaData(dados.criadoEm) || new Date(dados.criadoEmISO || Date.now());
  const historico = Array.isArray(dados.historico) ? dados.historico : [];

  const fotos = normalizarFotosChamadoFirebase(dados);

  return {
    id: documento.id,
    descricao: dados.descricao || "Sem descrição",
    numeroOS: dados.numeroOS || dados.codigoOS || `OS-${documento.id.slice(0, 6).toUpperCase()}`,
    tipoRegistro: dados.tipoRegistro || "OS",
    etapaFluxo: dados.etapaFluxo || obterEtapaFluxoPorStatus(dados.status || "ABERTO"),
    responsavelManutencao: dados.responsavelManutencao || "A definir",
    iniciadoEmISO: dados.iniciadoEmISO || "",
    concluidoEmISO: dados.concluidoEmISO || "",
    validadoEmISO: dados.validadoEmISO || "",
    validadoPorNome: dados.validadoPorNome || "",
    validacaoObservacao: dados.validacaoObservacao || "",
    encerradoEmISO: dados.encerradoEmISO || "",
    encerradoPorNome: dados.encerradoPorNome || "",
    local: dados.local || "Não informado",
    equipamentoCodigo: dados.equipamentoCodigo || dados.equipamento || dados.patrimonio || "",
    equipamentoNome: dados.equipamentoNome || "",
    andar: dados.andar || "",
    setor: dados.setor || "Manutenção",
    horario: dados.horario || "Não informado",
    precisaAcompanhamento: dados.precisaAcompanhamento || "Não informado",
    categoria: dados.categoria || "Outros",
    subcategoria: dados.subcategoria || "",
    tipoManutencao: dados.tipoManutencao || "Corretiva",
    prioridade: dados.prioridade || "Baixa",
    status: dados.status || "ABERTO",
    data: dados.data || criadoEm.toLocaleDateString("pt-BR"),
    criadoEm: dados.criadoEmISO || criadoEm.toISOString(),
    criadoEmISO: dados.criadoEmISO || criadoEm.toISOString(),
    prazoHoras: typeof dados.prazoHoras === "number" ? dados.prazoHoras : obterPrazoHoras(dados.prioridade || "Baixa"),
    vencimentoSLAISO: dados.vencimentoSLAISO || calcularVencimentoChamado({
      criadoEmISO: dados.criadoEmISO || criadoEm.toISOString(),
      data: dados.data || criadoEm.toLocaleDateString("pt-BR"),
      prioridade: dados.prioridade || "Baixa"
    }).toISOString(),
    slaBasePrioridade: dados.slaBasePrioridade || dados.prioridade || "Baixa",
    slaStatusAtual: dados.slaStatusAtual || calcularStatusSLAOperacional({
      status: dados.status || "ABERTO",
      vencimentoSLAISO: dados.vencimentoSLAISO || calcularVencimentoChamado({
        criadoEmISO: dados.criadoEmISO || criadoEm.toISOString(),
        data: dados.data || criadoEm.toLocaleDateString("pt-BR"),
        prioridade: dados.prioridade || "Baixa"
      }).toISOString()
    }),
    slaStatusFinal: dados.slaStatusFinal || "",
    slaCriadoEmISO: dados.slaCriadoEmISO || "",
    slaRecalculadoEmISO: dados.slaRecalculadoEmISO || "",
    slaFinalizadoEmISO: dados.slaFinalizadoEmISO || "",
    tempoConclusaoHoras: typeof dados.tempoConclusaoHoras === "number" ? dados.tempoConclusaoHoras : null,
    concluidoNoPrazo: typeof dados.concluidoNoPrazo === "boolean" ? dados.concluidoNoPrazo : null,
    foto: dados.foto || fotos.map(foto => foto.nome).join(", "),
    fotoNome: dados.fotoNome || (fotos[0] ? fotos[0].nome : ""),
    fotoData: dados.fotoData || (fotos[0] ? fotos[0].data : ""),
    fotos,
    fotosFinalizacao: normalizarFotosFinalizacaoChamadoFirebase(dados),
    criadoPorUid: dados.criadoPorUid || "",
    criadoPorNome: dados.criadoPorNome || "Não informado",
    criadoPorEmail: dados.criadoPorEmail || "",
    colaboradorLocalId: dados.colaboradorLocalId || "",
    colaboradorCodigo: dados.colaboradorCodigo || dados.colaboradorLocalId || "",
    colaboradorChave: dados.colaboradorChave || "",
    criadoPorColaboradorId: dados.criadoPorColaboradorId || dados.colaboradorCodigo || dados.colaboradorLocalId || dados.colaboradorChave || "",
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

function obterEtapaFluxoPorStatus(status) {
  const etapas = {
    "ABERTO": "Solicitação registrada",
    "EM ANDAMENTO": "Execução",
    "AGUARDANDO": "Aguardando material / validação",
    "CONCLUÍDO": "Aguardando validação",
    "VALIDADO": "Validação",
    "ENCERRADO": "Encerrado e auditado",
    "CANCELADO": "Cancelado"
  };

  return etapas[status] || "Triagem";
}

function normalizarComunicadoFirebase(documento) {
  const dados = documento.data() || {};
  const criadoEm = converterTimestampParaData(dados.criadoEm) || new Date(dados.criadoEmISO || Date.now());
  const atualizadoEm = converterTimestampParaData(dados.atualizadoEm) || criadoEm;

  return {
    id: documento.id,
    titulo: dados.titulo || "Sem título",
    texto: dados.texto || "",
    origem: dados.origem || "Manutenção",
    nivel: dados.nivel || "normal",
    data: dados.data || criadoEm.toLocaleDateString("pt-BR"),
    autor: dados.autor || "Não informado",
    autorUid: dados.autorUid || "",
    criadoEmISO: dados.criadoEmISO || criadoEm.toISOString(),
    editadoPor: dados.editadoPor || "",
    editadoPorUid: dados.editadoPorUid || "",
    editadoEmISO: dados.editadoEmISO || "",
    atualizadoEmISO: atualizadoEm.toISOString()
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

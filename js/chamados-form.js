/* =====================================================
   CHAMADOS FORM - FORMULÁRIO E MONTAGEM DA OS

   Responsabilidades:
   - localizar campos do formulário de abertura de OS;
   - ler, validar e normalizar valores informados;
   - montar objeto de chamado antes da gravação;
   - limpar campos após envio.

   Atenção:
   - depende diretamente dos IDs existentes no index.html.
===================================================== */

/* =====================
   Leitura dos campos do formulário
===================== */

function obterCamposFormularioChamado() {
  const campos = {
    andar: document.getElementById("andarChamado"),
    local: document.getElementById("localChamado"),
    categoria: document.getElementById("categoriaChamado"),
    subcategoria: document.getElementById("subcategoriaChamado"),
    tipoManutencao: document.getElementById("tipoManutencaoChamado"),
    prioridade: document.getElementById("prioridadeChamado"),
    descricao: document.getElementById("descricaoChamado"),
    foto: document.getElementById("fotoChamado")
  };

  const obrigatorios = ["andar", "local", "categoria", "subcategoria", "prioridade", "descricao"];
  const ausentes = obrigatorios.filter(nome => !campos[nome]);

  return {
    ...campos,
    ausentes,
    formularioValido: ausentes.length === 0
  };
}

function lerValoresFormularioChamado(campos) {
  return {
    andar: obterValorCampoChamado(campos.andar),
    local: obterValorCampoChamado(campos.local),
    equipamentoCodigo: "",
    equipamentoNome: "",
    horario: "Não informado",
    precisaAcompanhamento: "Não informado",
    categoria: obterValorCampoChamado(campos.categoria),
    subcategoria: obterValorCampoChamado(campos.subcategoria),
    tipoManutencao: obterValorCampoChamado(campos.tipoManutencao) || "Corretiva",
    prioridade: obterValorCampoChamado(campos.prioridade),
    descricao: obterValorCampoChamado(campos.descricao),
    arquivosFotos: obterArquivosFotosChamado(campos.foto)
  };
}

function obterValorCampoChamado(campo) {
  if (!campo) return "";
  return String(campo.value || "").trim();
}

/* =====================
   Validação da OS
===================== */

function validarValoresFormularioChamado(valores) {
  const regras = [
    ["Escolher o andar", valores.andar],
    ["Local do andar", valores.local],
    ["Categoria da OS", valores.categoria],
    ["Subcategoria", valores.subcategoria],
    ["Prioridade", valores.prioridade],
    ["Descrição da solicitação", valores.descricao]
  ];

  return regras
    .filter(([, valor]) => !valor)
    .map(([nome]) => nome);
}

function marcarCamposObrigatoriosChamado(campos, camposPendentes) {
  const mapa = {
    "Escolher o andar": campos.andar,
    "Local do andar": campos.local,
    "Categoria da OS": campos.categoria,
    "Subcategoria": campos.subcategoria,
    "Prioridade": campos.prioridade,
    "Descrição da solicitação": campos.descricao
  };

  Object.values(mapa).forEach(campo => {
    if (campo) {
      campo.classList.remove("campo-obrigatorio-pendente");
      campo.removeAttribute("aria-invalid");
    }
  });

  camposPendentes.forEach(nome => {
    const campo = mapa[nome];
    if (campo) {
      campo.classList.add("campo-obrigatorio-pendente");
      campo.setAttribute("aria-invalid", "true");
    }
  });
}

/* =====================
   Montagem do objeto de OS
===================== */

function montarObjetoChamado({ numeroOS, dataAtual, valores, fotosAnexadas, fotoPrincipal }) {
  const usuario = usuarioAtual || {};
  const usuarioFirebase = firebaseAuth && firebaseAuth.currentUser ? firebaseAuth.currentUser : null;
  const criadoPorNome = usuario.nome || (usuarioFirebase && usuarioFirebase.displayName) || "Colaborador";
  const criadoPorId = usuario.id || (usuarioFirebase && usuarioFirebase.uid) || "";
  const criadoPorEmail = usuario.email || (usuarioFirebase && usuarioFirebase.email) || "";
  const colaboradorLocalId = usuario.colaboradorLocalId || (typeof obterIdColaboradorLocal === "function" ? obterIdColaboradorLocal() : "");
  const colaboradorCodigo = usuario.colaboradorCodigo || colaboradorLocalId;
  const colaboradorChave = usuario.colaboradorChave || (typeof obterChaveColaboradorLocal === "function" ? obterChaveColaboradorLocal() : "");

  if (!criadoPorId) {
    throw new Error("Usuário autenticado não identificado para registrar a OS.");
  }

  const tecnicoResponsavel = typeof obterTecnicoResponsavelPadrao === "function"
    ? obterTecnicoResponsavelPadrao()
    : {
        nome: "Equipe de manutenção",
        funcao: "Responsável a definir",
        setor: "Manutenção",
        ativo: false
      };

  const logInicial = typeof gerarLogOS === "function"
    ? gerarLogOS({
        acao: "OS criada",
        descricao: `${numeroOS} criada por ${criadoPorNome}.`,
        usuario: criadoPorNome
      })
    : null;

  return {
    numeroOS,
    tipoRegistro: "OS",
    etapaFluxo: "Solicitação registrada",
    responsavelManutencao: "A definir",
    tecnicoResponsavel,
    iniciadoEmISO: "",
    concluidoEmISO: "",
    validadoEmISO: "",
    descricao: valores.descricao,
    andar: valores.andar,
    local: valores.local,
    equipamentoCodigo: valores.equipamentoCodigo,
    equipamentoNome: valores.equipamentoNome,
    setor: usuario.setor || "Não informado",
    horario: valores.horario,
    precisaAcompanhamento: valores.precisaAcompanhamento,
    categoria: valores.categoria,
    subcategoria: valores.subcategoria,
    tipoManutencao: valores.tipoManutencao,
    prioridade: valores.prioridade,
    status: "ABERTO",
    data: dataAtual,
    foto: fotosAnexadas.map(foto => foto.nome).join(", "),
    fotoNome: fotoPrincipal ? fotoPrincipal.nome : "",
    fotoData: fotoPrincipal ? fotoPrincipal.data : "",
    fotos: fotosAnexadas,
    criadoPorUid: criadoPorId,
    criadoPorNome,
    criadoPorEmail,
    colaboradorLocalId,
    colaboradorCodigo,
    colaboradorChave,
    criadoPorColaboradorId: colaboradorCodigo || colaboradorChave || colaboradorLocalId || criadoPorId,
    criadoPorPerfil: usuario.perfil || "",
    // Campos internos de compatibilidade com regras antigas do Firestore.
    // O campo manual de solicitante foi removido da interface; estes valores seguem o usuário autenticado.
    solicitanteId: criadoPorId,
    solicitanteNome: criadoPorNome,
    solicitanteEmail: criadoPorEmail,
    justificativaAguardando: "",
    logs: logInicial ? [logInicial] : [],
    historico: [
      {
        data: dataAtual,
        acao: "OS aberta",
        descricao: `${numeroOS} registrada por ${criadoPorNome}. Local: ${valores.andar} / ${valores.local}. Categoria: ${valores.categoria} / ${valores.subcategoria}.`
      }
    ]
  };
}


function obterArquivosFotosChamado(fotoInput) {
  if (!fotoInput || !fotoInput.files) {
    return [];
  }

  return Array.from(fotoInput.files).filter(arquivo => {
    return arquivo && String(arquivo.type || "").startsWith("image/");
  });
}

async function converterArquivosFotosChamado(arquivos) {
  const fotos = [];
  let falhas = 0;

  for (const arquivo of arquivos) {
    try {
      const data = await converterFotoParaBase64(arquivo);
      fotos.push({
        nome: arquivo.name,
        data
      });
    } catch (erro) {
      falhas += 1;
      console.warn("Não foi possível converter uma imagem do chamado:", erro);
    }
  }

  return { fotos, falhas };
}


function gerarNumeroOS(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  const segundo = String(data.getSeconds()).padStart(2, "0");

  return `OS-${ano}${mes}${dia}-${hora}${minuto}${segundo}`;
}

/* =====================
   Limpeza do formulário
===================== */

function limparFormularioChamado() {
  const campos = [
    "andarChamado",
    "localChamado",
    "categoriaChamado",
    "subcategoriaChamado",
    "tipoManutencaoChamado",
    "descricaoChamado",
    "fotoChamado"
  ];

  campos.forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = "";
    }
  });

  if (typeof atualizarSubcategoriasChamado === "function") {
    atualizarSubcategoriasChamado("");
  }

  if (typeof atualizarLocaisPorAndarManutencao === "function") {
    atualizarLocaisPorAndarManutencao();
  }

  const prioridadeInput = document.getElementById("prioridadeChamado");

  if (prioridadeInput) {
    prioridadeInput.value = "";
  }

  document.querySelectorAll(".category-fast-button").forEach(botao => {
    botao.classList.remove("active");
  });

  document.querySelectorAll(".campo-obrigatorio-pendente").forEach(campo => {
    campo.classList.remove("campo-obrigatorio-pendente");
    campo.removeAttribute("aria-invalid");
  });
}

function prepararAbaChamadosAposEnvio() {
  filtroStatusAtual = "TODOS";
  termoBuscaChamados = "";

  const buscaChamados = document.getElementById("buscaChamados") || document.getElementById("buscaOS");

  if (buscaChamados) {
    buscaChamados.value = "";
  }

  const filtros = document.querySelectorAll("#filtrosChamados .filter, #filtrosOS .filter");

  filtros.forEach(botao => {
    botao.classList.remove("active");
  });

  if (filtros[0]) {
    filtros[0].classList.add("active");
  }
}


/* =====================================================
   DIAGNÓSTICO INICIAL DA MANUTENÇÃO
===================================================== */

function renderizarDiagnosticosManutencao() {
  const lista = document.getElementById("listaDiagnosticosManutencao");

  if (!lista) {
    return;
  }

  atualizarResumoDiagnosticoManutencao();

  const itens = filtrarDiagnosticosManutencao([...diagnosticosManutencao]);

  lista.innerHTML = itens.length > 0
    ? itens.map(criarCardDiagnosticoManutencao).join("")
    : criarMensagemVazia("Nenhum item de diagnóstico encontrado", "Registre os pontos levantados na inspeção inicial da unidade.");
}

function atualizarResumoDiagnosticoManutencao() {
  const pendentes = diagnosticosManutencao.filter(item => item.status !== "OS_GERADA");
  const comOS = diagnosticosManutencao.filter(item => item.status === "OS_GERADA");
  const criticos = diagnosticosManutencao.filter(item => ["Alta", "Urgente"].includes(item.prioridade));

  setTextContent("totalDiagnosticosPendentes", pendentes.length);
  setTextContent("totalDiagnosticosComOS", comOS.length);
  setTextContent("totalDiagnosticosCriticos", criticos.length);
  setTextContent("totalDiagnosticosRegistrados", diagnosticosManutencao.length);
}

function filtrarDiagnosticosManutencao(itens) {
  const filtro = document.getElementById("filtroStatusDiagnosticoManutencao")?.value || "TODOS";
  const busca = removerAcentos((document.getElementById("buscaDiagnosticoManutencao")?.value || "").toLowerCase());

  return itens
    .filter(item => {
      const passaStatus = filtro === "TODOS" || item.status === filtro;
      const texto = removerAcentos([
        item.ambiente,
        item.andar,
        item.local,
        item.categoria,
        item.tipoManutencao,
        item.prioridade,
        item.item,
        item.situacao,
        item.observacao,
        item.osGeradaNumero
      ].join(" ").toLowerCase());

      return passaStatus && (!busca || texto.includes(busca));
    })
    .sort((a, b) => obterPesoPrioridadeDiagnosticoManutencao(b.prioridade) - obterPesoPrioridadeDiagnosticoManutencao(a.prioridade));
}

function criarCardDiagnosticoManutencao(item) {
  const osTexto = item.osGeradaNumero ? `OS gerada: ${escaparHTML(item.osGeradaNumero)}` : "Sem OS gerada";
  const podeGerarOS = usuarioEhManutencaoAutorizada() && item.status !== "OS_GERADA";

  return `
    <div class="diagnostico-card">
      <div class="diagnostico-card-header">
        <div>
          <h3>${escaparHTML(item.item)}</h3>
          <p>${escaparHTML(item.andar || "Sem andar")} • ${escaparHTML(item.local || item.ambiente)} • ${escaparHTML(item.categoria)} • ${escaparHTML(item.tipoManutencao)}</p>
        </div>
        <span class="status ${item.status === "OS_GERADA" ? "status-green" : "status-blue"}">${escaparHTML(item.status === "OS_GERADA" ? "COM OS" : "PENDENTE")}</span>
      </div>

      <p class="diagnostico-observacao">${escaparHTML(item.observacao || "Sem observação adicional.")}</p>

      <div class="diagnostico-meta">
        <span>Prioridade: <strong>${escaparHTML(item.prioridade)}</strong></span>
        <span>Situação: <strong>${escaparHTML(item.situacao)}</strong></span>
        <span>${osTexto}</span>
        <span>Registro: ${escaparHTML(item.data)}</span>
      </div>

      ${podeGerarOS ? `
        <button type="button" class="secondary-button" onclick="gerarOSDoDiagnosticoManutencao(${formatarParametroJS(item.id)})">
          Gerar OS deste item
        </button>
      ` : ""}
    </div>
  `;
}

async function salvarDiagnosticoManutencao() {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode registrar diagnóstico.");
    return;
  }

  const andar = document.getElementById("andarDiagnosticoManutencao")?.value || "";
  const local = document.getElementById("localDiagnosticoManutencao")?.value.trim() || "";
  const categoria = document.getElementById("categoriaDiagnosticoManutencao")?.value || "Outros";
  const tipoManutencao = document.getElementById("tipoDiagnosticoManutencao")?.value || "Inspeção";
  const itemSelecionado = document.getElementById("itemDiagnosticoManutencao")?.value || "";
  const descricao = document.getElementById("descricaoDiagnosticoManutencao")?.value.trim() || "";
  const prioridade = document.getElementById("prioridadeDiagnosticoManutencao")?.value || "Média";
  const situacao = document.getElementById("situacaoDiagnosticoManutencao")?.value || "Pendente";

  if (!local || (!itemSelecionado && !descricao)) {
    alert("Informe o ambiente/local e o item ou descrição do diagnóstico.");
    return;
  }

  const agora = new Date();
  const diagnostico = {
    ambiente: [andar, local].filter(Boolean).join(" / ") || local,
    andar,
    local,
    categoria,
    tipoManutencao,
    prioridade,
    item: itemSelecionado || descricao,
    situacao,
    observacao: descricao,
    status: "PENDENTE",
    osGeradaId: "",
    osGeradaNumero: "",
    criadoPorUid: usuarioAtual.id,
    criadoPorNome: usuarioAtual.nome,
    criadoEmISO: agora.toISOString(),
    data: agora.toLocaleDateString("pt-BR")
  };

  try {
    await criarDiagnosticoManutencaoFirebase(diagnostico);
    limparFormularioDiagnosticoManutencao();
    alert("Item do diagnóstico salvo.");
  } catch (erro) {
    console.error("Erro ao salvar diagnóstico:", erro);
    alert("Não foi possível salvar o diagnóstico no Firebase.");
  }
}

async function gerarOSDoDiagnosticoManutencao(diagnosticoId) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção pode gerar OS pelo diagnóstico.");
    return;
  }

  const diagnostico = diagnosticosManutencao.find(item => idsIguais(item.id, diagnosticoId));

  if (!diagnostico) {
    alert("Item do diagnóstico não encontrado.");
    return;
  }

  const agora = new Date();
  const numeroOS = gerarNumeroOS(agora);
  const descricao = [
    `Diagnóstico inicial: ${diagnostico.item}.`,
    diagnostico.observacao ? `Observação: ${diagnostico.observacao}` : "",
    `Situação registrada: ${diagnostico.situacao}.`
  ].filter(Boolean).join(" ");

  const chamado = {
    numeroOS,
    tipoRegistro: "OS",
    etapaFluxo: "Solicitação registrada",
    responsavelManutencao: usuarioAtual.nome || "Manutenção",
    iniciadoEmISO: "",
    concluidoEmISO: "",
    validadoEmISO: "",
    descricao,
    andar: diagnostico.andar || "",
    local: diagnostico.local || diagnostico.ambiente,
    equipamentoCodigo: "",
    equipamentoNome: "",
    setor: "Manutenção",
    horario: "A definir",
    precisaAcompanhamento: "Não informado",
    categoria: diagnostico.categoria || "Outros",
    subcategoria: "Diagnóstico inicial",
    tipoManutencao: diagnostico.tipoManutencao || "Inspeção",
    prioridade: diagnostico.prioridade || "Média",
    status: "ABERTO",
    data: agora.toLocaleDateString("pt-BR"),
    foto: "",
    fotoNome: "",
    fotoData: "",
    fotos: [],
    fotosFinalizacao: [],
    diagnosticoManutencaoId: diagnostico.id,
    criadoPorUid: usuarioAtual.id,
    criadoPorNome: usuarioAtual.nome,
    criadoPorEmail: usuarioAtual.email,
    solicitanteId: usuarioAtual.id,
    solicitanteNome: usuarioAtual.nome,
    solicitanteEmail: usuarioAtual.email,
    justificativaAguardando: "",
    historico: [
      {
        data: agora.toLocaleDateString("pt-BR"),
        acao: "OS criada pelo diagnóstico inicial",
        descricao: `${numeroOS} criada a partir do item de diagnóstico: ${diagnostico.item}.`
      }
    ]
  };

  try {
    const chamadoId = await criarChamadoFirebase(chamado);

    await atualizarDiagnosticoManutencaoFirebase(diagnostico.id, {
      status: "OS_GERADA",
      osGeradaId: chamadoId,
      osGeradaNumero: numeroOS
    });

    alert(`OS ${numeroOS} gerada com sucesso.`);
    openPage("painel");
  } catch (erro) {
    console.error("Erro ao gerar OS pelo diagnóstico:", erro);
    alert("Não foi possível gerar a OS a partir do diagnóstico.");
  }
}

function limparFormularioDiagnosticoManutencao() {
  [
    "andarDiagnosticoManutencao",
    "localDiagnosticoManutencao",
    "itemDiagnosticoManutencao",
    "descricaoDiagnosticoManutencao"
  ].forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = "";
    }
  });

  const categoria = document.getElementById("categoriaDiagnosticoManutencao");
  const tipo = document.getElementById("tipoDiagnosticoManutencao");
  const prioridade = document.getElementById("prioridadeDiagnosticoManutencao");
  const situacao = document.getElementById("situacaoDiagnosticoManutencao");

  if (categoria) categoria.value = "Elétrica";
  if (tipo) tipo.value = "Inspeção";
  if (prioridade) prioridade.value = "Média";
  if (situacao) situacao.value = "Pendente";
}

function obterPesoPrioridadeDiagnosticoManutencao(prioridade) {
  const pesos = {
    Urgente: 4,
    Alta: 3,
    Média: 2,
    Baixa: 1
  };

  return pesos[prioridade] || 0;
}

/* =====================================================
   DIAGNÓSTICO INICIAL - CHECKLIST OPERACIONAL
===================================================== */

const CHECKLIST_DIAGNOSTICO_PADRAO = Object.freeze({
  "Segurança e riscos": Object.freeze([
    "Fios expostos ou cabos danificados",
    "Tomadas soltas, quebradas ou aquecendo",
    "Extintores obstruídos, vencidos ou sem lacre",
    "Saídas de emergência bloqueadas ou sem sinalização",
    "Piso solto, escorregadio ou com desnível",
    "Iluminação de emergência sem funcionamento"
  ]),
  "Elétrica e iluminação": Object.freeze([
    "Lâmpadas queimadas ou piscando",
    "Interruptores com mau contato",
    "Quadro elétrico sem identificação ou com sinais de aquecimento",
    "Extensões ou benjamins improvisados",
    "Nobreaks, filtros de linha e cabos em uso inadequado"
  ]),
  "Hidráulica e sanitários": Object.freeze([
    "Torneiras pingando ou com vazamento",
    "Descargas fracas, travadas ou vazando",
    "Ralos com retorno, odor ou entupimento",
    "Bebedouros com vazamento ou necessidade de filtro/higienização",
    "Registros sem acesso ou sem funcionamento"
  ]),
  "Climatização": Object.freeze([
    "Ar-condicionado sem refrigerar adequadamente",
    "Filtro sujo ou sem data de limpeza",
    "Dreno pingando dentro do ambiente",
    "Condensadora com ruído, sujeira ou fixação inadequada",
    "Controle remoto sem identificação ou sem pilhas"
  ]),
  "Civil, portas e mobiliário": Object.freeze([
    "Infiltração, mancha ou trinca aparente",
    "Portas desalinhadas, dobradiças frouxas ou fechadura com falha",
    "Janelas sem vedação ou travamento",
    "Cadeiras, mesas ou armários instáveis",
    "Forro, pintura ou revestimento danificado"
  ]),
  "Área externa e prevenção": Object.freeze([
    "Calhas, ralos externos ou drenagem com obstrução",
    "Portões, grades ou muros com falha estrutural",
    "Iluminação externa insuficiente",
    "Telhado com telha quebrada ou ponto provável de infiltração",
    "Acesso, rampa, corrimão ou rota acessível com obstrução"
  ])
});

let filtroDiagnosticoStatusAtual = "TODOS";
let filtroDiagnosticoPrioridadeAtual = "TODAS";
let termoBuscaDiagnostico = "";

function inicializarFormularioDiagnostico() {
  preencherLocaisDiagnostico();
  renderizarChecklistDiagnosticoPadrao();
}

function preencherLocaisDiagnostico() {
  const select = document.getElementById("localDiagnostico");
  if (!select || select.dataset.preenchido === "true") return;

  const locais = [];
  Object.entries(LOCAIS_POR_ANDAR_MANUTENCAO || {}).forEach(([andar, lista]) => {
    (lista || []).forEach(local => locais.push(`${andar} / ${local}`));
  });

  select.innerHTML = '<option value="">Selecione o local vistoriado</option>';
  [...new Set(locais)].forEach(localCompleto => {
    const option = document.createElement("option");
    option.value = localCompleto;
    option.textContent = localCompleto;
    select.appendChild(option);
  });

  select.dataset.preenchido = "true";
}

function renderizarChecklistDiagnosticoPadrao() {
  const container = document.getElementById("checklistDiagnosticoPadrao");
  if (!container) return;

  container.innerHTML = Object.entries(CHECKLIST_DIAGNOSTICO_PADRAO).map(([grupo, itens]) => `
    <details class="diagnostic-group">
      <summary>${escaparHTML(grupo)}</summary>
      <div class="diagnostic-checklist-items">
        ${itens.map(item => `
          <button type="button" class="diagnostic-check-item" onclick="usarItemChecklistDiagnostico(${formatarParametroJS(grupo)}, ${formatarParametroJS(item)})">
            ${escaparHTML(item)}
          </button>
        `).join("")}
      </div>
    </details>
  `).join("");
}

function usarItemChecklistDiagnostico(grupo, item) {
  const sistema = document.getElementById("sistemaDiagnostico");
  const descricao = document.getElementById("descricaoDiagnostico");
  const tipo = document.getElementById("tipoDiagnostico");
  const status = document.getElementById("statusDiagnostico");

  const sistemaSugerido = sugerirSistemaPorGrupoDiagnostico(grupo);

  if (sistema && sistemaSugerido) sistema.value = sistemaSugerido;
  if (tipo && !tipo.value) tipo.value = "Inspeção";
  if (status && !status.value) status.value = "Pendente";
  if (descricao) {
    descricao.value = descricao.value
      ? `${descricao.value}\n- ${item}`
      : item;
    descricao.focus();
  }
}

function sugerirSistemaPorGrupoDiagnostico(grupo) {
  const mapa = {
    "Segurança e riscos": "Segurança",
    "Elétrica e iluminação": "Elétrica",
    "Hidráulica e sanitários": "Hidráulica",
    "Climatização": "Climatização",
    "Civil, portas e mobiliário": "Civil / mobiliário",
    "Área externa e prevenção": "Área externa"
  };

  return mapa[grupo] || "Inspeção geral";
}

function obterCamposDiagnostico() {
  return {
    local: document.getElementById("localDiagnostico"),
    sistema: document.getElementById("sistemaDiagnostico"),
    tipo: document.getElementById("tipoDiagnostico"),
    prioridade: document.getElementById("prioridadeDiagnostico"),
    status: document.getElementById("statusDiagnostico"),
    descricao: document.getElementById("descricaoDiagnostico"),
    risco: document.getElementById("riscoDiagnostico"),
    acao: document.getElementById("acaoDiagnostico"),
    material: document.getElementById("materialDiagnostico")
  };
}

function lerValorDiagnostico(campo) {
  return campo ? String(campo.value || "").trim() : "";
}

async function criarItemDiagnostico(botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente o acesso de manutenção pode registrar o diagnóstico inicial.");
    return;
  }

  const campos = obterCamposDiagnostico();
  const valores = {
    local: lerValorDiagnostico(campos.local),
    sistema: lerValorDiagnostico(campos.sistema),
    tipo: lerValorDiagnostico(campos.tipo),
    prioridade: lerValorDiagnostico(campos.prioridade),
    status: lerValorDiagnostico(campos.status) || "Pendente",
    descricao: lerValorDiagnostico(campos.descricao),
    risco: lerValorDiagnostico(campos.risco),
    acao: lerValorDiagnostico(campos.acao),
    material: lerValorDiagnostico(campos.material)
  };

  const pendentes = [];
  if (!valores.local) pendentes.push("Local vistoriado");
  if (!valores.sistema) pendentes.push("Sistema");
  if (!valores.tipo) pendentes.push("Tipo");
  if (!valores.prioridade) pendentes.push("Prioridade");
  if (!valores.descricao) pendentes.push("Descrição técnica");

  if (pendentes.length) {
    alert(`Preencha antes de salvar:\n- ${pendentes.join("\n- ")}`);
    return;
  }

  const agora = new Date();
  const diagnostico = {
    ...valores,
    data: agora.toLocaleDateString("pt-BR"),
    criadoEmISO: agora.toISOString(),
    criadoPorUid: usuarioAtual.id || "",
    criadoPorNome: usuarioAtual.nome || "Oficial de manutenção",
    unidade: usuarioAtual.unidade || "Senac Campo Mourão"
  };

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Salvando...";
    }

    await criarDiagnosticoFirebase(diagnostico);
    limparFormularioDiagnostico();
  } catch (erro) {
    console.error("Erro ao salvar diagnóstico:", erro);
    alert("Não foi possível salvar o item do diagnóstico. Verifique as regras do Firestore e sua conexão.");
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Salvar item do diagnóstico";
    }
  }
}

function limparFormularioDiagnostico() {
  Object.values(obterCamposDiagnostico()).forEach(campo => {
    if (campo) campo.value = "";
  });

  const status = document.getElementById("statusDiagnostico");
  if (status) status.value = "Pendente";
}

function renderizarDiagnosticos() {
  const lista = document.getElementById("listaDiagnostico");
  if (!lista) return;

  if (!usuarioEhManutencaoAutorizada()) {
    lista.innerHTML = criarMensagemVazia("Acesso restrito", "O diagnóstico inicial é uma área operacional do oficial de manutenção.");
    return;
  }

  const itens = filtrarListaDiagnosticos(diagnosticos || []);
  atualizarIndicadoresDiagnostico(diagnosticos || []);

  if (!itens.length) {
    lista.innerHTML = criarMensagemVazia("Nenhum item registrado", "Comece pela vistoria de segurança, elétrica, hidráulica e salas mais utilizadas.");
    return;
  }

  lista.innerHTML = itens.map(criarCardDiagnostico).join("");
}

function filtrarListaDiagnosticos(lista) {
  const termo = termoBuscaDiagnostico;

  return lista
    .filter(item => filtroDiagnosticoStatusAtual === "TODOS" || item.status === filtroDiagnosticoStatusAtual)
    .filter(item => filtroDiagnosticoPrioridadeAtual === "TODAS" || item.prioridade === filtroDiagnosticoPrioridadeAtual)
    .filter(item => {
      if (!termo) return true;
      return [item.local, item.sistema, item.tipo, item.prioridade, item.status, item.descricao, item.risco, item.acao, item.material]
        .join(" ")
        .toLowerCase()
        .includes(termo);
    })
    .sort((a, b) => obterPesoPrioridadeDiagnostico(a.prioridade) - obterPesoPrioridadeDiagnostico(b.prioridade)
      || new Date(b.criadoEmISO).getTime() - new Date(a.criadoEmISO).getTime());
}

function obterPesoPrioridadeDiagnostico(prioridade) {
  const pesos = { "P1 - Urgente": 1, "P2 - Alta": 2, "P3 - Normal": 3, "P4 - Baixa": 4, "P5 - Preventiva": 5 };
  return pesos[prioridade] || 99;
}

function criarCardDiagnostico(item) {
  const classePrioridade = item.prioridade && item.prioridade.startsWith("P1") ? "status-red"
    : item.prioridade && item.prioridade.startsWith("P2") ? "status-orange"
    : item.prioridade && item.prioridade.startsWith("P5") ? "status-green"
    : "status-blue";

  return `
    <article class="diagnostic-card">
      <div class="diagnostic-card-header">
        <div>
          <h3>${escaparHTML(item.descricao)}</h3>
          <p>${escaparHTML(item.local)} • ${escaparHTML(item.sistema)} • ${escaparHTML(item.tipo)}</p>
        </div>
        <span class="status ${classePrioridade}">${escaparHTML(item.prioridade)}</span>
      </div>
      <div class="diagnostic-meta">
        <span>Status: <strong>${escaparHTML(item.status)}</strong></span>
        <span>Registro: ${escaparHTML(item.data || "")}</span>
      </div>
      ${item.risco ? `<p class="diagnostic-detail"><strong>Risco/impacto:</strong> ${escaparHTML(item.risco)}</p>` : ""}
      ${item.acao ? `<p class="diagnostic-detail"><strong>Ação recomendada:</strong> ${escaparHTML(item.acao)}</p>` : ""}
      ${item.material ? `<p class="diagnostic-detail"><strong>Material:</strong> ${escaparHTML(item.material)}</p>` : ""}
      <div class="diagnostic-actions">
        <button type="button" class="secondary-button" onclick="prepararOSComDiagnostico(${formatarParametroJS(item.id)})">Gerar OS a partir do item</button>
        <button type="button" class="secondary-button" onclick="marcarDiagnosticoResolvido(${formatarParametroJS(item.id)})">Marcar resolvido</button>
      </div>
    </article>
  `;
}

function pesquisarDiagnostico(valor) {
  termoBuscaDiagnostico = String(valor || "").trim().toLowerCase();
  renderizarDiagnosticos();
}

function filtrarDiagnosticoStatus(valor) {
  filtroDiagnosticoStatusAtual = valor || "TODOS";
  renderizarDiagnosticos();
}

function filtrarDiagnosticoPrioridade(valor) {
  filtroDiagnosticoPrioridadeAtual = valor || "TODAS";
  renderizarDiagnosticos();
}

function atualizarIndicadoresDiagnostico(lista) {
  setTextContent("totalDiagnosticoItens", lista.length);
  setTextContent("totalDiagnosticoP1", lista.filter(item => String(item.prioridade || "").startsWith("P1")).length);
  setTextContent("totalDiagnosticoPendentes", lista.filter(item => item.status !== "Resolvido").length);
  setTextContent("totalDiagnosticoPreventivas", lista.filter(item => item.tipo === "Preventiva" || item.prioridade === "P5 - Preventiva").length);
}

function encontrarDiagnosticoPorId(id) {
  return (diagnosticos || []).find(item => String(item.id) === String(id));
}

function prepararOSComDiagnostico(id) {
  const item = encontrarDiagnosticoPorId(id);
  if (!item) return;

  const local = separarLocalDiagnostico(item.local);
  openPage("novo");

  setTimeout(() => {
    const andar = document.getElementById("andarChamado");
    const localCampo = document.getElementById("localChamado");
    const tipo = document.getElementById("tipoManutencaoChamado");
    const categoria = document.getElementById("categoriaChamado");
    const subcategoria = document.getElementById("subcategoriaChamado");
    const prioridade = document.getElementById("prioridadeChamado");
    const descricao = document.getElementById("descricaoChamado");

    if (andar && local.andar) {
      andar.value = local.andar;
      atualizarLocaisPorAndarManutencao(local.local);
    }

    if (localCampo && local.local) localCampo.value = local.local;
    if (tipo) tipo.value = normalizarTipoParaOS(item.tipo);
    if (categoria) {
      categoria.value = sugerirCategoriaOSPorSistema(item.sistema);
      atualizarSubcategoriasChamado(categoria.value, "");
    }
    if (subcategoria && subcategoria.options.length > 1) subcategoria.selectedIndex = 1;
    if (prioridade) prioridade.value = normalizarPrioridadeParaOS(item.prioridade);
    if (descricao) {
      descricao.value = montarDescricaoOSDiagnostico(item);
      descricao.focus();
    }
  }, 80);
}

function separarLocalDiagnostico(localCompleto) {
  const partes = String(localCompleto || "").split(" / ");
  return {
    andar: partes[0] || "",
    local: partes.slice(1).join(" / ") || ""
  };
}

function normalizarTipoParaOS(tipo) {
  if (tipo === "Corretiva urgente" || tipo === "Corretiva normal") return "Corretiva";
  if (["Preventiva", "Inspeção", "Melhoria"].includes(tipo)) return tipo;
  return "Inspeção";
}

function normalizarPrioridadeParaOS(prioridade) {
  if (String(prioridade).startsWith("P1")) return "Urgente";
  if (String(prioridade).startsWith("P2")) return "Alta";
  if (String(prioridade).startsWith("P3")) return "Média";
  return "Baixa";
}

function sugerirCategoriaOSPorSistema(sistema) {
  const texto = String(sistema || "").toLowerCase();
  if (texto.includes("elétrica") || texto.includes("iluminação")) return "Elétrica";
  if (texto.includes("hidráulica") || texto.includes("sanitário")) return "Hidráulica";
  if (texto.includes("civil") || texto.includes("mobiliário") || texto.includes("porta") || texto.includes("externa")) return "Alvenaria";
  if (texto.includes("climatização") || texto.includes("ar-condicionado")) return "Eletrônica";
  if (texto.includes("pintura")) return "Pintura";
  return "Outros";
}

function montarDescricaoOSDiagnostico(item) {
  return [
    `Origem: diagnóstico inicial da unidade.`,
    `Descrição: ${item.descricao}`,
    item.risco ? `Risco/impacto: ${item.risco}` : "",
    item.acao ? `Ação recomendada: ${item.acao}` : "",
    item.material ? `Material necessário: ${item.material}` : ""
  ].filter(Boolean).join("\n");
}

async function marcarDiagnosticoResolvido(id) {
  const item = encontrarDiagnosticoPorId(id);
  if (!item) return;

  if (!confirm("Marcar este item do diagnóstico como resolvido?")) return;

  try {
    await atualizarDiagnosticoFirebase(id, {
      status: "Resolvido",
      resolvidoEmISO: new Date().toISOString(),
      resolvidoPorUid: usuarioAtual.id || "",
      resolvidoPorNome: usuarioAtual.nome || "Oficial de manutenção"
    });
  } catch (erro) {
    console.error("Erro ao atualizar diagnóstico:", erro);
    alert("Não foi possível marcar o item como resolvido.");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarFormularioDiagnostico);
} else {
  inicializarFormularioDiagnostico();
}

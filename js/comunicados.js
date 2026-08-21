/* =====================================================
   COMUNICADOS
===================================================== */

let filtroComunicadosAtual = "todos";
let comunicadoEditandoId = "";

const CONFIG_NIVEIS_COMUNICADO = {
  urgente: {
    rotulo: "Urgente",
    classe: "urgente",
    descricao: "Exige atenção imediata"
  },
  importante: {
    rotulo: "Importante",
    classe: "importante",
    descricao: "Atenção necessária"
  },
  normal: {
    rotulo: "Normal",
    classe: "normal",
    descricao: "Informativo"
  }
};

const ORDEM_NIVEIS_COMUNICADO = {
  urgente: 0,
  importante: 1,
  normal: 2
};

function normalizarNivelComunicado(nivel) {
  const nivelNormalizado = String(nivel || "normal")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return CONFIG_NIVEIS_COMUNICADO[nivelNormalizado] ? nivelNormalizado : "normal";
}

function obterConfigNivelComunicado(nivel) {
  const nivelNormalizado = normalizarNivelComunicado(nivel);
  return CONFIG_NIVEIS_COMUNICADO[nivelNormalizado] || CONFIG_NIVEIS_COMUNICADO.normal;
}

function obterElementosFormularioComunicado() {
  return {
    tituloInput: document.getElementById("tituloComunicado"),
    textoInput: document.getElementById("textoComunicado"),
    origemInput: document.getElementById("origemComunicado"),
    nivelInput: document.getElementById("nivelComunicado"),
    editandoInput: document.getElementById("comunicadoEditandoId"),
    tituloFormulario: document.getElementById("tituloFormularioComunicado"),
    subtituloFormulario: document.getElementById("subtituloFormularioComunicado"),
    botaoSalvar: document.getElementById("botaoSalvarComunicado"),
    botaoCancelar: document.getElementById("botaoCancelarEdicaoComunicado"),
    botaoLimpar: document.getElementById("botaoLimparComunicado")
  };
}

async function salvarComunicado() {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode publicar ou editar comunicados.");
    return;
  }

  const elementos = obterElementosFormularioComunicado();
  const { tituloInput, textoInput, origemInput, nivelInput } = elementos;

  if (!tituloInput || !textoInput || !origemInput || !nivelInput) {
    alert("Campos do comunicado não encontrados.\nAtualize a página e tente novamente.");
    return;
  }

  const titulo = tituloInput.value.trim();
  const texto = textoInput.value.trim();
  const origem = origemInput.value;
  const nivel = normalizarNivelComunicado(nivelInput.value);

  if (!titulo || !texto || !origem) {
    alert("Preencha título, mensagem e origem do comunicado antes de salvar.");
    return;
  }

  const comunicadoOriginal = comunicadoEditandoId
    ? comunicados.find(item => String(item.id) === String(comunicadoEditandoId))
    : null;

  const dadosComunicado = {
    titulo,
    texto,
    origem,
    nivel,
    data: comunicadoOriginal ? comunicadoOriginal.data : new Date().toLocaleDateString("pt-BR"),
    autor: comunicadoOriginal ? comunicadoOriginal.autor : usuarioAtual.nome,
    autorUid: comunicadoOriginal ? comunicadoOriginal.autorUid : usuarioAtual.id
  };

  try {
    if (comunicadoEditandoId) {
      await atualizarComunicadoFirebase(comunicadoEditandoId, {
        ...dadosComunicado,
        editadoPor: usuarioAtual.nome,
        editadoPorUid: usuarioAtual.id,
        editadoEmISO: new Date().toISOString()
      });

      alert("Comunicado atualizado com sucesso.");
    } else {
      await criarComunicadoFirebase(dadosComunicado);
      alert("Comunicado publicado com sucesso.\nEle já está disponível para os usuários autorizados.");
    }

    limparFormularioComunicado();
  } catch (erro) {
    console.error("Erro ao salvar comunicado:", erro);
    alert("Não foi possível salvar o comunicado.\nVerifique sua conexão e permissões no Firestore.");
  }
}

function criarComunicado() {
  return salvarComunicado();
}

function limparFormularioComunicado() {
  const elementos = obterElementosFormularioComunicado();
  const {
    tituloInput,
    textoInput,
    origemInput,
    nivelInput,
    editandoInput,
    tituloFormulario,
    subtituloFormulario,
    botaoSalvar,
    botaoCancelar,
    botaoLimpar
  } = elementos;

  if (tituloInput) tituloInput.value = "";
  if (textoInput) textoInput.value = "";
  if (origemInput) origemInput.value = "Manutenção";
  if (nivelInput) nivelInput.value = "normal";
  if (editandoInput) editandoInput.value = "";

  comunicadoEditandoId = "";
  atualizarSelecaoNivelComunicado("normal");

  if (tituloFormulario) tituloFormulario.textContent = "Novo comunicado";
  if (subtituloFormulario) subtituloFormulario.textContent = "Publique um aviso para todos os usuários autorizados.";
  if (botaoSalvar) botaoSalvar.textContent = "Publicar comunicado";
  if (botaoCancelar) botaoCancelar.hidden = true;
  if (botaoLimpar) botaoLimpar.hidden = false;
}

function cancelarEdicaoComunicado() {
  limparFormularioComunicado();
}

function selecionarNivelComunicado(elemento) {
  const nivel = normalizarNivelComunicado(elemento && elemento.dataset ? elemento.dataset.nivel : "normal");
  const nivelInput = document.getElementById("nivelComunicado");

  if (nivelInput) {
    nivelInput.value = nivel;
  }

  atualizarSelecaoNivelComunicado(nivel);
}

function selecionarNivelComunicadoSelect(elemento) {
  atualizarSelecaoNivelComunicado(elemento ? elemento.value : "normal");
}

function atualizarSelecaoNivelComunicado(nivel) {
  const nivelNormalizado = normalizarNivelComunicado(nivel);
  const nivelInput = document.getElementById("nivelComunicado");

  if (nivelInput && nivelInput.value !== nivelNormalizado) {
    nivelInput.value = nivelNormalizado;
  }

  document.querySelectorAll(".comunicado-level-card").forEach(card => {
    const ativo = normalizarNivelComunicado(card.dataset.nivel) === nivelNormalizado;
    card.classList.toggle("is-active", ativo);
  });
}

function ordenarComunicadosPorNivelEData(lista) {
  return [...lista].sort((a, b) => {
    const prioridadeA = ORDEM_NIVEIS_COMUNICADO[normalizarNivelComunicado(a.nivel)] ?? 2;
    const prioridadeB = ORDEM_NIVEIS_COMUNICADO[normalizarNivelComunicado(b.nivel)] ?? 2;

    if (prioridadeA !== prioridadeB) {
      return prioridadeA - prioridadeB;
    }

    const dataA = Date.parse(a.criadoEmISO || a.editadoEmISO || "") || 0;
    const dataB = Date.parse(b.criadoEmISO || b.editadoEmISO || "") || 0;
    return dataB - dataA;
  });
}

function filtrarComunicados(nivel) {
  filtroComunicadosAtual = normalizarFiltroComunicados(nivel);

  document.querySelectorAll(".comunicado-filter").forEach(botao => {
    const filtroBotao = normalizarFiltroComunicados(botao.dataset.param0);
    botao.classList.toggle("is-active", filtroBotao === filtroComunicadosAtual);
  });

  renderizarComunicados();
}

function normalizarFiltroComunicados(filtro) {
  const filtroTexto = String(filtro || "todos").trim().toLowerCase();
  return ["todos", "urgente", "importante", "normal"].includes(filtroTexto) ? filtroTexto : "todos";
}

function obterComunicadosFiltrados() {
  const listaOrdenada = ordenarComunicadosPorNivelEData(comunicados);

  if (filtroComunicadosAtual === "todos") {
    return listaOrdenada;
  }

  return listaOrdenada.filter(comunicado => normalizarNivelComunicado(comunicado.nivel) === filtroComunicadosAtual);
}

function renderizarComunicados() {
  const listaComunicados = document.getElementById("listaComunicados");
  const listaComunicadosInicio = document.getElementById("listaComunicadosInicio");
  const secaoComunicadosInicio = document.getElementById("secaoComunicadosInicio");
  const areaNovoComunicado = document.getElementById("areaNovoComunicado");
  const ocultarComunicadosInicioParaManutencao = typeof usuarioEhManutencaoAutorizada === "function"
    && usuarioEhManutencaoAutorizada();

  if (areaNovoComunicado) {
    areaNovoComunicado.hidden = !usuarioEhManutencaoAutorizada();
  }

  if (secaoComunicadosInicio) {
    secaoComunicadosInicio.hidden = ocultarComunicadosInicioParaManutencao;
  }

  renderizarResumoComunicados();
  atualizarContadoresFiltrosComunicados();

  if (listaComunicados) {
    const comunicadosFiltrados = obterComunicadosFiltrados();

    listaComunicados.innerHTML = comunicadosFiltrados.length > 0
      ? comunicadosFiltrados.map(comunicado => criarCardComunicado(comunicado, true)).join("")
      : criarMensagemVazia("Nenhum comunicado encontrado", "Altere o filtro ou publique um novo aviso.");
  }

  if (listaComunicadosInicio) {
    if (ocultarComunicadosInicioParaManutencao) {
      listaComunicadosInicio.innerHTML = "";
      return;
    }

    const comunicadosRecentes = ordenarComunicadosPorNivelEData(comunicados).slice(0, 2);

    listaComunicadosInicio.innerHTML = comunicadosRecentes.length > 0
      ? comunicadosRecentes.map(comunicado => criarCardComunicado(comunicado, false)).join("")
      : criarMensagemVazia("Nenhum comunicado recente", "Os avisos importantes aparecerão aqui.");
  }
}

function renderizarResumoComunicados() {
  const resumo = document.getElementById("resumoComunicados");

  if (!resumo) return;

  const contadores = obterContadoresComunicados();

  resumo.innerHTML = `
    <div class="comunicados-summary-card comunicados-summary-card-urgente">
      <span class="comunicados-summary-icon">!</span>
      <div>
        <strong>${contadores.urgente}</strong>
        <small>${contadores.urgente === 1 ? "Urgente ativo" : "Urgentes ativos"}</small>
      </div>
    </div>

    <div class="comunicados-summary-card comunicados-summary-card-importante">
      <span class="comunicados-summary-icon">!</span>
      <div>
        <strong>${contadores.importante}</strong>
        <small>${contadores.importante === 1 ? "Importante ativo" : "Importantes ativos"}</small>
      </div>
    </div>

    <div class="comunicados-summary-card comunicados-summary-card-normal">
      <span class="comunicados-summary-icon">i</span>
      <div>
        <strong>${contadores.normal}</strong>
        <small>${contadores.normal === 1 ? "Normal ativo" : "Normais ativos"}</small>
      </div>
    </div>
  `;
}

function obterContadoresComunicados() {
  return comunicados.reduce((acc, comunicado) => {
    const nivel = normalizarNivelComunicado(comunicado.nivel);
    acc[nivel] += 1;
    acc.todos += 1;
    return acc;
  }, { todos: 0, urgente: 0, importante: 0, normal: 0 });
}

function atualizarContadoresFiltrosComunicados() {
  const contadores = obterContadoresComunicados();
  const rotulos = {
    todos: "Todos",
    urgente: "Urgentes",
    importante: "Importantes",
    normal: "Normais"
  };

  document.querySelectorAll(".comunicado-filter").forEach(botao => {
    const filtro = normalizarFiltroComunicados(botao.dataset.param0);
    const total = filtro === "todos" ? contadores.todos : contadores[filtro];
    botao.textContent = `${rotulos[filtro]} (${total})`;
  });
}

function criarCardComunicado(comunicado, mostrarAcao) {
  const nivel = normalizarNivelComunicado(comunicado.nivel);
  const config = obterConfigNivelComunicado(nivel);
  const idSeguro = formatarAtributoHTML(comunicado.id);

  const acoesManutencao = usuarioEhManutencaoAutorizada() && mostrarAcao
    ? `
      <div class="notice-actions">
        <button type="button" class="notice-action-button notice-edit-button" data-dynamic-action="editarComunicado" data-param0="${idSeguro}">
          <span aria-hidden="true">✎</span>
          Editar
        </button>
        <button type="button" class="notice-action-button notice-delete-button" data-dynamic-action="excluirComunicado" data-param0="${idSeguro}">
          <span aria-hidden="true">🗑</span>
          Excluir
        </button>
      </div>
    `
    : "";

  return `
    <div class="notice-card notice-card-${config.classe}">
      <div class="notice-icon notice-icon-${config.classe}">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 14h3l8 4V6L7 10H4v4Z" stroke="currentColor" stroke-linejoin="round" />
          <path d="M18 9a4 4 0 0 1 0 6M21 7a7 7 0 0 1 0 10" stroke="currentColor" stroke-linecap="round" />
        </svg>
      </div>

      <div class="notice-info">
        <div class="notice-meta-row">
          <span class="notice-level-badge notice-level-${config.classe}">${config.rotulo}</span>
          <span class="notice-origin-badge">${escaparHTML(comunicado.origem)}</span>
        </div>

        <h3>${escaparHTML(comunicado.titulo)}</h3>
        <p>${escaparHTML(comunicado.texto)}</p>

        <small>
          ${escaparHTML(comunicado.data)}
          •
          ${escaparHTML(comunicado.autor || "Manutenção")}
        </small>

        ${acoesManutencao}
      </div>

      <div class="arrow">›</div>
    </div>
  `;
}

function editarComunicado(id) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a equipe de manutenção pode editar comunicados.");
    return;
  }

  const comunicado = comunicados.find(item => String(item.id) === String(id));

  if (!comunicado) {
    alert("Comunicado não encontrado.\nAtualize a lista e tente novamente.");
    return;
  }

  const elementos = obterElementosFormularioComunicado();
  const {
    tituloInput,
    textoInput,
    origemInput,
    nivelInput,
    editandoInput,
    tituloFormulario,
    subtituloFormulario,
    botaoSalvar,
    botaoCancelar,
    botaoLimpar
  } = elementos;

  if (!tituloInput || !textoInput || !origemInput || !nivelInput) {
    alert("Campos do comunicado não encontrados.\nAtualize a página e tente novamente.");
    return;
  }

  comunicadoEditandoId = String(comunicado.id);
  tituloInput.value = comunicado.titulo || "";
  textoInput.value = comunicado.texto || "";
  origemInput.value = comunicado.origem || "Manutenção";
  nivelInput.value = normalizarNivelComunicado(comunicado.nivel);
  if (editandoInput) editandoInput.value = comunicadoEditandoId;

  atualizarSelecaoNivelComunicado(nivelInput.value);

  if (tituloFormulario) tituloFormulario.textContent = "Editar comunicado";
  if (subtituloFormulario) subtituloFormulario.textContent = "Altere as informações e salve as mudanças.";
  if (botaoSalvar) botaoSalvar.textContent = "Salvar alterações";
  if (botaoCancelar) botaoCancelar.hidden = false;
  if (botaoLimpar) botaoLimpar.hidden = true;

  const areaNovoComunicado = document.getElementById("areaNovoComunicado");
  if (areaNovoComunicado) {
    areaNovoComunicado.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function excluirComunicado(id) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a equipe de manutenção pode excluir comunicados.");
    return;
  }

  const confirmar = await appConfirm("Deseja excluir este comunicado?\nEssa ação removerá o aviso da área de comunicados.", { titulo: "Excluir comunicado", textoConfirmar: "Excluir", textoCancelar: "Voltar" });

  if (!confirmar) {
    return;
  }

  try {
    await excluirComunicadoFirebase(id);

    if (String(comunicadoEditandoId) === String(id)) {
      limparFormularioComunicado();
    }

    alert("Comunicado excluído com sucesso.");
  } catch (erro) {
    console.error("Erro ao excluir comunicado:", erro);
    alert("Não foi possível excluir o comunicado.\nVerifique sua conexão e permissões no Firestore.");
  }
}

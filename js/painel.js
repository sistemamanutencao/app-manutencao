/* =====================================================
   PAINEL DA MANUTENÇÃO
===================================================== */

function pesquisarPainel(valor) {
  termoBuscaPainel = valor.trim().toLowerCase();
  renderizarPainelManutencao();
}

function filtrarPainelStatus(status) {
  filtroPainelStatusAtual = status;
  renderizarPainelManutencao();
}

function filtrarPainelPrioridade(prioridade) {
  filtroPainelPrioridadeAtual = prioridade;
  renderizarPainelManutencao();
}

function limparFiltrosPainel() {
  termoBuscaPainel = "";
  filtroPainelStatusAtual = "TODOS";
  filtroPainelPrioridadeAtual = "TODAS";

  const buscaPainel = document.getElementById("buscaPainel");
  const filtroStatus = document.getElementById("filtroPainelStatus");
  const filtroPrioridade = document.getElementById("filtroPainelPrioridade");

  if (buscaPainel) {
    buscaPainel.value = "";
  }

  if (filtroStatus) {
    filtroStatus.value = "TODOS";
  }

  if (filtroPrioridade) {
    filtroPrioridade.value = "TODAS";
  }

  renderizarPainelManutencao();
}

function renderizarPainelManutencao() {
  const listaPainel = document.getElementById("listaPainelManutencao");

  if (!listaPainel) {
    return;
  }

  atualizarResumoPainel();

  const filaFiltrada = obterFilaPainelFiltrada();

  listaPainel.innerHTML = filaFiltrada.length > 0
    ? filaFiltrada.map(criarCardPainel).join("")
    : criarMensagemVazia("Nenhum chamado encontrado", "Não há chamados para os filtros selecionados.");
}

function atualizarResumoPainel() {
  const chamadosDashboard = obterChamadosDashboardFiltrados();
  const totalOS = chamados.length;
  const totalPeriodo = chamadosDashboard.length;
  const totalAbertos = chamadosDashboard.filter(chamado => chamado.status === "ABERTO").length;
  const totalAndamento = chamadosDashboard.filter(chamado => chamado.status === "EM ANDAMENTO").length;
  const totalConcluidos = chamadosDashboard.filter(chamado => chamado.status === "CONCLUÍDO").length;
  const totalValidados = chamadosDashboard.filter(chamado => chamado.status === "VALIDADO").length;
  const totalEncerrados = chamadosDashboard.filter(chamado => chamado.status === "ENCERRADO").length;
  const totalCancelados = chamadosDashboard.filter(chamado => chamado.status === "CANCELADO").length;
  const totalBacklog = chamadosDashboard.filter(chamado => ["ABERTO", "EM ANDAMENTO", "AGUARDANDO"].includes(chamado.status)).length;
  const totalAtrasados = chamadosDashboard.filter(chamadoEstaAtrasado).length;
  const totalUrgentes = chamadosDashboard.filter(chamado => chamado.prioridade === "Urgente" && !statusFinalizado(chamado.status)).length;
  const totalPreventivas = contarChamadosPorTexto(["preventiva", "preventivo"], chamadosDashboard);
  const totalEmergenciais = contarChamadosPorTexto(["emergencial", "emergência", "urgente"], chamadosDashboard);
  const totalPreventivasVencidas = contarPreventivasVencidasPainel();

  setTextContent("totalOSPainel", totalOS);
  setTextContent("totalOSPeriodoPainel", totalPeriodo);
  setTextContent("totalChamadosPainel", totalOS);
  setTextContent("totalAbertosPainel", totalAbertos);
  setTextContent("totalAndamentoPainel", totalAndamento);
  setTextContent("totalConcluidosPainel", totalConcluidos);
  setTextContent("totalAguardandoValidacaoPainel", totalConcluidos);
  setTextContent("totalValidadosPainel", totalValidados);
  setTextContent("totalEncerradasPainel", totalEncerrados);
  setTextContent("totalCanceladosPainel", totalCancelados);
  setTextContent("totalBacklogPainel", totalBacklog);
  setTextContent("totalAtrasadosPainel", totalAtrasados);
  setTextContent("totalUrgentesPainel", totalUrgentes);
  setTextContent("totalPreventivasPainel", totalPreventivas);
  setTextContent("totalEmergenciaisPainel", totalEmergenciais);
  setTextContent("totalPreventivasVencidasPainel", totalPreventivasVencidas);
  setTextContent("tempoMedioAtendimentoPainel", calcularTempoMedioAtendimento(chamadosDashboard));
  setTextContent("tempoMedioReparoPainel", calcularTempoMedioReparo(chamadosDashboard));
  setTextContent("disponibilidadePainel", calcularDisponibilidadeOperacional(chamadosDashboard));
  setTextContent("slaCumpridoPainel", calcularDisponibilidadeOperacional(chamadosDashboard));

  renderizarIndicadoresOperacionais({
    totalOS: totalPeriodo,
    chamados: chamadosDashboard,
    status: {
      "Aberto": totalAbertos,
      "Em andamento": totalAndamento,
      "Aguardando": chamadosDashboard.filter(chamado => chamado.status === "AGUARDANDO").length,
      "Concluído": totalConcluidos,
      "Validado": totalValidados,
      "Encerrado": totalEncerrados,
      "Cancelado": totalCancelados
    },
    prioridades: {
      "Urgente": chamadosDashboard.filter(chamado => chamado.prioridade === "Urgente").length,
      "Alta": chamadosDashboard.filter(chamado => chamado.prioridade === "Alta").length,
      "Média": chamadosDashboard.filter(chamado => chamado.prioridade === "Média").length,
      "Baixa": chamadosDashboard.filter(chamado => chamado.prioridade === "Baixa").length
    }
  });
}

function alterarPeriodoDashboard(periodo) {
  filtroPeriodoDashboardAtual = periodo || "30";
  renderizarPainelManutencao();
}

function alterarCategoriaDashboard(categoria) {
  filtroCategoriaDashboardAtual = categoria || "TODAS";
  renderizarPainelManutencao();
}

function obterChamadosDashboardFiltrados() {
  let lista = [...chamados];

  if (filtroCategoriaDashboardAtual !== "TODAS") {
    lista = lista.filter(chamado => chamado.categoria === filtroCategoriaDashboardAtual);
  }

  if (filtroPeriodoDashboardAtual !== "TODOS") {
    const dias = Number(filtroPeriodoDashboardAtual);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);
    limite.setHours(0, 0, 0, 0);

    lista = lista.filter(chamado => obterDataValida(chamado.criadoEm || chamado.data, chamado.data) >= limite);
  }

  return lista;
}

function contarChamadosPorTexto(termos, base = chamados) {
  return base.filter(chamado => {
    const texto = [
      chamado.tipoDemanda,
      chamado.tipoRegistro,
      chamado.categoria,
      chamado.prioridade,
      chamado.descricao
    ].join(" ").toLowerCase();

    return termos.some(termo => texto.includes(termo));
  }).length;
}

function calcularTempoMedioAtendimento(base = chamados) {
  const duracoes = base
    .filter(chamado => chamado.iniciadoEmISO)
    .map(chamado => calcularDiferencaHoras(chamado.criadoEm || chamado.data, chamado.iniciadoEmISO, chamado.data))
    .filter(valor => valor !== null);

  return formatarMediaHoras(duracoes);
}

function calcularTempoMedioReparo(base = chamados) {
  const duracoes = base
    .filter(chamado => chamado.iniciadoEmISO && chamado.concluidoEmISO)
    .map(chamado => calcularDiferencaHoras(chamado.iniciadoEmISO, chamado.concluidoEmISO, chamado.data))
    .filter(valor => valor !== null);

  return formatarMediaHoras(duracoes);
}

function calcularDiferencaHoras(inicioISO, fimISO, dataReservaBR) {
  const inicio = obterDataValida(inicioISO, dataReservaBR);
  const fim = obterDataValida(fimISO, dataReservaBR);
  const diferencaMs = fim.getTime() - inicio.getTime();

  if (!Number.isFinite(diferencaMs) || diferencaMs < 0) {
    return null;
  }

  return diferencaMs / (1000 * 60 * 60);
}

function formatarMediaHoras(valores) {
  if (!valores.length) {
    return "--";
  }

  const media = valores.reduce((soma, valor) => soma + valor, 0) / valores.length;

  if (media < 1) {
    return `${Math.max(1, Math.round(media * 60))}min`;
  }

  if (media < 24) {
    return `${media.toFixed(1).replace(".", ",")}h`;
  }

  return `${Math.round(media / 24)}d`;
}

function calcularDisponibilidadeOperacional(base = chamados) {
  const concluidos = base.filter(chamado => ["CONCLUÍDO", "VALIDADO", "ENCERRADO"].includes(chamado.status));

  if (!concluidos.length) {
    return "--";
  }

  const noPrazo = concluidos.filter(chamado => {
    if (chamado.prioridade === "Urgente") {
      return true;
    }

    const criadoEm = obterDataValida(chamado.criadoEm, chamado.data);
    const concluidoEm = obterDataValida(chamado.concluidoEmISO, chamado.data);
    const prazoHoras = obterPrazoHoras(chamado.prioridade);
    const vencimento = new Date(criadoEm.getTime() + prazoHoras * 60 * 60 * 1000);

    return concluidoEm <= vencimento;
  }).length;

  return `${Math.round((noPrazo / concluidos.length) * 100)}%`;
}

function renderizarIndicadoresOperacionais(dados) {
  const base = dados.chamados || chamados;
  renderizarBarrasIndicador("indicadorStatusOS", dados.status, dados.totalOS);
  renderizarBarrasIndicador("indicadorPrioridadesOS", dados.prioridades, dados.totalOS);
  renderizarBarrasIndicador("indicadorCategoriasOS", contarOcorrenciasPainel("categoria", base), dados.totalOS);
  renderizarBarrasIndicador("indicadorTiposManutencao", contarOcorrenciasPainel("tipoManutencao", base), dados.totalOS);
  renderizarBarrasIndicador("indicadorResumoMensal", contarResumoMensalPainel(base), dados.totalOS);
  renderizarRankingPainel("rankingSetoresPainel", contarOcorrenciasPainel("setor", base), "Nenhum setor com OS registrada.");
  renderizarRankingPainel("rankingEquipamentosPainel", contarEquipamentosCriticos(base), "Nenhum equipamento vinculado às OS ainda.");
  renderizarRankingPainel("rankingPreventivasPainel", contarPreventivasPorSituacaoPainel(), "Nenhuma preventiva cadastrada.");
}

function renderizarBarrasIndicador(idElemento, dados, total) {
  const elemento = document.getElementById(idElemento);

  if (!elemento) {
    return;
  }

  const entradas = Object.entries(dados).filter(([, quantidade]) => quantidade > 0);

  if (!entradas.length) {
    elemento.innerHTML = `<p class="empty-indicator">Ainda não há dados suficientes para este indicador.</p>`;
    return;
  }

  elemento.innerHTML = entradas.map(([rotulo, quantidade]) => {
    const percentual = total > 0 ? Math.round((quantidade / total) * 100) : 0;

    return `
      <div class="indicator-item">
        <div class="indicator-line">
          <span>${escaparHTML(rotulo)}</span>
          <strong>${quantidade} • ${percentual}%</strong>
        </div>
        <div class="indicator-bar"><div class="indicator-fill" style="width:${percentual}%"></div></div>
      </div>
    `;
  }).join("");
}

function contarOcorrenciasPainel(campo, base = chamados) {
  return base.reduce((mapa, chamado) => {
    const chave = String(chamado[campo] || "Não informado").trim() || "Não informado";
    mapa[chave] = (mapa[chave] || 0) + 1;
    return mapa;
  }, {});
}

function contarEquipamentosCriticos(base = chamados) {
  return base.reduce((mapa, chamado) => {
    const codigo = String(chamado.equipamentoCodigo || "").trim();
    const nome = String(chamado.equipamentoNome || "").trim();
    const chave = codigo || nome;

    if (!chave) {
      return mapa;
    }

    const rotulo = nome && codigo ? `${codigo} • ${nome}` : chave;
    mapa[rotulo] = (mapa[rotulo] || 0) + 1;
    return mapa;
  }, {});
}

function renderizarRankingPainel(idElemento, dados, mensagemVazia) {
  const elemento = document.getElementById(idElemento);

  if (!elemento) {
    return;
  }

  const entradas = Object.entries(dados)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (!entradas.length) {
    elemento.innerHTML = `<p class="empty-indicator">${escaparHTML(mensagemVazia)}</p>`;
    return;
  }

  const maiorValor = Math.max(...entradas.map(([, quantidade]) => quantidade));

  elemento.innerHTML = entradas.map(([rotulo, quantidade]) => {
    const percentual = maiorValor > 0 ? Math.round((quantidade / maiorValor) * 100) : 0;

    return `
      <div class="ranking-item">
        <div class="ranking-line">
          <span>${escaparHTML(rotulo)}</span>
          <strong>${quantidade}</strong>
        </div>
        <div class="ranking-bar"><div class="ranking-fill" style="width:${percentual}%"></div></div>
      </div>
    `;
  }).join("");
}

function contarPreventivasVencidasPainel() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return planosPreventivos.filter(plano => {
    if (plano.ativo === false || !plano.proximaExecucao) {
      return false;
    }

    const data = obterDataValida(plano.proximaExecucao, plano.proximaExecucao);
    data.setHours(0, 0, 0, 0);
    return data < hoje;
  }).length;
}

function contarPreventivasPorSituacaoPainel() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const seteDias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

  return planosPreventivos.reduce((mapa, plano) => {
    if (plano.ativo === false) {
      mapa["Inativas"] = (mapa["Inativas"] || 0) + 1;
      return mapa;
    }

    if (!plano.proximaExecucao) {
      mapa["Sem próxima data"] = (mapa["Sem próxima data"] || 0) + 1;
      return mapa;
    }

    const data = obterDataValida(plano.proximaExecucao, plano.proximaExecucao);
    data.setHours(0, 0, 0, 0);

    if (data < hoje) {
      mapa["Vencidas"] = (mapa["Vencidas"] || 0) + 1;
    } else if (data <= seteDias) {
      mapa["Próximos 7 dias"] = (mapa["Próximos 7 dias"] || 0) + 1;
    } else {
      mapa["Programadas"] = (mapa["Programadas"] || 0) + 1;
    }

    return mapa;
  }, {});
}

function contarResumoMensalPainel(base = chamados) {
  return base.reduce((mapa, chamado) => {
    const data = obterDataValida(chamado.criadoEm || chamado.data, chamado.data);
    const rotulo = `${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`;
    mapa[rotulo] = (mapa[rotulo] || 0) + 1;
    return mapa;
  }, {});
}

function obterFilaPainelFiltrada() {
  let filaFiltrada = [...chamados];

  if (filtroPainelStatusAtual === "ATRASADOS") {
    filaFiltrada = filaFiltrada.filter(chamadoEstaAtrasado);
  } else if (filtroPainelStatusAtual !== "TODOS") {
    filaFiltrada = filaFiltrada.filter(chamado => chamado.status === filtroPainelStatusAtual);
  }

  if (filtroPainelPrioridadeAtual !== "TODAS") {
    filaFiltrada = filaFiltrada.filter(chamado => chamado.prioridade === filtroPainelPrioridadeAtual);
  }

  if (termoBuscaPainel) {
    filaFiltrada = filaFiltrada.filter(chamado => {
      return montarTextoBuscaPainel(chamado).includes(termoBuscaPainel);
    });
  }

  return ordenarChamadosPorPrioridade(filaFiltrada);
}

function montarTextoBuscaPainel(chamado) {
  return [
    chamado.numeroOS,
    chamado.descricao,
    chamado.local,
    chamado.equipamentoCodigo,
    chamado.equipamentoNome,
    chamado.setor,
    chamado.horario,
    chamado.categoria,
    chamado.subcategoria,
    chamado.tipoManutencao,
    chamado.prioridade,
    chamado.status,
    chamado.solicitanteNome
  ].join(" ").toLowerCase();
}

function criarCardPainel(chamado) {
  const statusClasse = obterClasseStatus(chamado.status);
  const sla = calcularSLA(chamado);
  const cardCritico = chamado.prioridade === "Urgente" || sla.texto === "Atrasado";
  const textoSLA = chamado.prioridade === "Urgente"
    ? sla.texto
    : `${sla.texto} • vence em ${formatarVencimentoSLA(chamado)}`;
  const chamadoFinalizado = statusFinalizado(chamado.status);

  return `
    <div class="admin-card ${cardCritico ? "admin-card-critical" : ""}">
      <div class="admin-card-header">
        <div>
          <h3>${escaparHTML(chamado.numeroOS || "OS")}: ${escaparHTML(chamado.descricao)}</h3>
          <p>
            ${escaparHTML(chamado.categoria)}${chamado.subcategoria ? ` / ${escaparHTML(chamado.subcategoria)}` : ""}
            •
            ${escaparHTML(chamado.tipoManutencao || "Corretiva")}
            •
            ${escaparHTML(chamado.local)}
            •
            ${escaparHTML(chamado.data)}
          </p>
        </div>

        <span class="status ${statusClasse}">${escaparHTML(chamado.status)}</span>
      </div>

      <div class="admin-card-body">
        <p><strong>Número da OS:</strong> ${escaparHTML(chamado.numeroOS || "Não informado")}</p>
        <p><strong>Etapa:</strong> ${escaparHTML(chamado.etapaFluxo || obterEtapaFluxoPorStatus(chamado.status))}</p>
        <p><strong>Responsável manutenção:</strong> ${escaparHTML(chamado.responsavelManutencao || "A definir")}</p>
        <p><strong>Ativo / QR:</strong> ${escaparHTML(chamado.equipamentoCodigo || "Não vinculado")}${chamado.equipamentoNome ? ` • ${escaparHTML(chamado.equipamentoNome)}` : ""}</p>
        <p><strong>Categoria técnica:</strong> ${escaparHTML(chamado.categoria || "Não informada")}${chamado.subcategoria ? ` / ${escaparHTML(chamado.subcategoria)}` : ""}</p>
        <p><strong>Tipo de manutenção:</strong> ${escaparHTML(chamado.tipoManutencao || "Corretiva")}</p>
        <p><strong>Prioridade:</strong> ${escaparHTML(chamado.prioridade)}</p>
        <p><strong>SLA:</strong> ${escaparHTML(textoSLA)}</p>
        <p><strong>Criado por:</strong> ${escaparHTML(chamado.criadoPorNome || chamado.solicitanteNome || "Não informado")}</p>
        <p><strong>Solicitante informado:</strong> ${escaparHTML(chamado.setorSolicitante || chamado.solicitanteNome || chamado.setor || "Não informado")}</p>
        <p><strong>Andar:</strong> ${escaparHTML(chamado.andar || "Não informado")}</p>
        <p><strong>Melhor horário:</strong> ${escaparHTML(chamado.horario || "Não informado")}</p>
        <p><strong>Necessário acompanhar:</strong> ${escaparHTML(chamado.precisaAcompanhamento || "Não informado")}</p>

        ${criarControleStatusPainel(chamado, chamadoFinalizado)}
      </div>

      <div class="admin-actions">
        <button class="admin-action-button admin-secondary-action" onclick="abrirDetalhesChamado(${formatarParametroJS(chamado.id)})">
          Ver detalhes
        </button>

        ${chamado.status === "CONCLUÍDO" ? `
          <button class="admin-action-button blue" onclick="selecionarFotoFinalizacao(${formatarParametroJS(chamado.id)}, this)">
            Adicionar foto final
          </button>
          <button class="admin-action-button green" onclick="validarOS(${formatarParametroJS(chamado.id)}, this)">
            Validar OS
          </button>
        ` : ""}

        ${chamado.status === "VALIDADO" ? `
          <button class="admin-action-button green" onclick="encerrarOS(${formatarParametroJS(chamado.id)}, this)">
            Encerrar OS
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

function criarControleStatusPainel(chamado, chamadoFinalizado) {
  if (chamadoFinalizado) {
    return `
      <div class="admin-status-control">
        <label>Status da OS</label>
        <button class="admin-action-button disabled" disabled>OS finalizada</button>
      </div>
    `;
  }

  if (chamado.status === "CONCLUÍDO") {
    return `
      <div class="admin-status-control">
        <label>Status da OS</label>
        <button class="admin-action-button disabled" disabled>Aguardando validação</button>
      </div>
    `;
  }

  if (chamado.status === "VALIDADO") {
    return `
      <div class="admin-status-control">
        <label>Status da OS</label>
        <button class="admin-action-button disabled" disabled>Aguardando encerramento</button>
      </div>
    `;
  }

  return `
    <div class="admin-status-control">
      <label for="statusPainel-${chamado.id}">Trocar status</label>

      <div class="admin-status-row">
        <select id="statusPainel-${chamado.id}" class="admin-status-select">
          <option value="ABERTO" ${chamado.status === "ABERTO" ? "selected" : ""}>Aberto</option>
          <option value="EM ANDAMENTO" ${chamado.status === "EM ANDAMENTO" ? "selected" : ""}>Em andamento</option>
          <option value="AGUARDANDO" ${chamado.status === "AGUARDANDO" ? "selected" : ""}>Aguardando</option>
          <option value="CONCLUÍDO" ${chamado.status === "CONCLUÍDO" ? "selected" : ""}>Concluído / aguardando validação</option>
          <option value="CANCELADO" ${chamado.status === "CANCELADO" ? "selected" : ""}>Cancelado</option>
        </select>

        <button type="button" class="admin-action-button blue" onclick="salvarStatusPainel(${formatarParametroJS(chamado.id)}, this)">
          Salvar status
        </button>
      </div>
    </div>
  `;
}

async function salvarStatusPainel(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode alterar o status do chamado.");
    return;
  }

  const selectStatus = document.getElementById(`statusPainel-${id}`);

  if (!selectStatus) {
    alert("Campo de status não encontrado para este chamado.");
    return;
  }

  const novoStatus = selectStatus.value;
  const chamadoAtual = chamados.find(chamado => idsIguais(chamado.id, id));

  if (!chamadoAtual) {
    alert("Chamado não encontrado.");
    return;
  }

  if (statusFinalizado(chamadoAtual.status)) {
    alert("Este chamado já está finalizado e não pode ser alterado.");
    return;
  }

  if (novoStatus === chamadoAtual.status) {
    alert("O chamado já está com este status.");
    return;
  }

  if (novoStatus === "CANCELADO") {
    await cancelarChamado(id, botao);
    return;
  }

  await alterarStatusPainel(id, novoStatus, botao);
}

async function alterarStatusPainel(id, novoStatus, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode alterar o status do chamado.");
    return;
  }

  const chamadoAtual = chamados.find(chamado => idsIguais(chamado.id, id));

  if (!chamadoAtual) {
    alert("Chamado não encontrado.");
    return;
  }

  if (statusFinalizado(chamadoAtual.status)) {
    alert("Este chamado já está finalizado e não pode ser alterado.");
    return;
  }

  if (!novoStatus) {
    alert("Selecione um status válido.");
    return;
  }

  if (novoStatus === "CANCELADO") {
    await cancelarChamado(id, botao);
    return;
  }

  const justificativaAguardando = obterJustificativaAguardando(novoStatus);

  if (justificativaAguardando === null) {
    renderizarPainelManutencao();
    return;
  }

  const statusAnterior = chamadoAtual.status;
  const agora = new Date();
  const itemHistorico = {
    data: agora.toLocaleString("pt-BR"),
    acao: "Movimentação operacional da OS",
    descricao: montarDescricaoAlteracaoStatus(statusAnterior, novoStatus, justificativaAguardando)
  };
  const dadosAtualizacao = {
    status: novoStatus,
    etapaFluxo: obterEtapaFluxoPorStatus(novoStatus),
    justificativaAguardando,
    responsavelManutencao: chamadoAtual.responsavelManutencao && chamadoAtual.responsavelManutencao !== "A definir"
      ? chamadoAtual.responsavelManutencao
      : usuarioAtual.nome,
    historico: adicionarItemArrayFirebase(itemHistorico)
  };

  if (novoStatus === "EM ANDAMENTO" && !chamadoAtual.iniciadoEmISO) {
    dadosAtualizacao.iniciadoEmISO = agora.toISOString();
  }

  if (novoStatus === "CONCLUÍDO") {
    dadosAtualizacao.concluidoEmISO = agora.toISOString();
  }

  try {
    await atualizarChamadoFirebase(id, dadosAtualizacao);

    if (typeof registrarNotificacaoStatusChamado === "function") {
      await registrarNotificacaoStatusChamado(chamadoAtual, novoStatus, justificativaAguardando);
    }

    aplicarFeedbackSucesso(botao, "Status salvo", "Salvar status");
    alert(`Status atualizado para: ${novoStatus}`);
  } catch (erro) {
    console.error("Erro ao alterar status:", erro);
    alert("Não foi possível alterar o status no Firebase.");
  }

}

function obterJustificativaAguardando(novoStatus) {
  if (novoStatus !== "AGUARDANDO") {
    return "";
  }

  const justificativa = prompt("Informe a justificativa para deixar o chamado em aguardando:");

  if (!justificativa || !justificativa.trim()) {
    alert("Para deixar o chamado em aguardando, é obrigatório informar a justificativa.");
    return null;
  }

  return justificativa.trim();
}

function montarDescricaoAlteracaoStatus(statusAnterior, novoStatus, justificativaAguardando) {
  const descricaoBase = `Status alterado de ${statusAnterior} para ${novoStatus}. Etapa atual: ${obterEtapaFluxoPorStatus(novoStatus)}.`;

  if (novoStatus !== "AGUARDANDO") {
    return descricaoBase;
  }

  return `${descricaoBase} Justificativa: ${justificativaAguardando}`;
}

async function cancelarChamado(id, botao) {
  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("Chamado não encontrado.");
    return;
  }

  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode cancelar chamados pelo painel.");
    return;
  }

  if (statusFinalizado(chamado.status)) {
    alert("Este chamado não pode ser cancelado, pois já está concluído ou cancelado.");
    return;
  }

  const motivo = prompt("Informe o motivo do cancelamento:");

  if (!motivo || !motivo.trim()) {
    alert("Para cancelar o chamado, é obrigatório informar o motivo.");
    return;
  }

  await cancelarChamadoComMotivo(id, motivo.trim(), "OS cancelada pela manutenção");
  aplicarFeedbackSucesso(botao, "Cancelado", "Salvar status");
}

async function validarOS(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode validar OS.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("OS não encontrada.");
    return;
  }

  if (chamado.status !== "CONCLUÍDO") {
    alert("A OS só pode ser validada depois de concluída pela manutenção.");
    return;
  }

  const observacao = prompt("Informe uma observação de validação da OS:") || "Validação registrada sem observação adicional.";
  const agora = new Date();
  const itemHistorico = {
    data: agora.toLocaleString("pt-BR"),
    acao: "OS validada",
    descricao: `${usuarioAtual.nome} validou a execução. Observação: ${observacao.trim()}`
  };

  try {
    await atualizarChamadoFirebase(id, {
      status: "VALIDADO",
      etapaFluxo: "Validação",
      validadoEmISO: agora.toISOString(),
      validadoPorUid: usuarioAtual.id,
      validadoPorNome: usuarioAtual.nome,
      validacaoObservacao: observacao.trim(),
      historico: adicionarItemArrayFirebase(itemHistorico)
    });

    aplicarFeedbackSucesso(botao, "Validada", "Validar OS");
    alert("OS validada com sucesso.");
  } catch (erro) {
    console.error("Erro ao validar OS:", erro);
    alert("Não foi possível validar a OS no Firebase.");
  }
}

async function encerrarOS(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode encerrar OS.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("OS não encontrada.");
    return;
  }

  if (chamado.status !== "VALIDADO") {
    alert("A OS só pode ser encerrada depois de validada.");
    return;
  }

  if (!confirm("Confirmar encerramento definitivo desta OS?")) {
    return;
  }

  const agora = new Date();
  const itemHistorico = {
    data: agora.toLocaleString("pt-BR"),
    acao: "OS encerrada",
    descricao: `${usuarioAtual.nome} encerrou a OS após validação da execução.`
  };

  try {
    await atualizarChamadoFirebase(id, {
      status: "ENCERRADO",
      etapaFluxo: "Encerrado e auditado",
      encerradoEmISO: agora.toISOString(),
      encerradoPorUid: usuarioAtual.id,
      encerradoPorNome: usuarioAtual.nome,
      historico: adicionarItemArrayFirebase(itemHistorico)
    });

    aplicarFeedbackSucesso(botao, "Encerrada", "Encerrar OS");
    alert("OS encerrada com sucesso.");
  } catch (erro) {
    console.error("Erro ao encerrar OS:", erro);
    alert("Não foi possível encerrar a OS no Firebase.");
  }
}

async function selecionarFotoFinalizacao(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode incluir foto de finalização.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("Chamado não encontrado.");
    return;
  }

  if (chamado.status !== "CONCLUÍDO") {
    alert("A foto de finalização só pode ser incluída depois que o chamado estiver concluído.");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.addEventListener("change", async () => {
    const arquivo = input.files && input.files[0];

    if (!arquivo || !String(arquivo.type || "").startsWith("image/")) {
      return;
    }

    await anexarFotoFinalizacao(id, arquivo, botao);
  });

  input.click();
}

async function anexarFotoFinalizacao(id, arquivo, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode incluir foto de finalização.");
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Anexando...";
    }

    const fotoBase64 = await converterFotoParaBase64(arquivo);
    const agora = new Date();
    const fotoFinalizacao = {
      nome: arquivo.name || "Foto de finalização",
      data: fotoBase64,
      adicionadaEm: agora.toISOString()
    };
    const itemHistorico = {
      data: agora.toLocaleString("pt-BR"),
      acao: "Foto de finalização anexada",
      descricao: `Foto anexada pela manutenção: ${fotoFinalizacao.nome}.`
    };

    await atualizarChamadoFirebase(id, {
      fotosFinalizacao: adicionarItemArrayFirebase(fotoFinalizacao),
      historico: adicionarItemArrayFirebase(itemHistorico)
    });

    aplicarFeedbackSucesso(botao, "Foto anexada", "Adicionar foto final");
    alert("Foto de finalização anexada com sucesso.");
  } catch (erro) {
    console.error("Erro ao anexar foto de finalização:", erro);
    alert("Não foi possível anexar a foto de finalização.");

    if (botao) {
      botao.disabled = false;
      botao.textContent = "Adicionar foto final";
    }
  }
}

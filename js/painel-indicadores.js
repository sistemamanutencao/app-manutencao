/* =====================================================
   PAINEL - INDICADORES E METRICAS
===================================================== */

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
    if (typeof chamado.concluidoNoPrazo === "boolean") {
      return chamado.concluidoNoPrazo;
    }

    const concluidoEm = obterDataValida(chamado.concluidoEmISO, chamado.data);
    const vencimento = calcularVencimentoChamado(chamado);

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


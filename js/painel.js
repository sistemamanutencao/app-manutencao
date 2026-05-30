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
  const totalChamados = chamados.length;
  const totalAbertos = chamados.filter(chamado => chamado.status === "ABERTO").length;
  const totalAndamento = chamados.filter(chamado => chamado.status === "EM ANDAMENTO").length;
  const totalConcluidos = chamados.filter(chamado => chamado.status === "CONCLUÍDO").length;
  const totalCancelados = chamados.filter(chamado => chamado.status === "CANCELADO").length;
  const totalAtrasados = chamados.filter(chamadoEstaAtrasado).length;
  const totalUrgentes = chamados.filter(chamado => {
    return chamado.prioridade === "Urgente" && !statusFinalizado(chamado.status);
  }).length;

  setTextContent("totalChamadosPainel", totalChamados);
  setTextContent("totalAbertosPainel", totalAbertos);
  setTextContent("totalAndamentoPainel", totalAndamento);
  setTextContent("totalConcluidosPainel", totalConcluidos);
  setTextContent("totalCanceladosPainel", totalCancelados);
  setTextContent("totalAtrasadosPainel", totalAtrasados);
  setTextContent("totalUrgentesPainel", totalUrgentes);
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
    chamado.descricao,
    chamado.local,
    chamado.setor,
    chamado.horario,
    chamado.categoria,
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
          <h3>${escaparHTML(chamado.descricao)}</h3>
          <p>
            ${escaparHTML(chamado.categoria)}
            •
            ${escaparHTML(chamado.local)}
            •
            ${escaparHTML(chamado.data)}
          </p>
        </div>

        <span class="status ${statusClasse}">${escaparHTML(chamado.status)}</span>
      </div>

      <div class="admin-card-body">
        <p><strong>Prioridade:</strong> ${escaparHTML(chamado.prioridade)}</p>
        <p><strong>SLA:</strong> ${escaparHTML(textoSLA)}</p>
        <p><strong>Solicitante:</strong> ${escaparHTML(chamado.solicitanteNome || "Não informado")}</p>
        <p><strong>Setor:</strong> ${escaparHTML(chamado.setor || "Não informado")}</p>
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
        ` : ""}
      </div>
    </div>
  `;
}

function criarControleStatusPainel(chamado, chamadoFinalizado) {
  if (chamadoFinalizado) {
    return `
      <div class="admin-status-control">
        <label>Status do chamado</label>
        <button class="admin-action-button disabled" disabled>Chamado finalizado</button>
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
          <option value="CONCLUÍDO" ${chamado.status === "CONCLUÍDO" ? "selected" : ""}>Concluído</option>
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
  const itemHistorico = {
    data: new Date().toLocaleString("pt-BR"),
    acao: "Status alterado pelo painel",
    descricao: montarDescricaoAlteracaoStatus(statusAnterior, novoStatus, justificativaAguardando)
  };

  try {
    await atualizarChamadoFirebase(id, {
      status: novoStatus,
      justificativaAguardando,
      historico: adicionarItemArrayFirebase(itemHistorico)
    });

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
  const descricaoBase = `Status alterado de ${statusAnterior} para ${novoStatus}.`;

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

  await cancelarChamadoComMotivo(id, motivo.trim(), "Chamado cancelado pela manutenção");
  aplicarFeedbackSucesso(botao, "Cancelado", "Salvar status");
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

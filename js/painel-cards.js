/* =====================================================
   PAINEL - FILTROS E CARDS
===================================================== */

function obterFilaPainelFiltrada() {
  let filaFiltrada = chamados.filter(chamado => {
    const encerrado = chamado.status === "ENCERRADO";
    return abaFilaPainelAtual === "ENCERRADAS" ? encerrado : !encerrado;
  });

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
    chamado.setor,
    chamado.categoria,
    chamado.subcategoria,
    chamado.tipoManutencao,
    chamado.prioridade,
    chamado.status,
    chamado.criadoPorNome
  ].join(" ").toLowerCase();
}

function criarCardPainel(chamado) {
  const statusClasse = obterClasseStatus(chamado.status);
  const sla = calcularSLA(chamado);
  const cardCritico = chamado.prioridade === "Urgente" || sla.status === "ATRASADO";
  const textoSLA = formatarTextoSLAChamado(chamado, sla);
  const chamadoFinalizado = statusFinalizado(chamado.status);
  const numeroOS = chamado.numeroOS || "OS";
  const descricao = chamado.descricao || "Sem descrição informada";
  const resumoLinha = [
    chamado.categoria,
    chamado.subcategoria,
    chamado.tipoManutencao || "Corretiva",
    chamado.local,
    chamado.data
  ].filter(Boolean).join(" • ");

  return `
    <details class="admin-card admin-card-collapsible ${cardCritico ? "admin-card-critical" : ""}">
      <summary class="admin-card-header admin-card-summary">
        <div class="admin-card-summary-text">
          <h3>${escaparHTML(numeroOS)}: ${escaparHTML(descricao)}</h3>
          <p>${escaparHTML(resumoLinha || "Dados principais não informados")}</p>
        </div>

        <div class="admin-card-summary-status">
          <span class="status ${statusClasse}">${escaparHTML(chamado.status || "ABERTO")}</span>
          <span class="admin-card-toggle" aria-hidden="true">Recolher</span>
        </div>
      </summary>

      <div class="admin-card-content">
        <div class="admin-card-body">
          <p><strong>Número da OS:</strong> ${escaparHTML(chamado.numeroOS || "Não informado")}</p>
          <p><strong>Etapa:</strong> ${escaparHTML(chamado.etapaFluxo || obterEtapaFluxoPorStatus(chamado.status))}</p>
          <p><strong>Responsável manutenção:</strong> ${escaparHTML(chamado.responsavelManutencao || "A definir")}</p>
          <p><strong>Categoria técnica:</strong> ${escaparHTML(chamado.categoria || "Não informada")}${chamado.subcategoria ? ` / ${escaparHTML(chamado.subcategoria)}` : ""}</p>
          <p><strong>Tipo de manutenção:</strong> ${escaparHTML(chamado.tipoManutencao || "Corretiva")}</p>
          <p><strong>Prioridade:</strong> ${escaparHTML(chamado.prioridade || "Não informada")}</p>
          <p><strong>SLA:</strong> ${escaparHTML(textoSLA)}</p>
          <p><strong>Criado por:</strong> ${escaparHTML(chamado.criadoPorNome || "Não informado")}</p>
          <p><strong>Andar:</strong> ${escaparHTML(chamado.andar || "Não informado")}</p>

          ${criarControleStatusPainel(chamado, chamadoFinalizado)}
        </div>

        <div class="admin-actions">
          <button type="button" class="admin-action-button admin-secondary-action" data-dynamic-action="abrirDetalhesChamado" data-param0="${formatarAtributoHTML(chamado.id)}">
            Ver detalhes
          </button>

          ${chamado.status === "CONCLUÍDO" ? `
            <button type="button" class="admin-action-button blue" data-dynamic-action="selecionarFotoFinalizacao" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
              Adicionar foto final
            </button>
            <button type="button" class="admin-action-button green" data-dynamic-action="validarOS" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
              Validar OS
            </button>
          ` : ""}

          ${chamado.status === "VALIDADO" ? `
            <button type="button" class="admin-action-button green" data-dynamic-action="encerrarOS" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
              Encerrar OS
            </button>
          ` : ""}

          ${chamado.status === "ENCERRADO" && usuarioEhManutencaoAutorizada() ? `
            <button type="button" class="admin-action-button painel-danger-action" data-dynamic-action="excluirChamadoEncerrado" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
              Excluir OS
            </button>
          ` : ""}
        </div>
      </div>
    </details>
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

        <button type="button" class="admin-action-button blue" data-dynamic-action="salvarStatusPainel" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
          Salvar status
        </button>
      </div>
    </div>
  `;
}


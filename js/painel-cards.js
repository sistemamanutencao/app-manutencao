/* =====================================================
   PAINEL - FILTROS E CARDS
===================================================== */

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
    chamado.criadoPorNome
  ].join(" ").toLowerCase();
}

function criarCardPainel(chamado) {
  const statusClasse = obterClasseStatus(chamado.status);
  const sla = calcularSLA(chamado);
  const cardCritico = chamado.prioridade === "Urgente" || sla.status === "ATRASADO";
  const textoSLA = formatarTextoSLAChamado(chamado, sla);
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
        <p><strong>Criado por:</strong> ${escaparHTML(chamado.criadoPorNome || "Não informado")}</p>
        <p><strong>Andar:</strong> ${escaparHTML(chamado.andar || "Não informado")}</p>
        <p><strong>Melhor horário:</strong> ${escaparHTML(chamado.horario || "Não informado")}</p>
        <p><strong>Necessário acompanhar:</strong> ${escaparHTML(chamado.precisaAcompanhamento || "Não informado")}</p>

        ${criarControleStatusPainel(chamado, chamadoFinalizado)}
      </div>

      <div class="admin-actions">
        <button class="admin-action-button admin-secondary-action" data-dynamic-action="abrirDetalhesChamado" data-param0="${formatarAtributoHTML(chamado.id)}">
          Ver detalhes
        </button>

        ${chamado.status === "CONCLUÍDO" ? `
          <button class="admin-action-button blue" data-dynamic-action="selecionarFotoFinalizacao" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
            Adicionar foto final
          </button>
          <button class="admin-action-button green" data-dynamic-action="validarOS" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
            Validar OS
          </button>
        ` : ""}

        ${chamado.status === "VALIDADO" ? `
          <button class="admin-action-button green" data-dynamic-action="encerrarOS" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
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

        <button type="button" class="admin-action-button blue" data-dynamic-action="salvarStatusPainel" data-param0="${formatarAtributoHTML(chamado.id)}" data-pass-element="true">
          Salvar status
        </button>
      </div>
    </div>
  `;
}


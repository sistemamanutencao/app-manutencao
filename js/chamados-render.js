/* =====================================================
   CHAMADOS RENDER - LISTAGEM, FILTROS E SLA

   Responsabilidades:
   - filtrar chamados visíveis conforme perfil;
   - renderizar cards de OS;
   - aplicar busca, filtros, ordenação e indicadores visuais;
   - formatar informações exibidas ao usuário.

   Atenção:
   - alterações aqui afetam a visualização de colaborador, gerência e manutenção.
===================================================== */

/* =====================
   Visibilidade por perfil
===================== */

function obterChamadosVisiveis() {
  if (typeof usuarioPossuiPerfil === "function"
    && usuarioPossuiPerfil(PERFIS_USUARIO.COLABORADOR)
    && typeof usuarioEhAutorChamado === "function") {
    return chamados.filter(chamado => usuarioEhAutorChamado(chamado));
  }

  return chamados;
}

/* =====================
   Renderização das listas
===================== */

function renderizarChamados() {
  const listaChamados = document.getElementById("listaChamados") || document.getElementById("listaOS");
  const listaChamadosInicio = document.getElementById("listaChamadosInicio") || document.getElementById("listaOSInicio");
  const chamadosVisiveis = obterChamadosVisiveis();
  const chamadosFiltrados = obterChamadosFiltrados(chamadosVisiveis);

  if (listaChamados) {
    listaChamados.innerHTML = chamadosFiltrados.length > 0
      ? chamadosFiltrados.map(criarCardChamado).join("")
      : criarMensagemVazia("Nenhuma OS encontrada", "Não há ordens de serviço para o filtro ou busca selecionada.");
  }

  if (listaChamadosInicio) {
    const chamadosInicio = ordenarChamadosPorPrioridade([...chamadosVisiveis]).slice(0, 3);

    listaChamadosInicio.innerHTML = chamadosInicio.length > 0
      ? chamadosInicio.map(criarCardChamado).join("")
      : criarMensagemVazia("Nenhum chamado recente", "Abra um novo chamado para acompanhar por aqui.");
  }

  if (typeof atualizarResumoPerfil === "function") {
    atualizarResumoPerfil();
  }
}

/* =====================
   Busca, filtros e ordenação
===================== */

function obterChamadosFiltrados(lista) {
  let chamadosFiltrados = [...lista];

  if (filtroStatusAtual === "ATRASADOS") {
    chamadosFiltrados = chamadosFiltrados.filter(chamadoEstaAtrasado);
  } else if (filtroStatusAtual !== "TODOS") {
    chamadosFiltrados = chamadosFiltrados.filter(chamado => chamado.status === filtroStatusAtual);
  }

  if (termoBuscaChamados) {
    chamadosFiltrados = chamadosFiltrados.filter(chamado => {
      return montarTextoBuscaChamado(chamado).includes(termoBuscaChamados);
    });
  }

  return ordenarChamadosPorPrioridade(chamadosFiltrados);
}

function montarTextoBuscaChamado(chamado) {
  return [
    chamado.numeroOS,
    chamado.descricao,
    chamado.local,
    chamado.equipamentoCodigo,
    chamado.equipamentoNome,
    chamado.setor,
    chamado.criadoPorNome,
    chamado.categoria,
    chamado.subcategoria,
    chamado.tipoManutencao,
    chamado.prioridade,
    chamado.status
  ].join(" ").toLowerCase();
}

/* =====================
   Montagem visual do card
===================== */

function criarCardChamado(chamado) {
  const statusClasse = obterClasseStatus(chamado.status);
  const sla = calcularSLA(chamado);
  const textoSLA = formatarTextoSLAChamado(chamado, sla);
  const classePrioridade = obterClassePrioridade(chamado.prioridade);
  const classeBordaPrioridade = obterClasseBordaPrioridade(chamado.prioridade, chamado.status);
  const solicitante = chamado.criadoPorNome || chamado.solicitanteNome || "Não informado";
  const setorOuLocal = chamado.setor || chamado.local || "Não informado";
  const horario = chamado.horario || "--:--";

  return `
    <div class="ticket ticket-operational ${classeBordaPrioridade}" data-dynamic-action="abrirDetalhesChamado" data-param0="${formatarAtributoHTML(chamado.id)}">
      <div class="ticket-info ticket-operational-info">
        <div class="ticket-header-row">
          <h3>${escaparHTML(chamado.numeroOS || "OS")}</h3>
          <span class="status ${statusClasse}">${escaparHTML(chamado.status || "ABERTO")}</span>
        </div>

        <div class="ticket-detail-list">
          ${usuarioPodeVerTodasOS() ? `
            <p><span class="ticket-label">Solicitante:</span> ${escaparHTML(solicitante)}</p>
          ` : ""}
          <p><span class="ticket-label">Setor:</span> ${escaparHTML(setorOuLocal)}</p>
          <p class="ticket-description"><span class="ticket-label">Descrição:</span> ${escaparHTML(chamado.descricao || "Sem descrição informada.")}</p>
        </div>

        <div class="ticket-footer-row">
          <span class="ticket-meta" aria-label="Data da OS">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" />
              <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" stroke-linecap="round" />
            </svg>
            ${escaparHTML(chamado.data || "Data não informada")}
          </span>

          <span class="ticket-meta" aria-label="Horário da OS">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="8" stroke="currentColor" />
              <path d="M12 7v5l3 2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            ${escaparHTML(horario)}
          </span>

          <span class="priority-badge ${classePrioridade}" aria-label="Prioridade da OS">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M5 3a1 1 0 0 1 1-1h9.2c.3 0 .6.1.8.4l2.8 3.4a1 1 0 0 1 0 1.2L16 10.5l2.8 3.4a1 1 0 0 1-.8 1.6H7v5.5a1 1 0 1 1-2 0V3Z" />
            </svg>
            ${escaparHTML(chamado.prioridade || "Baixa")}
          </span>
        </div>

        <small class="sla-badge ${sla.classe}">${escaparHTML(textoSLA)}</small>
      </div>

      <span class="ticket-chevron" aria-hidden="true">›</span>
    </div>
  `;
}


function obterClassePrioridade(prioridade) {
  if (prioridade === "Urgente" || prioridade === "Crítica" || prioridade === "Alta") {
    return "priority-high";
  }

  if (prioridade === "Média") {
    return "priority-medium";
  }

  return "priority-low";
}

function obterClasseBordaPrioridade(prioridade, status) {
  if (status === "CANCELADO") {
    return "ticket-priority-canceled";
  }

  if (status === "ENCERRADO" || status === "VALIDADO" || status === "CONCLUÍDO") {
    return "ticket-priority-done";
  }

  if (prioridade === "Urgente" || prioridade === "Crítica" || prioridade === "Alta") {
    return "ticket-priority-high";
  }

  if (prioridade === "Média") {
    return "ticket-priority-medium";
  }

  return "ticket-priority-low";
}

function filtrarChamados(status, botao) {
  filtroStatusAtual = status;

  document.querySelectorAll("#filtrosOS .filter, #filtrosChamados .filter").forEach(botaoFiltro => {
    botaoFiltro.classList.remove("active");
  });

  if (botao) {
    botao.classList.add("active");
  }

  renderizarChamados();
}

function pesquisarChamados(valor) {
  termoBuscaChamados = valor.trim().toLowerCase();
  renderizarChamados();
}

function obterPesoStatus(chamado) {
  const sla = calcularSLA(chamado);

  if (chamado.status === "CONCLUÍDO") {
    return 80;
  }

  if (chamado.status === "VALIDADO") {
    return 85;
  }

  if (chamado.status === "ENCERRADO") {
    return 90;
  }

  if (chamado.status === "CANCELADO") {
    return 100;
  }

  if (chamado.prioridade === "Urgente" || chamado.prioridade === "Crítica") {
    return 1;
  }

  if (sla.texto === "Atrasado") {
    return 2;
  }

  if (sla.texto === "Vence em breve") {
    return 3;
  }

  if (chamado.status === "ABERTO") {
    return 4;
  }

  if (chamado.status === "EM ANDAMENTO") {
    return 5;
  }

  if (chamado.status === "AGUARDANDO") {
    return 6;
  }

  return 50;
}

function obterPesoPrioridade(prioridade) {
  const pesos = {
    Urgente: 1,
    Alta: 2,
    Média: 3,
    Baixa: 4
  };

  return pesos[prioridade] || 4;
}

function ordenarChamadosPorPrioridade(lista) {
  return lista.sort((a, b) => {
    const pesoStatusA = obterPesoStatus(a);
    const pesoStatusB = obterPesoStatus(b);

    if (pesoStatusA !== pesoStatusB) {
      return pesoStatusA - pesoStatusB;
    }

    const pesoPrioridadeA = obterPesoPrioridade(a.prioridade);
    const pesoPrioridadeB = obterPesoPrioridade(b.prioridade);

    if (pesoPrioridadeA !== pesoPrioridadeB) {
      return pesoPrioridadeA - pesoPrioridadeB;
    }

    const dataA = obterDataValida(a.criadoEm, a.data).getTime();
    const dataB = obterDataValida(b.criadoEm, b.data).getTime();

    return dataA - dataB;
  });
}

function calcularSLA(chamado) {
  const statusSLA = calcularStatusSLAOperacional(chamado);

  return {
    texto: obterTextoStatusSLA(statusSLA),
    classe: obterClasseStatusSLA(statusSLA),
    status: statusSLA
  };
}

function formatarVencimentoSLA(chamado) {
  const vencimento = calcularVencimentoChamado(chamado);
  return formatarDataHoraBR(vencimento) || "Prazo não definido";
}

function formatarTextoSLAChamado(chamado, sla = calcularSLA(chamado)) {
  if (["ENCERRADO", "VALIDADO", "CONCLUÍDO", "CANCELADO"].includes(chamado.status)) {
    return sla.texto;
  }

  return `${sla.texto} • vence em ${formatarVencimentoSLA(chamado)}`;
}

function chamadoEstaAtrasado(chamado) {
  return calcularStatusSLAOperacional(chamado) === "ATRASADO";
}

function obterClasseStatus(status) {
  if (status === "ENCERRADO" || status === "VALIDADO") {
    return "status-green";
  }

  if (status === "CONCLUÍDO") {
    return "status-purple";
  }

  if (status === "AGUARDANDO") {
    return "status-orange";
  }

  if (status === "CANCELADO") {
    return "status-red";
  }

  return "status-blue";
}

function obterClasseIcone(status) {
  if (status === "ENCERRADO" || status === "VALIDADO") {
    return "green-bg";
  }

  if (status === "CONCLUÍDO") {
    return "blue-bg";
  }

  if (status === "AGUARDANDO" || status === "CANCELADO") {
    return "orange-bg";
  }

  return "blue-bg";
}

function pegarIconeCategoria(categoria) {
  if (categoria === "Elétrica") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 18h6M10 22h4" stroke="currentColor" stroke-linecap="round" />
        <path d="M8 14a6 6 0 1 1 8 0c-.8.7-1.2 1.5-1.2 2.4H9.2C9.2 15.5 8.8 14.7 8 14Z" stroke="currentColor" stroke-linejoin="round" />
      </svg>
    `;
  }

  if (categoria === "Hidráulica") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 10h12a4 4 0 0 1 4 4v1" stroke="currentColor" stroke-linecap="round" />
        <path d="M6 10V6M11 10V6" stroke="currentColor" stroke-linecap="round" />
        <path d="M19 18s-2 2.2-2 3.5a2 2 0 0 0 4 0C21 20.2 19 18 19 18Z" fill="currentColor" />
      </svg>
    `;
  }

  if (categoria === "Alvenaria") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M7 3h9v18H7V3Z" fill="currentColor" opacity=".95" />
        <path d="M16 5h2v16h-2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="13" cy="12" r="1" fill="#fff" />
      </svg>
    `;
  }

  if (categoria === "Pintura") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 20h16" stroke="currentColor" stroke-linecap="round" />
        <path d="M6 16 16 6l2 2L8 18H6v-2Z" stroke="currentColor" stroke-linejoin="round" />
      </svg>
    `;
  }

  if (categoria === "Eletrônica") {
    return `
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" />
        <path d="M8 21h8M12 16v5" stroke="currentColor" stroke-linecap="round" />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-3 3-2.4-2.4 2.4-3Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}


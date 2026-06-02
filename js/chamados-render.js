/* =====================================================
   CHAMADOS - LISTAGEM, FILTROS E SLA
===================================================== */

function obterChamadosVisiveis() {
  if (typeof usuarioPossuiPerfil === "function"
    && usuarioPossuiPerfil(PERFIS_USUARIO.COLABORADOR)
    && typeof usuarioEhAutorChamado === "function") {
    return chamados.filter(chamado => usuarioEhAutorChamado(chamado));
  }

  return chamados;
}

function renderizarChamados() {
  const listaChamados = document.getElementById("listaChamados") || document.getElementById("listaOS");
  const listaChamadosInicio = document.getElementById("listaChamadosInicio") || document.getElementById("listaOSInicio");
  const chamadosVisiveis = obterChamadosVisiveis();
  const chamadosFiltrados = obterChamadosFiltrados(chamadosVisiveis);

  if (listaChamados) {
    listaChamados.innerHTML = chamadosFiltrados.length > 0
      ? chamadosFiltrados.map(criarCardChamado).join("")
      : criarMensagemVazia("Nenhum chamado encontrado", "Não há chamados para o filtro ou busca selecionada.");
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

function criarMensagemVazia(titulo, texto) {
  return `
    <div class="empty-card">
      <h3>${escaparHTML(titulo)}</h3>
      <p>${escaparHTML(texto)}</p>
    </div>
  `;
}

function criarCardChamado(chamado) {
  const statusClasse = obterClasseStatus(chamado.status);
  const iconeClasse = obterClasseIcone(chamado.status);
  const sla = calcularSLA(chamado);
  const textoSLA = chamado.prioridade === "Urgente"
    ? sla.texto
    : `${sla.texto} • vence em ${formatarVencimentoSLA(chamado)}`;

  return `
    <div class="ticket" onclick="abrirDetalhesChamado(${formatarParametroJS(chamado.id)})">
      <div class="ticket-icon ${iconeClasse}">
        ${pegarIconeCategoria(chamado.categoria)}
      </div>

      <div class="ticket-info">
        <h3>${escaparHTML(chamado.numeroOS || "OS")}: ${escaparHTML(chamado.descricao)}</h3>
        <p>
          ${escaparHTML(chamado.categoria)}${chamado.subcategoria ? ` / ${escaparHTML(chamado.subcategoria)}` : ""}
          &nbsp;•&nbsp;
          ${escaparHTML(chamado.tipoManutencao || "Corretiva")}
          &nbsp;•&nbsp;
          ${escaparHTML(chamado.local)}
          ${chamado.equipamentoCodigo ? `&nbsp;•&nbsp; Ativo ${escaparHTML(chamado.equipamentoCodigo)}` : ""}
          &nbsp;•&nbsp;
          ${escaparHTML(chamado.data)}
        </p>

        <small class="sla-badge ${sla.classe}">${escaparHTML(textoSLA)}</small>
      </div>

      <span class="status ${statusClasse}">${escaparHTML(chamado.status)}</span>
    </div>
  `;
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

  if (chamado.prioridade === "Urgente") {
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

function obterPrazoHoras(prioridade) {
  const prazos = {
    Urgente: 0,
    Alta: 1,
    Média: 24,
    Baixa: 72
  };

  return prazos[prioridade] ?? 72;
}

function calcularSLA(chamado) {
  if (chamado.status === "ENCERRADO") {
    return { texto: "Encerrado", classe: "sla-green" };
  }

  if (chamado.status === "VALIDADO") {
    return { texto: "Validado", classe: "sla-green" };
  }

  if (chamado.status === "CONCLUÍDO") {
    return { texto: "Aguardando validação", classe: "sla-blue" };
  }

  if (chamado.status === "CANCELADO") {
    return { texto: "Cancelado", classe: "sla-red" };
  }

  if (chamado.prioridade === "Urgente") {
    return { texto: "Atendimento imediato", classe: "sla-red" };
  }

  const criadoEm = obterDataValida(chamado.criadoEm, chamado.data);
  const prazoHoras = obterPrazoHoras(chamado.prioridade);
  const vencimento = new Date(criadoEm.getTime() + prazoHoras * 60 * 60 * 1000);
  const diferencaMs = vencimento - new Date();
  const diferencaHoras = Math.ceil(diferencaMs / (1000 * 60 * 60));

  if (diferencaMs < 0) {
    return { texto: "Atrasado", classe: "sla-red" };
  }

  if (diferencaHoras <= 2) {
    return { texto: "Vence em breve", classe: "sla-orange" };
  }

  return { texto: "No prazo", classe: "sla-blue" };
}

function formatarVencimentoSLA(chamado) {
  if (chamado.prioridade === "Urgente") {
    return "Imediatamente";
  }

  const criadoEm = obterDataValida(chamado.criadoEm, chamado.data);
  const prazoHoras = obterPrazoHoras(chamado.prioridade);
  const vencimento = new Date(criadoEm.getTime() + prazoHoras * 60 * 60 * 1000);

  return vencimento.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function chamadoEstaAtrasado(chamado) {
  return calcularSLA(chamado).texto === "Atrasado";
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


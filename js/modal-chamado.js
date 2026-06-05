/* =====================================================
   MODAL DE DETALHES DO CHAMADO
===================================================== */

function abrirDetalhesChamado(id) {
  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    appFeedback("Não foi possível localizar esta OS.\nAtualize a lista e tente novamente.", { tipo: "erro", titulo: "OS não encontrada" });
    return;
  }

  chamadoSelecionadoId = chamado.id;

  setTextContent("detalheTitulo", chamado.descricao);
  setTextContent("detalheData", `Aberto em ${chamado.data}`);
  setTextContent("detalheNumeroOS", chamado.numeroOS || "OS não informada");
  setTextContent("detalheCriadoPor", chamado.criadoPorNome || "Não informado");
  setTextContent("detalheEtapaFluxo", chamado.etapaFluxo || obterEtapaFluxoPorStatus(chamado.status));
  setTextContent("detalheResponsavel", `${(chamado.tecnicoResponsavel && chamado.tecnicoResponsavel.nome) || chamado.responsavelManutencao || "A definir"}${(chamado.tecnicoResponsavel && chamado.tecnicoResponsavel.funcao) ? " — " + chamado.tecnicoResponsavel.funcao : ""}`);
  setTextContent("detalheValidacao", montarTextoValidacaoOS(chamado));
  setTextContent("detalheEncerramento", montarTextoEncerramentoOS(chamado));
  setTextContent("detalheLocal", chamado.andar ? `${chamado.andar} / ${chamado.local}` : chamado.local);
  setTextContent("detalheAtivo", montarTextoAtivoChamado(chamado));
  setTextContent("detalheHorario", chamado.horario || "Não informado");
  setTextContent("detalheAcompanhamento", chamado.precisaAcompanhamento || "Não informado");
  setTextContent("detalheCategoria", chamado.categoria);
  setTextContent("detalheSubcategoria", chamado.subcategoria || "Não informada");
  setTextContent("detalheTipoManutencao", chamado.tipoManutencao || "Corretiva");
  setTextContent("detalhePrioridade", chamado.prioridade);
  configurarSeletorPrioridadeOS(chamado);
  setTextContent("detalheDescricao", chamado.descricao);

  preencherFotoDetalhe(chamado);
  preencherStatusDetalhe(chamado);
  preencherSLADetalhe(chamado);
  preencherHistoricoDetalhe(chamado);
  configurarControlesDoModal(chamado);
  resetarFeedbackBotoesModal();

  const modal = document.getElementById("modalChamado");

  if (modal) {
    modal.classList.add("active");
  }
}

function preencherFotoDetalhe(chamado) {
  const detalheFoto = document.getElementById("detalheFoto");

  if (detalheFoto) {
    detalheFoto.innerHTML = renderizarFotoDetalhe(chamado);
  }
}

function preencherStatusDetalhe(chamado) {
  const detalheStatus = document.getElementById("detalheStatus");

  if (detalheStatus) {
    detalheStatus.textContent = chamado.status;
    detalheStatus.className = `status ${obterClasseStatus(chamado.status)}`;
  }
}

function preencherSLADetalhe(chamado) {
  const detalheSLA = document.getElementById("detalheSLA");

  if (!detalheSLA) {
    return;
  }

  const sla = calcularSLA(chamado);

  detalheSLA.textContent = formatarTextoSLAChamado(chamado, sla);
}

function preencherHistoricoDetalhe(chamado) {
  const detalheHistorico = document.getElementById("detalheHistorico");

  if (detalheHistorico) {
    detalheHistorico.innerHTML = renderizarHistorico(chamado.historico || []);
  }
}

function configurarControlesDoModal(chamado) {
  const areaControleColaborador = document.getElementById("areaControleColaborador");

  if (areaControleColaborador) {
    areaControleColaborador.style.display = chamadoPodeSerCancelado(chamado) ? "block" : "none";
  }

  configurarSeletorPrioridadeOS(chamado);
}

function obterPrioridadesPermitidasOS(chamado) {
  const seletorCriacaoOS = document.getElementById("prioridadeChamado");
  const prioridadesDoFormulario = seletorCriacaoOS
    ? Array.from(seletorCriacaoOS.options).map(opcao => opcao.value).filter(Boolean)
    : [];

  const prioridadesConstantes = window.APP_CONSTANTS && Array.isArray(window.APP_CONSTANTS.PRIORIDADES_OS_LISTA)
    ? window.APP_CONSTANTS.PRIORIDADES_OS_LISTA
    : [];

  const prioridadesBase = prioridadesDoFormulario.length > 0
    ? [...prioridadesDoFormulario]
    : (prioridadesConstantes.length > 0 ? [...prioridadesConstantes] : ["Baixa", "Média", "Alta", "Urgente"]);

  const prioridadeAtual = chamado && chamado.prioridade ? String(chamado.prioridade) : "";

  if (prioridadeAtual && !prioridadesBase.includes(prioridadeAtual)) {
    prioridadesBase.push(prioridadeAtual);
  }

  return prioridadesBase;
}

function statusPermiteAlterarPrioridade(chamado) {
  if (!chamado || !chamado.status) {
    return false;
  }

  return ["ABERTO", "EM ANDAMENTO", "AGUARDANDO"].includes(chamado.status);
}

function usuarioPodeAlterarPrioridadeOS(chamado) {
  if (!chamado || !statusPermiteAlterarPrioridade(chamado)) {
    return false;
  }

  return usuarioEhManutencaoAutorizada() || usuarioEhGerencia();
}

function configurarSeletorPrioridadeOS(chamado) {
  const areaControlePrioridade = document.getElementById("areaControlePrioridadeOS");
  const seletorPrioridade = document.getElementById("seletorPrioridadeOS");

  if (!areaControlePrioridade || !seletorPrioridade) {
    return;
  }

  if (!usuarioPodeAlterarPrioridadeOS(chamado)) {
    areaControlePrioridade.style.display = "none";
    return;
  }

  const prioridades = obterPrioridadesPermitidasOS(chamado);
  seletorPrioridade.innerHTML = prioridades
    .map(prioridade => `<option value="${formatarAtributoHTML(prioridade)}">${escaparHTML(prioridade)}</option>`)
    .join("");
  seletorPrioridade.value = chamado.prioridade || prioridades[0] || "Baixa";
  areaControlePrioridade.style.display = "block";
}

async function alterarPrioridadeChamadoAtual(botao) {
  const chamado = obterChamadoSelecionado();
  const seletorPrioridade = document.getElementById("seletorPrioridadeOS");

  if (!chamado) {
    await appFeedback("Selecione uma OS antes de alterar a prioridade.", { tipo: "aviso", titulo: "Nenhuma OS selecionada" });
    return;
  }

  if (!usuarioPodeAlterarPrioridadeOS(chamado)) {
    await appFeedback("A prioridade só pode ser alterada pela gerência ou manutenção enquanto a OS estiver aberta, em andamento ou aguardando.", { tipo: "aviso", titulo: "Alteração não permitida" });
    return;
  }

  if (!seletorPrioridade) {
    await appFeedback("Não foi possível localizar o seletor de prioridade. Atualize a página e tente novamente.", { tipo: "erro", titulo: "Controle indisponível" });
    return;
  }

  const prioridadeAnterior = chamado.prioridade || "Não informada";
  const novaPrioridade = seletorPrioridade.value;

  if (!novaPrioridade) {
    await appFeedback("Escolha uma prioridade antes de salvar.", { tipo: "aviso", titulo: "Prioridade não selecionada" });
    return;
  }

  if (novaPrioridade === prioridadeAnterior) {
    await appFeedback("A prioridade selecionada já está aplicada nesta OS.", { tipo: "info", titulo: "Sem alteração" });
    return;
  }

  const agora = new Date();
  const camposSLA = montarCamposSLAChamado({
    ...chamado,
    prioridade: novaPrioridade
  }, agora);
  const vencimentoTexto = formatarDataHoraBR(camposSLA.vencimentoSLAISO);
  const itemHistorico = {
    data: agora.toLocaleString("pt-BR"),
    acao: "Prioridade alterada pela gerência",
    descricao: `Prioridade alterada de "${prioridadeAnterior}" para "${novaPrioridade}" por ${usuarioAtual.nome || "usuário autorizado"}. Novo prazo: ${camposSLA.prazoHoras}h. Vencimento recalculado: ${vencimentoTexto}.`
  };

  if (usuarioEhManutencaoAutorizada() && !usuarioEhGerencia()) {
    itemHistorico.acao = "Prioridade alterada pela manutenção";
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.dataset.textoOriginal = botao.textContent;
      botao.textContent = "Salvando...";
    }

    await atualizarChamadoFirebase(chamado.id, {
      prioridade: novaPrioridade,
      ...camposSLA,
      slaRecalculadoEmISO: agora.toISOString(),
      historico: adicionarItemArrayFirebase(itemHistorico),
      prioridadeAlteradaPorUid: usuarioAtual.id,
      prioridadeAlteradaPorNome: usuarioAtual.nome || "Usuário autorizado",
      prioridadeAlteradaEmISO: agora.toISOString()
    });

    chamado.prioridade = novaPrioridade;
    Object.assign(chamado, camposSLA, { slaRecalculadoEmISO: agora.toISOString() });
    chamado.historico = Array.isArray(chamado.historico) ? [...chamado.historico, itemHistorico] : [itemHistorico];
    chamado.prioridadeAlteradaPorUid = usuarioAtual.id;
    chamado.prioridadeAlteradaPorNome = usuarioAtual.nome || "Usuário autorizado";
    chamado.prioridadeAlteradaEmISO = agora.toISOString();

    setTextContent("detalhePrioridade", novaPrioridade);
    preencherSLADetalhe(chamado);
    preencherHistoricoDetalhe(chamado);
    renderizarChamados();

    await appFeedback(`Prioridade da OS alterada para ${novaPrioridade}.\nA alteração foi registrada no histórico.`, { tipo: "sucesso", titulo: "Prioridade atualizada" });
  } catch (erro) {
    console.error("Erro ao alterar prioridade da OS:", erro);

    if (erro && erro.code === "permission-denied") {
      await appFeedback("Não foi possível alterar a prioridade. Verifique se as regras atualizadas do Firestore foram publicadas no Firebase Console.", { tipo: "erro", titulo: "Falha de permissão" });
      return;
    }

    await appFeedback("Não foi possível alterar a prioridade da OS. Verifique sua conexão e tente novamente.", { tipo: "erro", titulo: "Falha ao salvar" });
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = botao.dataset.textoOriginal || "Salvar";
      delete botao.dataset.textoOriginal;
    }
  }
}

function resetarFeedbackBotoesModal() {
  const botaoCancelarColaborador = document.getElementById("botaoCancelarChamadoColaborador");

  if (botaoCancelarColaborador) {
    botaoCancelarColaborador.classList.remove("button-success");
    botaoCancelarColaborador.textContent = "Cancelar chamado";
  }
}

function fecharDetalhesChamado() {
  const modal = document.getElementById("modalChamado");

  if (modal) {
    modal.classList.remove("active");
  }

  chamadoSelecionadoId = null;
}

function obterIconeHistorico(acao = "") {
  const texto = acao.toLowerCase();

  if (texto.includes("criada")) return "🟢";
  if (texto.includes("status")) return "🔄";
  if (texto.includes("final")) return "✅";
  if (texto.includes("checklist")) return "✔️";
  if (texto.includes("cancel")) return "⛔";
  if (texto.includes("qr")) return "📱";

  return "📌";
}

function renderizarHistorico(historico) {
  if (!historico || historico.length === 0) {
    return `
      <div class="history-item history-empty">
        <div class="history-icon">📭</div>
        <div class="history-content">
          <strong>Sem histórico técnico</strong>
          <span>Nenhuma movimentação operacional registrada.</span>
        </div>
      </div>
    `;
  }

  return historico.map(item => `
    <div class="history-item history-timeline">
      <div class="history-icon">
        ${obterIconeHistorico(item.acao)}
      </div>

      <div class="history-content">
        <strong>${escaparHTML(item.acao)}</strong>

        <span class="history-date">
          ${escaparHTML(item.data || "-")}
        </span>

        <p>${escaparHTML(item.descricao || "Atualização registrada no sistema.")}</p>
      </div>
    </div>
  `).join("");
}

function chamadoPodeSerCancelado(chamado) {
  if (!chamado || chamado.status !== "ABERTO") {
    return false;
  }

  if (usuarioEhManutencaoAutorizada()) {
    return false;
  }

  if (usuarioPossuiPerfil(PERFIS_USUARIO.COLABORADOR) || usuarioPossuiPerfil(PERFIS_USUARIO.GERENCIA)) {
    return typeof usuarioEhAutorChamado === "function" ? usuarioEhAutorChamado(chamado) : idsIguais(chamado.criadoPorUid, usuarioAtual.id);
  }

  return false;
}

function obterChamadoSelecionado() {
  return chamados.find(chamado => idsIguais(chamado.id, chamadoSelecionadoId));
}

async function cancelarChamadoAtual(botao) {
  const chamado = obterChamadoSelecionado();

  if (!chamado) {
    await appFeedback("Selecione uma OS antes de solicitar o cancelamento.", { tipo: "aviso", titulo: "Nenhuma OS selecionada" });
    return;
  }

  if (!chamadoPodeSerCancelado(chamado)) {
    await appFeedback("Esta OS não pode ser cancelada no status atual.\nVerifique o histórico ou as permissões do seu perfil.", { tipo: "aviso", titulo: "Cancelamento não permitido" });
    return;
  }

  const motivo = await appPrompt("Informe o motivo do cancelamento.\nEsta ação ficará registrada no histórico da OS.", {
    titulo: "Motivo do cancelamento",
    placeholder: "Descreva o motivo do cancelamento",
    textoCancelar: "Voltar",
    textoConfirmar: "Confirmar cancelamento",
    obrigatorio: true,
    mensagemObrigatorio: "Para cancelar a OS, informe o motivo."
  });

  if (!motivo) {
    return;
  }

  await executarCancelamentoChamado(chamado.id, motivo.trim(), "Chamado cancelado pelo colaborador", botao);
}

async function cancelarChamadoComMotivo(id, motivo, acaoHistorico) {
  await executarCancelamentoChamado(id, motivo, acaoHistorico, null);
}

async function executarCancelamentoChamado(id, motivo, acaoHistorico, botao) {
  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    appFeedback("Não foi possível localizar esta OS.\nAtualize a lista e tente novamente.", { tipo: "erro", titulo: "OS não encontrada" });
    return;
  }

  const itemHistorico = {
    data: new Date().toLocaleString("pt-BR"),
    acao: acaoHistorico,
    descricao: motivo
  };

  try {
    await atualizarChamadoFirebase(id, {
      status: "CANCELADO",
      etapaFluxo: "Cancelado",
      historico: adicionarItemArrayFirebase(itemHistorico),
      canceladoPorUid: usuarioAtual.id,
      canceladoPorNome: usuarioAtual.nome,
      canceladoMotivo: motivo,
      canceladoEmISO: new Date().toISOString()
    });

    if (typeof registrarNotificacaoCancelamentoChamado === "function") {
      await registrarNotificacaoCancelamentoChamado(chamado, motivo);
    }

    if (botao) {
      aplicarFeedbackSucesso(botao, "Cancelado", "Cancelar chamado");
    }

    fecharDetalhesChamado();
    await appFeedback("OS cancelada com sucesso.\nO motivo foi registrado no histórico.", { tipo: "sucesso", titulo: "Cancelamento registrado" });
  } catch (erro) {
    console.error("Erro ao cancelar chamado:", erro);

    if (erro && erro.code === "permission-denied") {
      await appFeedback("Não foi possível cancelar a OS.\nVerifique se as regras do Firestore desta versão foram publicadas no Firebase Console.", { tipo: "erro", titulo: "Falha de permissão no Firestore" });
      return;
    }

    await appFeedback("Não foi possível cancelar a OS.\nVerifique sua conexão e tente novamente.", { tipo: "erro", titulo: "Falha ao cancelar" });
  }

}

function renderizarFotoDetalhe(chamado) {
  const fotos = obterFotosDoChamado(chamado);
  const fotosFinalizacao = obterFotosFinalizacaoDoChamado(chamado);

  if (fotos.length === 0 && fotosFinalizacao.length === 0) {
    if (chamado.fotoNome) {
      return escaparHTML(`${chamado.fotoNome} (prévia indisponível)`);
    }

    return "Nenhuma";
  }

  return `
    ${fotos.length > 0 ? `
      <strong class="foto-section-title">Antes / abertura do chamado</strong>
      <div class="foto-preview-grid">
        ${fotos.map((foto, indice) => `
          <div class="foto-preview-wrapper">
            <button type="button" class="foto-preview-button" data-dynamic-action="abrirFotoChamadoAtual" data-param0="${formatarAtributoHTML(indice)}">
              <img class="foto-preview" src="${foto.data}" alt="${escaparHTML(foto.nome)}" />
            </button>
            <small>${escaparHTML(`${indice + 1}/${fotos.length} • ${foto.nome}`)}</small>
            <button type="button" class="foto-preview-link" data-dynamic-action="abrirFotoChamadoAtual" data-param0="${formatarAtributoHTML(indice)}">
              Visualizar foto
            </button>
          </div>
        `).join("")}
      </div>
    ` : ""}

    ${fotosFinalizacao.length > 0 ? `
      <strong class="foto-section-title">Depois / finalização da manutenção</strong>
      <div class="foto-preview-grid">
        ${fotosFinalizacao.map((foto, indice) => `
          <div class="foto-preview-wrapper">
            <button type="button" class="foto-preview-button" data-dynamic-action="abrirFotoFinalizacaoChamadoAtual" data-param0="${formatarAtributoHTML(indice)}">
              <img class="foto-preview" src="${foto.data}" alt="${escaparHTML(foto.nome)}" />
            </button>
            <small>${escaparHTML(`${indice + 1}/${fotosFinalizacao.length} • ${foto.nome}`)}</small>
            <button type="button" class="foto-preview-link" data-dynamic-action="abrirFotoFinalizacaoChamadoAtual" data-param0="${formatarAtributoHTML(indice)}">
              Visualizar foto
            </button>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function obterFotosDoChamado(chamado) {
  if (!chamado) {
    return [];
  }

  if (Array.isArray(chamado.fotos) && chamado.fotos.length > 0) {
    return chamado.fotos
      .map(foto => ({
        nome: foto && foto.nome ? String(foto.nome) : "Foto anexada",
        data: foto && foto.data ? String(foto.data) : ""
      }))
      .filter(foto => foto.data.startsWith("data:image"));
  }

  const fotoBase64 = chamado.fotoData || chamado.foto || "";

  if (fotoBase64 && String(fotoBase64).startsWith("data:image")) {
    return [
      {
        nome: chamado.fotoNome || "Foto anexada",
        data: fotoBase64
      }
    ];
  }

  return [];
}

function obterFotosFinalizacaoDoChamado(chamado) {
  if (!chamado || !Array.isArray(chamado.fotosFinalizacao)) {
    return [];
  }

  return chamado.fotosFinalizacao
    .map(foto => ({
      nome: foto && foto.nome ? String(foto.nome) : "Foto de finalização",
      data: foto && foto.data ? String(foto.data) : ""
    }))
    .filter(foto => foto.data.startsWith("data:image"));
}

function abrirFotoChamadoAtual(indiceFoto = 0) {
  const chamado = obterChamadoSelecionado();

  if (!chamado) {
    appFeedback("Selecione uma OS antes de visualizar as fotos.", { tipo: "aviso", titulo: "Nenhuma OS selecionada" });
    return;
  }

  const fotos = obterFotosDoChamado(chamado);
  const foto = fotos[indiceFoto];

  if (!foto) {
    appFeedback("Esta OS não possui foto de abertura disponível para visualização.", { tipo: "aviso", titulo: "Foto indisponível" });
    return;
  }

  abrirVisualizacaoFoto(foto.data, foto.nome);
}

function abrirFotoFinalizacaoChamadoAtual(indiceFoto = 0) {
  const chamado = obterChamadoSelecionado();

  if (!chamado) {
    appFeedback("Selecione uma OS antes de visualizar as fotos.", { tipo: "aviso", titulo: "Nenhuma OS selecionada" });
    return;
  }

  const fotos = obterFotosFinalizacaoDoChamado(chamado);
  const foto = fotos[indiceFoto];

  if (!foto) {
    appFeedback("Esta OS ainda não possui foto de finalização disponível para visualização.", { tipo: "aviso", titulo: "Foto de finalização indisponível" });
    return;
  }

  abrirVisualizacaoFoto(foto.data, foto.nome);
}

function abrirVisualizacaoFoto(fotoBase64, nomeFoto) {
  const modalFoto = document.getElementById("modalFotoChamado");
  const imagemFoto = document.getElementById("imagemFotoChamado");
  const tituloFoto = document.getElementById("tituloFotoChamado");

  if (!modalFoto || !imagemFoto || !tituloFoto) {
    return;
  }

  imagemFoto.src = fotoBase64;
  imagemFoto.alt = nomeFoto;
  tituloFoto.textContent = nomeFoto;
  modalFoto.classList.add("active");
}

function fecharVisualizacaoFoto() {
  const modalFoto = document.getElementById("modalFotoChamado");
  const imagemFoto = document.getElementById("imagemFotoChamado");

  if (modalFoto) {
    modalFoto.classList.remove("active");
  }

  if (imagemFoto) {
    imagemFoto.removeAttribute("src");
    imagemFoto.removeAttribute("alt");
  }
}


function montarTextoAtivoChamado(chamado) {
  if (!chamado || !chamado.equipamentoCodigo) {
    return "Não vinculado";
  }

  return chamado.equipamentoNome
    ? `${chamado.equipamentoCodigo} • ${chamado.equipamentoNome}`
    : chamado.equipamentoCodigo;
}


function montarTextoValidacaoOS(chamado) {
  if (!chamado || !chamado.validadoEmISO) {
    return chamado && chamado.status === "CONCLUÍDO" ? "Pendente de validação" : "Ainda não validada";
  }

  const data = new Date(chamado.validadoEmISO);
  const dataTexto = Number.isNaN(data.getTime()) ? "data não informada" : data.toLocaleString("pt-BR");
  const responsavel = chamado.validadoPorNome || "Manutenção";
  const observacao = chamado.validacaoObservacao ? ` • ${chamado.validacaoObservacao}` : "";

  return `${responsavel} em ${dataTexto}${observacao}`;
}

function montarTextoEncerramentoOS(chamado) {
  if (!chamado || !chamado.encerradoEmISO) {
    return chamado && chamado.status === "VALIDADO" ? "Pendente de encerramento" : "Ainda não encerrada";
  }

  const data = new Date(chamado.encerradoEmISO);
  const dataTexto = Number.isNaN(data.getTime()) ? "data não informada" : data.toLocaleString("pt-BR");
  const responsavel = chamado.encerradoPorNome || "Manutenção";

  return `${responsavel} em ${dataTexto}`;
}

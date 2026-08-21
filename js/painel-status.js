/* =====================================================
   PAINEL STATUS - ALTERAÇÃO DE STATUS E FINALIZAÇÃO

   Responsabilidades:
   - salvar mudança de status pelo painel;
   - registrar conclusão, validação e encerramento;
   - proteger ações exclusivas da manutenção.

   Atenção:
   - arquivo sensível para fluxo operacional da OS.
===================================================== */


async function executarAcaoRapidaOS(id, acao, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode executar ações rápidas na OS.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("OS não encontrada.\nAtualize a lista e tente novamente.");
    return;
  }

  if (acao === "VALIDAR") {
    await validarOS(id, botao);
    return;
  }

  if (acao === "ENCERRAR") {
    await encerrarOS(id, botao);
    return;
  }

  const transicoesPermitidas = {
    ABERTO: ["EM ANDAMENTO"],
    "EM ANDAMENTO": ["AGUARDANDO", "CONCLUÍDO"],
    AGUARDANDO: ["EM ANDAMENTO", "CONCLUÍDO"]
  };
  const permitidas = transicoesPermitidas[chamado.status] || [];

  if (!permitidas.includes(acao)) {
    alert("Esta ação não está disponível para o status atual da OS.");
    return;
  }

  await alterarStatusPainel(id, acao, botao);
}

async function salvarStatusPainel(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode alterar o status da OS.");
    return;
  }

  const selectStatus = document.getElementById(`statusPainel-${id}`);

  if (!selectStatus) {
    alert("Campo de status não encontrado para esta OS.\nAtualize a página e tente novamente.");
    return;
  }

  const novoStatus = selectStatus.value;
  const chamadoAtual = chamados.find(chamado => idsIguais(chamado.id, id));

  if (!chamadoAtual) {
    alert("OS não encontrada.\nAtualize a lista e tente novamente.");
    return;
  }

  if (statusFinalizado(chamadoAtual.status)) {
    alert("Esta OS já está finalizada e não pode ser alterada.");
    return;
  }

  if (novoStatus === chamadoAtual.status) {
    alert("Esta OS já está com o status selecionado.");
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
    alert("Apenas a manutenção autorizada pode alterar o status da OS.");
    return;
  }

  const chamadoAtual = chamados.find(chamado => idsIguais(chamado.id, id));

  if (!chamadoAtual) {
    alert("OS não encontrada.\nAtualize a lista e tente novamente.");
    return;
  }

  if (statusFinalizado(chamadoAtual.status)) {
    alert("Esta OS já está finalizada e não pode ser alterada.");
    return;
  }

  if (!novoStatus) {
    alert("Selecione um status válido para continuar.");
    return;
  }

  if (novoStatus === "CANCELADO") {
    await cancelarChamado(id, botao);
    return;
  }

  const justificativaAguardando = await obterJustificativaAguardando(novoStatus);

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

  if (["ABERTO", "EM ANDAMENTO", "AGUARDANDO"].includes(novoStatus)) {
    dadosAtualizacao.slaStatusAtual = calcularStatusSLAOperacional({
      ...chamadoAtual,
      status: novoStatus
    }, agora);
  }

  if (novoStatus === "CONCLUÍDO") {
    const camposSLAFinal = montarCamposSLAFinalizacao({
      ...chamadoAtual,
      status: novoStatus
    }, agora);

    dadosAtualizacao.concluidoEmISO = agora.toISOString();
    Object.assign(dadosAtualizacao, camposSLAFinal);
    itemHistorico.descricao += ` SLA final: ${obterTextoStatusSLA(camposSLAFinal.slaStatusFinal)}. Tempo até conclusão: ${camposSLAFinal.tempoConclusaoHoras}h. Vencimento: ${formatarDataHoraBR(camposSLAFinal.vencimentoSLAISO)}.`;
  }

  try {
    await atualizarChamadoFirebase(id, dadosAtualizacao);

    if (typeof registrarNotificacaoStatusChamado === "function") {
      await registrarNotificacaoStatusChamado(chamadoAtual, novoStatus, justificativaAguardando);
    }

    aplicarFeedbackSucesso(botao, "Status salvo", "Salvar status");
    alert(`Status atualizado para: ${novoStatus}.\nA alteração foi registrada no histórico da OS.`);
  } catch (erro) {
    console.error("Erro ao alterar status:", erro);
    alert("Não foi possível alterar o status da OS.\nVerifique sua conexão e permissões no Firestore.");
  }

}

async function obterJustificativaAguardando(novoStatus) {
  if (novoStatus !== "AGUARDANDO") {
    return "";
  }

  const justificativa = await appPrompt("Explique por que a OS ficará em aguardando.\nExemplo: aguardando peça, material, autorização ou acesso ao local.", {
    titulo: "Justificativa obrigatória",
    placeholder: "Descreva o motivo do status aguardando",
    textoCancelar: "Voltar",
    textoConfirmar: "Salvar justificativa",
    obrigatorio: true,
    mensagemObrigatorio: "Informe a justificativa para continuar."
  });

  if (!justificativa || !justificativa.trim()) {
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
    alert("OS não encontrada.\nAtualize a lista e tente novamente.");
    return;
  }

  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode cancelar OS pelo painel.");
    return;
  }

  if (statusFinalizado(chamado.status)) {
    alert("Esta OS não pode ser cancelada, pois já está concluída ou cancelada.");
    return;
  }

  const motivo = await appPrompt("Informe o motivo do cancelamento.\nEssa informação ficará registrada no histórico da OS.", {
    titulo: "Motivo do cancelamento",
    placeholder: "Descreva o motivo do cancelamento",
    textoCancelar: "Voltar",
    textoConfirmar: "Confirmar cancelamento",
    obrigatorio: true,
    mensagemObrigatorio: "Informe o motivo para cancelar a OS."
  });

  if (!motivo || !motivo.trim()) {
    return;
  }

  await cancelarChamadoComMotivo(id, motivo.trim(), "OS cancelada pela manutenção");
  aplicarFeedbackSucesso(botao, "Cancelado", "Salvar status");
}

async function validarOS(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode validar OS.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("OS não encontrada.\nAtualize a lista e tente novamente.");
    return;
  }

  if (chamado.status !== "CONCLUÍDO") {
    alert("A OS só pode ser validada depois de concluída pela manutenção.");
    return;
  }

  const observacaoDigitada = await appPrompt("Registre uma observação de validação da execução.\nSe não houver observação específica, você pode confirmar em branco.", {
    titulo: "Observação de validação",
    placeholder: "Ex.: serviço conferido e aprovado",
    textoCancelar: "Voltar",
    textoConfirmar: "Registrar validação",
    linhas: 3
  });

  if (observacaoDigitada === null) {
    return;
  }

  const observacao = observacaoDigitada.trim() || "Validação registrada sem observação adicional.";
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
    alert("OS validada com sucesso.\nA validação foi registrada no histórico.");
  } catch (erro) {
    console.error("Erro ao validar OS:", erro);
    alert("Não foi possível validar a OS.\nVerifique sua conexão e permissões no Firestore.");
  }
}

async function encerrarOS(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode encerrar OS.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("OS não encontrada.\nAtualize a lista e tente novamente.");
    return;
  }

  if (chamado.status !== "VALIDADO") {
    alert("A OS só pode ser encerrada depois de validada.");
    return;
  }

  if (!(await appConfirm("Confirmar o encerramento definitivo desta OS?\nApós encerrar, o ciclo da ordem de serviço será considerado finalizado.", { titulo: "Encerrar OS", textoConfirmar: "Encerrar OS", textoCancelar: "Voltar" }))) {
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
    alert("OS encerrada com sucesso.\nO ciclo da ordem de serviço foi finalizado.");
  } catch (erro) {
    console.error("Erro ao encerrar OS:", erro);
    alert("Não foi possível encerrar a OS.\nVerifique sua conexão e permissões no Firestore.");
  }
}

async function selecionarFotoFinalizacao(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode incluir foto de finalização.");
    return;
  }

  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    alert("OS não encontrada.\nAtualize a lista e tente novamente.");
    return;
  }

  if (chamado.status !== "CONCLUÍDO") {
    alert("A foto de finalização só pode ser incluída depois que a OS estiver concluída.");
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
    alert("Apenas a manutenção autorizada pode incluir foto de finalização.");
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
    alert("Foto de finalização anexada com sucesso.\nO registro visual foi salvo no histórico da OS.");
  } catch (erro) {
    console.error("Erro ao anexar foto de finalização:", erro);
    alert("Não foi possível anexar a foto de finalização.\nVerifique a imagem, sua conexão e tente novamente.");

    if (botao) {
      botao.disabled = false;
      botao.textContent = "Adicionar foto final";
    }
  }
}

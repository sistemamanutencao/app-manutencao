/* =====================================================
   MODAL DE DETALHES DO CHAMADO
===================================================== */

function abrirDetalhesChamado(id) {
  const chamado = chamados.find(item => idsIguais(item.id, id));

  if (!chamado) {
    appFeedback("Chamado não encontrado.", { tipo: "erro" });
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

  detalheSLA.textContent = chamado.prioridade === "Urgente"
    ? sla.texto
    : `${sla.texto} • vence em ${formatarVencimentoSLA(chamado)}`;
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

  if (usuarioPossuiPerfil(PERFIS_USUARIO.COLABORADOR)) {
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
    await appFeedback("Nenhum chamado selecionado para cancelamento.", { tipo: "aviso" });
    return;
  }

  if (!chamadoPodeSerCancelado(chamado)) {
    await appFeedback("Este chamado não pode ser cancelado.", { tipo: "aviso" });
    return;
  }

  const motivo = await appPrompt("Informe o motivo do cancelamento. Esta ação não poderá ser desfeita pelo colaborador.", {
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
    appFeedback("Chamado não encontrado.", { tipo: "erro" });
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
    await appFeedback("Chamado cancelado com sucesso.", { tipo: "sucesso" });
  } catch (erro) {
    console.error("Erro ao cancelar chamado:", erro);

    if (erro && erro.code === "permission-denied") {
      await appFeedback("Não foi possível cancelar o chamado no Firebase. Verifique se as regras do Firestore desta versão foram publicadas no Firebase Console.", { tipo: "erro" });
      return;
    }

    await appFeedback("Não foi possível cancelar o chamado no Firebase.", { tipo: "erro" });
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
            <button type="button" class="foto-preview-button" onclick="abrirFotoChamadoAtual(${indice})">
              <img class="foto-preview" src="${foto.data}" alt="${escaparHTML(foto.nome)}" />
            </button>
            <small>${escaparHTML(`${indice + 1}/${fotos.length} • ${foto.nome}`)}</small>
            <button type="button" class="foto-preview-link" onclick="abrirFotoChamadoAtual(${indice})">
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
            <button type="button" class="foto-preview-button" onclick="abrirFotoFinalizacaoChamadoAtual(${indice})">
              <img class="foto-preview" src="${foto.data}" alt="${escaparHTML(foto.nome)}" />
            </button>
            <small>${escaparHTML(`${indice + 1}/${fotosFinalizacao.length} • ${foto.nome}`)}</small>
            <button type="button" class="foto-preview-link" onclick="abrirFotoFinalizacaoChamadoAtual(${indice})">
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
    appFeedback("Nenhum chamado selecionado.", { tipo: "aviso" });
    return;
  }

  const fotos = obterFotosDoChamado(chamado);
  const foto = fotos[indiceFoto];

  if (!foto) {
    appFeedback("Este chamado não possui uma foto disponível para visualização.", { tipo: "aviso" });
    return;
  }

  abrirVisualizacaoFoto(foto.data, foto.nome);
}

function abrirFotoFinalizacaoChamadoAtual(indiceFoto = 0) {
  const chamado = obterChamadoSelecionado();

  if (!chamado) {
    appFeedback("Nenhum chamado selecionado.", { tipo: "aviso" });
    return;
  }

  const fotos = obterFotosFinalizacaoDoChamado(chamado);
  const foto = fotos[indiceFoto];

  if (!foto) {
    appFeedback("Este chamado não possui uma foto de finalização disponível para visualização.", { tipo: "aviso" });
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

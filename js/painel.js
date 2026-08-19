/* =====================================================
   PAINEL - FILTROS E RENDERIZAÇÃO PRINCIPAL

   Responsabilidades:
   - controlar busca e filtros do painel;
   - renderizar visão operacional da manutenção/gerência;
   - acionar atualização de indicadores e cards.

   Atenção:
   - não conceder ações operacionais à gerência neste módulo.
===================================================== */


function selecionarAbaFilaPainel(aba) {
  abaFilaPainelAtual = aba === "ENCERRADAS" ? "ENCERRADAS" : "ATIVAS";
  filtroPainelStatusAtual = "TODOS";

  const filtroStatus = document.getElementById("filtroPainelStatus");
  if (filtroStatus) {
    filtroStatus.value = "TODOS";
    filtroStatus.disabled = abaFilaPainelAtual === "ENCERRADAS";
  }

  renderizarPainelManutencao();
}

function atualizarAbasFilaPainel() {
  const totalEncerradas = chamados.filter(chamado => chamado.status === "ENCERRADO").length;
  const totalAtivas = chamados.length - totalEncerradas;
  const abaAtivas = document.getElementById("abaFilaAtivas");
  const abaEncerradas = document.getElementById("abaFilaEncerradas");
  const contadorAtivas = document.getElementById("contadorFilaAtivas");
  const contadorEncerradas = document.getElementById("contadorFilaEncerradas");

  if (contadorAtivas) contadorAtivas.textContent = totalAtivas;
  if (contadorEncerradas) contadorEncerradas.textContent = totalEncerradas;

  if (abaAtivas) {
    const ativa = abaFilaPainelAtual === "ATIVAS";
    abaAtivas.classList.toggle("active", ativa);
    abaAtivas.setAttribute("aria-selected", String(ativa));
  }

  if (abaEncerradas) {
    const ativa = abaFilaPainelAtual === "ENCERRADAS";
    abaEncerradas.classList.toggle("active", ativa);
    abaEncerradas.setAttribute("aria-selected", String(ativa));
  }
}

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
  atualizarAbasFilaPainel();
  atualizarPainelExclusaoEncerradas();

  const filaFiltrada = obterFilaPainelFiltrada();
  const tituloVazio = abaFilaPainelAtual === "ENCERRADAS"
    ? "Nenhuma OS encerrada encontrada"
    : "Nenhuma OS ativa encontrada";
  const textoVazio = abaFilaPainelAtual === "ENCERRADAS"
    ? "Não há ordens de serviço encerradas para os filtros selecionados."
    : "Não há ordens de serviço ativas para os filtros selecionados.";

  listaPainel.innerHTML = filaFiltrada.length > 0
    ? filaFiltrada.map(criarCardPainel).join("")
    : criarMensagemVazia(tituloVazio, textoVazio);

  // Garante que cada OS da fila sempre seja exibida recolhida após qualquer
  // renderização, troca de aba, busca, filtro ou atualização de status.
  listaPainel.querySelectorAll("details.admin-card-collapsible").forEach(card => {
    card.open = false;
    card.removeAttribute("open");
  });
}


/* Indicadores, cards e fluxo de status foram separados em módulos dedicados. */

function atualizarPainelExclusaoEncerradas() {
  const painelExclusao = document.getElementById("painelExcluirEncerradas");

  if (!painelExclusao) {
    return;
  }

  const deveExibir = abaFilaPainelAtual === "ENCERRADAS" && usuarioEhManutencaoAutorizada();

  painelExclusao.hidden = !deveExibir;
  painelExclusao.classList.toggle("is-visible", deveExibir);
  painelExclusao.setAttribute("aria-hidden", String(!deveExibir));
}

async function excluirChamadoEncerrado(id, botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode excluir OS encerradas.");
    return;
  }

  const chamado = chamados.find(item => String(item.id) === String(id));

  if (!chamado) {
    alert("OS não encontrada. Atualize a tela e tente novamente.");
    return;
  }

  if (chamado.status !== "ENCERRADO") {
    alert("Apenas OS com status ENCERRADO podem ser excluídas por esta opção.");
    return;
  }

  const numero = chamado.numeroOS || chamado.id;
  const confirmado = await appConfirm(
    `Deseja excluir definitivamente a OS ${numero}?

Antes de confirmar, verifique se ela já foi exportada. Essa ação remove o registro do Firebase e não pode ser desfeita pelo app.`,
    { titulo: "Excluir OS encerrada", textoConfirmar: "Excluir definitivamente", textoCancelar: "Voltar" }
  );

  if (!confirmado) {
    return;
  }

  try {
    if (botao) aplicarFeedbackCarregando(botao, "Excluindo...");
    await excluirChamadoFirebase(id);
    chamados = chamados.filter(item => String(item.id) !== String(id));
    if (botao) aplicarFeedbackSucesso(botao, "Excluída", "Excluir OS");
    renderizarPainelManutencao();
    alert("OS encerrada excluída com sucesso.");
  } catch (erro) {
    console.error("Erro ao excluir OS encerrada:", erro);
    if (botao) aplicarFeedbackErro(botao, "Erro", "Excluir OS");
    alert("Não foi possível excluir a OS encerrada. Verifique sua conexão e permissões no Firestore.");
  }
}

async function excluirOSEncerradasFiltradas(botao) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Somente a manutenção autorizada pode excluir OS encerradas.");
    return;
  }

  if (abaFilaPainelAtual !== "ENCERRADAS") {
    alert("Entre na aba OS encerradas antes de executar a limpeza.");
    return;
  }

  const lista = obterFilaPainelFiltrada().filter(chamado => chamado.status === "ENCERRADO");

  if (!lista.length) {
    alert("Nenhuma OS encerrada encontrada para exclusão com os filtros atuais.");
    return;
  }

  const confirmado = await appConfirm(
    `Deseja excluir definitivamente ${lista.length} OS encerrada(s) filtrada(s)?

Use esta opção somente depois de exportar o relatório. A exclusão remove os registros do Firebase e não pode ser desfeita pelo app.`,
    { titulo: "Excluir OS encerradas", textoConfirmar: "Excluir definitivamente", textoCancelar: "Voltar" }
  );

  if (!confirmado) {
    return;
  }

  try {
    if (botao) aplicarFeedbackCarregando(botao, "Excluindo...");
    await Promise.all(lista.map(chamado => excluirChamadoFirebase(chamado.id)));
    const idsExcluidos = new Set(lista.map(chamado => String(chamado.id)));
    chamados = chamados.filter(chamado => !idsExcluidos.has(String(chamado.id)));
    if (botao) aplicarFeedbackSucesso(botao, "Excluídas", "Excluir encerradas filtradas");
    renderizarPainelManutencao();
    alert(`${lista.length} OS encerrada(s) excluída(s) com sucesso.`);
  } catch (erro) {
    console.error("Erro ao excluir OS encerradas filtradas:", erro);
    if (botao) aplicarFeedbackErro(botao, "Erro", "Excluir encerradas filtradas");
    alert("Não foi possível concluir a exclusão das OS encerradas. Verifique sua conexão e permissões no Firestore.");
  }
}

/* =====================================================
   NAVEGAÇÃO
===================================================== */

function openPage(pageId, navElement) {
  let paginaDestino = pageId;
  let itemNavegacao = navElement;

  if (!usuarioTemPerfilSalvo() && paginaDestino !== "perfil") {
    paginaDestino = "perfil";
    itemNavegacao = null;
  }

  const paginasRestritasManutencao = ["painel", "ativos", "preventivas"];

  if (paginasRestritasManutencao.includes(paginaDestino) && !usuarioEhManutencaoAutorizada()) {
    alert("Acesso permitido somente para a manutenção autorizada.");
    return;
  }

  const paginaSelecionada = document.getElementById(paginaDestino);

  if (!paginaSelecionada) {
    console.error("Página não encontrada:", paginaDestino);
    return;
  }

  trocarPaginaAtiva(paginaSelecionada);
  atualizarItemNavegacaoAtivo(paginaDestino, itemNavegacao);
  executarRenderizacaoDaPagina(paginaDestino);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function trocarPaginaAtiva(paginaSelecionada) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  paginaSelecionada.classList.add("active");
}

function atualizarItemNavegacaoAtivo(pageId, navElement) {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.classList.remove("active");
  });

  if (navElement) {
    navElement.classList.add("active");
    return;
  }

  const navMap = {
    inicio: 0,
    chamados: 1,
    novo: 2,
    comunicados: 3,
    perfil: 4
  };

  const indice = navMap[pageId];

  if (indice !== undefined && navItems[indice]) {
    navItems[indice].classList.add("active");
  }
}

function executarRenderizacaoDaPagina(pageId) {
  if (pageId === "painel") {
    renderizarPainelManutencao();
  }

  if (pageId === "chamados" || pageId === "inicio") {
    renderizarChamados();
  }

  if ((pageId === "comunicados" || pageId === "inicio") && typeof renderizarComunicados === "function") {
    renderizarComunicados();
  }

  if (pageId === "ativos" && typeof renderizarAtivos === "function") {
    renderizarAtivos();
  }

  if (pageId === "leitor-qr" && typeof renderizarResultadoLeitorQR === "function") {
    renderizarResultadoLeitorQR(null);
  }

  if (pageId === "preventivas" && typeof renderizarPlanosPreventivos === "function") {
    renderizarPlanosPreventivos();
  }

  if (pageId === "diagnostico" && typeof renderizarDiagnosticos === "function") {
    inicializarFormularioDiagnostico();
    renderizarDiagnosticos();
  }

  if (pageId === "perfil") {
    aplicarPermissoesNaTela();
  }
}

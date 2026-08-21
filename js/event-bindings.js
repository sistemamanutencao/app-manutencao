/* =====================================================
   EVENT BINDINGS - VÍNCULOS DE EVENTOS DA INTERFACE

   Responsabilidades:
   - delegar eventos estáticos do index.html;
   - delegar eventos dinâmicos gerados por JavaScript;
   - substituir atributos inline como onclick, onchange e oninput;
   - consumir os mapas definidos em event-action-maps.js.

   Atenção:
   - este arquivo não deve conter regra de negócio;
   - as funções chamadas aqui continuam nos módulos específicos;
   - novos botões dinâmicos devem usar data-dynamic-action.
===================================================== */

(function inicializarEventBindings() {
  const mapasDeAcoes = window.APP_EVENT_ACTION_MAPS || {};
  const acoesClique = mapasDeAcoes.acoesClique || {};
  const acoesMudanca = mapasDeAcoes.acoesMudanca || {};
  const acoesDinamicas = mapasDeAcoes.acoesDinamicas || {};
  const acoesEntrada = mapasDeAcoes.acoesEntrada || {};

  document.addEventListener("click", function aoClicarNaTela(evento) {
    const elementoNavegacao = evento.target.closest("[data-nav-page]");

    if (elementoNavegacao) {
      evento.preventDefault();
      const itemNavegacao = elementoNavegacao.classList.contains("nav-item") ? elementoNavegacao : undefined;
      executarAcao("openPage", elementoNavegacao.dataset.navPage, itemNavegacao);
      return;
    }

    const filtroOS = evento.target.closest("[data-os-filter]");

    if (filtroOS) {
      evento.preventDefault();
      executarAcao("filtrarOS", filtroOS.dataset.osFilter, filtroOS);
      return;
    }

    const elementoAcaoDinamica = evento.target.closest("[data-dynamic-action]");

    if (elementoAcaoDinamica) {
      evento.preventDefault();
      executarAcaoDinamica(elementoAcaoDinamica, acoesDinamicas);
      return;
    }

    const elementoAcao = evento.target.closest("[data-action]");

    if (!elementoAcao) {
      return;
    }

    const acao = acoesClique[elementoAcao.dataset.action];

    if (typeof acao === "function") {
      evento.preventDefault();
      acao(elementoAcao);
    }
  });

  document.addEventListener("change", function aoAlterarCampo(evento) {
    const elemento = evento.target.closest("[data-change-action]");

    if (!elemento) {
      return;
    }

    const acao = acoesMudanca[elemento.dataset.changeAction];

    if (typeof acao === "function") {
      acao(elemento);
    }
  });

  document.addEventListener("input", function aoDigitarNoCampo(evento) {
    const elemento = evento.target.closest("[data-input-action]");

    if (!elemento) {
      return;
    }

    const acao = acoesEntrada[elemento.dataset.inputAction];

    if (typeof acao === "function") {
      acao(elemento);
    }
  });

  document.addEventListener("submit", function aoEnviarFormulario(evento) {
    const formulario = evento.target.closest('[data-form-action="bloquear-submit"]');

    if (formulario) {
      evento.preventDefault();
    }
  });
})();

function executarAcaoDinamica(elemento, mapaAcoes) {
  const nomeAcao = elemento.dataset.dynamicAction;
  const acao = mapaAcoes[nomeAcao];

  if (typeof acao !== "function") {
    console.warn(`Ação dinâmica de interface não encontrada: ${nomeAcao}`);
    return undefined;
  }

  const argumentos = obterParametrosDinamicos(elemento);

  if (elemento.dataset.passElement === "true") {
    argumentos.push(elemento);
  }

  return acao(...argumentos);
}

function obterParametrosDinamicos(elemento) {
  return Object.entries(elemento.dataset)
    .filter(([chave]) => /^param\d+$/.test(chave))
    .sort(([chaveA], [chaveB]) => Number(chaveA.replace("param", "")) - Number(chaveB.replace("param", "")))
    .map(([, valor]) => valor);
}

function executarAcao(nomeFuncao, ...argumentos) {
  const funcao = window[nomeFuncao];

  if (typeof funcao !== "function") {
    console.warn(`Ação de interface não encontrada: ${nomeFuncao}`);
    return undefined;
  }

  return funcao(...argumentos);
}

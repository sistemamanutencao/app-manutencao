/* =====================================================
   FEEDBACK VISUAL DO APP
   Substitui alert() nativo por modal próprio sem exibir
   o endereço do site no topo da mensagem.

   v12:
   - separa título e descrição para melhorar leitura;
   - mantém compatibilidade com alert(), appFeedback(), appConfirm() e appPrompt();
   - não altera fluxos de login, Firebase, OS ou permissões.
===================================================== */
(function () {
  const TEMPO_FECHAMENTO_AUTOMATICO = 0;

  const TITULOS_PADRAO = {
    sucesso: "Ação concluída",
    erro: "Não foi possível concluir",
    aviso: "Atenção necessária",
    info: "Informação",
    confirmacao: "Confirmar ação"
  };

  const TEXTOS_BOTAO_PADRAO = {
    sucesso: "Entendi",
    erro: "Entendi",
    aviso: "Entendi",
    info: "Entendi",
    confirmacao: "Confirmar"
  };

  function normalizarMensagem(mensagem) {
    if (mensagem === undefined || mensagem === null) {
      return "";
    }

    return String(mensagem).trim();
  }

  function obterTipoFeedback(mensagem, tipoInformado) {
    if (tipoInformado) {
      return tipoInformado;
    }

    const texto = normalizarMensagem(mensagem).toLowerCase();

    if (
      texto.includes("sucesso") ||
      texto.includes("realizado") ||
      texto.includes("publicado") ||
      texto.includes("cadastrado") ||
      texto.includes("excluído") ||
      texto.includes("excluido") ||
      texto.includes("atualizado") ||
      texto.includes("validada") ||
      texto.includes("encerrada") ||
      texto.includes("inativado") ||
      texto.includes("aberta com sucesso") ||
      texto.includes("registrada")
    ) {
      return "sucesso";
    }

    if (
      texto.includes("não foi possível") ||
      texto.includes("erro") ||
      texto.includes("falha") ||
      texto.includes("não encontrado") ||
      texto.includes("não encontrada") ||
      texto.includes("não possui") ||
      texto.includes("bloqueou")
    ) {
      return "erro";
    }

    if (
      texto.includes("somente") ||
      texto.includes("obrigatório") ||
      texto.includes("preencha") ||
      texto.includes("informe") ||
      texto.includes("selecione") ||
      texto.includes("não pode") ||
      texto.includes("permitido") ||
      texto.includes("confirme") ||
      texto.includes("deseja") ||
      texto.includes("antes de")
    ) {
      return "aviso";
    }

    return "info";
  }

  function obterIcone(tipo) {
    const icones = {
      sucesso: "✓",
      erro: "!",
      aviso: "!",
      info: "i",
      confirmacao: "?"
    };

    return icones[tipo] || icones.info;
  }

  function montarConteudoMensagem(mensagem, tipo, opcoes) {
    const texto = normalizarMensagem(mensagem);
    const linhas = texto.split("\n").map(linha => linha.trim()).filter(Boolean);
    const titulo = opcoes.titulo || TITULOS_PADRAO[tipo] || TITULOS_PADRAO.info;
    const corpo = linhas.length > 0 ? linhas.join("\n") : "Operação processada.";

    return { titulo, corpo };
  }

  function garantirEstruturaModal() {
    let modal = document.getElementById("appFeedbackModal");

    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.id = "appFeedbackModal";
    modal.className = "app-feedback-overlay";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="app-feedback-card" role="dialog" aria-modal="true" aria-labelledby="appFeedbackTitle" aria-describedby="appFeedbackMessage">
        <div class="app-feedback-icon" id="appFeedbackIcon">i</div>
        <div class="app-feedback-content">
          <strong class="app-feedback-title" id="appFeedbackTitle">Informação</strong>
          <div class="app-feedback-message" id="appFeedbackMessage"></div>
        </div>
        <div class="app-feedback-actions" id="appFeedbackActions">
          <button type="button" class="app-feedback-button app-feedback-button-primary" id="appFeedbackOk">Entendi</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  function fecharModal(modal, resolver, valor) {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("app-feedback-open");

    if (typeof resolver === "function") {
      resolver(valor);
    }
  }

  function mostrarFeedback(mensagem, opcoes = {}) {
    const texto = normalizarMensagem(mensagem);
    const tipo = obterTipoFeedback(texto, opcoes.tipo);
    const modal = garantirEstruturaModal();
    const card = modal.querySelector(".app-feedback-card");
    const icone = modal.querySelector("#appFeedbackIcon");
    const tituloElemento = modal.querySelector("#appFeedbackTitle");
    const mensagemElemento = modal.querySelector("#appFeedbackMessage");
    const acoes = modal.querySelector("#appFeedbackActions");
    const conteudo = montarConteudoMensagem(texto, tipo, opcoes);

    card.className = `app-feedback-card app-feedback-${tipo}`;
    icone.className = `app-feedback-icon app-feedback-icon-${tipo}`;
    icone.textContent = obterIcone(tipo);
    tituloElemento.textContent = conteudo.titulo;
    mensagemElemento.textContent = conteudo.corpo;

    acoes.innerHTML = "";

    return new Promise(resolve => {
      if (opcoes.confirmacao) {
        const botaoCancelar = document.createElement("button");
        botaoCancelar.type = "button";
        botaoCancelar.className = "app-feedback-button app-feedback-button-secondary";
        botaoCancelar.textContent = opcoes.textoCancelar || "Voltar";

        const botaoConfirmar = document.createElement("button");
        botaoConfirmar.type = "button";
        botaoConfirmar.className = "app-feedback-button app-feedback-button-primary";
        botaoConfirmar.textContent = opcoes.textoConfirmar || TEXTOS_BOTAO_PADRAO.confirmacao;

        botaoCancelar.onclick = () => fecharModal(modal, resolve, false);
        botaoConfirmar.onclick = () => fecharModal(modal, resolve, true);

        acoes.appendChild(botaoCancelar);
        acoes.appendChild(botaoConfirmar);
      } else {
        const botaoOk = document.createElement("button");
        botaoOk.type = "button";
        botaoOk.className = "app-feedback-button app-feedback-button-primary";
        botaoOk.textContent = opcoes.textoConfirmar || TEXTOS_BOTAO_PADRAO[tipo] || "Entendi";
        botaoOk.onclick = () => fecharModal(modal, resolve, true);
        acoes.appendChild(botaoOk);
      }

      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("app-feedback-open");

      const botaoFoco = acoes.querySelector("button:last-child");
      if (botaoFoco) {
        setTimeout(() => botaoFoco.focus(), 80);
      }

      if (!opcoes.confirmacao && TEMPO_FECHAMENTO_AUTOMATICO > 0) {
        setTimeout(() => fecharModal(modal, resolve, true), TEMPO_FECHAMENTO_AUTOMATICO);
      }
    });
  }

  function solicitarTextoFeedback(mensagem, opcoes = {}) {
    const modal = garantirEstruturaModal();
    const card = modal.querySelector(".app-feedback-card");
    const icone = modal.querySelector("#appFeedbackIcon");
    const tituloElemento = modal.querySelector("#appFeedbackTitle");
    const mensagemElemento = modal.querySelector("#appFeedbackMessage");
    const acoes = modal.querySelector("#appFeedbackActions");

    card.className = "app-feedback-card app-feedback-aviso";
    icone.className = "app-feedback-icon app-feedback-icon-aviso";
    icone.textContent = "!";
    tituloElemento.textContent = opcoes.titulo || "Informação obrigatória";
    mensagemElemento.textContent = normalizarMensagem(mensagem);

    const campo = document.createElement("textarea");
    campo.className = "app-feedback-input";
    campo.rows = Number(opcoes.linhas || 4);
    campo.placeholder = opcoes.placeholder || "Digite aqui";
    campo.value = opcoes.valorInicial || "";

    mensagemElemento.appendChild(campo);
    acoes.innerHTML = "";

    return new Promise(resolve => {
      const botaoCancelar = document.createElement("button");
      botaoCancelar.type = "button";
      botaoCancelar.className = "app-feedback-button app-feedback-button-secondary";
      botaoCancelar.textContent = opcoes.textoCancelar || "Voltar";

      const botaoConfirmar = document.createElement("button");
      botaoConfirmar.type = "button";
      botaoConfirmar.className = "app-feedback-button app-feedback-button-primary";
      botaoConfirmar.textContent = opcoes.textoConfirmar || "Confirmar";

      botaoCancelar.onclick = () => fecharModal(modal, resolve, null);
      const avisoObrigatorio = document.createElement("small");
      avisoObrigatorio.className = "app-feedback-field-error";
      avisoObrigatorio.textContent = opcoes.mensagemObrigatorio || "Este campo é obrigatório.";
      avisoObrigatorio.hidden = true;
      mensagemElemento.appendChild(avisoObrigatorio);

      botaoConfirmar.onclick = () => {
        const valor = campo.value.trim();

        if (opcoes.obrigatorio && !valor) {
          campo.classList.add("app-feedback-input-error");
          campo.setAttribute("aria-invalid", "true");
          avisoObrigatorio.hidden = false;
          campo.focus();
          return;
        }

        fecharModal(modal, resolve, valor);
      };

      campo.addEventListener("input", () => {
        if (campo.value.trim()) {
          campo.classList.remove("app-feedback-input-error");
          campo.removeAttribute("aria-invalid");
          avisoObrigatorio.hidden = true;
        }
      });

      acoes.appendChild(botaoCancelar);
      acoes.appendChild(botaoConfirmar);

      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("app-feedback-open");
      setTimeout(() => campo.focus(), 80);
    });
  }

  window.appFeedback = mostrarFeedback;
  window.appConfirm = function (mensagem, opcoes = {}) {
    return mostrarFeedback(mensagem, {
      ...opcoes,
      tipo: opcoes.tipo || "confirmacao",
      titulo: opcoes.titulo || TITULOS_PADRAO.confirmacao,
      confirmacao: true
    });
  };

  window.appPrompt = solicitarTextoFeedback;

  window.alert = function (mensagem) {
    mostrarFeedback(mensagem);
  };
})();

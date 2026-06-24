/* =====================================================
   INVENTÁRIO DA UNIDADE

   Primeira versão integrada:
   - consulta por andar, ambiente e área interna;
   - imagem de referência por item;
   - quantidade disponível em estoque;
   - persistência local no navegador.
===================================================== */

(function inicializarModuloInventario() {
  "use strict";

  const CHAVE_ARMAZENAMENTO_INVENTARIO = "inventario-unidade-v1";
  const estadoInventario = {
    aba: "ambientes",
    caminho: [],
    local: carregarEstadoLocalInventario()
  };

  function obterDadosInventario() {
    return window.INVENTARIO_DATA || { catalogo: [], andares: [] };
  }

  function carregarEstadoLocalInventario() {
    try {
      const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO_INVENTARIO);
      const estado = salvo ? JSON.parse(salvo) : null;
      const normalizado = estado && typeof estado === "object" ? estado : { itens: {} };

      if (!normalizado.itens || typeof normalizado.itens !== "object") {
        normalizado.itens = {};
      }

      const cadastroAntigo = normalizado.itens["torneira-temporizada"];
      const cadastroBlukit = normalizado.itens["torneira-temporizada-blukit"];

      if (cadastroAntigo) {
        normalizado.itens["torneira-temporizada-blukit"] = {
          estoque: cadastroBlukit?.estoque ?? cadastroAntigo.estoque ?? null,
          imagem: cadastroBlukit?.imagem || cadastroAntigo.imagem || ""
        };
        delete normalizado.itens["torneira-temporizada"];
        localStorage.setItem(CHAVE_ARMAZENAMENTO_INVENTARIO, JSON.stringify(normalizado));
      }

      return normalizado;
    } catch (erro) {
      console.warn("Não foi possível carregar o inventário local:", erro);
      return { itens: {} };
    }
  }

  function salvarEstadoLocalInventario() {
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO_INVENTARIO, JSON.stringify(estadoInventario.local));
      return true;
    } catch (erro) {
      console.error("Não foi possível salvar o inventário local:", erro);
      alert("Não foi possível salvar a imagem ou o estoque neste navegador. Remova imagens antigas ou libere espaço e tente novamente.");
      return false;
    }
  }

  function obterEstadoItemInventario(itemId) {
    if (!estadoInventario.local.itens || typeof estadoInventario.local.itens !== "object") {
      estadoInventario.local.itens = {};
    }

    if (!estadoInventario.local.itens[itemId]) {
      estadoInventario.local.itens[itemId] = { estoque: null, imagem: "" };
    }

    return estadoInventario.local.itens[itemId];
  }

  function obterItemCatalogoInventario(itemId) {
    return obterDadosInventario().catalogo.find(item => item.id === itemId);
  }

  function contarInstaladosInventario(itemId) {
    let total = 0;

    function visitar(no) {
      (no.itens || []).forEach(entrada => {
        if (entrada.itemId === itemId) {
          total += Number(entrada.quantidade) || 0;
        }
      });

      (no.subareas || []).forEach(visitar);
      (no.ambientes || []).forEach(visitar);
    }

    obterDadosInventario().andares.forEach(visitar);
    return total;
  }

  function contarAreasFinaisInventario(no) {
    if (Array.isArray(no.itens)) {
      return 1;
    }

    const filhos = no.subareas || no.ambientes || [];
    return filhos.reduce((soma, filho) => soma + contarAreasFinaisInventario(filho), 0);
  }

  function somarItensAreaInventario(area) {
    return (area.itens || []).reduce((soma, item) => soma + Number(item.quantidade || 0), 0);
  }

  function criarImagemInventario(itemId, classe = "inventario-foto") {
    const imagem = obterEstadoItemInventario(itemId).imagem;

    if (imagem) {
      return `<img class="${classe}" src="${imagem}" alt="Imagem de referência do item">`;
    }

    return '<div class="inventario-sem-foto" aria-hidden="true">SEM FOTO</div>';
  }

  function renderizarInventario() {
    const conteudo = document.getElementById("inventarioConteudo");
    const botaoVoltar = document.getElementById("botaoVoltarInventario");

    if (!conteudo) {
      return;
    }

    if (botaoVoltar) {
      botaoVoltar.hidden = estadoInventario.aba !== "ambientes" || estadoInventario.caminho.length === 0;
    }

    document.querySelectorAll("[data-inventario-tab]").forEach(botao => {
      const ativa = botao.dataset.inventarioTab === estadoInventario.aba;
      botao.classList.toggle("is-active", ativa);
      botao.setAttribute("aria-selected", String(ativa));
    });

    if (estadoInventario.aba === "estoque") {
      renderizarEstoqueInventario();
      return;
    }

    renderizarCaminhoAmbientesInventario();
  }

  function renderizarCaminhoAmbientesInventario() {
    const dados = obterDadosInventario();

    if (estadoInventario.caminho.length === 0) {
      renderizarAndaresInventario();
      return;
    }

    const andar = dados.andares.find(item => item.id === estadoInventario.caminho[0]);

    if (!andar) {
      estadoInventario.caminho = [];
      renderizarAndaresInventario();
      return;
    }

    if (estadoInventario.caminho.length === 1) {
      renderizarFilhosInventario(andar.ambientes, andar.nome);
      return;
    }

    let atual = andar;

    for (const id of estadoInventario.caminho.slice(1)) {
      const filhos = atual.ambientes || atual.subareas || [];
      atual = filhos.find(item => item.id === id);

      if (!atual) {
        estadoInventario.caminho = [];
        renderizarAndaresInventario();
        return;
      }
    }

    if (Array.isArray(atual.subareas)) {
      renderizarFilhosInventario(atual.subareas, atual.nome);
      return;
    }

    renderizarItensDoAmbienteInventario(atual);
  }

  function renderizarAndaresInventario() {
    const dados = obterDadosInventario();
    const conteudo = document.getElementById("inventarioConteudo");
    const totalAreas = dados.andares.reduce((soma, andar) => soma + contarAreasFinaisInventario(andar), 0);

    conteudo.innerHTML = `
      <h2 class="inventario-titulo">Selecione o andar</h2>
      <p class="inventario-subtitulo">Abra um andar para consultar os ambientes e os itens instalados.</p>
      <div class="inventario-resumo">
        <div class="inventario-resumo-card"><strong>${dados.andares.length}</strong><span>andares cadastrados</span></div>
        <div class="inventario-resumo-card"><strong>${totalAreas}</strong><span>áreas com inventário</span></div>
      </div>
      <div class="inventario-grade">
        ${dados.andares.map(andar => `
          <button class="inventario-navegacao-card" type="button" data-inventario-open="${andar.id}">
            <h3>${escaparHtmlInventario(andar.nome)}</h3>
            <p>${andar.ambientes.length} ambientes principais</p>
            <span class="inventario-badge">${contarAreasFinaisInventario(andar)} áreas inventariadas</span>
          </button>
        `).join("")}
      </div>
    `;

    vincularBotoesNavegacaoInventario();
  }

  function renderizarFilhosInventario(filhos, titulo) {
    const conteudo = document.getElementById("inventarioConteudo");

    conteudo.innerHTML = `
      ${criarBreadcrumbInventario()}
      <h2 class="inventario-titulo">${escaparHtmlInventario(titulo)}</h2>
      <p class="inventario-subtitulo">Selecione o ambiente para consultar os itens cadastrados.</p>
      <div class="inventario-grade">
        ${filhos.map(filho => `
          <button class="inventario-navegacao-card" type="button" data-inventario-open="${filho.id}">
            <h3>${escaparHtmlInventario(filho.nome)}</h3>
            <p>${filho.subareas ? `${filho.subareas.length} áreas internas` : `${(filho.itens || []).length} tipos de item`}</p>
            <span class="inventario-badge">${filho.subareas ? `${contarAreasFinaisInventario(filho)} áreas` : `${somarItensAreaInventario(filho)} unidades`}</span>
          </button>
        `).join("")}
      </div>
    `;

    vincularBotoesNavegacaoInventario();
  }

  function renderizarItensDoAmbienteInventario(area) {
    const conteudo = document.getElementById("inventarioConteudo");

    conteudo.innerHTML = `
      ${criarBreadcrumbInventario()}
      <h2 class="inventario-titulo">${escaparHtmlInventario(area.nome)}</h2>
      <p class="inventario-subtitulo">${area.itens.length} tipos de item · ${somarItensAreaInventario(area)} unidades instaladas</p>
      <div class="inventario-lista-itens">
        ${area.itens.map(entrada => {
          const item = obterItemCatalogoInventario(entrada.itemId);

          if (!item) {
            return "";
          }

          const estoque = obterEstadoItemInventario(entrada.itemId).estoque;
          const marca = item.marca !== "Não informada" ? `Marca: ${escaparHtmlInventario(item.marca)}<br>` : "";
          const observacao = entrada.observacao ? `<p class="inventario-item-meta">${escaparHtmlInventario(entrada.observacao)}</p>` : "";

          return `
            <button class="inventario-item-card" type="button" data-inventario-item="${entrada.itemId}" aria-label="Abrir ${escaparHtmlInventario(item.nome)}">
              ${criarImagemInventario(entrada.itemId)}
              <div>
                <p class="inventario-item-nome">${escaparHtmlInventario(item.nome)}</p>
                <p class="inventario-item-meta">${marca}Estoque: ${estoque === null ? "não informado" : estoque}</p>
                ${observacao}
              </div>
              <div class="inventario-quantidade"><strong>${entrada.quantidade}</strong><span>no ambiente</span></div>
            </button>
          `;
        }).join("")}
      </div>
    `;

    vincularBotoesItemInventario();
  }

  function criarBreadcrumbInventario() {
    const dados = obterDadosInventario();
    const nomes = [];
    let atual = dados.andares.find(item => item.id === estadoInventario.caminho[0]);

    if (atual) {
      nomes.push(atual.nome);
    }

    for (const id of estadoInventario.caminho.slice(1)) {
      const filhos = atual ? (atual.ambientes || atual.subareas || []) : [];
      atual = filhos.find(item => item.id === id);

      if (atual) {
        nomes.push(atual.nome);
      }
    }

    return `<div class="inventario-breadcrumb">${nomes.map((nome, indice) => `<span>${indice ? "› " : ""}${escaparHtmlInventario(nome)}</span>`).join("")}</div>`;
  }

  function renderizarEstoqueInventario(filtro = "") {
    const dados = obterDadosInventario();
    const conteudo = document.getElementById("inventarioConteudo");
    const normalizado = String(filtro).trim().toLocaleLowerCase("pt-BR");
    const itens = dados.catalogo.filter(item => {
      const texto = `${item.nome} ${item.marca} ${item.modelo}`.toLocaleLowerCase("pt-BR");
      return texto.includes(normalizado);
    });

    conteudo.innerHTML = `
      <h2 class="inventario-titulo">Estoque</h2>
      <p class="inventario-subtitulo">A imagem e o saldo pertencem ao cadastro único do item e aparecem em todos os ambientes.</p>
      <input id="buscaEstoqueInventario" class="inventario-busca" type="search" value="${escaparHtmlInventario(filtro)}" placeholder="Pesquisar item, marca ou modelo" aria-label="Pesquisar estoque">
      ${itens.length ? `
        <div class="inventario-lista-estoque">
          ${itens.map(item => {
            const local = obterEstadoItemInventario(item.id);

            return `
              <button class="inventario-estoque-card" type="button" data-inventario-item="${item.id}">
                ${criarImagemInventario(item.id)}
                <div>
                  <p class="inventario-item-nome">${escaparHtmlInventario(item.nome)}</p>
                  <p class="inventario-item-meta">${contarInstaladosInventario(item.id)} instalados na unidade</p>
                </div>
                <div class="inventario-saldo"><strong>${local.estoque === null ? "—" : local.estoque}</strong><small>em estoque</small></div>
              </button>
            `;
          }).join("")}
        </div>
      ` : '<div class="inventario-vazio">Nenhum item encontrado.</div>'}
    `;

    const busca = document.getElementById("buscaEstoqueInventario");

    if (busca) {
      busca.addEventListener("input", evento => renderizarEstoqueInventario(evento.target.value));
    }

    vincularBotoesItemInventario();
  }

  function vincularBotoesNavegacaoInventario() {
    document.querySelectorAll("[data-inventario-open]").forEach(botao => {
      botao.addEventListener("click", () => {
        estadoInventario.caminho.push(botao.dataset.inventarioOpen);
        renderizarInventario();
      });
    });
  }

  function vincularBotoesItemInventario() {
    document.querySelectorAll("[data-inventario-item]").forEach(botao => {
      botao.addEventListener("click", () => abrirItemInventario(botao.dataset.inventarioItem));
    });
  }

  function abrirItemInventario(itemId) {
    const item = obterItemCatalogoInventario(itemId);
    const local = obterEstadoItemInventario(itemId);
    const dialogo = document.getElementById("dialogoItemInventario");
    const conteudo = document.getElementById("dialogoItemInventarioConteudo");

    if (!item || !dialogo || !conteudo) {
      return;
    }

    conteudo.innerHTML = `
      <h2 class="inventario-dialog-titulo">${escaparHtmlInventario(item.nome)}</h2>
      <p class="inventario-dialog-meta">Marca: ${escaparHtmlInventario(item.marca)}<br>Modelo/referência: ${escaparHtmlInventario(item.modelo)}<br>Total instalado: ${contarInstaladosInventario(itemId)}</p>
      ${local.imagem
        ? `<img class="inventario-dialog-imagem" src="${local.imagem}" alt="Imagem de referência do item">`
        : '<div class="inventario-dialog-imagem inventario-sem-foto">SEM FOTO DE REFERÊNCIA</div>'}
      <div class="inventario-campo">
        <label for="imagemItemInventario">Imagem de referência</label>
        <input id="imagemItemInventario" type="file" accept="image/*">
      </div>
      <div class="inventario-campo">
        <label for="estoqueItemInventario">Quantidade disponível em estoque</label>
        <input id="estoqueItemInventario" type="number" min="0" step="1" value="${local.estoque ?? ""}" placeholder="Não informado">
      </div>
      ${item.observacao ? `<div class="inventario-nota">${escaparHtmlInventario(item.observacao)}</div>` : ""}
      <div class="inventario-dialog-acoes">
        <button id="salvarItemInventario" class="primary-button" type="button">Salvar item</button>
        ${local.imagem ? '<button id="removerImagemItemInventario" class="secondary-button" type="button">Remover imagem</button>' : ""}
      </div>
      <p class="inventario-aviso-local">Nesta versão, a imagem e o saldo são armazenados somente neste navegador.</p>
    `;

    const botaoSalvar = document.getElementById("salvarItemInventario");

    botaoSalvar.addEventListener("click", async () => {
      botaoSalvar.disabled = true;

      try {
        const campoEstoque = document.getElementById("estoqueItemInventario");
        const campoImagem = document.getElementById("imagemItemInventario");
        const valorEstoque = campoEstoque.value;
        const estoqueAnterior = local.estoque;
        const imagemAnterior = local.imagem;

        local.estoque = valorEstoque === "" ? null : Math.max(0, Number.parseInt(valorEstoque, 10) || 0);

        if (campoImagem.files && campoImagem.files[0]) {
          local.imagem = await redimensionarImagemInventario(campoImagem.files[0]);
        }

        if (!salvarEstadoLocalInventario()) {
          local.estoque = estoqueAnterior;
          local.imagem = imagemAnterior;
          return;
        }

        dialogo.close();
        renderizarInventario();
      } catch (erro) {
        console.error("Erro ao salvar item do inventário:", erro);
        alert(erro.message || "Não foi possível processar a imagem selecionada.");
      } finally {
        botaoSalvar.disabled = false;
      }
    });

    const botaoRemoverImagem = document.getElementById("removerImagemItemInventario");

    if (botaoRemoverImagem) {
      botaoRemoverImagem.addEventListener("click", () => {
        const imagemAnterior = local.imagem;
        local.imagem = "";

        if (!salvarEstadoLocalInventario()) {
          local.imagem = imagemAnterior;
          return;
        }

        dialogo.close();
        renderizarInventario();
      });
    }

    if (typeof dialogo.showModal === "function") {
      dialogo.showModal();
    } else {
      dialogo.setAttribute("open", "");
    }
  }

  function redimensionarImagemInventario(arquivo) {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

    if (arquivo.type && !tiposPermitidos.includes(arquivo.type)) {
      return Promise.reject(new Error("Selecione uma imagem JPG, PNG, WEBP ou HEIC."));
    }

    return new Promise((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      leitor.onload = () => {
        const imagem = new Image();

        imagem.onerror = () => reject(new Error("A imagem selecionada não pôde ser processada neste navegador."));
        imagem.onload = () => {
          const tamanhoMaximo = 700;
          const escala = Math.min(1, tamanhoMaximo / Math.max(imagem.width, imagem.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(imagem.width * escala));
          canvas.height = Math.max(1, Math.round(imagem.height * escala));

          const contexto = canvas.getContext("2d");
          contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        };

        imagem.src = leitor.result;
      };

      leitor.readAsDataURL(arquivo);
    });
  }

  function escaparHtmlInventario(valor) {
    return String(valor ?? "").replace(/[&<>'"]/g, caractere => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[caractere]);
  }

  function configurarEventosInventario() {
    const botaoVoltar = document.getElementById("botaoVoltarInventario");

    if (botaoVoltar && !botaoVoltar.dataset.eventoConfigurado) {
      botaoVoltar.dataset.eventoConfigurado = "true";
      botaoVoltar.addEventListener("click", () => {
        estadoInventario.caminho.pop();
        renderizarInventario();
      });
    }

    document.querySelectorAll("[data-inventario-tab]").forEach(botao => {
      if (botao.dataset.eventoConfigurado) {
        return;
      }

      botao.dataset.eventoConfigurado = "true";
      botao.addEventListener("click", () => {
        estadoInventario.aba = botao.dataset.inventarioTab;
        estadoInventario.caminho = [];
        renderizarInventario();
      });
    });

    const dialogo = document.getElementById("dialogoItemInventario");

    if (dialogo && !dialogo.dataset.eventoConfigurado) {
      dialogo.dataset.eventoConfigurado = "true";
      dialogo.addEventListener("click", evento => {
        if (evento.target === dialogo) {
          dialogo.close();
        }
      });
    }
  }

  window.renderizarInventario = function renderizarInventarioPublico() {
    configurarEventosInventario();
    renderizarInventario();
  };

  configurarEventosInventario();
})();

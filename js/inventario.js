/* =====================================================
   INVENTÁRIO DA UNIDADE

   Recursos:
   - consulta por andar, ambiente e área interna;
   - inclusão, edição e exclusão de andares e ambientes;
   - inclusão, edição de quantidade e exclusão de itens por ambiente;
   - cadastro de novos modelos no catálogo;
   - imagem de referência por item;
   - quantidade disponível em estoque;
   - imagem e saldo sincronizados pelo Firestore;
   - andares, ambientes, áreas internas e catálogo sincronizados pelo Firestore.
===================================================== */

(function inicializarModuloInventario() {
  "use strict";

  const CHAVE_ARMAZENAMENTO_INVENTARIO = "inventario-unidade-v1";
  const estadoInventario = {
    aba: "ambientes",
    caminho: [],
    local: carregarEstadoLocalInventario(),
    remoto: {},
    sincronizacao: "aguardando",
    itensSincronizados: false,
    estruturaSincronizada: false,
    estruturaRemotaCarregada: false,
    migracaoLocalExecutada: false,
    migracaoEstruturaExecutada: false,
    salvandoEstrutura: false
  };

  function obterDadosBaseInventario() {
    return window.INVENTARIO_DATA || { catalogo: [], andares: [] };
  }

  function obterDadosInventario() {
    const base = obterDadosBaseInventario();
    const andaresPersonalizados = estadoInventario.local?.estrutura?.andares;
    const catalogoPersonalizado = estadoInventario.local?.estrutura?.catalogoPersonalizado;
    const catalogoPorId = new Map();

    (base.catalogo || []).forEach(item => {
      if (item && item.id) {
        catalogoPorId.set(item.id, { ...item, personalizado: false });
      }
    });

    (Array.isArray(catalogoPersonalizado) ? catalogoPersonalizado : []).forEach(item => {
      if (item && item.id && item.nome) {
        catalogoPorId.set(item.id, { ...item, personalizado: true });
      }
    });

    return {
      ...base,
      catalogo: Array.from(catalogoPorId.values()),
      andares: Array.isArray(andaresPersonalizados) ? andaresPersonalizados : base.andares
    };
  }

  function clonarValorInventario(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function garantirEstruturaEditavelInventario() {
    const origem = estadoInventario.local?.estrutura?.andares;
    return clonarValorInventario(Array.isArray(origem) ? origem : (obterDadosBaseInventario().andares || []));
  }

  function garantirCatalogoPersonalizadoEditavelInventario() {
    const origem = estadoInventario.local?.estrutura?.catalogoPersonalizado;
    return clonarValorInventario(Array.isArray(origem) ? origem : []);
  }

  function atualizarStatusSincronizacaoInventario() {
    if (estadoInventario.sincronizacao === "erro") {
      return;
    }

    estadoInventario.sincronizacao = estadoInventario.itensSincronizados && estadoInventario.estruturaSincronizada
      ? "sincronizado"
      : "aguardando";
  }

  function atualizarCacheLocalEstruturaInventario(andares, catalogoPersonalizado = garantirCatalogoPersonalizadoEditavelInventario()) {
    estadoInventario.local.estrutura = {
      andares: clonarValorInventario(Array.isArray(andares) ? andares : []),
      catalogoPersonalizado: clonarValorInventario(Array.isArray(catalogoPersonalizado) ? catalogoPersonalizado : [])
    };
    salvarEstadoLocalInventario();
  }

  async function persistirEstruturaInventario(andares, catalogoPersonalizado = garantirCatalogoPersonalizadoEditavelInventario()) {
    if (!estadoInventario.estruturaRemotaCarregada || !estadoInventario.estruturaSincronizada) {
      throw new Error("Aguarde a sincronização inicial dos andares e ambientes antes de alterar a estrutura.");
    }

    if (typeof salvarInventarioEstruturaFirebase !== "function") {
      throw new Error("O serviço de sincronização da estrutura do inventário não foi carregado.");
    }

    estadoInventario.salvandoEstrutura = true;

    try {
      await salvarInventarioEstruturaFirebase(andares, catalogoPersonalizado);
      atualizarCacheLocalEstruturaInventario(andares, catalogoPersonalizado);
      estadoInventario.estruturaSincronizada = true;
      estadoInventario.sincronizacao = "aguardando";
      atualizarStatusSincronizacaoInventario();
    } finally {
      estadoInventario.salvandoEstrutura = false;
    }
  }

  function carregarEstadoLocalInventario() {
    try {
      const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO_INVENTARIO);
      const estado = salvo ? JSON.parse(salvo) : null;
      const normalizado = estado && typeof estado === "object" ? estado : { itens: {} };

      if (!normalizado.itens || typeof normalizado.itens !== "object") {
        normalizado.itens = {};
      }

      if (normalizado.estrutura && !Array.isArray(normalizado.estrutura.andares)) {
        delete normalizado.estrutura;
      } else if (normalizado.estrutura && !Array.isArray(normalizado.estrutura.catalogoPersonalizado)) {
        normalizado.estrutura.catalogoPersonalizado = [];
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
      console.warn("Não foi possível atualizar o cache local do inventário. Os dados remotos permanecem no Firebase:", erro);
      return false;
    }
  }

  function normalizarEstadoItemInventario(dados) {
    return {
      estoque: dados && dados.estoque !== null && dados.estoque !== undefined
        ? Math.max(0, Number(dados.estoque) || 0)
        : null,
      imagem: dados && typeof dados.imagem === "string" && dados.imagem.startsWith("data:image/")
        ? dados.imagem
        : ""
    };
  }

  function obterEstadoItemInventario(itemId) {
    if (!estadoInventario.local.itens || typeof estadoInventario.local.itens !== "object") {
      estadoInventario.local.itens = {};
    }

    if (estadoInventario.remoto && estadoInventario.remoto[itemId]) {
      return estadoInventario.remoto[itemId];
    }

    if (!estadoInventario.local.itens[itemId]) {
      estadoInventario.local.itens[itemId] = { estoque: null, imagem: "" };
    }

    return estadoInventario.local.itens[itemId];
  }

  function atualizarCacheLocalItemInventario(itemId, dados) {
    estadoInventario.local.itens[itemId] = normalizarEstadoItemInventario(dados);
    salvarEstadoLocalInventario();
  }

  async function migrarDadosLocaisInventarioParaFirebase() {
    if (estadoInventario.migracaoLocalExecutada || typeof salvarItemInventarioFirebase !== "function") {
      return;
    }

    estadoInventario.migracaoLocalExecutada = true;
    const locais = estadoInventario.local.itens || {};
    const pendentes = Object.entries(locais).filter(([itemId, dados]) => {
      const possuiDado = dados && (dados.estoque !== null && dados.estoque !== undefined || dados.imagem);
      return possuiDado && !estadoInventario.remoto[itemId];
    });

    for (const [itemId, dados] of pendentes) {
      try {
        await salvarItemInventarioFirebase(itemId, normalizarEstadoItemInventario(dados));
      } catch (erro) {
        console.warn(`Não foi possível migrar o item ${itemId} para o Firebase:`, erro);
      }
    }
  }

  window.receberInventarioItensFirebase = function receberInventarioItensFirebase(itens) {
    estadoInventario.remoto = {};

    Object.entries(itens || {}).forEach(([itemId, dados]) => {
      estadoInventario.remoto[itemId] = normalizarEstadoItemInventario(dados);
      atualizarCacheLocalItemInventario(itemId, dados);
    });

    estadoInventario.itensSincronizados = true;
    estadoInventario.sincronizacao = "aguardando";
    atualizarStatusSincronizacaoInventario();
    migrarDadosLocaisInventarioParaFirebase();

    if (document.getElementById("inventarioConteudo")) {
      renderizarInventario();
    }
  };

  async function migrarEstruturaLocalInventarioParaFirebase() {
    if (estadoInventario.migracaoEstruturaExecutada) {
      return;
    }

    estadoInventario.migracaoEstruturaExecutada = true;
    const andares = garantirEstruturaEditavelInventario();
    const catalogoPersonalizado = garantirCatalogoPersonalizadoEditavelInventario();

    try {
      await salvarInventarioEstruturaFirebase(andares, catalogoPersonalizado);
      atualizarCacheLocalEstruturaInventario(andares, catalogoPersonalizado);
      estadoInventario.estruturaSincronizada = true;
      estadoInventario.sincronizacao = "aguardando";
      atualizarStatusSincronizacaoInventario();
    } catch (erro) {
      estadoInventario.sincronizacao = "erro";
      console.error("Não foi possível migrar a estrutura local do inventário:", erro);
    }

    if (document.getElementById("inventarioConteudo")) {
      renderizarInventario();
    }
  }

  window.receberInventarioEstruturaFirebase = function receberInventarioEstruturaFirebase(estrutura) {
    estadoInventario.estruturaRemotaCarregada = true;

    if (estrutura && Array.isArray(estrutura.andares)) {
      atualizarCacheLocalEstruturaInventario(
        estrutura.andares,
        Array.isArray(estrutura.catalogoPersonalizado) ? estrutura.catalogoPersonalizado : []
      );
      estadoInventario.estruturaSincronizada = true;
      estadoInventario.sincronizacao = "aguardando";
      atualizarStatusSincronizacaoInventario();
    } else {
      migrarEstruturaLocalInventarioParaFirebase();
    }

    if (document.getElementById("inventarioConteudo")) {
      renderizarInventario();
    }
  };

  window.informarErroSincronizacaoInventario = function informarErroSincronizacaoInventario() {
    estadoInventario.sincronizacao = "erro";

    if (document.getElementById("inventarioConteudo")) {
      renderizarInventario();
    }
  };

  window.informarErroSincronizacaoEstruturaInventario = function informarErroSincronizacaoEstruturaInventario() {
    estadoInventario.sincronizacao = "erro";
    estadoInventario.estruturaRemotaCarregada = false;

    if (document.getElementById("inventarioConteudo")) {
      renderizarInventario();
    }
  };

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

  function somarUnidadesNoInventario(no) {
    let total = somarItensAreaInventario(no);
    (no.subareas || []).forEach(filho => { total += somarUnidadesNoInventario(filho); });
    (no.ambientes || []).forEach(filho => { total += somarUnidadesNoInventario(filho); });
    return total;
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
      renderizarFilhosInventario(andar.ambientes || [], andar.nome, "ambiente");
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
      renderizarFilhosInventario(atual.subareas, atual.nome, "subarea");
      return;
    }

    renderizarItensDoAmbienteInventario(atual);
  }

  function criarCabecalhoGerenciamentoInventario(titulo, subtitulo, textoBotao, tipoNovo) {
    return `
      <div class="inventario-secao-cabecalho">
        <div>
          <h2 class="inventario-titulo">${escaparHtmlInventario(titulo)}</h2>
          <p class="inventario-subtitulo">${escaparHtmlInventario(subtitulo)}</p>
        </div>
        <button class="primary-button inventario-adicionar" type="button" data-inventario-add="${tipoNovo}">
          <span aria-hidden="true">+</span> ${escaparHtmlInventario(textoBotao)}
        </button>
      </div>
    `;
  }

  function renderizarAndaresInventario() {
    const dados = obterDadosInventario();
    const conteudo = document.getElementById("inventarioConteudo");
    const totalAreas = dados.andares.reduce((soma, andar) => soma + contarAreasFinaisInventario(andar), 0);

    conteudo.innerHTML = `
      ${criarCabecalhoGerenciamentoInventario(
        "Selecione o andar",
        "Abra um andar para consultar os ambientes e os itens instalados.",
        "Adicionar andar",
        "andar"
      )}
      ${criarStatusSincronizacaoInventario()}
      <div class="inventario-resumo">
        <div class="inventario-resumo-card"><strong>${dados.andares.length}</strong><span>andares cadastrados</span></div>
        <div class="inventario-resumo-card"><strong>${totalAreas}</strong><span>áreas com inventário</span></div>
      </div>
      ${dados.andares.length ? `
        <div class="inventario-grade">
          ${dados.andares.map(andar => criarCardEstruturaInventario(
            andar,
            `${(andar.ambientes || []).length} ambientes principais`,
            `${contarAreasFinaisInventario(andar)} áreas inventariadas`,
            "andar"
          )).join("")}
        </div>
      ` : '<div class="inventario-vazio">Nenhum andar cadastrado. Use “Adicionar andar” para iniciar.</div>'}
    `;

    vincularBotoesEstruturaInventario();
  }

  function renderizarFilhosInventario(filhos, titulo, tipoNovo) {
    const textoTipo = tipoNovo === "subarea" ? "área interna" : "ambiente";
    const conteudo = document.getElementById("inventarioConteudo");

    conteudo.innerHTML = `
      ${criarBreadcrumbInventario()}
      ${criarCabecalhoGerenciamentoInventario(
        titulo,
        `Selecione o ${textoTipo} para consultar os itens cadastrados.`,
        tipoNovo === "subarea" ? "Adicionar área interna" : "Adicionar ambiente",
        tipoNovo
      )}
      ${criarStatusSincronizacaoInventario()}
      ${filhos.length ? `
        <div class="inventario-grade">
          ${filhos.map(filho => criarCardEstruturaInventario(
            filho,
            filho.subareas ? `${filho.subareas.length} áreas internas` : `${(filho.itens || []).length} tipos de item`,
            filho.subareas ? `${contarAreasFinaisInventario(filho)} áreas` : `${somarItensAreaInventario(filho)} unidades`,
            "filho"
          )).join("")}
        </div>
      ` : `<div class="inventario-vazio">Nenhum ${textoTipo} cadastrado. Use o botão acima para adicionar.</div>`}
    `;

    vincularBotoesEstruturaInventario();
  }

  function criarCardEstruturaInventario(registro, descricao, badge, tipoExclusao) {
    return `
      <article class="inventario-estrutura-card">
        <button class="inventario-navegacao-card" type="button" data-inventario-open="${registro.id}">
          <h3>${escaparHtmlInventario(registro.nome)}</h3>
          <p>${escaparHtmlInventario(descricao)}</p>
          <span class="inventario-badge">${escaparHtmlInventario(badge)}</span>
        </button>
        <button class="inventario-excluir" type="button" data-inventario-delete="${tipoExclusao}" data-inventario-delete-id="${registro.id}" aria-label="Excluir ${escaparHtmlInventario(registro.nome)}">
          Excluir
        </button>
        <button class="inventario-editar" type="button" data-inventario-edit="${tipoExclusao}" data-inventario-edit-id="${registro.id}" aria-label="Editar ${escaparHtmlInventario(registro.nome)}">
          Editar
        </button>
      </article>
    `;
  }

  function renderizarItensDoAmbienteInventario(area) {
    const conteudo = document.getElementById("inventarioConteudo");
    const itensArea = Array.isArray(area.itens) ? area.itens : [];

    conteudo.innerHTML = `
      ${criarBreadcrumbInventario()}
      ${criarCabecalhoGerenciamentoInventario(
        area.nome,
        `${itensArea.length} tipos de item · ${somarItensAreaInventario(area)} unidades instaladas`,
        "Adicionar item",
        "item"
      )}
      ${criarStatusSincronizacaoInventario()}
      ${itensArea.length ? `
        <div class="inventario-lista-itens">
          ${itensArea.map(entrada => {
            const item = obterItemCatalogoInventario(entrada.itemId);

            if (!item) {
              return "";
            }

            const estoque = obterEstadoItemInventario(entrada.itemId).estoque;
            const marca = item.marca !== "Não informada" ? `Marca: ${escaparHtmlInventario(item.marca)}<br>` : "";
            const observacao = entrada.observacao ? `<p class="inventario-item-meta">${escaparHtmlInventario(entrada.observacao)}</p>` : "";

            return `
              <article class="inventario-item-registro">
                <button class="inventario-item-card" type="button" data-inventario-item="${entrada.itemId}" aria-label="Abrir ${escaparHtmlInventario(item.nome)}">
                  ${criarImagemInventario(entrada.itemId)}
                  <div>
                    <p class="inventario-item-nome">${escaparHtmlInventario(item.nome)}</p>
                    <p class="inventario-item-meta">${marca}Estoque: ${estoque === null ? "não informado" : estoque}</p>
                    ${observacao}
                  </div>
                  <div class="inventario-quantidade"><strong>${entrada.quantidade}</strong><span>no ambiente</span></div>
                </button>
                <button class="inventario-excluir inventario-excluir-item" type="button" data-inventario-delete-item="${entrada.itemId}" aria-label="Excluir ${escaparHtmlInventario(item.nome)} deste ambiente">
                  Excluir
                </button>
              </article>
            `;
          }).join("")}
        </div>
      ` : '<div class="inventario-vazio">Este ambiente ainda não possui itens cadastrados. Use “Adicionar item” para iniciar.</div>'}
    `;

    vincularBotoesEstruturaInventario();
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

  function criarStatusSincronizacaoInventario() {
    const estados = {
      aguardando: ["Sincronizando inventário com o Firebase…", "is-loading"],
      sincronizado: ["Itens, saldos, catálogo e estrutura sincronizados entre dispositivos", "is-ok"],
      erro: ["Sem sincronização: verifique a conexão e publique as regras atualizadas do Firestore", "is-error"]
    };
    const [texto, classe] = estados[estadoInventario.sincronizacao] || estados.aguardando;

    return `<p class="inventario-sync-status ${classe}">${texto}</p>`;
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
      <p class="inventario-subtitulo">Imagem, saldo, catálogo e estrutura do inventário são sincronizados pelo Firebase entre dispositivos.</p>
      ${criarStatusSincronizacaoInventario()}
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

  function vincularBotoesEstruturaInventario() {
    document.querySelectorAll("[data-inventario-open]").forEach(botao => {
      botao.addEventListener("click", () => {
        estadoInventario.caminho.push(botao.dataset.inventarioOpen);
        renderizarInventario();
      });
    });

    document.querySelectorAll("[data-inventario-add]").forEach(botao => {
      botao.addEventListener("click", () => {
        if (botao.dataset.inventarioAdd === "item") {
          abrirDialogoAdicionarItemInventario();
          return;
        }

        abrirDialogoAdicionarEstruturaInventario(botao.dataset.inventarioAdd);
      });
    });

    document.querySelectorAll("[data-inventario-delete]").forEach(botao => {
      botao.addEventListener("click", () => excluirEstruturaInventario(
        botao.dataset.inventarioDelete,
        botao.dataset.inventarioDeleteId
      ));
    });

    document.querySelectorAll("[data-inventario-edit]").forEach(botao => {
      botao.addEventListener("click", () => abrirDialogoEditarEstruturaInventario(
        botao.dataset.inventarioEdit,
        botao.dataset.inventarioEditId
      ));
    });
  }

  function vincularBotoesItemInventario() {
    document.querySelectorAll("[data-inventario-item]").forEach(botao => {
      botao.addEventListener("click", () => abrirItemInventario(botao.dataset.inventarioItem));
    });

    document.querySelectorAll("[data-inventario-delete-item]").forEach(botao => {
      botao.addEventListener("click", () => excluirItemDoAmbienteInventario(botao.dataset.inventarioDeleteItem));
    });
  }

  function obterNoPorCaminhoInventario(andares, caminho) {
    if (!caminho.length) {
      return null;
    }

    let atual = andares.find(andar => andar.id === caminho[0]);

    for (const id of caminho.slice(1)) {
      const filhos = atual ? (atual.ambientes || atual.subareas || []) : [];
      atual = filhos.find(filho => filho.id === id);
    }

    return atual || null;
  }

  function normalizarNomeComparacaoInventario(nome) {
    return String(nome || "").trim().toLocaleLowerCase("pt-BR");
  }

  function gerarIdInventario(prefixo, nome) {
    const slug = String(nome || "local")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 34) || "local";
    const sufixo = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

    return `${prefixo}-${slug}-${sufixo}`;
  }

  function obterAreaAtualInventario(andares = obterDadosInventario().andares) {
    const area = obterNoPorCaminhoInventario(andares, estadoInventario.caminho);
    return area && Array.isArray(area.itens) ? area : null;
  }

  function abrirDialogoAdicionarItemInventario() {
    const dados = obterDadosInventario();
    const area = obterAreaAtualInventario(dados.andares);
    const dialogo = document.getElementById("dialogoEstruturaInventario");
    const conteudo = document.getElementById("dialogoEstruturaInventarioConteudo");

    if (!area || !dialogo || !conteudo) {
      alert("Não foi possível localizar o ambiente para adicionar o item.");
      return;
    }

    const itensJaCadastrados = new Set((area.itens || []).map(entrada => entrada.itemId));
    const itensDisponiveis = dados.catalogo
      .filter(item => !itensJaCadastrados.has(item.id))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    const selecionarNovo = itensDisponiveis.length === 0;

    conteudo.innerHTML = `
      <h2 class="inventario-dialog-titulo">Adicionar item</h2>
      <p class="inventario-dialog-meta">Selecione um item já existente no catálogo ou cadastre um novo modelo. A inclusão será salva no Firebase.</p>
      <div class="inventario-campo">
        <label for="itemCatalogoInventario">Item</label>
        <select id="itemCatalogoInventario">
          ${itensDisponiveis.length ? '<option value="">Selecione um item</option>' : ""}
          ${itensDisponiveis.map(item => `<option value="${escaparHtmlInventario(item.id)}">${escaparHtmlInventario(item.nome)}</option>`).join("")}
          <option value="__novo__" ${selecionarNovo ? "selected" : ""}>+ Cadastrar novo item</option>
        </select>
      </div>
      <div id="camposNovoItemInventario" ${selecionarNovo ? "" : "hidden"}>
        <div class="inventario-campo">
          <label for="nomeNovoItemInventario">Nome do item</label>
          <input id="nomeNovoItemInventario" type="text" maxlength="120" autocomplete="off" placeholder="Ex.: Torneira temporizada de parede">
        </div>
        <div class="inventario-campos-duplos">
          <div class="inventario-campo">
            <label for="marcaNovoItemInventario">Marca</label>
            <input id="marcaNovoItemInventario" type="text" maxlength="80" autocomplete="off" placeholder="Não informada">
          </div>
          <div class="inventario-campo">
            <label for="modeloNovoItemInventario">Modelo/referência</label>
            <input id="modeloNovoItemInventario" type="text" maxlength="100" autocomplete="off" placeholder="Não informado">
          </div>
        </div>
        <div class="inventario-campo">
          <label for="observacaoNovoItemInventario">Observação</label>
          <textarea id="observacaoNovoItemInventario" maxlength="300" rows="3" placeholder="Detalhe de acabamento, medida ou padrão do produto"></textarea>
        </div>
      </div>
      <div class="inventario-campo">
        <label for="quantidadeNovoItemInventario">Quantidade instalada neste ambiente</label>
        <input id="quantidadeNovoItemInventario" type="number" min="1" step="1" value="1">
      </div>
      <div id="erroEstruturaInventario" class="inventario-erro" role="alert" hidden></div>
      <div class="inventario-dialog-acoes inventario-dialog-acoes-duplas">
        <button id="salvarEstruturaInventario" class="primary-button" type="button">Adicionar item</button>
        <button id="cancelarEstruturaInventario" class="secondary-button" type="button">Cancelar</button>
      </div>
    `;

    const seletor = document.getElementById("itemCatalogoInventario");
    const camposNovo = document.getElementById("camposNovoItemInventario");
    const botaoSalvar = document.getElementById("salvarEstruturaInventario");
    const botaoCancelar = document.getElementById("cancelarEstruturaInventario");

    const atualizarCamposNovo = () => {
      const novo = seletor.value === "__novo__";
      camposNovo.hidden = !novo;

      if (novo) {
        window.setTimeout(() => document.getElementById("nomeNovoItemInventario")?.focus(), 0);
      }
    };

    seletor.addEventListener("change", atualizarCamposNovo);
    botaoSalvar.addEventListener("click", adicionarItemAoAmbienteInventario);
    botaoCancelar.addEventListener("click", () => dialogo.close());

    if (typeof dialogo.showModal === "function") {
      dialogo.showModal();
    } else {
      dialogo.setAttribute("open", "");
    }

    window.setTimeout(() => {
      if (selecionarNovo) {
        document.getElementById("nomeNovoItemInventario")?.focus();
      } else {
        seletor.focus();
      }
    }, 0);
  }

  async function adicionarItemAoAmbienteInventario() {
    const seletor = document.getElementById("itemCatalogoInventario");
    const campoQuantidade = document.getElementById("quantidadeNovoItemInventario");
    const dialogo = document.getElementById("dialogoEstruturaInventario");
    const escolha = String(seletor?.value || "");
    const quantidade = Number.parseInt(campoQuantidade?.value, 10);

    if (!Number.isInteger(quantidade) || quantidade < 1) {
      exibirErroEstruturaInventario("Informe uma quantidade instalada maior que zero.");
      campoQuantidade?.focus();
      return;
    }

    if (!escolha) {
      exibirErroEstruturaInventario("Selecione um item do catálogo ou escolha cadastrar um novo item.");
      seletor?.focus();
      return;
    }

    const andares = garantirEstruturaEditavelInventario();
    const catalogoPersonalizado = garantirCatalogoPersonalizadoEditavelInventario();
    const area = obterAreaAtualInventario(andares);

    if (!area) {
      exibirErroEstruturaInventario("Não foi possível localizar o ambiente de destino.");
      return;
    }

    let itemId = escolha;

    if (escolha === "__novo__") {
      const nome = String(document.getElementById("nomeNovoItemInventario")?.value || "").trim().replace(/\s+/g, " ");
      const marca = String(document.getElementById("marcaNovoItemInventario")?.value || "").trim().replace(/\s+/g, " ") || "Não informada";
      const modelo = String(document.getElementById("modeloNovoItemInventario")?.value || "").trim().replace(/\s+/g, " ") || "Não informado";
      const observacao = String(document.getElementById("observacaoNovoItemInventario")?.value || "").trim().replace(/\s+/g, " ");

      if (nome.length < 2) {
        exibirErroEstruturaInventario("Informe o nome do novo item com pelo menos 2 caracteres.");
        document.getElementById("nomeNovoItemInventario")?.focus();
        return;
      }

      const dadosAtuais = obterDadosInventario();
      const nomeNormalizado = normalizarNomeComparacaoInventario(nome);
      const marcaNormalizada = normalizarNomeComparacaoInventario(marca);
      const modeloNormalizado = normalizarNomeComparacaoInventario(modelo);
      const equivalente = dadosAtuais.catalogo.find(item =>
        normalizarNomeComparacaoInventario(item.nome) === nomeNormalizado
        && normalizarNomeComparacaoInventario(item.marca) === marcaNormalizada
        && normalizarNomeComparacaoInventario(item.modelo) === modeloNormalizado
      );

      if (equivalente) {
        const jaEstaNoAmbiente = (area.itens || []).some(entrada => entrada.itemId === equivalente.id);
        exibirErroEstruturaInventario(jaEstaNoAmbiente
          ? "Esse item já está cadastrado neste ambiente. Abra-o para alterar a quantidade."
          : "Esse item já existe no catálogo. Selecione-o na lista para evitar duplicidade.");
        seletor?.focus();
        return;
      }

      itemId = gerarIdInventario("item", nome);
      catalogoPersonalizado.push({
        id: itemId,
        nome,
        marca,
        modelo,
        observacao,
        personalizado: true
      });
    }

    const itemCatalogo = escolha === "__novo__"
      ? catalogoPersonalizado.find(item => item.id === itemId)
      : obterItemCatalogoInventario(itemId);

    if (!itemCatalogo) {
      exibirErroEstruturaInventario("O item selecionado não foi encontrado no catálogo.");
      return;
    }

    if ((area.itens || []).some(entrada => entrada.itemId === itemId)) {
      exibirErroEstruturaInventario("Este item já está cadastrado no ambiente. Abra o item para alterar a quantidade.");
      return;
    }

    area.itens.push({ itemId, quantidade });
    const botaoSalvar = document.getElementById("salvarEstruturaInventario");

    if (botaoSalvar) {
      botaoSalvar.disabled = true;
    }

    try {
      await persistirEstruturaInventario(andares, catalogoPersonalizado);
      dialogo?.close();
      renderizarInventario();
    } catch (erro) {
      console.error("Erro ao adicionar item ao ambiente:", erro);
      exibirErroEstruturaInventario(erro.message || "Não foi possível adicionar o item no Firebase.");
    } finally {
      if (botaoSalvar) {
        botaoSalvar.disabled = false;
      }
    }
  }

  async function excluirItemDoAmbienteInventario(itemId) {
    const dados = obterDadosInventario();
    const areaAtual = obterAreaAtualInventario(dados.andares);
    const entradaAtual = areaAtual?.itens?.find(entrada => entrada.itemId === itemId);
    const item = obterItemCatalogoInventario(itemId);

    if (!areaAtual || !entradaAtual || !item) {
      alert("O item selecionado não foi encontrado neste ambiente.");
      renderizarInventario();
      return;
    }

    const confirmado = window.confirm(
      `Excluir “${item.nome}” deste ambiente?\n\n`
      + `${entradaAtual.quantidade} ${entradaAtual.quantidade === 1 ? "unidade instalada será removida" : "unidades instaladas serão removidas"}. `
      + "A imagem e o saldo permanecerão no catálogo para uso em outros ambientes."
    );

    if (!confirmado) {
      return;
    }

    const andares = garantirEstruturaEditavelInventario();
    const areaEditavel = obterAreaAtualInventario(andares);

    if (!areaEditavel) {
      alert("Não foi possível localizar o ambiente para exclusão.");
      return;
    }

    const indice = areaEditavel.itens.findIndex(entrada => entrada.itemId === itemId);

    if (indice < 0) {
      alert("O item selecionado não foi encontrado neste ambiente.");
      return;
    }

    areaEditavel.itens.splice(indice, 1);

    try {
      await persistirEstruturaInventario(andares);
      renderizarInventario();
    } catch (erro) {
      console.error("Erro ao excluir item do ambiente:", erro);
      alert(erro.message || "Não foi possível excluir o item no Firebase.");
    }
  }

  function abrirDialogoAdicionarEstruturaInventario(tipo) {
    const dialogo = document.getElementById("dialogoEstruturaInventario");
    const conteudo = document.getElementById("dialogoEstruturaInventarioConteudo");

    if (!dialogo || !conteudo) {
      return;
    }

    const configuracao = {
      andar: {
        titulo: "Adicionar andar",
        rotulo: "Nome do andar",
        placeholder: "Ex.: 2º Andar",
        textoSalvar: "Adicionar andar"
      },
      ambiente: {
        titulo: "Adicionar ambiente",
        rotulo: "Nome do ambiente",
        placeholder: "Ex.: Sala de reuniões",
        textoSalvar: "Adicionar ambiente"
      },
      subarea: {
        titulo: "Adicionar área interna",
        rotulo: "Nome da área interna",
        placeholder: "Ex.: Banheiro feminino",
        textoSalvar: "Adicionar área interna"
      }
    }[tipo];

    if (!configuracao) {
      return;
    }

    conteudo.innerHTML = `
      <h2 class="inventario-dialog-titulo">${configuracao.titulo}</h2>
      <p class="inventario-dialog-meta">O novo local será salvo no Firebase e ficará disponível em todos os dispositivos.</p>
      <div class="inventario-campo">
        <label for="nomeEstruturaInventario">${configuracao.rotulo}</label>
        <input id="nomeEstruturaInventario" type="text" maxlength="80" autocomplete="off" placeholder="${configuracao.placeholder}">
      </div>
      ${tipo === "ambiente" ? `
        <div class="inventario-campo">
          <label for="formatoAmbienteInventario">Estrutura do ambiente</label>
          <select id="formatoAmbienteInventario">
            <option value="simples">Ambiente simples, com itens diretamente</option>
            <option value="agrupador">Ambiente com áreas internas, como o SABES</option>
          </select>
        </div>
      ` : ""}
      <div id="erroEstruturaInventario" class="inventario-erro" role="alert" hidden></div>
      <div class="inventario-dialog-acoes inventario-dialog-acoes-duplas">
        <button id="salvarEstruturaInventario" class="primary-button" type="button">${configuracao.textoSalvar}</button>
        <button id="cancelarEstruturaInventario" class="secondary-button" type="button">Cancelar</button>
      </div>
    `;

    const campoNome = document.getElementById("nomeEstruturaInventario");
    const botaoSalvar = document.getElementById("salvarEstruturaInventario");
    const botaoCancelar = document.getElementById("cancelarEstruturaInventario");

    botaoSalvar.addEventListener("click", () => adicionarEstruturaInventario(tipo));
    botaoCancelar.addEventListener("click", () => dialogo.close());
    campoNome.addEventListener("keydown", evento => {
      if (evento.key === "Enter") {
        evento.preventDefault();
        adicionarEstruturaInventario(tipo);
      }
    });

    if (typeof dialogo.showModal === "function") {
      dialogo.showModal();
    } else {
      dialogo.setAttribute("open", "");
    }

    window.setTimeout(() => campoNome.focus(), 0);
  }

  function exibirErroEstruturaInventario(mensagem) {
    const erro = document.getElementById("erroEstruturaInventario");

    if (erro) {
      erro.textContent = mensagem;
      erro.hidden = false;
    }
  }

  async function adicionarEstruturaInventario(tipo) {
    const campoNome = document.getElementById("nomeEstruturaInventario");
    const dialogo = document.getElementById("dialogoEstruturaInventario");
    const nome = String(campoNome?.value || "").trim().replace(/\s+/g, " ");

    if (nome.length < 2) {
      exibirErroEstruturaInventario("Informe um nome com pelo menos 2 caracteres.");
      campoNome?.focus();
      return;
    }

    const andares = garantirEstruturaEditavelInventario();
    let listaDestino;
    let novoRegistro;

    if (tipo === "andar") {
      listaDestino = andares;
      novoRegistro = {
        id: gerarIdInventario("andar", nome),
        nome,
        ambientes: []
      };
    } else {
      const pai = obterNoPorCaminhoInventario(andares, estadoInventario.caminho);

      if (!pai) {
        exibirErroEstruturaInventario("Não foi possível localizar o local de destino.");
        return;
      }

      if (tipo === "ambiente") {
        listaDestino = pai.ambientes;
        const formato = document.getElementById("formatoAmbienteInventario")?.value || "simples";
        novoRegistro = formato === "agrupador"
          ? { id: gerarIdInventario("ambiente", nome), nome, subareas: [] }
          : { id: gerarIdInventario("ambiente", nome), nome, itens: [] };
      } else {
        listaDestino = pai.subareas;
        novoRegistro = {
          id: gerarIdInventario("area", nome),
          nome,
          itens: []
        };
      }
    }

    if (!Array.isArray(listaDestino)) {
      exibirErroEstruturaInventario("Este local não aceita novos ambientes internos.");
      return;
    }

    const nomeComparacao = normalizarNomeComparacaoInventario(nome);
    const duplicado = listaDestino.some(registro => normalizarNomeComparacaoInventario(registro.nome) === nomeComparacao);

    if (duplicado) {
      exibirErroEstruturaInventario("Já existe um local com esse nome neste nível.");
      campoNome?.focus();
      return;
    }

    listaDestino.push(novoRegistro);
    const botaoSalvar = document.getElementById("salvarEstruturaInventario");

    if (botaoSalvar) {
      botaoSalvar.disabled = true;
    }

    try {
      await persistirEstruturaInventario(andares);
      dialogo?.close();
      renderizarInventario();
    } catch (erro) {
      console.error("Erro ao salvar estrutura do inventário:", erro);
      exibirErroEstruturaInventario(erro.message || "Não foi possível salvar o novo local no Firebase.");
    } finally {
      if (botaoSalvar) {
        botaoSalvar.disabled = false;
      }
    }
  }

  function localizarRegistroEstruturaInventario(andares, tipo, id) {
    if (tipo === "andar") {
      const lista = andares;
      return {
        registro: lista.find(andar => andar.id === id) || null,
        lista,
        tipoLocal: "andar"
      };
    }

    const pai = obterNoPorCaminhoInventario(andares, estadoInventario.caminho);
    const lista = pai ? (pai.ambientes || pai.subareas || []) : [];
    const tipoLocal = Array.isArray(pai?.subareas) ? "subarea" : "ambiente";

    return {
      registro: lista.find(filho => filho.id === id) || null,
      lista,
      tipoLocal
    };
  }

  function abrirDialogoEditarEstruturaInventario(tipo, id) {
    const dados = obterDadosInventario();
    const localizado = localizarRegistroEstruturaInventario(dados.andares, tipo, id);
    const registro = localizado.registro;
    const dialogo = document.getElementById("dialogoEstruturaInventario");
    const conteudo = document.getElementById("dialogoEstruturaInventarioConteudo");

    if (!registro || !dialogo || !conteudo) {
      alert("O local selecionado não foi encontrado.");
      renderizarInventario();
      return;
    }

    const rotulos = {
      andar: ["Editar andar", "Nome do andar"],
      ambiente: ["Editar ambiente", "Nome do ambiente"],
      subarea: ["Editar área interna", "Nome da área interna"]
    };
    const [titulo, rotulo] = rotulos[localizado.tipoLocal] || rotulos.ambiente;

    conteudo.innerHTML = `
      <h2 class="inventario-dialog-titulo">${titulo}</h2>
      <p class="inventario-dialog-meta">Altere o nome do local. A mudança será salva no Firebase e sincronizada entre dispositivos.</p>
      <div class="inventario-campo">
        <label for="nomeEstruturaInventario">${rotulo}</label>
        <input id="nomeEstruturaInventario" type="text" maxlength="80" autocomplete="off" value="${escaparHtmlInventario(registro.nome)}">
      </div>
      <div id="erroEstruturaInventario" class="inventario-erro" role="alert" hidden></div>
      <div class="inventario-dialog-acoes inventario-dialog-acoes-duplas">
        <button id="salvarEstruturaInventario" class="primary-button" type="button">Salvar alteração</button>
        <button id="cancelarEstruturaInventario" class="secondary-button" type="button">Cancelar</button>
      </div>
    `;

    const campoNome = document.getElementById("nomeEstruturaInventario");
    const botaoSalvar = document.getElementById("salvarEstruturaInventario");
    const botaoCancelar = document.getElementById("cancelarEstruturaInventario");

    botaoSalvar.addEventListener("click", () => editarEstruturaInventario(tipo, id));
    botaoCancelar.addEventListener("click", () => dialogo.close());
    campoNome.addEventListener("keydown", evento => {
      if (evento.key === "Enter") {
        evento.preventDefault();
        editarEstruturaInventario(tipo, id);
      }
    });

    if (typeof dialogo.showModal === "function") {
      dialogo.showModal();
    } else {
      dialogo.setAttribute("open", "");
    }

    window.setTimeout(() => {
      campoNome.focus();
      campoNome.select();
    }, 0);
  }

  async function editarEstruturaInventario(tipo, id) {
    const campoNome = document.getElementById("nomeEstruturaInventario");
    const dialogo = document.getElementById("dialogoEstruturaInventario");
    const nome = String(campoNome?.value || "").trim().replace(/\s+/g, " ");

    if (nome.length < 2) {
      exibirErroEstruturaInventario("Informe um nome com pelo menos 2 caracteres.");
      campoNome?.focus();
      return;
    }

    const andares = garantirEstruturaEditavelInventario();
    const localizado = localizarRegistroEstruturaInventario(andares, tipo, id);
    const registro = localizado.registro;

    if (!registro || !Array.isArray(localizado.lista)) {
      exibirErroEstruturaInventario("Não foi possível localizar o local para edição.");
      return;
    }

    const nomeComparacao = normalizarNomeComparacaoInventario(nome);
    const duplicado = localizado.lista.some(outro =>
      outro.id !== id && normalizarNomeComparacaoInventario(outro.nome) === nomeComparacao
    );

    if (duplicado) {
      exibirErroEstruturaInventario("Já existe um local com esse nome neste nível.");
      campoNome?.focus();
      return;
    }

    if (normalizarNomeComparacaoInventario(registro.nome) === nomeComparacao && registro.nome === nome) {
      dialogo?.close();
      return;
    }

    registro.nome = nome;
    const botaoSalvar = document.getElementById("salvarEstruturaInventario");

    if (botaoSalvar) {
      botaoSalvar.disabled = true;
    }

    try {
      await persistirEstruturaInventario(andares);
      dialogo?.close();
      renderizarInventario();
    } catch (erro) {
      console.error("Erro ao editar estrutura do inventário:", erro);
      exibirErroEstruturaInventario(erro.message || "Não foi possível salvar a alteração no Firebase.");
    } finally {
      if (botaoSalvar) {
        botaoSalvar.disabled = false;
      }
    }
  }

  async function excluirEstruturaInventario(tipo, id) {
    const dados = obterDadosInventario();
    let registro;

    if (tipo === "andar") {
      registro = dados.andares.find(andar => andar.id === id);
    } else {
      const paiAtual = obterNoPorCaminhoInventario(dados.andares, estadoInventario.caminho);
      const filhos = paiAtual ? (paiAtual.ambientes || paiAtual.subareas || []) : [];
      registro = filhos.find(filho => filho.id === id);
    }

    if (!registro) {
      alert("O local selecionado não foi encontrado.");
      renderizarInventario();
      return;
    }

    const areas = contarAreasFinaisInventario(registro);
    const unidades = somarUnidadesNoInventario(registro);
    const detalhes = [];

    if (areas > 0) {
      detalhes.push(`${areas} ${areas === 1 ? "área" : "áreas"}`);
    }

    if (unidades > 0) {
      detalhes.push(`${unidades} ${unidades === 1 ? "unidade instalada" : "unidades instaladas"}`);
    }

    const complemento = detalhes.length
      ? `\n\nTambém serão removidas ${detalhes.join(" e ")} vinculadas a este local.`
      : "";
    const confirmado = window.confirm(`Excluir “${registro.nome}”?${complemento}\n\nEsta ação não poderá ser desfeita.`);

    if (!confirmado) {
      return;
    }

    const andares = garantirEstruturaEditavelInventario();
    let listaDestino;

    if (tipo === "andar") {
      listaDestino = andares;
    } else {
      const paiEditavel = obterNoPorCaminhoInventario(andares, estadoInventario.caminho);
      listaDestino = paiEditavel ? (paiEditavel.ambientes || paiEditavel.subareas) : null;
    }

    if (!Array.isArray(listaDestino)) {
      alert("Não foi possível localizar o local para exclusão.");
      return;
    }

    const indice = listaDestino.findIndex(registroLista => registroLista.id === id);

    if (indice < 0) {
      alert("O local selecionado não foi encontrado.");
      return;
    }

    listaDestino.splice(indice, 1);

    try {
      await persistirEstruturaInventario(andares);
      estadoInventario.caminho = estadoInventario.caminho.filter(caminhoId => caminhoId !== id);
      renderizarInventario();
    } catch (erro) {
      console.error("Erro ao excluir estrutura do inventário:", erro);
      alert(erro.message || "Não foi possível excluir o local no Firebase.");
    }
  }

  function abrirItemInventario(itemId) {
    const item = obterItemCatalogoInventario(itemId);
    const local = obterEstadoItemInventario(itemId);
    const dados = obterDadosInventario();
    const areaAtual = obterAreaAtualInventario(dados.andares);
    const entradaAtual = areaAtual?.itens?.find(entrada => entrada.itemId === itemId) || null;
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
      ${entradaAtual ? `
        <div class="inventario-campo">
          <label for="quantidadeAmbienteItemInventario">Quantidade instalada neste ambiente</label>
          <input id="quantidadeAmbienteItemInventario" type="number" min="1" step="1" value="${entradaAtual.quantidade}">
        </div>
      ` : ""}
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
      <p class="inventario-aviso-local">Imagem, saldo, quantidade instalada, catálogo e estrutura são salvos no Firebase e sincronizados entre dispositivos.</p>
    `;

    const botaoSalvar = document.getElementById("salvarItemInventario");

    botaoSalvar.addEventListener("click", async () => {
      const campoQuantidadeAmbiente = document.getElementById("quantidadeAmbienteItemInventario");
      const quantidadeAmbiente = campoQuantidadeAmbiente
        ? Number.parseInt(campoQuantidadeAmbiente.value, 10)
        : null;

      if (campoQuantidadeAmbiente && (!Number.isInteger(quantidadeAmbiente) || quantidadeAmbiente < 1)) {
        alert("Informe uma quantidade instalada maior que zero.");
        campoQuantidadeAmbiente.focus();
        return;
      }

      botaoSalvar.disabled = true;

      try {
        const campoEstoque = document.getElementById("estoqueItemInventario");
        const campoImagem = document.getElementById("imagemItemInventario");
        const valorEstoque = campoEstoque.value;
        const novoEstado = {
          estoque: valorEstoque === "" ? null : Math.max(0, Number.parseInt(valorEstoque, 10) || 0),
          imagem: local.imagem || ""
        };

        if (campoImagem.files && campoImagem.files[0]) {
          novoEstado.imagem = await redimensionarImagemInventario(campoImagem.files[0]);
        }

        if (typeof salvarItemInventarioFirebase !== "function") {
          throw new Error("O serviço de sincronização do inventário não foi carregado.");
        }

        const operacoes = [salvarItemInventarioFirebase(itemId, novoEstado)];

        if (entradaAtual && quantidadeAmbiente !== entradaAtual.quantidade) {
          const andares = garantirEstruturaEditavelInventario();
          const areaEditavel = obterAreaAtualInventario(andares);
          const entradaEditavel = areaEditavel?.itens?.find(entrada => entrada.itemId === itemId);

          if (!entradaEditavel) {
            throw new Error("Não foi possível localizar o item no ambiente para atualizar a quantidade.");
          }

          entradaEditavel.quantidade = quantidadeAmbiente;
          operacoes.push(persistirEstruturaInventario(andares));
        }

        await Promise.all(operacoes);
        estadoInventario.remoto[itemId] = normalizarEstadoItemInventario(novoEstado);
        atualizarCacheLocalItemInventario(itemId, novoEstado);
        estadoInventario.itensSincronizados = true;
        estadoInventario.sincronizacao = "aguardando";
        atualizarStatusSincronizacaoInventario();

        dialogo.close();
        renderizarInventario();
      } catch (erro) {
        console.error("Erro ao salvar item do inventário:", erro);
        alert(erro.message || "Não foi possível salvar o item no Firebase.");
      } finally {
        botaoSalvar.disabled = false;
      }
    });

    const botaoRemoverImagem = document.getElementById("removerImagemItemInventario");

    if (botaoRemoverImagem) {
      botaoRemoverImagem.addEventListener("click", async () => {
        botaoRemoverImagem.disabled = true;

        try {
          const novoEstado = { estoque: local.estoque, imagem: "" };

          if (typeof salvarItemInventarioFirebase !== "function") {
            throw new Error("O serviço de sincronização do inventário não foi carregado.");
          }

          await salvarItemInventarioFirebase(itemId, novoEstado);
          estadoInventario.remoto[itemId] = normalizarEstadoItemInventario(novoEstado);
          atualizarCacheLocalItemInventario(itemId, novoEstado);
          estadoInventario.itensSincronizados = true;
          estadoInventario.sincronizacao = "aguardando";
          atualizarStatusSincronizacaoInventario();
          dialogo.close();
          renderizarInventario();
        } catch (erro) {
          console.error("Erro ao remover imagem do inventário:", erro);
          alert(erro.message || "Não foi possível remover a imagem no Firebase.");
        } finally {
          botaoRemoverImagem.disabled = false;
        }
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
          let tamanhoMaximo = 700;
          let qualidade = 0.72;
          let resultado = "";

          for (let tentativa = 0; tentativa < 7; tentativa += 1) {
            const escala = Math.min(1, tamanhoMaximo / Math.max(imagem.width, imagem.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(imagem.width * escala));
            canvas.height = Math.max(1, Math.round(imagem.height * escala));

            const contexto = canvas.getContext("2d");
            contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
            resultado = canvas.toDataURL("image/jpeg", qualidade);

            if (resultado.length <= 650000) {
              resolve(resultado);
              return;
            }

            tamanhoMaximo = Math.max(360, Math.round(tamanhoMaximo * 0.82));
            qualidade = Math.max(0.48, qualidade - 0.06);
          }

          reject(new Error("A imagem ficou grande demais para sincronizar. Escolha uma foto com menor resolução."));
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

    ["dialogoItemInventario", "dialogoEstruturaInventario"].forEach(idDialogo => {
      const dialogo = document.getElementById(idDialogo);

      if (dialogo && !dialogo.dataset.eventoConfigurado) {
        dialogo.dataset.eventoConfigurado = "true";
        dialogo.addEventListener("click", evento => {
          if (evento.target === dialogo) {
            dialogo.close();
          }
        });
      }
    });

    const fecharDialogoEstrutura = document.getElementById("fecharDialogoEstruturaInventario");
    const dialogoEstrutura = document.getElementById("dialogoEstruturaInventario");

    if (fecharDialogoEstrutura && dialogoEstrutura && !fecharDialogoEstrutura.dataset.eventoConfigurado) {
      fecharDialogoEstrutura.dataset.eventoConfigurado = "true";
      fecharDialogoEstrutura.addEventListener("click", () => dialogoEstrutura.close());
    }


    const formEstrutura = document.getElementById("formEstruturaInventario");

    if (formEstrutura && !formEstrutura.dataset.eventoConfigurado) {
      formEstrutura.dataset.eventoConfigurado = "true";
      formEstrutura.addEventListener("submit", evento => evento.preventDefault());
    }
  }

  window.renderizarInventario = function renderizarInventarioPublico() {
    configurarEventosInventario();
    renderizarInventario();
  };

  configurarEventosInventario();
})();

/* =====================================================
   CATEGORIAS, SUBCATEGORIAS E LOCAIS DA OS
   Usa as constantes centralizadas em /src/constants.
===================================================== */

const categoriasManutencao = SUBCATEGORIAS_MANUTENCAO;
const locaisPrimeiroAndarManutencao = LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO;
const locaisPorAndarManutencao = LOCAIS_POR_ANDAR_MANUTENCAO;

function preencherSelect(select, opcoes, placeholder, valorSelecionado = "") {
  if (!select) return;

  const valorAnterior = valorSelecionado || select.value || "";
  select.innerHTML = `<option value="">${placeholder}</option>`;

  opcoes.forEach(opcao => {
    const option = document.createElement("option");
    option.value = opcao;
    option.textContent = opcao;
    select.appendChild(option);
  });

  select.disabled = opcoes.length === 0;

  if (valorAnterior && opcoes.includes(valorAnterior)) {
    select.value = valorAnterior;
  } else {
    select.value = "";
  }
}

function atualizarSubcategoriasChamado(categoriaSelecionada, subcategoriaSelecionada = "") {
  const categoria = String(categoriaSelecionada || "").trim();
  const subcategoriaSelect = document.getElementById("subcategoriaChamado");
  const lista = categoriasManutencao[categoria] || [];

  preencherSelect(
    subcategoriaSelect,
    lista,
    lista.length ? "Selecione a subcategoria" : "Selecione uma categoria primeiro",
    subcategoriaSelecionada
  );
}

function atualizarLocaisPorAndarManutencao(localSelecionado = "") {
  const andarSelect = document.getElementById("andarChamado");
  const localSelect = document.getElementById("localChamado");
  const andar = andarSelect ? String(andarSelect.value || "").trim() : "";
  const locais = locaisPorAndarManutencao[andar] || [];

  preencherSelect(
    localSelect,
    locais,
    locais.length ? "Selecione o local" : "Selecione um andar primeiro",
    localSelecionado
  );
}

function inicializarFormularioLocalizacaoOS() {
  const andarSelect = document.getElementById("andarChamado");
  const localSelect = document.getElementById("localChamado");

  if (!andarSelect || !localSelect) return;

  if (andarSelect.dataset.localizacaoInicializada !== "true") {
    andarSelect.dataset.localizacaoInicializada = "true";
    andarSelect.addEventListener("change", () => atualizarLocaisPorAndarManutencao(""));
  }

  atualizarLocaisPorAndarManutencao(localSelect.value || "");
}

function inicializarFormularioCategoriaOS() {
  const categoriaSelect = document.getElementById("categoriaChamado");
  const subcategoriaSelect = document.getElementById("subcategoriaChamado");

  if (!categoriaSelect || !subcategoriaSelect) return;

  if (categoriaSelect.dataset.categoriaInicializada !== "true") {
    categoriaSelect.dataset.categoriaInicializada = "true";
    categoriaSelect.addEventListener("change", () => atualizarSubcategoriasChamado(categoriaSelect.value, ""));
  }

  atualizarSubcategoriasChamado(categoriaSelect.value, subcategoriaSelect.value || "");
}

function inicializarFormularioOS() {
  inicializarFormularioLocalizacaoOS();
  inicializarFormularioCategoriaOS();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarFormularioOS);
} else {
  inicializarFormularioOS();
}

window.addEventListener("load", inicializarFormularioOS);

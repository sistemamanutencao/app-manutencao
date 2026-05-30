/* =====================================================
   CATEGORIAS, SUBCATEGORIAS E LOCAIS DA OS
   Fonte única para os selects da abertura de OS.
===================================================== */

const categoriasManutencao = Object.freeze({
  "Elétrica": [
    "Iluminação",
    "Tomadas",
    "Interruptores",
    "Torneira elétrica",
    "Disjuntores",
    "Quadro elétrico",
    "Cabeamento",
    "Eletrocalhas",
    "Aterramento / SPDA",
    "Nobreak / energia estabilizada"
  ],
  "Hidráulica": [
    "Torneiras",
    "Vazamentos",
    "Descarga",
    "Esgoto",
    "Bebedouro",
    "Caixa d’água",
    "Bomba hidráulica",
    "Calhas / drenagem"
  ],
  "Alvenaria": [
    "Piso",
    "Forro",
    "Portas",
    "Janelas",
    "Telhado",
    "Revestimento",
    "Fechaduras",
    "Corrimão / escada"
  ],
  "Pintura": [
    "Pintura interna",
    "Pintura externa",
    "Retoque",
    "Sinalização"
  ],
  "Eletrônica": [
    "Projetores",
    "CFTV",
    "Controle de acesso",
    "Som",
    "Painel eletrônico",
    "TVs",
    "Alarmes / sensores"
  ],
  "Outros": [
    "Mobiliário",
    "Jardinagem",
    "Limpeza técnica",
    "Serviços gerais"
  ]
});

const locaisPorAndarManutencao = Object.freeze({
  "1º ANDAR": [
    "banheiro masculino",
    "banheiro feminino",
    "SABES",
    "Sala Instrutores",
    "Sala-01",
    "Sala-02",
    "Sala-03",
    "Sala-04",
    "Sala-05",
    "Sala-06",
    "Sala-07",
    "Sala-08",
    "Sala-09",
    "Sala-10 INFORMATICA",
    "Sala-11 INFORMATICA",
    "Sala-12",
    "Sala-13 Laboratório informática",
    "Sala-14 Medicina"
  ],
  "SL ANDAR": [
    "BIBLIOTECA",
    "TC-TI",
    "Área de convivência 01 e 02",
    "banheiro masculino",
    "banheiro feminino",
    "banheiro PCD"
  ],
  "0º ANDAR": [
    "banheiro masculino",
    "banheiro feminino",
    "Cantina",
    "Área externa cantina",
    "Guarita",
    "Recepção",
    "Cozinha",
    "Auditório",
    "Administração",
    "Sala Master",
    "Sala Gerencia",
    "Sala Compras",
    "Sala Financeiro",
    "Banheiro administração",
    "Área externa fundos",
    "Área externa frente"
  ],
  "-1º ANDAR": [
    "Estacionamento",
    "Lavanderia",
    "Almoxarifados",
    "banheiro masculino",
    "banheiro feminino",
    "Cozinha pedagógica",
    "Espaço transformador",
    "Espaço caldeira",
    "Espaço esgoto",
    "Sala de Bombas d'água",
    "Caixa d'água"
  ]
});

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


const categoriasManutencao = {
  "Elétrica": [
    "Iluminação",
    "Tomadas",
    "Interruptores",
    "Torneira elétrica",
    "Disjuntores",
    "Quadro Elétrico",
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
    "Pintura Interna",
    "Pintura Externa",
    "Retoque",
    "Sinalização"
  ],
  "Eletrônica": [
    "Projetores",
    "CFTV",
    "Controle de Acesso",
    "Som",
    "Painel Eletrônico",
    "TVs",
    "Alarmes / sensores"
  ],
  "Outros": [
    "Mobiliário",
    "Jardinagem",
    "Limpeza Técnica",
    "Serviços Gerais"
  ]
};

function atualizarSubcategoriasChamado(categoriaSelecionada, subcategoriaSelecionada = "") {
  const subcategoria = document.getElementById("subcategoriaChamado");
  if (!subcategoria) return;

  const valorAtual = subcategoriaSelecionada || subcategoria.value || "";
  const lista = categoriasManutencao[categoriaSelecionada] || [];
  subcategoria.innerHTML = lista.length
    ? '<option value="">Selecione</option>'
    : '<option value="">Selecione uma categoria primeiro</option>';

  lista.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    subcategoria.appendChild(option);
  });

  if (valorAtual && lista.includes(valorAtual)) {
    subcategoria.value = valorAtual;
  }

  subcategoria.disabled = !lista.length;
}

function inicializarSubcategoriasChamado() {
  const categoria = document.getElementById("categoriaChamado");
  const subcategoria = document.getElementById("subcategoriaChamado");

  if (!categoria || !subcategoria || categoria.dataset.subcategoriasInicializadas === "true") return;

  categoria.dataset.subcategoriasInicializadas = "true";
  categoria.addEventListener("change", () => {
    atualizarSubcategoriasChamado(categoria.value, "");
  });

  atualizarSubcategoriasChamado(categoria.value, subcategoria.value);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarSubcategoriasChamado);
} else {
  inicializarSubcategoriasChamado();
}


const locaisPorAndarManutencao = {
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
};

function atualizarLocaisPorAndarManutencao() {
  const andar = document.getElementById("andarChamado");
  const local = document.getElementById("localChamado");

  if (!andar || !local) return;

  const locais = locaisPorAndarManutencao[andar.value] || [];
  local.innerHTML = locais.length
    ? '<option value="">Selecione o local</option>'
    : '<option value="">Selecione um andar primeiro</option>';

  locais.forEach(nomeLocal => {
    const option = document.createElement("option");
    option.value = nomeLocal;
    option.textContent = nomeLocal;
    local.appendChild(option);
  });

  local.disabled = !locais.length;
}

function inicializarLocaisPorAndarManutencao() {
  const andar = document.getElementById("andarChamado");
  if (!andar || andar.dataset.locaisInicializados === "true") return;

  andar.dataset.locaisInicializados = "true";
  andar.addEventListener("change", atualizarLocaisPorAndarManutencao);
  atualizarLocaisPorAndarManutencao();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarLocaisPorAndarManutencao);
} else {
  inicializarLocaisPorAndarManutencao();
}

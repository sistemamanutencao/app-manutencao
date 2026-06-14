/* =====================================================
   CONSTANTES - LOCAIS POR ANDAR
===================================================== */

const LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO = Object.freeze([
  "banheiro masculino",
  "banheiro feminino",
  "SABES",
  "Sala manicure",
  "Espaço Salão",
  "Banheiro feminino SABES",
  "Banheiro masculino SABES",
  "Depósito",
  "Esterilização",
  "Expurgo",
  "Depósito inbel",
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
  "Sala-13 Laboratório de Hardware",
  "Sala-14 Enfermagem",
  "Escadaria",
  "Escadaria de emergência"
]);

const LOCAIS_POR_ANDAR_MANUTENCAO = Object.freeze({
  "1º ANDAR": LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO,
  "SL ANDAR": Object.freeze([
    "BIBLIOTECA",
    "Banheiro Biblioteca",
    "Área de convivência 1",
    "Área de convivência 2",
    "Banheiro feminino",
    "Banheiro masculino",
    "Banheiro PCD",
    "Sala TI",
    "Escadaria",
    "Escadaria de emergência"
  ]),
  "0º ANDAR": Object.freeze([
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
    "Área externa frente",
    "Banheiro camarim",
    "Sala de controle",
    "Escadaria"
  ]),
  "-1º ANDAR": Object.freeze([
    "Estacionamento",
    "Cozinha Colaborador",
    "Vestuário feminino",
    "Vestuário masculino",
    "Almoxarifado 2",
    "Almoxarifado de bebidas",
    "Almoxarifado de alimentos",
    "Recebimento",
    "Lavanderia",
    "Espaço transformador",
    "Espaço Caldeira",
    "Esgoto",
    "Sala bombas d'água",
    "Caixa d'água"
  ]),
  "Telhado": Object.freeze([
    "Toda unidade",
    ...LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO
  ])
});

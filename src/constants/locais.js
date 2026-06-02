/* =====================================================
   CONSTANTES - LOCAIS POR ANDAR
===================================================== */

const LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO = Object.freeze([
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
  "Sala-13 Laboratório de Hardware",
  "Sala-14 Enfermagem",
  "Escadaria"
]);

const LOCAIS_POR_ANDAR_MANUTENCAO = Object.freeze({
  "1º ANDAR": LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO,
  "SL ANDAR": Object.freeze([
    "BIBLIOTECA",
    "TC-TI",
    "Área de convivência 01 e 02",
    "banheiro masculino",
    "banheiro feminino",
    "banheiro PCD",
    "Escadaria"
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
    "Área externa frente"
  ]),
  "-1º ANDAR": Object.freeze([
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
  ]),
  "Telhado": LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO
});

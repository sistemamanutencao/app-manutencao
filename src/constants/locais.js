/* =====================================================
   CONSTANTES - AMBIENTES POR LOCAL PRINCIPAL
===================================================== */

const LOCAIS_ESTACIONAMENTO_MANUTENCAO = Object.freeze([
  "Lavanderia",
  "Subestação",
  "Cisterna Coletora",
  "Casa de Bombas d’Água",
  "Reservatório d’Água",
  "Depósito",
  "Elevador de Carga - Limpeza",
  "Elevador de Carga - Cozinha",
  "Elevador Social"
]);

const LOCAIS_TERREO_MANUTENCAO = Object.freeze([
  "Banheiro Masculino",
  "Banheiro Feminino",
  "Confeitaria",
  "Guarita",
  "Recepção",
  "Cozinha",
  "Auditório",
  "Administração",
  "Sala Master",
  "Sala Gerência",
  "Sala Compras",
  "Sala Financeiro",
  "Banheiro da Administração",
  "Banheiro do Camarim",
  "Sala de Controle",
  "Escadaria",
  "Elevador de Carga - Limpeza",
  "Elevador de Carga - Cozinha",
  "Elevador Social"
]);

const LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO = Object.freeze([
  "Biblioteca",
  "Banheiro da Biblioteca",
  "Área de Convivência 1",
  "Área de Convivência 2",
  "Banheiro Feminino",
  "Banheiro Masculino",
  "Banheiro PCD",
  "Sala TI",
  "Escadaria",
  "Escadaria de Emergência",
  "Elevador de Carga - Limpeza",
  "Elevador Social"
]);

const LOCAIS_SEGUNDO_ANDAR_MANUTENCAO = Object.freeze([
  "Banheiro Masculino",
  "Banheiro Feminino",
  "SABES",
  "Sala de Manicure",
  "Espaço Salão",
  "Banheiro Feminino SABES",
  "Banheiro Masculino SABES",
  "Depósito",
  "Esterilização",
  "Expurgo",
  "Depósito Inbel",
  "Sala de Instrutores",
  "Sala 01",
  "Sala 02",
  "Sala 03",
  "Sala 04",
  "Sala 05",
  "Sala 06",
  "Sala 07",
  "Sala 08",
  "Sala 09",
  "Sala 10 — Informática",
  "Sala 11 — Informática",
  "Sala 12",
  "Sala 13 — Laboratório de Hardware",
  "Sala 14 — Enfermagem",
  "Escadaria",
  "Escadaria de Emergência",
  "Elevador de Carga - Limpeza",
  "Elevador Social"
]);

const LOCAIS_AREA_EXTERNA_MANUTENCAO = Object.freeze([
  "Área externa — Frente",
  "Área externa — Fundos",
  "Área externa Confeitaria",
  "Telhado",
  "Outro ambiente externo"
]);

const LOCAIS_POR_ANDAR_MANUTENCAO = Object.freeze({
  "Estacionamento": LOCAIS_ESTACIONAMENTO_MANUTENCAO,
  "Térreo": LOCAIS_TERREO_MANUTENCAO,
  "1º andar": LOCAIS_PRIMEIRO_ANDAR_MANUTENCAO,
  "2º andar": LOCAIS_SEGUNDO_ANDAR_MANUTENCAO,
  "Área externa": LOCAIS_AREA_EXTERNA_MANUTENCAO
});

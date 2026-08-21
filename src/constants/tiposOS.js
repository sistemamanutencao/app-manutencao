/* =====================================================
   CONSTANTES - TIPOS DE MANUTENÇÃO
===================================================== */

const TIPOS_MANUTENCAO = Object.freeze({
  CORRETIVA: "Corretiva",
  PREVENTIVA: "Preventiva",
  INSPECAO: "Inspeção",
  MELHORIA: "Melhoria"
});

const TIPOS_MANUTENCAO_LISTA = Object.freeze(Object.values(TIPOS_MANUTENCAO));

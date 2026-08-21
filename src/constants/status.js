/* =====================================================
   CONSTANTES - STATUS DAS OS
===================================================== */

const STATUS_OS = Object.freeze({
  ABERTO: "ABERTO",
  EM_ANDAMENTO: "EM ANDAMENTO",
  AGUARDANDO: "AGUARDANDO",
  CONCLUIDO: "CONCLUÍDO",
  VALIDADO: "VALIDADO",
  ENCERRADO: "ENCERRADO",
  CANCELADO: "CANCELADO"
});

const STATUS_OS_LISTA = Object.freeze(Object.values(STATUS_OS));

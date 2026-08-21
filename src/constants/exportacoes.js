/* =====================================================
   CONSTANTES - EXPORTAÇÕES
===================================================== */

const STATUS_EXPORTACAO_OS = Object.freeze(STATUS_OS_LISTA);

const STATUS_EXPORTACAO_OS_FINALIZADAS = STATUS_EXPORTACAO_OS;

const COLUNAS_EXPORTACAO_OS = Object.freeze([
  { chave: "numeroOS", titulo: "Nº OS" },
  { chave: "status", titulo: "Status" },
  { chave: "andar", titulo: "Andar" },
  { chave: "local", titulo: "Local" },
  { chave: "tipoManutencao", titulo: "Tipo de manutenção" },
  { chave: "categoria", titulo: "Categoria" },
  { chave: "subcategoria", titulo: "Subcategoria" },
  { chave: "equipamento", titulo: "Equipamento / patrimônio / QR Code" },
  { chave: "horario", titulo: "Melhor horário" },
  { chave: "precisaAcompanhamento", titulo: "Necessário acompanhar" },
  { chave: "prioridade", titulo: "Prioridade" },
  { chave: "descricao", titulo: "Descrição da solicitação" },
  { chave: "criadoPorNome", titulo: "Criado por" },
  { chave: "dataCriacao", titulo: "Data de abertura" }
]);

const COLUNAS_EXPORTACAO_OS_FINALIZADAS = COLUNAS_EXPORTACAO_OS;

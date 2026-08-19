/* =====================================================
   STATE - ESTADO GLOBAL DA APLICAÇÃO

   Responsabilidades:
   - manter usuário atual;
   - armazenar coleções carregadas do Firestore;
   - controlar filtros, seleção atual e listeners em tempo real.

   Atenção:
   - variáveis deste arquivo são compartilhadas por vários módulos globais;
   - não renomear sem revisar todos os arquivos JS.
===================================================== */

const USUARIO_PADRAO = {
  id: "",
  nome: "Colaborador",
  setor: "Manutenção",
  email: "",
  unidade: "Senac Campo Mourão",
  perfil: PERFIS_USUARIO.COLABORADOR,
  manutencaoAutorizado: false,
  perfilConfigurado: false
};

let usuarioAtual = { ...USUARIO_PADRAO };
let chamados = [];
let comunicados = [];
let notificacoes = [];
let ativos = [];
let planosPreventivos = [];
let diagnosticos = [];
let cadastrosColaboradores = [];

let filtroStatusAtual = "TODOS";
let abaChamadosAtual = "ATIVAS";
let chamadoSelecionadoId = null;

let termoBuscaChamados = "";
let termoBuscaPainel = "";
let filtroPainelStatusAtual = "TODOS";
let filtroPainelPrioridadeAtual = "TODAS";
let abaFilaPainelAtual = "ATIVAS";
let filtroPeriodoDashboardAtual = "30";
let filtroCategoriaDashboardAtual = "TODAS";

let monitorChamados = null;
let monitorComunicados = null;
let monitorNotificacoes = null;
let monitorAtivos = null;
let monitorPlanosPreventivos = null;
let monitorDiagnosticos = null;
let monitorCadastrosColaboradores = null;

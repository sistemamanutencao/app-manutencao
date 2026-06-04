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

let filtroStatusAtual = "TODOS";
let chamadoSelecionadoId = null;

let termoBuscaChamados = "";
let termoBuscaPainel = "";
let filtroPainelStatusAtual = "TODOS";
let filtroPainelPrioridadeAtual = "TODAS";
let filtroPeriodoDashboardAtual = "30";
let filtroCategoriaDashboardAtual = "TODAS";

let monitorChamados = null;
let monitorComunicados = null;
let monitorNotificacoes = null;
let monitorAtivos = null;
let monitorPlanosPreventivos = null;
let monitorDiagnosticos = null;

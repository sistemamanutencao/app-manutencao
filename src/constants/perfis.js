/* =====================================================
   PERFIS DO SISTEMA
   Centraliza os tipos de usuário aceitos no app.
===================================================== */

const PERFIS_USUARIO = Object.freeze({
  COLABORADOR: "colaborador",
  GERENCIA: "gerencia",
  MANUTENCAO: "manutencao",
  ADMINISTRADOR: "administrador"
});

const PERFIS_USUARIO_LISTA = Object.freeze([
  PERFIS_USUARIO.COLABORADOR,
  PERFIS_USUARIO.GERENCIA,
  PERFIS_USUARIO.MANUTENCAO,
  PERFIS_USUARIO.ADMINISTRADOR
]);

const NOMES_PERFIS_USUARIO = Object.freeze({
  [PERFIS_USUARIO.COLABORADOR]: "Colaborador",
  [PERFIS_USUARIO.GERENCIA]: "Gerência",
  [PERFIS_USUARIO.MANUTENCAO]: "Manutenção",
  [PERFIS_USUARIO.ADMINISTRADOR]: "Administrador"
});

const ALIASES_PERFIS_USUARIO = Object.freeze({
  colaborador: PERFIS_USUARIO.COLABORADOR,
  solicitante: PERFIS_USUARIO.COLABORADOR,
  gerencia: PERFIS_USUARIO.GERENCIA,
  gerente: PERFIS_USUARIO.GERENCIA,
  gestor: PERFIS_USUARIO.GERENCIA,
  gestao: PERFIS_USUARIO.GERENCIA,
  coordenacao: PERFIS_USUARIO.GERENCIA,
  coordenador: PERFIS_USUARIO.GERENCIA,
  supervisao: PERFIS_USUARIO.GERENCIA,
  supervisor: PERFIS_USUARIO.GERENCIA,
  manutencao: PERFIS_USUARIO.MANUTENCAO,
  manutencao_predial: PERFIS_USUARIO.MANUTENCAO,
  tecnico: PERFIS_USUARIO.MANUTENCAO,
  tecnica: PERFIS_USUARIO.MANUTENCAO,
  responsavel_manutencao: PERFIS_USUARIO.MANUTENCAO,
  administrador: PERFIS_USUARIO.ADMINISTRADOR,
  admin: PERFIS_USUARIO.ADMINISTRADOR,
  administracao: PERFIS_USUARIO.ADMINISTRADOR
});

/* =====================================================
   AUTH PERMISSIONS - AUTORIZAÇÃO E PERFIS

   Responsabilidades:
   - normalizar nomes de perfil;
   - consultar permissões por perfil;
   - identificar colaborador, gerência e manutenção;
   - proteger ações visuais do front-end.

   Atenção:
   - arquivo sensível para controle de acesso;
   - deve permanecer alinhado com firestore.rules e usuarios/{uid}.
===================================================== */

function normalizarTextoPermissao(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarPerfilUsuario(perfil) {
  const perfilTexto = normalizarTextoPermissao(perfil || PERFIS_USUARIO.COLABORADOR);
  return ALIASES_PERFIS_USUARIO[perfilTexto] || PERFIS_USUARIO.COLABORADOR;
}

function obterNomePerfilFormatado(perfil) {
  const perfilNormalizado = normalizarPerfilUsuario(perfil);
  return NOMES_PERFIS_USUARIO[perfilNormalizado] || NOMES_PERFIS_USUARIO[PERFIS_USUARIO.COLABORADOR];
}

function usuarioTemPerfilSalvo() {
  return usuarioAtual && usuarioAtual.perfilConfigurado === true;
}

function usuarioPossuiPerfil(perfil) {
  return usuarioTemPerfilSalvo() && normalizarPerfilUsuario(usuarioAtual.perfil) === normalizarPerfilUsuario(perfil);
}

function perfilPode(perfil, permissao) {
  const perfilNormalizado = normalizarPerfilUsuario(perfil);
  const permissoes = PERMISSOES_POR_PERFIL[perfilNormalizado] || [];
  return permissoes.includes(permissao);
}

function usuarioPode(permissao) {
  if (!usuarioTemPerfilSalvo()) {
    return false;
  }

  const perfil = normalizarPerfilUsuario(usuarioAtual.perfil);
  const permissoes = PERMISSOES_POR_PERFIL[perfil] || [];
  return permissoes.includes(permissao);
}

function usuarioEhManutencaoAutorizada() {
  return usuarioTemPerfilSalvo()
    && usuarioAtual.manutencaoAutorizado === true
    && (usuarioPode(PERMISSOES_APP.VER_PAINEL) || usuarioPode(PERMISSOES_APP.VER_TODAS_OS));
}

function usuarioEhGerencia() {
  return usuarioPossuiPerfil(PERFIS_USUARIO.GERENCIA);
}

function usuarioEhPerfilOperacionalManutencao() {
  return usuarioEhManutencaoAutorizada();
}

function usuarioPodeVerPainel() {
  return usuarioPode(PERMISSOES_APP.VER_PAINEL);
}

function usuarioPodeCriarComunicado() {
  return usuarioPode(PERMISSOES_APP.CRIAR_COMUNICADO);
}

function usuarioPodeGerenciarAtivos() {
  return usuarioPode(PERMISSOES_APP.GERENCIAR_ATIVOS);
}

function usuarioPodeGerenciarPreventivas() {
  return usuarioPode(PERMISSOES_APP.GERENCIAR_PREVENTIVAS);
}

function usuarioPodeVerTodasOS() {
  return usuarioPode(PERMISSOES_APP.VER_TODAS_OS);
}

function usuarioPodeAssumirAtendimento() {
  return usuarioPode(PERMISSOES_APP.ASSUMIR_ATENDIMENTO);
}

function usuarioPodeGerenciarUsuarios() {
  return usuarioPode(PERMISSOES_APP.GERENCIAR_USUARIOS);
}

function usuarioPodeExportarDados() {
  return usuarioPode(PERMISSOES_APP.EXPORTAR_DADOS);
}

function usuarioPodeAjustarConfiguracoes() {
  return usuarioPode(PERMISSOES_APP.AJUSTAR_CONFIGURACOES);
}

function usuarioPodeAuditarHistorico() {
  return usuarioPode(PERMISSOES_APP.AUDITAR_HISTORICO);
}

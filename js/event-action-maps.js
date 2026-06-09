/* =====================================================
   EVENT ACTION MAPS - MAPAS DE AÇÕES DA INTERFACE

   Responsabilidades:
   - concentrar os nomes das ações acionadas pela interface;
   - manter o arquivo event-bindings.js focado apenas em delegação de eventos;
   - evitar retorno de chamadas inline no HTML ou em templates JS.

   Atenção:
   - este arquivo não contém regra de negócio;
   - as funções finais continuam nos módulos específicos do app;
   - novos botões devem ser registrados aqui antes de uso.
===================================================== */

(function registrarMapasDeAcoesDaInterface() {
  function executarAcao(nomeFuncao, ...argumentos) {
    const funcao = window[nomeFuncao];

    if (typeof funcao !== "function") {
      console.warn(`Ação de interface não encontrada: ${nomeFuncao}`);
      return undefined;
    }

    return funcao(...argumentos);
  }

  const acoesClique = {
    "abrir-painel-notificacoes": () => executarAcao("abrirPainelNotificacoes"),
    "abrir-leitor-qr": () => executarAcao("abrirLeitorQRCode"),
    "exportar-os-excel": () => executarAcao("exportarOSFinalizadasExcel"),
    "exportar-os-pdf": () => executarAcao("exportarOSFinalizadasPDF"),
    "exportar-os-word": () => executarAcao("exportarOSFinalizadasWord"),
    "salvar-ativo": () => executarAcao("salvarAtivo"),
    "iniciar-leitura-qr": () => executarAcao("iniciarLeituraQRCode"),
    "parar-leitura-qr": () => executarAcao("pararLeituraQRCode"),
    "processar-qr-manual": () => executarAcao("processarQRCodeManual"),
    "salvar-plano-preventivo": () => executarAcao("salvarPlanoPreventivo"),
    "cancelar-edicao-plano-preventivo": () => executarAcao("cancelarEdicaoPlanoPreventivo"),
    "criar-item-diagnostico": elemento => executarAcao("criarItemDiagnostico", elemento),
    "cancelar-edicao-diagnostico": () => executarAcao("cancelarEdicaoDiagnostico"),
    "criar-chamado": () => executarAcao("criarChamado"),
    "criar-comunicado": () => executarAcao("criarComunicado"),
    "salvar-comunicado": () => executarAcao("salvarComunicado"),
    "limpar-comunicado": () => executarAcao("limparFormularioComunicado"),
    "cancelar-edicao-comunicado": () => executarAcao("cancelarEdicaoComunicado"),
    "selecionar-nivel-comunicado": elemento => executarAcao("selecionarNivelComunicado", elemento),
    "entrar-colaborador": elemento => executarAcao("entrarComoColaborador", elemento),
    "entrar-firebase": elemento => executarAcao("entrarComFirebase", elemento),
    "redefinir-senha-firebase": elemento => executarAcao("abrirExperienciaRedefinicaoSenha", elemento),
    "enviar-redefinicao-senha-visual": elemento => executarAcao("enviarLinkRedefinicaoSenhaVisual", elemento),
    "voltar-login-redefinicao": () => executarAcao("fecharExperienciaRedefinicaoSenha"),
    "cadastrar-colaborador-pendente": elemento => executarAcao("cadastrarColaboradorPendente", elemento),
    "criar-primeiro-acesso-colaborador": elemento => executarAcao("criarPrimeiroAcessoColaborador", elemento),
    "limpar-filtros-painel": () => executarAcao("limparFiltrosPainel"),
    "fechar-detalhes-chamado": () => executarAcao("fecharDetalhesChamado"),
    "cancelar-chamado-atual": elemento => executarAcao("cancelarChamadoAtual", elemento),
    "alterar-prioridade-chamado": elemento => executarAcao("alterarPrioridadeChamadoAtual", elemento),
    "fechar-visualizacao-foto": () => executarAcao("fecharVisualizacaoFoto"),
    "fechar-painel-notificacoes": () => executarAcao("fecharPainelNotificacoes"),
    "marcar-todas-notificacoes-lidas": () => executarAcao("marcarTodasNotificacoesComoLidas")
  };

  const acoesMudanca = {
    "atualizar-subcategorias-plano-preventivo": () => executarAcao("atualizarSubcategoriasPlanoPreventivo"),
    "renderizar-planos-preventivos": () => executarAcao("renderizarPlanosPreventivos"),
    "filtrar-diagnostico-status": elemento => executarAcao("filtrarDiagnosticoStatus", elemento.value),
    "filtrar-diagnostico-prioridade": elemento => executarAcao("filtrarDiagnosticoPrioridade", elemento.value),
    "atualizar-locais-andar-manutencao": () => executarAcao("atualizarLocaisPorAndarManutencao"),
    "atualizar-subcategorias-chamado": elemento => executarAcao("atualizarSubcategoriasChamado", elemento.value),
    "alterar-periodo-dashboard": elemento => executarAcao("alterarPeriodoDashboard", elemento.value),
    "alterar-categoria-dashboard": elemento => executarAcao("alterarCategoriaDashboard", elemento.value),
    "filtrar-painel-status": elemento => executarAcao("filtrarPainelStatus", elemento.value),
    "filtrar-painel-prioridade": elemento => executarAcao("filtrarPainelPrioridade", elemento.value),
    "selecionar-nivel-comunicado-select": elemento => executarAcao("selecionarNivelComunicadoSelect", elemento)
  };

  const acoesDinamicas = {
    prepararOSDoAtivo: (...argumentos) => executarAcao("prepararOSDoAtivo", ...argumentos),
    mostrarHistoricoAtivo: (...argumentos) => executarAcao("mostrarHistoricoAtivo", ...argumentos),
    imprimirEtiquetaAtivo: (...argumentos) => executarAcao("imprimirEtiquetaAtivo", ...argumentos),
    prepararPlanoPreventivoDoAtivo: (...argumentos) => executarAcao("prepararPlanoPreventivoDoAtivo", ...argumentos),
    excluirAtivo: (...argumentos) => executarAcao("excluirAtivo", ...argumentos),
    abrirDetalhesChamado: (...argumentos) => executarAcao("abrirDetalhesChamado", ...argumentos),
    editarComunicado: (...argumentos) => executarAcao("editarComunicado", ...argumentos),
    excluirComunicado: (...argumentos) => executarAcao("excluirComunicado", ...argumentos),
    filtrarComunicados: (...argumentos) => executarAcao("filtrarComunicados", ...argumentos),
    usarItemChecklistDiagnostico: (...argumentos) => executarAcao("usarItemChecklistDiagnostico", ...argumentos),
    prepararOSComDiagnostico: (...argumentos) => executarAcao("prepararOSComDiagnostico", ...argumentos),
    marcarDiagnosticoResolvido: (...argumentos) => executarAcao("marcarDiagnosticoResolvido", ...argumentos),
    editarDiagnostico: (...argumentos) => executarAcao("editarDiagnostico", ...argumentos),
    excluirDiagnostico: (...argumentos) => executarAcao("excluirDiagnostico", ...argumentos),
    imprimirPagina: () => window.print(),
    prepararCadastroAtivoPorQR: (...argumentos) => executarAcao("prepararCadastroAtivoPorQR", ...argumentos),
    mostrarHistoricoAtivoNoLeitor: (...argumentos) => executarAcao("mostrarHistoricoAtivoNoLeitor", ...argumentos),
    abrirFotoChamadoAtual: (...argumentos) => executarAcao("abrirFotoChamadoAtual", Number(argumentos[0])),
    abrirFotoFinalizacaoChamadoAtual: (...argumentos) => executarAcao("abrirFotoFinalizacaoChamadoAtual", Number(argumentos[0])),
    marcarNotificacaoComoLida: (...argumentos) => executarAcao("marcarNotificacaoComoLida", ...argumentos),
    abrirChamadoPelaNotificacao: (...argumentos) => executarAcao("abrirChamadoPelaNotificacao", ...argumentos),
    selecionarFotoFinalizacao: (...argumentos) => executarAcao("selecionarFotoFinalizacao", ...argumentos),
    validarOS: (...argumentos) => executarAcao("validarOS", ...argumentos),
    encerrarOS: (...argumentos) => executarAcao("encerrarOS", ...argumentos),
    salvarStatusPainel: (...argumentos) => executarAcao("salvarStatusPainel", ...argumentos),
    gerarOSPreventiva: (...argumentos) => executarAcao("gerarOSPreventiva", ...argumentos),
    editarPlanoPreventivo: (...argumentos) => executarAcao("editarPlanoPreventivo", ...argumentos),
    inativarPlanoPreventivo: (...argumentos) => executarAcao("inativarPlanoPreventivo", ...argumentos),
    excluirPlanoPreventivo: (...argumentos) => executarAcao("excluirPlanoPreventivo", ...argumentos)
  };

  const acoesEntrada = {
    "pesquisar-os": elemento => executarAcao("pesquisarOS", elemento.value),
    "renderizar-planos-preventivos": () => executarAcao("renderizarPlanosPreventivos"),
    "pesquisar-diagnostico": elemento => executarAcao("pesquisarDiagnostico", elemento.value),
    "pesquisar-painel": elemento => executarAcao("pesquisarPainel", elemento.value)
  };

  window.APP_EVENT_ACTION_MAPS = {
    acoesClique,
    acoesMudanca,
    acoesDinamicas,
    acoesEntrada
  };
})();

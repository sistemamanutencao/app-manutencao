/* =====================================================
   CHAMADOS - AÇÕES OPERACIONAIS DA OS

   Responsabilidades:
   - criar, pesquisar, cancelar, assumir e atualizar chamados;
   - controlar ações da manutenção sobre OS;
   - acionar notificações e logs técnicos relacionados.

   Atenção:
   - arquivo sensível para operação da manutenção;
   - não alterar nomes de status ou regras de permissão sem validação.
===================================================== */

/* =====================
   Criação de chamado
===================== */

async function criarChamado() {
  const botaoEnvio = document.querySelector('button[data-action="criar-chamado"]');

  if (botaoEnvio && botaoEnvio.disabled) {
    return;
  }

  if (typeof inicializarFormularioOS === "function") {
    inicializarFormularioOS();
  }

  const campos = obterCamposFormularioChamado();

  if (!campos.formularioValido) {
    await appFeedback("Alguns campos do formulário da OS não foram encontrados.\nAtualize a página e tente novamente.", { tipo: "erro", titulo: "Formulário incompleto" });
    console.error("Campos ausentes na OS:", campos.ausentes);
    return;
  }

  if (typeof atualizarLocaisPorAndarManutencao === "function") {
    atualizarLocaisPorAndarManutencao(campos.local.value);
  }

  if (typeof atualizarSubcategoriasChamado === "function") {
    atualizarSubcategoriasChamado(campos.categoria.value, campos.subcategoria.value);
  }

  const valores = lerValoresFormularioChamado(campos);
  const camposPendentes = validarValoresFormularioChamado(valores);

  marcarCamposObrigatoriosChamado(campos, camposPendentes);

  if (camposPendentes.length > 0) {
    await appFeedback(`Preencha os campos obrigatórios da OS:\n- ${camposPendentes.join("\n- ")}`, { tipo: "aviso" });
    return;
  }

  if (valores.arquivosFotos.length > LIMITE_FOTOS_CHAMADO) {
    await appFeedback(`Selecione no máximo ${LIMITE_FOTOS_CHAMADO} imagens por chamado.\nRemova imagens excedentes e tente novamente.`, { tipo: "aviso", titulo: "Limite de imagens" });
    return;
  }

  if (botaoEnvio) {
    botaoEnvio.disabled = true;
    botaoEnvio.dataset.textoOriginal = botaoEnvio.textContent;
    botaoEnvio.textContent = "Enviando...";
  }

  const agora = new Date();
  const dataAtual = agora.toLocaleDateString("pt-BR");
  const resultadoFotos = await converterArquivosFotosChamado(valores.arquivosFotos);
  const fotosAnexadas = resultadoFotos.fotos;
  const fotoPrincipal = fotosAnexadas[0] || null;

  if (resultadoFotos.falhas > 0) {
    await appFeedback("Uma ou mais imagens não puderam ser anexadas.\nA OS será criada apenas com as imagens válidas.", { tipo: "aviso", titulo: "Anexos parcialmente processados" });
  }

  const numeroOS = gerarNumeroOS(agora);

  const novoChamado = montarObjetoChamado({
    numeroOS,
    dataAtual,
    valores,
    fotosAnexadas,
    fotoPrincipal
  });

  try {
    const chamadoId = await criarChamadoFirebase(novoChamado);

    if (typeof registrarNotificacaoNovoChamado === "function") {
      await registrarNotificacaoNovoChamado(chamadoId, novoChamado);
    }

    if (typeof enviarAlertaPushNovoChamado === "function") {
      enviarAlertaPushNovoChamado(chamadoId).catch(erro => {
        console.warn("OS criada; alerta push não enviado:", erro);
      });
    }

    await appFeedback(`OS ${numeroOS} aberta com sucesso.\nA solicitação já está disponível para acompanhamento.`, { tipo: "sucesso", titulo: "OS registrada" });
    limparFormularioChamado();
    prepararAbaChamadosAposEnvio();
    openPage("chamados");
  } catch (erro) {
    console.error("Erro ao enviar OS:", erro);
    const detalheErro = erro && (erro.code || erro.message) ? `\nDetalhe técnico: ${erro.code || erro.message}` : "";
    await appFeedback(`Não foi possível enviar a OS.\nVerifique sua conexão, login e permissões.${detalheErro}`, { tipo: "erro", titulo: "Falha ao abrir OS" });
  } finally {
    if (botaoEnvio) {
      botaoEnvio.disabled = false;
      botaoEnvio.textContent = botaoEnvio.dataset.textoOriginal || "Abrir OS";
      delete botaoEnvio.dataset.textoOriginal;
    }
  }
}


/* Funções auxiliares migradas para chamados-form.js e chamados-render.js. */

/* =====================
   Atalhos e filtros da tela de chamados
===================== */

function selecionarCategoriaRapida(categoria, botao) {
  const campoCategoria = document.getElementById("categoriaChamado");

  if (campoCategoria) {
    campoCategoria.value = categoria;
    campoCategoria.dispatchEvent(new Event("change"));
  }

  document.querySelectorAll(".category-fast-button").forEach(item => {
    item.classList.remove("active");
  });

  if (botao) {
    botao.classList.add("active");
  }
}



function filtrarOS(status, botao) {
  filtrarChamados(status, botao);
}

function pesquisarOS(valor) {
  pesquisarChamados(valor);
}

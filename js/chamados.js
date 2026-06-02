/* =====================================================
   CHAMADOS
===================================================== */

async function criarChamado() {
  const botaoEnvio = document.querySelector('button[onclick="criarChamado()"]');

  if (botaoEnvio && botaoEnvio.disabled) {
    return;
  }

  if (typeof inicializarFormularioOS === "function") {
    inicializarFormularioOS();
  }

  const campos = obterCamposFormularioChamado();

  if (!campos.formularioValido) {
    await appFeedback("Erro: alguns campos do formulário de OS não foram encontrados no HTML. Atualize a página e tente novamente.", { tipo: "erro" });
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
    await appFeedback(`Selecione no máximo ${LIMITE_FOTOS_CHAMADO} imagens por chamado.`, { tipo: "aviso" });
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
    await appFeedback("Uma ou mais imagens não puderam ser anexadas. A OS será criada com as imagens válidas.", { tipo: "aviso" });
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

    await appFeedback(`OS ${numeroOS} aberta com sucesso!`, { tipo: "sucesso" });
    limparFormularioChamado();
    prepararAbaChamadosAposEnvio();
    openPage("chamados");
  } catch (erro) {
    console.error("Erro ao enviar OS:", erro);
    const detalheErro = erro && (erro.code || erro.message) ? `\nDetalhe técnico: ${erro.code || erro.message}` : "";
    await appFeedback(`Não foi possível enviar a OS para o Firebase. Verifique conexão, login e permissões.${detalheErro}`, { tipo: "erro" });
  } finally {
    if (botaoEnvio) {
      botaoEnvio.disabled = false;
      botaoEnvio.textContent = botaoEnvio.dataset.textoOriginal || "Abrir OS";
      delete botaoEnvio.dataset.textoOriginal;
    }
  }
}


/* Funções auxiliares migradas para chamados-form.js e chamados-render.js. */

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

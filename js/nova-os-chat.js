/* =====================================================
   NOVA OS CHAT - ABERTURA GUIADA DE CHAMADOS

   Responsabilidades:
   - conduzir o solicitante em formato conversacional;
   - coletar local, ambiente, categoria, problema, impacto e fotos;
   - calcular prioridade de forma determinística;
   - sincronizar o resultado com os campos legados usados por chamados.js;
   - preservar o mesmo fluxo de gravação Firebase já existente.

   Atenção:
   - este módulo não grava diretamente no Firestore;
   - a criação final continua sendo executada por criarChamado().
===================================================== */

(function inicializarModuloNovaOSChat() {
  const ELEVADORES_CONHECIDOS = Object.freeze([
    "Elevador Social",
    "Elevador de Carga - Limpeza",
    "Elevador de Carga - Cozinha"
  ]);

  const CATEGORIAS_CHAT_NOVA_OS = Object.freeze({
    "Elétrica": Object.freeze([
      "Iluminação / lâmpada / painel de LED",
      "Tomada",
      "Interruptor",
      "Disjuntor",
      "Falta de energia",
      "Queda de tensão / oscilação",
      "Fiação / cabo",
      "Quadro elétrico",
      "Sensor / acionamento",
      "Outro problema elétrico"
    ]),
    "Hidráulica": Object.freeze([
      "Vazamento",
      "Entupimento",
      "Torneira",
      "Vaso sanitário",
      "Descarga",
      "Pia / sifão",
      "Chuveiro / ducha",
      "Falta de água",
      "Baixa pressão",
      "Caixa d’água / reservatório",
      "Bomba d’água",
      "Outro problema hidráulico"
    ]),
    "Civil / Alvenaria": Object.freeze([
      "Infiltração",
      "Azulejo / revestimento",
      "Parede",
      "Piso",
      "Teto",
      "Gesso",
      "Trinca / rachadura",
      "Porta / batente",
      "Rodapé",
      "Outro problema civil"
    ]),
    "Pintura": Object.freeze([
      "Parede",
      "Teto",
      "Porta",
      "Batente",
      "Corrimão / estrutura metálica",
      "Retoque localizado",
      "Pintura descascando",
      "Mancha / umidade",
      "Outro problema de pintura"
    ]),
    "Marcenaria": Object.freeze([
      "Porta",
      "Armário",
      "Gaveta",
      "Prateleira",
      "Bancada",
      "Mesa",
      "Cadeira",
      "Fechadura / puxador",
      "Dobradiça",
      "Outro problema de marcenaria"
    ]),
    "Climatização": Object.freeze([
      "Ar-condicionado não liga",
      "Não está resfriando",
      "Está pingando",
      "Está fazendo ruído",
      "Mau cheiro",
      "Controle remoto",
      "Temperatura irregular",
      "Outro problema de climatização"
    ]),
    "Equipamentos / Elevadores": Object.freeze([
      "Não funciona",
      "Porta não abre / fecha",
      "Travou",
      "Parou entre andares",
      "Ruído anormal",
      "Botão não funciona",
      "Iluminação interna",
      "Outro problema no equipamento"
    ]),
    "Outro": Object.freeze([])
  });

  const EQUIPAMENTOS_CHAT = Object.freeze([
    "Elevador Social",
    "Elevador de Carga - Limpeza",
    "Elevador de Carga - Cozinha",
    "Outro equipamento"
  ]);

  const ESTADO_INICIAL = Object.freeze({
    passo: "local",
    dados: Object.freeze({
      localPrincipal: "",
      ambiente: "",
      categoria: "",
      subcategoria: "",
      equipamento: "",
      riscoImediato: "",
      riscoPessoas: "",
      riscoPatrimonio: "",
      ambienteSemUso: "",
      acontecendoAgora: "",
      detalhes: "",
      detalhesRespondido: false,
      fotoRespondida: false
    })
  });

  let estado = criarEstadoInicial();
  let inicializado = false;
  let resultadoEnvio = null;
  let envioEmAndamento = false;
  let urlsPreview = [];

  function criarEstadoInicial() {
    return {
      passo: ESTADO_INICIAL.passo,
      dados: { ...ESTADO_INICIAL.dados },
      historico: [],
      pilha: [],
      modoEdicao: "",
      diagnosticoOrigem: null
    };
  }

  function novaOSChatAtivo() {
    return Boolean(document.getElementById("novaOSChat"));
  }

  function inicializarChatNovaOS() {
    if (!novaOSChatAtivo()) return;

    if (resultadoEnvio) {
      resultadoEnvio = null;
      estado = criarEstadoInicial();
    }

    if (!inicializado) {
      inicializado = true;
      estado = criarEstadoInicial();
      adicionarMensagemSistema(
        `Olá${obterPrimeiroNomeUsuario() ? `, ${obterPrimeiroNomeUsuario()}` : ""}. Vou te ajudar a abrir um chamado. Responda às opções e eu organizo as informações para a manutenção.`
      );
    }

    renderizarChatNovaOS();
  }

  function obterPrimeiroNomeUsuario() {
    const nome = typeof usuarioAtual !== "undefined" && usuarioAtual ? String(usuarioAtual.nome || "").trim() : "";
    if (!nome || nome.toLowerCase() === "colaborador") return "";
    return nome.split(/\s+/)[0];
  }

  function reiniciarChatNovaOS() {
    limparPreviewsFotos();
    limparInputFoto();
    resultadoEnvio = null;
    estado = criarEstadoInicial();
    adicionarMensagemSistema(
      `Vamos começar novamente${obterPrimeiroNomeUsuario() ? `, ${obterPrimeiroNomeUsuario()}` : ""}.`
    );
    renderizarChatNovaOS();
  }

  function adicionarMensagemSistema(texto, tipo = "normal") {
    estado.historico.push({ papel: "assistente", texto, tipo });
  }

  function registrarResposta(pergunta, resposta) {
    estado.historico.push({ papel: "assistente", texto: pergunta, tipo: "pergunta" });
    estado.historico.push({ papel: "usuario", texto: resposta, tipo: "resposta" });
  }

  function registrarCheckpoint() {
    estado.pilha.push({
      passo: estado.passo,
      dados: JSON.parse(JSON.stringify(estado.dados)),
      historicoTamanho: estado.historico.length,
      modoEdicao: estado.modoEdicao,
      diagnosticoOrigem: estado.diagnosticoOrigem
    });
  }

  function voltarChatNovaOS() {
    const checkpoint = estado.pilha.pop();
    if (!checkpoint) return;

    estado.passo = checkpoint.passo;
    estado.dados = checkpoint.dados;
    estado.historico = estado.historico.slice(0, checkpoint.historicoTamanho);
    estado.modoEdicao = checkpoint.modoEdicao;
    estado.diagnosticoOrigem = checkpoint.diagnosticoOrigem;
    renderizarChatNovaOS();
  }

  function responderChatNovaOS(passo, valor) {
    if (passo !== estado.passo) return;

    const resposta = String(valor || "").trim();
    if (!resposta) return;

    registrarCheckpoint();

    if (passo === "local") {
      registrarResposta("Onde está o problema?", resposta);
      estado.dados.localPrincipal = resposta;
      estado.dados.ambiente = "";

      if (resposta === "Outro local") {
        estado.passo = "outro-local";
      } else {
        estado.passo = "ambiente";
      }
    } else if (passo === "ambiente") {
      registrarResposta("Em qual ambiente?", resposta);

      if (resposta === "Outro ambiente" || resposta === "Outro ambiente externo") {
        estado.passo = "outro-ambiente";
      } else {
        estado.dados.ambiente = resposta;
        estado.passo = proximoAposAmbiente();
      }
    } else if (passo === "categoria") {
      registrarResposta("Que tipo de problema você identificou?", resposta);
      estado.dados.categoria = resposta;
      estado.dados.subcategoria = "";
      estado.dados.equipamento = ELEVADORES_CONHECIDOS.includes(estado.dados.ambiente) ? estado.dados.ambiente : "";
      estado.dados.riscoImediato = "";

      if (resposta === "Outro") {
        estado.passo = "outro-problema";
      } else if (resposta === "Equipamentos / Elevadores" && !estado.dados.equipamento) {
        estado.passo = "equipamento";
      } else {
        estado.passo = "subcategoria";
      }
    } else if (passo === "equipamento") {
      registrarResposta("Qual equipamento apresenta problema?", resposta);

      if (resposta === "Outro equipamento") {
        estado.passo = "outro-equipamento";
      } else {
        estado.dados.equipamento = resposta;
        estado.passo = "subcategoria";
      }
    } else if (passo === "subcategoria") {
      registrarResposta("Qual é o problema?", resposta);

      if (/^Outro problema/i.test(resposta)) {
        estado.passo = "outro-problema";
      } else {
        estado.dados.subcategoria = resposta;
        estado.passo = proximoAposProblema();
      }
    } else if (passo === "risco-imediato") {
      registrarResposta("Existe algum sinal de risco imediato?", resposta);
      estado.dados.riscoImediato = resposta;
      aplicarAvisoRiscoImediato(resposta);
      estado.passo = "risco-pessoas";
    } else if (passo === "risco-pessoas") {
      registrarResposta("O problema oferece risco para pessoas?", resposta);
      estado.dados.riscoPessoas = resposta;
      if (resposta === "Sim") {
        adicionarMensagemSistema("Evite utilizar ou acessar a área de risco até a avaliação da manutenção.", "alerta");
      }
      estado.passo = "risco-patrimonio";
    } else if (passo === "risco-patrimonio") {
      registrarResposta("Há risco de dano ao prédio ou a equipamentos?", resposta);
      estado.dados.riscoPatrimonio = resposta;
      estado.passo = "ambiente-uso";
    } else if (passo === "ambiente-uso") {
      registrarResposta("O ambiente ficou sem condições de uso?", resposta);
      estado.dados.ambienteSemUso = resposta;
      estado.passo = "acontecendo-agora";
    } else if (passo === "acontecendo-agora") {
      registrarResposta("O problema está acontecendo agora?", resposta);
      estado.dados.acontecendoAgora = resposta;
      estado.passo = estado.dados.detalhesRespondido ? "foto" : "detalhes";
    } else if (passo === "foto") {
      if (resposta === "Continuar sem foto") {
        registrarResposta("Quer adicionar uma foto do problema?", "Continuar sem foto");
        limparInputFoto();
        estado.dados.fotoRespondida = true;
        estado.passo = "resumo";
      }
    }

    renderizarChatNovaOS();
  }

  function proximoAposAmbiente() {
    if (estado.modoEdicao === "local" || estado.modoEdicao === "ambiente") {
      estado.modoEdicao = "";
      return "resumo";
    }
    return "categoria";
  }

  function proximoAposProblema() {
    if (estado.modoEdicao === "problema") {
      estado.modoEdicao = "";
      return "resumo";
    }
    return devePerguntarRiscoImediato() ? "risco-imediato" : "risco-pessoas";
  }

  function enviarTextoChatNovaOS(passo) {
    if (passo !== estado.passo) return;

    const campo = document.getElementById("novaOSChatTextoAtual");
    const texto = campo ? String(campo.value || "").trim() : "";
    const permiteVazio = passo === "detalhes";

    if (!texto && !permiteVazio) {
      if (typeof appFeedback === "function") {
        appFeedback("Digite uma informação antes de continuar.", { tipo: "aviso" });
      }
      return;
    }

    registrarCheckpoint();

    if (passo === "outro-local") {
      registrarResposta("Qual é o local?", texto);
      estado.dados.localPrincipal = "Outro local";
      estado.dados.ambiente = texto;
      estado.passo = estado.modoEdicao === "local" ? "resumo" : "categoria";
      estado.modoEdicao = "";
    } else if (passo === "outro-ambiente") {
      registrarResposta("Qual é o ambiente?", texto);
      estado.dados.ambiente = texto;
      estado.passo = proximoAposAmbiente();
    } else if (passo === "outro-equipamento") {
      registrarResposta("Qual equipamento apresenta problema?", texto);
      estado.dados.equipamento = texto;
      estado.passo = "subcategoria";
    } else if (passo === "outro-problema") {
      registrarResposta("Descreva em poucas palavras qual é o problema.", texto);
      estado.dados.subcategoria = texto;
      estado.passo = proximoAposProblema();
    } else if (passo === "detalhes") {
      registrarResposta("Quer acrescentar algum detalhe?", texto || "Sem detalhes adicionais");
      estado.dados.detalhes = texto;
      estado.dados.detalhesRespondido = true;
      if (estado.modoEdicao === "detalhes") {
        estado.modoEdicao = "";
        estado.passo = "resumo";
      } else {
        estado.passo = "foto";
      }
    }

    renderizarChatNovaOS();
  }

  function devePerguntarRiscoImediato() {
    return obterOpcoesRiscoImediato().length > 0;
  }

  function obterOpcoesRiscoImediato() {
    const categoria = estado.dados.categoria;

    if (categoria === "Elétrica") {
      return ["Faísca", "Fumaça", "Cheiro de queimado", "Água próxima à instalação elétrica", "Nenhum desses"];
    }

    if (categoria === "Hidráulica") {
      return ["Vazamento intenso", "Água próxima à instalação elétrica", "Nenhum desses"];
    }

    if (categoria === "Equipamentos / Elevadores" && ELEVADORES_CONHECIDOS.includes(estado.dados.equipamento)) {
      return ["Pessoa presa", "Parado entre andares", "Porta travada com risco", "Nenhum desses"];
    }

    if (categoria === "Civil / Alvenaria") {
      return ["Parte solta com risco de queda", "Risco estrutural aparente", "Nenhum desses"];
    }

    return [];
  }

  function aplicarAvisoRiscoImediato(resposta) {
    const urgentes = [
      "Faísca",
      "Fumaça",
      "Cheiro de queimado",
      "Água próxima à instalação elétrica",
      "Pessoa presa",
      "Parte solta com risco de queda",
      "Risco estrutural aparente"
    ];

    if (urgentes.includes(resposta)) {
      adicionarMensagemSistema("Situação de risco identificada. Evite utilizar a área ou o equipamento até a avaliação da manutenção.", "alerta");
    }
  }

  function calcularPrioridadeChatNovaOS() {
    const d = estado.dados;
    const risco = d.riscoImediato;
    const riscoUrgente = [
      "Faísca",
      "Fumaça",
      "Cheiro de queimado",
      "Água próxima à instalação elétrica",
      "Pessoa presa",
      "Parte solta com risco de queda",
      "Risco estrutural aparente"
    ].includes(risco);

    if (d.riscoPessoas === "Sim" || riscoUrgente) return "Urgente";

    if (
      d.riscoPatrimonio === "Sim" ||
      d.ambienteSemUso === "Sim" ||
      (risco && risco !== "Nenhum desses")
    ) {
      return "Alta";
    }

    if (d.acontecendoAgora === "Sim") return "Média";

    if (d.categoria === "Pintura") return "Baixa";

    return "Média";
  }

  function obterRotuloPrioridade(prioridade = calcularPrioridadeChatNovaOS()) {
    return prioridade === "Média" ? "Normal" : prioridade;
  }

  function obterClassePrioridade(prioridade = calcularPrioridadeChatNovaOS()) {
    const mapa = {
      Urgente: "prioridade-urgente",
      Alta: "prioridade-alta",
      Média: "prioridade-normal",
      Baixa: "prioridade-baixa"
    };
    return mapa[prioridade] || "prioridade-normal";
  }

  function montarImpactoResumo() {
    const d = estado.dados;
    const itens = [];

    if (d.riscoImediato && d.riscoImediato !== "Nenhum desses") itens.push(d.riscoImediato);
    if (d.riscoPessoas === "Sim") itens.push("Risco para pessoas");
    if (d.riscoPatrimonio === "Sim") itens.push("Risco ao prédio/equipamentos");
    if (d.ambienteSemUso === "Sim") itens.push("Ambiente sem condições de uso");
    if (d.acontecendoAgora === "Sim") itens.push("Ocorrência ativa");

    return itens.length ? itens.join(" • ") : "Sem impacto crítico informado";
  }

  function montarDescricaoChatNovaOS() {
    const d = estado.dados;
    const partes = [];
    const equipamento = d.equipamento ? ` | Equipamento: ${d.equipamento}` : "";

    partes.push(`${d.categoria} — ${d.subcategoria}${equipamento}.`);
    partes.push(`Impacto informado: ${montarImpactoResumo()}.`);

    if (d.detalhes) {
      partes.push(`Detalhes do solicitante: ${d.detalhes}`);
    }

    return partes.join("\n");
  }

  function sincronizarCamposLegadosChatNovaOS() {
    const d = estado.dados;
    definirValorSelectOculto("andarChamado", d.localPrincipal);
    definirValorSelectOculto("localChamado", d.ambiente);
    definirValorSelectOculto("categoriaChamado", d.categoria);
    definirValorSelectOculto("subcategoriaChamado", d.subcategoria);
    definirValorSelectOculto("tipoManutencaoChamado", "Corretiva");
    definirValorSelectOculto("prioridadeChamado", calcularPrioridadeChatNovaOS());
    definirValorCampoOculto("descricaoChamado", montarDescricaoChatNovaOS());
    definirValorCampoOculto("equipamentoNomeChamado", d.equipamento || "");
  }

  function definirValorSelectOculto(id, valor) {
    const campo = document.getElementById(id);
    if (!campo) return;

    campo.innerHTML = "";
    const option = document.createElement("option");
    option.value = valor || "";
    option.textContent = valor || "";
    option.selected = true;
    campo.appendChild(option);
    campo.value = valor || "";
  }

  function definirValorCampoOculto(id, valor) {
    const campo = document.getElementById(id);
    if (campo) campo.value = valor || "";
  }

  function validarResumoAntesEnvio() {
    const d = estado.dados;
    const faltantes = [];

    if (!d.localPrincipal) faltantes.push("local");
    if (!d.ambiente) faltantes.push("ambiente");
    if (!d.categoria) faltantes.push("categoria");
    if (!d.subcategoria) faltantes.push("problema");
    if (!d.riscoPessoas || !d.riscoPatrimonio || !d.ambienteSemUso || !d.acontecendoAgora) faltantes.push("impacto");

    return faltantes;
  }

  async function confirmarEnvioChatNovaOS() {
    if (envioEmAndamento) return;

    const faltantes = validarResumoAntesEnvio();

    if (faltantes.length) {
      if (typeof appFeedback === "function") {
        await appFeedback(`Ainda faltam informações: ${faltantes.join(", ")}.`, { tipo: "aviso", titulo: "Chamado incompleto" });
      }
      return;
    }

    sincronizarCamposLegadosChatNovaOS();

    if (typeof criarChamado === "function") {
      envioEmAndamento = true;
      renderizarChatNovaOS();
      try {
        const sucesso = await criarChamado();
        if (!sucesso && !resultadoEnvio) {
          envioEmAndamento = false;
          renderizarChatNovaOS();
        }
      } catch (erro) {
        console.error("Erro ao enviar chamado pelo assistente:", erro);
        envioEmAndamento = false;
        renderizarChatNovaOS();
        if (typeof appFeedback === "function") {
          await appFeedback("Não foi possível enviar o chamado. Verifique sua conexão e tente novamente.", { tipo: "erro", titulo: "Falha ao abrir OS" });
        }
      }
    }
  }

  function finalizarEnvioChatNovaOS(chamadoId, chamado) {
    envioEmAndamento = false;
    resultadoEnvio = {
      id: chamadoId,
      numeroOS: chamado.numeroOS,
      andar: chamado.andar,
      local: chamado.local,
      categoria: chamado.categoria,
      subcategoria: chamado.subcategoria,
      prioridade: chamado.prioridade
    };

    limparPreviewsFotos();
    limparInputFoto();
    estado = criarEstadoInicial();
    renderizarChatNovaOS();
  }

  function acompanharChamadoChatNovaOS() {
    resultadoEnvio = null;
    estado = criarEstadoInicial();
    if (typeof openPage === "function") openPage("chamados");
  }

  function voltarInicioChatNovaOS() {
    resultadoEnvio = null;
    estado = criarEstadoInicial();
    if (typeof openPage === "function") openPage("inicio");
  }

  function abrirEdicaoResumoChatNovaOS() {
    estado.passo = "edicao";
    renderizarChatNovaOS();
  }

  function editarResumoChatNovaOS(campo) {
    const alvo = String(campo || "");
    registrarCheckpoint();
    estado.modoEdicao = alvo;

    if (alvo === "local") {
      estado.dados.localPrincipal = "";
      estado.dados.ambiente = "";
      estado.passo = "local";
    } else if (alvo === "ambiente") {
      estado.dados.ambiente = "";
      estado.passo = estado.dados.localPrincipal === "Outro local" ? "outro-local" : "ambiente";
    } else if (alvo === "problema") {
      estado.dados.categoria = "";
      estado.dados.subcategoria = "";
      estado.dados.equipamento = "";
      estado.dados.riscoImediato = "";
      estado.passo = "categoria";
    } else if (alvo === "impacto") {
      estado.dados.riscoImediato = "";
      estado.dados.riscoPessoas = "";
      estado.dados.riscoPatrimonio = "";
      estado.dados.ambienteSemUso = "";
      estado.dados.acontecendoAgora = "";
      estado.passo = devePerguntarRiscoImediato() ? "risco-imediato" : "risco-pessoas";
    } else if (alvo === "detalhes") {
      estado.dados.detalhesRespondido = false;
      estado.passo = "detalhes";
    } else if (alvo === "foto") {
      estado.passo = "foto";
    } else {
      estado.modoEdicao = "";
      estado.passo = "resumo";
    }

    adicionarMensagemSistema(`Vamos ajustar ${rotuloCampoEdicao(alvo)}.`, "edicao");
    renderizarChatNovaOS();
  }

  function rotuloCampoEdicao(campo) {
    const mapa = {
      local: "o local",
      ambiente: "o ambiente",
      problema: "o tipo de problema",
      impacto: "o impacto e a prioridade",
      detalhes: "os detalhes",
      foto: "a foto"
    };
    return mapa[campo] || "essa informação";
  }

  function acionarFotoChatNovaOS(modo) {
    const input = document.getElementById("fotoChamado");
    if (!input) return;

    if (modo === "camera") {
      input.setAttribute("capture", "environment");
      input.removeAttribute("multiple");
    } else {
      input.removeAttribute("capture");
      input.setAttribute("multiple", "multiple");
    }

    input.click();
  }

  async function processarFotosChatNovaOS(elemento) {
    const input = elemento || document.getElementById("fotoChamado");
    if (!input || !input.files || !input.files.length) return;

    const limite = typeof LIMITE_FOTOS_CHAMADO !== "undefined" ? LIMITE_FOTOS_CHAMADO : 3;

    if (input.files.length > limite) {
      input.value = "";
      if (typeof appFeedback === "function") {
        await appFeedback(`Selecione no máximo ${limite} imagens.`, { tipo: "aviso", titulo: "Limite de imagens" });
      }
      renderizarChatNovaOS();
      return;
    }

    registrarCheckpoint();
    registrarResposta("Quer adicionar uma foto do problema?", `${input.files.length} foto(s) selecionada(s)`);
    estado.dados.fotoRespondida = true;
    estado.passo = "resumo";
    estado.modoEdicao = "";
    renderizarChatNovaOS();
  }

  function continuarSemFotoChatNovaOS() {
    responderChatNovaOS("foto", "Continuar sem foto");
  }

  function limparInputFoto() {
    const input = document.getElementById("fotoChamado");
    if (input) {
      input.value = "";
      input.removeAttribute("capture");
      input.setAttribute("multiple", "multiple");
    }
    limparPreviewsFotos();
  }

  function limparPreviewsFotos() {
    urlsPreview.forEach(url => URL.revokeObjectURL(url));
    urlsPreview = [];
  }

  function obterArquivosFoto() {
    const input = document.getElementById("fotoChamado");
    return input && input.files ? Array.from(input.files) : [];
  }

  function renderizarChatNovaOS() {
    const mensagens = document.getElementById("novaOSChatMensagens");
    const interacao = document.getElementById("novaOSChatInteracao");
    const progresso = document.getElementById("novaOSChatProgresso");
    const voltar = document.getElementById("novaOSChatVoltar");

    if (!mensagens || !interacao) return;

    if (resultadoEnvio) {
      mensagens.innerHTML = renderizarMensagensHistorico();
      interacao.innerHTML = renderizarSucesso();
      if (progresso) progresso.textContent = "Concluído";
      if (voltar) voltar.hidden = true;
      rolarChatParaFinal();
      return;
    }

    mensagens.innerHTML = renderizarMensagensHistorico();
    interacao.innerHTML = renderizarInteracaoAtual();

    if (progresso) {
      const etapa = obterEtapaVisual();
      progresso.textContent = `Etapa ${etapa} de 7`;
    }

    if (voltar) {
      voltar.hidden = estado.pilha.length === 0 || estado.passo === "resumo" || estado.passo === "edicao";
    }

    rolarChatParaFinal();
    focarCampoTextoAtual();
  }

  function renderizarMensagensHistorico() {
    return estado.historico.map(item => {
      if (item.papel === "usuario") {
        return `<div class="nova-os-message-row nova-os-message-row-user"><div class="nova-os-message nova-os-message-user">${escapeHTML(item.texto)}</div></div>`;
      }

      const classeTipo = item.tipo === "alerta"
        ? " nova-os-message-alert"
        : item.tipo === "edicao"
          ? " nova-os-message-edit"
          : "";

      return `<div class="nova-os-message-row nova-os-message-row-assistant"><div class="nova-os-avatar-assistant" aria-hidden="true">M</div><div class="nova-os-message nova-os-message-assistant${classeTipo}">${escapeHTML(item.texto)}</div></div>`;
    }).join("");
  }

  function renderizarInteracaoAtual() {
    switch (estado.passo) {
      case "local":
        return renderizarPerguntaOpcoes("Onde está o problema?", ["Estacionamento", "Térreo", "1º andar", "2º andar", "Área externa", "Outro local"], "local");
      case "outro-local":
        return renderizarPerguntaTexto("Qual é o local?", "Ex.: Anexo, área técnica...", "outro-local", 90);
      case "ambiente":
        return renderizarPerguntaOpcoes("Em qual ambiente?", obterAmbientesLocalAtual(), "ambiente", { grande: true });
      case "outro-ambiente":
        return renderizarPerguntaTexto("Qual é o ambiente?", "Digite o nome do ambiente", "outro-ambiente", 100);
      case "categoria":
        return renderizarPerguntaOpcoes("Que tipo de problema você identificou?", Object.keys(CATEGORIAS_CHAT_NOVA_OS), "categoria");
      case "equipamento":
        return renderizarPerguntaOpcoes("Qual equipamento apresenta problema?", EQUIPAMENTOS_CHAT, "equipamento");
      case "outro-equipamento":
        return renderizarPerguntaTexto("Qual equipamento apresenta problema?", "Digite o nome do equipamento", "outro-equipamento", 100);
      case "subcategoria":
        return renderizarPerguntaOpcoes("Qual é o problema?", CATEGORIAS_CHAT_NOVA_OS[estado.dados.categoria] || [], "subcategoria", { grande: true });
      case "outro-problema":
        return renderizarPerguntaTexto("Descreva em poucas palavras qual é o problema.", "Ex.: porta raspando no piso", "outro-problema", 140);
      case "risco-imediato":
        return renderizarPerguntaOpcoes("Existe algum sinal de risco imediato?", obterOpcoesRiscoImediato(), "risco-imediato");
      case "risco-pessoas":
        return renderizarPerguntaOpcoes("O problema oferece risco para pessoas?", ["Sim", "Não"], "risco-pessoas");
      case "risco-patrimonio":
        return renderizarPerguntaOpcoes("Há risco de dano ao prédio ou a equipamentos?", ["Sim", "Não"], "risco-patrimonio");
      case "ambiente-uso":
        return renderizarPerguntaOpcoes("O ambiente ficou sem condições de uso?", ["Sim", "Não"], "ambiente-uso");
      case "acontecendo-agora":
        return renderizarPerguntaOpcoes("O problema está acontecendo agora?", ["Sim", "Não"], "acontecendo-agora");
      case "detalhes":
        return renderizarPerguntaDetalhes();
      case "foto":
        return renderizarPerguntaFoto();
      case "edicao":
        return renderizarMenuEdicao();
      case "resumo":
        return renderizarResumo();
      default:
        return "";
    }
  }

  function renderizarPerguntaOpcoes(pergunta, opcoes, passo, config = {}) {
    const classe = config.grande ? " nova-os-options-grid-large" : "";
    const botoes = opcoes.map(opcao => `
      <button type="button" class="nova-os-choice" data-dynamic-action="responderChatNovaOS" data-param0="${attrHTML(passo)}" data-param1="${attrHTML(opcao)}">
        <span>${escapeHTML(opcao)}</span>
        <span class="nova-os-choice-arrow" aria-hidden="true">›</span>
      </button>
    `).join("");

    return `
      ${renderizarPerguntaAtual(pergunta)}
      <div class="nova-os-options-grid${classe}">${botoes}</div>
    `;
  }

  function renderizarPerguntaTexto(pergunta, placeholder, passo, maxLength) {
    return `
      ${renderizarPerguntaAtual(pergunta)}
      <div class="nova-os-text-response">
        <input id="novaOSChatTextoAtual" type="text" maxlength="${Number(maxLength) || 140}" placeholder="${attrHTML(placeholder)}" autocomplete="off" />
        <button type="button" class="nova-os-send-inline" data-dynamic-action="enviarTextoChatNovaOS" data-param0="${attrHTML(passo)}">Continuar</button>
      </div>
    `;
  }

  function renderizarPerguntaDetalhes() {
    const valor = estado.dados.detalhes || "";
    return `
      ${renderizarPerguntaAtual("Quer acrescentar algum detalhe?")}
      <p class="nova-os-question-help">É opcional. Não precisa repetir local, ambiente ou tipo de problema.</p>
      <div class="nova-os-text-response nova-os-text-response-stack">
        <textarea id="novaOSChatTextoAtual" maxlength="500" placeholder="Ex.: começou hoje pela manhã e está piorando...">${escapeHTML(valor)}</textarea>
        <button type="button" class="nova-os-send-inline" data-dynamic-action="enviarTextoChatNovaOS" data-param0="detalhes">${valor ? "Salvar detalhe" : "Continuar"}</button>
      </div>
    `;
  }

  function renderizarPerguntaFoto() {
    const arquivos = obterArquivosFoto();
    const info = arquivos.length
      ? `<div class="nova-os-photo-info">${arquivos.length} foto(s) selecionada(s)</div>`
      : `<p class="nova-os-question-help">A foto é opcional. Você pode tirar uma foto agora ou escolher da galeria.</p>`;

    return `
      ${renderizarPerguntaAtual("Quer adicionar uma foto do problema?")}
      ${info}
      <div class="nova-os-photo-actions">
        <button type="button" class="nova-os-photo-button" data-dynamic-action="acionarFotoChatNovaOS" data-param0="camera">
          <span aria-hidden="true">📷</span><span>Tirar foto</span>
        </button>
        <button type="button" class="nova-os-photo-button" data-dynamic-action="acionarFotoChatNovaOS" data-param0="galeria">
          <span aria-hidden="true">▣</span><span>Escolher da galeria</span>
        </button>
        <button type="button" class="nova-os-photo-skip" data-dynamic-action="continuarSemFotoChatNovaOS">Continuar sem foto</button>
      </div>
    `;
  }

  function renderizarPerguntaAtual(texto) {
    return `
      <div class="nova-os-message-row nova-os-message-row-assistant nova-os-current-question">
        <div class="nova-os-avatar-assistant" aria-hidden="true">M</div>
        <div class="nova-os-message nova-os-message-assistant">${escapeHTML(texto)}</div>
      </div>
    `;
  }

  function renderizarResumo() {
    const d = estado.dados;
    const prioridade = calcularPrioridadeChatNovaOS();
    const arquivos = obterArquivosFoto();
    const fotos = renderizarMiniaturasResumo(arquivos);

    return `
      ${renderizarPerguntaAtual("Confira as informações antes de enviar.")}
      <div class="nova-os-summary-card">
        <div class="nova-os-summary-header">
          <div>
            <span class="nova-os-summary-eyebrow">Novo chamado</span>
            <h2>${escapeHTML(d.categoria)} · ${escapeHTML(d.subcategoria)}</h2>
          </div>
          <span class="nova-os-priority ${obterClassePrioridade(prioridade)}">${escapeHTML(obterRotuloPrioridade(prioridade))}</span>
        </div>

        <dl class="nova-os-summary-list">
          ${linhaResumo("Local", d.localPrincipal)}
          ${linhaResumo("Ambiente", d.ambiente)}
          ${d.equipamento ? linhaResumo("Equipamento", d.equipamento) : ""}
          ${linhaResumo("Categoria", d.categoria)}
          ${linhaResumo("Problema", d.subcategoria)}
          ${linhaResumo("Impacto", montarImpactoResumo())}
          ${linhaResumo("Detalhes", d.detalhes || "Sem detalhes adicionais")}
        </dl>

        ${fotos}

        <p class="nova-os-summary-notice">Confira as informações. Após enviar, o chamado será encaminhado para a manutenção.</p>

        <div class="nova-os-summary-actions">
          <button type="button" class="nova-os-button-secondary" data-dynamic-action="abrirEdicaoResumoChatNovaOS">Editar</button>
          <button type="button" class="nova-os-button-primary" data-dynamic-action="confirmarEnvioChatNovaOS"${envioEmAndamento ? " disabled" : ""}>${envioEmAndamento ? "Enviando..." : "Enviar chamado"}</button>
        </div>
      </div>
    `;
  }

  function linhaResumo(rotulo, valor) {
    return `<div><dt>${escapeHTML(rotulo)}</dt><dd>${escapeHTML(valor || "Não informado")}</dd></div>`;
  }

  function renderizarMiniaturasResumo(arquivos) {
    limparPreviewsFotos();
    if (!arquivos.length) return `<div class="nova-os-summary-photo-empty">Sem foto anexada</div>`;

    urlsPreview = arquivos.slice(0, 3).map(arquivo => URL.createObjectURL(arquivo));
    const itens = urlsPreview.map((url, indice) => `<img src="${attrHTML(url)}" alt="Foto ${indice + 1} anexada ao chamado" />`).join("");
    return `<div class="nova-os-summary-photos">${itens}</div>`;
  }

  function renderizarMenuEdicao() {
    const opcoes = [
      ["local", "Local"],
      ["ambiente", "Ambiente"],
      ["problema", "Tipo de problema"],
      ["impacto", "Impacto e prioridade"],
      ["detalhes", "Detalhes"],
      ["foto", "Foto"]
    ];

    return `
      ${renderizarPerguntaAtual("O que você quer corrigir?")}
      <div class="nova-os-edit-grid">
        ${opcoes.map(([valor, rotulo]) => `<button type="button" data-dynamic-action="editarResumoChatNovaOS" data-param0="${attrHTML(valor)}">${escapeHTML(rotulo)}</button>`).join("")}
        <button type="button" class="nova-os-edit-cancel" data-dynamic-action="editarResumoChatNovaOS" data-param0="cancelar">Voltar ao resumo</button>
      </div>
    `;
  }

  function renderizarSucesso() {
    const r = resultadoEnvio;
    if (!r) return "";

    return `
      <div class="nova-os-success-card">
        <div class="nova-os-success-icon" aria-hidden="true">✓</div>
        <span class="nova-os-summary-eyebrow">Chamado criado com sucesso</span>
        <h2>${escapeHTML(r.numeroOS)}</h2>
        <p>${escapeHTML(r.andar)} • ${escapeHTML(r.local)}</p>
        <p>${escapeHTML(r.categoria)} • ${escapeHTML(r.subcategoria)}</p>
        <span class="nova-os-priority ${obterClassePrioridade(r.prioridade)}">Prioridade: ${escapeHTML(obterRotuloPrioridade(r.prioridade))}</span>
        <div class="nova-os-success-actions">
          <button type="button" class="nova-os-button-primary" data-dynamic-action="acompanharChamadoChatNovaOS">Acompanhar chamado</button>
          <button type="button" class="nova-os-button-secondary" data-dynamic-action="voltarInicioChatNovaOS">Voltar ao início</button>
        </div>
      </div>
    `;
  }

  function obterAmbientesLocalAtual() {
    const lista = typeof LOCAIS_POR_ANDAR_MANUTENCAO !== "undefined"
      ? (LOCAIS_POR_ANDAR_MANUTENCAO[estado.dados.localPrincipal] || [])
      : [];

    const outros = estado.dados.localPrincipal === "Área externa" ? "Outro ambiente externo" : "Outro ambiente";
    return [...new Set([...lista, outros])];
  }

  function obterEtapaVisual() {
    const mapa = {
      local: 1,
      "outro-local": 1,
      ambiente: 2,
      "outro-ambiente": 2,
      categoria: 3,
      equipamento: 3,
      "outro-equipamento": 3,
      subcategoria: 3,
      "outro-problema": 3,
      "risco-imediato": 4,
      "risco-pessoas": 4,
      "risco-patrimonio": 4,
      "ambiente-uso": 4,
      "acontecendo-agora": 4,
      detalhes: 5,
      foto: 6,
      resumo: 7,
      edicao: 7
    };
    return mapa[estado.passo] || 1;
  }

  function rolarChatParaFinal() {
    window.requestAnimationFrame(() => {
      const shell = document.getElementById("novaOSChatMensagens");
      const pagina = document.getElementById("novo");
      if (shell && shell.lastElementChild) {
        shell.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (pagina) {
        pagina.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function focarCampoTextoAtual() {
    window.setTimeout(() => {
      const campo = document.getElementById("novaOSChatTextoAtual");
      if (campo) campo.focus({ preventScroll: true });
    }, 60);
  }

  function tratarEnterChatNovaOS(evento) {
    if (evento.key !== "Enter" || evento.shiftKey) return;
    const campo = evento.target;
    if (!campo || campo.id !== "novaOSChatTextoAtual") return;
    if (campo.tagName === "TEXTAREA") return;
    evento.preventDefault();
    enviarTextoChatNovaOS(estado.passo);
  }

  function preencherChatNovaOSComDiagnostico(item) {
    if (!item) return;

    resultadoEnvio = null;
    estado = criarEstadoInicial();
    inicializado = true;
    estado.diagnosticoOrigem = item.id || "";

    const localSeparado = separarLocalLegadoParaChat(item.local || "");
    if (localSeparado.localPrincipal) {
      estado.dados.localPrincipal = localSeparado.localPrincipal;
      estado.dados.ambiente = localSeparado.ambiente;
    }

    if (typeof montarDescricaoOSDiagnostico === "function") {
      estado.dados.detalhes = montarDescricaoOSDiagnostico(item);
      estado.dados.detalhesRespondido = true;
    }

    adicionarMensagemSistema("Trouxe o local e os detalhes registrados no diagnóstico. Confirme o tipo de problema para continuar.", "edicao");
    if (estado.dados.localPrincipal && estado.dados.ambiente) {
      registrarResposta("Local recuperado do diagnóstico", `${estado.dados.localPrincipal} • ${estado.dados.ambiente}`);
      estado.passo = "categoria";
    } else {
      estado.passo = "local";
    }

    renderizarChatNovaOS();
  }

  function separarLocalLegadoParaChat(localCompleto) {
    const partes = String(localCompleto || "").split(" / ");
    const andarAntigo = String(partes[0] || "").trim();
    let ambiente = String(partes.slice(1).join(" / ") || "").trim();

    const mapaAndares = {
      "-1º ANDAR": "Estacionamento",
      "-1 ANDAR": "Estacionamento",
      "0º ANDAR": "Térreo",
      "0 ANDAR": "Térreo",
      "SL ANDAR": "1º andar",
      "1º ANDAR": "2º andar",
      "1 ANDAR": "2º andar",
      "Telhado": "Área externa"
    };

    let localPrincipal = mapaAndares[andarAntigo] || andarAntigo;
    if (andarAntigo === "Telhado") ambiente = "Telhado";

    ambiente = normalizarNomeAmbienteLegado(localPrincipal, ambiente);
    return { localPrincipal, ambiente };
  }

  function normalizarNomeAmbienteLegado(localPrincipal, ambiente) {
    const lista = typeof LOCAIS_POR_ANDAR_MANUTENCAO !== "undefined"
      ? (LOCAIS_POR_ANDAR_MANUTENCAO[localPrincipal] || [])
      : [];
    const texto = String(ambiente || "").trim().toLocaleLowerCase("pt-BR");
    const encontrado = lista.find(item => String(item).trim().toLocaleLowerCase("pt-BR") === texto);
    return encontrado || ambiente;
  }

  function escapeHTML(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function attrHTML(valor) {
    return escapeHTML(valor).replace(/`/g, "&#096;");
  }

  document.addEventListener("keydown", tratarEnterChatNovaOS);

  window.novaOSChatAtivo = novaOSChatAtivo;
  window.inicializarChatNovaOS = inicializarChatNovaOS;
  window.reiniciarChatNovaOS = reiniciarChatNovaOS;
  window.voltarChatNovaOS = voltarChatNovaOS;
  window.responderChatNovaOS = responderChatNovaOS;
  window.enviarTextoChatNovaOS = enviarTextoChatNovaOS;
  window.acionarFotoChatNovaOS = acionarFotoChatNovaOS;
  window.processarFotosChatNovaOS = processarFotosChatNovaOS;
  window.continuarSemFotoChatNovaOS = continuarSemFotoChatNovaOS;
  window.abrirEdicaoResumoChatNovaOS = abrirEdicaoResumoChatNovaOS;
  window.editarResumoChatNovaOS = editarResumoChatNovaOS;
  window.confirmarEnvioChatNovaOS = confirmarEnvioChatNovaOS;
  window.finalizarEnvioChatNovaOS = finalizarEnvioChatNovaOS;
  window.acompanharChamadoChatNovaOS = acompanharChamadoChatNovaOS;
  window.voltarInicioChatNovaOS = voltarInicioChatNovaOS;
  window.preencherChatNovaOSComDiagnostico = preencherChatNovaOSComDiagnostico;
  window.sincronizarCamposLegadosChatNovaOS = sincronizarCamposLegadosChatNovaOS;
  window.calcularPrioridadeChatNovaOS = calcularPrioridadeChatNovaOS;
})();

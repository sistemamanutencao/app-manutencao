/* =====================================================
   LEITOR DE QR CODE OPERACIONAL
===================================================== */

let fluxoLeituraQR = {
  stream: null,
  intervalo: null,
  detector: null,
  canvas: null,
  contexto: null
};

function abrirLeitorQRCode() {
  openPage("leitor-qr");
  renderizarResultadoLeitorQR(null);
}

async function iniciarLeituraQRCode() {
  const video = document.getElementById("videoLeitorQR");
  const status = document.getElementById("statusLeitorQR");

  if (!video || !status) {
    alert("Área do leitor de QR Code não encontrada.\nAtualize a página e tente novamente.");
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    status.textContent = "Câmera não disponível neste navegador. Digite o código manualmente abaixo.";
    return;
  }

  if (!("BarcodeDetector" in window)) {
    status.textContent = "Leitura automática não disponível neste navegador. Digite o código do QR manualmente abaixo.";
    return;
  }

  pararLeituraQRCode();

  try {
    fluxoLeituraQR.detector = new BarcodeDetector({ formats: ["qr_code"] });
    fluxoLeituraQR.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      },
      audio: false
    });

    video.srcObject = fluxoLeituraQR.stream;
    await video.play();

    status.textContent = "Aponte a câmera para o QR Code do ambiente, equipamento ou patrimônio.";

    fluxoLeituraQR.intervalo = window.setInterval(async () => {
      await tentarDetectarQRCode(video);
    }, 700);
  } catch (erro) {
    console.error("Erro ao iniciar leitor de QR Code:", erro);
    status.textContent = "Não foi possível acessar a câmera. Verifique a permissão do navegador ou digite o código manualmente.";
  }
}

async function tentarDetectarQRCode(video) {
  if (!fluxoLeituraQR.detector || !video || video.readyState < 2) {
    return;
  }

  try {
    const codigos = await fluxoLeituraQR.detector.detect(video);

    if (!codigos || codigos.length === 0) {
      return;
    }

    const valor = codigos[0].rawValue || "";

    if (valor) {
      pararLeituraQRCode();
      processarValorQRCode(valor);
    }
  } catch (erro) {
    console.warn("Falha temporária na leitura do QR Code:", erro);
  }
}

function pararLeituraQRCode() {
  if (fluxoLeituraQR.intervalo) {
    window.clearInterval(fluxoLeituraQR.intervalo);
    fluxoLeituraQR.intervalo = null;
  }

  if (fluxoLeituraQR.stream) {
    fluxoLeituraQR.stream.getTracks().forEach(track => track.stop());
    fluxoLeituraQR.stream = null;
  }

  const video = document.getElementById("videoLeitorQR");

  if (video) {
    video.pause();
    video.srcObject = null;
  }
}

function processarQRCodeManual() {
  const input = document.getElementById("codigoQRManual");

  if (!input || !input.value.trim()) {
    alert("Digite ou cole o código do QR Code para continuar.");
    return;
  }

  processarValorQRCode(input.value.trim());
}

function processarValorQRCode(valor) {
  const codigo = extrairCodigoDoQRCode(valor);

  if (!codigo) {
    alert("Não foi possível identificar o código do QR.\nConfira o conteúdo lido ou digite o código manualmente.");
    return;
  }

  const input = document.getElementById("codigoQRManual");

  if (input) {
    input.value = codigo;
  }

  renderizarResultadoLeitorQR(codigo);
}

function extrairCodigoDoQRCode(valor) {
  const texto = String(valor || "").trim();

  if (!texto) {
    return "";
  }

  try {
    const url = new URL(texto);
    const parametros = url.searchParams;
    const codigo = parametros.get("qr") || parametros.get("equipamento") || parametros.get("eq") || parametros.get("patrimonio");

    if (codigo) {
      return normalizarCodigoAtivo(codigo);
    }
  } catch (erro) {
    // Valor não é URL completa. Segue tratando como código simples.
  }

  return normalizarCodigoAtivo(texto);
}

function renderizarResultadoLeitorQR(codigo) {
  const container = document.getElementById("resultadoLeitorQR");

  if (!container) {
    return;
  }

  if (!codigo) {
    container.innerHTML = criarMensagemVazia(
      "Nenhum QR Code lido",
      "Use a câmera ou digite o código para consultar o ativo, ambiente ou patrimônio."
    );
    return;
  }

  const ativo = encontrarAtivoPorCodigo(codigo);
  const historico = chamados.filter(chamado => {
    return normalizarCodigoAtivo(chamado.equipamentoCodigo) === normalizarCodigoAtivo(codigo);
  });

  if (!ativo) {
    container.innerHTML = `
      <div class="asset-card">
        <h3>QR identificado: ${escaparHTML(codigo)}</h3>
        <p>Este código ainda não está cadastrado em Ativos e QR Code.</p>
        <p>Você ainda pode abrir uma OS vinculada a este código. A manutenção poderá cadastrar o ativo depois.</p>
        <button type="button" class="primary-button" data-dynamic-action="prepararOSDoAtivo" data-param0="${formatarAtributoHTML(codigo)}">
          Abrir OS com este QR
        </button>
        ${usuarioEhManutencaoAutorizada() ? `
          <button type="button" class="secondary-button" data-dynamic-action="prepararCadastroAtivoPorQR" data-param0="${formatarAtributoHTML(codigo)}">
            Cadastrar ativo/local
          </button>
        ` : ""}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="asset-card">
      <h3>${escaparHTML(ativo.codigo)} • ${escaparHTML(ativo.nome)}</h3>
      <p><strong>Localização:</strong> ${escaparHTML(ativo.localizacao)}</p>
      <p><strong>Categoria:</strong> ${escaparHTML(ativo.categoria)}</p>
      <p><strong>Histórico:</strong> ${historico.length} OS vinculada(s)</p>
      <div class="qr-actions">
        <button type="button" class="primary-button" data-dynamic-action="prepararOSDoAtivo" data-param0="${formatarAtributoHTML(ativo.codigo)}">
          Abrir nova OS deste local
        </button>
        <button type="button" class="secondary-button" data-dynamic-action="mostrarHistoricoAtivoNoLeitor" data-param0="${formatarAtributoHTML(ativo.codigo)}">
          Ver histórico
        </button>
      </div>
    </div>
    <div id="historicoLeitorQR" class="qr-history"></div>
  `;
}

function mostrarHistoricoAtivoNoLeitor(codigo) {
  const container = document.getElementById("historicoLeitorQR");

  if (!container) {
    return;
  }

  const historico = chamados
    .filter(chamado => normalizarCodigoAtivo(chamado.equipamentoCodigo) === normalizarCodigoAtivo(codigo))
    .slice(0, 8);

  if (historico.length === 0) {
    container.innerHTML = criarMensagemVazia("Sem histórico", "Ainda não existe OS vinculada a este QR Code.");
    return;
  }

  if (typeof criarHTMLHistoricoAtivo === "function") {
    container.innerHTML = criarHTMLHistoricoAtivo(historico, codigo);
    return;
  }

  container.innerHTML = historico.map(chamado => `
    <div class="ticket-row" data-dynamic-action="abrirDetalhesChamado" data-param0="${formatarAtributoHTML(chamado.id)}">
      <div>
        <strong>${escaparHTML(chamado.numeroOS || chamado.id)}</strong>
        <span>${escaparHTML(chamado.local || "Local não informado")}</span>
        <small>${escaparHTML(chamado.descricao || "Sem descrição")}</small>
      </div>
      <span class="${obterClasseStatus(chamado.status)}">${escaparHTML(chamado.status || "Aberto")}</span>
    </div>
  `).join("");
}

function prepararCadastroAtivoPorQR(codigo) {
  openPage("ativos");

  const codigoInput = document.getElementById("codigoAtivo");
  const nomeInput = document.getElementById("nomeAtivo");

  if (codigoInput) {
    codigoInput.value = normalizarCodigoAtivo(codigo);
  }

  if (nomeInput && !nomeInput.value) {
    nomeInput.focus();
  }
}

window.addEventListener("beforeunload", pararLeituraQRCode);

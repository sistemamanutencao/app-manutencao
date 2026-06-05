/* =====================================================
   UTILS - FUNÇÕES UTILITÁRIAS GERAIS

   Responsabilidades:
   - manipular texto/HTML com segurança;
   - formatar datas e parâmetros;
   - oferecer funções pequenas reutilizadas por vários módulos.

   Atenção:
   - manter funções genéricas; regras de negócio devem ficar nos módulos próprios.
===================================================== */

function setTextContent(id, valor) {
  const elemento = document.getElementById(id);

  if (!elemento) {
    return;
  }

  elemento.textContent = valor;
}

function escaparHTML(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatarAtributoHTML(valor) {
  return escaparHTML(String(valor ?? ""));
}

function formatarParametroJS(valor) {
  const textoSeguro = String(valor)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");

  return `'${textoSeguro}'`
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function criarMensagemVazia(titulo, texto) {
  return `
    <div class="empty-card">
      <h3>${escaparHTML(titulo)}</h3>
      <p>${escaparHTML(texto)}</p>
    </div>
  `;
}

function abrirModalPorId(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.add("active");
  }
}

function fecharModalPorId(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.remove("active");
  }
}

function formatarDataHoraBR(data) {
  const dataValida = data instanceof Date ? data : new Date(data);

  if (Number.isNaN(dataValida.getTime())) {
    return "";
  }

  return dataValida.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function normalizarPrioridadeSLA(prioridade) {
  return String(prioridade || "Baixa")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obterPrazoHoras(prioridade) {
  const prioridadeNormalizada = normalizarPrioridadeSLA(prioridade);
  const prazos = {
    urgente: 0,
    critica: 0,
    alta: 1,
    media: 24,
    baixa: 72
  };

  return prazos[prioridadeNormalizada] ?? 72;
}

function obterDataBaseSLA(chamado) {
  if (!chamado) {
    return new Date();
  }

  return obterDataValida(
    chamado.criadoEmISO || chamado.criadoEm,
    chamado.data
  );
}

function calcularVencimentoChamado(chamado) {
  const vencimentoPersistido = chamado && chamado.vencimentoSLAISO
    ? new Date(chamado.vencimentoSLAISO)
    : null;

  if (vencimentoPersistido && !Number.isNaN(vencimentoPersistido.getTime())) {
    return vencimentoPersistido;
  }

  const criadoEm = obterDataBaseSLA(chamado);
  const prazoHoras = obterPrazoHoras(chamado && chamado.prioridade);

  return new Date(criadoEm.getTime() + prazoHoras * 60 * 60 * 1000);
}

function calcularStatusSLAOperacional(chamado, referencia = new Date()) {
  if (!chamado) {
    return "NO_PRAZO";
  }

  if (chamado.status === "CANCELADO") {
    return "CANCELADO";
  }

  if (chamado.status === "ENCERRADO") {
    return chamado.slaStatusFinal || "ENCERRADO";
  }

  if (chamado.status === "VALIDADO") {
    return chamado.slaStatusFinal || "VALIDADO";
  }

  if (chamado.status === "CONCLUÍDO") {
    return chamado.slaStatusFinal || "CONCLUIDO_AGUARDANDO_VALIDACAO";
  }

  const vencimento = calcularVencimentoChamado(chamado);
  const diferencaMs = vencimento - referencia;
  const diferencaHoras = Math.ceil(diferencaMs / (1000 * 60 * 60));

  if (diferencaMs < 0) {
    return "ATRASADO";
  }

  if (diferencaHoras <= 2) {
    return "VENCE_EM_BREVE";
  }

  return "NO_PRAZO";
}

function obterTextoStatusSLA(statusSLA) {
  const textos = {
    NO_PRAZO: "No prazo",
    VENCE_EM_BREVE: "Vence em breve",
    ATRASADO: "Atrasado",
    CONCLUIDO_NO_PRAZO: "Concluído no prazo",
    CONCLUIDO_FORA_DO_PRAZO: "Concluído fora do prazo",
    CONCLUIDO_AGUARDANDO_VALIDACAO: "Aguardando validação",
    VALIDADO: "Validado",
    ENCERRADO: "Encerrado",
    CANCELADO: "Cancelado"
  };

  return textos[statusSLA] || "No prazo";
}

function obterClasseStatusSLA(statusSLA) {
  if (["ATRASADO", "CONCLUIDO_FORA_DO_PRAZO", "CANCELADO"].includes(statusSLA)) {
    return "sla-red";
  }

  if (statusSLA === "VENCE_EM_BREVE") {
    return "sla-orange";
  }

  if (["CONCLUIDO_NO_PRAZO", "VALIDADO", "ENCERRADO"].includes(statusSLA)) {
    return "sla-green";
  }

  return "sla-blue";
}

function montarCamposSLAChamado(chamado, referencia = new Date()) {
  const prazoHoras = obterPrazoHoras(chamado && chamado.prioridade);
  const criadoEm = obterDataBaseSLA(chamado);
  const vencimento = new Date(criadoEm.getTime() + prazoHoras * 60 * 60 * 1000);
  const chamadoComVencimento = {
    ...(chamado || {}),
    vencimentoSLAISO: vencimento.toISOString()
  };

  return {
    prazoHoras,
    vencimentoSLAISO: vencimento.toISOString(),
    slaBasePrioridade: chamado && chamado.prioridade ? chamado.prioridade : "Baixa",
    slaStatusAtual: calcularStatusSLAOperacional(chamadoComVencimento, referencia)
  };
}

function montarCamposSLAFinalizacao(chamado, dataFinalizacao = new Date()) {
  const camposBase = montarCamposSLAChamado(chamado, dataFinalizacao);
  const criadoEm = obterDataBaseSLA(chamado);
  const vencimento = new Date(camposBase.vencimentoSLAISO);
  const tempoConclusaoHoras = Math.max(0, Number(((dataFinalizacao - criadoEm) / (1000 * 60 * 60)).toFixed(2)));
  const concluidoNoPrazo = dataFinalizacao <= vencimento;

  return {
    ...camposBase,
    tempoConclusaoHoras,
    concluidoNoPrazo,
    slaStatusAtual: concluidoNoPrazo ? "CONCLUIDO_NO_PRAZO" : "CONCLUIDO_FORA_DO_PRAZO",
    slaStatusFinal: concluidoNoPrazo ? "CONCLUIDO_NO_PRAZO" : "CONCLUIDO_FORA_DO_PRAZO",
    slaFinalizadoEmISO: dataFinalizacao.toISOString()
  };
}


function idsIguais(idA, idB) {
  return String(idA) === String(idB);
}

function aplicarFeedbackSucesso(botao, textoSucesso, textoOriginal) {
  if (!botao) {
    return;
  }

  botao.classList.add("button-success");
  botao.textContent = textoSucesso;

  setTimeout(() => {
    botao.classList.remove("button-success");
    botao.textContent = textoOriginal;
  }, 1200);
}

const LIMITE_FOTOS_CHAMADO = 3;
const TAMANHO_MAXIMO_FOTO_CHAMADO = 1280;
const QUALIDADE_FOTO_CHAMADO = 0.74;

function converterFotoParaBase64(arquivo) {
  return converterImagemParaBase64Reduzida(
    arquivo,
    TAMANHO_MAXIMO_FOTO_CHAMADO,
    QUALIDADE_FOTO_CHAMADO
  );
}

function converterImagemParaBase64Reduzida(arquivo, tamanhoMaximo, qualidade) {
  return new Promise((resolve, reject) => {
    if (!arquivo || !String(arquivo.type || "").startsWith("image/")) {
      reject(new Error("Arquivo de imagem inválido."));
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const maiorLado = Math.max(imagem.width, imagem.height);
        const escala = maiorLado > tamanhoMaximo ? tamanhoMaximo / maiorLado : 1;
        const largura = Math.max(1, Math.round(imagem.width * escala));
        const altura = Math.max(1, Math.round(imagem.height * escala));
        const canvas = document.createElement("canvas");
        const contexto = canvas.getContext("2d");

        if (!contexto) {
          reject(new Error("Não foi possível preparar a imagem."));
          return;
        }

        canvas.width = largura;
        canvas.height = altura;
        contexto.drawImage(imagem, 0, 0, largura, altura);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };

      imagem.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
      imagem.src = leitor.result;
    };

    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.readAsDataURL(arquivo);
  });
}

function converterDataBRParaISO(dataBR) {
  if (!dataBR) {
    return new Date().toISOString();
  }

  const partes = String(dataBR).split("/");

  if (partes.length !== 3) {
    return new Date().toISOString();
  }

  const dia = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const ano = Number(partes[2]);
  const data = new Date(ano, mes, dia, 9, 0, 0);

  if (Number.isNaN(data.getTime())) {
    return new Date().toISOString();
  }

  return data.toISOString();
}

function obterDataValida(dataISO, dataReservaBR) {
  const data = new Date(dataISO || converterDataBRParaISO(dataReservaBR));

  if (Number.isNaN(data.getTime())) {
    return new Date();
  }

  return data;
}

function gerarIniciaisUsuario(nome) {
  if (!nome) {
    return "CO";
  }

  const partes = nome.trim().split(" ").filter(Boolean);

  if (partes.length === 0) {
    return "CO";
  }

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function statusFinalizado(status) {
  return status === "ENCERRADO" || status === "CANCELADO";
}

function atualizarPainelSeAberto() {
  const painel = document.getElementById("painel");

  if (painel && painel.classList.contains("active") && typeof renderizarPainelManutencao === "function") {
    renderizarPainelManutencao();
  }
}

/* =====================================================
   ATIVOS / EQUIPAMENTOS / LOCAIS / QR CODE
===================================================== */

let qrInicialProcessado = false;

function prepararQRCodeInicial() {
  if (qrInicialProcessado) {
    return;
  }

  qrInicialProcessado = true;
  const parametros = new URLSearchParams(window.location.search);
  const codigo = parametros.get("qr") || parametros.get("equipamento") || parametros.get("eq") || parametros.get("patrimonio") || parametros.get("ativo");

  if (!codigo) {
    return;
  }

  preencherAtivoNaNovaOS(codigo.trim());
  openPage("novo");
}

function preencherAtivoNaNovaOS(codigo) {
  const equipamentoInput = document.getElementById("equipamentoChamado");
  const localInput = document.getElementById("localChamado");
  const categoriaInput = document.getElementById("categoriaChamado");
  const ativo = encontrarAtivoPorCodigo(codigo);

  if (equipamentoInput) {
    equipamentoInput.value = normalizarCodigoAtivo(codigo);
  }

  if (ativo) {
    if (localInput && !localInput.value) {
      preencherSelectOuInput(localInput, ativo.localizacao || "");
    }

    if (categoriaInput && !categoriaInput.value && ativo.categoriaManutencao) {
      categoriaInput.value = ativo.categoriaManutencao;
      categoriaInput.dispatchEvent(new Event("change"));
    }
  }
}

function preencherSelectOuInput(campo, valor) {
  if (!campo || !valor) return;

  if (campo.tagName === "SELECT") {
    const existe = Array.from(campo.options).some(option => option.value === valor || option.textContent === valor);
    if (!existe) {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor;
      campo.appendChild(option);
    }
  }

  campo.value = valor;
}

function encontrarAtivoPorCodigo(codigo) {
  const codigoNormalizado = normalizarCodigoAtivo(codigo);

  return ativos.find(ativo => {
    return normalizarCodigoAtivo(ativo.codigo) === codigoNormalizado;
  });
}

function normalizarCodigoAtivo(codigo) {
  return String(codigo || "").trim().toUpperCase();
}

async function salvarAtivo() {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode cadastrar ativos e locais.");
    return;
  }

  const codigoInput = document.getElementById("codigoAtivo");
  const nomeInput = document.getElementById("nomeAtivo");
  const localInput = document.getElementById("localAtivo");
  const categoriaInput = document.getElementById("categoriaAtivo");
  const criticidadeInput = document.getElementById("criticidadeAtivo");
  const categoriaManutencaoInput = document.getElementById("categoriaManutencaoAtivo");
  const observacoesInput = document.getElementById("observacoesAtivo");

  if (!codigoInput || !nomeInput || !localInput || !categoriaInput) {
    alert("Campos do cadastro de ativo não encontrados.\nAtualize a página e tente novamente.");
    return;
  }

  const codigo = normalizarCodigoAtivo(codigoInput.value);
  const nome = nomeInput.value.trim();
  const localizacao = localInput.value.trim();
  const categoria = categoriaInput.value;
  const criticidade = criticidadeInput ? criticidadeInput.value : "Média";
  const categoriaManutencao = categoriaManutencaoInput ? categoriaManutencaoInput.value : "";
  const observacoes = observacoesInput ? observacoesInput.value.trim() : "";

  if (!codigo || !nome || !localizacao) {
    alert("Informe código, nome e localização do ativo/local para continuar.");
    return;
  }

  if (encontrarAtivoPorCodigo(codigo)) {
    alert("Já existe um ativo/local cadastrado com este código.\nUse outro código ou consulte o cadastro existente.");
    return;
  }

  const ativo = {
    codigo,
    nome,
    localizacao,
    categoria,
    criticidade,
    categoriaManutencao,
    observacoes,
    ativo: true,
    criadoPorUid: usuarioAtual.id,
    criadoPorNome: usuarioAtual.nome
  };

  try {
    await criarAtivoFirebase(ativo);
    limparFormularioAtivo();
    alert("Ativo/local cadastrado com sucesso.\nEle já pode ser vinculado a novas OS.");
  } catch (erro) {
    console.error("Erro ao cadastrar ativo:", erro);
    alert("Não foi possível cadastrar o ativo/local.\nVerifique sua conexão e permissões no Firestore.");
  }
}

function limparFormularioAtivo() {
  ["codigoAtivo", "nomeAtivo", "observacoesAtivo"].forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
      campo.value = "";
    }
  });

  const localInput = document.getElementById("localAtivo");
  if (localInput) localInput.value = "";

  const categoriaInput = document.getElementById("categoriaAtivo");
  if (categoriaInput) categoriaInput.value = "Equipamento";

  const criticidadeInput = document.getElementById("criticidadeAtivo");
  if (criticidadeInput) criticidadeInput.value = "Baixa";

  const categoriaManutencaoInput = document.getElementById("categoriaManutencaoAtivo");
  if (categoriaManutencaoInput) categoriaManutencaoInput.value = "";
}

function renderizarAtivos() {
  const listaAtivos = document.getElementById("listaAtivos");

  if (!listaAtivos) {
    return;
  }

  const ativosOrdenados = [...ativos].sort((a, b) => {
    const localA = String(a.localizacao || "");
    const localB = String(b.localizacao || "");
    return localA.localeCompare(localB, "pt-BR") || String(a.codigo || "").localeCompare(String(b.codigo || ""), "pt-BR");
  });

  listaAtivos.innerHTML = ativosOrdenados.length > 0
    ? ativosOrdenados.map(criarCardAtivo).join("")
    : criarMensagemVazia("Nenhum ativo/local cadastrado", "Cadastre equipamentos, ambientes ou patrimônios para gerar histórico por QR Code.");
}

function criarCardAtivo(ativo) {
  const urlQr = gerarUrlQRCodeAtivo(ativo.codigo);
  const totalOS = obterHistoricoAtivo(ativo.codigo).length;
  const abertas = obterHistoricoAtivo(ativo.codigo).filter(chamado => !["CONCLUÍDO", "CANCELADO"].includes(chamado.status)).length;

  return `
    <div class="asset-card">
      <div class="asset-card-header">
        <div>
          <h3>${escaparHTML(ativo.codigo)} • ${escaparHTML(ativo.nome)}</h3>
          <p><strong>Localização:</strong> ${escaparHTML(ativo.localizacao)}</p>
        </div>
        <span class="asset-criticality ${classeCriticidadeAtivo(ativo.criticidade)}">${escaparHTML(ativo.criticidade || "Baixa")}</span>
      </div>
      <p><strong>Tipo:</strong> ${escaparHTML(ativo.categoria)}</p>
      <p><strong>Categoria manutenção:</strong> ${escaparHTML(ativo.categoriaManutencao || "Não definida")}</p>
      ${ativo.observacoes ? `<p><strong>Observações:</strong> ${escaparHTML(ativo.observacoes)}</p>` : ""}
      <p><strong>Histórico:</strong> ${totalOS} OS vinculada(s), ${abertas} em aberto</p>
      <span class="asset-qr-link">${escaparHTML(urlQr)}</span>
      <div class="qr-actions">
        <button type="button" class="primary-button" data-dynamic-action="prepararOSDoAtivo" data-param0="${formatarAtributoHTML(ativo.codigo)}">
          Abrir OS
        </button>
        <button type="button" class="secondary-button" data-dynamic-action="mostrarHistoricoAtivo" data-param0="${formatarAtributoHTML(ativo.codigo)}">
          Histórico
        </button>
        <button type="button" class="secondary-button" data-dynamic-action="imprimirEtiquetaAtivo" data-param0="${formatarAtributoHTML(ativo.codigo)}">
          Imprimir etiqueta
        </button>
      </div>
      ${usuarioEhManutencaoAutorizada() ? `
        <div class="qr-actions">
          <button type="button" class="secondary-button" data-dynamic-action="prepararPlanoPreventivoDoAtivo" data-param0="${formatarAtributoHTML(ativo.codigo)}">
            Criar preventiva
          </button>
          <button type="button" class="danger-button" data-dynamic-action="excluirAtivo" data-param0="${formatarAtributoHTML(ativo.id)}" data-param1="${formatarAtributoHTML(ativo.codigo)}">
            Excluir ativo
          </button>
        </div>
      ` : ""}
      <div id="historicoAtivo-${escaparHTML(ativo.codigo)}" class="qr-history"></div>
    </div>
  `;
}

function classeCriticidadeAtivo(criticidade) {
  return `criticality-${String(criticidade || "baixa").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}`;
}

function gerarUrlQRCodeAtivo(codigo) {
  return `${window.location.origin}${window.location.pathname}?qr=${encodeURIComponent(normalizarCodigoAtivo(codigo))}`;
}

function obterHistoricoAtivo(codigo) {
  return chamados.filter(chamado => normalizarCodigoAtivo(chamado.equipamentoCodigo) === normalizarCodigoAtivo(codigo));
}

function prepararOSDoAtivo(codigo) {
  preencherAtivoNaNovaOS(codigo);
  openPage("novo");
}

function mostrarHistoricoAtivo(codigo) {
  const container = document.getElementById(`historicoAtivo-${normalizarCodigoAtivo(codigo)}`);
  if (!container) return;

  const historico = obterHistoricoAtivo(codigo).slice(0, 8);
  container.innerHTML = criarHTMLHistoricoAtivo(historico, codigo);
}

function criarHTMLHistoricoAtivo(historico, codigo) {
  if (historico.length === 0) {
    return criarMensagemVazia("Sem histórico", `Ainda não existe OS vinculada ao QR ${normalizarCodigoAtivo(codigo)}.`);
  }

  return historico.map(chamado => `
    <div class="ticket-row" data-dynamic-action="abrirDetalhesChamado" data-param0="${formatarAtributoHTML(chamado.id)}">
      <div>
        <strong>${escaparHTML(chamado.numeroOS || chamado.id)}</strong>
        <span>${escaparHTML(chamado.categoria || "Categoria não informada")}${chamado.subcategoria ? ` / ${escaparHTML(chamado.subcategoria)}` : ""}</span>
        <small>${escaparHTML(chamado.descricao || "Sem descrição")}</small>
      </div>
      <span class="${obterClasseStatus(chamado.status)}">${escaparHTML(chamado.status || "ABERTO")}</span>
    </div>
  `).join("");
}

function imprimirEtiquetaAtivo(codigo) {
  const ativo = encontrarAtivoPorCodigo(codigo);

  if (!ativo) {
    alert("Ativo/local não encontrado.\nAtualize a lista e tente novamente.");
    return;
  }

  const janela = window.open("", "_blank", "width=420,height=620");
  if (!janela) {
    alert("O navegador bloqueou a janela de impressão.\nLibere pop-ups para imprimir a etiqueta.");
    return;
  }

  const urlQr = gerarUrlQRCodeAtivo(ativo.codigo);
  janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Etiqueta ${escaparHTML(ativo.codigo)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          .label { border: 2px solid #111; border-radius: 16px; padding: 20px; max-width: 340px; }
          h1 { font-size: 24px; margin: 0 0 8px; }
          p { margin: 6px 0; font-size: 14px; }
          .code { font-size: 22px; font-weight: 700; letter-spacing: 1px; margin: 14px 0; }
          .url { word-break: break-all; font-size: 11px; }
          .hint { margin-top: 16px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="label">
          <h1>SENAC - Manutenção</h1>
          <p><strong>Ativo/local:</strong> ${escaparHTML(ativo.nome)}</p>
          <p><strong>Local:</strong> ${escaparHTML(ativo.localizacao)}</p>
          <p><strong>Criticidade:</strong> ${escaparHTML(ativo.criticidade || "Baixa")}</p>
          <div class="code">${escaparHTML(ativo.codigo)}</div>
          <p class="url">${escaparHTML(urlQr)}</p>
          <p class="hint">Gere o QR Code deste link em um gerador de QR e cole nesta etiqueta.</p>
        </div>
        <script>window.print();<\/script>
      </body>
    </html>
  `);
  janela.document.close();
}

async function excluirAtivo(id, codigo) {
  if (!usuarioEhManutencaoAutorizada()) {
    alert("Apenas a manutenção autorizada pode excluir ativos.");
    return;
  }

  if (!id) {
    alert("Ativo não encontrado para exclusão.\nAtualize a lista e tente novamente.");
    return;
  }

  const totalOS = obterHistoricoAtivo(codigo).length;

  const mensagem = totalOS > 0
    ? `Este ativo possui ${totalOS} OS vinculada(s).\nExcluir o ativo não apaga o histórico das OS. Deseja continuar?`
    : "Deseja excluir este ativo?";

  if (!(await appConfirm(mensagem, { textoConfirmar: "Excluir", textoCancelar: "Voltar" }))) {
    return;
  }

  try {
    await excluirAtivoFirebase(id);
    alert("Ativo excluído com sucesso.\nO histórico das OS vinculadas permanece preservado.");
  } catch (erro) {
    console.error("Erro ao excluir ativo:", erro);
    alert("Não foi possível excluir o ativo.\nVerifique sua conexão e permissões no Firestore.");
  }
}

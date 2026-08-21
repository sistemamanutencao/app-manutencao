/* =====================================================
   NOTIFICAÇÕES - INTERFACE E AÇÕES DO USUÁRIO

   Responsabilidades:
   - renderizar notificações;
   - marcar itens como lidos;
   - exibir contador e popup de notificações;
   - respeitar o perfil e o usuário autenticado.

   Atenção:
   - depende da coleção notificacoes e do usuário atual.
===================================================== */

function renderizarNotificacoes() {
  const botaoNotificacoes = document.getElementById("botaoNotificacoes");
  const contadorNotificacoes = document.getElementById("contadorNotificacoes");
  const listaNotificacoes = document.getElementById("listaNotificacoes");
  const botaoMarcarTodas = document.getElementById("botaoMarcarTodasNotificacoes");

  if (botaoNotificacoes) {
    botaoNotificacoes.classList.toggle("visible", usuarioTemPerfilSalvo());
  }

  const totalNaoLidas = notificacoes.filter(notificacaoNaoLida).length;

  if (contadorNotificacoes) {
    contadorNotificacoes.textContent = totalNaoLidas > 99 ? "99+" : String(totalNaoLidas);
    contadorNotificacoes.classList.toggle("visible", totalNaoLidas > 0);
  }

  if (botaoMarcarTodas) {
    botaoMarcarTodas.style.display = totalNaoLidas > 0 ? "block" : "none";
  }

  if (!listaNotificacoes) {
    return;
  }

  listaNotificacoes.innerHTML = notificacoes.length > 0
    ? notificacoes.map(criarCardNotificacao).join("")
    : criarMensagemVazia("Nenhuma notificação", "As atualizações dos chamados aparecerão aqui.");
}

function notificacaoNaoLida(notificacao) {
  return !notificacaoEstaLida(notificacao);
}

function notificacaoEstaLida(notificacao) {
  return Array.isArray(notificacao.lidaPorUids)
    && notificacao.lidaPorUids.includes(usuarioAtual.id);
}

function criarCardNotificacao(notificacao) {
  const lida = notificacaoEstaLida(notificacao);
  const classeEstado = lida ? "read" : "unread";
  const botaoLida = lida
    ? `<button type="button" class="notification-action-button" disabled>Lida</button>`
    : `<button type="button" class="notification-action-button" data-dynamic-action="marcarNotificacaoComoLida" data-param0="${formatarAtributoHTML(notificacao.id)}" data-pass-element="true">Marcar como lida</button>`;
  const botaoAbrirChamado = notificacao.chamadoId
    ? `<button type="button" class="notification-action-button blue" data-dynamic-action="abrirChamadoPelaNotificacao" data-param0="${formatarAtributoHTML(notificacao.id)}" data-param1="${formatarAtributoHTML(notificacao.chamadoId)}">Abrir chamado</button>`
    : "";

  return `
    <div class="notification-card ${classeEstado}">
      <div class="notification-card-header">
        <div>
          <h3>${escaparHTML(notificacao.titulo)}</h3>
          <small>${escaparHTML(notificacao.data)} • ${escaparHTML(notificacao.criadaPorNome)}</small>
        </div>
        <span class="notification-dot" aria-hidden="true"></span>
      </div>

      <p>${escaparHTML(notificacao.mensagem)}</p>

      <div class="notification-actions">
        ${botaoAbrirChamado}
        ${botaoLida}
      </div>
    </div>
  `;
}

function abrirPainelNotificacoes() {
  if (!usuarioTemPerfilSalvo()) {
    alert("Entre no app para visualizar suas notificações internas.");
    return;
  }

  renderizarNotificacoes();

  abrirModalPorId("modalNotificacoes");
}

function fecharPainelNotificacoes() {
  fecharModalPorId("modalNotificacoes");
}

async function marcarNotificacaoComoLida(id, botao) {
  if (!usuarioTemPerfilSalvo()) {
    return;
  }

  const notificacao = notificacoes.find(item => idsIguais(item.id, id));

  if (!notificacao || notificacaoEstaLida(notificacao)) {
    renderizarNotificacoes();
    return;
  }

  try {
    if (botao) {
      botao.disabled = true;
      botao.textContent = "Salvando...";
    }

    await marcarNotificacaoComoLidaFirebase(id, usuarioAtual.id);
  } catch (erro) {
    console.error("Erro ao marcar notificação como lida:", erro);
    alert("Não foi possível marcar a notificação como lida.\nVerifique sua conexão e tente novamente.");

    if (botao) {
      botao.disabled = false;
      botao.textContent = "Marcar como lida";
    }
  }
}

async function marcarTodasNotificacoesComoLidas() {
  const naoLidas = notificacoes.filter(notificacaoNaoLida);

  if (naoLidas.length === 0) {
    return;
  }

  try {
    await Promise.all(naoLidas.map(notificacao => {
      return marcarNotificacaoComoLidaFirebase(notificacao.id, usuarioAtual.id);
    }));
  } catch (erro) {
    console.error("Erro ao marcar todas as notificações:", erro);
    alert("Não foi possível marcar todas as notificações como lidas.\nVerifique sua conexão e tente novamente.");
  }
}

async function abrirChamadoPelaNotificacao(notificacaoId, chamadoId) {
  const notificacao = notificacoes.find(item => idsIguais(item.id, notificacaoId));

  if (notificacao && notificacaoNaoLida(notificacao)) {
    try {
      await marcarNotificacaoComoLidaFirebase(notificacaoId, usuarioAtual.id);
    } catch (erro) {
      console.warn("Não foi possível marcar a notificação como lida antes de abrir o chamado:", erro);
    }
  }

  fecharPainelNotificacoes();
  openPage("chamados");

  setTimeout(() => {
    const chamado = chamados.find(item => idsIguais(item.id, chamadoId));

    if (chamado) {
      abrirDetalhesChamado(chamadoId);
      return;
    }

    alert("A OS relacionada não está disponível para este usuário.\nVerifique se seu perfil possui permissão para visualizá-la.");
  }, 150);
}

async function registrarNotificacaoNovoChamado(chamadoId, chamado) {
  if (!chamadoId || !chamado) {
    return;
  }

  await registrarNotificacaoInterna({
    titulo: "Novo chamado aberto",
    mensagem: `${chamado.criadoPorNome || "Usuário"} abriu uma OS em ${chamado.local}: ${chamado.descricao}`,
    tipo: "novo_chamado",
    chamadoId,
    chamadoDescricao: chamado.descricao,
    destinatarioPerfil: PERFIS_USUARIO.MANUTENCAO
  });
}

async function registrarNotificacaoStatusChamado(chamado, novoStatus, justificativaAguardando) {
  const destinatarioUid = chamado.criadoPorUid;

  if (!destinatarioUid) {
    return;
  }

  const complemento = novoStatus === "AGUARDANDO" && justificativaAguardando
    ? ` Justificativa: ${justificativaAguardando}`
    : "";

  await registrarNotificacaoInterna({
    titulo: "Chamado atualizado",
    mensagem: `Seu chamado "${chamado.descricao}" foi alterado para ${novoStatus}.${complemento}`,
    tipo: "status_chamado",
    chamadoId: chamado.id,
    chamadoDescricao: chamado.descricao,
    destinatarioUid
  });
}

async function registrarNotificacaoCancelamentoChamado(chamado, motivo) {
  if (!chamado) {
    return;
  }

  if (usuarioPossuiPerfil(PERFIS_USUARIO.COLABORADOR)) {
    await registrarNotificacaoInterna({
      titulo: "Chamado cancelado pelo colaborador",
      mensagem: `${usuarioAtual.nome} cancelou o chamado "${chamado.descricao}". Motivo: ${motivo}`,
      tipo: "cancelamento_colaborador",
      chamadoId: chamado.id,
      chamadoDescricao: chamado.descricao,
      destinatarioPerfil: PERFIS_USUARIO.MANUTENCAO
    });
    return;
  }

  const destinatarioUid = chamado.criadoPorUid;

  if (!destinatarioUid) {
    return;
  }

  await registrarNotificacaoInterna({
    titulo: "Chamado cancelado",
    mensagem: `Seu chamado "${chamado.descricao}" foi cancelado. Motivo: ${motivo}`,
    tipo: "cancelamento_manutencao",
    chamadoId: chamado.id,
    chamadoDescricao: chamado.descricao,
    destinatarioUid
  });
}

async function registrarNotificacaoInterna(dados) {
  if (!usuarioTemPerfilSalvo()) {
    return;
  }

  const agora = new Date();

  try {
    await criarNotificacaoFirebase({
      titulo: dados.titulo,
      mensagem: dados.mensagem,
      tipo: dados.tipo || "info",
      chamadoId: dados.chamadoId ? String(dados.chamadoId) : "",
      chamadoDescricao: dados.chamadoDescricao || "",
      destinatarioUid: dados.destinatarioUid || "",
      destinatarioPerfil: dados.destinatarioPerfil || "",
      criadaPorUid: usuarioAtual.id,
      criadaPorNome: usuarioAtual.nome,
      criadaPorPerfil: usuarioAtual.perfil,
      criadaEmISO: agora.toISOString(),
      lidaPorUids: []
    });
  } catch (erro) {
    console.warn("Não foi possível registrar a notificação interna:", erro);
  }
}

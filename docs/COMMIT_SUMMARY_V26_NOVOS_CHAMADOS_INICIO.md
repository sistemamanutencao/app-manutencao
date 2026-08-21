# v26 — Novos chamados na página Início

## Objetivo
Dar visibilidade imediata à manutenção sobre novas Ordens de Serviço sem exigir abertura das notificações ou da Fila operacional.

## Regra implementada
- a seção **Novos chamados** é exibida somente para o perfil Manutenção;
- entram na seção **todos** os chamados cujo status seja `ABERTO`;
- não há limite de 3 itens: todos os chamados novos são listados;
- chamados `EM ANDAMENTO`, `AGUARDANDO`, `CONCLUÍDO`, `VALIDADO`, `ENCERRADO` ou `CANCELADO` não aparecem nessa seção;
- assim que uma OS deixa de estar `ABERTO`, o listener em tempo real do Firestore atualiza a tela e ela sai da página Início;
- o contador ao lado de **Novos chamados** mostra a quantidade atual de OS abertas;
- os cards preservam os detalhes e a ação rápida **Iniciar OS** já existente para a manutenção.

## Arquivos alterados
- `index.html`
- `js/chamados-render.js`
- `css/inicio.css`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/COMMIT_SUMMARY_V26_NOVOS_CHAMADOS_INICIO.md`

## Risco
Baixo a moderado. Não altera o modelo de dados, as regras do Firebase nem as transições de status. A mudança atua apenas na renderização da página Início e reutiliza o listener Firestore já existente.

## Testes executados
- sintaxe de todos os arquivos JavaScript validada com `node --check`;
- estrutura HTML da nova seção validada;
- filtro estrito de status `ABERTO` confirmado;
- ausência de limite de quantidade confirmada;
- cache PWA atualizado para v26;
- integridade do ZIP validada após empacotamento.

## Commit
`feat: exibir novos chamados abertos na pagina inicial`

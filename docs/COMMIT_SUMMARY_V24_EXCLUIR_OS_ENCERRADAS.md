# Commit Summary — V24 Excluir OS encerradas

## Objetivo
Permitir que a manutenção remova do Firebase ordens de serviço já encerradas, depois da exportação dos relatórios, para reduzir volume de dados armazenados e manter o histórico operacional controlado fora do app.

## Alterações realizadas
- Adicionada função de exclusão de chamado na camada Firebase.
- Criada opção individual **Excluir OS** nos cards da aba **OS encerradas** da Fila operacional.
- Criada opção em lote **Excluir encerradas filtradas** na aba **OS encerradas** da Fila operacional.
- A exclusão em lote respeita busca e filtros aplicados na fila.
- A ação só é exibida e executada para manutenção autorizada.
- A exclusão é bloqueada para qualquer OS que não esteja com status `ENCERRADO`.
- Incluídas confirmações explícitas antes da exclusão definitiva.
- Adicionado aviso visual orientando exportar antes de excluir.
- Cache do service worker atualizado para carregar a nova versão.

## Arquivos alterados
- `index.html`
- `js/firebase-service.js`
- `js/painel.js`
- `js/painel-cards.js`
- `js/event-action-maps.js`
- `css/painel.css`
- `service-worker.js`
- `docs/COMMIT_SUMMARY_V24_EXCLUIR_OS_ENCERRADAS.md`

## Firestore
- `firestore.rules` não foi alterado.
- A regra atual já permite `delete` em `/chamados/{id}` para perfil `manutencao`.

## Impacto
- OS ativas não podem ser excluídas por esse fluxo.
- Gerência e colaborador não recebem opção de exclusão.
- A exclusão é definitiva no Firebase e não possui restauração pelo app.

## Rollback
Restaurar os arquivos modificados para a versão anterior `app-manutencao-v24-fundo-abas-escuro.zip`.

# COMMIT_SUMMARY_V24_EXCLUSAO_OS_CANCELADAS

## Objetivo
Permitir que o perfil Manutenção exclua definitivamente chamados com status `CANCELADO`, além das OS já encerradas.

## Alterações
- `js/painel-cards.js`: exibe **Excluir OS** para chamados `ENCERRADO` ou `CANCELADO`, somente para Manutenção.
- `js/painel.js`: a exclusão individual passou a aceitar ambos os status finais, com confirmação específica para o status da OS.
- `js/event-action-maps.js`: registra a ação genérica `excluirChamadoFinalizado`.
- `service-worker.js`: versão do cache atualizada para distribuir a correção ao PWA.

## Mantido sem alteração
- A exclusão em lote continua exclusiva das **OS encerradas filtradas**.
- `firestore.rules` não foi alterado: a regra atual já permite `delete` em `/chamados/{id}` somente para o perfil Manutenção.
- `js/firebase-service.js` não foi alterado.
- Gerência e Colaborador não recebem permissão de exclusão.

## Segurança
A exclusão é definitiva no Firebase e exige confirmação no app.

# Commit Summary — V24 Correção da exclusão de OS encerradas

## Objetivo
Corrigir a falha que impedia a manutenção de excluir chamados encerrados pela Fila operacional de OS.

## Diagnóstico
A função de exclusão chamava `aplicarFeedbackCarregando()` e `aplicarFeedbackErro()`, mas essas funções não existiam no projeto. O erro JavaScript ocorria antes da chamada `delete()` do Firestore, por isso a OS não era removida.

## Alterações realizadas
- Criadas as funções `aplicarFeedbackCarregando()`, `aplicarFeedbackErro()` e `restaurarFeedbackBotao()` em `js/utils.js`.
- Mantida compatibilidade com `aplicarFeedbackSucesso()`.
- Criada a função `excluirChamadosFirebase()` com exclusão em lotes para limpeza de várias OS encerradas.
- Atualizado o fluxo de exclusão individual e em massa em `js/painel.js`.
- Adicionadas mensagens de erro mais específicas para bloqueio de permissão do Firestore.
- Removidos mapeamentos obsoletos de QR Code/Ativos em `js/event-action-maps.js`.
- Atualizado o cache do service worker.

## Arquivos alterados
- `js/utils.js`
- `js/firebase-service.js`
- `js/painel.js`
- `js/event-action-maps.js`
- `css/componentes.css`
- `service-worker.js`
- `docs/COMMIT_SUMMARY_V24_CORRECAO_EXCLUSAO_FIREBASE.md`

## Firestore Rules
`firestore.rules` não foi alterado. A regra existente já contém `allow delete: if ehManutencao();` para `/chamados/{id}`.

## Observação operacional
Se o app corrigido ainda exibir erro de permissão, o problema estará nas regras publicadas no Firebase ou no valor do campo `perfil` em `usuarios/{uid}`.

## Rollback
Restaurar os arquivos acima pela versão `app-manutencao-v24-correcao-exclusao-layout.zip`.

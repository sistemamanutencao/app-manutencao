# Commit Summary — V24 Correção de exclusão e contraste

## Objetivo
Corrigir problemas visuais e de usabilidade identificados após a inclusão da exclusão de OS encerradas.

## Correções realizadas
- Restaurada a cor original do cabeçalho de boas-vindas na tela inicial.
- Removido o destaque claro/dourado indevido no texto superior da aba Início.
- Ajustado o card de limpeza de OS encerradas para não estourar a largura no navegador desktop.
- Botão `Excluir encerradas filtradas` passa a ocupar 100% da largura interna do card, sem ultrapassar a borda.
- A exibição do card de exclusão agora usa estado explícito por classe e atributo `hidden`, tornando o reaparecimento mais estável ao alternar abas.
- Após exclusão individual ou em lote, a lista local é atualizada e o painel é renderizado novamente.
- Atualizado o cache do service worker.

## Arquivos alterados
- `css/layout.css`
- `css/painel.css`
- `js/painel.js`
- `service-worker.js`
- `docs/COMMIT_SUMMARY_V24_CORRECAO_EXCLUSAO_LAYOUT.md`

## Impacto
- Sem alteração em `firestore.rules`.
- Sem alteração em Firebase Authentication.
- Sem alteração na estrutura das OS.
- Mantida a exclusão direta no Firestore apenas para OS com status `ENCERRADO`.

## Rollback
Restaurar os arquivos acima a partir da versão `app-manutencao-v24-excluir-os-encerradas.zip`.

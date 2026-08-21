# Commit summary - v24 fila de OS recolhida por padrão

## Objetivo
Exibir os cards individuais da Fila operacional de OS recolhidos por padrão, facilitando a visualização simultânea de mais ordens.

## Alterações
- Removido o atributo `open` dos elementos `<details>` criados em `js/painel-cards.js`.
- Cada OS continua podendo ser expandida e recolhida individualmente.
- O resumo fechado preserva número, descrição, dados principais e status.
- Atualizado o nome do cache do service worker para distribuir a nova versão.

## Impacto
- Alteração exclusivamente visual/interativa.
- Não altera Firestore, regras de segurança, dados, status ou permissões dos perfis.
- Não altera o comportamento de Minhas OS.

## Commit sugerido
`style: inicia cards da fila operacional recolhidos`

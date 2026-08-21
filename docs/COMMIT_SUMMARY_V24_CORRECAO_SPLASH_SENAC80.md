# COMMIT SUMMARY — V24 Correção do splash Senac 80 anos

## Objetivo
Eliminar o flash do antigo escudo dourado/marrom exibido logo após a abertura do PWA.

## Causa encontrada
O `index.html` ainda referenciava `img/logo-manutencao-dourado.png` no splash interno. O mesmo asset permanecia pré-carregado pelo `service-worker.js`, e as cores de inicialização do HTML/manifest ainda utilizavam o marrom `#1b140e`.

## Alterações
- `index.html`: splash interno passou a usar `img/icon-512.png` (Senac 80 anos); fundo de inicialização alterado para navy `#000c2b`; removidos gradientes/bordas douradas do splash.
- `manifest.json`: `background_color` e `theme_color` alterados para `#000c2b`.
- `service-worker.js`: versão do cache atualizada e removido o antigo logo dourado da lista de precache.
- `img/logo-manutencao-dourado.png`: removido do pacote por não possuir mais uso ativo.

## Lógica e Firebase
Nenhuma regra de negócio, permissão ou integração com Firestore foi alterada.

## Resultado esperado
A sequência de abertura passa do splash nativo/PWA com o ícone Senac 80 anos para um splash interno visualmente coerente com a mesma identidade, sem exibir o antigo escudo dourado/marrom.

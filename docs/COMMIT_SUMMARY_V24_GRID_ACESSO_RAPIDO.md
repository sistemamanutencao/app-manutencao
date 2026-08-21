# COMMIT SUMMARY — v24 — Grid de Acesso Rápido sem espaços vazios

## Objetivo
Corrigir a distribuição dos cards de **Acesso rápido** na tela Início para evitar células vazias que davam a impressão de conteúdo ausente.

## Alterações
- `css/inicio.css`
  - Grid principal alterado de 4 para 3 colunas uniformes.
  - Uso de `minmax(0, 1fr)` para impedir estouro de conteúdo dentro das colunas.
- `css/responsive.css`
  - Removido o comportamento de 2 colunas em telas até 340 px.
  - Mantidas 3 colunas também em telas estreitas, preservando o preenchimento integral do grid.

## Comportamento por perfil
- **Manutenção:** 6 atalhos visíveis → 3 colunas × 2 linhas.
- **Gerência:** 3 atalhos visíveis → 3 colunas × 1 linha.
- **Colaborador:** 3 atalhos visíveis → 3 colunas × 1 linha.

Nenhum card artificial foi criado e nenhuma permissão foi alterada.

## Firebase e regras de negócio
Não houve alterações em:
- `firestore.rules`;
- `js/app.js`;
- `js/firebase-service.js`;
- `index.html`;
- constantes ou regras de permissão.

A mudança é exclusivamente de layout CSS.

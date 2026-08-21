# Commit summary - v24 fila operacional recolhível

## Objetivo
- Inserir acesso direto à **Fila operacional de OS** no grid inicial do perfil manutenção.
- Remover o card **Áreas e serviços** apenas da visão inicial da manutenção.
- Permitir recolher/expandir cada OS individualmente dentro da Fila operacional de OS.

## Arquivos alterados
- `index.html`
  - O card rápido **Áreas e serviços** recebeu classe `hide-for-manut`.
  - Foi adicionado card rápido `manut-only` para **Fila operacional de OS**, redirecionando para `painel`.
  - A seção superior da fila operacional no painel passou a abrir expandida por padrão.
- `js/app.js`
  - `aplicarPermissoesInterface()` agora oculta elementos `.hide-for-manut` quando o usuário é manutenção autorizada.
- `js/painel-cards.js`
  - Cada OS renderizada na fila operacional agora usa `<details>`/`<summary>`, permitindo recolher ou expandir individualmente.
  - Botões operacionais existentes foram mantidos dentro do conteúdo expandido.
- `css/painel.css`
  - Estilos adicionados para cards recolhíveis da fila operacional.

## Impacto por perfil
- Manutenção:
  - Não vê mais o card **Áreas e serviços** no grid inicial.
  - Vê o card **Fila operacional de OS** no lugar, com acesso ao painel.
  - Pode recolher/expandir cada OS na fila operacional.
- Gerência:
  - Sem nova permissão de painel.
  - Não recebe o card de fila operacional, pois ele é `manut-only`.
- Colaborador:
  - Continua vendo **Áreas e serviços**.
  - Não recebe acesso à fila operacional.

## Firestore rules
- Não houve alteração em `firestore.rules`.
- A mudança é de interface/renderização; não altera leitura, escrita, permissões ou coleções.

## Risco e rollback
- Risco baixo: alteração concentrada em HTML, renderização de card e CSS.
- Rollback: restaurar os quatro arquivos alterados a partir do ZIP base `app-manutencao-v24-ajuste-tela-redefinicao(3).zip`.

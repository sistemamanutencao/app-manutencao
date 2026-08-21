# COMMIT SUMMARY — v24 — Início da Manutenção sem “Minhas OS”

## Objetivo
Retirar da tela **Início** do perfil **Manutenção** os elementos “Minhas OS”, pois o perfil já possui a **Fila operacional de OS** para trabalhar com todas as ordens de serviço disponíveis.

## Alterações realizadas

### `index.html`
- O atalho `chamados` do bloco **Acesso rápido** recebeu `hide-for-manut`.
- A seção-resumo **Minhas OS** da tela Início recebeu `hide-for-manut`.
- Ambos continuam disponíveis para Gerência e Colaborador conforme as regras atuais.

### `js/app.js`
- A rotina existente `aplicarPermissoesInterface()` marca o grid do Início com `quick-grid-manutencao` quando o perfil é Manutenção.
- Essa classe serve apenas para reorganização visual dos cinco atalhos restantes.
- Nenhuma consulta, gravação ou permissão de dados foi alterada.

### `css/inicio.css`
- A Manutenção passa a exibir cinco atalhos em composição balanceada:
  - 3 cards na primeira linha;
  - 2 cards centralizados na segunda;
  - todos com a mesma largura.

### `css/responsive.css`
- Mantém a composição balanceada também em telas de até 340 px.

### `service-worker.js`
- Somente o nome do cache foi incrementado para forçar a atualização dos arquivos da interface no PWA instalado.

## Resultado por perfil
- **Manutenção:** não vê o atalho “Minhas/Todas as OS” nem a seção “Minhas OS” no Início. Continua com Nova OS, Comunicados, Fila operacional de OS, Preventivas e Diagnóstico inicial.
- **Gerência:** sem alteração funcional ou visual nesses elementos.
- **Colaborador:** sem alteração funcional ou visual nesses elementos.

## O que permanece no projeto
- A página/aba `chamados` não foi removida.
- A lógica de listagem de OS não foi removida.
- A navegação geral para OS fora da tela Início não foi alterada.

## Firebase
- `firestore.rules`: não alterado.
- `js/firebase-service.js`: não alterado.
- Nenhuma coleção, documento, schema, regra ou permissão foi modificada.

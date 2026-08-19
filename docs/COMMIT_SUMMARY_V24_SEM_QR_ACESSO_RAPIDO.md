# Commit summary - v24 sem QR no acesso rápido

## Objetivo
Remover do fluxo principal as funções de Ativos/QR e leitura de QR Code, reduzindo dúvida operacional na tela inicial e evitando recursos sem uso prático na unidade.

## Alterações
- Removido o card **Ler QR Code** da aba **Acesso rápido**.
- Removido o card **Ativos / QR** da aba **Acesso rápido** para manutenção.
- Removidas as páginas internas **Ativos e QR Code** e **Leitor de QR Code**.
- Removidas as referências de scripts `js/ativos.js` e `js/leitor-qr.js` do carregamento do app.
- Removidas ações de interface relacionadas a QR Code e ativos do mapa de eventos.
- Removido o carregamento/monitoramento de ativos do ciclo principal do app.
- Ajustado o texto de Preventivas para **Local / equipamento / patrimônio**, eliminando a referência a QR Code.
- Atualizado o cache do service worker.

## Arquivos alterados
- `index.html`
- `js/app.js`
- `js/state.js`
- `js/navigation.js`
- `js/event-action-maps.js`
- `js/perfil.js`
- `service-worker.js`

## Arquivos removidos
- `js/ativos.js`
- `js/leitor-qr.js`

## Firebase
Não houve alteração em `firestore.rules`, autenticação, permissões ou estrutura das coleções.

## Rollback
Restaurar a versão anterior `app-manutencao-v24-nova-os-simplificada.zip`.

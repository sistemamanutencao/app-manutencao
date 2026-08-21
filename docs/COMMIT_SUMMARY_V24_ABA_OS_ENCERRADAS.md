# Commit summary — Aba separada para OS encerradas

## Objetivo
Separar as ordens de serviço com status `ENCERRADO` da fila operacional ativa.

## Alterações
- Criadas as abas **OS ativas** e **OS encerradas** no Painel da manutenção.
- A aba ativa exclui OS com status `ENCERRADO`.
- A aba encerrada exibe somente OS com status `ENCERRADO`.
- Adicionados contadores em cada aba.
- Busca e prioridade continuam funcionando nas duas abas.
- O filtro de status fica desabilitado na aba encerrada, pois todas as OS nela já possuem o mesmo status.
- O recolhimento individual dos cards foi preservado.

## Impacto técnico
Arquivos alterados: `index.html`, `js/state.js`, `js/painel.js`, `js/painel-cards.js`, `js/event-action-maps.js` e `css/painel.css`.

Não houve alteração em `firestore.rules`, Firebase ou modelo de dados.

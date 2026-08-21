# V24 — Separação de Minhas OS

## Alteração
- A tela Minhas OS foi dividida em duas abas: OS ativas e OS encerradas.
- A aba ativa exclui ordens com status `ENCERRADO`.
- A aba encerrada contém exclusivamente ordens com status `ENCERRADO`.
- Os filtros de status permanecem disponíveis somente para OS ativas.
- A busca funciona nas duas abas.
- As ações rápidas da manutenção permanecem nas OS ativas; OS encerradas não recebem ações de transição.
- O resumo da página inicial passa a priorizar apenas OS ativas.
- As exportações respeitam a aba selecionada.

## Firebase
Nenhuma alteração em `firestore.rules`, Authentication ou estrutura das coleções.

## Commit sugerido
`feat: separa OS encerradas em Minhas OS`

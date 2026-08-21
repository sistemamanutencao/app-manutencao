# Relatório v26 — Ajuste visual do Inventário

A tela do inventário foi corrigida para funcionar adequadamente tanto no navegador de computador quanto no celular.

## Problemas corrigidos

1. O botão Voltar herdava `width: 100%` de `.secondary-button`, ocupando quase todo o cabeçalho.
2. O sino de notificações e o botão Voltar reduziam excessivamente a largura disponível para o título e o texto.
3. O aplicativo mantinha largura máxima de 430 px no computador, deixando os cartões e textos comprimidos.

## Solução

- botão Voltar com largura automática e altura compacta;
- cabeçalho em grade, com empilhamento em telas menores;
- largura máxima de 760 px apenas quando a página Inventário estiver ativa em telas maiores;
- barra inferior acompanha a largura da página de inventário;
- nomes longos têm quebra controlada e melhor espaçamento.

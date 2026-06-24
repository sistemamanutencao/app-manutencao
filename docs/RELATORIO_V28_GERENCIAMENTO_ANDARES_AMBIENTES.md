# Relatório v28 — Gerenciamento de andares e ambientes

## Objetivo

Permitir que a equipe de manutenção amplie ou reduza a estrutura física do inventário sem precisar editar os arquivos do aplicativo.

## Funcionalidades implementadas

### Andares

Na raiz do inventário, o usuário pode:

- adicionar um novo andar;
- abrir o andar para cadastrar ambientes;
- excluir um andar existente.

### Ambientes

Dentro de cada andar, é possível criar dois formatos:

1. **Ambiente simples:** recebe itens diretamente.
2. **Ambiente com áreas internas:** funciona como agrupador, seguindo o modelo do SABES.

### Áreas internas

Dentro de um ambiente agrupador, é possível adicionar e excluir áreas internas.

### Exclusão protegida

A exclusão apresenta uma confirmação com o impacto da operação. Ao excluir um local, suas áreas internas e quantidades instaladas também são removidas da estrutura do inventário.

## Persistência

A estrutura personalizada continua armazenada apenas no navegador, junto com as imagens e os saldos de estoque. Portanto:

- as alterações não sincronizam entre dispositivos;
- limpar os dados do site pode remover as personalizações;
- não houve alteração nas regras do Firebase.

## Validação técnica

- sintaxe verificada em todos os arquivos JavaScript;
- IDs do HTML verificados, sem duplicidades;
- teste automatizado de inclusão e exclusão de andar, ambiente simples, ambiente agrupador e área interna;
- integridade do pacote ZIP verificada.

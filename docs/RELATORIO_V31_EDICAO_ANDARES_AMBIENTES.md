# Relatório v31 — Edição de andares e ambientes

A v31 adiciona edição nominal à estrutura do inventário. Cada cartão de andar, ambiente ou área interna agora apresenta as ações na seguinte ordem:

1. Excluir
2. Editar

Ao selecionar **Editar**, o sistema abre uma janela com o nome atual preenchido. O usuário pode alterar o nome e salvar. O registro mantém o mesmo identificador interno, portanto nenhum item ou quantidade vinculada é perdido.

## Regras de validação

- mínimo de 2 caracteres;
- máximo de 80 caracteres;
- remoção de espaços repetidos;
- bloqueio de nomes duplicados no mesmo nível;
- edição disponível somente após a sincronização inicial do inventário.

## Persistência

A alteração utiliza a mesma estrutura já existente no documento `inventarioEstrutura/principal` do Cloud Firestore. Não foi necessária nenhuma mudança adicional nas regras do Firestore da v30.

## Validações executadas

- edição de andar;
- edição de ambiente;
- preservação do identificador do registro;
- persistência pelo serviço de estrutura do inventário;
- ordem visual dos botões: Excluir e, logo abaixo, Editar;
- verificação de sintaxe JavaScript;
- atualização do cache do PWA para v31.

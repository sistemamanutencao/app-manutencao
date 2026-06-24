# Relatório v32 — Inclusão e exclusão de itens no inventário

A v32 amplia o inventário para permitir o gerenciamento dos itens instalados em cada ambiente.

## Inclusão

No ambiente ou área interna, o botão **Adicionar item** permite:

1. selecionar um produto já existente no catálogo; ou
2. cadastrar um novo modelo, informando nome, marca, modelo/referência e observação.

A quantidade instalada é obrigatória e deve ser maior que zero. O sistema impede que o mesmo item seja incluído duas vezes no mesmo ambiente.

## Exclusão

Cada registro de item possui um botão **Excluir**. A exclusão remove somente a quantidade vinculada ao ambiente atual. A imagem de referência, o saldo em estoque e o cadastro do modelo permanecem no catálogo, evitando a perda de dados usados em outros ambientes.

## Edição de quantidade

Ao abrir a ficha de um item a partir de um ambiente, a quantidade instalada naquele local pode ser alterada. A mesma tela continua permitindo atualizar imagem e saldo de estoque.

## Persistência

- distribuição dos itens e quantidades: `inventarioEstrutura/principal`;
- catálogo de modelos cadastrados manualmente: campo `catalogoPersonalizado` do mesmo documento;
- imagem e saldo: coleção `inventarioItens`.

Todos esses dados são sincronizados pelo Cloud Firestore entre dispositivos autenticados com perfil Manutenção.

## Validações executadas

- inclusão de item existente;
- cadastro e inclusão de item personalizado;
- bloqueio de duplicidade no mesmo ambiente;
- alteração da quantidade instalada;
- exclusão do item apenas do ambiente atual;
- preservação do item personalizado no catálogo e na tela de estoque;
- teste visual em telas móvel e desktop;
- verificação de sintaxe de JavaScript;
- atualização do cache do PWA para v32.

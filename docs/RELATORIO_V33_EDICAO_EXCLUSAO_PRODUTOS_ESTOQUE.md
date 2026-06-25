# Relatório técnico — v33

## Escopo
Gerenciamento de produtos diretamente na aba Estoque.

## Comportamento de edição
A edição atualiza o cadastro compartilhado do produto. Nome, marca, modelo e observação passam a ser exibidos em todos os ambientes que usam o mesmo item. Saldo e imagem permanecem no documento `inventarioItens/{itemId}`.

## Comportamento de exclusão
A exclusão definitiva só é permitida quando não existem vínculos com ambientes. O sistema informa os locais que ainda utilizam o produto. Após a remoção dos vínculos, uma operação em lote do Firestore atualiza o catálogo e remove o documento do item, evitando imagens ou saldos órfãos.

## Compatibilidade
- Plano Firebase Spark.
- Regras do Firestore da v32.
- Migração transparente dos dados existentes.

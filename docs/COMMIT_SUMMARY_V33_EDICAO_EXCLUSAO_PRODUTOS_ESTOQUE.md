# Commit summary — v33

## Objetivo
Permitir editar e excluir produtos diretamente na aba Estoque do inventário.

## Alterações
- Botões Excluir e Editar em cada produto do estoque.
- Edição de nome, marca, modelo, observação, saldo e imagem.
- A nova imagem substitui a anterior no mesmo documento do Firestore.
- Exclusão bloqueada enquanto o produto estiver vinculado a ambientes.
- Exclusão definitiva remove cadastro, saldo e imagem do Firestore.
- Produtos originais da base podem ser ocultados por exclusão sincronizada, sem alterar o arquivo-base do catálogo.
- Cache PWA renovado para v33.

## Firebase
As regras da v32 continuam válidas. Não é necessário publicar novas regras.

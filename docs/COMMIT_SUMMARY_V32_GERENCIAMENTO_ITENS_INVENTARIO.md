# Commit Summary — v32

## Alteração principal

Adicionado gerenciamento de itens dentro de cada ambiente do inventário.

## Comportamento

- botão **Adicionar item** em ambientes e áreas internas;
- seleção de item já existente no catálogo;
- cadastro de novo modelo com nome, marca, modelo/referência e observação;
- definição da quantidade instalada no momento da inclusão;
- botão **Excluir** em cada item do ambiente;
- edição da quantidade instalada ao abrir a ficha do item;
- preservação de imagem e saldo quando um item é removido de apenas um ambiente;
- catálogo personalizado salvo no Cloud Firestore e sincronizado entre dispositivos;
- bloqueio de itens duplicados no mesmo ambiente.

## Arquivos alterados

- `js/inventario.js`
- `js/inventario-data.js`
- `js/firebase-service.js`
- `css/inventario.css`
- `firestore.rules`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`

## Publicação

As regras do Firestore foram ampliadas para aceitar o campo `catalogoPersonalizado` no documento `inventarioEstrutura/principal`. Publique o arquivo `firestore.rules` desta versão antes do teste.

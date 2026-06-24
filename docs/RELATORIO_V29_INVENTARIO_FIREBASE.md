# Relatório v29 — Persistência do inventário no Firebase

## Escopo

Esta versão sincroniza entre dispositivos apenas os dados solicitados: imagem de referência e quantidade em estoque de cada item.

## Coleção criada

`inventarioItens/{itemId}`

Campos:

- `estoque`: inteiro não negativo ou nulo;
- `imagem`: imagem JPEG comprimida em Data URL;
- `atualizadoEm`: timestamp do servidor;
- `atualizadoPorUid`;
- `atualizadoPorNome`.

## Segurança

Leitura, criação, atualização e exclusão são restritas ao perfil `manutencao` pelas regras do Firestore.

## Observação

A estrutura criada na v28 (andares, ambientes e áreas internas personalizados) continua salva localmente. Sua sincronização poderá ser feita em uma etapa posterior.

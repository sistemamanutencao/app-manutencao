# Relatório v30 — Estrutura do inventário no Firebase

A v30 amplia a persistência remota do inventário. Além da imagem de referência e do saldo, passam a ser armazenados no Firestore:

- andares;
- ambientes;
- ambientes agrupadores;
- áreas internas;
- exclusões realizadas na estrutura.

## Migração
Quando o documento remoto ainda não existe, o aplicativo utiliza como origem a estrutura armazenada no navegador. Isso preserva andares e ambientes adicionados manualmente nas versões anteriores. Na ausência de personalizações locais, a estrutura padrão do aplicativo é enviada ao Firestore.

## Documento remoto

```text
inventarioEstrutura/principal
  andares: []
  versao: 1
  atualizadoEm
  atualizadoPorUid
  atualizadoPorNome
```

## Permissões
Somente usuários autenticados com perfil `manutencao` podem ler ou alterar a estrutura do inventário.

## Observação operacional
As regras da v30 precisam ser publicadas antes do primeiro teste. Sem a nova regra para `inventarioEstrutura`, a estrutura continuará visível pelo cache local, mas inclusões e exclusões não serão gravadas no Firebase.

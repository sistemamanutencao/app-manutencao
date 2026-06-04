# Correção de notificações do Firebase

Esta versão mantém o projeto compatível com o plano Firebase Spark e corrige a falha:

> Não foi possível carregar as notificações do Firebase.

## Ajustes realizados

- Atualizado `firestore.rules` para permitir leitura da coleção `notificacoes` a usuários autenticados.
- Mantidas restrições de criação, atualização e exclusão.
- Corrigido o listener de notificações para não quebrar quando o usuário ainda não estiver totalmente carregado.
- Gerência agora busca notificações destinadas ao perfil `gerencia`.
- Atualizado cache do service worker para forçar atualização do PWA.

## Publicação

Use apenas:

```powershell
firebase deploy --only firestore:rules,hosting
```

Não use Cloud Functions neste projeto Spark.

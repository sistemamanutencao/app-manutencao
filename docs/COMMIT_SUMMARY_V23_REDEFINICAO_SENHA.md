# Commit summary — v23 redefinição de senha

## Commit sugerido

```txt
feat: adiciona redefinição de senha pelo Firebase Auth
```

## Resumo

- Adiciona botão **Esqueci minha senha** na tela de login.
- Integra o botão ao padrão existente de `data-action` e mapas de eventos.
- Cria função de serviço para `sendPasswordResetEmail` via Firebase Auth.
- Adiciona validação de e-mail e feedback ao usuário.
- Atualiza cache PWA para `app-manutencao-v23-redefinicao-senha`.

## Arquivos alterados

```txt
index.html
css/perfil.css
js/firebase-service.js
js/perfil.js
js/event-action-maps.js
service-worker.js
docs/CONTROLE_DE_VERSOES.md
docs/RELATORIO_V23_REDEFINICAO_SENHA.md
docs/COMMIT_SUMMARY_V23_REDEFINICAO_SENHA.md
```

## Observação

Não houve alteração em `firestore.rules`.

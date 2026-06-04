# Commit sugerido

```bash
git add .
git commit -m "Implementa login por convite mantendo perfis operacionais"
git push
```

## Escopo da alteração

Esta versão mantém os perfis `colaborador`, `gerencia`, `manutencao` e `administrador`, mas elimina o acesso antigo por nome/setor.

Todos os usuários agora precisam acessar com e-mail e senha criados a partir do link de ativação enviado pelo Firebase/Cloud Functions.

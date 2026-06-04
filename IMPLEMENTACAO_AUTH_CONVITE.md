# Implementação - autenticação por convite

## Decisão de regra de negócio

O sistema mantém quatro perfis:

- `colaborador`
- `gerencia`
- `manutencao`
- `administrador`

A mudança aplicada não elimina os perfis operacionais. Ela elimina apenas o acesso antigo por nome e setor.

## Fluxo novo

```text
Administrador cadastra usuário
Cloud Function cria usuário no Firebase Authentication
Cloud Function grava usuarios/{uid}
Cloud Function gera link de criação/redefinição de senha
Serviço de e-mail envia convite
Usuário cria sua senha
Usuário acessa com e-mail e senha
App carrega usuarios/{uid}
App aplica permissões conforme perfil
```

## Perfis

### colaborador

Pode abrir OS e acompanhar somente as próprias OS.

### gerencia

Pode abrir OS e acompanhar OS de todos os colaboradores, sem assumir, finalizar ou alterar status técnico.

### manutencao

Possui permissões operacionais da manutenção: painel, diagnóstico, preventivas, ativos, assumir OS, alterar status e finalizar.

### administrador

Gerencia usuários e convites. Deve existir para cadastrar novos usuários.

## Primeiro administrador

Antes de usar a tela de cadastro de usuários, crie manualmente uma conta no Firebase Authentication e um documento no Firestore:

```text
usuarios/{uid-do-admin}
```

Exemplo:

```json
{
  "uid": "UID_DO_AUTH",
  "nome": "Administrador",
  "email": "admin@senac.com.br",
  "setor": "Administração",
  "cargo": "Administrador do sistema",
  "perfil": "administrador",
  "ativo": true,
  "primeiroAcesso": false
}
```

## Cloud Functions

Funções incluídas:

- `criarUsuario`
- `reenviarConvite`
- `alterarPerfil`
- `desativarUsuario`
- `reativarUsuario`

Configure o segredo da Resend antes do deploy:

```bash
firebase functions:secrets:set RESEND_API_KEY
```

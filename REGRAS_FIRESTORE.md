# Regras do Firestore - versão com login por e-mail e senha

Esta versão não utiliza mais autenticação anônima nem entrada por nome/setor.
Todos os usuários precisam existir em:

```text
Authentication
usuarios/{uid}
```

Perfis ativos:

```text
colaborador
 gerencia
manutencao
administrador
```

## Resumo das permissões

### colaborador

- Pode abrir OS.
- Pode visualizar e cancelar apenas as próprias OS enquanto estiverem abertas.
- Entra sempre com e-mail e senha.

### gerencia

- Pode abrir OS.
- Pode visualizar OS de todos os colaboradores.
- Não possui ações operacionais da manutenção.
- Entra sempre com e-mail e senha.

### manutencao

- Pode visualizar todas as OS.
- Pode assumir, alterar status, finalizar e excluir OS.
- Pode gerenciar ativos, preventivas, comunicados e diagnóstico inicial.
- Entra sempre com e-mail e senha.

### administrador

- Pode cadastrar usuários por convite.
- Pode reenviar convite, alterar perfil, desativar e reativar usuários.
- Deve ser criado manualmente no primeiro acesso do sistema.

## Coleção usuarios

Cada conta deve possuir um documento em:

```text
usuarios/{uid}
```

Exemplo:

```json
{
  "uid": "UID_DO_AUTH",
  "nome": "Nome do usuário",
  "email": "usuario@senac.com",
  "setor": "Setor",
  "cargo": "Cargo",
  "perfil": "colaborador",
  "ativo": true,
  "primeiroAcesso": true
}
```

## Observação sobre coleção colaboradores

A coleção `colaboradores` fica apenas como compatibilidade histórica. Novos registros devem usar `usuarios/{uid}` e OS vinculadas por `criadoPorUid` / `solicitanteId`.

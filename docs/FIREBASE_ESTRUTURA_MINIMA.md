# Firebase — Estrutura Mínima Esperada

Este documento descreve a estrutura mínima que o app espera encontrar no Firebase/Firestore.

## Authentication

Os usuários que acessam por login e senha precisam existir em:

```txt
Firebase Authentication > Users
```

Cada usuário possui um `User UID`. Esse UID deve ser usado como ID do documento correspondente em `usuarios`.

## Coleção `usuarios`

Caminho:

```txt
usuarios/{uid}
```

O ID do documento deve ser exatamente o UID do usuário no Authentication.

### Manutenção

```txt
ativo: true
perfil: manutencao
nome: Manutenção
email: email-do-login
setor: Manutenção
unidade: Senac Campo Mourão
```

### Gerência

```txt
ativo: true
perfil: gerencia
nome: Gerência
email: email-do-login-da-gerencia
setor: Gerência
unidade: Senac Campo Mourão
```

### Colaborador

```txt
ativo: true
perfil: colaborador
nome: Nome do colaborador
email: email-do-login-ou-identificação
setor: Setor do colaborador
unidade: Senac Campo Mourão
```

## Campos críticos

- `ativo` deve ser booleano `true`, não texto `"true"`.
- `perfil` deve ser string em minúsculo e sem acento.
- Valores esperados de `perfil`:

```txt
manutencao
gerencia
colaborador
```

## Coleções principais

As coleções podem ser criadas automaticamente pelo app ou manualmente conforme o uso, dependendo das regras atuais e do fluxo da aplicação.

Coleções esperadas:

```txt
usuarios
chamados
notificacoes
diagnosticos
preventivas
```

## Erros comuns

### `permission-denied`

Causas prováveis:

- Rules incompatíveis com o código atual;
- usuário sem documento em `usuarios/{uid}`;
- documento usando ID diferente do UID;
- campo `ativo` ausente ou como texto;
- campo `perfil` com acento, maiúscula ou valor incorreto.

### Diagnóstico não carrega

Verificar:

- perfil do usuário logado;
- permissão da coleção de diagnóstico;
- Rules publicadas;
- Console do navegador.

### Notificações não carregam

Verificar:

- Rules;
- usuário autenticado;
- coleção `notificacoes`;
- filtros por destinatário/perfil, se houver.

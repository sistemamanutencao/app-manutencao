# Correção — perfil com acento/maiúscula nas regras do Firestore

## Sintoma provável

O app libera a interface para manutenção ou gerência, mas o Firestore retorna erro de permissão ao carregar dados como:

- diagnóstico inicial;
- notificações;
- chamados;
- coleções operacionais.

## Causa

O JavaScript do app normaliza perfis como `manutenção`, `Manutenção` e `MANUTENÇÃO` para `manutencao`.

As regras do Firestore, porém, comparavam o texto cru apenas com:

- `manutencao`
- `gerencia`

Assim, um usuário cadastrado no Firestore com `perfil: "manutenção"` podia ser reconhecido pela interface, mas bloqueado pelo banco.

## Correção aplicada

O arquivo `firestore.rules` agora aceita variações comuns para manutenção e gerência:

- `manutencao`
- `manutenção`
- `Manutencao`
- `Manutenção`
- `MANUTENCAO`
- `MANUTENÇÃO`
- `gerencia`
- `gerência`
- `Gerencia`
- `Gerência`
- `GERENCIA`
- `GERÊNCIA`

## Recomendação de cadastro

Mesmo com a correção, o padrão recomendado nos documentos da coleção `usuarios` continua sendo:

```json
{
  "perfil": "manutencao",
  "ativo": true
}
```

ou

```json
{
  "perfil": "gerencia",
  "ativo": true
}
```

Sem acento, em minúsculas.

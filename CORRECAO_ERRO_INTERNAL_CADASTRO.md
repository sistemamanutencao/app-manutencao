# Correção para erro "internal" no cadastro de usuários

O erro `internal` ocorria principalmente quando a Cloud Function criava o usuário, mas o envio do e-mail pelo Resend falhava.

Nesta versão, a falha de envio não cancela mais o cadastro. A Function retorna:

- `conviteEnviado: false`
- `avisoEnvio`
- `linkSenha`

Assim, o administrador pode copiar o link manualmente pelo console do navegador ou corrigir a configuração do Resend e usar **Reenviar convite**.

## Verificar no Firebase

Execute:

```bash
firebase functions:log --only criarUsuario
```

Verifique especialmente:

- `RESEND_API_KEY` configurada
- remetente `EMAIL_REMETENTE` validado no Resend
- Cloud Functions implantadas
- usuário administrador com `perfil: "administrador"` e `ativo: true` em `usuarios/{uid}`

## Secrets

```bash
firebase functions:secrets:set RESEND_API_KEY
firebase deploy --only functions
```

Se usar domínio próprio no Resend, configure também o remetente permitido no código ou por variável de ambiente.

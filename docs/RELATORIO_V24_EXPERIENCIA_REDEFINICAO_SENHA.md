# Relatório v24 — Experiência visual de redefinição de senha

## Objetivo

Melhorar a experiência de solicitação de redefinição de senha dentro do app, mantendo o envio nativo pelo Firebase Authentication e evitando dependência de template de e-mail, SMTP, Cloud Functions ou plano Blaze.

## Escopo entregue

- Criação de tela visual interna para **Esqueci minha senha** na área de Perfil/login.
- Inclusão de avatar visual preocupado, coerente com a mensagem de senha esquecida.
- Campo específico para e-mail cadastrado.
- Botão **Enviar link de redefinição**.
- Mensagens visuais de sucesso e erro sem depender apenas de `alert`.
- Botão **Voltar para o login**.
- Integração ao padrão existente de `data-action` e `event-action-maps.js`.
- Atualização do cache PWA para forçar renovação dos arquivos alterados.

## Arquivos alterados

- `index.html`
- `css/perfil.css`
- `js/perfil.js`
- `js/event-action-maps.js`
- `service-worker.js`
- `img/avatar-redefinicao-senha.png`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/RELATORIO_V24_EXPERIENCIA_REDEFINICAO_SENHA.md`
- `docs/COMMIT_SUMMARY_V24_EXPERIENCIA_REDEFINICAO_SENHA.md`

## Regras de negócio

- O e-mail padrão do Firebase continua sendo usado.
- O template de e-mail do Firebase não foi alterado.
- SMTP não foi ativado.
- O recurso só funciona para contas existentes no Firebase Authentication com provedor **Email/Password**.
- Login anônimo não possui e-mail para redefinição.
- A alteração não muda UID, perfil, permissões, OS, histórico, SLA, diagnóstico, preventivas ou comunicados.

## Firestore Rules

Não houve alteração em `firestore.rules`.

## Impacto por perfil

### Manutenção

Pode usar a tela visual para solicitar link de redefinição pelo e-mail autorizado.

### Gerência

Pode usar a tela visual para solicitar link de redefinição pelo e-mail autorizado.

### Colaborador com primeiro acesso concluído

Pode usar a tela visual para solicitar link de redefinição pelo e-mail autorizado.

### Colaborador anônimo temporário

Não se aplica, porque login anônimo não possui e-mail para redefinição.

## Teste recomendado no VS Code

1. Abrir o projeto com Live Server.
2. Ir para **Perfil**.
3. Clicar em **Esqueci minha senha**.
4. Confirmar exibição da tela visual com avatar.
5. Clicar em **Voltar para o login** e confirmar retorno ao formulário anterior.
6. Reabrir a tela de redefinição.
7. Informar um e-mail existente no Firebase Authentication.
8. Clicar em **Enviar link de redefinição**.
9. Confirmar mensagem visual de sucesso.
10. Verificar caixa de entrada, spam ou quarentena.
11. Redefinir a senha pelo link recebido.
12. Voltar ao app e testar login normalmente.

## Rollback

Se houver problema visual ou funcional, voltar para `app-manutencao-v23-redefinicao-senha(2).zip` ou para a última versão funcional aprovada.

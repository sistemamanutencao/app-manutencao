# Relatório v23 — Redefinição de senha pelo app

## Objetivo

Adicionar, na tela de login do app, o fluxo **Esqueci minha senha** para contas Firebase Authentication com e-mail e senha.

## Escopo entregue

- Botão **Esqueci minha senha** abaixo do botão **Entrar com e-mail**.
- Envio de e-mail de redefinição usando Firebase Authentication.
- Validação para exigir e-mail antes do envio.
- Feedback ao usuário em caso de sucesso ou erro.
- Integração ao padrão existente de eventos por `data-action`.
- Renovação do cache PWA para forçar atualização dos arquivos alterados.

## Arquivos alterados

- `index.html`
- `css/perfil.css`
- `js/firebase-service.js`
- `js/perfil.js`
- `js/event-action-maps.js`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/RELATORIO_V23_REDEFINICAO_SENHA.md`
- `docs/COMMIT_SUMMARY_V23_REDEFINICAO_SENHA.md`

## Regras de negócio

- O recurso atende apenas contas existentes no Firebase Authentication com provedor **Email/Password**.
- Usuários anônimos não recebem redefinição de senha porque não possuem e-mail autenticado.
- O envio do e-mail não altera UID, perfil, permissões, histórico, OS, SLA ou dados do Firestore.
- O usuário precisa informar o e-mail no campo de login antes de solicitar a redefinição.

## Firestore Rules

Não houve alteração em `firestore.rules`.

## Impacto por perfil

### Manutenção

Pode solicitar redefinição de senha informando o e-mail de login autorizado.

### Gerência

Pode solicitar redefinição de senha informando o e-mail de login autorizado.

### Colaborador com primeiro acesso concluído

Pode solicitar redefinição de senha informando o e-mail usado no primeiro acesso.

### Colaborador anônimo temporário

Não se aplica. Login anônimo não possui e-mail para redefinição.

## Teste recomendado no VS Code

1. Abrir o projeto com Live Server.
2. Na tela Perfil/login, informar um e-mail existente no Firebase Authentication.
3. Clicar em **Esqueci minha senha**.
4. Verificar se aparece mensagem de envio concluído.
5. Confirmar recebimento do e-mail na caixa de entrada/spam/quarentena.
6. Redefinir a senha pelo link recebido.
7. Voltar ao app e entrar com a nova senha.
8. Validar acesso conforme perfil:
   - manutenção: Painel, Diagnóstico, Preventivas e OS;
   - gerência: acompanhamento sem ações técnicas indevidas;
   - colaborador: abertura e acompanhamento dos próprios chamados.

## Rollback

Se a alteração causar problema visual ou funcional, voltar para o ZIP anterior `app-manutencao-v22-ajuste-link(2).zip` ou para a última versão funcional aprovada.

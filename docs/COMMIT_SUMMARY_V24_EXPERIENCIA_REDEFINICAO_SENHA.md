# Commit summary — v24 experiência visual de redefinição de senha

## Commit sugerido

```txt
feat: melhora experiência visual de redefinição de senha
```

## Resumo

- Cria tela visual interna para **Esqueci minha senha** na área Perfil/login.
- Adiciona avatar visual de apoio para o fluxo de senha esquecida.
- Mantém envio do link pelo Firebase Authentication.
- Adiciona feedback visual de sucesso e erro.
- Adiciona botão para voltar ao login.
- Integra novas ações ao padrão `data-action`/`event-action-maps.js`.
- Atualiza cache PWA para `app-manutencao-v24-experiencia-redefinicao`.

## Arquivos alterados

```txt
index.html
css/perfil.css
js/perfil.js
js/event-action-maps.js
service-worker.js
img/avatar-redefinicao-senha.png
docs/CONTROLE_DE_VERSOES.md
docs/RELATORIO_V24_EXPERIENCIA_REDEFINICAO_SENHA.md
docs/COMMIT_SUMMARY_V24_EXPERIENCIA_REDEFINICAO_SENHA.md
```

## Observações

- Não houve alteração em `firestore.rules`.
- Não houve ativação de SMTP.
- O template de e-mail padrão do Firebase não foi alterado.

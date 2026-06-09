# Relatório v24 — Ajuste da tela de redefinição

## Objetivo

Refinar a tela visual de solicitação de redefinição de senha da v24 para melhor encaixe mobile, removendo elementos indesejados e corrigindo o enquadramento da imagem.

## Escopo entregue

- Remoção da linha divisória com texto "ou".
- Remoção do subtítulo "Acesso ao sistema" do cabeçalho visual.
- Ajuste do cabeçalho com nova imagem de logo sem subtítulo.
- Ajuste do layout da experiência visual de redefinição.
- Ajuste do bloco hero para evitar corte excessivo do avatar.
- Compactação de espaçamentos e tipografia para melhor encaixe vertical.
- Atualização do cache PWA.

## Arquivos alterados

- `index.html`
- `css/perfil.css`
- `img/engrenagem-painel-login-v25.png`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/RELATORIO_V24_AJUSTE_TELA_REDEFINICAO.md`
- `docs/COMMIT_SUMMARY_V24_AJUSTE_TELA_REDEFINICAO.md`

## Regras / impacto

- Não houve alteração em `firestore.rules`.
- Não houve alteração na lógica de envio de redefinição de senha.
- O ajuste é visual e estrutural da tela de perfil/login e da experiência visual de redefinição.

## Teste recomendado no VS Code

1. Abrir com Live Server.
2. Acessar a aba Perfil.
3. Clicar em `Esqueci minha senha`.
4. Confirmar que a linha `ou` não aparece.
5. Confirmar que o cabeçalho não exibe `Acesso ao sistema`.
6. Confirmar que o avatar aparece melhor enquadrado.
7. Confirmar que os campos, botão e mensagens cabem melhor na tela.
8. Testar envio do link de redefinição.
9. Testar botão `Voltar para o login`.

## Rollback

Se necessário, voltar para `app-manutencao-v23-redefinicao-senha.zip` ou para a última v24 funcional aprovada.

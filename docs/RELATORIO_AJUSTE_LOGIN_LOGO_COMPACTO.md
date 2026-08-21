# Relatório — ajuste visual da tela de login

## Objetivo

Aplicar ajustes exclusivamente visuais na tela de login, mantendo o funcionamento existente.

## Alterações realizadas

- A imagem `img/engrenagem-painel-login.png` foi ajustada para usar fundo transparente nos pixels claros, evitando aparência de bloco separado sobre a tela.
- O espaçamento vertical do divisor `ou` entre os blocos **Acesso do colaborador** e **Acesso autorizado** foi reduzido.
- A tela de login recebeu ajustes compactos de espaçamento, padding, tamanho da logo, campos e botões para melhorar o encaixe em telas menores.

## Arquivos alterados

- `img/engrenagem-painel-login.png`
- `css/perfil.css`
- `docs/RELATORIO_AJUSTE_LOGIN_LOGO_COMPACTO.md`

## Arquivos e áreas não alteradas

- Firebase Auth
- Firestore Rules
- Login por colaborador
- Login por e-mail
- Redirecionamento por perfil
- OS
- Diagnóstico
- Notificações
- Preventivas
- Permissões de manutenção, gerência e colaborador

## Teste recomendado no VS Code

1. Abrir a pasta do projeto no VS Code.
2. Executar com Live Server.
3. Visualizar a aba Perfil/Login no modo responsivo de celular.
4. Confirmar se a tela aparece sem necessidade de rolagem nas principais alturas de celular.
5. Testar login como colaborador.
6. Testar login por e-mail com manutenção.
7. Testar login por e-mail com gerência.

## Rollback

Se o ajuste visual não ficar adequado, restaurar estes arquivos a partir da versão anterior:

- `css/perfil.css`
- `img/engrenagem-painel-login.png`

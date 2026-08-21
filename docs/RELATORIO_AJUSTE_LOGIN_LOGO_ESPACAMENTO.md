# Relatório — Ajuste visual da tela de login

## Objetivo

Aplicar alteração visual controlada na tela de login da base limpa v9.

## Alterações executadas

1. Inclusão da logo `img/engrenagem-painel-login.png` no cabeçalho da tela de login.
2. Redução do espaçamento vertical do divisor `ou` entre:
   - Acesso do colaborador;
   - Acesso autorizado.
3. Redução discreta do tamanho visual do círculo do divisor para compactar melhor a tela em dispositivos móveis.

## Arquivos alterados

- `index.html`
- `css/perfil.css`
- `img/engrenagem-painel-login.png`

## Arquivos adicionados

- `docs/RELATORIO_AJUSTE_LOGIN_LOGO_ESPACAMENTO.md`

## Itens preservados

Não foram alterados:

- Firebase Auth;
- login como colaborador;
- login por e-mail;
- IDs dos campos e botões;
- `data-action` dos botões;
- redirecionamento por perfil;
- Firestore Rules;
- OS;
- diagnóstico;
- notificações;
- permissões de manutenção, gerência ou colaborador.

## Teste recomendado no VS Code

1. Abrir o projeto com Live Server.
2. Conferir se a logo aparece no topo da tela de login.
3. Conferir se o espaço entre o card do colaborador, o divisor `ou` e o card de acesso autorizado ficou menor.
4. Testar entrada como colaborador.
5. Testar entrada com usuário de manutenção.
6. Testar entrada com usuário de gerência.
7. Confirmar que os redirecionamentos e permissões continuam corretos.

## Rollback

Se houver falha visual ou funcional, restaurar estes arquivos a partir da v9 anterior:

- `index.html`
- `css/perfil.css`

E remover, se necessário:

- `img/engrenagem-painel-login.png`

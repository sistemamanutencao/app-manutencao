# Relatório — Ajuste de contraste e cores da tela de login

## Objetivo
Melhorar a visibilidade das letras e deixar as cores da tela de login mais vívidas, sem trocar fonte e sem alterar funcionamento.

## Alterações realizadas
- Reforço das cores da imagem da logo/cabeçalho.
- Manutenção do fundo transparente da logo.
- Escurecimento controlado dos textos da tela de login.
- Melhoria de contraste dos placeholders dos campos.
- Reforço visual dos botões azul e laranja.
- Reforço discreto das linhas do divisor "ou".

## Arquivos alterados
- `img/engrenagem-painel-login.png`
- `css/perfil.css`

## Arquivos adicionados
- `docs/RELATORIO_AJUSTE_LOGIN_CONTRASTE_CORES.md`

## Itens preservados
- IDs dos campos e botões.
- `data-action` dos botões.
- Fluxo de login do colaborador.
- Fluxo de login por e-mail.
- Firebase Auth.
- Firestore.
- Rules.
- Perfis e permissões.
- OS, diagnóstico, notificações, painel da manutenção e preventivas.

## Teste recomendado
1. Abrir o projeto no VS Code.
2. Executar com Live Server.
3. Conferir a tela de login em modo celular e desktop.
4. Validar se a logo e os textos ficaram mais legíveis.
5. Testar entrada como colaborador.
6. Testar entrada como manutenção.
7. Testar entrada como gerência.

## Rollback
Restaurar os arquivos `img/engrenagem-painel-login.png` e `css/perfil.css` a partir da versão v11, se o resultado visual não for aprovado.

# Commit Summary — V24 Splash com fundo da logo

## Objetivo
Ajustar a abertura do PWA instalado para eliminar o fundo branco inicial e aplicar um fundo escuro/dourado compatível com a nova logo de manutenção.

## Alterações realizadas
- Atualizado `manifest.json` com `background_color` e `theme_color` em tom escuro compatível com a logo.
- Atualizado `meta theme-color` do `index.html`.
- Alterado o `apple-mobile-web-app-status-bar-style` para `black-translucent`.
- Criada uma splash de abertura em tela cheia com a logo `img/logo-manutencao-dourado.png`.
- Adicionado fundo em degradê escuro/dourado no carregamento inicial.
- Ajustado o fundo base do shell do app no `css/base.css` para combinar com a nova identidade visual.
- Atualizado o cache do `service-worker.js` para forçar a renovação dos arquivos em dispositivos que já instalaram o PWA.

## Arquivos alterados
- `manifest.json`
- `index.html`
- `css/base.css`
- `service-worker.js`
- `docs/COMMIT_SUMMARY_V24_SPLASH_FUNDO_LOGO.md`

## Impacto
- Sem impacto em Firebase, Firestore, permissões ou regras.
- Mudança restrita à abertura visual do PWA e ao fundo do shell do app.

## Rollback
Restaurar os arquivos acima para a versão anterior `app-manutencao-v24-logo-dourado-manutencao.zip`.

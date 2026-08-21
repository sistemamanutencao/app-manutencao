# Commit Summary — V24 Fundo escuro nas abas

## Objetivo
Aplicar fundo escuro/dourado apenas no fundo das abas do PWA, mantendo cards, OS, formulários e caixas de seleção claros para preservar legibilidade.

## Alterações realizadas
- Alterado o fundo de `.phone-screen` para o degradê escuro/dourado da identidade visual da nova logo.
- Mantidas superfícies internas claras: cards, formulários, selects, caixas de OS, preventivas e diagnóstico.
- Ajustados títulos e subtítulos que ficam diretamente sobre o fundo escuro para branco/dourado suave.
- Reforçada a sombra dos cards para melhorar separação visual entre fundo e conteúdo.
- Atualizado o cache do service worker para forçar carregamento da nova interface.

## Arquivos alterados
- `css/base.css`
- `css/layout.css`
- `service-worker.js`
- `docs/COMMIT_SUMMARY_V24_FUNDO_ABAS_ESCURO.md`

## Não alterado
- `firestore.rules`
- Firebase Authentication
- estrutura das coleções
- permissões dos perfis
- lógica de OS, preventivas ou diagnóstico

## Rollback
Restaurar os arquivos acima a partir da versão `app-manutencao-v24-splash-fundo-logo.zip`.

# Commit summary — v22 ajuste de URL GitHub Pages

## Título sugerido

`chore: consolida v22 com ajuste de URL GitHub Pages`

## Resumo

- Consolidada a v22 após mudança do username GitHub para `sistemamanutencao`.
- Confirmado que não havia referências antigas a `jeffersongomes31` no código.
- Mantidos caminhos relativos em `manifest.json`, `index.html`, `js/service-worker-register.js` e `service-worker.js`.
- Atualizado o `CACHE_NAME` do PWA para `app-manutencao-v22-url-sistemamanutencao`.
- Adicionada documentação técnica da v22 na pasta `docs/`.

## Impacto

- Não altera Firestore Rules.
- Não altera regras de negócio.
- Não altera permissões de perfis.
- Não altera login, OS, diagnóstico, preventivas, painel ou notificações.
- Ajuda a reduzir risco de cache antigo após mudança para `https://sistemamanutencao.github.io/app-manutencao/`.

## Teste recomendado

1. Publicar a v22 no GitHub.
2. Aguardar o GitHub Pages concluir o deploy.
3. Abrir `https://sistemamanutencao.github.io/app-manutencao/` em aba anônima.
4. Testar login e navegação por perfis.
5. Em celulares com PWA instalado, fechar e abrir novamente; se necessário, remover o atalho antigo e instalar novamente.

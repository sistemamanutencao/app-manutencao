# Relatório técnico — v22 ajuste de URL GitHub Pages

## Contexto

Após a alteração do username do GitHub para `sistemamanutencao`, esta versão consolida os ajustes de referência e cache do PWA para uso da nova URL oficial do projeto.

## URL oficial esperada

`https://sistemamanutencao.github.io/app-manutencao/`

## Escopo da v22

- Revisar referências ao username antigo `jeffersongomes31`.
- Confirmar ausência de URLs absolutas antigas do GitHub Pages.
- Manter caminhos relativos nos arquivos críticos do PWA.
- Atualizar o nome do cache do Service Worker para forçar renovação nos dispositivos.
- Preservar regras de negócio, perfis, permissões, OS, diagnóstico, preventivas, painel e notificações.

## Verificações realizadas

Foram pesquisadas referências a:

- `jeffersongomes31`
- `jeffersongomes31.github.io`
- `github.io`
- URLs absolutas antigas do GitHub Pages

## Resultado da verificação

Não foram encontradas referências antigas ao username `jeffersongomes31` nos arquivos do projeto.

O projeto mantém caminhos relativos em pontos críticos:

- `manifest.json`: `start_url` relativo (`./index.html`)
- `index.html`: manifesto referenciado como `manifest.json`
- `js/service-worker-register.js`: registro relativo (`./service-worker.js`)
- `service-worker.js`: arquivos de cache com caminhos relativos (`./...`)

## Alteração aplicada

Arquivo alterado:

- `service-worker.js`

Alteração realizada:

- `CACHE_NAME` atualizado para `app-manutencao-v22-url-sistemamanutencao`.

Objetivo:

- Forçar navegadores e PWAs já instalados a descartarem caches antigos associados à versão anterior.

## Arquivos de documentação atualizados

- `docs/RELATORIO_V22_URL_SISTEMAMANUTENCAO.md`
- `docs/COMMIT_SUMMARY_V22_URL_SISTEMAMANUTENCAO.md`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/PLANO_ROLLBACK.md`

## Arquivos sensíveis preservados sem alteração funcional

Não foram alterados:

- `firestore.rules`
- login
- perfis
- permissões
- OS
- diagnóstico
- preventivas
- painel
- notificações
- regras de negócio

## Checklist após publicar

1. Publicar o conteúdo da v22 no repositório `app-manutencao`.
2. Aguardar o GitHub Pages concluir o deploy.
3. Abrir em aba anônima: `https://sistemamanutencao.github.io/app-manutencao/`.
4. Confirmar que layout e navegação carregam corretamente.
5. Testar login manutenção.
6. Testar Painel, OS, Preventivas e Diagnóstico Inicial.
7. Testar gerência e colaborador.
8. Confirmar no Firebase Authentication > Settings > Authorized domains: `sistemamanutencao.github.io`.
9. Confirmar no GitHub Desktop o remote: `https://github.com/sistemamanutencao/app-manutencao.git`.

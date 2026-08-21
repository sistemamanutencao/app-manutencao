# Relatório — Etapa 5: organização conservadora do index.html

Base utilizada: `app-manutencao-base-limpa-eventos-v5.zip`.

## Objetivo

Reduzir a complexidade visual do `index.html` sem dividir o arquivo em fragments, sem alterar IDs, classes, ordem dos módulos, lógica de negócio, Firebase, Firestore ou permissões.

## Alterações aplicadas

- padronização de comentários estruturais no `index.html`;
- identificação explícita das áreas principais:
  - estrutura principal do app;
  - botão global de notificações;
  - páginas principais;
  - navegação inferior;
  - dependências externas;
  - constantes globais;
  - módulos JavaScript do app;
- remoção do script inline de registro do Service Worker;
- criação de `js/service-worker-register.js` para centralizar o registro PWA.

## Arquivos alterados

```txt
index.html
js/service-worker-register.js
docs/PLANO_ORGANIZACAO_INCREMENTAL.md
docs/RELATORIO_ETAPA_5_INDEX_HTML.md
```

## O que não foi alterado

```txt
firestore.rules
configuração Firebase
coleções do Firestore
campos dos documentos
perfis
permissões
IDs do HTML
classes CSS
nomes de funções
ordem dos scripts principais
fluxo de login
fluxo de criação de OS
diagnóstico inicial
preventivas
notificações
```

## Decisão técnica

Não foi feita quebra do `index.html` em componentes/fragments.

Motivo: o projeto é estático, sem etapa de build. Dividir o HTML exigiria carregamento dinâmico de fragments ou adoção de bundler, o que aumentaria o risco de quebrar navegação, IDs usados por JavaScript e inicializações de módulos.

## Risco da alteração

Baixo a médio.

O único comportamento funcional movido foi o registro do Service Worker, que saiu de script inline para um arquivo JS carregado no final da página.

## Testes obrigatórios no VS Code

1. Abrir com Live Server.
2. Verificar no console se não há erro novo.
3. Confirmar que o Service Worker não gera erro crítico.
4. Testar navegação inferior.
5. Executar checklist dos perfis manutenção, gerência e colaborador.

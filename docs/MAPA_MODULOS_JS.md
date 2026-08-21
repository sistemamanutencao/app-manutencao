# Mapa dos módulos JavaScript

Este documento registra a responsabilidade principal dos arquivos JavaScript do app.

## Núcleo do app

```txt
js/app.js
```
Inicialização geral, fluxo principal de carregamento e integração entre estado, autenticação e telas.

```txt
js/state.js
```
Estado global do app. Deve concentrar variáveis globais compartilhadas.

```txt
js/firebase-service.js
```
Operações de acesso ao Firebase/Firestore. Deve continuar sendo tratado como módulo sensível.

```txt
js/auth-permissions.js
```
Autenticação, perfil do usuário e permissões. Qualquer alteração aqui exige checklist completo dos três perfis.

## Interface e navegação

```txt
js/navigation.js
```
Troca de páginas/telas internas do app.

```txt
js/ui-feedback.js
```
Mensagens visuais, feedbacks, loaders e elementos de apoio visual.

```txt
js/event-action-maps.js
```
Mapas de ações acionadas por botões, campos e elementos dinâmicos.

```txt
js/event-bindings.js
```
Delegação de eventos. Escuta cliques, mudanças, digitação e formulários, encaminhando para os mapas de ações.

```txt
js/service-worker-register.js
```
Registro do Service Worker.

## Chamados / OS

```txt
js/chamados.js
```
Coordenação geral de chamados.

```txt
js/chamados-form.js
```
Formulário de abertura/criação de chamados.

```txt
js/chamados-render.js
```
Renderização visual de listas/cards de chamados.

```txt
js/modal-chamado.js
```
Detalhes, histórico, fotos e ações relacionadas ao modal de chamado.

## Painel de manutenção

```txt
js/painel.js
```
Coordenação geral do painel.

```txt
js/painel-cards.js
```
Cards/listagens operacionais do painel.

```txt
js/painel-indicadores.js
```
Indicadores, métricas e cálculos de painel.

```txt
js/painel-status.js
```
Fluxo de status técnico da OS.

## Módulos operacionais

```txt
js/diagnostico.js
```
Diagnóstico Inicial da Unidade. Módulo exclusivo da manutenção.

```txt
js/preventivas.js
```
Planos e OS preventivas. Módulo exclusivo da manutenção.

```txt
js/ativos.js
```
Cadastro, histórico e ações de ativos patrimoniais.

```txt
js/leitor-qr.js
```
Leitura de QR Code e integração com ativos.

```txt
js/notificacoes.js
```
Painel e ações de notificações.

```txt
js/comunicados.js
```
Comunicados internos.

```txt
js/exportacoes.js
```
Exportação de dados.

## Apoio e dados auxiliares

```txt
js/categorias.js
```
Categorias e subcategorias usadas em formulários.

```txt
js/logs-tecnicos.js
```
Apoio a logs técnicos.

```txt
js/utils.js
```
Funções utilitárias reutilizáveis. Não deve conter regra de negócio complexa.

## Arquivos sensíveis

Alterações nestes arquivos exigem teste completo antes de publicação:

```txt
js/app.js
js/auth-permissions.js
js/firebase-service.js
js/chamados.js
js/chamados-form.js
js/modal-chamado.js
js/painel-status.js
js/diagnostico.js
js/preventivas.js
js/notificacoes.js
firestore.rules
```

## Diretriz para próximas refatorações

Antes de dividir arquivos grandes, confirmar:

```txt
1. quais funções serão movidas;
2. quais funções são chamadas diretamente pelo HTML ou por data-action;
3. se a função precisa continuar disponível em window;
4. se a ordem dos scripts será preservada;
5. qual checklist específico será executado no VS Code.
```

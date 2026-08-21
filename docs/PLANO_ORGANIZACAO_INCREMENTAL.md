# Plano de organização incremental

Base: `app-manutencao-marco0-limpeza-segura-v1.zip`.

Objetivo: melhorar legibilidade, organização e manutenção do projeto sem quebrar o estado funcional validado.

## Regra central

Nenhuma alteração sensível deve ir direto para produção. O fluxo obrigatório é:

```txt
Base limpa -> cópia de teste -> VS Code -> Live Server -> checklist dos perfis -> publicação
```

## Etapa 1 — Documentação e mapa técnico

Status: aplicada nesta versão.

Alterações:
- criação da pasta `docs/`;
- criação do mapa técnico da estrutura;
- criação do plano incremental;
- criação do checklist de testes no VS Code.

Risco: baixo.

Arquivos adicionados:
```txt
docs/MAPA_ESTRUTURA_PROJETO.md
docs/PLANO_ORGANIZACAO_INCREMENTAL.md
docs/CHECKLIST_TESTES_VSCODE.md
```

## Etapa 2 — Padronização leve sem alterar lógica

Status: aplicada nesta versão.

Objetivo:
- revisar nomes e comentários;
- adicionar cabeçalhos técnicos nos principais arquivos JS;
- agrupar funções por seção dentro do mesmo arquivo;
- não alterar IDs, nomes de função ou ordem dos scripts.

Risco: baixo/médio.

Arquivos prováveis:
```txt
js/app.js
js/firebase-service.js
js/chamados.js
js/chamados-form.js
js/chamados-render.js
js/diagnostico.js
js/preventivas.js
```

Critério de aceite:
- app abre localmente;
- console sem erro novo;
- checklist dos perfis aprovado.

## Etapa 3 — Redução de redundância controlada

Status: aplicada nesta versão.

Objetivo:
- identificar funções repetidas ou padrões duplicados;
- criar utilitários pequenos em `js/utils.js`;
- substituir duplicações uma por vez.

Alterações aplicadas:
- centralização de `criarMensagemVazia`;
- criação de `abrirModalPorId` e `fecharModalPorId`;
- centralização de `obterPrazoHoras`, `calcularVencimentoChamado` e `formatarDataHoraBR`;
- substituição conservadora nos módulos de chamados, notificações e indicadores.

Risco: médio-baixo.

Cuidados mantidos:
- não alterar regras de negócio;
- não alterar estrutura dos documentos Firestore;
- não alterar nomes de status, perfil ou permissões.

## Etapa 4 — Eventos inline para `addEventListener`

Status: aplicada parcialmente nesta versão.

Objetivo:
- reduzir `onclick`, `onchange`, `oninput` e `onsubmit` no HTML estático;
- centralizar vínculos de eventos em JavaScript;
- manter a lógica funcional nos módulos originais.

Alterações aplicadas:
- criação de `js/event-bindings.js`;
- remoção dos eventos inline estáticos do `index.html`;
- substituição por atributos declarativos `data-*`;
- ajuste do seletor do botão de criação de OS em `js/chamados.js`.

Risco: médio.

Observação importante:
Ainda existem eventos inline em HTML gerado dinamicamente por JavaScript. Eles não foram migrados nesta etapa para evitar risco excessivo em cards, listas, modais e ações operacionais renderizadas em tempo de execução.

Próxima evolução possível:
- migrar eventos dinâmicos por delegação de eventos, um módulo por vez;
- começar por listas menos críticas;
- deixar painel operacional, diagnóstico e preventivas para depois de validação completa da v5.

## Etapa 5 — Organização do `index.html`

Status: aplicada de forma conservadora nesta versão.

Objetivo:
- reduzir complexidade visual do HTML;
- melhorar leitura da estrutura;
- manter o projeto estático, sem fragments e sem bundler.

Alterações aplicadas:
- comentários estruturais no `index.html`;
- separação visual entre dependências externas, constantes e módulos do app;
- extração do registro do Service Worker para `js/service-worker-register.js`.

Risco: baixo/médio.

Observação:
A quebra do HTML em componentes/fragments foi adiada. Como o projeto é estático e não usa build, essa mudança exigiria carregamento dinâmico ou adoção de bundler, aumentando o risco de quebrar IDs usados pelo JavaScript.

## Etapa 6 — Ambiente de teste Firebase separado

Objetivo:
- reduzir risco de testes afetarem dados reais.

Risco técnico: médio.

Benefício:
- permite testar rules, usuários, OS e diagnóstico sem afetar produção.

Recomendação:
- manter como melhoria futura, não como pré-requisito imediato.

## Ordem recomendada das próximas ações

```txt
1. Testar esta versão documental no VS Code.
2. Validar checklist dos perfis.
3. Testar a Etapa 2 no VS Code com Live Server.
4. Validar checklist obrigatório dos perfis.
5. Validar a Etapa 4 no VS Code antes de publicar.
6. Testar a Etapa 5 no VS Code, verificando navegação e Service Worker.
7. Só então avaliar a migração de eventos dinâmicos por módulo.
```


## Etapa 7 — Migração dos eventos dinâmicos gerados por JavaScript

Status: aplicada nesta versão.

Objetivo:
- remover `onclick` de HTML gerado dinamicamente por JavaScript;
- centralizar os cliques em `js/event-bindings.js`;
- preservar as funções operacionais existentes;
- facilitar manutenção futura sem alterar regra de negócio.

Alterações aplicadas:
- criação do mapa `acoesDinamicas` em `js/event-bindings.js`;
- uso de `data-dynamic-action` para botões e cards dinâmicos;
- uso de `data-param0`, `data-param1` para parâmetros;
- uso de `data-pass-element="true"` quando a função precisa receber o botão clicado;
- criação de `formatarAtributoHTML(valor)` em `js/utils.js`.

Risco: médio/alto.

Motivo do risco:
- esta etapa afeta botões renderizados depois do carregamento do Firestore;
- muitos erros só aparecem ao clicar em cards, modais, notificações, diagnóstico, preventivas e painel técnico.

Critério de aceite:
- executar o checklist completo da Etapa 7 no VS Code com Live Server;
- confirmar que não há erro novo no Console;
- confirmar que manutenção, gerência e colaborador continuam respeitando suas permissões.


## Etapa 8 — Organização modular controlada

Status: aplicada nesta versão.

Objetivo:
- separar responsabilidades sem alterar regra de negócio;
- reduzir acoplamento do módulo de eventos;
- deixar claro onde registrar novas ações de interface.

Alterações aplicadas:
- criação de `js/event-action-maps.js`;
- transferência dos mapas `acoesClique`, `acoesMudanca`, `acoesDinamicas` e `acoesEntrada` para esse novo arquivo;
- `js/event-bindings.js` ficou responsável apenas por escutar eventos e encaminhar ações;
- atualização da ordem dos scripts no `index.html`;
- criação de `docs/MAPA_MODULOS_JS.md`;
- criação de `docs/RELATORIO_ETAPA_8_ORGANIZACAO_MODULAR.md`.

Risco: médio.

Motivo do risco:
- a etapa mexe na camada que aciona botões, filtros, notificações e ações dinâmicas;
- se a ordem dos scripts for alterada incorretamente, os botões podem não responder.

Critério de aceite:
- abrir o app no VS Code com Live Server;
- verificar console sem erro novo;
- testar botões estáticos e dinâmicos;
- executar o checklist dos perfis manutenção, gerência e colaborador.

Próxima etapa sugerida:
- Etapa 9 — preparação formal do ambiente de teste/publicação, com documentação de versão, backup, rollback e checklist final.

---

## Etapa 9 — Processo seguro de teste, publicação, backup e rollback

Status: concluída nesta versão.

Objetivo: formalizar o fluxo seguro de trabalho no VS Code antes de publicação.

Arquivos adicionados:

```txt
docs/GUIA_TESTE_LOCAL_VSCODE.md
docs/CHECKLIST_PUBLICACAO.md
docs/PLANO_ROLLBACK.md
docs/CONTROLE_DE_VERSOES.md
docs/FIREBASE_ESTRUTURA_MINIMA.md
docs/PROCEDIMENTO_BACKUP.md
docs/RELATORIO_ETAPA_9_PROCESSO_SEGURO.md
```

Regra definida: nenhuma nova funcionalidade deve ser publicada sem teste local, checklist dos perfis e plano de rollback definido.

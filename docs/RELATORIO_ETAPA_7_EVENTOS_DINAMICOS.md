# Relatório — Etapa 7: eventos dinâmicos gerados por JavaScript

Base de entrada: `app-manutencao-base-limpa-index-organizado-v6.zip`.

Versão gerada: `app-manutencao-base-limpa-eventos-dinamicos-v7.zip`.

## Objetivo

Reduzir o acoplamento entre HTML gerado por JavaScript e chamadas diretas de função usando `onclick`.

Nesta etapa, os eventos dinâmicos passaram a usar atributos declarativos `data-dynamic-action`, `data-param0`, `data-param1` e, quando necessário, `data-pass-element="true"`.

A execução fica centralizada em `js/event-bindings.js`, por delegação de eventos.

## Arquivos alterados

```txt
js/event-bindings.js
js/utils.js
js/ativos.js
js/chamados-render.js
js/comunicados.js
js/diagnostico.js
js/exportacoes.js
js/leitor-qr.js
js/modal-chamado.js
js/notificacoes.js
js/painel-cards.js
js/preventivas.js
docs/PLANO_ORGANIZACAO_INCREMENTAL.md
docs/RELATORIO_ETAPA_7_EVENTOS_DINAMICOS.md
```

## Alterações aplicadas

### 1. Centralização dos cliques dinâmicos

Foi criado no `js/event-bindings.js` o mapa `acoesDinamicas`, responsável por encaminhar os cliques para as funções já existentes.

Exemplo conceitual:

```html
<button data-dynamic-action="validarOS" data-param0="ID_DA_OS" data-pass-element="true">
```

Em vez de:

```html
<button onclick="validarOS('ID_DA_OS', this)">
```

### 2. Parâmetros declarativos

Os parâmetros que antes ficavam dentro do `onclick` agora ficam nos atributos:

```txt
data-param0
data-param1
```

Quando a função precisa receber o próprio botão clicado, foi usado:

```txt
data-pass-element="true"
```

### 3. Novo utilitário de atributo HTML

Foi criada a função:

```txt
formatarAtributoHTML(valor)
```

Ela prepara valores para uso em atributos HTML, mantendo o padrão de segurança já usado pelo projeto.

### 4. Exportação em PDF

O botão de impressão da janela de exportação deixou de usar `onclick`. Como a janela de exportação é um documento separado do app, ela recebeu um listener próprio no HTML gerado para o relatório.

## O que não foi alterado

```txt
firestore.rules
Firebase
Firestore
coleções
campos dos documentos
perfis
permissões
status das OS
login
diagnóstico
preventivas
notificações
regras de negócio
nomes das funções operacionais
ordem dos scripts principais
```

## Validação técnica realizada

```txt
JavaScript: sem erro de sintaxe
index.html: sem eventos inline estáticos
js/: sem onclick/onchange/oninput/onsubmit em HTML gerado pelo app
```

## Pontos de teste obrigatórios no VS Code

Esta etapa exige teste manual porque mexe diretamente em cliques de botões gerados dinamicamente.

### Manutenção

```txt
- abrir painel da manutenção
- abrir detalhes de OS por card/lista
- selecionar foto de finalização
- validar/assumir OS
- alterar status técnico
- salvar status no painel
- encerrar/finalizar OS
- abrir Diagnóstico Inicial
- usar item do checklist do diagnóstico
- gerar OS pelo diagnóstico
- marcar diagnóstico resolvido
- gerar OS preventiva
- inativar plano preventivo
- abrir notificações
- marcar notificação como lida
- abrir chamado por notificação
```

### Gerência

```txt
- visualizar chamados de todos os colaboradores
- abrir detalhes de chamados
- visualizar histórico e status
- confirmar que não aparecem ações técnicas restritas
- confirmar que não acessa diagnóstico nem preventivas
```

### Colaborador

```txt
- abrir chamado
- visualizar apenas os próprios chamados
- abrir detalhes do próprio chamado
- acompanhar status
- visualizar notificações permitidas
```

### Ativos e QR Code, se estiverem em uso

```txt
- preparar OS a partir de ativo
- mostrar histórico do ativo
- imprimir etiqueta do ativo
- excluir ativo, se aplicável
- preparar OS a partir de QR Code
- preparar cadastro de ativo por QR Code
```

## Critério de aceite

A versão só deve avançar para a próxima etapa se todos os botões renderizados dinamicamente continuarem funcionando no VS Code com Live Server.

Se algum botão não responder, voltar para a v6 ou corrigir o mapeamento correspondente em `js/event-bindings.js`.

# Relatório — Etapa 3: redução de redundância controlada

Base utilizada: `app-manutencao-base-limpa-organizada-v3.zip`.

Objetivo: reduzir duplicações pequenas e centralizar utilitários sem alterar regra de negócio, Firestore, permissões, nomes de funções públicas, IDs do HTML ou ordem dos scripts.

## Alterações aplicadas

### 1. Centralização de mensagem vazia

A função `criarMensagemVazia(titulo, texto)` foi movida para `js/utils.js`.

Motivo: é uma função genérica de interface e já era usada como recurso compartilhado por módulos de renderização.

Arquivo alterado:

```txt
js/utils.js
js/chamados-render.js
```

### 2. Centralização de abertura/fechamento de modal simples

Foram criadas funções utilitárias pequenas:

```txt
abrirModalPorId(id)
fecharModalPorId(id)
```

Uso aplicado de forma conservadora apenas no modal de notificações.

Arquivos alterados:

```txt
js/utils.js
js/notificacoes.js
```

### 3. Centralização de cálculo de vencimento de SLA

Foram centralizadas funções relacionadas ao SLA:

```txt
obterPrazoHoras(prioridade)
calcularVencimentoChamado(chamado)
formatarDataHoraBR(data)
```

Com isso, o cálculo de vencimento deixou de ser repetido em mais de um ponto.

Arquivos alterados:

```txt
js/utils.js
js/chamados-render.js
js/painel-indicadores.js
```

## O que não foi alterado

```txt
firestore.rules
configuração Firebase
coleções Firestore
campos dos documentos
perfis de usuário
permissões
nomes de status
IDs do index.html
ordem de carregamento dos scripts
eventos inline do HTML
fluxos de login
fluxos de criação/finalização de OS
fluxo de diagnóstico
fluxo de notificações
```

## Validações técnicas feitas

```txt
ZIP íntegro: sim
JavaScript: verificação de sintaxe com node --check concluída sem erros
Refatoração agressiva: não aplicada
```

## Risco da etapa

Risco: médio-baixo.

Motivo: a alteração centraliza utilitários usados por mais de um módulo, mas não muda a regra de negócio. Ainda assim, precisa ser testada no VS Code porque funções compartilhadas afetam renderização de chamados, notificações e indicadores.

## Checklist obrigatório no VS Code

### Manutenção

```txt
Entrar no app
Abrir painel da manutenção
Carregar Diagnóstico Inicial
Gerar OS pelo diagnóstico
Assumir OS
Alterar status técnico
Finalizar OS
Ver notificações
```

### Gerência

```txt
Entrar no app
Ver chamados de todos os colaboradores
Ver status e histórico
Não assumir OS
Não finalizar OS
Não alterar status técnico
Não acessar Diagnóstico Inicial
Não acessar Preventivas
```

### Colaborador

```txt
Entrar no app
Abrir chamado
Ver apenas os próprios chamados
Acompanhar status
Ver notificações permitidas
Não ver chamados de todos
Não acessar funções de manutenção
```

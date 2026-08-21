# Relatório da Etapa 4 — Migração controlada de eventos inline

Base de entrada: `app-manutencao-base-limpa-refatorada-v4.zip`.

Versão gerada: `app-manutencao-base-limpa-eventos-v5.zip`.

## Objetivo

Reduzir o acoplamento entre `index.html` e JavaScript, removendo eventos estáticos declarados diretamente no HTML, como:

```txt
onclick
onchange
oninput
onsubmit
```

A lógica funcional permaneceu nos módulos originais. A alteração apenas centraliza o vínculo entre elementos da interface e funções existentes.

## Estratégia aplicada

Foi adotada uma migração controlada:

1. Remover eventos inline estáticos do `index.html`.
2. Substituir esses eventos por atributos declarativos `data-*`.
3. Criar um arquivo dedicado para os vínculos de eventos.
4. Manter funções globais existentes para compatibilidade.
5. Não alterar regras de negócio, permissões, Firebase ou estrutura do Firestore.

## Arquivo criado

```txt
js/event-bindings.js
```

Responsabilidade do arquivo:

- escutar cliques, alterações de campo, digitação e submit;
- executar as funções já existentes nos módulos do projeto;
- manter `index.html` mais limpo;
- evitar duplicação de `onclick`, `onchange`, `oninput` e `onsubmit` em elementos estáticos.

## Arquivos alterados

```txt
index.html
js/chamados.js
docs/PLANO_ORGANIZACAO_INCREMENTAL.md
docs/RELATORIO_ETAPA_4_EVENTOS_INLINE.md
```

## Alteração em `index.html`

Eventos inline estáticos removidos e substituídos por atributos como:

```txt
data-action
data-nav-page
data-os-filter
data-change-action
data-input-action
data-form-action
```

Exemplo conceitual:

```txt
Antes: onclick="criarChamado()"
Depois: data-action="criar-chamado"
```

## Alteração em `js/chamados.js`

O seletor do botão de envio de OS foi atualizado para o novo padrão declarativo:

```txt
button[data-action="criar-chamado"]
```

Isso preserva o controle de botão desabilitado durante o envio da OS.

## O que não foi alterado

Não houve alteração em:

```txt
firestore.rules
configuração Firebase
coleções do Firestore
campos dos documentos
perfis
permissões
nomes de status
lógica de login
lógica de criação de OS
lógica do diagnóstico
lógica das preventivas
lógica das notificações
ordem funcional dos módulos existentes
```

## Escopo propositalmente não migrado nesta etapa

Ainda existem eventos inline em HTML gerado dinamicamente por JavaScript, por exemplo em cards, listas, botões de ações renderizadas e modais montados por template string.

Essa parte não foi migrada agora porque envolve maior risco. A recomendação é tratar isso em uma etapa separada, usando delegação de eventos por container, após validar esta versão no VS Code.

## Validações técnicas realizadas

```txt
index.html: sem eventos inline estáticos onclick/onchange/oninput/onsubmit
JavaScript: verificação de sintaxe concluída sem erro
ZIP: integridade validada
```

## Checklist obrigatório antes de publicar

Testar localmente no VS Code com Live Server:

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
Não acessar funções da manutenção
```

## Risco da etapa

Risco: médio.

Justificativa: botões, filtros, selects e campos de busca deixam de chamar funções diretamente no HTML e passam a depender de `js/event-bindings.js`. Por isso, os testes de clique e formulário são obrigatórios antes de publicar.

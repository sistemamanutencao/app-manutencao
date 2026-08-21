# Relatório técnico — v21 edição/exclusão em Preventivas e Diagnóstico

## Base utilizada

- Base oficial: `app-manutencao-v20-cadastro-colaboradores(5)(1).zip`
- Tipo de alteração: funcional e sensível
- Escopo: Preventivas, Diagnóstico inicial da unidade e lista de locais da Nova OS

## Objetivo

Adicionar controles de edição e exclusão em registros já criados, mantendo a rastreabilidade das OS existentes e preservando a compatibilidade com o plano Firebase Spark.

## Alterações realizadas

### Preventivas

- Adicionado botão **Editar** nos cards de planos preventivos.
- Adicionado botão **Excluir** nos cards de planos preventivos.
- Mantido o botão **Inativar plano** para preservar histórico operacional quando o plano não deve ser apagado.
- A edição reutiliza o formulário existente de plano preventivo.
- Ao editar, o formulário muda para **Editar plano preventivo** e o botão principal muda para **Salvar alterações**.
- Adicionado botão **Cancelar edição**.
- A exclusão remove apenas o cadastro da preventiva; OS já geradas não são apagadas.

### Diagnóstico inicial da unidade

- Adicionado botão **Editar** nos cards de diagnóstico.
- Adicionado botão **Excluir** nos cards de diagnóstico.
- A edição reutiliza o formulário existente de diagnóstico.
- Ao editar, o formulário muda para **Editar item do diagnóstico** e o botão principal muda para **Salvar alterações do diagnóstico**.
- Adicionado botão **Cancelar edição**.
- A exclusão remove apenas o item do diagnóstico; OS já geradas não são apagadas.

### Nova OS

- Ajustado o andar **Telhado** para incluir o local **Toda unidade**.
- O Telhado mantém os locais já existentes do 1º andar e passa a acrescentar **Toda unidade** como opção adicional.

### Service Worker

- Atualizado o cache do PWA para `app-manutencao-v21-edicao-exclusao-preventivas-diagnostico-r2`.
- Incluído `js/cadastro-colaboradores.js` na lista de cache local, pois o arquivo é carregado pelo `index.html`.

## Arquivos alterados

- `index.html`
- `src/constants/locais.js`
- `js/preventivas.js`
- `js/diagnostico.js`
- `js/firebase-service.js`
- `js/event-action-maps.js`
- `css/areas.css`
- `css/diagnostico.css`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/PLANO_ROLLBACK.md`
- `docs/RELATORIO_V21_EDICAO_EXCLUSAO_PREVENTIVAS_DIAGNOSTICO.md`

## Firestore Rules

Não houve alteração em `firestore.rules`.

A v20 já contém permissão para manutenção criar, atualizar e excluir documentos em:

- `planosPreventivos`
- `diagnosticos`

## Impacto por perfil

### Manutenção

- Pode editar e excluir planos preventivos.
- Continua podendo inativar planos preventivos.
- Pode editar e excluir itens do diagnóstico.
- Continua podendo gerar OS preventiva e OS a partir do diagnóstico.

### Gerência

- Sem novo acesso a Preventivas.
- Sem novo acesso ao Diagnóstico inicial.
- Permissões operacionais mantidas.

### Colaborador

- Sem acesso a Preventivas ou Diagnóstico.
- Pode usar Nova OS no andar **Telhado** com a opção adicional **Toda unidade**, mantendo também os demais locais já existentes, conforme permissões atuais de abertura de OS.

## Impacto em OS, SLA e histórico

- Não altera status de OS.
- Não altera cálculo de SLA.
- Não altera histórico das OS existentes.
- Não apaga OS já geradas por preventiva ou diagnóstico.
- A exclusão remove apenas o registro-base de preventiva ou diagnóstico.

## Impacto em notificações

- Não houve alteração em notificações.

## Checagens realizadas

- `node --check` em todos os arquivos `js/*.js`.
- `node --check` em todos os arquivos `src/constants/*.js`.
- `node --check` em `service-worker.js`.
- Conferência de ações registradas em `js/event-action-maps.js`.
- Conferência de permissões existentes em `firestore.rules`.

## Teste obrigatório no VS Code

### Manutenção

1. Criar plano preventivo.
2. Editar plano preventivo.
3. Cancelar edição de plano preventivo.
4. Inativar plano preventivo.
5. Excluir plano preventivo.
6. Criar item do diagnóstico.
7. Editar item do diagnóstico.
8. Cancelar edição de diagnóstico.
9. Marcar item de diagnóstico como resolvido.
10. Excluir item do diagnóstico.
11. Gerar OS preventiva.
12. Gerar OS a partir de diagnóstico.

### Gerência

1. Confirmar que não acessa Preventivas.
2. Confirmar que não acessa Diagnóstico inicial.
3. Confirmar que não ganhou botões de manutenção.

### Colaborador

1. Abrir Nova OS.
2. Selecionar **Telhado**.
3. Confirmar que o campo Local do andar inclui **Toda unidade** junto aos demais locais já existentes.
4. Abrir OS normalmente.

## Rollback específico

Voltar para a v20 se:

- a lista de Preventivas deixar de carregar;
- a lista de Diagnóstico deixar de carregar;
- editar/excluir gerar erro de permissão inesperado;
- botões dinâmicos deixarem de responder;
- Nova OS deixar de listar locais por andar.

# Correções aplicadas — Fluxo Colaborador

Data: 2026-06-02

## 1. Regras Firestore por perfil e autoria da OS

Arquivo alterado: `firestore.rules`

- Removidas permissões amplas `read, create, update, delete` para qualquer usuário autenticado.
- Colaborador pode:
  - criar OS própria;
  - ler OS própria;
  - cancelar OS própria somente quando o status atual for `ABERTO`.
- Manutenção pode operar chamados, ativos, preventivas, comunicados, notificações e usuários.
- Cancelamento por colaborador restringe os campos alteráveis para evitar edição indevida da OS.

## 2. Remoção de responsável padrão hardcoded

Arquivos alterados:
- `js/chamados-form.js`
- `js/logs-tecnicos.js`

- Removido nome pessoal fixo do técnico padrão.
- OS nova passa a nascer com `responsavelManutencao: "A definir"`.
- Técnico padrão passa a ser genérico: `Equipe de manutenção` / `Responsável a definir`.
- Log inicial usa o nome do colaborador que abriu a OS.

## 3. Ajuste de IDs inconsistentes dos filtros

Arquivo alterado: `js/chamados-render.js`

- Corrigido uso de filtros para considerar `#filtrosOS`.
- Mantida compatibilidade com `#filtrosChamados`.
- Reforçada filtragem de OS próprias para perfil Colaborador em `obterChamadosVisiveis()`.

## 4. Melhoria da validação visual do formulário de OS

Arquivos alterados:
- `index.html`
- `js/chamados-form.js`

- Campo `Necessário acompanhar?` passou a ser obrigatório.
- Campo `Prioridade` passou a exigir escolha explícita.
- Removido fallback automático de prioridade `Baixa`.
- Campos pendentes recebem destaque visual e `aria-invalid="true"`.
- Removida tentativa de limpar campo inexistente `setorChamado`.

## 5. Feedback visual padronizado

Arquivos alterados:
- `js/ui-feedback.js`
- `css/componentes.css`
- `js/chamados.js`
- `js/modal-chamado.js`

- Fluxo de criação de OS usa `appFeedback`.
- Cancelamento pelo colaborador usa confirmação visual e campo de motivo em modal próprio.
- Botão `Abrir OS` fica desabilitado durante envio para reduzir risco de duplicidade.
- `alert()` global permanece como fallback visual para módulos ainda não convertidos.

## Validações técnicas executadas

- `node --check js/*.js`
- Busca por hardcoded pessoal removido em `js`.
- Conferência dos pontos principais do fluxo Colaborador: criação, listagem própria, detalhe e cancelamento.

## Observação importante

As novas regras precisam ser publicadas no Firebase Console ou via Firebase CLI para passarem a valer no ambiente real.


## Correções adicionais — fluxo Nova OS / Cancelamento pelo colaborador

1. Regra Firestore reforçada: colaborador só pode cancelar OS própria, com status original `ABERTO`, alterando apenas os campos necessários do cancelamento.
2. Cancelamento do colaborador convertido para modal próprio com texto de irreversibilidade, botão `Voltar`, botão `Confirmar cancelamento` e motivo obrigatório validado dentro do modal.
3. Botão `Abrir OS` bloqueia duplo envio: desabilita, mostra `Enviando...` e restaura o estado se houver erro ou ao finalizar.
4. Render de `Minhas OS` reforçado por `obterChamadosVisiveis()`, filtrando OS próprias para perfil Colaborador.
5. Campo `Necessário acompanhar?` tratado como obrigatório, sem valor automático `Não informado` no envio.

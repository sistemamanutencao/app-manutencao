# Relatório v14 — Comunicados da manutenção com níveis e edição

## Objetivo

Consolidar a primeira fase de melhoria da aba **Comunicados**, focada no uso da **Manutenção** como perfil responsável por criar, editar, classificar e excluir comunicados publicados no app.

Esta versão parte da base funcional v13 e não altera a arquitetura Firebase Spark validada.

## Alterações consolidadas nesta versão

- Reorganização visual da aba **Comunicados**.
- Criação de um formulário administrativo mais claro para a manutenção.
- Inclusão do campo **Nível do comunicado** com três opções:
  - `normal`;
  - `importante`;
  - `urgente`.
- Compatibilidade com comunicados antigos sem campo `nivel`, tratados automaticamente como `normal`.
- Inclusão de cards visuais para seleção rápida do nível do comunicado.
- Inclusão de resumo de comunicados por nível.
- Inclusão de filtros por nível:
  - Todos;
  - Urgentes;
  - Importantes;
  - Normais.
- Ordenação visual por criticidade:
  - Urgentes primeiro;
  - Importantes depois;
  - Normais por último.
- Inclusão da função **Editar** para comunicados já publicados.
- A edição permite alterar:
  - título;
  - mensagem;
  - origem;
  - nível.
- Inclusão de botão **Cancelar edição** para retornar ao modo de criação.
- Preservação da função **Excluir** para a manutenção.
- Remoção do subtítulo superior da aba Comunicados para reduzir ruído visual.
- Remoção do ícone de `+` acima do título **Novo comunicado**.
- Compactação dos cards de nível **Normal**, **Importante** e **Urgente** no formulário.
- Correção dos filtros de comunicados para evitar corte do botão **Normais** em telas estreitas.
- Inclusão de respiro inferior na aba Comunicados para evitar sobreposição com a barra inferior fixa.
- Ocultação da seção **Comunicados recentes** na aba Início para o perfil Manutenção, evitando redundância para quem cria e gerencia os comunicados.

- Remoção do card **Comunicados** do grid **Acesso rápido** para os perfis Colaborador e Gerência, mantendo o atalho apenas para Manutenção.
- Reorganização da aba **Início** para Colaborador e Gerência, exibindo **Comunicados recentes** antes de **Minhas OS**.


## Correção operacional incluída antes do fechamento da v14

Além dos ajustes de Comunicados, esta versão consolida a correção de prazo/SLA das OS para evitar que o prazo exista apenas como cálculo visual temporário.

Alterações operacionais adicionadas:

- Gravação de campos de SLA na criação da OS:
  - `prazoHoras`;
  - `vencimentoSLAISO`;
  - `slaBasePrioridade`;
  - `slaStatusAtual`;
  - `slaCriadoEmISO`.
- Registro no histórico da OS do prazo inicial calculado.
- Recalculo de SLA quando a prioridade da OS é alterada por Manutenção ou Gerência.
- Registro no histórico da OS quando a prioridade altera o vencimento.
- Gravação de dados finais de SLA ao concluir uma OS:
  - `tempoConclusaoHoras`;
  - `concluidoNoPrazo`;
  - `slaStatusFinal`;
  - `slaFinalizadoEmISO`.
- Indicadores do painel passam a considerar `concluidoNoPrazo` quando o campo existir.
- OS antigas sem campos de SLA continuam sendo exibidas por compatibilidade, com cálculo de fallback.

## Arquivos alterados

- `index.html`
- `css/comunicados.css`
- `js/comunicados.js`
- `js/event-action-maps.js`
- `js/firebase-service.js`
- `js/utils.js`
- `js/chamados-render.js`
- `js/modal-chamado.js`
- `js/painel-cards.js`
- `js/painel-status.js`
- `js/painel-indicadores.js`
- `firestore.rules`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/RELATORIO_V14_COMUNICADOS_MANUTENCAO.md`

## Permissões e regras

A coleção `comunicados` já permitia `create`, `update` e `delete` para o perfil `manutencao`, portanto a edição dos comunicados não exige mudança adicional nessa coleção.

Esta versão altera `firestore.rules` apenas para manter a permissão já aprovada da Gerência ao alterar prioridade da OS. Como a alteração de prioridade agora recalcula o SLA, a regra passou a permitir também os campos técnicos relacionados ao prazo:

- `prazoHoras`;
- `vencimentoSLAISO`;
- `slaBasePrioridade`;
- `slaStatusAtual`;
- `slaRecalculadoEmISO`.

As restrições da Gerência continuam preservadas: ela não assume, não finaliza, não altera status técnico e não acessa diagnóstico/preventivas.

## Restrições preservadas

Esta versão não altera:

- login;
- perfis de acesso;
- permissões da Gerência;
- permissões do Colaborador;
- fluxo operacional básico de OS (abrir, assumir, alterar status, finalizar);
- Diagnóstico Inicial;
- Preventivas;
- painel da Manutenção;
- arquitetura Firebase Spark.

## Checklist de teste obrigatório

### Manutenção

- Entrar como Manutenção.
- Abrir a aba Comunicados.
- Criar comunicado normal.
- Criar comunicado importante.
- Criar comunicado urgente.
- Confirmar que os filtros exibem as contagens corretas.
- Confirmar que urgente aparece antes de importante e normal.
- Editar um comunicado existente.
- Alterar título, mensagem, origem e nível.
- Salvar alterações.
- Confirmar atualização do card na lista.
- Entrar em edição e cancelar.
- Excluir comunicado de teste.

### Gerência

- Entrar como Gerência.
- Confirmar que a aba Comunicados continua carregando.
- Confirmar que o formulário administrativo não aparece.
- Confirmar que ações de editar/excluir não aparecem.
- Confirmar que funcionalidades de Gerência em OS continuam preservadas.
- Alterar a prioridade de uma OS permitida e confirmar recalculo/registro de SLA no histórico.
- Confirmar que as regras atualizadas do Firestore foram publicadas quando testar em produção.

### Colaborador

- Entrar como Colaborador.
- Confirmar que a aba Comunicados continua carregando.
- Confirmar que o formulário administrativo não aparece.
- Confirmar que ações de editar/excluir não aparecem.
- Confirmar que o colaborador continua vendo apenas os próprios chamados.
- Abrir uma OS de teste e confirmar que o prazo inicial aparece corretamente nos detalhes.

## Rollback

Se os ajustes visuais desta etapa falharem, voltar para:

`app-manutencao-v14-comunicados-manutencao-edicao.zip`

Se houver falha estrutural maior, retornar para a base segura v13:

`app-manutencao-v13-gerencia-prioridade-os-limpo(1).zip`

Como esta versão também ajusta campos de SLA e `firestore.rules`, em caso de rollback é necessário restaurar o ZIP anterior e revisar se as regras publicadas no Firebase Console também precisam voltar à versão anterior.

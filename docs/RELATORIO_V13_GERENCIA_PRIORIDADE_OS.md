# Relatório v13 — Gerência altera prioridade da OS

## Objetivo

Consolidar a versão funcional em que o perfil **Gerência** passa a poder ajustar a prioridade das ordens de serviço, mantendo as restrições operacionais já validadas do projeto.

## Alterações consolidadas nesta versão

- A Gerência pode alterar somente a prioridade da OS.
- A alteração de prioridade fica disponível apenas para OS em andamento operacional permitido, antes do encerramento.
- O ajuste de prioridade fica registrado no histórico da OS.
- O controle visual de prioridade foi reposicionado para a área de ações do modal, acima do botão de cancelar chamado.
- A prioridade atual permanece visível na tabela de detalhes da OS.
- O botão de salvar prioridade foi ajustado para visual mais discreto e melhor alocado.
- Foram preservadas as melhorias anteriores de tela de login, mensagens internas, visual da lista de OS e responsividade.

## Restrições preservadas

A Gerência continua sem permissão para:

- assumir OS;
- finalizar OS;
- alterar status técnico;
- acessar Diagnóstico Inicial;
- acessar Preventivas;
- excluir OS;
- alterar descrição original da OS;
- alterar responsável técnico.

O Colaborador continua sem acesso ao controle de prioridade.

A Manutenção continua com suas permissões operacionais já existentes.

## Arquivos principais envolvidos

- `index.html`
- `css/modal.css`
- `css/responsive.css`
- `css/chamados.css`
- `css/componentes.css`
- `js/modal-chamado.js`
- `js/chamados-render.js`
- `js/event-action-maps.js`
- `src/constants/permissoes.js`
- `firestore.rules`

## Atenção sobre Firebase Rules

Esta versão inclui ajuste em `firestore.rules`. Ao publicar no GitHub, também é necessário revisar/publicar as regras correspondentes no Firebase Console para que a permissão da Gerência funcione corretamente em produção.

## Checklist de teste obrigatório

### Gerência

- Entrar como Gerência.
- Abrir uma OS permitida.
- Confirmar que o controle de prioridade aparece acima do botão de cancelamento.
- Alterar prioridade.
- Confirmar atualização no card/lista e nos detalhes.
- Confirmar registro no histórico.
- Confirmar que não consegue assumir, finalizar ou alterar status técnico.
- Confirmar que não acessa Diagnóstico Inicial nem Preventivas.

### Manutenção

- Entrar como Manutenção.
- Confirmar funcionamento normal do painel.
- Abrir OS.
- Assumir, alterar status técnico e finalizar OS de teste.
- Confirmar que a prioridade e o histórico seguem funcionando.

### Colaborador

- Entrar como Colaborador.
- Abrir chamado de teste.
- Confirmar que vê apenas os próprios chamados.
- Confirmar que não aparece controle de alteração de prioridade.
- Confirmar que não acessa funções da Manutenção.

## Rollback

Se houver falha, voltar para a última versão funcional aprovada antes da publicação desta v13.

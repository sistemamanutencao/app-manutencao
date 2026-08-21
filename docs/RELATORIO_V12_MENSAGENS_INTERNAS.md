# Relatório v12 — Melhoria de mensagens internas

## Objetivo

Melhorar clareza, leitura e apresentação das mensagens internas do app sem alterar regras de negócio, perfis, permissões, Firebase, Firestore, OS ou diagnóstico.

## Base utilizada

- Base anterior: `app-manutencao-v11-visual-operacional-lista-os.zip`
- Nova versão gerada: `app-manutencao-v12-mensagens-internas.zip`

## Alterações realizadas

### 1. Modal de feedback do app

Arquivos:

- `js/ui-feedback.js`
- `css/componentes.css`

Ajustes:

- Separação visual entre título e descrição da mensagem.
- Títulos padrão por tipo de mensagem:
  - sucesso;
  - erro;
  - aviso;
  - informação;
  - confirmação.
- Botão padrão alterado para `Entendi` nas mensagens informativas.
- Melhor contraste visual do modal.
- Borda superior colorida por tipo de feedback.
- Melhor legibilidade em telas pequenas.
- Mantida compatibilidade com:
  - `alert()`;
  - `appFeedback()`;
  - `appConfirm()`;
  - `appPrompt()`.

### 2. Mensagens da abertura de OS

Arquivo:

- `js/chamados.js`

Ajustes:

- Mensagens de campos obrigatórios mais claras.
- Mensagem de sucesso ao abrir OS com orientação de acompanhamento.
- Mensagem de erro ao enviar OS mais objetiva.
- Mensagem sobre limite de imagens mais explicativa.

### 3. Mensagens da lista e detalhes de OS

Arquivos:

- `js/chamados-render.js`
- `js/modal-chamado.js`

Ajustes:

- Texto de estado vazio alterado para `Nenhuma OS encontrada`.
- Mensagens de OS não encontrada mais orientativas.
- Cancelamento de OS com motivo mais claro.
- Mensagens de fotos indisponíveis mais específicas.

### 4. Mensagens operacionais do painel da manutenção

Arquivo:

- `js/painel-status.js`

Ajustes:

- Mensagens de alteração de status mais claras.
- Justificativa do status `AGUARDANDO` passou a usar o modal visual do app.
- Motivo de cancelamento passou a usar o modal visual do app.
- Observação de validação passou a usar o modal visual do app.
- Confirmação de encerramento definitivo ficou mais explícita.
- Textos de sucesso e erro foram reescritos sem mudar a lógica operacional.

### 5. Mensagens de login e carregamento inicial

Arquivos:

- `js/perfil.js`
- `js/app.js`
- `js/navigation.js`

Ajustes:

- Mensagens de login com orientação mais clara.
- Mensagens sobre usuário inativo e documento `usuarios/{uid}` mais úteis para diagnóstico.
- Mensagens de erro ao carregar dados do Firebase mais específicas.
- Mensagem de acesso restrito à manutenção ajustada.

### 6. Mensagens auxiliares

Arquivos:

- `js/ativos.js`
- `js/comunicados.js`
- `js/notificacoes.js`
- `js/preventivas.js`
- `js/exportacoes.js`
- `js/leitor-qr.js`

Ajustes:

- Mensagens de cadastro, exclusão, bloqueio de impressão, preventivas e notificações internas foram reescritas para maior clareza.
- Não houve alteração nas permissões nem no modelo de dados.

## O que não foi alterado

- Login.
- Firebase Auth.
- Firestore Rules.
- Estrutura das coleções.
- Criação de OS.
- Permissões por perfil.
- Diagnóstico Inicial.
- Preventivas.
- Notificações push.
- Service Worker.
- Regras de visibilidade de manutenção, gerência e colaborador.

## Risco da alteração

Risco: baixo a médio.

Justificativa:

- Baixo para textos e CSS do modal.
- Médio apenas porque algumas entradas de texto nativas foram substituídas por `appPrompt()` visual em funções operacionais da manutenção. As funções continuam assíncronas e preservam os dados registrados.

## Teste obrigatório no VS Code

1. Abrir o projeto com Live Server.
2. Entrar como colaborador.
3. Abrir uma OS de teste.
4. Verificar mensagem de sucesso da OS.
5. Tentar abrir OS com campos obrigatórios vazios.
6. Entrar como manutenção.
7. Alterar status de uma OS.
8. Colocar uma OS em `AGUARDANDO` e conferir o campo de justificativa.
9. Cancelar uma OS de teste e conferir o campo de motivo.
10. Validar e encerrar uma OS, se aplicável.
11. Entrar como gerência e confirmar que permissões continuam preservadas.
12. Conferir notificações internas, comunicados, ativos e preventivas sem erro visual.

## Rollback

Se algo falhar:

1. Voltar para `app-manutencao-v11-visual-operacional-lista-os.zip`.
2. Ou restaurar apenas os arquivos alterados nesta etapa.
3. Não é necessário alterar Firestore, Authentication ou Rules para desfazer esta etapa.

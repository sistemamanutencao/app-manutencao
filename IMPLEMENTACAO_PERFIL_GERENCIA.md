# Implementação do perfil Gerência

## Objetivo

Criar o perfil `gerencia` com as funcionalidades básicas do colaborador e autorização adicional para acompanhar todos os chamados, seus status e histórico.

## Limites intencionais

A Gerência **não** recebe permissões de Manutenção. Portanto, não pode:

- acessar o painel operacional da manutenção;
- assumir atendimento;
- alterar status operacional da OS;
- finalizar OS;
- validar ou encerrar OS;
- gerenciar ativos;
- gerenciar preventivas;
- acessar diagnóstico inicial;
- publicar comunicados;
- excluir registros.

## O que a Gerência pode fazer

- abrir uma OS própria;
- acompanhar a lista de OS de todos os colaboradores;
- filtrar por status;
- pesquisar por número, local, categoria, descrição ou solicitante;
- abrir o detalhe da OS;
- visualizar status, dados da solicitação, fotos e histórico;
- cancelar apenas OS própria enquanto estiver em status `ABERTO`.

## Arquivos alterados

- `src/constants/perfis.js`
- `src/constants/permissoes.js`
- `js/auth-permissions.js`
- `js/app.js`
- `js/perfil.js`
- `js/modal-chamado.js`
- `js/chamados-render.js`
- `index.html`
- `firestore.rules`
- `service-worker.js`

## Como cadastrar um usuário de Gerência no Firebase

1. Acesse Firebase Console.
2. Vá em Authentication.
3. Crie o usuário com e-mail e senha.
4. Copie o UID gerado.
5. Vá em Firestore Database.
6. Na coleção `usuarios`, crie um documento com ID igual ao UID.
7. Use os campos:

```json
{
  "nome": "Nome da Gerência",
  "email": "gerencia@senac.com",
  "setor": "Gerência",
  "unidade": "Senac Campo Mourão",
  "perfil": "gerencia",
  "ativo": true
}
```

## Regras Firestore

Depois de substituir/publicar o novo `firestore.rules`, a gerência poderá ler todos os documentos da coleção `chamados`, mas não poderá executar ações operacionais da manutenção.

## Teste recomendado

1. Entrar como gerência.
2. Confirmar que o app abre na tela inicial, não no painel da manutenção.
3. Abrir `OS`.
4. Confirmar que aparecem chamados de todos os colaboradores.
5. Abrir uma OS e verificar status e histórico.
6. Confirmar que não aparece o painel da manutenção.
7. Confirmar que não aparecem botões de assumir atendimento, alterar status ou finalizar.
8. Criar uma OS própria como gerência.
9. Tentar cancelar apenas essa OS enquanto ainda estiver aberta.

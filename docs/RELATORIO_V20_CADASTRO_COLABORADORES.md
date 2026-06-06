# Relatório v20 — Cadastro de colaboradores no app

## Escopo aprovado

A v20 adiciona cadastro de colaboradores dentro do app, mantendo a arquitetura compatível com o plano Firebase Spark, sem Cloud Functions.

## Regras de negócio implementadas

- Somente o perfil `manutencao` pode autorizar novos colaboradores.
- A manutenção informa apenas nome, e-mail e setor.
- O e-mail é normalizado automaticamente com `trim().toLowerCase()` antes de salvar ou consultar.
- O app bloqueia autorização duplicada para e-mail já pendente, concluído ou inativo.
- O perfil do usuário criado é sempre `colaborador`.
- Gerência e manutenção continuam sendo criadas/controladas manualmente no Firebase.
- O login anônimo de colaborador foi mantido temporariamente como transição.
- O colaborador cria a própria senha pelo bloco “Primeiro acesso do colaborador”.

## Fluxo implementado

1. Manutenção acessa o Painel da manutenção.
2. No card “Cadastro de colaboradores”, informa nome, e-mail e setor.
3. O app normaliza o e-mail e verifica se já existe cadastro para o mesmo `emailKey`.
4. Se não houver cadastro existente, grava uma autorização em `cadastrosColaboradores/{emailKey}` com status `pendente`.
5. O colaborador entra na aba Perfil e usa “Primeiro acesso do colaborador”.
6. O app cria a conta no Firebase Authentication.
7. O app valida a autorização por e-mail.
8. O app cria `usuarios/{uid}` com perfil `colaborador`.
9. O app cria o vínculo em `colaboradores/{codigoColaborador}`.
10. A autorização passa para status `concluido`.

## Arquivos alterados

- `index.html`
- `src/constants/firebase.js`
- `js/state.js`
- `js/app.js`
- `js/event-action-maps.js`
- `js/perfil.js`
- `js/cadastro-colaboradores.js`
- `css/perfil.css`
- `css/painel.css`
- `firestore.rules`

## Nova coleção Firestore

```txt
cadastrosColaboradores
```

Campos principais:

```js
{
  emailKey: string,
  codigoColaborador: string,
  nome: string,
  email: string,
  setor: string,
  perfil: "colaborador",
  ativo: true,
  status: "pendente" | "concluido" | "inativo",
  criadoPorUid: string,
  criadoPorNome: string,
  uidCriado: string,
  criadoEm: timestamp,
  atualizadoEm: timestamp,
  concluidoEm: timestamp
}
```

## Observações técnicas

- `createUserWithEmailAndPassword()` é usado somente no primeiro acesso do próprio colaborador.
- A manutenção não cria senha de terceiros, evitando troca indevida da sessão da manutenção.
- Durante o primeiro acesso, o app usa uma trava temporária `APP_PRIMEIRO_ACESSO_COLABORADOR_EM_ANDAMENTO` para evitar que o fluxo de autenticação deslogue o usuário antes da criação de `usuarios/{uid}`.
- Se um e-mail sem autorização tentar primeiro acesso, o app tenta remover a conta recém-criada e encerra a sessão.
- Se a manutenção tentar cadastrar um e-mail já pendente, o app avisa que ele aguarda primeiro acesso e não sobrescreve o cadastro.
- Se a manutenção tentar cadastrar um e-mail já concluído, o app avisa que o colaborador já possui conta e não cria nova autorização.
- Se a manutenção tentar cadastrar variações de caixa do mesmo e-mail, como `Maria.Silva@exemplo.com` e `maria.silva@exemplo.com`, ambas são tratadas como o mesmo cadastro.

## Publicação obrigatória

Além de subir os arquivos no GitHub, publique o conteúdo atualizado de `firestore.rules` no Firebase Console.


## Atualização adicional - acesso colaborador ocultado

- O acesso antigo do colaborador por nome e setor foi ocultado da aba Perfil.
- O fluxo principal exibido ao colaborador agora é o Primeiro acesso com e-mail previamente autorizado pela manutenção.
- O login anônimo foi mantido no código como transição/compatibilidade, mas não fica mais exposto visualmente na tela de Perfil.
- Essa mudança incentiva o uso de contas individuais por e-mail e senha, melhorando rastreabilidade e controle operacional.


Atualização visual v20: o botão de Primeiro acesso do colaborador foi definido como azul/principal para reduzir confusão e direcionar o colaborador ao fluxo correto de criação de senha.

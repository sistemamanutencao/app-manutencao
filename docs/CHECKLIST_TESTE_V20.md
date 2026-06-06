# Checklist de teste v20 — Cadastro de colaboradores

## Antes de testar

- Abrir o projeto no VS Code.
- Rodar com Live Server.
- Confirmar se o app aponta para o Firebase correto.
- Publicar `firestore.rules` atualizado no Firebase Console.
- Confirmar que o método Email/senha está habilitado no Firebase Authentication.
- Manter o método Anônimo habilitado durante a transição.

## Teste com manutenção

1. Entrar com usuário de manutenção.
2. Abrir Painel da manutenção.
3. Confirmar que o card “Cadastro de colaboradores” aparece.
4. Cadastrar um colaborador com nome, e-mail e setor.
5. Confirmar que o cadastro aparece na lista como `Pendente`.
6. Confirmar no Firestore que foi criado documento em `cadastrosColaboradores`.
7. Confirmar que o documento possui `perfil: "colaborador"`.
8. Confirmar que o e-mail foi salvo em minúsculas, sem espaços nas pontas.
9. Tentar cadastrar novamente o mesmo e-mail enquanto estiver pendente; o app deve bloquear e avisar que já aguarda primeiro acesso.

## Teste de primeiro acesso

1. Sair da conta de manutenção.
2. Ir para Perfil.
3. No bloco “Primeiro acesso do colaborador”, informar o e-mail autorizado.
4. Criar senha e confirmar senha.
5. Confirmar que o app entra como colaborador.
6. Confirmar no Firestore que foi criado `usuarios/{uid}` com:
   - `perfil: "colaborador"`
   - `ativo: true`
   - `email` correto
   - `setor` correto
7. Confirmar que o cadastro em `cadastrosColaboradores` mudou para `status: "concluido"`.
8. Confirmar que foi criado vínculo em `colaboradores/{codigoColaborador}`.

## Teste com colaborador logado por e-mail

1. Entrar com e-mail e senha do colaborador.
2. Confirmar que o colaborador vê apenas as próprias OS.
3. Abrir uma nova OS.
4. Confirmar que a OS fica vinculada ao UID do colaborador.
5. Confirmar que o colaborador não vê Painel da manutenção, Diagnóstico, Preventivas, Exportações nem Cadastro de colaboradores.

## Teste de segurança

1. Tentar primeiro acesso com e-mail não autorizado.
2. O app deve bloquear e não criar `usuarios/{uid}`.
3. Entrar como gerência.
4. Confirmar que gerência não vê o card de cadastro de colaboradores.
5. Entrar como colaborador.
6. Confirmar que colaborador não vê o card de cadastro de colaboradores.
7. Confirmar que nenhum usuário comum consegue alterar o próprio `perfil` no Firestore.
8. Após concluir o primeiro acesso, entrar como manutenção e tentar cadastrar o mesmo e-mail novamente; o app deve bloquear e avisar que o colaborador já possui conta.
9. Testar o mesmo e-mail com letras maiúsculas/minúsculas diferentes; o app deve tratar como o mesmo cadastro.

## Teste de transição

1. Usar “Entrar como colaborador” por nome/setor.
2. Confirmar que o login anônimo continua funcionando.
3. Confirmar que a abertura de OS por colaborador anônimo continua funcionando.


## Atualização adicional - acesso colaborador ocultado

- O acesso antigo do colaborador por nome e setor foi ocultado da aba Perfil.
- O fluxo principal exibido ao colaborador agora é o Primeiro acesso com e-mail previamente autorizado pela manutenção.
- O login anônimo foi mantido no código como transição/compatibilidade, mas não fica mais exposto visualmente na tela de Perfil.
- Essa mudança incentiva o uso de contas individuais por e-mail e senha, melhorando rastreabilidade e controle operacional.


Atualização visual v20: o botão de Primeiro acesso do colaborador foi definido como azul/principal para reduzir confusão e direcionar o colaborador ao fluxo correto de criação de senha.

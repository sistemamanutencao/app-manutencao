# Plano de Rollback

Este documento define como voltar para uma versão estável quando uma alteração quebrar o projeto.

## Versão de segurança principal

O Marco 0 oficial do projeto é:

```txt
app-manutencao(7).zip
```

A versão funcional anterior a esta entrega é:

```txt
app-manutencao-v18-perfil-manutencao-avatar-maior.zip
```

A versão atual de trabalho é:

```txt
app-manutencao-v18-perfil-manutencao-avatar-maior.zip
```

## Quando fazer rollback

Fazer rollback se ocorrer qualquer um destes casos:

- login deixou de funcionar;
- manutenção perdeu acesso operacional;
- gerência ganhou acesso indevido a ações técnicas;
- colaborador passou a ver chamados de todos;
- diagnóstico não carrega;
- notificações não carregam;
- Firestore retorna `permission-denied` sem causa clara;
- botões principais deixam de responder;
- publicação gerou comportamento diferente do teste local.

## Procedimento de rollback

1. Interromper novas alterações.
2. Identificar a última versão funcional.
3. Restaurar o ZIP funcional em uma pasta limpa.
4. Testar no VS Code com Live Server.
5. Conferir se o erro era código ou Firebase.
6. Se for código, voltar para o ZIP anterior aprovado.
7. Se for Firebase, revisar `firestore.rules` e `usuarios/{uid}`.
8. Rodar o checklist dos três perfis.
9. Publicar somente depois da validação.

## Diagnóstico rápido

### Sintoma: `permission-denied`

Verificar:

- regras do Firestore;
- documento `usuarios/{uid}`;
- campo `ativo: true` como booleano;
- campo `perfil` correto;
- usuário correto autenticado.

### Sintoma: botão não responde

Verificar:

- `js/event-bindings.js`;
- `js/event-action-maps.js`;
- atributos `data-action` ou `data-dynamic-action`;
- Console do navegador.

### Sintoma: app não abre ou tela fica em branco

Verificar:

- erro de JavaScript no Console;
- ordem dos scripts no `index.html`;
- arquivo ausente;
- cache do navegador ou Service Worker.

## Regra de segurança

Nunca corrigir direto na versão publicada. Sempre corrigir em cópia local e testar antes.


## Atualização v19

Versão atual de trabalho:

```txt
app-manutencao-v19-local-ocorrencia-card-os.zip
```

Versão funcional anterior para rollback imediato:

```txt
app-manutencao-v18-perfil-manutencao-avatar-maior.zip
```

Critério específico de rollback da v19:

- voltar para a v18 se os cards de OS deixarem de abrir detalhes;
- voltar para a v18 se a listagem de OS não carregar para colaborador, gerência ou manutenção;
- revisar `js/chamados-render.js` se o campo Local da ocorrência aparecer vazio em chamados que possuem local cadastrado.


## Atualização v21

Versão atual de trabalho:

```txt
app-manutencao-v21-edicao-exclusao-preventivas-diagnostico.zip
```

Versão funcional anterior para rollback imediato:

```txt
app-manutencao-v20-cadastro-colaboradores(5)(1).zip
```

Critério específico de rollback da v21:

- voltar para a v20 se a lista de Preventivas deixar de carregar;
- voltar para a v20 se a lista de Diagnóstico inicial deixar de carregar;
- voltar para a v20 se editar ou excluir preventiva/diagnóstico gerar erro de permissão inesperado;
- revisar `js/event-action-maps.js` e `js/event-bindings.js` se os novos botões não responderem;
- revisar `src/constants/locais.js` e `js/categorias.js` se o andar Telhado não mostrar o local Toda unidade.


## Atualização v22

Versão atual de trabalho:

```txt
app-manutencao-v22-url-sistemamanutencao.zip
```

Versão funcional anterior para rollback imediato:

```txt
app-manutencao-v21-edicao-exclusao-preventivas-diagnostico.zip
```

Critério específico de rollback da v22:

- voltar para a v21 se o app deixar de carregar após publicação no GitHub Pages;
- revisar `service-worker.js` se o PWA continuar usando cache antigo;
- confirmar `sistemamanutencao.github.io` no Firebase Authentication > Settings > Authorized domains se o login falhar na nova URL;
- confirmar o remote do GitHub Desktop se houver falha de publicação ou sincronização.

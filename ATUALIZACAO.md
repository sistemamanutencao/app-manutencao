# Atualização - Etapa 18

## Persistência real das OS do colaborador

Esta etapa corrige o problema em que o colaborador atualizava a página, saía e entrava depois, e suas OS não apareciam corretamente em **Minhas OS**.

## Ajustes realizados

- Criada chave persistente do colaborador baseada em nome + setor normalizados.
- Mantido o identificador local antigo para compatibilidade com OS já criadas.
- As novas OS passam a salvar também:
  - `colaboradorChave`;
  - `criadoPorColaboradorId`;
  - `criadoPorPerfil`;
  - `colaboradorLocalId`;
  - `criadoPorUid`.
- A consulta de **Minhas OS** agora busca por múltiplos vínculos compatíveis:
  - `colaboradorChave`;
  - `colaboradorLocalId`;
  - `criadoPorUid`;
  - `solicitanteId`.
- A validação de OS própria foi centralizada em `usuarioEhAutorChamado(chamado)`.
- O cancelamento de OS própria agora considera a identidade persistente, não apenas o UID temporário do Firebase Auth.
- Atualizado o cache do PWA para evitar carregamento de JavaScript antigo.

## Arquivos alterados

- `js/perfil.js`
- `js/app.js`
- `js/firebase-service.js`
- `js/chamados-form.js`
- `js/modal-chamado.js`
- `service-worker.js`
- `ATUALIZACAO.md`

## Firebase

Não foi criada nova coleção.

Não é necessário alterar `firestore.rules` nesta etapa, porque os novos campos são salvos dentro da coleção já existente `chamados`, que as regras atuais já permitem para usuários autenticados.

Atenção: o login anônimo do Firebase Authentication precisa continuar habilitado, pois o colaborador usa esse fluxo para ter autenticação técnica no Firestore.

## Observação importante

Para recuperar OS antigas, o app mantém compatibilidade com os campos antigos. Para OS novas, o vínculo fica mais forte e menos dependente do UID anônimo.

## Commit sugerido

```txt
fix: persistir minhas OS por identidade do colaborador
```

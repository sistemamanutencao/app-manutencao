# Regras do Firestore para esta versão

Cole estas regras em **Firestore Database > Regras**.

> Esta versão usa login simplificado para colaboradores com autenticação anônima do Firebase. Por isso, habilite também **Authentication > Sign-in method > Anonymous** no Firebase Console.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function estaLogado() {
      return request.auth != null;
    }

    function temCadastro() {
      return estaLogado() && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid));
    }

    function usuarioAtual() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data;
    }

    function estaAtivo() {
      return temCadastro() && usuarioAtual().ativo == true;
    }

    function ehAdmin() {
      return estaAtivo()
        && usuarioAtual().perfil in ["admin", "Admin", "administrador", "Administrador"];
    }

    function ehManutencao() {
      return estaAtivo()
        && usuarioAtual().perfil in ["manutencao", "manutenção", "Manutenção", "MANUTENCAO", "MANUTENÇÃO"];
    }

    function ehManutencaoOuAdmin() {
      return ehManutencao() || ehAdmin();
    }

    function aguardandoTemJustificativa() {
      return request.resource.data.status != "AGUARDANDO"
        || (
          request.resource.data.justificativaAguardando is string
          && request.resource.data.justificativaAguardando.size() > 0
        );
    }

    function chamadoPertenceAoUsuario() {
      return resource.data.criadoPorUid == request.auth.uid
        || resource.data.solicitanteId == request.auth.uid;
    }

    function chamadoNaoFinalizado() {
      return resource.data.status != "CONCLUÍDO"
        && resource.data.status != "CANCELADO";
    }

    function alterouSomenteCancelamentoColaborador() {
      return request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly([
          "status",
          "historico",
          "atualizadoEm",
          "canceladoPorUid",
          "canceladoPorNome",
          "canceladoMotivo",
          "canceladoEmISO"
        ]);
    }

    function colaboradorPodeCancelarChamado() {
      return estaLogado()
        && chamadoPertenceAoUsuario()
        && chamadoNaoFinalizado()
        && request.resource.data.status == "CANCELADO"
        && request.resource.data.canceladoPorUid == request.auth.uid
        && request.resource.data.canceladoMotivo is string
        && request.resource.data.canceladoMotivo.size() > 0
        && alterouSomenteCancelamentoColaborador();
    }

    function podeLerNotificacao() {
      return resource.data.destinatarioUid == request.auth.uid
        || (resource.data.destinatarioPerfil == "manutencao" && ehManutencaoOuAdmin())
        || (resource.data.destinatarioPerfil == "admin" && ehAdmin());
    }

    function notificacaoCriadaCorretamente() {
      return request.resource.data.criadaPorUid == request.auth.uid
        && request.resource.data.titulo is string
        && request.resource.data.titulo.size() > 0
        && request.resource.data.mensagem is string
        && request.resource.data.tipo is string
        && request.resource.data.lidaPorUids is list
        && request.resource.data.lidaPorUids.size() == 0
        && (
          (
            request.resource.data.destinatarioUid is string
            && request.resource.data.destinatarioUid.size() > 0
          )
          || request.resource.data.destinatarioPerfil in ["manutencao", "admin"]
        );
    }

    function marcouSomenteLeituraNotificacao() {
      return request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(["lidaPorUids", "atualizadoEm"])
        && resource.data.lidaPorUids is list
        && request.resource.data.lidaPorUids is list
        && request.resource.data.lidaPorUids.hasAll(resource.data.lidaPorUids)
        && request.auth.uid in request.resource.data.lidaPorUids;
    }

    match /usuarios/{userId} {
      allow read: if estaAtivo() && (request.auth.uid == userId || ehManutencaoOuAdmin());
      allow create, update, delete: if ehAdmin();
    }

    match /chamados/{chamadoId} {
      allow create: if estaLogado()
        && request.resource.data.criadoPorUid == request.auth.uid
        && request.resource.data.solicitanteId == request.auth.uid
        && aguardandoTemJustificativa();

      allow read: if estaLogado()
        && (
          resource.data.criadoPorUid == request.auth.uid
          || resource.data.solicitanteId == request.auth.uid
          || ehManutencaoOuAdmin()
        );

      allow update: if estaLogado()
        && aguardandoTemJustificativa()
        && (
          ehManutencaoOuAdmin()
          || colaboradorPodeCancelarChamado()
        );

      allow delete: if ehAdmin();
    }

    match /ativos/{ativoId} {
      allow read: if estaLogado();
      allow create, update, delete: if ehManutencaoOuAdmin();
    }

    match /planosPreventivos/{planoId} {
      allow read: if estaLogado();
      allow create, update, delete: if ehManutencaoOuAdmin();
    }

    match /comunicados/{comunicadoId} {
      allow read: if estaLogado();
      allow create, update, delete: if ehManutencaoOuAdmin();
    }

    match /notificacoes/{notificacaoId} {
      allow read: if estaLogado() && podeLerNotificacao();
      allow create: if estaLogado() && notificacaoCriadaCorretamente();
      allow update: if estaLogado()
        && podeLerNotificacao()
        && marcouSomenteLeituraNotificacao();
      allow delete: if ehAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

# Commit Summary — v30

## Objetivo
Sincronizar pelo Cloud Firestore toda a estrutura editável do Inventário da Unidade.

## Implementado
- nova coleção `inventarioEstrutura`;
- documento único `inventarioEstrutura/principal`;
- sincronização em tempo real de andares, ambientes e áreas internas;
- inclusão e exclusão salvas no Firebase;
- atualização automática em outros dispositivos autenticados;
- migração automática da estrutura local criada nas versões v28/v29;
- cache local mantido apenas como contingência;
- regras do Firestore restritas ao perfil `manutencao`;
- cache do PWA atualizado para v30.

## Arquivos principais alterados
- `js/inventario.js`
- `js/firebase-service.js`
- `js/app.js`
- `js/state.js`
- `src/constants/firebase.js`
- `firestore.rules`
- `service-worker.js`

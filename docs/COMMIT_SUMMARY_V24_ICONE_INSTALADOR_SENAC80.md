# COMMIT SUMMARY — v24 — Ícone do instalador Senac 80 anos

## Objetivo
Substituir a imagem usada na instalação do PWA pela arte Senac 80 anos fornecida pelo usuário, sem alterar regras de negócio, perfis ou Firebase.

## Alterações
- `img/icon-192.png`: recriado a partir da imagem fornecida, em 192×192 px.
- `img/icon-512.png`: recriado a partir da imagem fornecida, em 512×512 px.
- `img/apple-touch-icon.png`: adicionado em 180×180 px para instalação/atalho em dispositivos Apple.
- `index.html`: adicionada referência `apple-touch-icon`.
- `service-worker.js`: atualizado o nome do cache e incluído o novo ícone Apple na lista de recursos em cache.

## Não alterado
- `firestore.rules`
- regras de negócio
- permissões por perfil
- fluxos de OS
- Firebase/Firestore
- CSS e layout da aplicação

## Observação técnica
A imagem de origem é quadrada (447×447 px), portanto as versões do ícone foram geradas por redimensionamento de alta qualidade, sem recorte da composição.

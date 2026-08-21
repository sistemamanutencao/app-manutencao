# COMMIT_SUMMARY_V24_PERFIL_FOTO_RESET_SENAC80

## Objetivo
Atualizar a imagem do perfil da manutenção com a foto fornecida pelo usuário e usar a mesma imagem do instalador (Senac 80 anos) na experiência de redefinição de senha, com ajuste de posicionamento.

## Alterações realizadas
- `img/perfil-manutencao.png`: substituído por versão recortada e redimensionada a partir da foto enviada pelo usuário.
- `img/avatar-redefinicao-senha.png`: substituído pela mesma arte usada no instalador (`icon-512.png`).
- `css/perfil.css`: ajustado o card do avatar da manutenção para exibir foto com `object-fit: cover` e enquadramento superior; ajustado o tamanho/posição da imagem da experiência de redefinição de senha.
- `index.html`: atualizado o texto alternativo da imagem da redefinição de senha para "Senac 80 anos".
- `service-worker.js`: atualizado o nome do cache para garantir atualização do PWA em dispositivos já instalados.

## Impacto
- Sem mudanças em `firestore.rules`, autenticação, permissões ou lógica de negócio.
- A alteração é visual e localizada à aba Perfil e à experiência de redefinição de senha.

# Commit Summary — v31

## Alteração principal

Adicionado o botão **Editar** logo abaixo do botão **Excluir** nos cartões de andares, ambientes e áreas internas do inventário.

## Comportamento

- permite alterar o nome do andar, ambiente ou área interna;
- mantém o identificador e todo o conteúdo já vinculado ao local;
- impede nomes duplicados no mesmo nível da estrutura;
- salva a alteração no Cloud Firestore;
- sincroniza o novo nome entre dispositivos;
- preserva itens, quantidades, imagens e saldos existentes.

## Arquivos alterados

- `js/inventario.js`
- `css/inventario.css`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`

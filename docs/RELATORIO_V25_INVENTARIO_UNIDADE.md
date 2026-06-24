# Relatório v25 — Inventário da Unidade

## Objetivo

Adicionar ao aplicativo uma área simples para consultar os itens instalados em cada ambiente e registrar a imagem de referência e a quantidade disponível em estoque.

## Implementação

- Nova página **Inventário da unidade**, exclusiva da manutenção autorizada.
- Acesso pelo card rápido da tela inicial e pelo botão da tela de perfil.
- Navegação hierárquica: andar → ambiente → área interna → itens.
- SABES mantido como ambiente principal do 1º Andar, com suas áreas internas.
- Banheiro Administrativo mantido como ambiente principal do 0º Andar, com banheiros masculino e feminino internos.
- Cadastro inicial com 4 andares, 27 áreas finais, 13 tipos de item, 150 registros e 265 unidades instaladas.
- Padronização de “Porta papel-toalha” para “Dispenser suporte de papel-toalha”.
- Estoque e imagem vinculados ao cadastro único do item.
- Pesquisa por nome, marca ou modelo na aba Estoque.

## Persistência desta versão

A imagem e o saldo de estoque são salvos no `localStorage` do navegador. Eles não são sincronizados entre dispositivos e podem ser perdidos se os dados do site forem apagados.

Essa decisão mantém a primeira versão simples e evita alteração das regras do Firestore enquanto o fluxo é validado. Uma próxima versão pode migrar os dados para Firebase.

## Arquivos adicionados

- `css/inventario.css`
- `js/inventario-data.js`
- `js/inventario.js`

## Arquivos alterados

- `index.html`
- `css/style.css`
- `js/navigation.js`
- `service-worker.js`

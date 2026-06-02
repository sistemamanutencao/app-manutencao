# Correção — carregamento de chamados do colaborador

## Problema
Após publicar regras mais restritivas, o app podia tentar iniciar a escuta dos chamados antes de concluir o registro do vínculo entre o UID anônimo atual e o código fixo do colaborador.

Quando isso acontecia, a regra do Firestore ainda não reconhecia o UID como autorizado para aquele `colaboradorCodigo`, e a consulta retornava erro de permissão.

## Correção aplicada
No fluxo de autenticação anônima, o app agora:

1. configura o colaborador local;
2. registra/atualiza o vínculo na coleção `colaboradores`;
3. somente depois inicia os monitores de dados, incluindo `chamados`.

Arquivo alterado:

- `js/app.js`

## Observação
OS antigas criadas antes da implantação do código fixo podem continuar invisíveis se não tiverem `colaboradorCodigo` compatível. Nesse caso, será necessária migração pontual dos documentos antigos pelo perfil Manutenção/Admin.

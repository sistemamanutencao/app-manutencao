# Etapa 4 - Preventivas estruturadas

Implementações desta etapa:

- Preventivas separadas das OS corretivas.
- Frequência manual por quantidade e período: dias, semanas ou meses.
- Categoria e subcategoria técnica no plano preventivo.
- Responsável padrão do plano.
- Checklist por plano, com uma atividade por linha.
- Filtros por situação: vencidas, próximos 7 dias, programadas e inativas.
- Busca de preventivas por nome, ativo, local, categoria, subcategoria ou responsável.
- Ao gerar OS preventiva, o sistema leva categoria, subcategoria e checklist para a OS.

Observação Firebase:
A etapa utiliza a coleção `planosPreventivos`, que já estava prevista no app. Foram adicionados novos campos opcionais no documento do plano: `categoria`, `subcategoria`, `checklist` e `responsavelPadrao`.

# Etapa 5 — Dashboard e KPIs

Implementações principais:

- Filtro de período dos indicadores: todo histórico, últimos 7, 30 e 90 dias.
- Filtro de categoria para análise dos indicadores.
- Novos cards de resumo: OS no período, planos vencidos e SLA cumprido.
- Indicadores por status, prioridade, categoria e tipo de manutenção.
- Ranking de setores com maior demanda.
- Ranking de equipamentos críticos.
- Resumo mensal de OS.
- Painel de preventivas vencidas, próximas, programadas e inativas.

Observação Firebase:

O dashboard lê dados já existentes nas coleções `chamados`, `planosPreventivos` e, indiretamente, dados vinculados a ativos nas OS. Caso o usuário de manutenção não visualize todos os indicadores, revise as permissões de leitura autenticada dessas coleções.

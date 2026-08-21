# Critérios permanentes de construção limpa

Este documento define o padrão de evolução do app de manutenção patrimonial SENAC a partir da v16.

## Regra central

Toda nova atualização deve partir da versão oficial vigente e manter a base limpa por padrão. Limpeza e organização não devem ser tratadas como etapa excepcional, mas como requisito permanente de cada entrega publicável.

## Critérios obrigatórios

- Não manter arquivos de tentativa, backup manual ou versão intermediária dentro do ZIP publicável.
- Não manter documentação antiga que contradiga a versão oficial vigente.
- Não deixar código morto, duplicidade evidente ou referências quebradas.
- Não alterar regras de negócio fora do escopo aprovado.
- Não alterar login, perfis, permissões, Firestore, chamados, SLA, comunicados, painel, diagnóstico ou preventivas sem teste direcionado.
- Manter a arquitetura compatível com Firebase Spark, sem depender de Cloud Functions.
- Atualizar documentação de versão quando uma nova entrega for gerada.
- Entregar sempre um resumo objetivo de commit para GitHub.

## Fluxo padrão

```txt
Versão oficial vigente -> cópia de trabalho -> ajuste conservador -> checagem estrutural -> teste no VS Code -> ZIP publicável -> commit summary
```

## Validação mínima antes de publicar

- Abrir o app pelo Live Server.
- Confirmar que não há erro crítico novo no Console.
- Testar colaborador, gerência e manutenção conforme `CHECKLIST_TESTES_VSCODE.md`.
- Confirmar que o service worker não está servindo cache antigo.
- Preservar uma cópia da versão anterior funcional para rollback.

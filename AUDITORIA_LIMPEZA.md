# Auditoria de limpeza - Marco 0

Base analisada: `app-manutencao(7).zip` / `MARCO_ZERO_app-manutencao.zip`.

## Objetivo

Limpar resíduos sem alterar a lógica funcional do app, preservando o comportamento validado dos perfis manutenção, gerência e colaborador.

## Remoções aplicadas nesta versão

1. Removida a pasta `.git/` do pacote de distribuição.
   - Motivo: não faz parte do app em produção, aumenta o ZIP e expõe histórico/metadados locais.
   - Impacto funcional: nenhum.

2. Removido `css/style-backup.css`.
   - Motivo: arquivo de backup residual, não referenciado pelo `index.html`, `css/style.css` ou `service-worker.js`.
   - Impacto funcional: nenhum.

3. Removido `css/diagnostico-manutencao.css`.
   - Motivo: CSS residual não importado por `css/style.css` e não referenciado pelo app.
   - Impacto funcional esperado: nenhum.

4. Removido `js/diagnostico-manutencao.js`.
   - Motivo: script residual não carregado pelo `index.html` e suas funções não são chamadas pelo projeto ativo. O módulo funcional em uso é `js/diagnostico.js`.
   - Impacto funcional esperado: nenhum.

## Validações executadas

- Conferência de arquivos referenciados no `index.html`.
- Conferência de imports em `css/style.css`.
- Conferência da lista de cache em `service-worker.js`.
- Verificação sintática dos arquivos JavaScript com `node --check`.
- Verificação de integridade do ZIP final.

## Pendências recomendadas para uma segunda etapa

Estas ações não foram aplicadas nesta versão porque exigem teste funcional mais amplo:

1. Dividir `index.html` em componentes/seções menores.
2. Reduzir dependência de funções globais e eventos `onclick` no HTML.
3. Padronizar mensagens de erro para substituir `alert()` por um sistema único de feedback.
4. Criar documentação de estrutura do projeto.
5. Revisar duplicidades conceituais entre módulos de renderização, painel e chamados.
6. Avaliar migração futura para estrutura com módulos ES ou Vite, somente se o projeto crescer.

## Checklist obrigatório antes de publicação

### Manutenção
- Entrar no app.
- Abrir painel da manutenção.
- Carregar Diagnóstico Inicial.
- Gerar OS pelo diagnóstico.
- Assumir OS.
- Alterar status técnico.
- Finalizar OS.
- Ver notificações.

### Gerência
- Entrar no app.
- Ver chamados de todos os colaboradores.
- Ver status e histórico.
- Não conseguir assumir OS.
- Não conseguir finalizar OS.
- Não conseguir alterar status técnico.
- Não acessar Diagnóstico Inicial.
- Não acessar Preventivas.

### Colaborador
- Entrar no app.
- Abrir chamado.
- Ver apenas os próprios chamados.
- Acompanhar status.
- Ver notificações permitidas.
- Não ver chamados de todos.
- Não acessar funções da manutenção.

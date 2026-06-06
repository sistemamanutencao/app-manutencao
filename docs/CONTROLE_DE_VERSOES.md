# Controle de Versões do Projeto

Este arquivo registra as bases principais do processo de recuperação, limpeza e organização do app.

## Linha de versões

| Versão | Arquivo | Finalidade | Status |
|---|---|---|---|
| Marco 0 | `app-manutencao(7).zip` | Ponto oficial de restauração funcional | Aprovado |
| v1 | `app-manutencao-marco0-limpeza-segura-v1.zip` | Limpeza segura de arquivos mortos e residuais | Aprovado |
| v2 | `app-manutencao-base-limpa-mapeada-v2.zip` | Mapeamento e documentação inicial | Aprovado |
| v3 | `app-manutencao-base-limpa-organizada-v3.zip` | Padronização leve dos JS | Aprovado |
| v4 | `app-manutencao-base-limpa-refatorada-v4.zip` | Redução de redundância controlada | Aprovado |
| v5 | `app-manutencao-base-limpa-eventos-v5.zip` | Migração de eventos inline estáticos | Aprovado |
| v6 | `app-manutencao-base-limpa-index-organizado-v6.zip` | Organização conservadora do `index.html` | Aprovado |
| v7 | `app-manutencao-base-limpa-eventos-dinamicos-v7.zip` | Migração de eventos dinâmicos | Aprovado em teste inicial |
| v8 | `app-manutencao-base-limpa-modular-v8.zip` | Organização modular controlada | Base da Etapa 9 |
| v9 | `app-manutencao-base-limpa-processo-seguro-v9.zip` | Processo formal de teste, publicação, backup e rollback | Aprovado |
| v10 | `app-manutencao-v10-login-logo-compacto-contraste.zip` | Ajustes visuais da tela de login | Aprovado |
| v11 | `app-manutencao-v11-visual-operacional-lista-os.zip` | Melhorias visuais da lista de OS | Aprovado |
| v12 | `app-manutencao-v12-mensagens-internas.zip` | Melhorias de mensagens internas | Aprovado |
| v13 | `app-manutencao-v13-gerencia-prioridade-os-limpo.zip` | Gerência altera somente prioridade da OS | Aprovado |
| v15 | `app-manutencao-v15-comunicados-sla-exportacao.zip` | Comunicados com níveis/edição, correção de prazo/SLA, filtro Encerrados e exportação ampliada de OS | Aprovado/publicável |
| v16 | `app-manutencao-v16-limpeza-organizacao-codigo.zip` | Limpeza conservadora, documentação coerente e cache PWA revisado sem alterar regras de negócio | Base anterior |
| v17 | `app-manutencao-v17-icone-instalacao.zip` | Atualização das imagens de ícone de instalação do PWA | Base anterior |
| v18 | `app-manutencao-v18-perfil-manutencao-avatar-maior.zip` | Remove resumo de chamados da aba Perfil, adiciona imagem exclusiva para manutenção e amplia o avatar após prévia visual aprovada | Base anterior |
| v19 | `app-manutencao-v19-local-ocorrencia-card-os.zip` | Exibe Local da ocorrência abaixo da Descrição nos cards de OS | Pronto para teste/publicação |

## Como registrar próximas versões

Para cada nova versão, registrar:

- nome do ZIP;
- data;
- objetivo;
- arquivos alterados;
- risco da alteração;
- resultado dos testes;
- decisão: aprovada ou reprovada.

## Regra de nomeação sugerida

```txt
app-manutencao-v10-nome-da-etapa.zip
app-manutencao-v11-nome-da-etapa.zip
```

Evitar nomes genéricos como:

```txt
novo.zip
corrigido.zip
final.zip
final2.zip
```

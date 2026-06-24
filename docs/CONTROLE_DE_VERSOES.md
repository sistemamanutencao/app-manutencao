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
| v19 | `app-manutencao-v19-local-ocorrencia-card-os.zip` | Exibe Local da ocorrência abaixo da Descrição nos cards de OS | Base anterior |
| v20 | `app-manutencao-v20-cadastro-colaboradores(5)(1).zip` | Cadastro de colaboradores no app com primeiro acesso por e-mail autorizado | Base oficial anterior |
| v21 | `app-manutencao-v21-edicao-exclusao-preventivas-diagnostico.zip` | Edição/exclusão em Preventivas e Diagnóstico; Telhado com local Toda unidade | Pronto para teste/publicação |
| v22 | `app-manutencao-v22-url-sistemamanutencao.zip` | Consolidação da URL GitHub Pages após mudança de username para sistemamanutencao e renovação do cache PWA | Pronto para teste/publicação |
| v23 | `app-manutencao-v23-redefinicao-senha.zip` | Botão Esqueci minha senha com envio de e-mail de redefinição pelo Firebase Authentication | Pronto para teste/publicação |

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
| v24 | `app-manutencao-v24-experiencia-redefinicao-senha.zip` | Experiência visual de solicitação de redefinição de senha com avatar, feedback interno e envio pelo Firebase Auth | Pronto para teste/publicação |
| v25 | `app-manutencao-v25-inventario-unidade.zip` | Inventário simples por andar e ambiente, imagem de referência e saldo local de estoque | Pronto para teste/publicação |

| v26 | `app-manutencao-v26-ajuste-layout-inventario.zip` | Ajuste responsivo da tela de inventário, cabeçalho, botão Voltar e legibilidade dos textos | Pronto para teste/publicação |
| v27 | `app-manutencao-v27-torneira-blukit-unificada.zip` | Unifica todas as torneiras temporizadas no cadastro “Torneira temporizada (de mesa) Blukit” | Pronto para teste/publicação |
| v28 | `app-manutencao-v28-gerenciamento-andares-ambientes.zip` | Inclusão e exclusão de andares, ambientes e áreas internas no inventário | Pronto para teste/publicação |

| v29 | `app-manutencao-v29-inventario-firebase.zip` | Imagem e saldo do inventário sincronizados pelo Firestore | Pronto para teste/publicação |

| v30 | `app-manutencao-v30-estrutura-inventario-firebase.zip` | Andares, ambientes e áreas internas sincronizados pelo Firestore | Pronto para teste/publicação |
| v31 | `app-manutencao-v31-edicao-andares-ambientes.zip` | Botão Editar abaixo de Excluir para renomear andares, ambientes e áreas internas com sincronização no Firestore | Pronto para teste/publicação |

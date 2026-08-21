# Procedimento de Backup

Este documento define quando e como salvar cópias seguras do projeto.

## Quando gerar backup

Gerar backup antes de qualquer alteração em:

- login;
- perfis;
- permissões;
- Firestore Rules;
- Firebase configuration;
- criação de OS;
- diagnóstico;
- preventivas;
- notificações;
- eventos de botões;
- estrutura de módulos JavaScript.

## Como gerar backup manual

1. Fechar o Live Server.
2. Conferir que a pasta atual está funcionando.
3. Compactar a pasta inteira do projeto.
4. Nomear com versão e finalidade.
5. Guardar o ZIP sem editar.

Exemplo:

```txt
app-manutencao-v10-ajuste-notificacoes.zip
```

## O que registrar

Para cada backup, registrar:

```txt
Nome do ZIP:
Data:
Base anterior:
Objetivo:
Arquivos alterados:
Firebase alterado? Sim/Não
Rules alteradas? Sim/Não
Resultado do checklist:
Observações:
```

## Regra prática

Se uma alteração pode afetar acesso, dados ou permissões, ela exige backup antes.

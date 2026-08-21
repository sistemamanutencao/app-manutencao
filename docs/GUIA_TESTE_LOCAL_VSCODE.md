# Guia de Teste Local no VS Code

Este documento define o procedimento padrão para testar o app de manutenção patrimonial no VS Code antes de publicar qualquer alteração.

## Objetivo

Evitar alterações diretas em produção e reduzir o risco de quebra em login, perfis, permissões, chamados, diagnóstico, preventivas e notificações.

## Procedimento padrão

1. Manter o ZIP de restauração intacto.
2. Criar uma cópia de trabalho da versão atual.
3. Abrir a pasta do projeto no VS Code.
4. Executar com a extensão Live Server.
5. Testar com usuários de manutenção, gerência e colaborador.
6. Conferir o Console do navegador.
7. Só publicar após o checklist de publicação estar completo.

## Como abrir o projeto

1. Extraia o ZIP da versão que será testada.
2. No VS Code, selecione `Arquivo > Abrir Pasta`.
3. Escolha a pasta raiz do projeto, onde está o `index.html`.
4. Clique com o botão direito em `index.html`.
5. Escolha `Open with Live Server`.

A URL local normalmente será uma destas:

```txt
http://127.0.0.1:5500/
http://localhost:5500/
```

## Atenção ao Firebase

Mesmo em teste local, o app pode apontar para o Firebase real. Portanto:

- use chamados com identificação clara de teste;
- não altere dados reais desnecessariamente;
- não publique regras novas sem revisão;
- não altere documentos de usuários reais sem backup;
- se aparecer `permission-denied`, verificar primeiro Firestore Rules e `usuarios/{uid}`.

## Console do navegador

Durante os testes, abrir:

```txt
F12 > Console
```

Erros críticos que bloqueiam publicação:

- `permission-denied`;
- erro de carregamento de módulo JavaScript;
- função não definida;
- erro ao carregar diagnóstico;
- erro ao carregar notificações;
- falha ao criar, assumir ou finalizar OS.

## Critério mínimo

A versão só pode ser considerada pronta para publicação se os três perfis passarem no checklist operacional.

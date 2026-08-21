# Relatório — Etapa 8: organização modular controlada

Versão base: `app-manutencao-base-limpa-eventos-dinamicos-v7.zip`.

Versão gerada: `app-manutencao-base-limpa-modular-v8.zip`.

## Objetivo

Avançar na organização modular sem alterar regras de negócio, Firebase, Firestore, permissões, perfis, status de OS ou fluxo operacional.

Nesta etapa, a separação foi aplicada apenas no módulo de eventos da interface, porque ele havia concentrado duas responsabilidades diferentes:

1. escutar cliques, mudanças, digitação e envio de formulário;
2. manter o mapa de ações que cada botão ou campo deve executar.

## Alteração aplicada

Foi criado o arquivo:

```txt
js/event-action-maps.js
```

Esse arquivo concentra os mapas de ações da interface:

```txt
acoesClique
acoesMudanca
acoesDinamicas
acoesEntrada
```

O arquivo abaixo ficou mais focado apenas em delegar eventos:

```txt
js/event-bindings.js
```

## Arquivos alterados

```txt
index.html
js/event-bindings.js
js/event-action-maps.js
docs/PLANO_ORGANIZACAO_INCREMENTAL.md
docs/MAPA_MODULOS_JS.md
docs/RELATORIO_ETAPA_8_ORGANIZACAO_MODULAR.md
```

## O que não foi alterado

```txt
firestore.rules
configuração Firebase
coleções do Firestore
campos dos documentos
perfis
permissões
status das OS
login
criação de chamados
diagnóstico
preventivas
notificações
painel operacional
ordem dos módulos de negócio
```

## Motivo da escolha técnica

A alternativa mais agressiva seria separar módulos como `preventivas.js`, `diagnostico.js`, `perfil.js`, `firebase-service.js` e `modal-chamado.js` em arquivos menores.

Essa alternativa foi evitada nesta etapa porque esses arquivos possuem muitas dependências globais e fluxos conectados ao Firestore. Separá-los sem teste automatizado e sem ambiente Firebase de homologação aumentaria o risco de quebrar o app.

A escolha segura foi modularizar primeiro a camada de eventos, que já havia sido isolada nas etapas anteriores.

## Como testar no VS Code

Teste com Live Server e valide principalmente:

```txt
1. Login da manutenção
2. Navegação inferior
3. Botões de notificações
4. Criar chamado
5. Abrir detalhes de chamado
6. Assumir OS
7. Alterar status técnico
8. Finalizar OS
9. Diagnóstico Inicial
10. Preventivas
11. Gerência sem ações técnicas
12. Colaborador vendo apenas os próprios chamados
```

Se algum botão deixar de responder, o ponto provável de correção é:

```txt
js/event-action-maps.js
```

Se o botão é identificado, mas a função final não existe ou não carregou, verificar também:

```txt
js/event-bindings.js
ordem dos scripts no index.html
```

## Critério de aceite

A v8 só deve ser considerada base estável se:

```txt
- o app abrir sem erro no console;
- todos os botões principais responderem;
- manutenção, gerência e colaborador passarem no checklist;
- não houver erro de permissão novo no Firestore;
- notificações e diagnóstico carregarem normalmente.
```

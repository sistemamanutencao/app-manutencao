# Controle Técnico de Manutenção SENAC

Versão reestruturada para uso operacional do Oficial de Manutenção.

## Renomeação aplicada

- Nome do app/PWA: **Controle Técnico de Manutenção SENAC**.
- Nome curto do app: **Controle Técnico**.
- Título da tela inicial ajustado para diagnóstico, OS e rotina do Oficial de Manutenção.
- Cache do service worker atualizado para `controle-tecnico-manutencao-senac-v1`.

## Principal mudança estrutural

Foi criada a área **Diagnóstico inicial**, acessível para manutenção autorizada.

Ela serve para levantar a situação atual da unidade antes de transformar tudo em Ordem de Serviço. A ideia é separar:

- corretiva urgente;
- corretiva normal;
- preventiva;
- inspeção;
- melhoria;
- recorrente.

## Campos do diagnóstico

Cada item do diagnóstico registra:

- local vistoriado;
- sistema;
- tipo;
- prioridade P1 a P5;
- status;
- descrição técnica;
- risco/impacto;
- ação recomendada;
- material necessário;
- autor, unidade e data.

## Prioridades adotadas

- **P1 - Urgente**: risco à segurança, paralisação ou falha crítica.
- **P2 - Alta**: impacto direto em aula, atendimento ou operação.
- **P3 - Normal**: correção necessária, sem urgência imediata.
- **P4 - Baixa**: baixa criticidade ou melhoria não crítica.
- **P5 - Preventiva**: rotina, inspeção, limpeza, reaperto ou teste programável.

## Checklist rápido incluído

A nova área inclui um checklist por grupos:

- segurança e riscos;
- elétrica e iluminação;
- hidráulica e sanitários;
- climatização;
- civil, portas e mobiliário;
- área externa e prevenção.

Ao clicar em um item do checklist rápido, o app preenche a descrição e sugere o sistema correspondente.

## Conversão de diagnóstico em OS

Cada item do diagnóstico possui o botão **Gerar OS a partir do item**.

Ele abre a tela de Nova OS e pré-preenche:

- andar/local;
- tipo de manutenção;
- categoria provável;
- prioridade;
- descrição com origem no diagnóstico.

A OS ainda precisa ser revisada e salva manualmente. Isso evita abertura automática de OS incompleta.

## Firestore

Foi adicionada a coleção:

```txt
diagnosticos
```

As regras foram atualizadas para permitir leitura, criação, atualização e exclusão apenas para perfil `manutencao`.

Antes de usar em produção, publique o novo arquivo `firestore.rules` no Firebase.

## Arquivos adicionados

- `js/diagnostico.js`
- `css/diagnostico.css`
- `RELATORIO_CONTROLE_TECNICO.md`

## Arquivos alterados

- `index.html`
- `manifest.json`
- `service-worker.js`
- `firestore.rules`
- `src/constants/firebase.js`
- `js/state.js`
- `js/app.js`
- `js/navigation.js`
- `js/firebase-service.js`
- `js/perfil.js`
- `css/style.css`

## Observação técnica

A estrutura original foi preservada para reduzir risco de quebra. Não foi feita troca de arquitetura nem refatoração ampla. A alteração foi incremental: nova área de diagnóstico, nova coleção Firestore e ajustes de nome/fluxo.

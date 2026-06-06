# Relatório v19 — Local da ocorrência no card de OS

## Objetivo

Exibir o campo **Local da ocorrência** diretamente no card da OS, abaixo de **Descrição**, para melhorar a leitura operacional da lista de chamados.

## Base utilizada

```txt
app-manutencao-v18-perfil-manutencao-avatar-maior.zip
```

## Arquivos alterados

- `js/chamados-render.js`
- `css/chamados.css`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/PLANO_ROLLBACK.md`
- `docs/RELATORIO_V19_LOCAL_OCORRENCIA_CARD_OS.md`

## Alterações aplicadas

- Adicionado o texto **Local da ocorrência:** abaixo de **Descrição:** no card da OS.
- O local exibido usa a composição `andar / local` quando ambos existem.
- Quando não houver andar/local, o card exibe **Não informado**.
- Mantido o comportamento de abrir detalhes da OS ao tocar no card.
- Atualizado o cache do service worker para forçar renovação do JavaScript e CSS do PWA.

## O que não foi alterado

- Login.
- Perfis e permissões.
- Firestore Rules.
- Cadastro/abertura de OS.
- Diagnóstico inicial.
- Preventivas.
- Comunicados.
- Exportações.
- SLA.
- Painel da manutenção.

## Risco

Baixo. A alteração fica restrita à renderização visual dos cards de OS. O ponto sensível é `js/chamados-render.js`, porque a função `criarCardChamado` é usada na aba OS e na lista de chamados recentes do início.

## Teste recomendado no VS Code

1. Abrir o app com Live Server.
2. Entrar como manutenção.
3. Verificar se os cards mostram:
   - Solicitante;
   - Setor;
   - Descrição;
   - Local da ocorrência.
4. Tocar no card e confirmar que os detalhes da OS continuam abrindo.
5. Entrar como gerência e repetir a conferência.
6. Entrar como colaborador e confirmar que apenas os próprios chamados aparecem.
7. Conferir um chamado gerado pelo diagnóstico inicial da unidade.

## Resultado esperado

O card deve seguir o padrão:

```txt
Solicitante: Manutenção
Setor: Manutenção
Descrição: Origem: diagnóstico inicial da unidade...
Local da ocorrência: [andar] / [local]
```

Quando o andar não existir, o app deve exibir apenas o local.

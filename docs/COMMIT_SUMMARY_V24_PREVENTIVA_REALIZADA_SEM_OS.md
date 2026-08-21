# V24 — Preventiva realizada sem geração de OS

## Alterações
- Adicionada ação **Marcar como realizada** nos planos preventivos ativos.
- O registro pode ser concluído sem gerar uma OS quando nenhuma anomalia for encontrada.
- Ao confirmar, o sistema registra data, responsável, observação e histórico da execução.
- A próxima execução é recalculada conforme a frequência do plano, retirando a preventiva da condição de vencida.
- A geração de OS preventiva permanece disponível quando for identificado um problema.
- Textos da tela foram ajustados para explicar as duas opções.

## Firebase
- Nenhuma alteração em `firestore.rules`.
- Foram adicionados apenas campos opcionais aos documentos existentes da coleção de preventivas.

## Commit sugerido
`feat: permite concluir preventiva sem gerar OS`

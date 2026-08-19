# Commit Summary - V24 Nova OS simplificada

## Objetivo

Reduzir dúvidas no preenchimento da tela Nova OS removendo campos que não possuem uso prático na operação atual.

## Alterações

- Removido o campo Equipamento / patrimônio / QR Code do formulário Nova OS.
- Removido o campo Melhor horário para atendimento do formulário Nova OS.
- Removido o campo Necessário acompanhar do formulário Nova OS.
- Removidas essas informações dos detalhes e cards operacionais de OS para reduzir ruído visual.
- Ajustada a validação para exigir apenas os campos realmente úteis na abertura da OS.
- Mantidos valores internos de compatibilidade para registros antigos e serviços que ainda esperam esses campos.
- Atualizado o cache do service worker.

## Impacto

- Não altera regras do Firestore.
- Não altera perfis, autenticação ou permissões.
- Não altera coleções nem documentos existentes.
- OS antigas podem manter os campos no banco, mas eles deixam de ser destacados na interface operacional.

## Rollback

Retornar para o ZIP anterior: app-manutencao-v24-escadaria-emergencia-1-andar.zip.

## Commit sugerido

```text
refactor: simplifica formulario de nova os
```

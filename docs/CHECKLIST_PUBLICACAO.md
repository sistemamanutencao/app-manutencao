# Checklist de Publicação

Este checklist deve ser executado antes de subir qualquer versão para GitHub Pages, Firebase Hosting ou outro ambiente público.

## Identificação da versão

- Versão testada:
- Data do teste:
- Responsável pelo teste:
- Base utilizada:
- Arquivos alterados:

## Verificação inicial

- [ ] O projeto foi testado no VS Code com Live Server.
- [ ] O Console do navegador foi verificado.
- [ ] Não existem erros críticos no Console.
- [ ] A versão anterior funcional está salva em ZIP.
- [ ] O Firebase usado no teste foi identificado: real ou teste.
- [ ] `firestore.rules` não foi alterado sem revisão.

## Perfil Manutenção

- [ ] Login funciona.
- [ ] Painel da manutenção abre.
- [ ] Diagnóstico Inicial carrega.
- [ ] Geração de OS pelo diagnóstico funciona.
- [ ] OS pode ser assumida.
- [ ] Status técnico pode ser alterado.
- [ ] OS pode ser finalizada.
- [ ] Notificações aparecem.
- [ ] Notificação pode ser aberta.
- [ ] Preventivas carregam, quando aplicável.

## Perfil Gerência

- [ ] Login funciona.
- [ ] Chamados de todos os colaboradores aparecem.
- [ ] Status e histórico aparecem.
- [ ] Gerência não consegue assumir OS.
- [ ] Gerência não consegue finalizar OS.
- [ ] Gerência não consegue alterar status técnico.
- [ ] Gerência não acessa Diagnóstico Inicial.
- [ ] Gerência não acessa Preventivas.

## Perfil Colaborador

- [ ] Login funciona ou fluxo de entrada permitido funciona.
- [ ] Colaborador consegue abrir chamado.
- [ ] Colaborador vê apenas os próprios chamados.
- [ ] Colaborador acompanha status.
- [ ] Colaborador vê notificações permitidas.
- [ ] Colaborador não vê chamados de todos.
- [ ] Colaborador não acessa funções da manutenção.

## Firebase e Firestore

- [ ] Documentos em `usuarios/{uid}` conferidos.
- [ ] Campo `ativo` é booleano `true`.
- [ ] Campo `perfil` está correto: `manutencao`, `gerencia` ou `colaborador`.
- [ ] Coleções principais carregam sem `permission-denied`.
- [ ] Diagnóstico carrega sem erro.
- [ ] Notificações carregam sem erro.

## Decisão

- [ ] A versão está aprovada para publicação.
- [ ] A versão não está aprovada e deve voltar para correção.

Observações:

```txt
Registrar aqui qualquer comportamento fora do esperado.
```

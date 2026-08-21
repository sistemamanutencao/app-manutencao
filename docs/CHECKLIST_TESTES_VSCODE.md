# Checklist de testes no VS Code

Use este checklist antes de publicar qualquer atualização.

## Preparação

1. Extrair o ZIP em uma pasta de teste.
2. Abrir a pasta no VS Code.
3. Abrir `index.html` com Live Server.
4. Usar aba anônima ou limpar cache se houver comportamento estranho.
5. Abrir o DevTools do navegador e observar a aba Console.

## Teste base

```txt
[ ] App abriu sem tela branca
[ ] Console sem erro crítico novo
[ ] Firebase conectou
[ ] Login abriu corretamente
```

## Perfil manutenção

```txt
[ ] Login com usuário manutenção
[ ] Abre painel da manutenção
[ ] Carrega chamados
[ ] Carrega Diagnóstico Inicial
[ ] Gera OS pelo diagnóstico
[ ] Cria OS manualmente
[ ] Assume OS
[ ] Altera status técnico
[ ] Finaliza OS
[ ] Visualiza notificações
[ ] Acessa Preventivas
[ ] Acessa Ativos, se aplicável
```

## Perfil gerência

```txt
[ ] Login com usuário gerência
[ ] Visualiza chamados de todos os colaboradores
[ ] Visualiza status
[ ] Visualiza histórico
[ ] Não acessa Diagnóstico Inicial
[ ] Não acessa Preventivas
[ ] Não consegue assumir OS
[ ] Não consegue finalizar OS
[ ] Não consegue alterar status técnico
```

## Perfil colaborador

```txt
[ ] Login com usuário colaborador
[ ] Abre chamado
[ ] Visualiza apenas os próprios chamados
[ ] Acompanha status dos próprios chamados
[ ] Visualiza notificações permitidas
[ ] Não visualiza chamados de todos
[ ] Não acessa painel da manutenção
[ ] Não acessa Diagnóstico Inicial
[ ] Não acessa Preventivas
```

## Firestore

Verificar no Firebase Console:

```txt
[ ] Documento em usuarios/{uid} existe para cada usuário de teste
[ ] Campo ativo é boolean true
[ ] Campo perfil está correto: manutencao, gerencia ou colaborador
[ ] OS criada aparece em chamados
[ ] Notificação aparece em notificacoes, se aplicável
[ ] Diagnóstico gera OS sem permission-denied
```

## Antes de publicar

```txt
[ ] ZIP do estado anterior guardado
[ ] Alterações testadas localmente
[ ] Checklist dos três perfis aprovado
[ ] Nenhum erro novo no console
[ ] Nenhuma alteração acidental em firestore.rules
[ ] Nenhuma alteração acidental em src/constants/firebase.js
```

## Se algo falhar

1. Não publicar.
2. Anotar o erro do Console.
3. Voltar para a base limpa ou Marco 0.
4. Isolar o último arquivo alterado.
5. Corrigir e repetir o checklist.

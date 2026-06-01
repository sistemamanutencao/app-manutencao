# Atualização

## Etapa 12 — Limpeza inicial da tela de login

- Removido o título **Perfil** da aba de login.
- Removido o texto informativo **Colaboradores entram com nome e setor. Manutenção entra com e-mail e senha.**
- Removida a manipulação dinâmica desse texto no módulo `js/perfil.js`, evitando referência a elemento inexistente.
- Mantida a estrutura atual de acesso do colaborador e da manutenção.
- Mantido o layout original, sem aplicar ainda a nova proposta visual da aba.
- Cache do PWA atualizado para carregar a nova versão da tela.
- Não houve alteração em Firebase Authentication.
- Não houve alteração em coleções Firebase.
- Não houve necessidade de alteração em `firestore.rules`.

### Commit sugerido

```txt
refactor: remover textos iniciais da tela de login
```

---

## Exportação de OS finalizadas

- Adicionado bloco de exportação na tela de Ordens de Serviço para usuários da manutenção.
- Implementada exportação local das OS finalizadas nos formatos Excel, PDF e Word.
- Consideradas como finalizadas as OS com status `CONCLUÍDO`, `VALIDADO` ou `ENCERRADO`.
- Centralizadas as configurações de exportação em `src/constants/exportacoes.js`, evitando novos arrays espalhados.
- Criado o módulo `js/exportacoes.js` para concentrar montagem de relatório, tabela, download e impressão em PDF.
- A exportação respeita a busca textual atual da tela de OS, mas sempre limita o relatório aos status finalizados.
- Cache do PWA atualizado para carregar os novos arquivos de exportação.
- Não houve necessidade de nova coleção Firebase nem alteração em `firestore.rules`, pois a exportação usa os dados já carregados no app.

### Commit sugerido

```txt
feat: adicionar exportacao de os finalizadas
```

---

- O andar **Telhado** agora utiliza os mesmos locais vinculados ao **1º ANDAR**.
- Removida a lista específica anterior do Telhado para evitar redundância.
- Mantida a fonte única `locaisPrimeiroAndarManutencao` para facilitar manutenção futura.
- Cache do PWA atualizado para carregar a nova versão.


## Controle técnico e logs automáticos

- Adicionado técnico responsável padrão do sistema.
- Adicionado histórico técnico automático nas OS.
- Inclusão de logs estruturados para rastreabilidade operacional.
- Compatibilidade com OS antigas sem campo de logs.
- Exibição do responsável técnico no modal da OS.

Commit sugerido:
feat: adicionar técnico responsável padrão e logs automáticos nas OS


## Remoção do solicitante manual

- Removido o campo manual **Nome do Solicitante** do formulário de abertura de OS.
- Removida a exibição **Solicitante informado** dos detalhes e do painel.
- A OS agora utiliza somente os dados do usuário autenticado em **Criado por**.
- Ajustadas buscas, notificações, perfil e contagem de chamados para usar `criadoPorUid` e `criadoPorNome`.
- Mantida a estrutura de técnico responsável padrão e logs automáticos.
- Cache do PWA atualizado para carregar esta nova versão.

Commit sugerido:
refactor: remover solicitante manual e usar usuario autenticado como criador da OS


---

## Correção emergencial - envio de OS ao Firebase

- Corrigida a criação de OS após a remoção do campo manual de solicitante.
- Mantido o visual limpo usando apenas **Criado por** na interface.
- Adicionados campos internos de compatibilidade (`solicitanteId`, `solicitanteNome`, `solicitanteEmail`) preenchidos automaticamente com o usuário autenticado, para evitar bloqueio por regras antigas do Firestore.
- Melhorada a mensagem técnica de erro no envio ao Firebase.

### Commit sugerido

```txt
fix: manter compatibilidade com regras do firebase ao criar OS autenticada
```

---

## Organização das coleções Firebase

- Centralizados os nomes das coleções Firebase na constante `COLLECTIONS`.
- Substituídos acessos diretos como `collection("chamados")` por `collection(COLLECTIONS.CHAMADOS)`.
- Incluídas as coleções reais utilizadas pelo app: `chamados`, `planosPreventivos`, `ativos`, `usuarios`, `notificacoes` e `comunicados`.
- Adicionado o arquivo `firestore.rules` na raiz do projeto para versionamento, backup e manutenção das regras do Firestore.
- Cache do PWA atualizado para carregar esta nova versão.

### Commit sugerido

```txt
refactor: centralizar colecoes firebase e versionar regras do firestore
```


- Melhoria visual do histórico técnico das OS com timeline e ícones.

---

## Centralização das constantes do sistema

- Criada a pasta `/src/constants` para concentrar constantes estruturais do app.
- Separados os dados de andares, locais, categorias, subcategorias, status, prioridades, tipos de manutenção e coleções Firebase.
- Mantido o comportamento atual do app, apenas reorganizando a origem das listas e nomes fixos.
- Removida a duplicação da constante `COLLECTIONS` de `js/firebase-service.js`, passando a usar `/src/constants/firebase.js`.
- Adicionado `src/constants/index.js` como índice central das constantes em `window.APP_CONSTANTS`.
- Cache do PWA atualizado para carregar os novos arquivos de constantes.

### Commit sugerido

```txt
refactor: centralizar constantes estruturais do sistema
```

---

## Exportação de OS finalizadas sem imagens

- Adicionada exportação de OS finalizadas em Excel, PDF e Word.
- A exportação considera OS com status `CONCLUÍDO`, `VALIDADO` ou `ENCERRADO`.
- Os arquivos exportados trazem somente dados textuais/estruturados informados na abertura da OS.
- Imagens, anexos e evidências visuais não são incluídos na exportação para manter os arquivos leves e evitar dependência do Storage.
- Criado o módulo `js/exportacoes.js` para isolar a regra de geração dos relatórios.
- Criada a constante `src/constants/exportacoes.js` para centralizar status e colunas exportadas.
- Cache do PWA atualizado para carregar os novos arquivos.
- Não há necessidade de criar nova coleção no Firebase.
- Não há necessidade de alterar `firestore.rules`.

### Commit sugerido

```txt
feat: exportar os finalizadas sem imagens
```

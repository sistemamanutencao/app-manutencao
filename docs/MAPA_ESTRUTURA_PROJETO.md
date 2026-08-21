# Mapa técnico da estrutura do projeto

Base atual de referência: `app-manutencao-v16-limpeza-organizacao-codigo.zip`.

Objetivo: documentar a estrutura atual do app para reduzir risco de quebra em login, perfis, Firestore, OS, diagnóstico, preventivas, comunicados, SLA e notificações.

## Visão geral

O projeto é um app web/PWA estático. A aplicação é carregada a partir de `index.html`, usa CSS modular centralizado por `css/style.css`, scripts globais em `js/`, constantes em `src/constants/`, Firebase via CDN e Service Worker para PWA.

## Estrutura principal

```txt
app-manutencao/
├── index.html
├── manifest.json
├── service-worker.js
├── firestore.rules
├── css/
├── js/
├── src/constants/
├── img/
└── docs/
```

## Arquivos de entrada

### `index.html`

Função atual:
- concentra a estrutura visual das páginas/seções;
- carrega Firebase via CDN;
- carrega constantes em `src/constants/`;
- carrega módulos JS em ordem manual;
- possui vários eventos inline como `onclick`, `onchange`, `oninput` e `onsubmit`.

Situação técnica:
- arquivo grande, com aproximadamente 1462 linhas;
- é o principal candidato para organização futura;
- não deve ser quebrado em partes antes de um teste completo, pois muitos IDs do HTML são consumidos diretamente pelos arquivos JS.

### `firestore.rules`

Função atual:
- controla permissões de leitura/escrita no Firestore;
- depende dos documentos `usuarios/{uid}`;
- campos críticos: `ativo`, `perfil`, `email`, `nome`, `setor`, `unidade`.

Risco:
- alteração sensível. Qualquer mudança deve ser testada com manutenção, gerência e colaborador.

### `service-worker.js`

Função atual:
- cache/PWA;
- pode interferir em testes se o navegador carregar versão antiga.

Orientação:
- em teste local, usar aba anônima ou limpar cache se comportamento parecer incoerente.

## CSS

### `css/style.css`

Função atual:
- arquivo central de importação dos demais CSS.

Ordem de importação atual:
```txt
base.css
layout.css
componentes.css
inicio.css
chamados.css
painel.css
notificacoes.css
modal.css
areas.css
comunicados.css
perfil.css
diagnostico.css
responsive.css
```

Orientação:
- manter `style.css` como ponto único de entrada;
- ajustes visuais devem preferencialmente ocorrer no arquivo CSS correspondente ao módulo;
- evitar CSS novo dentro do `index.html`.

## JavaScript

O projeto usa scripts globais, não módulos ES (`import/export`). A ordem de carregamento em `index.html` é parte da arquitetura e não deve ser alterada sem teste.

### Ordem de carregamento JS atual

```txt
Firebase CDN
src/constants/andares.js
src/constants/locais.js
src/constants/categorias.js
src/constants/subcategorias.js
src/constants/status.js
src/constants/prioridades.js
src/constants/tiposOS.js
src/constants/perfis.js
src/constants/permissoes.js
src/constants/firebase.js
src/constants/exportacoes.js
src/constants/index.js
js/state.js
js/ui-feedback.js
js/auth-permissions.js
js/firebase-service.js
js/utils.js
js/navigation.js
js/notificacoes.js
js/categorias.js
js/logs-tecnicos.js
js/chamados-form.js
js/chamados-render.js
js/chamados.js
js/exportacoes.js
js/modal-chamado.js
js/painel-indicadores.js
js/painel-cards.js
js/painel-status.js
js/painel.js
js/perfil.js
js/comunicados.js
js/ativos.js
js/leitor-qr.js
js/preventivas.js
js/diagnostico.js
js/app.js
```

## Mapa dos módulos JS

### `js/state.js`
Estado global do app.

Contém variáveis centrais como usuário atual, chamados, filtros, anexos e ouvintes do Firebase. É sensível porque vários módulos dependem desse estado.

### `js/app.js`
Inicialização e controle geral.

Responsável por:
- inicialização da aplicação;
- estado de autenticação;
- preparação da tela sem sessão;
- aplicação de permissões visuais;
- início e encerramento dos monitores de dados.

Risco alto: mexe em login, permissões e carregamento global.

### `js/auth-permissions.js`
Regras de perfil no front-end.

Responsável por:
- normalizar perfil;
- identificar manutenção, gerência e colaborador;
- verificar permissões por perfil.

Risco alto: afeta acesso da manutenção, gerência e colaborador.

### `js/firebase-service.js`
Camada de acesso ao Firebase/Firestore.

Responsável por:
- configuração Firebase;
- autenticação;
- leitura e gravação de chamados;
- notificações;
- comunicados;
- ativos;
- preventivas;
- diagnóstico;
- logs.

Risco alto: mexe com persistência e permissões reais.

### `js/navigation.js`
Navegação entre páginas/seções internas.

Responsável por trocar telas e acionar renderizações ao abrir páginas.

### `js/notificacoes.js`
Interface e ações das notificações.

Depende dos dados carregados do Firestore e do estado do usuário.

### `js/categorias.js`
Preenchimento de selects de local, andar, categoria e subcategoria.

Depende das constantes de localização e categorias.

### `js/chamados-form.js`
Criação de OS pelo formulário.

Responsável por:
- ler campos;
- validar dados;
- montar objeto de chamado;
- converter fotos;
- gerar número da OS;
- limpar formulário.

Risco médio/alto: afeta abertura de chamados.

### `js/chamados-render.js`
Renderização das OS.

Responsável por:
- filtrar chamados visíveis;
- renderizar cards;
- aplicar busca e filtros;
- montar informações visuais da OS.

Risco médio: afeta visualização e filtros.

### `js/chamados.js`
Ações operacionais sobre chamados.

Responsável por:
- enviar OS;
- pesquisar;
- assumir atendimento;
- concluir/cancelar/atualizar status.

Risco alto: afeta operação da manutenção.

### `js/modal-chamado.js`
Modal de detalhes da OS.

Responsável por abrir detalhes, fotos, histórico técnico e ações do chamado.

### `js/painel-indicadores.js`, `js/painel-cards.js`, `js/painel-status.js`, `js/painel.js`
Painéis e indicadores.

Responsáveis por métricas, cards, agrupamentos por status e dashboard.

Risco médio: afeta painel da manutenção/gerência.

### `js/perfil.js`
Tela e ações de perfil do usuário.

Inclui dados do usuário, possível edição local e exibição de perfil.

### `js/comunicados.js`
Renderização e criação de comunicados.

### `js/ativos.js`
Cadastro e gestão de ativos/equipamentos.

Inclui QR Code, vínculo com OS e histórico por ativo.

### `js/leitor-qr.js`
Leitura de QR Code para ativos.

### `js/preventivas.js`
Planos e controles de manutenção preventiva.

Risco alto para perfil manutenção, pois é funcionalidade restrita.

### `js/diagnostico.js`
Diagnóstico Inicial da Unidade.

Responsável por:
- carregar itens de diagnóstico;
- filtrar por status/prioridade;
- gerar OS a partir de item do diagnóstico.

Risco alto: funcionalidade central exclusiva da manutenção.

### `js/exportacoes.js`
Exportação de dados.

### `js/logs-tecnicos.js`
Geração de logs técnicos de chamados.

### `js/utils.js`
Funções utilitárias gerais.

### `js/ui-feedback.js`
Feedback visual, mensagens e loading.

## Constantes

Pasta: `src/constants/`

Responsável por dados estáticos usados pelo app:
- andares;
- locais;
- categorias;
- subcategorias;
- status;
- prioridades;
- tipos de OS;
- perfis;
- permissões;
- configuração Firebase;
- exportações.

Risco:
- alterar nomes de perfil, permissões ou status pode quebrar filtros e regras de negócio.

## Pontos de atenção encontrados

### 1. `index.html` grande demais

Não é erro funcional, mas dificulta manutenção. Deve ser organizado por etapas.

### 2. Muitos eventos inline

Foram encontrados eventos no HTML:

```txt
onclick: 49
onchange: 10
oninput: 4
onsubmit: 1
```

Isso torna a estrutura mais acoplada ao escopo global do JavaScript. A migração para `addEventListener` deve ser gradual.

### 3. Dependência forte de IDs do HTML

Os módulos JS acessam muitos elementos por `document.getElementById`. Alterar IDs no HTML pode quebrar funções.

### 4. Arquitetura global

Os arquivos JS compartilham funções e variáveis globais. Antes de modularizar com `type="module"`, seria necessário replanejar a ordem e os escopos.

### 5. Service Worker pode mascarar alterações

Em testes, o navegador pode carregar arquivos antigos por cache. Sempre validar em aba anônima ou limpar cache quando necessário.

## Classificação de risco por área

```txt
Baixo risco:
- documentação
- comentários técnicos
- organização de arquivos não carregados
- ajustes visuais pequenos em CSS isolado

Médio risco:
- renderização de cards
- filtros de painel
- textos da interface
- padronização de feedback visual

Alto risco:
- login
- auth-permissions.js
- firebase-service.js
- firestore.rules
- chamados.js
- chamados-form.js
- diagnostico.js
- preventivas.js
- app.js
```

## Recomendação para a próxima etapa

A próxima etapa mais segura é criar uma documentação de fluxo funcional por perfil e depois atacar uma melhoria de baixo risco, como padronizar comentários e organizar pequenos trechos duplicados sem mudar comportamento.

Não recomendo quebrar o `index.html` em múltiplos arquivos agora, porque o projeto é estático e isso pode exigir build, fetch de fragments ou mudança estrutural mais ampla.

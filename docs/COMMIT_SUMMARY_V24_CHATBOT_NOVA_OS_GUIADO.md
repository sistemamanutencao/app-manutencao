# COMMIT_SUMMARY — v24 Chatbot guiado para Nova OS

## Objetivo
Substituir o formulário tradicional da aba **Nova OS** por um assistente conversacional guiado, mantendo o mesmo fluxo de gravação no Firebase/Firestore e reduzindo digitação livre do solicitante.

## Fluxo implementado
1. Local principal: Estacionamento, Térreo, 1º andar, 2º andar, Área externa ou Outro local.
2. Ambiente filtrado conforme o local escolhido.
3. Categoria do problema.
4. Característica/subcategoria do problema.
5. Perguntas condicionais de risco e impacto.
6. Prioridade calculada automaticamente (armazenada nos valores já usados pelo app: Baixa, Média, Alta ou Urgente; "Média" é exibida ao usuário como "Normal").
7. Detalhe complementar opcional.
8. Foto opcional: câmera, galeria ou continuar sem foto.
9. Conferência e edição seletiva antes do envio.
10. Confirmação após criação com acesso ao acompanhamento da OS.

## Categorias conversacionais
- Elétrica
- Hidráulica
- Civil / Alvenaria (inclui Gesso)
- Pintura
- Marcenaria
- Climatização
- Equipamentos / Elevadores
- Outro

A opção elétrica **Iluminação / lâmpada / painel de LED** contempla painéis de LED.

## Nova estrutura de localização
### Estacionamento
Lavanderia; Subestação; Cisterna Coletora; Casa de Bombas d’Água; Reservatório d’Água; Depósito; Elevador de Carga - Limpeza; Elevador de Carga - Cozinha; Elevador Social.

### Térreo
Banheiro Masculino; Banheiro Feminino; Confeitaria; Guarita; Recepção; Cozinha; Auditório; Administração; Sala Master; Sala Gerência; Sala Compras; Sala Financeiro; Banheiro da Administração; Banheiro do Camarim; Sala de Controle; Escadaria; Elevador de Carga - Limpeza; Elevador de Carga - Cozinha; Elevador Social.

### 1º andar
Biblioteca; Banheiro da Biblioteca; Área de Convivência 1; Área de Convivência 2; Banheiro Feminino; Banheiro Masculino; Banheiro PCD; Sala TI; Escadaria; Escadaria de Emergência; Elevador de Carga - Limpeza; Elevador Social.

### 2º andar
Banheiro Masculino; Banheiro Feminino; SABES; Sala de Manicure; Espaço Salão; Banheiro Feminino SABES; Banheiro Masculino SABES; Depósito; Esterilização; Expurgo; Depósito Inbel; Sala de Instrutores; Sala 01 a Sala 09; Sala 10 — Informática; Sala 11 — Informática; Sala 12; Sala 13 — Laboratório de Hardware; Sala 14 — Enfermagem; Escadaria; Escadaria de Emergência; Elevador de Carga - Limpeza; Elevador Social.

### Área externa
Área externa — Frente; Área externa — Fundos; Área externa Confeitaria; Telhado; Outro ambiente externo.

## Compatibilidade
- O chatbot não grava diretamente no Firestore.
- A OS continua sendo criada pela função existente `criarChamado()` e por `criarChamadoFirebase()`.
- O objeto de OS mantém os campos existentes: `andar`, `local`, `tipoManutencao`, `categoria`, `subcategoria`, `prioridade`, `descricao`, fotos e metadados do solicitante.
- O nome do equipamento selecionado é enviado no campo já existente `equipamentoNome`.
- A geração de OS pelo Diagnóstico Inicial foi adaptada para iniciar o chatbot com contexto de local/detalhes quando possível.
- A geração de OS Preventiva continua usando o fluxo próprio existente e não foi alterada.

## Firebase
`firestore.rules`, `js/firebase-service.js` e `src/constants/firebase.js` não foram alterados.

## Perfil e redefinição de senha
A versão final também preserva as alterações anteriores:
- foto enviada pelo usuário como imagem do perfil da manutenção;
- imagem Senac 80 anos na redefinição de senha;
- ícones Senac 80 anos do PWA;
- splash antigo dourado removido.

## Arquivos principais alterados
- `index.html`
- `css/style.css`
- `css/nova-os-chat.css` (novo)
- `css/perfil.css`
- `js/nova-os-chat.js` (novo)
- `js/chamados.js`
- `js/chamados-form.js`
- `js/navigation.js`
- `js/diagnostico.js`
- `js/event-action-maps.js`
- `src/constants/andares.js`
- `src/constants/locais.js`
- `service-worker.js`
- `img/perfil-manutencao.png`
- `img/avatar-redefinicao-senha.png`

## Validações executadas
- sintaxe de todos os JavaScript com `node --check`;
- `manifest.json` válido;
- CSS analisado sem erros de parser;
- IDs HTML sem duplicidade;
- recursos do service worker existentes;
- imagens PNG válidas;
- imagem da redefinição de senha idêntica ao `icon-512.png` do instalador;
- ausência de referência ativa à antiga logo dourada;
- hashes dos arquivos críticos do Firebase confirmados como inalterados.

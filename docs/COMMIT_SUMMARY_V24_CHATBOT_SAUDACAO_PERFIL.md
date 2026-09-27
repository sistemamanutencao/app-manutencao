# COMMIT_SUMMARY_V24_CHATBOT_SAUDACAO_PERFIL

## Correção
- Corrigida a saudação do chatbot para refletir o perfil atualmente autenticado: Manutenção, Gerência ou Colaborador.
- O chatbot agora detecta troca de conta sem recarregar a página e reinicia apenas o estado da Nova OS, evitando manter mensagens da sessão anterior.
- Atualizada a versão do cache do service worker para distribuição da correção.

## Segurança
- Sem alterações em `firestore.rules`.
- Sem alterações em `js/firebase-service.js`.
- Sem alterações em permissões, schema das OS ou autenticação.

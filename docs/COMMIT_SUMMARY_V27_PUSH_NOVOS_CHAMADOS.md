# v27 — Alertas push de novos chamados

## Objetivo
Preparar o aplicativo para receber alertas reais de novos chamados no celular, inclusive com o PWA em segundo plano, sem depender de Cloud Functions pagas do Firebase.

## Arquitetura
- Firebase Cloud Messaging (FCM) no PWA;
- Service Worker existente ampliado para mensagens em segundo plano;
- Cloudflare Worker como backend de envio FCM HTTP v1;
- Workers KV para guardar somente tokens dos aparelhos da manutenção;
- autenticação do backend usando Firebase ID token;
- Service Account mantida exclusivamente nos Secrets do Cloudflare.

## Fluxo implementado
1. Perfil Manutenção acessa **Perfil → Alertas no celular**.
2. Após configuração do backend, o botão **Ativar alertas neste aparelho** solicita permissão do navegador.
3. O PWA obtém o token FCM e o registra no Worker.
4. O Worker valida o Firebase ID token e confirma no Firestore que o UID é do perfil `manutencao`.
5. Quando uma nova OS é gravada com status `ABERTO`, o cliente que criou a OS chama o Worker informando apenas o `chamadoId`.
6. O Worker consulta a OS diretamente no Firestore, valida o criador e envia a notificação aos aparelhos registrados.
7. Ao tocar na notificação, o PWA abre a OS correspondente.

## Proteções
- nenhuma chave privada é armazenada no PWA;
- Service Account não deve ser commitada;
- o Worker não confia em título, descrição, prioridade ou status enviados pelo navegador;
- dados da notificação são carregados pelo Worker diretamente do Firestore;
- o Worker valida Firebase ID token;
- somente UID com perfil `manutencao` ativo pode registrar aparelho;
- o disparo exige que a OS exista e continue `ABERTO`;
- eventos repetidos da mesma OS são deduplicados;
- tokens FCM inválidos são removidos automaticamente;
- falha do push nunca impede a criação da OS.

## Estado desta entrega
A integração de código está pronta, porém fica deliberadamente com `enabled: false` até serem inseridos dois dados públicos após configuração das contas:

- URL publicada do Cloudflare Worker;
- chave pública VAPID/Web Push criada no Firebase Console.

As credenciais privadas da Service Account devem ser adicionadas diretamente aos Secrets do Cloudflare e nunca ao ZIP público.

## Arquivos principais adicionados
- `src/constants/push.js`
- `js/push-notifications.js`
- `worker-push/src/index.js`
- `worker-push/wrangler.jsonc`
- `worker-push/package.json`
- `worker-push/README.md`

## Arquivos alterados
- `index.html`
- `js/app.js`
- `js/chamados.js`
- `js/event-action-maps.js`
- `css/perfil.css`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`

## Testes
- sintaxe JavaScript do PWA validada;
- sintaxe JavaScript do Worker validada;
- cache PWA incrementado para v27;
- referências de `push.js` e `push-notifications.js` presentes no HTML e cache;
- nenhum segredo privado incluído no projeto;
- ZIP validado após empacotamento.

## Commit
`feat: adicionar infraestrutura de alertas push para novos chamados`

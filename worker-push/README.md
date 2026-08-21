# Push de novos chamados — Cloudflare Worker

Este diretório contém o backend gratuito da v28. Ele recebe eventos do PWA, valida o Firebase Authentication, consulta o Firestore e envia Firebase Cloud Messaging (FCM) para os aparelhos da manutenção.

## Segurança

Nunca coloque o JSON da Service Account dentro do PWA, do GitHub ou deste diretório.

Os únicos dados privados necessários ficam como **Secrets** do Cloudflare Worker:

- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

O `FIREBASE_PROJECT_ID` já está configurado como `app-manutencao-2169f`.

## 1. Firebase — gerar Web Push certificate

Firebase Console → Project settings → Cloud Messaging → Web Push certificates.

Gere um par de chaves e copie **somente a chave pública**. Ela será colocada em:

`src/constants/push.js` → `vapidPublicKey`

## 2. Firebase — Service Account

Firebase Console → Project settings → Service accounts → Generate new private key.

Do JSON baixado, serão usados pelo Worker:

- `client_email`
- `private_key`

Não copie o arquivo JSON para o projeto.

## 3. Cloudflare — criar KV e publicar

Com Node.js instalado:

```bash
cd worker-push
npm install
npx wrangler login
npx wrangler kv namespace create PUSH_DEVICES
```

Copie o `id` retornado para `wrangler.jsonc`, usando o ID real do namespace `PUSH_DEVICES`.

Cadastre os segredos:

```bash
npx wrangler secret put FIREBASE_CLIENT_EMAIL
npx wrangler secret put FIREBASE_PRIVATE_KEY
```

Publique:

```bash
npm run deploy
```

O Wrangler mostrará a URL do Worker, por exemplo:

`https://app-manutencao-push.<sua-conta>.workers.dev`

Copie essa URL para:

`src/constants/push.js` → `workerUrl`

Depois altere:

`enabled: false` → `enabled: true`

## 4. Como funciona

1. A manutenção abre Perfil → Alertas no celular → Ativar alertas.
2. O navegador solicita permissão.
3. O PWA obtém o token FCM.
4. O Worker valida o Firebase ID token e confirma no Firestore que aquele UID é do perfil `manutencao`.
5. O token do aparelho fica no Workers KV por até 90 dias e é renovado automaticamente quando o app for usado.
6. Ao criar uma OS `ABERTO`, o PWA chama `/notify-new-call`.
7. O Worker consulta a OS diretamente no Firestore, valida quem disparou e envia push para os aparelhos registrados.
8. Ao tocar na notificação, o app abre a OS correspondente.

## Teste

Depois de configurar `src/constants/push.js`:

1. publique o PWA;
2. instale/abra no celular da manutenção;
3. entre no perfil da manutenção;
4. abra **Perfil**;
5. toque em **Ativar alertas**;
6. deixe o PWA em segundo plano;
7. abra uma OS em outro usuário/aparelho.

A OS deve gerar um alerta do sistema no celular da manutenção.


## Configuração atual da v28

Worker publicado em `https://app-manutencao-push.sistemamanutencao.workers.dev`. O binding `PUSH_DEVICES` está configurado para o namespace remoto. As credenciais privadas continuam exclusivamente nos Secrets do Cloudflare.

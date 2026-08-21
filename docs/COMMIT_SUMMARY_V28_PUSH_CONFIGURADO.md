# v28 — Push configurado e pronto para teste real

## Objetivo
Ativar em produção a infraestrutura de notificações push preparada na v27.

## Configuração aplicada
- Push habilitado no PWA (`enabled: true`);
- URL pública do Cloudflare Worker configurada;
- chave pública VAPID/Web Push configurada;
- namespace KV `PUSH_DEVICES` vinculado pelo ID real;
- configuração do Worker marcada para usar o KV remoto;
- cache do PWA incrementado para v28;
- versão do pacote do Worker incrementada para 28.0.0.

## Segurança
- nenhuma chave privada foi adicionada ao projeto;
- `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` permanecem somente como Secrets no Cloudflare;
- a chave VAPID presente no PWA é a chave pública Web Push, apropriada para código cliente.

## Backend confirmado
Worker publicado em:
`https://app-manutencao-push.sistemamanutencao.workers.dev`

Health check confirmado com:
- `ok: true`;
- `service: app-manutencao-push`;
- `projectId: app-manutencao-2169f`;
- `configured: true`.

## Próximo teste
1. publicar a v28 no GitHub Pages;
2. abrir o app no celular com perfil Manutenção;
3. Perfil → Alertas no celular → Ativar alertas neste aparelho;
4. permitir notificações no navegador/PWA;
5. abrir uma nova OS em outro usuário/dispositivo;
6. confirmar recebimento da notificação e abertura direta da OS.

## Commit
`feat: ativar push de novos chamados em producao`

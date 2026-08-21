# Relatório v17 — Atualização do ícone de instalação

## Objetivo

Atualizar as imagens usadas como ícone de instalação do PWA, preservando a estrutura funcional da versão v16.

## Base utilizada

- Base anterior: `app-manutencao-v16-limpeza-organizacao-codigo.zip`
- Nova versão: `app-manutencao-v17-icone-instalacao.zip`

## Alterações realizadas

- Substituído `img/icon-192.png` pela nova arte enviada, redimensionada para 192x192 px.
- Substituído `img/icon-512.png` pela nova arte enviada, redimensionada para 512x512 px.
- Atualizado o nome do cache no `service-worker.js` para forçar atualização dos arquivos armazenados no navegador/PWA.

## Arquivos alterados

- `img/icon-192.png`
- `img/icon-512.png`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/PLANO_ROLLBACK.md`
- `docs/RELATORIO_V17_ICONE_INSTALACAO.md`

## Regras de negócio

Nenhuma regra de negócio foi alterada.

Não houve alteração em:

- Login/autenticação;
- Perfis e permissões;
- Firestore Rules;
- Chamados/OS;
- SLA;
- Comunicados;
- Exportações;
- Diagnóstico;
- Preventivas;
- Painel da manutenção.

## Observação sobre atualização do PWA

Após publicar a versão, o navegador pode manter ícones antigos em cache. Para validar corretamente:

1. Atualize a página publicada.
2. Feche e abra novamente o app instalado.
3. Se necessário, remova o app instalado e instale novamente.
4. Em testes locais, limpe o cache do navegador ou use uma janela anônima.

## Checklist recomendado

- Confirmar que o app abre normalmente.
- Confirmar que o manifesto continua carregando.
- Confirmar que `img/icon-192.png` e `img/icon-512.png` abrem diretamente no navegador.
- Reinstalar o PWA para validar o novo ícone.

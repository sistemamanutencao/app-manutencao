# Commit Summary — V24 Logo Dourado de Manutenção

## Objetivo
Substituir os avatares ilustrativos e o ícone de instalação do PWA por um emblema profissional de manutenção, com identidade visual mais adequada ao uso operacional.

## Alterações
- Atualizados `img/icon-192.png` e `img/icon-512.png` para a nova logo do app instalado.
- Substituído `img/perfil-manutencao.png` pelo emblema de manutenção.
- Substituído `img/avatar-redefinicao-senha.png` por uma versão horizontal do emblema com fundo escuro/dourado.
- Adicionado `img/logo-manutencao-dourado.png` como ativo visual de referência.
- Ajustado CSS do avatar da manutenção para não cortar o emblema.
- Ajustado CSS da imagem de redefinição de senha para exibir o novo emblema com acabamento visual mais profissional.
- Atualizado `manifest.json` para usar tema compatível com a nova identidade.
- Atualizado cache do service worker.

## Impacto
- Afeta apenas identidade visual, avatar da manutenção, tela de redefinição de senha e ícones do PWA instalado.
- Não altera regras do Firebase, autenticação, permissões, coleções, OS, preventivas ou diagnósticos.

## Rollback
Restaurar os arquivos de imagem anteriores e o CSS/manifest/service-worker da versão `app-manutencao-v24-sem-qr-acesso-rapido.zip`.

## Commit sugerido
```
style: substitui avatares e icone pwa por logo de manutencao
```

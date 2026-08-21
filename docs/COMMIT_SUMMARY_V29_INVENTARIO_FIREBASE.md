# Commit Summary — v29

## Inventário sincronizado pelo Firestore

- Imagem de referência e saldo de estoque passam a ser gravados na coleção `inventarioItens`.
- Listener em tempo real atualiza os dados entre dispositivos autenticados no perfil manutenção.
- Dados locais existentes de imagem/saldo são migrados automaticamente quando não há documento remoto.
- Imagens são comprimidas e limitadas antes do envio para respeitar o limite de documento do Firestore.
- Andares e ambientes personalizados continuam no armazenamento local nesta versão.
- Regras do Firestore foram ampliadas para permitir acesso apenas ao perfil manutenção.

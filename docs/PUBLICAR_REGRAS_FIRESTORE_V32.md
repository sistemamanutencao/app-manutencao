# Publicar regras do Firestore — v32

1. Abra o projeto no Firebase Console.
2. Acesse **Firestore Database**.
3. Abra a aba **Regras**.
4. Substitua todo o conteúdo pelas regras do arquivo `firestore.rules` incluído na v32.
5. Clique em **Publicar**.
6. Publique os arquivos do aplicativo.
7. Recarregue o app com `Ctrl + F5`.

A v32 adiciona o campo `catalogoPersonalizado` ao documento `inventarioEstrutura/principal`. Sem a publicação das novas regras, a inclusão e a exclusão de itens poderão apresentar erro de permissão.

# Correção OS - Subcategoria e Solicitante

Correções aplicadas:
- Inicialização robusta das subcategorias, mesmo quando o script carrega após a tela.
- Removida a reconstrução do select de subcategoria no momento de salvar a OS, para não apagar a opção escolhida.
- Nome digitado em "Nome do Solicitante" agora é salvo como solicitante da OS.
- "Criado por" continua separado, usando o usuário logado/local quando disponível.
- Normalização dos dados antigos evita trocar solicitante por andar/local.

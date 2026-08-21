# Relatório v18 — Perfil da Manutenção

## Versão

`app-manutencao-v18-perfil-manutencao-avatar-maior.zip`

## Base utilizada

`app-manutencao-v17-icone-instalacao.zip`

## Objetivo

Aplicar ajustes visuais restritos à aba Perfil, preservando regras de negócio, autenticação, permissões, Firestore Rules, SLA, comunicados, exportações, diagnóstico e preventivas.

## Alterações realizadas

- Removido o bloco visual de resumo de chamados da aba Perfil.
- Mantida a função `atualizarResumoPerfil()` como neutra para preservar compatibilidade com chamadas existentes em outros módulos.
- Adicionada imagem de perfil exclusiva para usuários com perfil `manutencao`.
- Criado o arquivo `img/perfil-manutencao.png` a partir da imagem fornecida pelo usuário.
- Ajustado o CSS do avatar do perfil para exibir a imagem da manutenção em formato circular e com tamanho ampliado.
- Atualizado o cache do PWA no `service-worker.js` para a v18.
- Incluído `img/perfil-manutencao.png` na lista de arquivos em cache do PWA.


## Ajuste complementar aprovado

Após validação visual da prévia, o avatar exclusivo da manutenção foi ampliado para ocupar melhor o espaço livre da aba Perfil após a remoção do resumo de chamados.

### Alteração complementar

- Aumentado o tamanho visual do avatar de manutenção em `css/perfil.css`.
- Mantido o avatar padrão de colaborador/gerência sem ampliação.
- Atualizado o cache do PWA para forçar atualização do CSS em instalações existentes.
- Nenhuma regra de negócio, autenticação, permissão ou Firestore Rule foi alterada.

## Arquivos alterados

- `index.html`
- `js/perfil.js`
- `css/perfil.css`
- `service-worker.js`
- `img/perfil-manutencao.png`
- `docs/CONTROLE_DE_VERSOES.md`
- `docs/PLANO_ROLLBACK.md`
- `docs/RELATORIO_V18_PERFIL_MANUTENCAO.md`

## Arquivos não alterados por regra de segurança

- `firestore.rules`
- módulos de chamados, SLA, comunicados, exportações, diagnóstico, preventivas e painel da manutenção.

## Risco

Baixo. A alteração é visual e limitada à aba Perfil. O principal cuidado foi manter compatibilidade com chamadas existentes para `atualizarResumoPerfil()`.

## Testes recomendados no VS Code

1. Entrar como manutenção e confirmar que a imagem de perfil aparece.
2. Entrar como gerência e confirmar que a imagem da manutenção não aparece.
3. Entrar como colaborador e confirmar que a imagem da manutenção não aparece.
4. Confirmar que o resumo de chamados não aparece mais na aba Perfil.
5. Confirmar que a aba OS/Chamados continua exibindo chamados normalmente.
6. Confirmar que login, logout e navegação inferior continuam funcionando.
7. Reinstalar ou limpar cache do PWA caso o avatar antigo ou arquivos antigos persistam.

## Observação

Nenhuma regra de negócio foi alterada nesta versão.

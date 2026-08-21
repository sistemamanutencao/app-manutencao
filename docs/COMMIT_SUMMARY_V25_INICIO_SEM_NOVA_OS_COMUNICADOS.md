# v25 — Início sem grids redundantes de Nova OS e Comunicados

## Objetivo
Remover da seção **Acesso rápido** da tela Início os cards **Nova OS** e **Comunicados**, pois essas funções já permanecem acessíveis pela navegação inferior.

## Alterações
- removido o card `Nova OS` do grid de acesso rápido;
- removido o card `Comunicados` do grid de acesso rápido;
- mantidos os acessos inferiores `Novo` e `Comunicados`;
- grid comum ajustado para 2 colunas, evitando espaço vazio;
- grid do perfil Manutenção ajustado para 3 colunas;
- cache do PWA renovado para a versão v25.

## Arquivos alterados
- `index.html`
- `css/inicio.css`
- `css/responsive.css`
- `service-worker.js`
- `docs/CONTROLE_DE_VERSOES.md`

## Risco
Baixo. Alteração visual e de navegação redundante, sem mudança em Firebase, autenticação, permissões ou regras de negócio.

## Testes
- validação de sintaxe JavaScript;
- validação estrutural do HTML;
- confirmação dos acessos `Novo` e `Comunicados` na barra inferior;
- verificação de integridade do ZIP.

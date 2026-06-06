# Commit summary v20

## Commit sugerido

```txt
feat: adiciona cadastro de colaboradores com primeiro acesso
```

## Resumo

- Adiciona cadastro de colaboradores no Painel da manutenção.
- Cria fluxo de autorização por e-mail em `cadastrosColaboradores`.
- Normaliza e-mails com `trim().toLowerCase()` antes de salvar e consultar.
- Bloqueia cadastro duplicado para e-mail já pendente, concluído ou inativo.
- Adiciona primeiro acesso para colaborador criar a própria senha.
- Cria automaticamente `usuarios/{uid}` com perfil fixo `colaborador`.
- Mantém gerência e manutenção sob controle manual no Firebase.
- Mantém login anônimo como transição.
- Atualiza Firestore Rules para proteger cadastro, perfil e primeiro acesso.

## Arquivos principais

- `index.html`
- `js/cadastro-colaboradores.js`
- `js/app.js`
- `js/event-action-maps.js`
- `src/constants/firebase.js`
- `firestore.rules`
- `css/perfil.css`
- `css/painel.css`


## Atualização adicional - acesso colaborador ocultado

- O acesso antigo do colaborador por nome e setor foi ocultado da aba Perfil.
- O fluxo principal exibido ao colaborador agora é o Primeiro acesso com e-mail previamente autorizado pela manutenção.
- O login anônimo foi mantido no código como transição/compatibilidade, mas não fica mais exposto visualmente na tela de Perfil.
- Essa mudança incentiva o uso de contas individuais por e-mail e senha, melhorando rastreabilidade e controle operacional.


Atualização visual v20: o botão de Primeiro acesso do colaborador foi definido como azul/principal para reduzir confusão e direcionar o colaborador ao fluxo correto de criação de senha.

## Atualização adicional — reorganização do Painel da manutenção

Commit sugerido, caso esta alteração seja enviada separadamente:

```txt
style: reorganiza painel da manutenção com seções recolhíveis
```

Resumo:

- Move “Fila operacional de OS” para o topo do Painel da manutenção e mantém a seção recolhível.
- Remove o card de Diagnóstico inicial do painel, mantendo o acesso pelo grid da aba Início.
- Torna “Cadastro de colaboradores”, “Resumo dos indicadores” e “Indicadores operacionais” seções recolhíveis.
- Preserva IDs e integrações JavaScript dos indicadores, filtros e lista operacional.

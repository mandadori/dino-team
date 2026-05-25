# Regras Inegociáveis — Criação de Posts

Aplicam em todo post, independente de formato ou estilo. Lido pelo `designer` em cada criação de post, passado explicitamente pela skill.

## Tipografia
- Títulos: Anton
- Subtítulos e apoio: Montserrat
- Sem tipografias além dessas duas

## Margens e Safe Areas
- Carrossel: 80px em todos os lados
- Stories: 250px topo e base
- Imagens de fundo e barras de progresso podem ocupar bleed total

## Paleta
- Apenas preto (#000000), branco (#FFFFFF) e cinza (#7F7F7F)

## Drop zones (fotos inseridas pelo usuário no Claude Design)
- Fotos de fundo são **sempre** inseridas pelo usuário via Claude Design — nunca colocar imagem hardcoded no template
- `data-bg-drop="<nome>"` deve estar no `<section data-slide>` — o wrapper injeta `background-image` via inline style nesse elemento; filhos opacos cobrindo o mesmo espaço ocultam a imagem
- Quando a referência visual tiver foto de fundo: adicionar ao `.slide` base no CSS `background-size: cover; background-position: center; background-repeat: no-repeat;`; qualquer div filho usado como host de overlay deve ter `background: transparent`
- Exceção: se o fundo for cor sólida ou gradiente declarado no `estilo.md`, não criar drop zone

## Assets individuais
- Sem JavaScript
- Sem dependências externas além das fontes declaradas
- Um arquivo HTML standalone por slide/frame

## Preview consolidado
- Todo post termina com preview.html
- preview.html usa templates/wrappers/preview-wrapper.html verbatim
- section[data-slide="N"] obrigatório por asset

## Dimensões
- Carrossel: 1080×1350px
- Stories: 1080×1920px
- Não alterar dimensões declaradas no template
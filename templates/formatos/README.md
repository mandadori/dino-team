# Regras Inegociáveis — Criação de Posts

Aplicam em todo post, independente de formato ou estilo. Lido pelo `designer` em cada criação de post, passado explicitamente pela skill.

## Tipografia
- Todo texto em CAIXA ALTA, sem exceção
- Títulos: Anton
- Subtítulos e apoio: Montserrat
- Sem tipografias além dessas duas

## Margens e Safe Areas
- Carrossel: 80px em todos os lados
- Stories: 250px topo e base
- Conteúdo crítico nunca encosta nas bordas
- Imagens de fundo e barras de progresso podem ocupar bleed total

## Paleta
- Apenas preto (#000000), branco (#FFFFFF) e cinza (#7F7F7F)
- Verde chroma (#00B140) exclusivamente em estilos de treino com vídeo
- Sem cores saturadas, gradientes coloridos ou neons

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

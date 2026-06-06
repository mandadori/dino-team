# Pasta de Assets do Ramon

Esta pasta recebe as **fotos P&B do Ramon Dino** usadas no site.

## Como adicionar as fotos

Basta soltar os arquivos com os nomes abaixo nesta pasta. A troca de placeholder para foto real é trivial — sem reimplementação necessária.

## Arquivos esperados

| Arquivo | Seção | Descrição |
|---------|-------|-----------|
| `hero.jpg` | Hero | Foto dominante do Hero — full-bleed, retrato/ambiente, preferencialmente vertical ou com área central limpa para o texto sobreposto. Mínimo recomendado: 1440×900px. |
| `retrato.jpg` | SobreRamon | Retrato vertical do Ramon — proporção 4:5 (ex: 800×1000px), fundo ou ambiente atrás. Usado no bloco lateral da seção Sobre Ramon. |

## Tratamento aplicado pelo componente

O componente `RamonPhoto` aplica automaticamente:
- **Preto e branco** (`grayscale`) + **alto contraste** (`contrast-125`) — mesmo que a foto original seja colorida.
- **Scrim obrigatório** (overlay de gradiente) sobre a imagem para garantir legibilidade do texto sobreposto (WCAG AA ≥4.5:1).
- `priority` na foto do Hero para otimizar o LCP.

## Enquanto as fotos não chegam

O componente renderiza um **placeholder monocromático intencional** — fundo escuro com rótulo `FOTO DO RAMON` em Anton uppercase. Não é um estado de erro; é um slot deliberado de acervo parcial (D-04).

> Nota: não comitar arquivos de imagem nesta pasta. Os `.jpg` estão no `.gitignore` para evitar binários grandes no repositório.

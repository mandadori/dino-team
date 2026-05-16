# Identidade Visual — Dino Team

> Atualizado em 2026-05-15. Refinamento de tons, margens, regras tipográficas e mood.

---

## Logo

**Arquivo oficial:** [`assets/logo.png`](assets/logo.png)

Wordmark "DINO" em estilo angular/itálico, com tratamento moderno e atlético.

**Uso da logo:**
- **Não é obrigatória em todos os estilos.** Cada estilo decide se usa logo no slide e como.
- Quando aparece, posição padrão é **topo-esquerdo do slide** alinhado a uma tag textual de tópico no topo-direito.
- Sobre fundos com foto: aplicar `drop-shadow` sutil para legibilidade.
- Em fundos claros pode ser necessária versão alternativa em preto (a definir).

---

## Paleta de cores

| Nome | Hex | Uso |
|---|---|---|
| Preto | `#000000` | Cor principal — fundos, texto principal, presença forte |
| Branco | `#FFFFFF` | Contraste, texto sobre fundos escuros, espaços de respiro |
| Cinza | `#7F7F7F` | Apoio — divisores, elementos secundários, textos de hierarquia menor |

**Identidade:** preto + branco + cinza. Sem cores quentes ou saturadas.

**Cor funcional (não da marca):** verde chroma `#00B140` — usado **exclusivamente** em estilos de treino como background sólido para o editor adicionar vídeo do Ramon executando o exercício na pós-produção. Não é cor de marca.

---

## Tipografia

**Display / Títulos:** **Anton** — sempre em **CAIXA ALTA**
**Texto secundário / Subtítulos:** **Montserrat** — sempre em **CAIXA ALTA**

> **Regra absoluta:** todo texto em peças visuais (capa, slides, frames) é em **CAIXA ALTA**. Anton para títulos, Montserrat para subtítulos e apoio. Sem misturas com caixa baixa em layout.

Hierarquia sugerida em carrosséis:
- **Capa e títulos de slide:** Anton, peso visual forte
- **Subtítulos / nomes de exercícios / chamadas:** Montserrat (300/400/600/700)
- **Apoio / créditos / tags de tópico:** Montserrat em tamanho reduzido com letter-spacing aberto

---

## Margens e grid

**Margem padrão de carrossel:** **80px** em todos os lados.
- Aplicada no container interno do slide (`padding: 80px`).
- Conteúdo crítico nunca encosta nas bordas.
- Excepcionalmente, imagens de fundo e barras de progresso podem ocupar bleed total (0 → 1080).

**Stories:** safe area de **250px no topo e na base** (UI do Instagram sobrepõe).

---

## Mood / Estilo

**Tom visual:** **cru, intenso, autêntico — de campeão para quem está construindo.**

- **Atlético, sério e cinematográfico**
- **Preto e branco com peso editorial** — sem cor para distrair, foco na mensagem e no corpo do atleta
- **Tipografia condensada e impactante** — alta presença visual
- **Sem ruído** — minimalismo agressivo, não decorativo
- **Background dominante: fotos do Ramon Dino.** A presença visual do atleta é parte central da identidade. Em estilos com foto de fundo, sempre que possível usar imagem do Ramon (treino, competição, bastidor).

---

## Aplicação de fotografia

- **Fonte primária:** acervo de fotos do Ramon Dino (treino, palco, bastidor, retrato)
- **Tratamento:** preto e branco / alto contraste / preserva textura e força física
- **Overlay de legibilidade:** quando há texto sobre foto, aplicar gradiente escuro (`linear-gradient` topo-base) para garantir leitura
- **Sem stock photos óbvios.** Sem imagens genéricas de "academia".

---

## Elementos gráficos recorrentes

- **Tag de tópico no topo-direito** — Montserrat, ~5–10px no preview (proporcional em 1080), letter-spacing aberto, em CAIXA ALTA. Identifica a categoria do conteúdo (ex: `BACK DAY`, `O TREINO`, `PRIMEIRO EXERCÍCIO`).
- **Barra de progresso inferior** — fina (3px), branca translúcida com fill cheio. Indica posição na sequência de slides.
- **Swipe cue ("Arraste →")** — só na capa, sinaliza continuidade.
- **Watermark "DINO" gigante** — opcional em alguns estilos, baixa opacidade (5–6%) atrás do conteúdo.

---

## O que evitar

- Cores saturadas, gradientes coloridos, neons (exceto chroma green funcional)
- Tipografias decorativas, manuscritas ou caligráficas
- Texto em caixa baixa em peças visuais
- Ícones genéricos de "fitness" (halteres cartoon, músculos ilustrados)
- Stock photos
- Estética de "academia de bairro" — a marca é de elite, não popular
- Composições poluídas — sempre buscar respiro e hierarquia clara

---

## Aplicação em carrossel

- **Aspect ratio:** **4:5** (1080×1350)
- **Padding interno:** 80px todos os lados (com exceções pontuais para bleed)
- **Capa:** título Anton em caixa alta, foto do Ramon como background com overlay, swipe cue
- **Slides internos:** título Anton + corpo Montserrat (caixa alta) — manter respiro
- **CTA:** quebra padrão visual se necessário; pode usar branco sobre preto ou inverter

---

## Aplicação em stories

- **Aspect ratio:** **9:16** (1080×1920)
- **Safe area:** 250px topo e base
- **Hierarquia:** 1 ideia dominante por frame, tipografia protagoniza
- **Backgrounds:** foto do Ramon ou cor sólida da paleta

---

## Pendências de identidade visual

- [ ] Versão alternativa do logo para fundos claros (a definir)
- [ ] Curadoria/organização do acervo de fotos do Ramon em `assets/`
- [ ] Tratamento padrão de imagens (filtros exatos, recortes preferidos)
- [ ] Possíveis estilos adicionais (lista de wishlist em discussão)

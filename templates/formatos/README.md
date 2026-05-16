# Formatos e Estilos — Dino Team

Cada **formato** suportado tem sua própria pasta sob `templates/formatos/`, e dentro dela uma sub-pasta `estilos/` com as variações de leiaute desse formato.

## Conceito

**Formatos** definem dimensão e aspect ratio do post (`carrossel` 4:5, `stories` 9:16).

**Estilos** são variações de leiaute **dentro de um formato**, que compartilham o padrão visual da marca mas variam:

- Posicionamento de texto
- Posicionamento de logo / marca
- Layout das fotos de fundo
- Composição / grid

Não são "temas" diferentes — são **leiautes diferentes do mesmo sistema visual**.

## Estrutura

```
templates/formatos/
  carrossel/
    estilos/
      <slug-do-estilo>/
        estilo.md       ← descrição: o que é, quando usar, exemplos visuais
        slide.html      ← template HTML standalone 1080×1350
  stories/
    estilos/
      <slug-do-estilo>/
        estilo.md
        frame.html      ← template HTML standalone 1080×1920
```

O `slug` do estilo é **kebab-case sem acentos** (ex: `padrao`, `layout-dividido`, `tipografico-pleno`, `foto-fundo`).

## Estilo `padrao`

Cada formato tem um estilo `padrao/` que serve como base mínima — fallback usado quando nenhum estilo é especificado e a pipeline não consegue/precisa fazer auto-seleção.

## Como criar um novo estilo

1. Defina o slug. Exemplo: `layout-dividido`.
2. Crie a pasta: `templates/formatos/<formato>/estilos/<slug>/`.
3. Escreva `estilo.md` cobrindo:
   - **Conceito visual** — 1 parágrafo descrevendo o leiaute
   - **Quando usar** — tipos de tema/objetivo para os quais este estilo brilha
   - **Quando NÃO usar** — onde ele desserve
   - **Variações internas** se houver (ex: capa, corpo, CTA dentro do estilo)
   - **Inputs obrigatórios** (opcional, mas crítico se houver) — se o estilo só funciona com matéria-prima específica (ex: lista de exercícios com séries/reps para `treino-dino`), declare aqui. A skill `/novo-post` lê essa seção para decidir se precisa coletar input adicional do usuário ou acionar um agente especialista (ex: `treinador`) antes da copy/design.
   - **Cores adicionais** (opcional) — se o estilo usa cores além da paleta P&B + cinzas da marca (ex: chroma green `#00B140` para vídeo em pós-produção), declare aqui. O Curador-Exportador lê isso para validação técnica.
   - **Referências visuais** — links/imagens de inspiração (opcional)
4. Escreva o template HTML (`slide.html` para carrossel, `frame.html` para stories):
   - 1080×1350 (carrossel) ou 1080×1920 (stories) — **não mude as dimensões**
   - HTML+CSS inline standalone (sem dependências externas além de Google Fonts)
   - Use os tokens da marca (paleta, tipografia) — eles são lei
   - Marque com classes/data-attributes as áreas que o Designer vai preencher
5. Teste abrindo o template no browser — deve renderizar limpo em 1080×1350/1920.

## Como a pipeline usa

- A skill `/novo-post` lista `templates/formatos/<formato>/estilos/` para descobrir slugs disponíveis e lê os `estilo.md` quando necessário (auto-seleção, inputs obrigatórios).
- Quando o usuário não especifica estilo, a skill aciona o agente `pesquisa-tendencias` em modo `scouting` para sugerir um estilo coerente com o tema/objetivo/público, e pede confirmação ao usuário.
- O agente `designer` parte do template do estilo escolhido (`slide.html` ou `frame.html`) e injeta o copy/conteúdo de cada slide.
- O agente `curador-export` valida o output do designer contra os tokens declarados no `estilo.md` (incluindo cores adicionais, se houver).

## Princípios

- **Padrão visual é compartilhado.** Paleta, tipografia, mood — todos os estilos respeitam. Só muda leiaute.
- **Slug fala por si.** O nome do estilo descreve visualmente o que ele é (`layout-dividido`, não `estilo-1`).
- **Cada estilo tem `estilo.md`.** Sem descrição escrita, o agente de pesquisa não consegue selecionar bem.

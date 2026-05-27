# Esqueleto canônico de `estilo.md`

> Contrato que todo `estilo.md` deve cumprir.
> Lido pelo `designer` em `/novo-estilo` e em `/novo-post` (modo ad-hoc) ao gerar ou editar um estilo.
> Este arquivo é guia estrutural — copie as seções, substitua o conteúdo entre `{...}`, remova o que não se aplica.

---

## Princípio

**Estrutura de copy é propriedade do estilo, não do formato.** Cada `estilo.md` carrega visual + sequência editorial + tom por bloco + drop zones — autocontido o suficiente para alimentar pesquisa, briefing, copy e design sem depender de um esqueleto de copy por formato.

---

## Cabeçalho

```
# Estilo <slug-em-kebab-case> — <formato>
```

`<formato>` é o nome legível (ex: `Carrossel`, `Stories`).

---

## Seções obrigatórias

### `## Conceito visual`

Texto livre. Descreve o visual + o DNA editorial geral. Responde: como o estilo se parece, qual o mood, qual a sensação editorial dominante. 2-4 parágrafos.

### `## Estrutura`

Sequência ordenada de blocos do post. Pode ser **fixa** (N+3 blocos pré-definidos, lista numerada) ou **flexível** ("5-7 blocos, hook obrigatório no primeiro, CTA obrigatório no último — corpo livre dentro do tom").

Cada bloco declara, em formato auditável:

```
### Bloco <ID> — <nome curto>

- **Classe HTML / variante visual:** `<slide capa>` | `<slide dividido>` | `<frame hook>` | ...
- **Função editorial:** hook | contexto | desenvolvimento | virada | CTA | instrução técnica | prova | exemplo
- **Tom:** modulação dentro do tom global da marca (ex: "tensão crescente", "instrutivo seco", "virada filosófica")
- **O que entregar:** descrição do conteúdo que a copy deve produzir + limite de palavras
- **Variações A/B:** sim (descrever quais blocos pedem A/B) | não
- **Inputs visuais:** foto na zona X com `data-bg-drop="X"` | nenhum (puramente tipográfico) | placeholder técnico (ex: chroma para vídeo)
  - `data-bg-drop` vai no `<section data-slide>` — o wrapper do Claude Design injeta `background-image` via inline style nesse elemento; filhos com background opaco cobrem a imagem
  - Adicionar ao CSS da classe `.slide`: `background-size: cover; background-position: center; background-repeat: no-repeat;`
  - Filhos usados como host de overlay (ex: `.slide-foto-bg`) devem ter `background: transparent`
  - Fotos são sempre inseridas pelo usuário via Claude Design — template só declara a drop zone, nunca imagem hardcoded
```

Para blocos repetidos (ex: "exercicio-1..N"), pode declarar uma única vez com o intervalo no ID.

### `## Quando usar`

Lista temas / contextos / pilares onde o estilo se aplica bem. 3-6 bullets.

### `## Quando NÃO usar`

Anti-padrões editoriais — situações em que o estilo prejudica o conteúdo. 3-6 bullets.

### `## Variantes visuais`

Classes HTML disponíveis no template (`slide.html` / `frame.html`). Cada variante: nome da classe + 1 linha do que ela cobre. Espelha as variantes visuais usadas na `## Estrutura`.

---

## Seções condicionais

Incluir somente quando se aplicam.

### `## Inputs obrigatórios externos`

Quando o estilo exige dado externo que a skill precisa coletar antes da copy (ex: prescrição de treino, lista de exercícios, par de imagens de antes/depois). Declarar:

- Tipo do input (ex: "Prescrição técnica de treino")
- Formato esperado
- Quem produz quando o usuário não fornece (ex: agente `treinador`)

### `## Cores adicionais / Tokens`

Quando há tokens específicos do estilo além da paleta da marca (ex: chroma key, tamanho de tipografia específico, padding diferente do padrão). Tabela `Token | Valor`.

### `## Notas técnicas`

Comportamentos não-óbvios do template HTML (ex: filtros CSS por variante, símbolos unicode preservados, regras de overflow). Bullets curtos.

---

## Onde mora o contrato

- Esqueleto canônico: **este arquivo (`templates/estilo.md`)**.
- Instâncias: `templates/formatos/<formato>/estilos/<slug>/estilo.md`.
- Tokens visuais transversais (dimensões, fontes, paleta, safe areas): `brand/referencias-visuais.md`.

---

## Checklist de validação

Um `estilo.md` está completo quando:

- [ ] Cabeçalho com `# Estilo <slug> — <formato>`.
- [ ] `## Conceito visual` preenchido (visual + DNA editorial).
- [ ] `## Estrutura` com todos os blocos declarando ID, classe HTML, função editorial, tom, o que entregar + limite, variações A/B, inputs visuais.
- [ ] `## Quando usar` e `## Quando NÃO usar` presentes.
- [ ] `## Variantes visuais` lista as classes HTML disponíveis e bate com a `## Estrutura`.
- [ ] Seções condicionais (`## Inputs obrigatórios externos`, `## Cores adicionais / Tokens`, `## Notas técnicas`) incluídas só quando se aplicam.

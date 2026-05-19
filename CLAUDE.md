# Dino Team

> Documento mestre da marca Dino Team
> Sistema multi-agente orientado por skills.

---

## O que é o Dino Team

Consultoria de treinamento e dieta personalizada + comunidade da marca pessoal de **Ramon Dino** — primeiro brasileiro campeão do maior campeonato do mundo de fisiculturismo.

Entrega ao público comum o método validado por Ramon, que saiu do zero absoluto ao topo mundial. Branding, história, propósito, palavras-chave e mensagens centrais estão em [`brand/brand-book.md`](brand/brand-book.md).

### O que a Dino Team **não** é
- Não é consultoria fitness genérica.
- Não promete resultados irreais nem atalhos.
- Não se baseia em teoria ou achismo.
- Não usa motivação vazia nem vitimismo.
- Não vende velocidade — vende direção.

---

## Princípios centrais

- **Direção > esforço.**
- **Disciplina é fazer mesmo sem vontade.**
- **Consistência vence intensidade.**
- **Resultado vem de execução, não de motivação.**

---

## Como o sistema é organizado

Este repositório é o **sistema operacional de marca completo** do Dino Team.

### 1. Branding da marca (`brand/`)

Documentos institucionais que **toda decisão da marca consulta**. São lidos por todos os agentes antes de produzir qualquer coisa:

- [`brand/brand-book.md`](brand/brand-book.md) — essência, propósito, mensagens centrais.
- [`brand/tom-de-voz.md`](brand/tom-de-voz.md) — como a marca fala.
- [`brand/publico-alvo.md`](brand/publico-alvo.md) — quem é o leitor.
- [`brand/pilares-conteudo.md`](brand/pilares-conteudo.md) — eixos temáticos válidos.
- [`brand/referencias-visuais.md`](brand/referencias-visuais.md) — paleta, tipografia, mood.

### 2. Skills — fluxos orquestrados (`.claude/skills/`)

Cada skill é um **fluxo de trabalho ponta a ponta**. A skill é quem **orquestra**: define a ordem das etapas, qual agente é acionado em cada uma, como o output de um vira input do próximo, onde pausa para confirmação do usuário, e qual é o formato do entregável final.

**Skills disponíveis:**
- [`/brand-discovery`](.claude/skills/brand-discovery/SKILL.md) — entrevista para construir/atualizar o brand book.
- [`/novo-post`](.claude/skills/novo-post/SKILL.md) — criar um post completo (carrossel ou stories).
- [`/lote-posts`](.claude/skills/lote-posts/SKILL.md) — gerar N posts em sequência, agendável.
- [`/novo-estilo`](.claude/skills/novo-estilo/SKILL.md) — criar um novo estilo visual para carrossel ou stories.

### 3. Agentes — especialistas isolados (`.claude/agents/`)

Cada agente é um **especialista em uma função**. Conhece profundamente sua área, mas **não conhece o fluxo nem outros agentes** — não decide o que vem antes ou depois dele, não chama ninguém. Recebe input num formato declarado, entrega output num formato declarado.

**Agentes:**
- [`diretor-marca`](.claude/agents/diretor-marca.md) — briefing estratégico de post e curadoria editorial final.
- [`pesquisa-tendencias`](.claude/agents/pesquisa-tendencias.md) — pesquisa de conteúdo (modo `scouting` ou `deep`).
- [`copywriter`](.claude/agents/copywriter.md) — copy persuasiva multi-formato.
- [`designer`](.claude/agents/designer.md) — HTML+CSS standalone por slide/frame.
- [`curador-export`](.claude/agents/curador-export.md) — validação técnica e export PNG.
- [`treinador`](.claude/agents/treinador.md) — decisões técnicas de treino (séries, reps, divisão, progressão).

---

## Regras operacionais

- **Skills orquestram o fluxo principal.** A skill define ordem das etapas, pausas de confirmação, critérios entre elas e formato do entregável final. Toda execução começa numa skill.
- **Agentes são especialistas com autonomia em runtime.** Cada um domina uma função. Dentro de uma ordem dada pela skill, o agente pode trocar informações com outros agentes ou delegar parte do trabalho a outro especialista quando a tarefa exigir — sem precisar que a skill pré-orquestre cada interação.
- **Brand é o eixo comum.** Agentes podem consultar os arquivos de `brand/` quando o trabalho exigir contexto da marca (tom de voz, público, pilares, identidade visual). Coerência vem daí.
- **Erros estruturais voltam para a skill.** Quando um agente devolve erro de fluxo (`BRAND_BOOK_INCOMPLETO`, `ESTILO_INVALIDO`, etc.), a skill decide o próximo passo.

---

## Funções do sistema

Cada função é executada por skills. Outputs ficam em `export/`, organizados por formato e data.

- **Criação de conteúdo** — produzir posts prontos para publicação. Skills: `/novo-post` (individual), `/lote-posts` (em lote).
- **Criação de estilos** — criar novos templates visuais para uso nos posts. Skill: `/novo-estilo`.
- **Descoberta de marca** — entrevista estruturada para preencher ou atualizar o brand book. Skill: `/brand-discovery`.


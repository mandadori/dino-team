---
name: brand-discovery
description: Conduz uma entrevista estruturada com o usuário para construir ou atualizar o brand book da Dino Team. Use no início do projeto ou quando os arquivos em brand/ estiverem incompletos. Preenche brand-book.md, tom-de-voz.md, publico-alvo.md, pilares-conteudo.md e referencias-visuais.md de forma incremental.
---

# Brand Discovery — Dino Team

Conduz uma entrevista estruturada para preencher o brand book da Dino Team de forma incremental.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 0 | ⚙ diagnóstico | brand/* | — | lacunas |
| 1 | ⏸ coleta de materiais | materiais soltos | 0 | insumos |
| 2 | ⏸ entrevista incremental | perguntas ← 1 | 1 | respostas |
| 3 | ⚙ consolidação | respostas ← 2 | 2 | brand/* preenchido |
| 4 | ⏸ validação final | brand/* ← 3 | 3 | aprovação |

## Quando usar
- Início do projeto (primeira vez configurando a marca)
- Quando outra skill (ex: `/novo-post`) detecta que o brand book está incompleto e pausa o pipeline
- Quando o usuário quer revisar/atualizar definições de marca

## Como rodar

A skill conduz a entrevista diretamente — sem delegar a agente. O fluxo é conversacional com o usuário, em blocos curtos:

### Passo 0 — Diagnóstico
Leia cada arquivo em `brand/` e identifique:
- O que já está preenchido
- O que está vazio ou superficial
- O que parece desatualizado/incoerente

Apresente ao usuário um resumo: "Hoje seu brand book tem X, Y. Falta Z, W. Vamos completar?"

### Passo 1 — Coleta de materiais soltos
Pergunte ao usuário:
> "Você mencionou ter 'coisas soltas' sobre a marca. Pode compartilhar? Pode colar texto aqui, descrever logo/cores, posts antigos, anotações. Eu organizo."

Espere o usuário responder antes de continuar.

### Passo 2 — Entrevista incremental

Conduza a entrevista em **blocos curtos** (3-5 perguntas por bloco). Após cada bloco, escreva no arquivo correspondente em `brand/` e confirme com o usuário antes de avançar.

**Bloco A — Essência (`brand-book.md`)**
1. Em uma frase, o que é a Dino Team?
2. Qual problema ela resolve, e para quem?
3. Por que ela existe (propósito além do produto)?
4. O que ela NÃO é? (evita confusão de posicionamento)

**Bloco B — Público (`publico-alvo.md`)**
1. Quem é a pessoa que mais se beneficia? (idade, profissão, contexto)
2. O que ela busca, sente, teme em relação ao tema da marca?
3. Onde ela está (plataformas, comunidades)?
4. Que linguagem/jargão ela usa?

**Bloco C — Pilares (`pilares-conteudo.md`)**
1. Que 3-5 grandes temas a marca quer ser conhecida por?
2. Para cada pilar: que ângulo único a Dino Team traz que outros não trazem?
3. Que temas estão FORA dos pilares (off-limits)?

**Bloco D — Tom de voz (`tom-de-voz.md`)**
1. Se a marca fosse uma pessoa, como ela falaria? (formal/informal, séria/divertida, técnica/acessível)
2. 3 palavras que descrevem o tom
3. 3 palavras que descrevem o que o tom NÃO é
4. Exemplos: pegue uma frase comum ("Olá, tudo bem?") e reescreva no tom da marca
5. Vocabulário típico (palavras a usar) e proibido (palavras a evitar)

**Bloco E — Identidade visual (`referencias-visuais.md`)**
1. Tem paleta de cores definida? (cole hex codes ou descreva)
2. Tipografia: fontes da marca?
3. Mood/estilo: minimalista, maximalista, editorial, ilustrado, fotográfico?
4. 3-5 referências visuais (links de marcas/criadores cujo estilo gosta)
5. Elementos gráficos recorrentes (formas, padrões, ícones)?

### Passo 3 — Consolidação
Após todos os blocos, atualize `brand-book.md` com um sumário-mestre que linka para os outros arquivos:

```markdown
# Brand Book — Dino Team

## Essência
{do Bloco A}

## Referências cruzadas
- [Público-alvo](publico-alvo.md)
- [Pilares de conteúdo](pilares-conteudo.md)
- [Tom de voz](tom-de-voz.md)
- [Identidade visual](referencias-visuais.md)

## Última atualização
YYYY-MM-DD
```

### Passo 4 — Validação final
Pergunte: "Algo aqui não te representa? O que mudaria?"

Ajuste o que for necessário. Salve.

## Princípios

- **Incremental, não exaustivo.** Permita parar e voltar — não exija todas as respostas de uma vez.
- **Use exemplos.** Se o usuário travar, dê 2-3 opções para reagir.
- **Salve a cada bloco.** Não acumule respostas na memória sem persistir.
- **Confirme antes de avançar.** "Está bom? Posso ir pro próximo bloco?"

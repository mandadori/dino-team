---
name: novo-post
description: Dispara o pipeline completo de criação de um post Instagram da Dino Team (carrossel ou stories). Aceita tipo + tema como argumentos. Invoca o Diretor de Marca, que orquestra pesquisa, copy, design e curadoria com export PNG. Uso - /novo-post <tipo> <tema>. Requer brand book preenchido.
---

# Novo Post — Dino Team

Atalho para criar uma postagem do zero. Suporta `carrossel` (4:5) e `stories` (9:16).

## Como rodar

1. **Parse dos argumentos:**
   - `tipo` — `carrossel` ou `stories` (obrigatório)
   - `tema` — string livre (obrigatório)

   Se o usuário rodar sem argumentos ou só com o tipo, **pergunte** o que falta. Exemplos:
   - `/novo-post` → "Qual tipo (carrossel ou stories) e qual tema?"
   - `/novo-post carrossel` → "Qual o tema do carrossel?"
   - `/novo-post filosofia estoica` (sem tipo) → "Carrossel ou stories?"

2. **Valide o tipo.** Se não for `carrossel` nem `stories`, diga ao usuário e peça correção. Outros formatos (reels, feed 1:1) ainda não são suportados.

3. **Invoque o agente `diretor-marca`** via Task tool com o seguinte prompt:

```
Você foi acionado para criar um novo post da Dino Team.

Tipo: {carrossel | stories}
Tema: {tema do usuário}
Data: {YYYY-MM-DD de hoje}

Execute o pipeline completo conforme suas instruções (Passos 0-6):
1. Valide brand book
2. Defina briefing interno (objetivo, pilar, slug, pasta)
3. Delegue Pesquisa (passando o formato — pesquisa para carrossel ≠ pesquisa para stories)
4. Delegue Copywriter (passando o formato)
5. Delegue Designer (gera slide-N.html standalone na pasta design/)
6. Delegue Curadoria (valida + roda node scripts/export-png.js + monta briefing)
7. Revise output final

Reporte ao usuário: caminho da pasta final, lista de PNGs em export/, e 3 bullets do que foi entregue.
```

4. **Aguarde o retorno** do Diretor de Marca e apresente o resumo ao usuário.

## Pré-requisitos

- Brand book preenchido em `brand/` (rode `/brand-discovery` se vazio)
- Puppeteer instalado (`npm install` na raiz do projeto, se ainda não)
- Diretório de trabalho é o projeto Dino Team

## Variações de uso

- `/novo-post carrossel filosofia estoica no treino`
- `/novo-post stories antes e depois 12 semanas`
- `/novo-post` — skill pergunta tipo e tema
- `/novo-post carrossel tema="mentalidade de elite" objetivo=posicionar` — metadados extras opcionais

## O que esta skill NÃO faz

- Não pula validação de brand book
- Não publica o post (gera PNGs, não faz upload)
- Não suporta formatos além de carrossel/stories ainda

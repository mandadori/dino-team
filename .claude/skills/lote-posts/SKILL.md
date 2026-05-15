---
name: lote-posts
description: Gera N variações de post sobre um tema-base, no formato escolhido (carrossel ou stories). Útil para encher pauta semanal/mensal. Agendável via /schedule. Uso - /lote-posts <tipo> <N> <tema-base>.
---

# Lote de Posts — Dino Team

Gera múltiplos posts em sequência, todos no mesmo formato. Pode ser disparado manualmente ou agendado.

## Como rodar

1. **Parse dos argumentos:**
   - `tipo` — `carrossel` ou `stories` (obrigatório)
   - `N` — quantidade de posts (default: 5 se omitido)
   - `tema-base` — tema guarda-chuva, opcional

   Se o tipo estiver faltando, pergunte.

2. **Valide o tipo.** Se não for `carrossel` nem `stories`, peça correção.

3. **Invoque o `diretor-marca`** com o seguinte prompt:

```
Você foi acionado para gerar um LOTE de {N} posts da Dino Team.

Tipo: {carrossel | stories}
Tema-base: {tema-base ou "livre — escolha temas estratégicos dos pilares atuais"}
Data: {YYYY-MM-DD de hoje}

Processo:
1. Leia o brand book e os pilares de conteúdo.
2. Gere uma lista de {N} ângulos/subtemas distintos conectados ao tema-base (ou aos pilares se livre).
3. Apresente a lista ao usuário e peça confirmação ANTES de executar os pipelines completos.
4. Após confirmação, para cada subtema, execute o pipeline completo (Passos 1-6 do diretor) — incluindo export PNG.
5. Use slugs distintos por post: {data}-{slug-subtema}. Todos no mesmo formato.
6. Ao final, reporte ao usuário um resumo com os {N} caminhos das pastas e contagens de PNGs.

Importante: SE NÃO HOUVER USUÁRIO PRESENTE (modo agendado), pule a confirmação e prossiga com todos os subtemas que você selecionou. Marque os posts como gerados via lote agendado.
```

4. **Quando rodando via `/schedule`** (modo não-interativo), a skill detecta a ausência do usuário e prossegue automaticamente.

## Agendamento

Para rodar semanalmente, use:
```
/schedule
```
e configure para invocar esta skill (ex: toda segunda às 9h com tema-base da semana).

## Pré-requisitos

- Brand book preenchido
- Pilares de conteúdo definidos (importante: o agente usa pilares como guia quando o tema-base é livre)
- Puppeteer instalado (`npm install` na raiz)

## Princípios

- **Variedade dentro de coerência.** Os N posts devem soar como família, não clones.
- **Distribuir entre pilares.** Não concentre todos no mesmo pilar.
- **Falhar um, seguir os outros.** Se um post der problema, marque-o, registre o erro, e continue os demais.
- **Mesmo formato em todo o lote.** Lote misto (carrossel + stories) não é suportado — crie 2 lotes separados.

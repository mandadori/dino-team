---
name: lote-carrosseis
description: Gera N variações de carrossel sobre um tema-base ou conjunto de subtemas. Útil para encher pauta semanal/mensal. Agendável via /schedule. Uso - /lote-carrosseis <N> <tema-base>.
---

# Lote de Carrosséis — Dino Team

Gera múltiplos carrosséis em sequência. Pode ser disparado manualmente ou agendado.

## Como rodar

1. **Parse dos argumentos:**
   - `N` — quantidade de carrosséis (default: 5 se omitido)
   - `tema-base` — tema guarda-chuva, opcional

2. **Invoque o `diretor-marca`** com o seguinte prompt:

```
Você foi acionado para gerar um LOTE de {N} carrosséis da Dino Team.

Tema-base: {tema-base ou "livre — escolha temas estratégicos dos pilares atuais"}
Data: {YYYY-MM-DD de hoje}

Processo:
1. Leia o brand book e os pilares de conteúdo.
2. Gere uma lista de {N} ângulos/subtemas distintos que se conectam ao tema-base (ou aos pilares se tema-base for livre).
3. Apresente a lista ao usuário e peça confirmação ANTES de executar os pipelines completos.
4. Após confirmação, para cada subtema, execute o pipeline completo (Passos 1-6).
5. Use slugs distintos por carrossel: {data}-{slug-subtema}.
6. Ao final, reporte ao usuário um resumo com os {N} caminhos das pastas e títulos.

Importante: SE NÃO HOUVER USUÁRIO PRESENTE (modo agendado), pule a confirmação e prossiga com todos os subtemas que você selecionou. Marque os carrosséis como gerados via lote agendado.
```

3. **Quando rodando via `/schedule`** (modo não-interativo), a skill detecta a ausência do usuário e prossegue automaticamente.

## Agendamento

Para rodar semanalmente, use:
```
/schedule
```
e configure para invocar esta skill (ex: toda segunda às 9h com tema-base da semana).

## Pré-requisitos

- Brand book preenchido
- Pilares de conteúdo definidos (importante: o agente usa pilares como guia quando o tema-base é livre)

## Princípios

- **Variedade dentro de coerência.** Os N carrosséis devem soar como família, não clones.
- **Distribuir entre pilares.** Não concentre todos no mesmo pilar.
- **Falhar um, seguir os outros.** Se um carrossel der problema, marque-o, registre o erro, e continue os demais.

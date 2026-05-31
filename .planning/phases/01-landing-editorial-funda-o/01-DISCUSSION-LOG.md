# Phase 1: Landing Editorial + Fundação - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-31
**Phase:** 1-Landing Editorial + Fundação
**Areas discussed:** Direção editorial & luz/sombra, Fotos do Ramon, Intensidade da animação

---

## Direção editorial & luz/sombra

| Option | Description | Selected |
|--------|-------------|----------|
| Alternar branco/preto (revista) | Seções alternam fundo branco e preto, máximo impacto editorial | |
| Majoritariamente preta, brancos pontuais | Mantém alma escura; branco entra só em 1–2 momentos | ✓ |
| Inverter pra base clara | Home majoritariamente branca, preto vira acento | |

**User's choice:** Majoritariamente preta, brancos pontuais.

| Option | Description | Selected |
|--------|-------------|----------|
| Display grande de revista | Anton enorme, ocupando largura da tela | |
| Contida e hierárquica (atual+) | Refina escala atual; sobriedade > impacto | ✓ |
| Você decide | Critério do Claude | |

**User's choice:** Tipografia contida e hierárquica.
**Notes:** Trabalho de contraste AA foca nos poucos blocos brancos; cinza atual sobre preto mantido.

---

## Fotos do Ramon

| Option | Description | Selected |
|--------|-------------|----------|
| Não tenho ainda | Implementa com placeholders, slots prontos | |
| Tenho algumas / em breve | Implementa com o que houver, marca slots faltantes | ✓ |
| Tenho todas | Integra de verdade já nesta fase | |

**User's choice:** Tenho algumas / em breve.

| Option | Description | Selected |
|--------|-------------|----------|
| Full-bleed P&B alto contraste | Foto sangra até a borda, texto sobreposto | ✓ |
| Enquadrada com respiro | Foto em moldura/coluna com margem | |
| Você decide | Critério por seção | |

**User's choice:** Full-bleed P&B alto contraste.
**Notes:** Texto sobre foto exige overlay/scrim para legibilidade AA. Definir pasta-convenção de assets.

---

## Intensidade da animação

| Option | Description | Selected |
|--------|-------------|----------|
| Só entradas + parallax leve | Reveals + parallax sutil nas fotos | ✓ |
| Entradas + 1–2 momentos pinados | Acima + pin/scrub GSAP | |
| Você decide | Calibrar por seção dentro do budget | |

**User's choice:** Só entradas + parallax leve (sem pin/scrub).

| Option | Description | Selected |
|--------|-------------|----------|
| Mínimas e funcionais | Hover de CTA, contador existente | ✓ |
| Detalhe editorial pontual | Microinterações com intenção em momentos-chave | |
| Você decide | Critério do Claude | |

**User's choice:** Microinterações mínimas e funcionais.

---

## Claude's Discretion

- Reskin vs re-layout das 7 seções (propor no plano).
- Migração ou não do `Reveal.tsx` (Framer → GSAP).
- Quais blocos recebem fundo branco pontual e qual seção além do Hero ganha parallax.

## Deferred Ideas

- Momento WebGL / three.js (DSGN-06) — v2, spike-gated.
- Seções de conversão (Planos/Comunidade/Depoimentos) e WhatsApp real — Fase 2.
- Pin/scrub e coreografia scroll rica — descartado por tom nesta fase.

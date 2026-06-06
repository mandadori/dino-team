---
phase: 02
slug: convers-o-completa
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-01
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — no test runner in project (verified) |
| **Config file** | none |
| **Quick run command** | `npm run build && npm run typecheck && npm run lint` (inside `site/`) |
| **Full suite command** | `npm run build && npm run typecheck && npm run lint` (inside `site/`) |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck && npm run lint` (inside `site/`)
- **After every plan wave:** Run `npm run build && npm run typecheck && npm run lint` (inside `site/`)
- **Before `/gsd:verify-work`:** Full build + typecheck + lint must pass green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| constants-01 | constants | 1 | CONV-01, CONF-01 | — | Placeholder URLs, no real number exposed | build | `cd site && npm run typecheck` | ❌ new | ⬜ pending |
| plans-section | plans | 1 | CONV-01 | — | No hardcoded hex, only tokens | build | `cd site && npm run build` | ❌ new | ⬜ pending |
| testimonials-section | testimonials | 1 | CONV-02 | — | publishable=false items never render | build | `cd site && npm run build` | ❌ new | ⬜ pending |
| community-section | community | 1 | CONV-03 | — | Community link separated from support link | build | `cd site && npm run build` | ❌ new | ⬜ pending |
| page-integration | integration | 2 | CONV-01..03 | — | Section order: Depoimentos→Comunidade→Planos | build | `cd site && npm run build` | ✅ existing | ⬜ pending |
| resultados-cleanup | cleanup | 2 | CONV-02 | — | Stale placeholder removed from Resultados.tsx | build | `cd site && npm run lint` | ✅ existing | ⬜ pending |
| cta-final-copy | cta | 2 | D-04 | — | Existing emotional copy preserved/refined | build | `cd site && npm run typecheck` | ✅ existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*None — no test framework to install. Build is the gate.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cards de Planos: monocromático estrito, sem badge "popular" | CONV-01 | Visual | Abrir localhost:3000, inspecionar seção Planos — 2 cards sem badge, tokens apenas |
| WhatsApp placeholder abre wa.me/ sem número real | CONF-01 | Visual | Clicar CTA de Plano — deve abrir `wa.me/` com número placeholder visível na URL |
| publishable=false depoimentos não renderizam | CONV-02 | Visual | Placeholders têm `publishable: false`; seção renderiza heading + grade vazia |
| Seção Comunidade: exclusividade reforçada, sem gamificação | CONV-03 | Visual | Ler copy da seção — sem contador de membros, sem promessa de "qualquer um entra" |
| Ordem das seções: Depoimentos→Comunidade→Planos→FAQ→CtaFinal | D-01 | Visual | Scroll completo da landing — confirmar sequência |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

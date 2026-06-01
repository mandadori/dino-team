---
phase: 1
slug: landing-editorial-funda-o
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — repo has no test runner. RESEARCH.md recommends NOT introducing Vitest/Playwright this phase. |
| **Config file** | none |
| **Quick run command** | `cd site && npm run lint && npx tsc --noEmit` |
| **Full suite command** | `cd site && npm run build` |
| **Estimated runtime** | ~30–90 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `cd site && npm run lint && npx tsc --noEmit`
- **After every plan wave:** Run `cd site && npm run build`
- **Before `/gsd:verify-work`:** Build must be green + manual a11y/bundle checks pass
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | — | — | DSGN-01..05, RDSN-01..02 | — | N/A (frontend, no auth surface) | build/lint/typecheck + manual | `cd site && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Per-task rows filled by the planner — every visual/animation task maps to a build gate + a manual verification line below.*

---

## Wave 0 Requirements

- [ ] No test framework install — intentionally deferred (RESEARCH.md: avoid Vitest/Playwright this phase)
- [ ] Confirm `npm run lint`, `npx tsc --noEmit`, and `npm run build` all run clean on current `site/` before redesign begins (baseline)

*Existing build/lint/typecheck infrastructure covers automated verification; visual + a11y behaviors are manual-only (below).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 7 seções renderizam no padrão editorial monocromático com fotos P&B (ou placeholder intencional) no Hero/SobreRamon | RDSN-01, RDSN-02 | Avaliação visual subjetiva contra UI-SPEC | Rodar `npm run dev`, inspecionar cada seção contra `01-UI-SPEC.md` |
| Texto secundário sobre fundo branco passa contraste WCAG AA (≥4.5:1) | DSGN-01, DSGN-02 | Requer medição de contraste real (atenção ao piso `#7f7f7f` sobre `#0a0a0a`) | DevTools/axe ou contrast checker em cada par fg/bg; medir após troca de tokens |
| Com `prefers-reduced-motion` ativo, nenhuma animação scroll/microinteração dispara | DSGN-03 | Requer toggle de OS/DevTools e observação | Emular `prefers-reduced-motion: reduce` no DevTools; recarregar; confirmar conteúdo estático e completo (Reveal, AnimatedCounter, GSAP, anime todos gated) |
| Lib correta por papel (GSAP=scroll, anime.js=microinteração, Framer=legado) | DSGN-04 | Auditoria de código + comportamento | Inspecionar imports por componente; confirmar `@gsap/react` instalado e usado só em scroll |
| first-load JS da home < 200KB | DSGN-05 | Requer leitura do output de build | Ler tabela de bundle de `npm run build` (First Load JS da rota `/`); confirmar < 200KB |

---

## Validation Sign-Off

- [ ] All tasks have an automated build/lint/typecheck gate OR a manual verification line above
- [ ] Sampling continuity: build runs after every wave
- [ ] Wave 0 baseline confirmed green before redesign
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter (after planner fills per-task map)

**Approval:** pending

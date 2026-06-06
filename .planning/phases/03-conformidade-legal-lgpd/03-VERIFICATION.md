---
phase: 03-conformidade-legal-lgpd
verified: 2026-06-02T12:34:56Z
status: human_needed
score: 8/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Verificar comportamento de consentimento em navegador real"
    expected: "Banner aparece no primeiro acesso; nenhum script de tracking carrega antes da decisão; Aceitar ativa os scripts e persiste por 6 meses; Recusar mantém scripts suprimidos; ambos os botões são acessíveis via teclado; prefers-reduced-motion desativa transições"
    why_human: "Comportamento runtime (DOM, rede, localStorage, animações) não pode ser verificado sem um navegador — o Task 3 do PLAN 01 é um checkpoint:human-verify bloqueante"
---

# Phase 3: Conformidade Legal & LGPD — Verification Report

**Phase Goal:** O site fica legalmente apto a coletar dados — o tracking só dispara após consentimento explícito e existem as páginas legais que o sustentam.
**Verified:** 2026-06-02T12:34:56Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Um visitante acessa páginas de Política de Privacidade e Termos de Uso navegáveis e on-brand | VERIFIED | `app/privacidade/page.tsx` (242 linhas, RSC, Anton/Montserrat, max-w-3xl, header+footer fixos) e `app/termos/page.tsx` (199 linhas, estrutura idêntica) existem com prose LGPD completa |
| 2 | No primeiro acesso, um banner de cookie consent bloqueia o disparo de GA4/Meta/Clarity até o visitante decidir — recusar mantém os scripts desativados | VERIFIED (code) + HUMAN NEEDED (runtime) | `CookieBanner.tsx`: `if (decided) return null` — aparece só quando sem decisão; `TrackingScripts.tsx`: `if (!consent) return null` — suprime todos os scripts sem consentimento. Confirmação em navegador exigida. |
| 3 | Após conceder consentimento, os TrackingScripts passam a carregar; o visitante consegue revogar o consentimento depois | VERIFIED (code) + HUMAN NEEDED (runtime) | `ConsentProvider.tsx` expõe `accept()` e `refuse()` que escrevem `{ choice, expiresAt }` em localStorage e atualizam estado; `TrackingScripts.tsx` monta os 4 `<Script>` blocos quando `consent === true`. Confirmação em navegador exigida. |

**Score:** 3/3 ROADMAP success criteria — todos verificados no código; 2 deles exigem confirmação humana em runtime.

---

### Required Artifacts (Plan 01 — LEGAL-03)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `site/lib/site.ts` | Consent key + 6-month TTL constants | VERIFIED | `COOKIE_CONSENT_KEY = "dino-consent"` (linha 112); `COOKIE_CONSENT_TTL_MS = 6 * 30 * 24 * 60 * 60 * 1000` (linha 116); comentário LEGAL-03 presente |
| `site/components/ConsentProvider.tsx` | Client-side consent state (read/write localStorage) shared via useConsent() | VERIFIED | `"use client"` como primeira linha; `createContext` + `useConsent` exportados; `accept()` e `refuse()` persistem `{ choice, expiresAt }`; todo acesso a `window.localStorage` ocorre dentro de `readStoredChoice()` (chamada em `useEffect`) e `persist()` (callback) — zero acesso no topo do módulo |
| `site/components/CookieBanner.tsx` | Fixed bottom consent bar, client island, Aceitar/Recusar + link /privacidade | VERIFIED | `"use client"` como primeira linha; `role="region"`; `aria-label="Consentimento de cookies"`; sem `aria-modal`; 2 `<button>` reais (Aceitar + Recusar, linha 54 e 61 — a ocorrência 17 é comentário); link `href="/privacidade"` com texto "Política de Privacidade"; copy sem clichê proibido |
| `site/components/TrackingScripts.tsx` | Tracking scripts gated on consent === true | VERIFIED | `"use client"` como primeira linha; `if (!consent) return null` (linha 20); 4 `<Script>` ocorrências intactas (GA4 src, ga-init, meta-pixel, ms-clarity) |
| `site/app/layout.tsx` | Wraps children + CookieBanner + TrackingScripts in ConsentProvider | VERIFIED | Importa `ConsentProvider`, `CookieBanner`, `TrackingScripts`; body envolto em `<ConsentProvider>` com `{children}`, `<CookieBanner />` e `<TrackingScripts />` dentro (linhas 48-52) |

### Required Artifacts (Plan 02 — LEGAL-01, LEGAL-02)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `site/app/privacidade/page.tsx` | RSC Política de Privacidade, editorial da marca | VERIFIED | 242 linhas; sem `"use client"`; H1 "POLÍTICA DE PRIVACIDADE"; `max-w-3xl`; header fixo (`fixed inset-x-0 top-0`); footer (`border-t border-line px-6 py-12`); tokens `[RAZÃO SOCIAL]` (linha 52, quebrado em 2 linhas no TSX), `[CNPJ]` (linha 53), `[E-MAIL DO ENCARREGADO DE DADOS]` (linhas 55, 163, 190); GA4/Meta Pixel/Clarity mencionados na seção de dados coletados; seção 7 lista direitos LGPD completos; `metadata` export presente |
| `site/app/termos/page.tsx` | RSC Termos de Uso, estrutura idêntica | VERIFIED | 199 linhas; sem `"use client"`; H1 "TERMOS DE USO"; `max-w-3xl`; mesma estrutura de header/footer; `[RAZÃO SOCIAL]`, `[CNPJ]`, `[E-MAIL DO ENCARREGADO DE DADOS]`, `[COMARCA/UF]`, `[DATA]` presentes; "não garantimos ausência de erros" é cláusula de limitação de responsabilidade legítima — sem promessa de resultado ou prazo proibidos; `metadata` export presente |
| `site/app/page.tsx` | Footer com links para /privacidade e /termos | VERIFIED | Importa `Link from "next/link"` (linha 13); footer contém `href="/privacidade"` (linha 53) e `href="/termos"` (linha 59) com classes `hover:text-fg` + focus-visible ring; wordmark "Dino Team" e tagline preservados |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `site/app/layout.tsx` | ConsentProvider | Wraps children + CookieBanner + TrackingScripts | WIRED | Importado e usado como wrapper do body (linhas 4, 48-52) |
| `site/components/TrackingScripts.tsx` | ConsentProvider consent state | `useConsent()` hook | WIRED | Importado (linha 4) e usado para ler `consent` (linha 15) |
| `site/components/CookieBanner.tsx` | ConsentProvider (decided, accept, refuse) | `useConsent()` hook | WIRED | Importado (linha 4) e usado para ler `decided`, `accept`, `refuse` (linha 25) |
| `site/components/CookieBanner.tsx` | /privacidade | `next/link` com `href="/privacidade"` | WIRED | Link presente (linhas 45-50) |
| `site/app/page.tsx` footer | /privacidade e /termos | `next/link` | WIRED | Ambos os links presentes (linhas 53, 59) com import de Link (linha 13) |
| `site/app/privacidade/page.tsx` | design tokens (bg-bg/text-fg/font-display) | `max-w-3xl`, classes Tailwind | WIRED | `max-w-3xl`, `font-display`, `font-body`, `text-fg`, `text-muted` usados em toda a página |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `CookieBanner.tsx` | `decided` (do `useConsent()`) | `ConsentProvider.tsx` → `useEffect` → `window.localStorage.getItem(COOKIE_CONSENT_KEY)` | Sim — lê estado real do localStorage; `decided = true` quando choice não-expirada existe | FLOWING |
| `TrackingScripts.tsx` | `consent` (do `useConsent()`) | Mesmo fluxo acima; `consent = choice === "accepted"` | Sim — valor booleano real, não hardcoded | FLOWING |
| `ConsentProvider.tsx` accept/refuse | localStorage write | `window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({choice, expiresAt}))` | Sim — persiste com TTL real | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| ConsentProvider exporta `useConsent` | `grep -c "useConsent" components/ConsentProvider.tsx` | 2 (definição + export) | PASS |
| TrackingScripts gated por consent | `grep -c "if (!consent) return null" components/TrackingScripts.tsx` | 1 | PASS |
| Layout wraps em ConsentProvider | `grep -c "ConsentProvider" app/layout.tsx` | 3 (import + opening + closing tag) | PASS |
| Script count intacto | `grep -c "<Script" components/TrackingScripts.tsx` | 4 | PASS |
| Privacidade RSC (sem "use client") | `grep -c '"use client"' app/privacidade/page.tsx` | 0 | PASS |
| Termos RSC (sem "use client") | `grep -c '"use client"' app/termos/page.tsx` | 0 | PASS |
| Footer home contém /privacidade e /termos | `grep -n "privacidade\|termos" app/page.tsx` | Links presentes (linhas 53, 59) | PASS |
| Banner copy sem clichê proibido | `grep -i "importa para nós\|valorizamos sua privacidade" components/CookieBanner.tsx` | 0 | PASS |

Step 7b: Verificação de build (`npx next build`) não foi re-executada — SUMMARY documenta sucesso; verificação de comportamento runtime está em Human Verification abaixo.

---

### Probe Execution

Step 7c: Nenhum probe `scripts/*/tests/probe-*.sh` foi declarado ou encontrado para esta fase. SKIPPED.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| LEGAL-01 | 03-02-PLAN.md | Página de Política de Privacidade | SATISFIED | `app/privacidade/page.tsx` (242 linhas, RSC, prose LGPD completa, tokens de empresa em placeholder, acessível via footer e /privacidade route) |
| LEGAL-02 | 03-02-PLAN.md | Página de Termos de Uso | SATISFIED | `app/termos/page.tsx` (199 linhas, RSC, prose completa sem promessa de resultado, acessível via footer e /termos route) |
| LEGAL-03 | 03-01-PLAN.md | Banner de cookie consent que condiciona disparo de TrackingScripts | SATISFIED (code) | `ConsentProvider` + `CookieBanner` + `TrackingScripts` gated + `layout.tsx` wired; confirmação runtime pendente (human check) |

Sem requisitos órfãos: todos os 3 IDs mapeados em REQUIREMENTS.md para Phase 3 (LEGAL-01, LEGAL-02, LEGAL-03) estão cobertos pelos 2 planos desta fase.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | Nenhum |

Varredura nos 7 arquivos criados/modificados pela fase: zero ocorrências de `TBD`, `FIXME`, `XXX`, `TODO`, `HACK`, `PLACEHOLDER`, `return null` como stub (todos os `return null` são guards legítimos de consentimento e de parsing de JSON), `return {}`, `return []`. Os tokens `[RAZÃO SOCIAL]`, `[CNPJ]`, `[E-MAIL DO ENCARREGADO DE DADOS]`, `[COMARCA/UF]`, `[DATA]` são placeholders intencionais documentados (D-01, threat register T-03-04 disposition: accept) — não são dívida técnica.

---

### Human Verification Required

#### 1. Consent Lifecycle in Browser

**Test:** Abrir `http://localhost:3000` em aba anônima (após `cd site && npx next dev`), com `NEXT_PUBLIC_GA_ID` configurado em `.env.local` (ou verificar via DOM se não configurado).

**Expected:**
1. Banner aparece no rodapé (fixo, monocromático) — página NÃO trava e NÃO desloca (sem CLS).
2. Antes de qualquer clique: DevTools → Network/Elements — zero requisições para googletagmanager / connect.facebook.net / clarity.ms; zero `<script>` tags desses domínios.
3. Clicar "Política de Privacidade": navega para /privacidade.
4. Voltar à home, clicar "Aceitar": banner desaparece (fade/slide discreto); scripts de tracking carregam (requisições de rede aparecem). Reload → sem banner, tracking permanece ativo.
5. Nova aba anônima, clicar "Recusar": banner desaparece; zero scripts de tracking. Reload → sem banner, ainda sem tracking.
6. Teclado: Tab chega nos dois botões com anel de foco visível branco; "Recusar" não é mais difícil de alcançar que "Aceitar".
7. Ativar "Reduce motion" no SO e recarregar: banner aparece/desaparece instantaneamente, sem transição.

**Why human:** Comportamento DOM, rede, localStorage e animações exigem navegador real — verificação estática de código não comprova esses invariantes em tempo de execução. O Task 3 do PLAN 01 é um `checkpoint:human-verify` com `gate="blocking"`.

*Nota: SUMMARY 03-01 documenta que o usuário aprovou este checkpoint em 2026-06-02 ("all seven browser verification steps passed"). Esta verificação solicita confirmação do aprovador (ou re-teste em sessão nova) para que o status possa avançar para `passed`.*

---

### Gaps Summary

Nenhuma lacuna técnica encontrada. Todos os 8 must-haves (6 do PLAN-01 + 5 do PLAN-02, agrupados nas 3 success criteria do ROADMAP) estão verificados no código. O status `human_needed` reflete o `checkpoint:human-verify` bloqueante do PLAN 01 (Task 3), cuja aprovação foi documentada no SUMMARY mas deve ser confirmada pelo aprovador para fechamento formal da fase.

---

_Verified: 2026-06-02T12:34:56Z_
_Verifier: Claude (gsd-verifier)_

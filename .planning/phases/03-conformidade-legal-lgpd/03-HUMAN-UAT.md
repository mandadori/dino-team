---
status: partial
phase: 03-conformidade-legal-lgpd
source: [03-VERIFICATION.md]
started: 2026-06-02T00:00:00.000Z
updated: 2026-06-02T00:00:00.000Z
---

## Current Test

[awaiting human confirmation]

## Tests

### 1. Consent lifecycle in browser

expected: Banner aparece na primeira visita sem bloquear conteúdo nem causar CLS. Nenhum script de tracking carrega antes de uma escolha. Aceitar carrega GA4/Meta/Clarity e o banner desaparece (persiste no reload). Recusar suprime todos os scripts (persiste no reload). Ambos os botões acessíveis por teclado com anel de foco visível. `prefers-reduced-motion` desativa a transição de saída.
result: [pending]

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps

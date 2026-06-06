# Phase 2: Conversão Completa - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 2-Conversão Completa
**Areas discussed:** Ordem das seções, Dados dos Planos, Depoimentos: conteúdo e gate, Comunidade: o que mostrar

---

## Ordem das Seções

| Option | Description | Selected |
|--------|-------------|----------|
| Depoimentos → Planos → Comunidade | Prova social → preço → comunidade antes do CTA | |
| Planos → Depoimentos → Comunidade | Oferta primeiro, provas confirmam | |
| Planos → Comunidade → Depoimentos | Menos convencional | |
| Você decide | Delegar ao executor | |
| **Depoimentos → Comunidade → Planos** | Prova social → suporte → preço | ✓ |

**User's choice:** "Depoimentos, comunidade, planos" (resposta livre)
**Notes:** Sequência não convencional — o usuário colocou Planos no fim (antes do FAQ), o que é mais agressivo que o padrão. CtaFinal foi decidido como reforço emocional (copy diferente, não duplica o CTA dos Planos). Seções existentes não se movem.

---

## Dados dos Planos

| Option | Description | Selected |
|--------|-------------|----------|
| Dados chegam agora | Preços/nomes/inclusos fornecidos no chat | |
| **Placeholders marcados** | Mesmo padrão das fotos da Fase 1 | ✓ |

**Quantidade de planos:**

| Option | Selected |
|--------|----------|
| **2 planos** | ✓ |
| 3 planos | |
| Você decide | |

**CTA WhatsApp:**

| Option | Selected |
|--------|----------|
| **Deeplink personalizado por plano** | ✓ |
| URL genérica (NEXT_PUBLIC_WHATSAPP_URL) | |

**Organização no código:**

| Option | Selected |
|--------|----------|
| **PLANS em lib/site.ts** | ✓ |
| Gerado via função + env var | |

**Notes:** Padrão placeholder adotado consistentemente (como fotos na Fase 1). Deeplinks ficam em cada objeto do array PLANS, não em env vars separadas.

---

## Depoimentos: Conteúdo e Gate

**Quantidade:**

| Option | Selected |
|--------|----------|
| **3 depoimentos** | ✓ |
| 4–6 depoimentos | |
| Você decide | |

**Foto:**

| Option | Selected |
|--------|----------|
| **Opcional (avatar placeholder)** | ✓ |
| Obrigatória | |

**Gate editorial:**

| Option | Selected |
|--------|----------|
| **Campo publishable no objeto** | ✓ |
| Array vazio até dados reais chegarem | |

**Layout:**

| Option | Selected |
|--------|----------|
| **Grade 3 colunas desktop / empilhado mobile** | ✓ |
| Carrossel (Embla ou Framer) | |

**Notes:** Solução elegante: publishable: false mantém placeholders no código sem aparecer no site. Sem carrossel porque o número fixo de 3 não exige navegação.

---

## Comunidade: O Que Mostrar

**Plataforma:**

| Option | Selected |
|--------|----------|
| **Grupo de WhatsApp exclusivo para alunos** | ✓ |
| Telegram / Discord / plataforma própria | |
| Parte do plano (sem CTA separado) | |

**Composição visual:**

| Option | Selected |
|--------|----------|
| **Título + 3–4 benefícios textuais + CTA WhatsApp** | ✓ |
| Título + quote de membro + benefícios + CTA | |
| Você decide | |

**Conteúdo:**

| Option | Selected |
|--------|----------|
| **Placeholders marcados** | ✓ |
| Textos chegam agora | |

**CTA:**

| Option | Description | Selected |
|--------|-------------|----------|
| **Link de grupo WhatsApp** | chat.whatsapp.com/... — separado do suporte | ✓ |
| Mesmo NEXT_PUBLIC_WHATSAPP_URL | Mistura suporte com entrada na comunidade | |

**User's choice:** "A comunidade é um grupo fechado no WhatsApp exclusivo para alunos" (resposta livre)
**Notes:** Grupo exclusivo de alunos — o copy deve reforçar a exclusividade (acesso via contrato, não público). COMMUNITY_WHATSAPP_URL é constante separada.

---

## Claude's Discretion

- **Distinção visual dos 2 cards de Planos** — borda, fundo (`surface` vs `bg`), ou dimensão; executor decide respeitando monocromático estrito e sem badge "popular".
- **Copy do CtaFinal** — nova copy de reforço emocional escrita pelo executor seguindo brand book e tom-de-voz.
- **Animações das 3 novas seções** — seguem padrão Fase 1 (Reveal + microinterações mínimas), sem novidade.

## Deferred Ideas

- Quote de membro da Comunidade — levantado e descartado para manter a seção simples.
- Carrossel de depoimentos — quando houver mais de 3 publicáveis.
- COMMUNITY_WHATSAPP_URL como env var — se o link mudar com frequência no futuro.
- CONV-04 (contador de membros) — v2, só com número real.

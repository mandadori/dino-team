---
phase: 02-conversao-completa
reviewed: 2026-06-01T12:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - site/app/page.tsx
  - site/components/sections/Comunidade.tsx
  - site/components/sections/CtaFinal.tsx
  - site/components/sections/Depoimentos.tsx
  - site/components/sections/Planos.tsx
  - site/components/sections/Resultados.tsx
  - site/lib/site.ts
findings:
  critical: 2
  warning: 3
  info: 2
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-06-01T12:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Os 7 arquivos da fase de conversão foram revisados: a página raiz `app/page.tsx`, as seções de conversão (Comunidade, CtaFinal, Depoimentos, Planos, Resultados) e a lib de constantes `site.ts`. A estrutura geral é sólida — RSC correto em todas as seções, `rel="noopener noreferrer"` presente nos links externos, reduced-motion implementado em dois pontos ortogonais (`Reveal` via `useReducedMotion`, `AnimatedCounter` via `usePrefersReducedMotion`). Dois problemas críticos foram identificados: um que faz os deeplinks de plano enviarem o nome errado ao WhatsApp, comprometendo rastreabilidade de lead; outro que expõe um link de grupo WhatsApp hardcoded sem override via env var. Três warnings adicionais afetam consistência operacional e acessibilidade em produção.

---

## Critical Issues

### CR-01: Deeplinks de plano usam identificador abreviado em vez do nome real — mensagem no WhatsApp diverge do botão

**File:** `site/lib/site.ts:43-73` e `site/components/sections/Planos.tsx:54`

**Issue:** A função `planDeeplink` (linha 44) recebe o argumento literal `"A"` ou `"B"` (linhas 66 e 73) e gera a mensagem pré-preenchida `"Quero o Plano A"` / `"Quero o Plano B"`. O botão CTA renderizado pelo componente Planos exibe `"Quero o Plano {p.name}"` — ou seja, `"Quero o Plano PLACEHOLDER A"` hoje, e `"Quero o Plano Starter"` / `"Quero o Plano Elite"` quando os nomes reais forem preenchidos.

O resultado: a mensagem que chega ao consultor no WhatsApp não identifica o plano que o lead selecionou. Um lead que clicou em "Quero o Plano Elite" chega com a mensagem "Quero o Plano B" — o consultor não tem como distinguir sem perguntar de volta, quebrando o fluxo de qualificação.

A causa raiz é que `planDeeplink` não recebe `p.name` — recebe uma string arbitrária desacoplada do nome exibido.

**Fix:**

Remover `planDeeplink` e calcular a URL diretamente dentro do array `PLANS`, usando o próprio `name` do plano:

```ts
// site/lib/site.ts — substituir linhas 44-73

export const PLANS: ReadonlyArray<{
  name: string;
  price: string;
  includes: ReadonlyArray<string>;
  whatsappUrl: string;
}> = ((): ReadonlyArray<{ name: string; price: string; includes: ReadonlyArray<string>; whatsappUrl: string }> => {
  const makeUrl = (name: string) =>
    "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent("Quero o Plano " + name);

  return [
    {
      name: "PLACEHOLDER A",
      price: "Sob consulta",
      includes: ["PLACEHOLDER"],
      whatsappUrl: makeUrl("PLACEHOLDER A"), // usa o mesmo name do card
    },
    {
      name: "PLACEHOLDER B",
      price: "Sob consulta",
      includes: ["PLACEHOLDER"],
      whatsappUrl: makeUrl("PLACEHOLDER B"),
    },
  ];
})();
```

Alternativa minimalista: manter `planDeeplink` mas passar `p.name` em vez de `"A"`/`"B"`:

```ts
// linhas 66 e 73 — trocar os literais pelo nome completo
whatsappUrl: planDeeplink("PLACEHOLDER A"),
// ...
whatsappUrl: planDeeplink("PLACEHOLDER B"),
```

---

### CR-02: `COMMUNITY_WHATSAPP_URL` é hardcoded sem override via env var — impossível configurar antes do deploy sem editar código

**File:** `site/lib/site.ts:93-95`

**Issue:** `COMMUNITY_WHATSAPP_URL` está definida como string literal `"https://chat.whatsapp.com/PLACEHOLDER"` sem nenhum lookup de variável de ambiente:

```ts
export const COMMUNITY_WHATSAPP_URL =
  "https://chat.whatsapp.com/PLACEHOLDER"; // linha 94-95
```

Em contraste, `WHATSAPP_URL` (linhas 8-11) lê `process.env.NEXT_PUBLIC_WHATSAPP_URL` antes de cair no placeholder. O padrão declarado no `.env.example` é claro: "PREENCHER com o número real antes do deploy". `COMMUNITY_WHATSAPP_URL` burla esse padrão — não há como configurá-la via variável de ambiente sem alterar o código-fonte.

Consequência concreta: se o site for publicado antes de o código ser editado manualmente, o botão "Entrar na comunidade" levará todos os visitantes para `https://chat.whatsapp.com/PLACEHOLDER`. Links `chat.whatsapp.com/` com token inválido ou inesperado podem resultar em erro do WhatsApp ou, em casos extremos, apontar para um grupo criado por terceiros com aquela token exata.

**Fix:**

```ts
// site/lib/site.ts — substituir linhas 93-95
export const COMMUNITY_WHATSAPP_URL =
  process.env.NEXT_PUBLIC_COMMUNITY_WHATSAPP_URL ||
  "https://chat.whatsapp.com/PLACEHOLDER"; // grupo exclusivo — configurar NEXT_PUBLIC_COMMUNITY_WHATSAPP_URL antes do deploy
```

Adicionar ao `.env.example`:

```
# Link de convite do grupo exclusivo de alunos Dino Team (chat.whatsapp.com/...)
NEXT_PUBLIC_COMMUNITY_WHATSAPP_URL=
```

---

## Warnings

### WR-01: `WA_NUMBER` dos deeplinks de plano diverge do número usado pelo CTA primário quando env var está configurada

**File:** `site/lib/site.ts:39-40`

**Issue:** `WA_NUMBER` é extraído de `NEXT_PUBLIC_WHATSAPP_URL` via regex (linha 40). Se `NEXT_PUBLIC_WHATSAPP_URL` estiver configurado como URL completa (ex: `https://wa.me/5511999999999?text=...`), o regex `/wa\.me\/([^?]+)/` captura corretamente o número. Porém, se a URL não contiver `wa.me/` (ex: uma URL encurtada, ou um formato diferente), o match falha e `WA_NUMBER` cai em `"0000000000"`, mesmo com `NEXT_PUBLIC_WHATSAPP_URL` preenchida.

O CTA primário (`WHATSAPP_URL`) usa a URL inteira de `NEXT_PUBLIC_WHATSAPP_URL` — funciona corretamente em qualquer formato. Os deeplinks de plano dependem do regex — podem silenciosamente usar o número fake enquanto o CTA primário funciona. A divergência não é visível nos logs e o deploy pode parecer correto.

**Fix:**

Eliminar a extração frágil via regex. Reutilizar diretamente a base de `WHATSAPP_URL` para os deeplinks de plano, substituindo só o parâmetro `text`:

```ts
// site/lib/site.ts — substituir linhas 37-51
function planDeeplink(planName: string): string {
  // Reutiliza a URL base do CTA primário, trocando apenas o texto pré-preenchido.
  // Evita divergência de número entre CTAs.
  const base = (process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/0000000000")
    .split("?")[0]; // remove qualquer query string existente
  return base + "?text=" + encodeURIComponent("Quero o Plano " + planName);
}
```

---

### WR-02: Chaves React baseadas em `name: "PLACEHOLDER"` causarão colisão quando depoimentos reais forem publicados

**File:** `site/components/sections/Depoimentos.tsx:37` e `site/lib/site.ts:87-90`

**Issue:** Os três registros em `TESTIMONIALS` têm `name: "PLACEHOLDER"`. O componente usa `key={t.name}` (linha 37). Atualmente o gate `publishable: false` impede que qualquer card seja renderizado, então React nunca vê as chaves duplicadas. Porém, ao substituir os placeholders por depoimentos reais, se dois alunos tiverem o mesmo nome (ex: dois "João"), ou se o desenvolvedor esquecer de trocar o `name` mas marcar `publishable: true`, React emitirá aviso de chave duplicada e pode renderizar um card em lugar do outro.

**Fix:**

Adicionar campo `id` ao tipo e usá-lo como chave:

```ts
// site/lib/site.ts
export const TESTIMONIALS: ReadonlyArray<{
  id: string; // slug único — ex: "joao-silva-2025"
  name: string;
  context: string;
  change: string;
  result: string;
  photo?: string;
  publishable: boolean;
}> = [
  { id: "placeholder-1", name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
  { id: "placeholder-2", name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
  { id: "placeholder-3", name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
];

// site/components/sections/Depoimentos.tsx linha 37
<Reveal key={t.id} delay={0.08 * i}>
```

---

### WR-03: `COMMUNITY_BENEFITS` renderiza strings com prefixo `"PLACEHOLDER — "` diretamente na tela — sem gate de ocultação

**File:** `site/lib/site.ts:101-104` e `site/components/sections/Comunidade.tsx:36`

**Issue:** Cada item de `COMMUNITY_BENEFITS` começa com `"PLACEHOLDER — "` na string (ex: `"PLACEHOLDER — Não está sozinho no processo..."`). O componente `Comunidade` renderiza o array incondicionalmente com `.map()`. Não existe filtro `publishable` nem qualquer mecanismo de ocultação — ao contrário de `TESTIMONIALS`, que usa `publishable: false` para suprimir cards vazios.

Se o site for acessado antes de os textos reais serem preenchidos (staging, preview de deploy, ou deploy acidental), os visitantes verão literalmente "PLACEHOLDER — Não está sozinho no processo" como conteúdo da seção.

**Fix:**

Aplicar o mesmo padrão de `TESTIMONIALS` — adicionar campo `ready: boolean` e filtrar antes de renderizar:

```ts
// site/lib/site.ts
export const COMMUNITY_BENEFITS: ReadonlyArray<{ text: string; ready: boolean }> = [
  { text: "Não está sozinho no processo...", ready: false },
  { text: "Acesso exclusivo a conteúdo...", ready: false },
  { text: "Comunidade fechada...", ready: false },
  { text: "Direção coletiva...", ready: false },
];

// site/components/sections/Comunidade.tsx
const visibleBenefits = COMMUNITY_BENEFITS.filter((b) => b.ready);
// renderizar visibleBenefits em vez de COMMUNITY_BENEFITS
```

Ou, como solução imediata de custo zero: remover o prefixo `"PLACEHOLDER — "` das strings, deixando apenas o texto definitivo já escrito — que é o copy real que deve aparecer.

---

## Info

### IN-01: `planDeeplink` é função privada com apenas dois call sites — pode ser eliminada após CR-01

**File:** `site/lib/site.ts:44-51`

**Issue:** A função `planDeeplink` existe apenas para construir as duas URLs em `PLANS`. Após a correção de CR-01 (que deve passar `p.name` em vez de `"A"`/`"B"`), e de WR-01 (que substitui a lógica de extração do número), a função perde razão de existir como abstração separada. Mantê-la como helper privado é ruído que obscurece o contrato real das URLs.

**Fix:** Após resolver CR-01 e WR-01, verificar se `planDeeplink` ainda justifica existência. Se não, inlinar ou remover.

---

### IN-02: Grade de depoimentos renderiza container com borda mesmo quando vazia

**File:** `site/components/sections/Depoimentos.tsx:35-77`

**Issue:** O `<div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">` é renderizado incondicionalmente, mesmo quando `visible.length === 0`. Na era de placeholder, isso resulta em um elemento com borda visível e `bg-line` (cor da grade) sem nenhum filho — uma linha/caixa vazia no layout. O comportamento documentado no componente ("grade fica vazia intencionalmente") é correto em intenção, mas o container externo cria artefato visual potencialmente confuso dependendo da viewport.

**Fix:**

Condicionar a renderização do container à existência de itens:

```tsx
{visible.length > 0 && (
  <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
    {visible.map((t, i) => (
      <Reveal key={t.id} delay={0.08 * i}>
        {/* ... */}
      </Reveal>
    ))}
  </div>
)}
```

---

_Reviewed: 2026-06-01T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

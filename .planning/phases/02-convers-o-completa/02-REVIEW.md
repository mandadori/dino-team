---
phase: 02-conversao-completa
reviewed: 2026-06-01T00:00:00Z
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

**Reviewed:** 2026-06-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Os 7 arquivos da fase de conversão (seções Comunidade, CtaFinal, Depoimentos, Planos, Resultados, a página root e a lib de constantes) foram revisados. A estrutura geral é sólida: RSC correto, reduced-motion implementado, `rel="noopener noreferrer"` presente nos links externos. No entanto, dois problemas críticos foram identificados — um que faz CTAs de plano enviarem mensagem errada ao WhatsApp, e outro que expõe um link de grupo inválido/público em build. Três warnings adicionais afetam consistência de entrega e acessibilidade.

---

## Critical Issues

### CR-01: Texto do deeplink de plano diverge do texto do botão CTA

**File:** `site/lib/site.ts:43-50` e `site/components/sections/Planos.tsx:54`

**Issue:** `planDeeplink(planName)` recebe apenas a letra abreviada do plano (`"A"` ou `"B"`) e gera o texto `"Quero o Plano A"`. Mas o botão renderizado no componente Planos exibe `"Quero o Plano {p.name}"`, ou seja, `"Quero o Plano PLACEHOLDER A"`. Quando os nomes reais dos planos forem preenchidos (por exemplo, `"Starter"` e `"Elite"`), a mensagem pré-preenchida no WhatsApp continuará dizendo `"Quero o Plano A"` enquanto o botão diz `"Quero o Plano Starter"`. O consultor que receber a mensagem não conseguirá identificar qual plano o lead escolheu.

A raiz do problema é que `planDeeplink` recebe um identificador arbitrário em vez do próprio `p.name`, quebrando a rastreabilidade do lead por plano.

**Fix:**

Em `site/lib/site.ts`, eliminar o argumento separado e passar `p.name` diretamente ao construir o objeto PLANS:

```ts
// Antes (site/lib/site.ts linha 43)
function planDeeplink(planName: string): string {
  return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent("Quero o Plano " + planName);
}

// PLANS (linhas 62-72) usava planDeeplink("A") e planDeeplink("B")

// Depois: remover planDeeplink; calcular inline com o nome real do plano
export const PLANS: ReadonlyArray<...> = [
  {
    name: "Starter", // nome real
    price: "Sob consulta",
    includes: [...],
    // deeplink usa p.name diretamente, garantindo coerência com o botão
    get whatsappUrl() {
      return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent("Quero o Plano " + this.name);
    },
  },
  ...
];
```

Alternativa mais simples sem getter: remover `planDeeplink` e calcular a URL no próprio componente Planos — onde `p.name` já está disponível — ou passar `p.name` para `planDeeplink` em vez de `"A"`/`"B"`.

---

### CR-02: `COMMUNITY_WHATSAPP_URL` é um link inválido de grupo hardcoded sem override via env var

**File:** `site/lib/site.ts:93-94`

**Issue:** `COMMUNITY_WHATSAPP_URL` está hardcoded como `"https://chat.whatsapp.com/PLACEHOLDER"`. Ao contrário de `WHATSAPP_URL` (linha 8-11), que aceita `NEXT_PUBLIC_WHATSAPP_URL` da variável de ambiente e só cai no placeholder se o env estiver vazio, `COMMUNITY_WHATSAPP_URL` não tem nenhum override via env. Isso significa que:

1. O link de convite de grupo não pode ser configurado sem editar o código-fonte — o que derruba o padrão de operação declarado no brand book (where "número real" deve ser preenchido antes do deploy).
2. Se o site for publicado antes de o código ser editado, o botão "Entrar na comunidade" levará visitantes a `https://chat.whatsapp.com/PLACEHOLDER` — uma URL pública que roteia qualquer pessoa para um destino inválido ou inesperado.

**Fix:**

```ts
// site/lib/site.ts — substituir a linha 93-94 por:
export const COMMUNITY_WHATSAPP_URL =
  process.env.NEXT_PUBLIC_COMMUNITY_WHATSAPP_URL ||
  "https://chat.whatsapp.com/PLACEHOLDER"; // grupo exclusivo — configurar antes do deploy

// site/.env.example — adicionar:
# Link de convite do grupo exclusivo de alunos Dino Team
NEXT_PUBLIC_COMMUNITY_WHATSAPP_URL=
```

---

## Warnings

### WR-01: `WA_NUMBER` dos deeplinks de plano não tem override via env var

**File:** `site/lib/site.ts:39`

**Issue:** `const WA_NUMBER = "0000000000"` é usado pelos deeplinks de plano (`planDeeplink`), mas ao contrário de `WHATSAPP_URL`, não lê de `NEXT_PUBLIC_WHATSAPP_URL` nem de nenhuma env var. Isso cria dois comportamentos divergentes: o CTA primário (Hero, CtaFinal) usa o número configurado em `NEXT_PUBLIC_WHATSAPP_URL`; os CTAs de plano (Planos) usam sempre `0000000000`. Se apenas `NEXT_PUBLIC_WHATSAPP_URL` for preenchido no deploy, os botões de plano continuarão apontando para o número fake.

**Fix:**

```ts
// site/lib/site.ts — substituir linhas 39-49 por:
function planDeeplink(planName: string): string {
  const base =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.split("?")[0] ||
    "https://wa.me/0000000000";
  return base + "?text=" + encodeURIComponent("Quero o Plano " + planName);
}
```

Ou simplesmente extrair o número de `NEXT_PUBLIC_WHATSAPP_URL` de forma consistente com o padrão já existente.

---

### WR-02: Chaves React baseadas em `name` com valor `"PLACEHOLDER"` causam colisão em `TESTIMONIALS`

**File:** `site/components/sections/Depoimentos.tsx:37` / `site/lib/site.ts:86-88`

**Issue:** `TESTIMONIALS` contém 3 registros com `name: "PLACEHOLDER"`. O componente Depoimentos usa `key={t.name}` (linha 37). Se algum registro futuro for publicado com `publishable: true` mas mantiver `name: "PLACEHOLDER"` (ou dois alunos reais tiverem o mesmo nome), o React emitirá aviso de chave duplicada e pode renderizar incorretamente. O filter de `publishable` protege hoje apenas porque todos são `false`, mas a lógica é frágil ao crescer.

**Fix:**

Adicionar um campo `id` ao tipo de TESTIMONIALS e usar como chave:

```ts
// site/lib/site.ts
export const TESTIMONIALS: ReadonlyArray<{
  id: string; // slug único, ex: "joao-silva-2025"
  name: string;
  ...
}> = [
  { id: "placeholder-1", name: "PLACEHOLDER", ... },
  { id: "placeholder-2", name: "PLACEHOLDER", ... },
  { id: "placeholder-3", name: "PLACEHOLDER", ... },
];

// site/components/sections/Depoimentos.tsx linha 37
<Reveal key={t.id} delay={0.08 * i}>
```

---

### WR-03: `COMMUNITY_BENEFITS` renderiza strings com prefixo `"PLACEHOLDER — "` visível ao usuário

**File:** `site/lib/site.ts:100-103` / `site/components/sections/Comunidade.tsx:36`

**Issue:** Cada item de `COMMUNITY_BENEFITS` começa com `"PLACEHOLDER — "` na string (ex: `"PLACEHOLDER — Não está sozinho no processo..."`). O componente renderiza o texto diretamente em `<li>`. Se a seção Comunidade for visível em staging ou se um visitante acessar o site antes de os textos reais serem preenchidos, verá `"PLACEHOLDER — Não está sozinho no processo"` na tela. Ao contrário de TESTIMONIALS (que usa `publishable: false` como gate), COMMUNITY_BENEFITS não tem nenhum mecanismo de ocultação — é renderizado incondicionalmente.

**Fix:**

Dois caminhos:

1. Adicionar um campo `ready: boolean` aos benefícios e filtrar antes de renderizar (espelha o padrão de TESTIMONIALS):

```ts
// site/lib/site.ts
export const COMMUNITY_BENEFITS: ReadonlyArray<{ text: string; ready: boolean }> = [
  { text: "Não está sozinho...", ready: false },
  ...
];

// site/components/sections/Comunidade.tsx
const visibleBenefits = COMMUNITY_BENEFITS.filter((b) => b.ready);
```

2. Manter strings simples mas sem o prefixo `"PLACEHOLDER — "` — usar strings vazias ou a copy definitiva diretamente.

---

## Info

### IN-01: `planDeeplink` é função não exportada mas poderia ser eliminada com refatoração

**File:** `site/lib/site.ts:43-50`

**Issue:** A função `planDeeplink` existe apenas para construir os URLs de PLANS. Com a correção de CR-01, ela pode ser eliminada e substituída por lógica inline ou por um getter dentro do objeto de plano. Manter uma função auxiliar privada apenas para dois usos é ruído.

**Fix:** Após resolver CR-01, avaliar se `planDeeplink` ainda tem razão de existir. Se não, remover.

---

### IN-02: `Depoimentos` renderiza grade com borda mesmo quando vazia

**File:** `site/components/sections/Depoimentos.tsx:35`

**Issue:** O `<div>` da grade (linha 35) tem `border border-line bg-line` e está sempre renderizado, mesmo quando `visible.length === 0`. Isso gera uma borda flutuante invisível mas presente no DOM — potencialmente capturando scroll ou espaço visual dependendo do tamanho da viewport. A intenção documentada no componente é que a grade apareça vazia intencionalmente, mas a borda externa permanece mesmo sem filhos.

**Fix:** Condicionar a renderização da grade:

```tsx
{visible.length > 0 && (
  <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
    {visible.map(...)}
  </div>
)}
```

---

_Reviewed: 2026-06-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

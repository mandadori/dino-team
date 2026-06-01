# Phase 2: Conversão Completa - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Adicionar 3 seções novas à landing page (Depoimentos, Comunidade, Planos) e substituir o placeholder do WhatsApp pelo link real — fechando o funil de conversão. O visitante vê preço, lê provas sociais nomeadas, entende a comunidade como parte do método e chega ao WhatsApp de verdade.

Entrega = CONV-01 (Planos com preço + deeplinks por plano) + CONV-02 (Depoimentos nomeados contexto→mudança→resultado) + CONV-03 (Comunidade grupo WhatsApp exclusivo de alunos) + CONF-01 (WhatsApp real).

**Sequência final da landing após esta fase:**
Hero → ParaQuemE → Metodo → Resultados → SobreRamon → **Depoimentos → Comunidade → Planos** → FAQ → CtaFinal

**Fora de escopo (outras fases):** LGPD/cookie consent (Fase 3); blog/SEO (Fase 4+); captura de e-mail (Fase 5); skill de artigo (Fase 6). Esta fase NÃO redesenha seções existentes; adiciona seções novas e ajusta o CtaFinal.

</domain>

<decisions>
## Implementation Decisions

### Ordem e posicionamento das seções

- **D-01:** Sequência das 3 novas seções: **Depoimentos → Comunidade → Planos** (inseridas antes do FAQ). Lógica: prova social prepara, comunidade reforça o suporte, preço fecha o argumento.
- **D-02:** Planos → FAQ → CtaFinal. O FAQ absorve objeções pós-preço; o CtaFinal encerra com força.
- **D-03:** As 7 seções existentes (Hero…SobreRamon, FAQ, CtaFinal) não mudam de posição nesta fase.
- **D-04:** O CtaFinal existente **vira reforço emocional** — a copy muda de "escolha um plano" para a mensagem de identidade da marca (ex: "Se você chegou até aqui, já sabe o que quer"). O CTA WhatsApp permanece, mas com copy distinta dos cards de Planos. Não é removido nem deixado intacto.

### Seção Planos (CONV-01)

- **D-05:** **2 planos** — layout de 2 cards. Decisão binária, fiel ao tom "marca de elite, não popular".
- **D-06:** Dados reais (nomes, preços, inclusos) **chegam via chat sob demanda**, como o acervo de fotos na Fase 1. O executor constrói a estrutura com **placeholders marcados** (comentados como `PLACEHOLDER` em `lib/site.ts`).
- **D-07:** CTA de WhatsApp por plano: **deeplink personalizado** (`wa.me/NUMBER?text=Quero+o+Plano+X`), não URL genérica. Permite que o aluno chegue ao chat com o interesse já declarado.
- **D-08:** Deeplinks ficam em constante `PLANS` (array de objetos) em `lib/site.ts`, cada objeto com nome, preços, inclusos e `whatsappUrl`. Placeholder até o número real chegar. Padrão coerente com `WHATSAPP_URL`, `STATS`, `TIMELINE` existentes.
- **D-09:** Cards sóbrios, sem badge "popular". Distinção visual entre os 2 planos delegada ao executor (borda, fundo `surface` vs `bg`, ou dimensão) — respeitando monocromático estrito.

### Seção Depoimentos (CONV-02)

- **D-10:** **3 depoimentos** no layout. Número mínimo crível, layout equilibrado.
- **D-11:** Estrutura de cada depoimento: `{ name, context, change, result, photo?, publishable }`. O campo `publishable: true/false` é o gate editorial — o componente só renderiza itens com `publishable: true`. Placeholders ficam com `publishable: false` e nunca aparecem no site.
- **D-12:** Foto P&B do aluno é **opcional** — card funciona com avatar placeholder monocromático. Quando a foto real chegar, substitui trivialmente.
- **D-13:** Layout: **grade 3 colunas desktop / empilhado mobile**. Sem carrossel, sem dependência extra. Limpo e fiel ao tom anti-espetáculo.

### Seção Comunidade (CONV-03)

- **D-14:** A Comunidade Dino Team é um **grupo fechado de WhatsApp exclusivo para alunos**. O CTA leva a um link de convite do grupo (não ao número de suporte dos Planos).
- **D-15:** Composição da seção: título + **3–4 benefícios textuais** enquadrando a comunidade como parte do método + CTA para o grupo. Sem gamificação, sem contador de membros, sem quote de membro.
- **D-16:** Textos dos benefícios: **placeholders marcados** (mesmo padrão dos Planos). Constante `COMMUNITY_BENEFITS` em `lib/site.ts`.
- **D-17:** Link do grupo WhatsApp: constante `COMMUNITY_WHATSAPP_URL` em `lib/site.ts` (separada de `WHATSAPP_URL` de suporte). Placeholder até o link real chegar.

### WhatsApp real (CONF-01)

- **D-18:** Após esta fase, existem **3 constantes distintas de WhatsApp** em `lib/site.ts`:
  1. `WHATSAPP_URL` — suporte geral (env `NEXT_PUBLIC_WHATSAPP_URL`, já existia)
  2. `COMMUNITY_WHATSAPP_URL` — link de convite do grupo de alunos (novo, placeholder)
  3. `whatsappUrl` por plano dentro do array `PLANS` — deeplinks individuais (novo, placeholder)
- **D-19:** O número/links reais chegam via chat, como os demais dados de conteúdo. Nenhuma env var nova é obrigatória para o build funcionar com placeholders.

### Claude's Discretion

- **Distinção visual dos 2 cards de Planos** — executor decide entre borda mais grossa, fundo `surface` vs `bg`, ou diferença de dimensão; respeitando monocromático estrito e sem badge "popular".
- **Copy do CtaFinal reformulado** — executor escreve a nova copy de reforço emocional respeitando o tom de marca (brand book + tom-de-voz). Não há diretriz específica de copy do usuário para este bloco.
- **Animações das 3 novas seções** — seguem o padrão da Fase 1 (D-08 da Fase 1): entradas Reveal + microinterações mínimas. Nenhuma novidade de animação nesta fase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Marca (lei de identidade — monocromático estrito, tom sóbrio)
- `brand/brand-book.md` — essência, mensagens centrais, o que a marca não é
- `brand/tom-de-voz.md` — sobriedade, anti-espetáculo; informa o copy do CtaFinal e os textos das seções novas
- `brand/publico-alvo.md` — quem é o leitor; calibra o copy de Depoimentos e Comunidade
- `brand/referencias-visuais.md` — paleta P&B, tipografia (Anton + Montserrat); base dos tokens

### Requisitos desta fase
- `.planning/REQUIREMENTS.md` §"Seções de Conversão" (CONV-01, CONV-02, CONV-03) e §"Configuração de Conversão" (CONF-01) — contrato de aceite

### Contexto da Fase 1 (decisões que carregam adiante)
- `.planning/phases/01-landing-editorial-funda-o/01-CONTEXT.md` — padrões de animação (D-08, D-09), base preta (D-01), tipografia contida (D-02), client islands (DSGN-05)

### Mapas do código existente
- `.planning/codebase/STRUCTURE.md` — onde adicionar seções (`components/sections/`), como registrar em `app/page.tsx`, onde ficam constantes (`lib/site.ts`)
- `.planning/codebase/CONVENTIONS.md` — padrões de nomenclatura, tokens Tailwind (`bg-surface`, `text-fg`…), `cn()`, RSC vs client islands

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/components/Reveal.tsx` — wrapper de animação de entrada (fade+sobe). Aplicar nas 3 novas seções como em todas as outras.
- `site/components/ui/CTAButton.tsx` — botão CTA existente (primary + outline). Usar nos cards de Planos e CTA da Comunidade.
- `site/lib/site.ts` — onde ficam `WHATSAPP_URL`, `STATS`, `TIMELINE`, `FAQS`. Adicionar `PLANS`, `COMMUNITY_BENEFITS`, `COMMUNITY_WHATSAPP_URL` neste mesmo arquivo.
- `site/app/globals.css` — tokens `bg-surface` (fundo elevado), `bg-bg` (fundo principal), `border-line` (bordas). Distinção entre cards de Planos pode usar `bg-surface` vs `bg-bg`.

### Established Patterns
- Seções como RSC em `components/sections/` — as 3 novas seções seguem o mesmo padrão (sem `"use client"` na seção; client islands isolados em `components/motion/` se necessário).
- Dados de conteúdo co-localizados em `lib/site.ts` (módulo-nível, `ReadonlyArray<T>`) — `PLANS`, `COMMUNITY_BENEFITS`, `TESTIMONIALS` seguem o mesmo padrão de `FAQS`, `STATS`.
- Monocromático estrito — nunca hex hardcoded; sempre tokens. `bg-bg`, `text-fg`, `text-muted`, `bg-surface`, `border-line`, `font-display`, `font-body`.

### Integration Points
- `site/app/page.tsx` — registrar as 3 novas seções na ordem D-01: após `<SobreRamon />`, antes de `<FAQ />`.
- `site/components/sections/CtaFinal.tsx` — editar copy para reforço emocional (D-04); CTA WhatsApp permanece.
- `site/lib/site.ts` — adicionar `PLANS`, `COMMUNITY_BENEFITS`, `COMMUNITY_WHATSAPP_URL`.

</code_context>

<specifics>
## Specific Ideas

- A regra "sem nome real, não publica" é implementada via campo `publishable: boolean` no objeto de depoimento (D-11), não como comentário de código nem validação de build — simples e auditável em `lib/site.ts`.
- A Comunidade é um grupo **exclusivo para alunos** — o copy deve reforçar a exclusividade do acesso (entra quem contrata), não convidar qualquer visitante.
- Os deeplinks de Plano usam o padrão `wa.me/NUMBER?text=Mensagem` — o número `NUMBER` será o mesmo de `NEXT_PUBLIC_WHATSAPP_URL` quando o número real chegar; o texto difere por plano.

</specifics>

<deferred>
## Deferred Ideas

- **COMMUNITY_WHATSAPP_URL como env var** — se no futuro o link de grupo mudar com frequência, pode virar `NEXT_PUBLIC_COMMUNITY_URL`. Hoje fica hardcoded placeholder em `lib/site.ts`.
- **Quote de membro da Comunidade** — levantado na discussão, descartado para manter a seção simples nesta fase. Poderia entrar em iteração futura se houver conteúdo real.
- **Carrossel de depoimentos** — descartado em favor de grade fixa. Considerar quando houver mais de 3 depoimentos publicáveis.
- **Contador de membros da comunidade (CONV-04)** — v2, só com número real e relevante.

</deferred>

---

*Phase: 2-Conversão Completa*
*Context gathered: 2026-06-01*

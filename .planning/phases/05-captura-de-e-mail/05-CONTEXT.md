# Phase 5: Captura de E-mail - Context

**Gathered:** 2026-06-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Um form de captura de e-mail **inline, sóbrio e acessível** que inscreve o visitante numa lista do Resend, gateado por um checkbox de consentimento LGPD explícito, com estados de sucesso/erro acessíveis (WCAG AA, anunciados a leitor de tela).

Entrega = **LEAD-01** (form de e-mail inline via Server Action → Resend, com checkbox de consentimento LGPD, monocromático) + **LEAD-02** (estado de sucesso/erro acessível, client island mínimo).

**Fora de escopo:** lead magnet / "guia de direção" (LEAD-03, v2), cadência editorial de newsletter (NEWS-01, v2), pop-up / exit-intent / timer (proibidos pela marca), form na landing/home, double opt-in (descartado nesta fase — ver Deferred).

</domain>

<decisions>
## Implementation Decisions

### Integração Resend (LEAD-01)

- **D-01:** Modelo = **Resend Audiences/Contacts API** — o e-mail é adicionado como contato a uma audience (lista real, nutrível depois). **Não** é envio transacional avulso.
- **D-02:** **Single opt-in** — sem e-mail de confirmação e sem rota de verificação. O consentimento explícito do checkbox é a base legal LGPD; o contato entra na lista direto no envio do form.
- **D-03:** O mecanismo é um **Server Action** (`"use server"`), conforme LEAD-01 — não um Route Handler. O Server Action lê `process.env.RESEND_API_KEY` e `process.env.RESEND_AUDIENCE_ID` **server-only** (NÃO `NEXT_PUBLIC_*`, são segredos) e chama o Resend.
- **D-04:** **Env-gated, sem conta ainda.** O usuário ainda não tem conta Resend. Construir tudo de forma que `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` vazios **não bloqueiem o build** (ver D-12). `.env.example` ganha as duas chaves vazias e documentadas, no mesmo padrão de `NEXT_PUBLIC_WHATSAPP_URL`/`NEXT_PUBLIC_SITE_URL`. **Blocker de deploy declarado:** o usuário cria a audience e preenche as chaves antes do deploy real.

### Posicionamento (LEAD-01)

- **D-05:** **Componente compartilhado** (ex.: `components/blog/NewsletterForm.tsx`), renderizado em dois lugares: (a) em `/blog/[slug]`, **depois** da seção CTA de WhatsApp — é o **último bloco** do artigo; (b) no **final da listagem `/blog`**.
- **D-06:** O form **não substitui nem compete** com o CTA de WhatsApp ("Quero minha direção"). É uma seção própria, sóbria, abaixo dele no artigo. O WhatsApp continua sendo a conversão primária (bottom-funnel); o e-mail é o degrau suave (top-funnel).

### Consentimento & validação (LEAD-01, LEAD-02)

- **D-07:** Checkbox de consentimento LGPD **desmarcado por padrão** (opt-in explícito), com **link inline para `/privacidade`**. É consentimento de **processamento de dados a nível de form** — **distinto** do consentimento de cookies do `ConsentProvider`/`useConsent` (Fase 3). **Não** reutiliza `useConsent`; é estado local do form.
- **D-08:** Botão de envio **sempre ativo**. Enviar sem o checkbox marcado → **erro acessível inline** (aria-live, foco movido pro checkbox). O e-mail **nunca** é enviado sem o consentimento (revalidado no servidor — critério de sucesso 3).
- **D-09:** Validação de e-mail = **HTML5 nativo** (`type="email"` + `required`) no cliente **+ revalidação no Server Action** antes de chamar o Resend. Sem lib de validação extra.

### Estados de sucesso/erro (LEAD-02)

- **D-10:** **Sucesso = o form é substituído** por uma mensagem de confirmação sucinta no mesmo espaço, anunciada via **aria-live** e com **foco movido** pra ela. Não deixa campos órfãos na tela.
- **D-11:** **E-mail já inscrito** (Resend retorna contato existente) = **tratado como sucesso** (mesma mensagem). Não revela se o e-mail já existia (privacidade) e não gera atrito.
- **D-12:** **Sem `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` configurados, a seção do form não renderiza** (em vez de mostrar um form que sempre falha em preview). Reaparece assim que a env é preenchida; build/CI passam limpos.
- **D-13:** Acessibilidade (LEAD-02): erros e sucesso via **aria-live**, **foco gerenciado**, **foco visível** (anel de foco do design system), contraste **WCAG AA**, **client island mínimo** (`"use client"` só no componente do form; a seção que o monta pode ser RSC).

### Claude's Discretion

- **Copy/tom exato** (heading, subtexto, label do checkbox, texto do botão, mensagens de sucesso/erro) — executor escreve seguindo `brand/tom-de-voz.md` (sereno, anti-espetáculo; sem "não perca", sem urgência fabricada, sem clichê de privacidade).
- **Anti-spam do endpoint público** — honeypot e/ou rate-limit básico no Server Action, à discrição do executor (o gate de threat model do `plan-phase` também cobre). **Sem CAPTCHA de terceiro** (injeta script/UI externa, viola o monocromático estrito).
- **Estrutura técnica do estado do form** — `useActionState`/`useFormStatus` (React 19 / Next 16) vs `useState`; executor escolhe o padrão mais limpo para o estado pending/success/error.
- **Nomes exatos** do componente do form e do arquivo do Server Action.
- **Design visual do bloco** (espaçamento, borda, estilo do input/checkbox) — definido no UI-SPEC (`/gsd-ui-phase 5`) e ancorado em `brand/referencias-visuais.md`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos desta fase
- `.planning/REQUIREMENTS.md` §"Captura de Lead" (LEAD-01, LEAD-02) — contrato de aceite; LEAD-03 e NEWS-01 estão explicitamente em v2/deferred.

### Marca (identidade visual e tom — copy e design do form)
- `brand/tom-de-voz.md` — sobriedade, anti-espetáculo; toda a copy do form (heading, label, sucesso/erro) segue isto.
- `brand/brand-book.md` — essência e "o que a marca não é"; informa o enquadramento da captura (direção, não isca/urgência).
- `brand/referencias-visuais.md` — paleta P&B estrita, tipografia Anton/Montserrat; base do design do bloco e do input.

### Consentimento herdado (Fase 3 — base do padrão LGPD)
- `.planning/phases/03-conformidade-legal-lgpd/03-CONTEXT.md` — padrão de consentimento explícito, copy sóbria, link `/privacidade`. **Atenção:** o `ConsentProvider`/`useConsent` ali gateia **cookies/tracking**, não este form — o checkbox desta fase é consentimento de processamento de dados separado (D-07).

### Código existente (leitura obrigatória antes de implementar)
- `site/app/blog/[slug]/page.tsx` — rodapé do artigo (`AuthorBlock → ShareBar → RelatedPosts → seção CTA WhatsApp`); o form entra **depois** do CTA (D-05). A seção CTA final é o **padrão visual de referência** do bloco do form (`border-t border-line`, centralizado, monocromático).
- `site/app/blog/page.tsx` — listagem; o form entra no final dela (D-05).
- `site/components/ConsentProvider.tsx` — entender por que **não** se reutiliza aqui (cookie consent ≠ consentimento do form).
- `site/components/ui/CTAButton.tsx` — referência/uso para o botão de envio (estilo primário do design system).
- `site/components/blog/AuthorBlock.tsx`, `site/components/blog/ShareBar.tsx`, `site/components/blog/RelatedPosts.tsx` — componentes irmãos no rodapé do artigo; padrão de um componente de blog (RSC vs client island).
- `site/lib/site.ts` — padrão de constantes centralizadas (`WHATSAPP_URL`, `COOKIE_CONSENT_KEY`/`COOKIE_CONSENT_TTL_MS`). Constantes não-secretas do form podem morar aqui; **segredos do Resend ficam em `process.env`**, não aqui.
- `site/app/api/skills/dispatch/route.ts` — referência de acesso a env server-side (mesmo sendo Route Handler; o form usa Server Action).
- `site/.env.example` — adicionar `RESEND_API_KEY=` e `RESEND_AUDIENCE_ID=` vazios e documentados (D-04).

### Integração nova (a pesquisar)
- **Resend Contacts/Audiences API** — `resend` npm SDK; método de criar contato numa audience (single opt-in). Ainda **não instalado** no `site/package.json`. O researcher deve confirmar a chamada exata, o shape de resposta de "contato já existente" (D-11) e o padrão de Server Action + Resend no Next 16/App Router.

### Mapas do código
- `.planning/codebase/STRUCTURE.md` — onde ficam componentes de blog, server actions, onde adicionar.
- `.planning/codebase/CONVENTIONS.md` — RSC vs client island, tokens Tailwind, nomenclatura.
- `.planning/codebase/INTEGRATIONS.md` — Resend será uma nova integração externa; registrar o padrão.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/components/ui/CTAButton.tsx` — único primitivo de UI; usar/estender para o botão de envio. **Não existe `Input` nem componente de form** ainda — o campo de e-mail + checkbox serão novos.
- Padrão visual da seção CTA final em `site/app/blog/[slug]/page.tsx` (`<section className="mt-16 border-t border-line pt-12 text-center">`) — molde direto para o bloco do form (monocromático, espaçado, bordado).
- `site/lib/site.ts` — padrão de constantes (`WHATSAPP_URL`, chaves de consentimento). Reusar para constantes não-secretas do form.

### Established Patterns
- **RSC por padrão, client island só onde há estado.** O form tem estado (input, checkbox, pending/success/error) → `"use client"`; a seção que o monta no artigo/listagem pode ser RSC.
- **Server Action (`"use server"`)** é o caminho da fase (LEAD-01) — não Route Handler.
- **Env documentado-e-vazio = degradação graciosa** (padrão `WHATSAPP_URL`/`SITE_URL`). Aqui: chaves Resend vazias ⇒ seção do form **não renderiza** (D-12).
- **Foco gerenciado + aria-live** é o padrão acessível esperado (consistente com o rigor de a11y/reduced-motion das fases 1 e 3).

### Integration Points
- `site/app/blog/[slug]/page.tsx`: montar `<NewsletterForm>` **depois** da `<section>` do CTA de WhatsApp.
- `site/app/blog/page.tsx`: montar `<NewsletterForm>` no final da listagem.
- Server Action novo (em `site/app/.../actions.ts` ou colocado conforme convenção do projeto) lê `process.env.RESEND_*` e chama o SDK `resend`.
- `site/.env.example`: novas chaves `RESEND_API_KEY` + `RESEND_AUDIENCE_ID`.

</code_context>

<specifics>
## Specific Ideas

- O bloco do form herda a linguagem visual da seção CTA do artigo (`border-t border-line`, espaçamento generoso, centralizado, P&B estrito). É calmo — não grita "INSCREVA-SE".
- O e-mail é a conversão **suave**; o WhatsApp permanece a conversão **forte**. Os dois coexistem no fim do artigo sem competir (D-06).
- Checkbox desmarcado, com link para `/privacidade` no próprio label — herda a postura LGPD explícita da Fase 3.

</specifics>

<deferred>
## Deferred Ideas

- **LEAD-03 — lead magnet contextual ("guia de direção")** — v2; esta fase é captura genérica de e-mail, sem isca.
- **NEWS-01 — newsletter com cadência editorial** — v2; esta fase só **captura** o e-mail, não define envio/cadência.
- **Double opt-in** (e-mail de confirmação + rota `/confirmar` + estado pendente) — considerado e descartado em favor de single opt-in nesta fase. Revisitar só se deliverability exigir.
- **Form na landing/home** — fora de escopo; a captura é pós-conteúdo do blog (público de topo de funil vindo orgânico).

</deferred>

---

*Phase: 05-captura-de-e-mail*
*Context gathered: 2026-06-12*

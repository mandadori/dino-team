---
name: novo-site
description: Cria o site Dino Team do zero, ou aplica alterações no site existente. Skill dual-mode — detecta o modo checando se site/package.json existe. Modo criação orquestra scaffold + briefing + implementação das seções + validação + gate de brand + preview deploy. Modo alteração recebe descrição livre da mudança (texto, layout, componente, integração) e aciona os agentes pertinentes.
---

# /novo-site — Dino Team

## Objetivo

Criar o site institucional + comercial da Dino Team, ou aplicar alterações nele depois de existir. Modo é detectado automaticamente.

## Sintaxe

```
/novo-site [descrição livre da alteração — só usado em modo alteração]
```

- **Sem argumento + site não existe** → modo criação completo.
- **Com argumento + site existe** → modo alteração.
- **Sem argumento + site existe** → pergunta o que alterar.
- **Com argumento + site não existe** → entra em modo criação ignorando argumento e avisa que será aplicado depois.

## Detecção de modo

A skill checa `site/package.json`:
- **Não existe** → modo **criação**.
- **Existe** → modo **alteração**.

## Agentes

| Agente | Quando | Input | Output | Origem |
|---|---|---|---|---|
| `arquiteto-web` | Criação (Passo 2) + alteração estrutural | spec, fase, restrições | scaffold + configs | Engenharia/Execução/Web |
| `designer-web` | Criação (Passo 4) + alteração visual | briefing, arquivo destino | componente React | Engenharia/Execução/Web |
| `dev-frontend` | Criação (Passo 5) + alteração de integração/lógica | componentes, página destino | integração no app | Engenharia/Execução/Web |
| `curador-web` | Criação (Passo 6) + qualquer alteração antes de finalizar | pasta `site/` + critérios | relatório técnico ou preview URL | Engenharia/Revisão |
| ⚙ briefing inline | Criação (Passo 3) + qualquer alteração editorial | spec, brand book, dados/ramon/, objetivo da página | `site/docs/home-briefing.md` | skill escreve diretamente |
| `revisor-brand` | Gate pré-deploy (Passo 7.5) + qualquer alteração que toque copy/identidade | componentes + globals + briefing | APROVADO/REPROVADO (binário) | Transversais/Brand (externo) |

## Fluxo — modo criação

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ validar spec+brand | spec, brand | — | validado |
| 2 | arquiteto-web | spec ← 1 | 1 | scaffold (manifesto) |
| 3 | ⚙ briefing inline | spec, objetivo | 2 | `site/docs/home-briefing.md` |
| 4 | designer-web | briefing ← 3 | 3 | 7 seções (manifesto) |
| 5 | dev-frontend | seções ← 4 | 4 | home integrada |
| 6 | curador-web | — | 5 | `<validacao>` |
| 7 | ⏸ usuário | preview | 6 | ok/ajuste |
| 7.5 | revisor-brand (bloqueante) | seções ← 5 | 7 | parecer binário |
| 8 | ⚙ deploy preview (vercel) | — | 7.5 | URL |
| 9 | ⚙ confirmar | — | 8 | confirmação |

## Fluxo — modo alteração

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ estado atual | descrição da mudança | — | contexto |
| 2 | ⚙ classificar alteração | — | 1 | tipo de mudança |
| 3 | agente(s) pertinente(s) | escopo ← 2 | 2 | mudança aplicada |
| 4 | curador-web | — | 3 | `<validacao>` |
| 5 | revisor-brand (se tocou copy/identidade) | — | 4 | parecer binário |
| 6 | ⏸ usuário | preview | 5 | confirmação |
| 7 | ⚙ commit | — | 6 | commitado |

---

## Pipeline — modo CRIAÇÃO

### 1. Validar spec e brand book

Verifique:
- `docs/specs/2026-05-19-site-dino-team-design.md` (ou spec mais recente do site) existe.
- `brand/referencias-visuais.md` está preenchido.

Se brand vazio, devolva `BRAND_BOOK_INCOMPLETO — rodar /brand-discovery antes`.
Se spec ausente, devolva `SPEC_AUSENTE — esperado em docs/specs/`.

### 2. Acionar arquiteto-web — scaffold

[Agente: `arquiteto-web`] → input:

```
Tarefa: Scaffold inicial do site em site/ conforme spec docs/specs/2026-05-19-site-dino-team-design.md, Fase 1 (MVP).
Restrições: Next.js 15 + Tailwind 4 + shadcn/ui + Framer Motion + Lucide + MDX. Não instalar libs de auth ou banco (fase 3+).
Saída: site/ com package.json, tsconfig.json, next.config.ts, postcss.config.mjs, tailwind.config.ts (tokens do brand), components.json (shadcn), app/layout.tsx, app/globals.css, app/page.tsx (placeholder), components/TrackingScripts.tsx (placeholder), lib/utils.ts, .gitignore, .env.example.
```

Aguarde retorno com a lista de arquivos criados.

### 3. Escrever briefing da home (inline)

A própria skill produz `site/docs/home-briefing.md` seguindo `templates/briefing.md`.

Inputs a ler:
- `docs/specs/2026-05-19-site-dino-team-design.md` — descreve as 7 seções e o tom esperado.
- `brand/brand-book.md`, `brand/tom-de-voz.md`, `brand/publico-alvo.md`, `brand/referencias-visuais.md` — identidade da marca.
- `dados/ramon/contexto.md` — fase atual + conquistas + falas do Ramon (para ângulo/contexto biográfico).

Estrutura do briefing a produzir em `site/docs/home-briefing.md`:
- Objetivo único da página, persona alvo, tom, ângulo central da home (porta de entrada da marca), pilar dominante.
- Por seção (Hero, Para quem é, Método, Resultados, Sobre Ramon, FAQ, CTA final): propósito, copy sugerido, elementos visuais esperados, CTA (se houver).
- Referências visuais: stndrd.app, joinladder.com, brightscout.com. Estilo: minimalista premium escuro, alto contraste, animações ricas.

Escreva o arquivo e mostre ao usuário. Aguarde aprovação explícita antes de seguir para o Passo 4.

### 4. Acionar designer-web — implementar as 7 seções

Pra cada seção (Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal), execute:

[Agente: `designer-web`] → input:

```
Tarefa: Implementar componente <NomeSecao> em site/components/sections/<NomeSecao>.tsx baseado no briefing em site/docs/home-briefing.md (seção <NomeSecao>).
Restrições: mobile-first, Tailwind, Framer Motion pra animações em scroll, shadcn/ui antes de custom. Acessibilidade WCAG AA.
```

Pode rodar em paralelo as seções que não dependem entre si (todas, neste caso).

### 5. Acionar dev-frontend — integrar seções na home

[Agente: `dev-frontend`] → input:

```
Tarefa: Atualizar site/app/page.tsx pra importar e renderizar as 7 seções na ordem: Hero, ParaQuemE, Metodo, Resultados, SobreRamon, FAQ, CtaFinal.
Saída: app/page.tsx atualizado.
```

### 6. Acionar curador-web — validação técnica

[Agente: `curador-web`] → input:

```
Tarefa: Validar build, lint, types, Lighthouse local da home.
Pasta: site/
Comandos: cd site && npm run typecheck && npm run lint && npm run build && npx lighthouse http://localhost:3000 --quiet --chrome-flags="--headless"
Critério: Lighthouse > 90 em Performance, A11y, Best Practices, SEO.
```

Se algum critério falhar, devolva ao agente apropriado pra corrigir e re-rode o curador.

### 7. Preview ao usuário

Mostre ao usuário:

```
Site pronto pra revisão.
Rodar local: cd site && npm run dev → http://localhost:3000
Revise seção por seção e responda "confirmar" ou descreva ajustes.
```

Se houver ajuste, entre em modo alteração com a descrição. Repita até confirmação.

### 7.5. Gate de brand — validar com revisor-brand (bloqueante)

Antes de qualquer deploy, o site inteiro passa por validação de identidade. **Sem APROVADO, não há deploy.**

[Agente: `revisor-brand`] → input:

```
Tarefa: validar o site Dino Team contra o brand book antes do primeiro deploy.
Inputs:
- Componentes: site/app/page.tsx + todos os arquivos em site/components/sections/.
- Estilos: site/app/globals.css, site/tailwind.config.ts.
- Briefing institucional: site/docs/home-briefing.md.
- Spec original do site: docs/specs/2026-05-19-site-dino-team-design.md.
Avalie: tom de voz nas copies das seções; paleta e tipografia contra brand/referencias-visuais.md; pilares respeitados; mood/identidade visual consistente entre seções.
Decisão binária: APROVADO ou REPROVADO.
```

- **APROVADO** → seguir para o Passo 8 (deploy).
- **REPROVADO** → reabrir a seção apontada (copy via `dev-frontend`; cor/tipografia via `designer-web`), re-rodar este gate. Repetir até APROVADO.

### 8. Deploy preview no Vercel

Após APROVADO do `revisor-brand` e confirmação do usuário:

[Agente: `curador-web`] → input:

```
Tarefa: Executar preview deploy no Vercel.
Comando: cd site && npx vercel --yes
Saída: URL do preview.
```

### 9. Confirmar ao usuário

```
Site no ar (preview): <URL>
Domínio próprio: configure quando quiser (spec seção 7.2).
Próximas skills: /nova-pagina ou /post-blog (criadas quando precisar).
```

---

## Pipeline — modo ALTERAÇÃO

### 1. Mostrar estado atual

Liste páginas existentes em `site/app/` e componentes em `site/components/`. Se o usuário não passou argumento, pergunte o que alterar.

### 2. Classificar a alteração

Triagem rápida baseada na descrição:
- **Estrutural** (nova pasta, lib nova, reorganização) → `arquiteto-web`.
- **Visual** (estilo, layout, animação) → `designer-web`.
- **Lógica/integração** (estado, formulário, navegação) → `dev-frontend`.
- **Editorial** (copy, microcopy, CTA) → editado inline pela skill (copy + ângulo), com gate `revisor-brand` se mudar narrativa/ângulo.
- **Combinação** → rodar agentes em sequência.

### 3. Acionar agente(s) pertinente(s)

Pra cada agente, monte input com:
- Tarefa: a descrição do usuário traduzida pro contrato do agente.
- Arquivos envolvidos: caminhos exatos identificados na triagem.
- Critério de aceitação inline.

### 4. Validar com curador-web

[Agente: `curador-web`] → mesma chamada do Passo 6 do modo criação, escopada à mudança.

### 5. Gate de brand (se a mudança tocou copy/identidade)

Se a alteração mexeu em copy, cor, tipografia ou narrativa, re-rode o gate `revisor-brand` (Passo 7.5) escopado à mudança antes de publicar.

### 6. Preview ao usuário + confirmação

Mostre local URL ou preview deploy URL. Aguarde "confirmar" ou novo ajuste.

### 7. Commit

Após confirmação, commit com mensagem descritiva da alteração.

---

## Critério de conclusão (modo criação)

- 4 agentes web existem em `.claude/agents/`.
- `site/` scaffolded com Next.js + libs declaradas.
- 7 seções da home implementadas e importadas em `app/page.tsx`.
- `curador-web` retornou OK em build, types, lint, Lighthouse > 90.
- `revisor-brand` APROVADO no gate pré-deploy.
- Preview deploy no Vercel funcionando.
- Usuário confirmou explicitamente o visual.

## Quando devolver erro

- `BRAND_BOOK_INCOMPLETO` — `brand/referencias-visuais.md` vazio.
- `SPEC_AUSENTE — <caminho>` — spec do site não existe.
- `AGENTE_AUSENTE — <nome>` — um dos 4 agentes web não existe (rodar Tasks 1–4 antes).
- `VALIDACAO_FALHOU — <ponto>` — curador-web reportou erro que upstream precisa corrigir.
- `BRAND_REPROVADO — <ponto>` — revisor-brand reprovou no gate pré-deploy; corrigir antes de deploy.

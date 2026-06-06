# Loop de atualização do branding durante a criação de posts

> Spec de design — 2026-05-27
> Estrutura: **captura híbrida** (prompt explícito ⋁ detecção de diff no Claude Design) → **confirmação de intenção + escopo** → **promoção para a fonte canônica** → **propagação por escopo**.
> Este é o **Spec B**. Depende do **Spec A** (reescrita do schema): as fontes canônicas de promoção (`referencias-visuais.md`, `social-media.md`, `estilo.md` por delta) precisam existir antes.

---

## Motivação

Pergunta de origem do brainstorming: *"o fluxo de criação de posts se auto-aprimora em algum aspecto — design, identidade visual?"* Resposta atual: quase nada. O único loop ativo é `angulos-queimados.md` (rotação editorial). O design é estático — os ajustes que o usuário faz na revisão do preview (passo 9 do `/novo-post`) são efêmeros: aplicados naquele post e esquecidos. Um princípio visual descoberto na prática nunca volta para a documentação.

Consequência: a prática de design evolui além do que o brand book registra. O `designer` reinterpreta posicionamento a cada post novo porque o spec canônico não capturou o que já foi decidido na prática.

Este loop transforma ajuste durável em memória canônica: quando o usuário ajusta o visual e esse ajuste é uma decisão **durável** (não retoque pontual), ele é promovido para a fonte certa por escopo. Com o tempo, os ajustes rareiam — as fontes canônicas convergem.

---

## Princípio central

> Ajuste durável vira regra canônica; retoque pontual não. A distinção entre os dois **nunca é inferida automaticamente** — depende da intenção do usuário.

Um diff de CSS revela *o que* mudou, jamais *por que*. "Título 90px → 110px" pode ser retoque (título longo demais neste post) ou princípio (títulos devem ser maiores em todos os estilos). Por isso toda promoção passa por confirmação de **intenção + escopo**. Promover sem confirmar = drift silencioso, exatamente o que o sistema combate.

---

## 1. Onde o loop vive

No **passo 9 do `/novo-post`** (revisão do preview). É o ponto onde o usuário já interage com o visual — aprovando, anexando `preview.html` editado, ou pedindo ajustes. O loop é um **gate adicional** após a aprovação do design, antes de seguir para a curadoria.

Não toca os outros passos. Não cria agente novo no caminho crítico de produção — a promoção é uma escrita em arquivo canônico, gated.

---

## 2. Captura híbrida — duas entradas

```
                       ┌─ (a) prompt explícito do usuário ──────────────┐
                       │                                                │
                       │   ("daqui pra frente o swipe-cue é só a seta") │
                       ▼                                                ▼
  passo 9: design aprovado ──► CANDIDATO ──► confirmação (intenção + escopo) ──► promoção
                       ▲
                       │
   (b) diff: preview.html editado no Claude Design  vs  preview.html original
       agente detecta a mudança mecânica e propõe como candidato
```

### 2.1 Entrada (a) — prompt explícito

O usuário descreve o princípio em linguagem livre. Entra direto como candidato com intenção já declarada (é durável por definição — o usuário pediu). Resta confirmar o **escopo**.

### 2.2 Entrada (b) — detecção de diff no Claude Design

Quando o usuário anexa um `preview.html` editado (fluxo já existente no passo 9), o agente compara com o original e extrai a mudança mecânica:

- `título: font-size 90px → 110px`
- `logo: top-left → top-center`
- `overlay: opacidade 0.6 → 0.4`

A detecção é **confiável para o "o quê"**, **incapaz para o "por quê"**. Por isso ela só **propõe** — nunca promove sozinha:

```
Notei estas mudanças no preview que você editou:
- título aumentou (90 → 110px)
- logo centralizou (topo-esq → topo-centro)

Quer que alguma vire princípio durável? (responda quais + o escopo, ou "nenhuma — foi só pra este post")
```

---

## 3. Confirmação de escopo → fonte de promoção

O escopo decide o alvo canônico. Travado pela arquitetura do Spec A:

| Escopo confirmado | Alvo canônico | Alcance |
|---|---|---|
| Token universal ("logo sempre maior") | `brand/referencias-visuais.md` | todos os estilos (todos leem) |
| Refino de chrome ("swipe-cue só seta") | entrada do chrome em `brand/social-media.md` | estilos que **usam** aquele chrome (declaram o slot) |
| Específico do estilo ("neste estilo o título centraliza") | o `estilo.md` daquele estilo | só aquele estilo |
| Pontual ("só pra este post") | **nada** — fica no `preview.html` do post | só este post |

A promoção é uma edição cirúrgica no arquivo-alvo (a entrada/campo específico), não reescrita. Owner do arquivo continua respeitado (brand é editado sob confirmação; `estilo.md` idem).

---

## 4. Modo dual: local vs. cron

| Modo | Captura | Promoção |
|---|---|---|
| **Local** (interativo) | prompt explícito **e** detecção de diff | **propõe e aguarda confirmação** do usuário |
| **Cron** (autônomo, sem humano) | só prompt explícito (não há edição manual no Claude Design pra diferenciar) | aplica direto (o prompt já é a confirmação) |

Coerente com a decisão do brainstorming: *"sistema no automático = salva sozinho; sistema local = apresenta ao usuário"*. Com o tempo, os ajustes rareiam porque o padrão se consolida.

---

## 5. Propagação por escopo (o "quando")

Pegadinha de arquitetura: os assets são **standalone** — todo CSS é inlined no momento da exportação pro PNG. **Não há herança em tempo de render.** A herança só acontece em tempo de **geração**, quando o `designer` lê as fontes canônicas pra produzir o `slide.html`/assets.

Consequência:

- **Posts novos** (qualquer estilo) → herdam o valor atualizado **automaticamente**, porque o `designer` lê a fonte canônica fresca a cada produção.
- **`slide.html` de estilos existentes** → **não** mudam sozinhos. Estão congelados na implementação antiga.

Duas políticas para estilos existentes:

- **Lazy (default).** Só posts futuros pegam a mudança. Estilos existentes ficam como estão até serem usados/re-derivados de novo. Sem surpresa, sem revisão não-solicitada.
- **Eager (gatilho explícito).** Um passo "re-derivar estilos" regenera os `slide.html` dos estilos afetados a partir dos specs atualizados — mesmo gate local/cron. Usado quando se quer sincronizar tudo de propósito.

**Default = lazy.** Re-derivar tudo de uma vez pode alterar estilos existentes de formas não revisadas.

Posts já exportados (PNGs em `export/`) nunca mudam — são artefatos finalizados.

---

## 6. Mudanças necessárias

| Arquivo | Mudança |
|---|---|
| `.claude/skills/novo-post/SKILL.md` | Adicionar o gate de promoção após a aprovação do design (passo 9): captura híbrida → confirmação de escopo → promoção. Detecção de diff quando há `preview.html` anexado. Comportamento dual local/cron. |
| (opcional) passo "re-derivar estilos" | Ação eager de propagação para estilos existentes. Pode ser um sub-fluxo do `novo-estilo` ou um comando próprio. **Decidir na implementação** se entra agora ou fica para depois. |

Nenhum agente novo. A promoção é escrita gated em arquivo canônico, feita pela própria skill (ou delegada ao owner do arquivo, ex: o `designer` para `estilo.md`/`social-media.md`). **Decidir na implementação:** a skill escreve direto ou delega ao agente owner.

---

## 7. Questões abertas (resolver no plano)

1. **Quem escreve a promoção?** A skill direto, ou delega ao agente owner do arquivo (mantém ownership limpo)? Tende a delegar — `designer` é dono natural de `estilo.md`/chrome; `referencias-visuais.md` é territorio de brand.
2. **O passo "re-derivar estilos" (eager) entra neste ciclo ou depois?** Lazy já entrega o valor principal; eager é otimização.
3. **Granularidade da detecção de diff.** Quão fino o agente reporta? (font-size, posição, cor, opacidade — sim; reflows sutis de layout — provavelmente ruído.) Definir a lista de propriedades "promovíveis".

---

## 8. Critério de conclusão

- No passo 9 do `/novo-post`, após aprovação do design, o usuário pode promover um ajuste por prompt explícito **ou** confirmar um candidato detectado de um `preview.html` editado.
- A promoção escreve no alvo correto conforme o escopo (`referencias-visuais.md` / `social-media.md` / `estilo.md`), de forma cirúrgica.
- Modo local pede confirmação; modo cron aplica via prompt explícito.
- Posts novos herdam mudanças canônicas automaticamente; estilos existentes seguem política lazy por default.
- Ajuste pontual não polui nenhuma fonte canônica.

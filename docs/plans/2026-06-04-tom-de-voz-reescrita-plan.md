# Tom de Voz — Reescrita com Registro de Mestre · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever `brand/tom-de-voz.md` mais limpo/assertivo/organizado, com uma seção "Registro de mestre" no topo que trava a voz contra o "narrador comum" em texto longo — preservando 100% da essência.

**Architecture:** Reescrita de um único documento de prosa. Sem código, sem teste unitário. Reorganiza a hierarquia, deduplica as 17 "Regras de copy" para dentro das seções certas, e adiciona a seção-trava com pares de contraste. Validação = diff vs. atual (checklist de preservação) + prova de fogo (reescrever o slide editorial que falhou) + **sign-off do usuário no diff (gate real)**.

**Tech Stack:** Markdown. Git para diff/commit.

**Spec:** `docs/specs/2026-06-04-tom-de-voz-reescrita-registro-mestre-design.md`

---

## File Structure

**Modificado:**
- `brand/tom-de-voz.md` — reescrita completa (reorganização + seção nova + dedup).

**Temporário (validação, não versionado):**
- `docs/_prova-tom-reescrito.md` — reescrita do slide que falhou, lado a lado com o original (artefato de validação; removido após sign-off).

---

## Outline do documento reescrito (ordem das seções)

```
1. Personalidade da marca (enxuta: o que é + 3 palavras + o que NÃO é)
2. ★ Registro de mestre (NOVO — a trava; vale em qualquer tamanho)
3. A espinha filosófica (direção → caminho → identidade)
4. Mecanismos de construção (M1–M9, consolidados)
5. Vocabulário (usar / evitar / hierarquia por contexto)
6. Cenários de borda
7. Sign-off fixo + Frases-bandeira
```

## Mapa de deduplicação — as 17 "Regras de copy" atuais

Cada regra é absorvida (não some, vira parte de uma seção). Quem aplica o plano usa este mapa:

| Regra atual | Destino |
|---|---|
| 1 Direção vence motivação (conecte à ação) | §2 Registro (nota) |
| 2 Linguagem simples mesmo técnico | §1 Personalidade |
| 3 Mensagens curtas e impactantes | §2 Registro |
| 4 Trate por "você" | §2 Registro |
| 5 Mostre, não decore | §4 M5 (princípio de origem / prova) |
| 6 Cada frase tem propósito | §1 Personalidade (econômica) |
| 7 Tom sereno, autoridade calma | §1 Personalidade |
| 8 Devolve autorrespeito antes de cobrar | §4 M1 (dualidade) |
| 9 Não celebra pódio, aponta trabalho invisível | §4 M3 (trabalho invisível) |
| 10 Sem promessas de tempo/número | §5 Vocabulário → Evitar (MANTER — sensível) |
| 11 Conecte o método ao Ramon | §4 M5 |
| 12 Termine com ação, com parcimônia | §2 Registro (nota de CTA) |
| 13 Ensine como mestre, presente universal | §2 Registro (âncora da seção) ★ |
| 14 Feche a legenda com o sign-off | §7 Sign-off |
| 15 Oriente para dentro, liberte da plateia | §4 M7 + §6 cenário "comparação" |
| 16 "Direção" é palavra reservada | §5 Vocabulário → Hierarquia (MANTER) |
| 17 Analogias quando concretizam o princípio | §2 Registro (nota de analogia) |

## Checklist de preservação (tudo que DEVE sobreviver)

- Personalidade: atleta-filósofo da disciplina que não grita; Halo Ramon financia o direito de não provar nada; acolhe sem vitimismo.
- 3 palavras: **Sereno, Íntimo, Direto**. O que NÃO é: **Gritado, Vitimista, Vendedor**.
- Espinha filosófica completa: direção → caminho → identidade; "dois produtos" (o lugar + a pessoa); "Você é a escolha que sustenta, não a que pensa."
- **Todos** os 9 mecanismos M1–M9 com seus nomes e ao menos os exemplos-chave de cada.
- Vocabulário: lista Usar; lista Evitar (atalho, motivação vazia, vitimismo, superlativos, hype, promessas de prazo, clichês, "shape" institucional); Hierarquia por contexto (você pode > dá pra; consistência; comprometimento; processo; **direção reservada**; resultado > evolução; tédio vs desconforto).
- Cenários de borda: os 5 (falha recente, progresso invisível, comparação, conquista, dúvida do método) com suas âncoras.
- Sign-off **"O topo exige direção."** + regras de uso.
- Frases-bandeira: a lista inteira.

---

## Task 1: Reescrever `brand/tom-de-voz.md`

**Files:**
- Modify: `brand/tom-de-voz.md` (reescrita completa)

- [ ] **Step 1: Ler o documento atual inteiro**

Ler `brand/tom-de-voz.md` na íntegra. Este é o material-fonte: nada do conteúdo essencial pode se perder (ver Checklist de preservação acima).

- [ ] **Step 2: Reescrever o documento na nova ordem**

Reescrever `brand/tom-de-voz.md` seguindo o Outline (7 seções, nessa ordem). Aplicar o Mapa de deduplicação: as 17 regras de copy deixam de ser uma lista solta e são absorvidas nas seções indicadas. Tom da escrita: enxuto, assertivo, sem repetição entre seções.

Atualizar o cabeçalho de versão no topo com uma linha:
```markdown
> **Reescrito em 2026-06-04 — organização enxuta + seção "Registro de mestre":** consolida as 17 regras de copy nas seções certas e adiciona a trava de registro (princípio, não narração) que sustenta a voz em texto longo. Essência inalterada (sereno/íntimo/direto, espinha, M1–M9, sign-off).
```

A **seção 2 — "Registro de mestre"** deve ser escrita exatamente com este conteúdo (é a peça nova e a mais crítica):

```markdown
## Registro de mestre

A regra que vale em **qualquer tamanho de texto** — frase de capa ou corpo editorial longo. Os mecanismos abaixo (M1–M9) dão os moldes; este registro garante que a voz não escorregue para "pessoa comum narrando" no meio de um parágrafo.

> **Teste-guarda:** se a frase soa como algo que uma pessoa comum diria sobre si mesma, está errada. Tem que soar como um **mestre enunciando um princípio**.

1. **Enuncie princípio, não narre cena.** Verdade universal em presente — nunca o relato de um acontecimento.
   - ❌ "Anos treinando, tudo certo, e o espelho não responde."
   - ✅ "Anos de treino exaustivo não garantem resultado no espelho."
2. **Sem vocabulário cotidiano ou dramatizado.** Nada de "travei", "corrói", "trava". A autoridade é calma; não dramatiza a emoção.
   - ❌ "Aí vem a pergunta que corrói: será que travei?"
   - ✅ "A pergunta que você deve se fazer."
3. **Substantivo de princípio acima do objeto literal.** Prefira o nome abstrato ao prop concreto; quando o concreto for necessário, use o do léxico do público.
   - ❌ "longe de qualquer câmera" → ✅ "longe de qualquer reconhecimento"
   - ❌ "a parte que ninguém filma" → ✅ "a parte que ninguém posta"
4. **Fique no léxico da marca.** "estagnado" (não "travou"); processo, direção, caminho, identidade.
   - ❌ "Não travou. Você só entrou na parte do processo que ninguém filma."
   - ✅ "Você não está estagnado. Essa é a parte do processo que ninguém posta."
5. **Não repita termo** em frases vizinhas (ex.: filma / filmou / câmera no mesmo bloco). Repetição denuncia improviso.
6. **Fale ao leitor com autoridade — não encarne a dúvida dele.** O mestre aponta a direção; não narra a própria insegurança nem a do leitor.

**Notas de aplicação** (absorvidas das antigas regras de copy):
- Direção sempre conecta a uma ação concreta — nunca motivação solta.
- Trate o leitor por **"você"**, próximo mas respeitoso. Mensagens curtas; cada frase com propósito.
- No topo de funil (mindset) não há CTA; quando houver, é sóbrio, sem exagero de narrativa.
- **Analogias** estruturais (construção, fundação, tijolo) são válidas **quando encurtam o caminho até o princípio** — nunca como ornamento.
```

- [ ] **Step 3: Verificar a preservação**

Conferir, contra o Checklist de preservação, que tudo sobreviveu. Rodar buscas de sanidade no arquivo reescrito:
```bash
cd "/Users/unstudio/Documents/Projetos/dino team"
grep -c "O topo exige direção" brand/tom-de-voz.md          # ≥1 (sign-off)
grep -cE "Dualidade|Hook contrário|invisível|vitimismo|origem|identidade|tribo|privilégio|vergonha" brand/tom-de-voz.md  # ~9 mecanismos
grep -cE "Sereno|Íntimo|Direto" brand/tom-de-voz.md          # ≥1
grep -cE "Falha recente|Progresso invisível|Comparação|Conquista|Dúvida sobre o método" brand/tom-de-voz.md  # 5 cenários
grep -c "Registro de mestre" brand/tom-de-voz.md             # 1 (seção nova)
```
Expected: todos retornam contagem > 0 (mecanismos ~9, cenários 5). Se algum vier 0, o conteúdo foi perdido — recuperar do original antes de commitar.

- [ ] **Step 4: Commit**

```bash
git add brand/tom-de-voz.md
git commit -m "feat(brand): reescrita do tom de voz + Registro de mestre (trava de registro)"
```

---

## Task 2: Prova de fogo — reescrever o slide editorial que falhou

**Files:**
- Create (temp): `docs/_prova-tom-reescrito.md`

- [ ] **Step 1: Reescrever a copy do post de mindset usando o tom novo**

Usando o `brand/tom-de-voz.md` reescrito (em especial a seção "Registro de mestre"), reescrever a copy do carrossel de mindset "O QUE NINGUÉM VÊ" (7 slides) que havia falhado. Aplicar as correções do usuário como padrão: princípio em vez de narração, sem cotidiano, "posta"/"estagnado", sem repetição, substantivo de princípio.

Salvar em `docs/_prova-tom-reescrito.md` no formato lado-a-lado:
```markdown
# Prova de fogo — tom reescrito (carrossel mindset "O que ninguém vê")

## Slide 2 — corpo
**Antes (falhou):** Anos treinando, tudo certo, e o espelho não responde. Aí vem a pergunta que corrói: será que travei? Não travou. Você só entrou na parte do processo que ninguém filma.
**Depois (tom novo):** Anos de treino exaustivo não garantem resultado no espelho. A pergunta que você deve se fazer não é se estagnou. Você não estagnou — entrou na parte do processo que ninguém posta.

(repetir para os slides 3–7, aplicando a mesma régua)
```
Escrever os 7 slides completos no arquivo, cada um com Antes/Depois.

- [ ] **Step 2: CHECKPOINT — sign-off do usuário (gate real)**

O controller apresenta ao usuário: (a) o **diff** de `brand/tom-de-voz.md` (`git show HEAD` ou `git diff HEAD~1 brand/tom-de-voz.md`) e (b) `docs/_prova-tom-reescrito.md`. O usuário confirma: essência intacta? registro segura o corpo longo? Ajustes pedidos voltam à Task 1 (e a um novo commit de ajuste). Só avança com aprovação explícita.

- [ ] **Step 3: Remover o artefato de validação**

Após o sign-off:
```bash
rm -f docs/_prova-tom-reescrito.md
```
(Não versionado — sem commit.)

---

## Self-Review (cobertura do spec)

- **D1 (reescrita enxuta/organizada):** Task 1 (outline + dedup das 17 regras). ✔
- **D2 (seção "Registro de mestre" com os "nãos"):** Task 1 step 2 (conteúdo verbatim). ✔
- **D3 (pares de contraste em formato longo):** incluídos na seção (itens 1–4) + Task 2 (prova de fogo). ✔
- **D4 (descartar modos-de-copy):** nada criado; só o tom. ✔
- **Essência preservada:** Checklist de preservação + Task 1 step 3 (greps de sanidade). ✔
- **Validação:** Task 2 (diff + prova + sign-off). ✔

Sem placeholders (a seção nova está verbatim; o mapa de dedup é completo). Sem teste unitário por ser prosa/doc — validação é diff + prova + olho do usuário, declarada. Nomes de seção consistentes entre Outline, Mapa e Checklist.

# Refatoração das skills da função "criar posts" + padrão de escrita de skills

> Data: 2026-06-10
> Escopo: `/novo-post`, `/lote-posts`, `/novo-estilo`, `/editar-post` + subseção nova no `CLAUDE.md`.
> Objetivo: encurtar as skills e remover contexto desnecessário/redundante **sem remover nenhuma função**, e codificar o padrão para que skills futuras nasçam organizadas.

---

## Problema

As skills da função de criar posts cresceram com redundância textual e contexto carregado de uma vez. Diagnóstico concreto (referências de linha do estado atual):

1. **Listas de leitura escritas em dobro.** O bloco "Contexto de leitura por passo" (`/novo-post` 63‑66) lista o que briefing/copy/design leem, e cada passo **repete a mesma lista inline** (Passos 6, 10, 11). Duas fontes para o mesmo dado.
2. **`--auto` documentado em dobro.** Bloco central "Modo autônomo" + lembrete inline repetido em ~5 passos.
3. **Regras globais restated em cada passo:** "não gerar `preview.html`", regras de drop-zone, `export-png.js valida sozinho` — repetidas, embora já canônicas em `templates/estilo.md` e `brand/social-media.md`.
4. **Números quebrados** (`2a, 3.⏸, 4.⏸, 8t, 11m, 11.5, 14.5, 14.6, 15.5`): pausas viraram sub-passos; condicionais foram enxertados como frações. Quebra a leitura sequencial.
5. **Duplicação cross-skill.** `/lote-posts` re-documenta o pipeline do `/novo-post` (gate, write-back, política de publicação). `/novo-estilo` duplica o boot do Dino Editor e o loop de aprendizado. Maior fonte de dessincronização.
6. **`/editar-post` drifted/com bug.** Manda subir o backend na mão (`npm run editor`) e usar VS Code "Show Preview" — contradiz `/novo-post` e `/novo-estilo` (auto-boot), a regra explícita "Nunca instrua Live Preview, passe a URL", e a memória `feedback-editor-preview`.
7. **Referências por número.** `/novo-estilo` cita "Passo 11.5 de /novo-post"; `/editar-post` cita "/novo-post → etapa 11". Renumerar (o objetivo) quebra essas referências.

**Não é problema de função.** O inventário de 26 capacidades do `/novo-post` é todo legítimo. É problema de **forma**: quanto texto e contexto a skill carrega para executar essas funções.

---

## Decisão de referência: o prompt externo (Instagram Carousel Generator)

Um prompt de terceiro foi avaliado como possível base estrutural. **Veredito: aproveitar a FORMA, rejeitar o CONTEÚDO.**

- **Aproveitar:** a disciplina de "cada passo abre declarando exatamente o que lê/coleta antes de agir" e a sequência linear sem números quebrados. Essas duas ideias entram no padrão.
- **Rejeitar:** todo o conteúdo do prompt (derivação de paleta a partir de 1 cor, pares de fonte, snippets de componente HTML, IG Frame de preview, script Playwright de export) é incompatível com a arquitetura do Dino, onde a particularidade mora em cada `estilo.md`, tokens em `referencias-visuais.md`, chrome em `social-media.md`, export em `scripts/export-png.js`, e o `preview.html`/IG-frame foi **aposentado**. Importar o conteúdo re-centralizaria o que o Dino corretamente distribuiu.
- **Sobre "mover `social-media.md` para o topo da skill":** rejeitado como cópia. `social-media.md` é arquivo de brand lido por `revisor-brand`, `/novo-estilo` e `/lote-posts`; copiá-lo violaria "3 lares — ponteiros, não cópias". O ganho real é o **mapa de contexto por passo** (linha `Lê:`), que aponta para o arquivo sem copiá-lo.

---

## O padrão de escrita de skills (9 regras)

Rege as 4 skills desta refatoração e toda skill futura. Vai como subseção compacta em `CLAUDE.md → Regras operacionais`.

1. **`## Fluxo` continua obrigatório**, renumerado linear `1..N`. Zero número quebrado/fracionado.
2. **Cada passo abre com `Lê:`** — uma linha declarando o contexto que aquele passo lê (arquivos de `brand/`, `memory/`, `estilo.md`, etc.), **uma vez**. Sem bloco de leitura no topo e sem repetição inline.
3. **Passos condicionais = sub-bullets do passo-pai**, não passos numerados próprios. A espinha numerada é só o happy path.
4. **Pausa (⏸) é parte do passo** que a contém — nunca um sub-passo separado.
5. **`--auto` (e qualquer modo) num único bloco** (`## Modo autônomo`). Proibido lembrete inline repetido por passo.
6. **Referência por nome (`§Design`, `§Aprendizado de estilo`), nunca por número.** Números são instáveis sob renumeração.
7. **Lar canônico para bloco longo compartilhado.** A skill mais completa detém o texto integral; as demais apontam por nome (não copiam). Aqui: `/novo-post` é o lar canônico de boot-do-Editor, loop-de-aprendizado e retry-do-gate.
8. **Fonte única para regra global.** Não restated spec de `social-media.md`, drop-zones, "sem `preview.html`", "export valida sozinho" em cada passo — declarar onde mora e apontar.
9. **Superfície de edição = Dino Editor por link.** A skill sobe o editor e envia `http://localhost:4321`. **Nenhuma menção a "Live Preview".** Stories (editor é carrossel-only) → preview via `export-png.js` → PNG.

---

## Plano por skill

### `/novo-post` (lar canônico)

- Renumera o `## Fluxo` de 25 linhas (16 inteiros + 9 frações) para **~13 passos lineares**.
- Condicionais viram sub-bullets: `treino` sob "resolver inputs do estilo"; `fotos do banco` + `aprendizado de estilo` sob "Design"; `stories` + `captura de fonte` sob "Entrega".
- Um `Lê:` por passo; remove o bloco duplicado "Contexto de leitura por passo" (63‑66) e as listas inline repetidas.
- Um único `## Modo autônomo`; remove os lembretes inline.
- Detém o texto integral de: **§Editor** (boot + health-check + envio do link), **§Aprendizado de estilo** (extract-structural + pausa de promoção), **§Gate** (prompt do `revisor-brand` + scaffold de retry), **§Write-back**, **§Publicação**, **§Pesquisa**.
- **Preserva a pausa do loop de aprendizado:** detecta mudança estrutural e pergunta "Promover ao `estilo.md`? tudo/`<bloco>`/não"; default = só no post.
- Alvo: ~691 → ~360 linhas.

### `/lote-posts`

- Referencia por nome `/novo-post §Gate`, `§Write-back`, `§Publicação`, `§Pesquisa` em vez de re-documentar.
- Preserva o que é exclusivo do lote: resolução de distribuição de estilos, scouting de distribuição, pausa única de revisão de copies em lote, loop de revisão de slides por post, modo agendado (pula pausas), política de falha "falha um, segue os outros".
- Um `Lê:` por passo (contexto de leitura por post).
- Alvo: ~341 → ~190 linhas.

### `/novo-estilo`

- Referencia `/novo-post §Editor` (boot) e `§Aprendizado de estilo` por nome.
- Elimina o passo fracionado `6.5`; funde a pausa no passo de revisão do editor.
- Um `Lê:` por passo (Passo 5 lê `templates/estilo.md` + `referencias-visuais.md` + `social-media.md`).
- **Distinção preservada:** em modo edição, promove edições estruturais **direto** ao `estilo.md` (é o objetivo da skill) — sem a pausa de confirmação que o `/novo-post` tem.
- Mantém: dual-mode criar/editar, gate visual do `revisor-brand` (momento "criação/edição de estilo"), ciclo `_rascunho/`, scaffold de preview, fallback de stories.
- Alvo: ~186 → ~120 linhas.

### `/editar-post` (conserta o drift)

- **Conserta o bug:** a skill **sobe o editor automaticamente** (mesmo padrão das outras) e **envia `http://localhost:4321`**. Remove a instrução de subir backend na mão e a menção a VS Code "Show Preview"/Live Preview.
- Referencia `/novo-post §Editor` por nome.
- Troca a referência "/novo-post → etapa 11" por referência de nome (`§Design`/curadoria).
- Mantém: resolução de post por slug/caminho, resolução de estilo via `briefing.md`, pausa de edição, re-export opcional.
- Alvo: ~111 → ~80 linhas.

---

## `CLAUDE.md`

Estender a seção **"Regras operacionais"** com a subseção **"Padrão de escrita de skills"** = as 9 regras acima, comprimidas (forma de enforcement de relance). **Modo escolhido: (a) inline no `CLAUDE.md`** — é onde regra de skill já mora ("Toda skill abre com `## Fluxo`", "Contexto cirúrgico sem redundância", "Schema rígido de saída"). Sem doc separado.

---

## Garantias e fora de escopo

**Preservado (nenhuma função removida):** todas as 26 capacidades do `/novo-post` (parse livre, `--briefing` pré-pronto, `--auto`, guarda de frescor, scouting, seleção/criação de estilo ad-hoc, briefing, treino, deep research, copy, design, fotos do banco, editor, aprendizado de estilo, export, gate, entrega, stories, captura de fonte, save/discard rascunho, write-back, publicação, marcação de uso, run-ledger) e as funções equivalentes das outras 3 skills. As pausas humanas (⏸) e os gates permanecem nos mesmos pontos.

**Fora de escopo:**
- Conteúdo dos arquivos de `brand/`, `templates/estilo.md`, `social-media.md` (só são apontados, não editados — salvo remover menção a "Live Preview" em `templates/estilo.md` se existir, por consistência com a regra 9).
- As skills de pesquisa (`/pesquisar-mercado`, `/pesquisar-tema`) — já são funções separadas, continuam sendo chamadas por nome.
- Mudança de comportamento de runtime de qualquer agente ou script. É refatoração de texto/estrutura das skills, não de lógica.
- Outras skills do repositório (não fazem parte da função "criar posts").

---

## Critério de sucesso

1. As 4 skills têm `## Fluxo` com numeração linear `1..N` — nenhum passo fracionado.
2. Nenhuma lista de leitura aparece duas vezes na mesma skill; cada passo tem no máximo uma linha `Lê:`.
3. `--auto` documentado em exatamente um bloco no `/novo-post` (e no `/lote-posts` modo agendado), sem lembretes inline repetidos.
4. Boot-do-Editor, loop-de-aprendizado e retry-do-gate têm um único lar (`/novo-post`); as outras 3 skills referenciam por nome.
5. Nenhuma skill menciona "Live Preview"; todas enviam o link do editor (carrossel) ou apontam export→PNG (stories).
6. Toda referência cross-skill e intra-skill é por nome de seção, não por número.
7. `/editar-post` sobe o editor sozinha e envia o link — sem instrução de backend manual.
8. `CLAUDE.md → Regras operacionais` contém a subseção "Padrão de escrita de skills" com as 9 regras.
9. Inventário de funções preservado: um diff function-by-function confirma que nenhuma capacidade dos critérios atuais de conclusão de cada skill sumiu.
10. Cada skill encurtou materialmente (alvos: novo-post ~360, lote-posts ~190, novo-estilo ~120, editar-post ~80) sem perda de função.

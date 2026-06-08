# Banco de imagens via Google Drive (MCP) com descanso por canal

> Design doc — 2026-06-07
> Status: aprovado em brainstorming, pendente de plano de implementação

## Problema

No pipeline de criação de post **não existe na prática** um passo que selecione as imagens. A
infraestrutura existe mas está **dormente**: o `arquivista` já é owner do `.banco-index.json` com as
tarefas `indexar`/`selecionar`/`marcar`, e o `/novo-post` já tem os Passos 11m (selecionar) e 16
(marcar) — mas a variável de fluxo `banco` **nunca é setada em lugar nenhum**, então o passo é código
morto e o usuário sempre dropa fotos manualmente no Dino Editor.

Além disso, a marcação de uso hoje é **global**: um único campo `rest_until` por imagem. Isso impede o
comportamento desejado — a mesma foto usada no Instagram deveria continuar livre para outro canal
(e-mail, blog, ads) que ainda não a usou.

## Objetivo

1. Conectar o **MCP oficial do Google Drive** (`drivemcp.googleapis.com/mcp`) como fonte do banco de
   imagens da marca.
2. O `arquivista` busca a melhor imagem por **tema + estilo** e pré-preenche as drop zones do post.
3. A imagem usada é marcada para **descanso por canal** — descansa só no canal que a usou; permanece
   disponível para os demais canais que ainda não a usaram.

## Decisões (fixadas no brainstorming)

| Decisão | Escolha |
|---|---|
| Conexão com o Drive | MCP oficial (`drivemcp.googleapis.com/mcp`), não API direta |
| Escopo de canais nesta entrega | **Só Instagram**, mas schema/scripts já nascem por-canal (sem migração futura) |
| Origem no Drive | **Pasta-raiz fixa**, configurada uma vez |
| Como definir a pasta | Skill nova **`/configurar-banco`** (lista pastas via MCP, usuário escolhe, grava o ID) |
| Indexação/legenda | **Lazy** no primeiro `/novo-post` (sem comando de sync separado) |
| Janela de descanso | **Configurável por canal**; defaults: instagram 60, email 30, blog 30, ads 0 |
| `ads: 0` | `0` = **sem descanso** (sempre disponível) |
| Arquitetura | **Abordagem C (híbrida fina)**: MCP descobre, visão compreende, código puro guarda estado |

## Princípio de arquitetura

**MCP descobre, visão compreende, código puro guarda o estado.**

Nem o MCP nem a API do Drive entendem o *conteúdo* da foto — ambos são transporte (metadados +
bytes). A compreensão visual vem da **visão do próprio agente** olhando os pixels. Portanto o fluxo é
em dois estágios:

1. **Descoberta (MCP/Drive):** a busca por conteúdo do próprio Drive (mesma ML do Google Photos) +
   nome + pasta devolve um punhado de candidatos. Barato, sem visão. Peneira grosseira.
2. **Compreensão (visão do agente):** só nesses candidatos, olha os pixels **via thumbnail** (mais
   barato que o arquivo cheio, suficiente para legendar), escreve a legenda **uma vez**, e persiste no
   índice. Posts seguintes ranqueiam pela legenda salva, sem re-olhar.

A regra de negócio crítica (isolamento por canal) fica em **funções puras testáveis**, não no
julgamento do agente.

## Componentes

```
┌─ /novo-post (Passo 11m: selecionar) ─────────────────────────┐
│  1. arquivista recebe: copy.md, estilo.md, canal=instagram   │
│  2. [DESCOBERTA]  MCP Drive: busca na pasta-raiz por tema     │
│                   → N candidatos (file_id + name + thumbnail) │
│  3. [ESTADO]      banco.js: filtra disponíveis p/ instagram   │
│  4. [VISÃO]       candidatos novos sem legenda: baixa         │
│                   thumbnail → legenda por visão → grava       │
│  5. [RANQUEIO]    match copy↔legenda/tags → suggestions.json  │
└──────────────────────────────────────────────────────────────┘
Passo 16 (marcar): banco.js registra used_in{canal} + rest_until{canal}
```

| Componente | Papel | Novo/alterado |
|---|---|---|
| MCP Drive (`drivemcp.googleapis.com/mcp`) | listar/buscar pasta-raiz, dar `thumbnailLink` + bytes | configurar (`.mcp.json`) |
| `/configurar-banco` (skill) | lista pastas via MCP, usuário escolhe, grava ID no YAML | **nova** |
| `arquivista` (agente) | orquestra os 5 passos; dona da visão+legenda | contrato ganha eixo `canal` + Drive |
| `scripts/editor/banco.js` | funções puras: índice, math de descanso **por-canal**, filtro de disponíveis | estender (core) |
| `scripts/index-banco.js` | CLI fino sobre `banco.js`; `--canal` em `mark`, novo subcomando `available <canal>` | estender |
| `.banco-index.json` | índice versionado; passa a referenciar `drive_file_id` + cache | schema v2 (leitura tolerante a v1) |
| `orquestracao/banco-imagens.yaml` | pasta-raiz do Drive + descanso por canal | **novo** |
| `.cache/banco/` (gitignored) | thumbnails/bytes baixados, evita re-baixar | **novo dir** |

**Não muda:** `revisor-brand`, `export-png`, o resto do `/novo-post`. A drop zone continua
pré-preenchida via `suggestions.json` (mecanismo existente); o usuário ainda troca no Dino Editor.

## Schema do índice (`.banco-index.json` v2)

```jsonc
{
  "version": 2,
  "images": [{
    "drive_file_id": "1AbC...",                 // chave estável (não o nome)
    "name": "ramon-palco.jpg",                  // rótulo legível; pode mudar no Drive
    "cache_path": ".cache/banco/1AbC.jpg",      // thumbnail baixado (gitignored)
    "caption": "Ramon de costas no palco, luz dura, fundo escuro",
    "tags": ["palco", "posing"],
    "used_in": [
      { "post": "slug-do-post", "date": "2026-06-01", "canal": "instagram" }
    ],
    "rest_until": { "instagram": "2026-08-01" } // MAPA por canal
  }]
}
```

### Regras das funções puras (`banco.js`)

- `filterAvailable(index, canal, hojeISO)` → imagem disponível para `canal` se
  `rest_until[canal]` ausente **ou** `<= hoje`. **As outras chaves do mapa são ignoradas** — é o
  coração do requisito ("livre em e-mail mesmo usada no IG").
- `markUsed(index, driveFileId, post, dataISO, canal, restDays)` → adiciona
  `{post, date, canal}` em `used_in` e seta `rest_until[canal] = data + restDays`. **Nunca toca nas
  outras chaves do mapa.** Se `restDays === 0`, não cria descanso (fica disponível imediatamente).
- `scanNew` / `upsertCaption` passam a operar pela chave `drive_file_id`.

### Migração tolerante (sem script dedicado)

Na leitura, um índice v1 (`rest_until` = string ou ausente, chave por `file`) é convertido on-the-fly
para v2: `rest_until` vira `{}` (vazio = tudo disponível, já que o descanso era global e não há canal
registrado). Sem crash, sem script de migração separado.

## Config (`orquestracao/banco-imagens.yaml`)

```yaml
drive:
  pasta_raiz_id: "<folder-id-do-drive>"   # gravado por /configurar-banco
descanso_por_canal:                        # dias; 0 = sem descanso
  instagram: 60
  email: 30      # declarado, ainda não consumido
  blog: 30       # declarado, ainda não consumido
  ads: 0
```

Só `instagram` é consumido nesta entrega; os demais ficam declarados (sem migração quando entrarem).

## Skill `/configurar-banco`

1. Verifica se o MCP do Drive está configurado/autenticado; se não, guia o login OAuth.
2. Usa o MCP para listar as pastas do Drive (raiz + subpastas).
3. Usuário escolhe pelo nome.
4. Grava `pasta_raiz_id` em `orquestracao/banco-imagens.yaml` — criando o arquivo com o bloco
   `descanso_por_canal` default se ainda não existir.
5. Re-rodar troca a pasta a qualquer momento.

### Como obter o ID manualmente (fallback)

A URL da pasta no Drive web é `https://drive.google.com/drive/folders/<ID>`; o trecho após `/folders/`
é o `pasta_raiz_id`. A conta autenticada no MCP precisa ser dona ou ter a pasta compartilhada.

## Fluxo no `/novo-post`

**Passo 11m (selecionar) — deixa de depender de `--banco` manual:**

1. Lê `pasta_raiz_id` de `orquestracao/banco-imagens.yaml`. Se vazio → **pula seleção** (usuário dropa
   manual), sem erro.
2. Aciona `arquivista` com `canal=instagram`, `copy.md`, `estilo.md`, pasta-raiz.
3. `arquivista` executa os 5 passos: MCP busca candidatos por tema → `banco.js` filtra disponíveis p/
   instagram → baixa thumbnail + legenda **só candidatos novos sem legenda** (lazy) → ranqueia → grava
   `design/suggestions.json` (melhor por drop zone).
4. `suggestions.json` pré-preenche as drop zones no Dino Editor.

**Passo 16 (marcar) — por canal:**

```
index-banco mark <drive_file_id> <slug> --canal instagram
→ used_in += {post, date, canal: instagram}
→ rest_until.instagram = hoje + 60 (da config)
```

Marca **só as imagens efetivamente presentes no preview final** — uma sugestão recusada no Editor não
queima a foto.

O `canal=instagram` é fixo porque `/novo-post` é só Instagram. Quando outros canais entrarem, cada
skill passa o seu canal — sem mudança no `banco.js` (já recebe `canal` como parâmetro).

## Tratamento de erros e bordas

| Situação | Comportamento |
|---|---|
| `pasta_raiz_id` vazio/ausente | Passo 11m pula seleção silenciosamente; sem erro. |
| MCP não configurado/sem auth | `/configurar-banco` guia OAuth. No `/novo-post`, se o MCP cair, avisa e segue manual. **Nunca trava a entrega do post.** |
| Busca não traz candidato | `SEM_DISPONIVEIS — <drop zone>`; drop zone fica vazia. |
| Todos candidatos em descanso (instagram) | `SEM_DISPONIVEIS`; nunca sugere foto com `rest_until.instagram` futuro. |
| Thumbnail não baixa | `BANCO_OFFLINE_ONLY — <name>`; pula a imagem, segue com as outras. |
| Índice v1 | Conversão tolerante na leitura → v2; sem crash. |
| Usuário troca foto no Editor | Passo 16 marca só o preview final. |
| Drive renomeia/move arquivo | Chave é `drive_file_id` (estável); `name` é só rótulo. |

**Invariante de segurança:** `markUsed` e `filterAvailable` só leem/escrevem a chave do canal
recebido. É impossível, por construção, marcar IG e bloquear e-mail. (Coberto por teste.)

## Testes

Núcleo testável = `banco.js` (funções puras), seguindo o padrão de `handlers.test.js`.

**`banco.test.js`:**

1. `filterAvailable(idx, "instagram", hoje)` — foto com `rest_until.instagram` futuro não aparece.
2. **Teste-chave:** foto usada no `instagram` (rest futuro) continua disponível para `email`/`ads` no
   mesmo `hoje`. Prova "livre em outro canal".
3. `markUsed(..., "instagram", 60)` seta `rest_until.instagram = hoje+60` e não cria/toca
   `rest_until.email`.
4. `markUsed` no mesmo arquivo para dois canais → as duas chaves coexistem independentes.
5. `ads` com descanso `0` → disponível imediatamente após uso.
6. Conversão tolerante: índice v1 lido como v2 sem crash, tudo disponível.
7. `scanNew`/`upsertCaption` passam com a chave `drive_file_id` (não-regressão).

**CLI (`index-banco.js`):**

8. `mark <id> <slug> --canal instagram` grava no canal certo; sem `--canal` → erro (canal obrigatório).
9. Novo subcomando `available <canal>` lista disponíveis por canal.

**Não automatizado (smoke manual):** busca semântica do MCP, qualidade da legenda por visão,
`/configurar-banco` end-to-end. Mockar o MCP daria falsa confiança.

## Fora de escopo (YAGNI)

- Wiring de seleção/marcação em `/novo-email`, `/novo-artigo`, `/novo-comunidade` (schema já pronto p/
  eles; build quando o canal precisar de imagem).
- Canal `ads` operante (nenhuma skill de ads ainda; só reservado no config).
- Comando de sync eager (`/indexar-banco`) — indexação é lazy.
- Script de migração v1→v2 dedicado — conversão é tolerante na leitura.

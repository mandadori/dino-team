# Design: Direcionamento do pesquisador-mercado na Fase A

**Data:** 2026-05-26
**Escopo:** Tornar o scouting de mercado (Fase A) mais preciso — saindo de busca genérica para buscas ancoradas em concorrentes e segmentos declarados.

---

## Problema

O `pesquisador-mercado` em modo `scouting de mercado` (Fase A) faz buscas genéricas na web sem âncoras concretas. Não sabe por onde começar, quais concorrentes monitorar ou qual segmento do mercado fitness priorizar. O resultado é inteligência de mercado rasa e pouco acionável.

---

## Solução

Três mudanças coordenadas:

1. **Criar `dados/mercado/_diretivas.md`** — arquivo de orientação escrito pelo usuário que dá ao agente âncoras concretas de busca antes de cada Fase A.
2. **Atualizar `pesquisador-mercado.md`** — o agente lê o arquivo diretivo automaticamente antes de qualquer Fase A e usa seu conteúdo para construir queries iniciais.
3. **Reformatar arquivos de concorrente** — estrutura passa de foto estática para foto + log acumulativo de scouting.

---

## 1. Arquivo `dados/mercado/_diretivas.md`

### Propósito

Orientação humana para o agente. É um "briefing de pesquisa" persistente — não uma regra que o agente segue cegamente, mas um ponto de partida declarado. O agente pode e deve explorar além dele quando encontrar algo relevante.

### Owner

Usuário. O `pesquisador-mercado` **nunca escreve** neste arquivo. Pode sugerir adições ao final de uma pesquisa (seção "Sugestões para `_diretivas.md`"), mas só o usuário aplica.

### Seções

```markdown
## Concorrentes prioritários
Lista de slugs de concorrentes e o motivo de monitorar cada um.
Formato: `- slug — motivo em 1 linha`

## Segmentos de foco
Recortes específicos do mercado fitness que são relevantes para a Dino Team.
Ex: hipertrofia intermediário, Classic Physique, bulking/cutting.

## Plataformas prioritárias
Onde começar a buscar. Ex: Instagram, YouTube, blogs fitness.

## Termos de busca proibidos
Termos genéricos ou saturados para evitar (alimentados pelo uso, não na criação).

## Ângulos em monitoramento
Temas específicos para rastrear evolução ao longo dos meses.

## Perguntas abertas
O que ainda não sabemos e o agente deve tentar responder nas próximas pesquisas.
```

### Conteúdo inicial proposto

Baseado nos 4 arquivos de concorrente já existentes e nos pilares da marca:

```markdown
## Concorrentes prioritários
- renato-cariani — maior referência em narrativa de transformação; 11 mi IG; pilar motivacional/lifestyle
- paulo-muzy — autoridade técnico-científica; 8 mi IG; pilar educacional
- toguro — comunidade fitness + humor; Mansão Maromba; pilar motivacional
- stndrd — referência de marca premium monocromática no nicho; referência visual/estética

## Segmentos de foco
- Hipertrofia intermediário (treina há 1-3 anos, sem evolução clara)
- Classic Physique como categoria (diferencial técnico do Ramon)
- Público que quer "shape" sem ser atleta profissional

## Plataformas prioritárias
1. Instagram (Reels e carrosséis dos concorrentes listados)
2. YouTube (vídeos longos com > 500k views no nicho)
3. Reddit r/fitness (linguagem real do público)

## Termos de busca proibidos
(vazio na criação — preencher conforme uso)

## Ângulos em monitoramento
- "Quebrar o platô" — frequência e abordagens usadas pelos concorrentes
- Divisão de treino: ABC vs. full body vs. upper/lower — debate em alta?
- Classic Physique no Brasil: crescimento de interesse ou nicho estável?

## Perguntas abertas
- Existe concorrente direto focado em Classic Physique especificamente?
- Qual segmento de público está mais ativo no Instagram fitness em 2026?
```

---

## 2. Mudanças em `pesquisador-mercado.md`

### Em "Contexto que carrego"

Adicionar (só carregado no modo Fase A):

```
- `dados/mercado/_diretivas.md` — orientações de busca declaradas pelo usuário.
  Lido automaticamente antes de qualquer execução no modo `scouting de mercado`.
  É orientação, não regra — explore além quando relevante.
```

### No modo `scouting de mercado` (Fase A)

Adicionar **antes** de "O que procurar":

```
Antes de buscar:
1. Leia `dados/mercado/_diretivas.md`.
2. Use os concorrentes listados em `## Concorrentes prioritários` como primeiras queries
   (ex: `"@renato-cariani hipertrofia site:youtube.com"`, `"paulo muzy treino"`).
3. Use os segmentos de `## Segmentos de foco` como filtro de relevância — prefira
   achados que casem com esses segmentos ao avaliar o que vale gravar.
4. Comece pelas plataformas de `## Plataformas prioritárias` antes de expandir para web geral.
5. Evite os termos de `## Termos de busca proibidos`.
6. Tente responder as `## Perguntas abertas` — se encontrar resposta, grave em
   `dados/mercado/tendencias/<YYYY-MM>.md` e marque na seção de perguntas abertas do
   output (não no arquivo — só o usuário atualiza `_diretivas.md`).
```

### Novos concorrentes descobertos

Adicionar à seção de ownership do slice:

```
Quando descobrir um concorrente relevante não listado em `_diretivas.md`:
- Crie `dados/mercado/concorrentes/<slug>.md` automaticamente com cabeçalho estático
  + primeira entrada em `## Log de scouting`.
- Liste o arquivo criado na seção "Novos concorrentes adicionados" do output.
- Não adicione o slug a `_diretivas.md` — isso é decisão do usuário.
```

---

## 3. Reformatação dos arquivos de concorrente

### Estrutura atual → nova

Os 4 arquivos existentes (`paulo-muzy.md`, `renato-cariani.md`, `toguro.md`, `stndrd.md`) mantêm todo o conteúdo atual e ganham uma seção nova ao final:

```markdown
## Log de scouting

### YYYY-MM-DD (Fase A — <mês/ano>)

**Tópicos ativos observados:**
- <tópico> — <sinal observado, fonte>

**Formatos predominantes no período:**
- <formato> — <observação>

**Hooks recorrentes:**
- "<frase>" — <contexto>

**Mudança vs. período anterior:** <o que mudou, ou "primeira entrada — sem comparação">
```

A cada nova Fase A, o agente **adiciona** uma entrada datada. Não sobrescreve entradas anteriores.

Arquivos novos criados automaticamente seguem o mesmo schema: cabeçalho estático (perfil + posicionamento + estratégia observada + diferencial vs. Dino Team) + primeira entrada de log.

---

## Escopo das mudanças

| Artefato | Ação | Responsável |
|---|---|---|
| `dados/mercado/_diretivas.md` | Criar com conteúdo inicial | Usuário (proposta neste spec) |
| `.claude/agents/pesquisador-mercado.md` | Editar — adicionar leitura + comportamento Fase A | Implementação |
| `dados/mercado/concorrentes/paulo-muzy.md` | Editar — adicionar `## Log de scouting` | Implementação |
| `dados/mercado/concorrentes/renato-cariani.md` | Editar — adicionar `## Log de scouting` | Implementação |
| `dados/mercado/concorrentes/toguro.md` | Editar — adicionar `## Log de scouting` | Implementação |
| `dados/mercado/concorrentes/stndrd.md` | Editar — adicionar `## Log de scouting` | Implementação |

Nenhuma skill muda. Nenhum schema de banco muda (o `_diretivas.md` é um arquivo novo dentro do slice já existente).

---

## O que não muda

- Fase B (ranqueamento) — não lê o arquivo diretivo; opera só sobre o slice acumulado.
- Pesquisa profunda (`/novo-post` Passo 7) — não lê o arquivo diretivo; o tema já vem definido pela skill.
- Ownership do slice — `pesquisador-mercado` continua owner único de `dados/mercado/`.
- `_diretivas.md` é escrito só pelo usuário — o agente sugere, não aplica.

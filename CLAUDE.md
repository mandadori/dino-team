# Dino Team — Sistema de Geração de Conteúdo

Projeto exclusivo para gerenciamento da marca **Dino Team**. Sistema multi-agente que gera posts para Instagram em múltiplos formatos.

## Formatos suportados

| Tipo | Aspect ratio | Dimensão PNG | Pasta destino |
|---|---|---|---|
| `carrossel` | 4:5 | 1080×1350 | `conteudos/carrosseis/` |
| `stories` | 9:16 | 1080×1920 | `conteudos/stories/` |

Reels e feed 1:1 podem entrar em fases futuras.

## Arquitetura

Sistema multi-agente com um supervisor principal e quatro subagentes especializados:

| Agente | Papel |
|---|---|
| **Diretor de Marca** | Recebe `tipo + tema`, adapta a identidade ao formato, orquestra pipeline e revisa qualidade |
| **Pesquisa & Tendências** | Pesquisa estratégica direcionada por formato (carrossel ≠ stories) |
| **Copywriter** | Copy persuasiva multi-formato (carrossel: 7-10 slides; stories: 3-5 frames) |
| **Designer** | Gera `slide-N.html` standalone nas dimensões corretas, prontos para edição no Claude Design web |
| **Curadoria & Exportação** | Valida + roda export PNG via Puppeteer + monta briefing final |

Todos os agentes ficam em `.claude/agents/`.

## Como usar

### Primeira execução — descoberta de marca
Antes de gerar qualquer post, complete o brand book:
```
/brand-discovery
```
O Diretor de Marca conduz uma entrevista e preenche incrementalmente os arquivos em `brand/`.

### Criar um post
```
/novo-post <tipo> <tema>
```
Exemplos:
- `/novo-post carrossel filosofia estoica no treino`
- `/novo-post stories antes e depois 12 semanas`

Pipeline completo: pesquisa → copy → design (HTML) → curadoria + export PNG → briefing.

### Gerar lote (agendável)
```
/lote-posts <tipo> <N> <tema-base>
```
Útil em combinação com `/schedule` para cadência semanal/mensal. Lote sempre é de um único formato.

## Estrutura de pastas

```
brand/                            ← Brand book (via /brand-discovery)
conteudos/
  pesquisa/                       ← Output do Agente de Pesquisa (reaproveitável entre posts)
  carrosseis/{YYYY-MM-DD}-{slug}/ ← Posts formato carrossel
  stories/{YYYY-MM-DD}-{slug}/    ← Posts formato stories
       ├── pesquisa-base.md       ← snapshot da pesquisa
       ├── copy.md                ← copy final
       ├── design/slide-N.html    ← HTML+CSS standalone (edite no Claude Design web)
       ├── export/slide-N.png     ← imagens finais para Instagram
       └── briefing.md            ← briefing consolidado
templates/                        ← Templates HTML e markdown
scripts/
  export-png.js                   ← Puppeteer: HTML → PNG
.claude/
  agents/                         ← 5 agentes
  skills/                         ← Skills/comandos rápidos
```

## Pipeline de export

1. Designer produz `design/slide-N.html` em 1080×1350 (carrossel) ou 1080×1920 (stories).
2. Curador roda `node scripts/export-png.js <pasta-do-post>` — Puppeteer renderiza cada HTML e gera PNG em `export/`.
3. Briefing final consolida tudo em `briefing.md`.

Requer Node 20+ e `npm install` na raiz para instalar Puppeteer.

## Princípios

- **Brand book é fonte da verdade.** Todo agente lê `brand/*.md` antes de produzir.
- **Formato dita a forma.** Carrossel não é stories esticado; stories não é carrossel resumido. Cada um pede estratégia, estrutura e tom diferentes.
- **Cada post vive em sua própria pasta datada.** Histórico organizado.
- **HTML standalone como fonte editável.** Permite ajuste fino no Claude Design web antes do export.
- **PNG é o entregável final.** Pronto para upload no Instagram.
- **Português é a língua padrão.**

## Convenções de naming

- Slug: `kebab-case` em português sem acentos
- Pasta do post: `YYYY-MM-DD-{slug}` dentro de `conteudos/{carrosseis|stories}/`
- Arquivo de pesquisa: `YYYY-MM-DD-tendencias-{slug}.md`
- Slide/frame HTML: `slide-N.html` (numeração sequencial)
- PNG correspondente: `slide-N.png`

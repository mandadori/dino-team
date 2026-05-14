# Dino Team — Sistema de Geração de Conteúdo

Projeto exclusivo para gerenciamento da marca **Dino Team**. A estrutura atual é dedicada à geração de postagens em formato carrossel para mídias sociais.

## Arquitetura

Sistema multi-agente com um supervisor principal e quatro subagentes especializados:

| Agente | Papel |
|---|---|
| **Diretor de Marca** | Supervisor principal — estratégia, branding, qualidade |
| **Pesquisa & Tendências** | Investiga trends, ângulos quentes e referências |
| **Copywriter** | Redige copy dos slides com tom de voz da marca |
| **Designer** | Direção visual textual por slide |
| **Curadoria & Exportação** | Revisão final e consolidação do briefing |

Todos os agentes ficam em `.claude/agents/`.

## Como usar

### Primeira execução — descoberta de marca
Antes de gerar qualquer carrossel, complete o brand book:
```
/brand-discovery
```
O Diretor de Marca conduz uma entrevista e preenche incrementalmente os arquivos em `brand/`.

### Criar uma postagem
```
/novo-carrossel <tema>
```
Dispara o pipeline completo: pesquisa → copy → design → briefing final.

### Gerar lote (agendável)
```
/lote-carrosseis <N> <tema-base>
```
Útil em combinação com `/schedule` para cadência semanal/mensal.

## Estrutura de pastas

```
brand/                  ← Brand book (preenchido via /brand-discovery)
conteudos/
  pesquisa/             ← Output do Agente de Pesquisa
  carrosseis/           ← Carrosséis finalizados (1 pasta por carrossel)
templates/              ← Templates dos outputs
.claude/
  agents/               ← Definições dos 5 agentes
  skills/               ← Skills/comandos rápidos
```

## Princípios

- **Brand book é fonte da verdade.** Todo agente lê `brand/*.md` antes de produzir.
- **Cada carrossel vive em sua própria pasta datada.** Mantém histórico organizado.
- **Output é sempre markdown estruturado.** Geração de imagem virá em fase futura.
- **Português é a língua padrão** — copy, briefings e comunicação com o usuário.

## Convenções de naming

- Slug de tema: `kebab-case` em português sem acentos
- Pasta do carrossel: `YYYY-MM-DD-{slug-tema}`
- Arquivo de pesquisa: `YYYY-MM-DD-tendencias-{slug-tema}.md`

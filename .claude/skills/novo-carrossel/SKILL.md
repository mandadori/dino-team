---
name: novo-carrossel
description: Dispara o pipeline completo de criação de um carrossel para mídia social da Dino Team. Invoca o Diretor de Marca, que orquestra pesquisa, copy, design e curadoria. Uso típico - /novo-carrossel <tema>. Requer brand book preenchido (use /brand-discovery primeiro se necessário).
---

# Novo Carrossel — Dino Team

Atalho para criar uma postagem em formato carrossel do zero.

## Como rodar

1. **Receba o tema** do usuário (argumento da skill). Se não houver tema explícito, pergunte: "Sobre que tema é o carrossel?"

2. **Invoque o agente `diretor-marca`** via Task tool com o seguinte prompt:

```
Você foi acionado para criar um novo carrossel da Dino Team.

Tema: {tema do usuário}
Data: {YYYY-MM-DD de hoje}

Execute o pipeline completo conforme suas instruções (Passos 0-6):
1. Valide brand book
2. Defina briefing interno (objetivo, pilar, slug, pasta)
3. Delegue Pesquisa
4. Delegue Copywriter
5. Delegue Designer
6. Delegue Curadoria
7. Revise output final

Reporte ao usuário: caminho da pasta final + 3 bullets do que foi entregue.
```

3. **Aguarde o retorno** do Diretor de Marca e apresente o resumo ao usuário.

## Pré-requisitos

- Brand book preenchido em `brand/` (rode `/brand-discovery` se vazio)
- Diretório de trabalho é o projeto Dino Team

## Variações de uso

- `/novo-carrossel produtividade criativa` — tema direto
- `/novo-carrossel` (sem argumento) — skill pergunta o tema
- `/novo-carrossel tema=X objetivo=gerar-leads pilar=Y` — passe metadados extras se quiser

## O que esta skill NÃO faz

- Não pula validação de brand book
- Não publica o carrossel (apenas gera briefing)
- Não gera imagens reais — só design spec textual

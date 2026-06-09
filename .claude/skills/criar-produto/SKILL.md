---
name: criar-produto
description: Entrevista guiada que cria um produto ancorado em evidência — pega uma oportunidade (do slice ou ideia nova), confronta com o cérebro de marca, desenha a oferta (posicionamento, promessa, público, estrutura/outline, modelo, preço proposto) e grava o blueprint no catálogo como `em-validação`. Gate revisor-brand. Termina no G-ideia (humano aprova gastar orçamento de validação). Sintaxe — /criar-produto <ideia ou slug de oportunidade> [--tipo <digital|serviço|físico>].
---

# /criar-produto — Dino Team

## Objetivo

Criar um produto **com base sólida de evidências**, não no escuro. Conduz uma entrevista
guiada que parte de uma oportunidade (ou ideia), a confronta com o cérebro, e produz o
**blueprint de oferta**. Cobre os estágios 2·3 + concepção (4a) do pipeline de produto.
**Não constrói asset final** (delegado) e **não valida** (é `/validar-produto`).

## Sintaxe

```
/criar-produto <ideia ou slug-de-oportunidade> [--tipo <digital|serviço|físico>]
```

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ parse | input | — | ideia/slug, tipo |
| 2 | `estrategista-produto` (`descobrir-oportunidade`) | ideia/slug + recorte ← 1 | 1 | oportunidade rankeada em `oportunidades.md`; pedidos de pesquisa (se houver) |
| 2b | ⚙ enfileirar pedido de pesquisa (se houver) | pedidos ← 2 | 2 | entrada em `memory/pesquisa/pedidos.md` |
| 3 | ⏸ entrevista guiada (inline) | oportunidade ← 2 | 2 | respostas: público, restrições, modelo desejado |
| 4 | `estrategista-produto` (`arquitetar-oferta`) | oportunidade + respostas ← 3 | 3 | blueprint no `catalogo.md` status `em-validação` |
| 5 | `revisor-brand` (gate) | blueprint ← 4 | 4 | aprovado / reprovado (identidade + compliance de oferta) |
| 6.⏸ | ⏸ **G-ideia** | blueprint aprovado ← 5 | 5 | humano aprova gastar orçamento de validação |
| 7 | ⚙ relatório inline | ← 6 | 6 | caminho + próximo passo (`/validar-produto`) |

## Pipeline

### 1. Parsear input
- `--tipo <digital|serviço|físico>` → `tipo` (default: inferir na entrevista).
- Restante → `ideia` (texto livre) ou `slug` se bater com uma entrada de `oportunidades.md`.

### 2. Descobrir/ancorar a oportunidade
Acionar `estrategista-produto` com `Tarefa: descobrir-oportunidade`, recorte = a ideia/slug.
O agente confronta com `publico/`, `mercado/`, `performance/`, rankeia pela função-objetivo
e grava em `oportunidades.md`. Se ele devolver `SEM_SUSTENTACAO` → reportar ao usuário e
**parar** (não criar produto sem evidência). Se devolver `pedidos-de-pesquisa` → Passo 2b.

### 2b. Enfileirar pedido de pesquisa (loop fechado)
Para cada pedido devolvido, acrescentar uma entrada em `memory/pesquisa/pedidos.md`
(schema do arquivo) com status `aberto`. Informar ao usuário que há lacuna de evidência —
ele decide seguir mesmo assim (marcando assunção) ou rodar `/pesquisar-tema` antes.

### 3. Entrevista guiada (⏸ inline)
Perguntar, **uma de cada vez** (estilo entrevista — só o que a oportunidade não responde):
público da oferta, transformação prometida, formato/estrutura desejada, modelo de entrega
e restrições. Confrontar respostas com a evidência (apontar tensões, não só transcrever).

### 4. Arquitetar a oferta
Acionar `estrategista-produto` com `Tarefa: arquitetar-oferta`, passando slug + respostas.
Ele grava o blueprint no `catalogo.md` com status `em-validação` e devolve manifesto
(verdade, pilar, preço proposto, delegação de asset).

### 5. Gate de marca (`revisor-brand`)
Acionar `revisor-brand` para validar **copy/oferta + compliance** do blueprint: promessa
lastreada no spec+evidência, ética de preço, compliance de saúde. Reprovado → 1 retry com
o ajuste apontado; 2º fracasso escala ao usuário.

### 6. ⏸ G-ideia (gate humano)
Apresentar o blueprint + o **orçamento de validação** (de `funcao-objetivo.md`) e pedir:
```
Produto "<nome>" desenhado e aprovado pela marca, status em-validação.
Validar custa: <orçamento de experimento>.
- "sim" → libero para /validar-produto
- "ajustar <campo>: <valor>" → reabro a arquitetura
- "cancelar" → mantenho como oportunidade, sem validar
```
Autonomia `automatico_com_revisao` (ver `governanca.yaml` → `validacao-produto`).

### 7. Relatório inline
```
Produto criado: "<nome>" — catalogo.md (status em-validação).
Verdade: <slug> · pilar: <X> · preço proposto: <faixa>.
Próximo: /validar-produto <slug>
```

## Notas operacionais
- **Sem write-back de `registro-angulos`** — esta skill não produz peça de conteúdo.
- A skill **não escreve** no catálogo — o owner (`estrategista-produto`) escreve. A skill orquestra e enfileira pedidos de pesquisa.
- Ancora no cérebro existente (opção 1 do spec). Voz direta do cliente = Sub-projeto B.

## Critério de conclusão
- `catalogo.md` tem o produto com status `em-validação` e blueprint completo.
- Gate `revisor-brand` aprovado.
- G-ideia resolvido pelo humano (liberado, ajustado ou cancelado).

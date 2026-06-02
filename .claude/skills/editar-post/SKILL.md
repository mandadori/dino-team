---
name: editar-post
description: Reabre um post já criado no Dino Editor para edição visual. Resolve o estilo a partir do briefing.md do post, sobe o editor naquele post e aguarda o usuário editar/salvar/exportar. Sintaxe - /editar-post <slug-ou-caminho>.
---

# /editar-post

Reabre um post existente no Dino Editor para edição visual.

## Fluxo

| Passo | Agente/Ação | Recebe (← passo) | Depende | Entrega |
|---|---|---|---|---|
| 1 | ⚙ resolver post | slug ou caminho | — | pasta do post |
| 2 | ⚙ resolver estilo | briefing.md ← 1 | 1 | caminho do estilo.md |
| 3 | ⏸ usuário | editor ← 2 | 2 | ok/salvar/exportar |
| 4 | ⚙ re-export (opcional) | — | 3 | PNGs atualizados |

## Sintaxe

```
/editar-post <slug-ou-caminho>
```

- **`<slug>`** — slug do post (ex: `2026-06-02-cansaco-disfarcado`) buscado em `export/conteudos/` recursivamente.
- **`<caminho>`** — caminho completo da pasta do post.

## Pipeline

### 1. Resolver pasta do post

Se o input bater com um caminho existente no filesystem, use-o diretamente.

Caso contrário, faça busca:

```bash
find export/conteudos -maxdepth 2 -type d -name "*<slug>*"
```

Se nenhum resultado: informe o usuário e pare. Se mais de um: liste e peça escolha.

### 2. Resolver estilo a partir do `briefing.md`

```bash
cat <pasta>/briefing.md | grep "Caminho do estilo:"
```

Se `briefing.md` existir e tiver `Caminho do estilo:`, use esse valor como `<estilo_path>`.

Se não existir ou o campo estiver ausente, tente:

```bash
cat <pasta>/briefing.md | grep "Estilo:"
```

Use o slug para montar o caminho: `templates/social-media/<formato>/estilos/<slug>/estilo.md`.

Se não conseguir resolver, informe o usuário e pergunte o caminho do `estilo.md`.

### 3. Subir o Dino Editor

Mostre ao usuário:

```
Post: <pasta>
Estilo: <estilo_path>
Slides: <lista de slide-N.html em design/>

Para editar, rode em outro terminal:

  npm run editor -- <pasta> --estilo <estilo_path>

Acesse http://localhost:4321 no navegador.
- Edite no canvas (arrastar, handles, texto inline, cor, fonte).
- "Salvar" grava slide-N.html + edits.json.
- "Exportar" (ou use o comando abaixo) gera PNGs.

Responda:
- "exportar" → exporto os slides atuais para PNG.
- "pronto" → encerrar sem re-exportar.
- "re-exportar" → mesmo que "exportar".
```

**Aguarde resposta.**

### 4. Re-export (opcional)

Se o usuário responder "exportar" ou "re-exportar":

```bash
node scripts/export-png.js <pasta>/
```

O script valida dimensões e contagem automaticamente.

Confirme ao usuário:

```
Re-export concluído: <N> PNGs em <pasta>/export/
```

Se quiser rodar a curadoria editorial novamente após edições substanciais, use `/novo-post` → etapa 11 diretamente, ou rode manualmente os revisores via agentes.

## Critério de conclusão

- O editor foi iniciado com a pasta e estilo corretos.
- Usuário confirmou "pronto" ou o re-export foi executado com sucesso.

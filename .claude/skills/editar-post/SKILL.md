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
| 3 | ⚙ sobe editor + ⏸ | pasta + estilo ← 2 | 2 | exportar/re-exportar/pronto |
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

### 3. Subir o Dino Editor e enviar o link (⏸)

A skill **sobe o editor sozinha** — como em /novo-post §Subir o Dino Editor (auto-start + health-check). O usuário nunca roda o backend.

```bash
lsof -ti tcp:4321 | xargs kill -9 2>/dev/null; \
npm run editor -- <pasta> --estilo <estilo_path> > /tmp/dino-editor.log 2>&1 &
```

Aguarde ~3s, confirme saúde (`curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/` → `200`) e apresente:

```
Post: <pasta>
Estilo: <estilo_path>
Slides: <lista de slide-N.html em design/>

O Dino Editor está no ar: abra http://localhost:4321 no navegador.
Edite no canvas, clique "Salvar". Quando pronto:
- "exportar" / "re-exportar" → re-exporto os PNGs (Passo 4)
- "pronto" → encerro sem re-exportar
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

Se quiser rodar a curadoria editorial novamente após edições substanciais, use `/novo-post §Design` / curadoria diretamente, ou rode manualmente os revisores via agentes.

## Critério de conclusão

- O editor foi iniciado automaticamente pela skill com a pasta e estilo corretos, e o link foi enviado ao usuário.
- Usuário confirmou "pronto" ou o re-export foi executado com sucesso.

# Integrations — scripts determinísticos

Owner único: agente `integrador-apis`. Scripts Node.js puros (sem LLM) que conectam o sistema a APIs externas. Chamados por skills quando o artefato está pronto **e** a política (`orquestracao/politicas/publicacao.yaml`) autoriza.

## Scripts

| Script | Faz | Status |
|---|---|---|
| `publish_instagram.js` | Publica um post (carrossel ou single) no Instagram via Graph API | v1 |

## Convenções

- **Determinístico.** Mesmo input → mesmo efeito. Sem chamar LLM de dentro do script.
- **Credenciais só via env.** Nada hardcoded. `.env` real nunca é commitado (ver `.gitignore`).
- **Idempotência.** Logs de sucesso em `.logs/` impedem republicação do mesmo slug.
- **Erro explícito.** Sem credencial → erro claro com o nome da env que falta.

## publish_instagram.js

```bash
# Dry-run (não chama a API; valida pasta, imagens e legenda):
node scripts/integrations/publish_instagram.js --post export/conteudos/carrossel/<data>-<slug>/ --dry-run

# Publicação real (exige env vars):
node scripts/integrations/publish_instagram.js --post export/conteudos/carrossel/<data>-<slug>/
```

**Input:** pasta do post com `export/*.png` (em ordem alfabética) + legenda em
`legenda.txt`/`legenda.md` ou no frontmatter `legenda:` de `briefing.md`.

**Env vars necessárias:**

| Var | O quê |
|---|---|
| `IG_USER_ID` | ID numérico do Instagram Business Account |
| `IG_ACCESS_TOKEN` | Token long-lived com escopo `instagram_content_publish` |
| `IG_IMAGE_BASE_URL` | **Base pública** onde as PNGs estão hospedadas |
| `IG_API_VERSION` | Opcional, default `v22.0` |

### ⚠️ Constraint da Graph API: imagem precisa de URL pública

A Instagram Graph API **não aceita upload de arquivo local** — ela busca a
imagem por `image_url` público. Por isso o script monta as URLs como
`${IG_IMAGE_BASE_URL}/<nome-do-arquivo>.png`. Antes de publicar, as PNGs da
pasta `export/` precisam estar acessíveis publicamente nessa base (ex: bucket
S3/R2, ou servidas pelo próprio site). Hospedar as imagens é pré-requisito
ainda **pendente** — sem isso, só o `--dry-run` roda.

### Autorização (como obter o token)

1. App no Meta for Developers com produtos *Instagram Graph API* + *Facebook Login*.
2. Conta Instagram Business vinculada a uma Página do Facebook.
3. Gerar token long-lived com escopos `instagram_basic` + `instagram_content_publish`.
4. `IG_USER_ID` = ID do Instagram Business Account (via `/me/accounts` → `instagram_business_account`).

## Logs

Cada execução real grava `.logs/publish_instagram-<slug>-<timestamp>.json` com input + response + status. `.logs/` é gitignored.

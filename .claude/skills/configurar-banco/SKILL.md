---
name: configurar-banco
description: Define qual pasta do Google Drive é o banco de imagens da marca. Lista as pastas do Drive via MCP, deixa o usuário escolher pelo nome e grava o pasta_raiz_id em orquestracao/banco-imagens.yaml. Use quando ainda não há banco configurado, ou para trocar a pasta-fonte. Requer o MCP do Drive (.mcp.json) autenticado.
---

# /configurar-banco

Aponta o banco de imagens da marca para uma pasta do Google Drive. Sem isso, o `/novo-post`
pula a seleção automática de imagem e o usuário dropa as fotos manualmente.

## Fluxo

| Passo | Ação | Entrega |
|---|---|---|
| 1 | Checar MCP do Drive | disponível ou orientação de setup |
| 2 | Listar pastas do Drive (MCP) | lista numerada |
| 3 | ⏸ usuário escolhe | folder ID |
| 4 | Gravar no YAML | `pasta_raiz_id` atualizado |

## Pipeline

### 1. Checar o MCP do Drive

Verifique se há tools do MCP `google-drive` disponíveis. Se não houver, oriente:

```
O MCP do Google Drive não está disponível. Confira:
- .mcp.json contém o servidor "google-drive".
- Reabra o Claude Code para carregar o .mcp.json e aprove o servidor.
- Rode `claude mcp list` e conclua o login OAuth no primeiro uso.
```

E pare (sem gravar nada).

### 2. Listar pastas do Drive

Use a tool de listagem/busca do MCP para listar pastas (`mimeType = 'application/vnd.google-apps.folder'`),
começando pela raiz e nas subpastas relevantes. Apresente numerado:

```
Pastas no seu Drive:
1. Dino Team / Banco de Imagens   (id: 1AbC...)
2. Dino Team / Bastidores         (id: 1DeF...)
3. ...

Qual é o banco de imagens da marca? (número, ou cole um ID/URL)
```

### 3. Escolha do usuário (⏸)

Aceite: número da lista, um folder ID cru, ou uma URL
`https://drive.google.com/drive/folders/<ID>` (extraia o trecho após `/folders/`, antes de `?`).
Resolva para `pasta_raiz_id`.

### 4. Gravar em orquestracao/banco-imagens.yaml

Se o arquivo não existir, crie-o com o bloco `descanso_por_canal` default
(instagram 60, email 30, blog 30, ads 0). Em qualquer caso, edite **só** a linha
`pasta_raiz_id:` dentro do bloco `drive:`, preservando o resto:

```yaml
drive:
  pasta_raiz_id: "<ID escolhido>"
```

Confirme inline:

```
Banco apontado para: <nome da pasta> (id: <ID>)
Gravado em orquestracao/banco-imagens.yaml.
Agora o /novo-post seleciona imagens automaticamente desse Drive.
```

## Critério de conclusão

- `orquestracao/banco-imagens.yaml` existe e tem `drive.pasta_raiz_id` não-vazio.
- O usuário viu a confirmação com o nome e o ID da pasta.

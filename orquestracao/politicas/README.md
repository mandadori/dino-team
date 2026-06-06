# Políticas declarativas — Dino Team

Regras de governança que o sistema consulta antes de cada ação sensível. Formato YAML declarativo.

## Arquivos

- `publicacao.yaml` — quando uma skill pode chamar tool de publicação sem confirmação humana e quando precisa pedir.

## Como uma skill consulta a política

1. Antes de chamar `publish_*.js`, a skill carrega `dados/politicas/publicacao.yaml`.
2. Avalia cada regra em ordem; primeira regra cuja `condicao` casa decide.
3. Se `modo: automatico` → chama o script imediatamente, mas registra "janela de aborto" — humano pode cancelar nesse prazo.
4. Se `modo: aprovacao_humana` → pausa o pipeline, escala para o canal declarado em `escala:`.

## Como humano consulta/edita

- Dashboard: rota `/admin/dashboard/politicas/` (futuro) mostra políticas vivas.
- Edição direta: editar este arquivo e commitar; mudança vale na próxima execução. **Mudança em política exige commit explícito do humano; agentes não auto-modificam políticas.**

## Quando mudar uma política

Quando a regra atual está causando atrito (humano aprovando sempre o mesmo caso) ou risco (algo passou que não deveria). Inclua no commit a motivação:

```
docs(politicas): libera ads <= R$200 como automatico

O usuário aprovou os últimos 10 ads <= R$200 sem ajuste. Mover esses para
modo automatico com janela de aborto de 30 min.
```

## Schema das regras

```yaml
publicacao:
  defaults:
    modo: aprovacao_humana | automatico
  regras:
    - id: <slug-único>
      condicao: <expressão booleana — ver §Variáveis>
      modo: aprovacao_humana | automatico
      janela_aborto_minutos: <N>  # só quando modo=automatico
      escala: <canal>             # só quando modo=aprovacao_humana
      motivo: <texto>             # opcional, explica a regra
  iteracao:
    limite_revisao: <N>
    timeout_humano_horas: <N>
    fallback_timeout: pausar | abortar | publicar
```

## Variáveis disponíveis nas condições

- `artefato.canal`: instagram | meta-ads | email | whatsapp | web
- `artefato.contem_termo(<termo>)`: bool
- `briefing.pilar`: id de pilares-conteudo.md
- `briefing.orcamento_brl`: número
- `briefing.objetivo`: texto

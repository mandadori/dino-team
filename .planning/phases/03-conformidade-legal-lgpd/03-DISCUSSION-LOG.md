# Phase 3: Conformidade Legal & LGPD - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 03-conformidade-legal-lgpd
**Areas discussed:** Conteúdo das páginas legais, Banner de consentimento, Escopo do consentimento

---

## Conteúdo das páginas legais

| Option | Description | Selected |
|--------|-------------|----------|
| Rascunho completo gerado agora | Claude gera draft com placeholders [RAZÃO SOCIAL], [CNPJ], [E-MAIL DO ENCARREGADO] | ✓ |
| Placeholder estruturado | Páginas com seções marcadas para preencher | |

**User's choice:** Rascunho completo gerado agora
**Notes:** Dados jurídicos indisponíveis no momento — usar placeholders marcados para substituição posterior.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Design editorial da marca | Header fixo + footer da landing, fundo preto, Anton/Montserrat | ✓ |
| Página utilitária simples | Fundo branco, sem header/footer do site | |

**User's choice:** Design editorial da marca
**Notes:** Páginas /privacidade e /termos devem ser visualmente coerentes com o resto do site.

---

## Banner de consentimento

| Option | Description | Selected |
|--------|-------------|----------|
| Barra inferior full-width | Faixa discreta fixada na base da tela | ✓ |
| Card bottom-right | Caixa pequena no canto inferior direito | |
| Modal central | Bloqueia interação até decidir | |

**User's choice:** Barra inferior full-width

---

| Option | Description | Selected |
|--------|-------------|----------|
| Aceitar + Recusar | Dois botões explícitos; Recusar pode ser estilo link | ✓ |
| Aceitar + link sutil 'Continuar sem aceitar' | Botão primário + texto link discreto | |
| Só Aceitar | Não recomendado — viola LGPD | |

**User's choice:** Aceitar + Recusar

---

| Option | Description | Selected |
|--------|-------------|----------|
| Some definitivamente | Banner desaparece, tracking não dispara; sem link de gestão posterior | ✓ |
| Pode mudar depois — link no footer | Link 'Ger. cookies' no footer permite revisar escolha | |

**User's choice:** Some definitivamente

---

| Option | Description | Selected |
|--------|-------------|----------|
| 6 meses | Padrão de mercado, equilibrado | ✓ |
| 1 ano | Menos atrito para usuários frequentes | |
| Só a sessão atual | Banner volta em todo novo acesso | |

**User's choice:** 6 meses

---

## Escopo do consentimento

| Option | Description | Selected |
|--------|-------------|----------|
| Só os 3 tracking scripts | GA4, Meta Pixel, Clarity gatekeados; resto do site sem interferência | ✓ |
| Tracking + cookies de terceiro futuros | Estrutura mais genérica para novas ferramentas | |

**User's choice:** Só os 3 tracking scripts

---

| Option | Description | Selected |
|--------|-------------|----------|
| Você decide | Delega Context Provider vs prop ao executor | ✓ |
| React Context em layout.tsx | ConsentContext wrapping body | |

**User's choice:** Você decide (Claude's Discretion)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, com link para /privacidade | Padrão LGPD: usuário acessa política antes de consentir | ✓ |
| Não — links ficam só no footer | Mais simples, menos rigoroso juridicamente | |

**User's choice:** Sim, com link para /privacidade

---

## Discussão adicional: banner de consentimento vs alternativas

Antes de confirmar o banner, o usuário questionou se era necessário e se havia alternativa sem banner. Foi explicado:
- Sem banner: possível se usar analytics privacy-first (Plausible/Fathom/Umami) que não coletam dados pessoais
- Com analytics GA4/Pixel/Clarity: banner obrigatório pela LGPD
- Usuário confirmou manter GA4/Pixel/Clarity com banner de consentimento (opção 1)

---

## Claude's Discretion

- Implementação técnica do estado de consentimento (Context Provider vs prop)
- Mecanismo de persistência (localStorage vs cookie de primeira parte)
- Copy exata do banner (sóbria, dentro do tom de marca)
- Nome do componente CookieBanner
- Animação de entrada/saída do banner

## Deferred Ideas

- Link "Gerenciar cookies" no footer — usuário optou por escolha definitiva
- Categorias granulares de cookies — complexidade desnecessária agora
- Analytics privacy-first como alternativa sem banner — discutido e descartado

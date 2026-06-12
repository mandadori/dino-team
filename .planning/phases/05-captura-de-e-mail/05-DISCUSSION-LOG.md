# Phase 5: Captura de E-mail - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-12
**Phase:** 05-captura-de-e-mail
**Areas discussed:** Integração Resend, Posicionamento, Consentimento & validação, Sucesso/erro & feedback

---

## Integração Resend

### Status da conta Resend
| Option | Description | Selected |
|--------|-------------|----------|
| Tenho conta + audience | Audience pronta, passa o ID + chave; ship de ponta a ponta | |
| Conta, sem audience | Cria a audience durante a fase | |
| Ainda não tenho | Construir env-gated (chaves vazias = estado neutro), preenche antes do deploy | ✓ |

### Modelo de lista
| Option | Description | Selected |
|--------|-------------|----------|
| Audience/Contacts (Rec.) | Adiciona contato a uma audience; lista real pra nutrir (NEWS-01 futuro) | ✓ |
| Só envio transacional | Dispara notificação, sem manter lista | |

### Opt-in
| Option | Description | Selected |
|--------|-------------|----------|
| Single opt-in (Rec.) | Entra direto na lista; checkbox cobre a base legal LGPD | ✓ |
| Double opt-in | E-mail de confirmação + rota /confirmar + estado pendente | |

**User's choice:** Env-gated build + Audiences/Contacts API + single opt-in.
**Notes:** Sem conta ainda — chaves `RESEND_API_KEY`/`RESEND_AUDIENCE_ID` vazias não devem bloquear o build; usuário cria a audience e preenche antes do deploy (blocker declarado).

---

## Posicionamento

### Ordem vs CTA WhatsApp
| Option | Description | Selected |
|--------|-------------|----------|
| Antes do CTA WhatsApp (Rec.) | Relacionados → form → CTA WhatsApp (WhatsApp fecha) | |
| Depois do CTA WhatsApp | Form é o último bloco do artigo | ✓ |
| Você decide | Executor posiciona pela hierarquia | |

### Escopo
| Option | Description | Selected |
|--------|-------------|----------|
| Só nos artigos (Rec.) | Apenas /blog/[slug] | |
| Artigos + final da /blog | Também no rodapé da listagem | ✓ |

**User's choice:** Form depois do CTA WhatsApp (último bloco do artigo) E no final da listagem /blog → componente compartilhado.
**Notes:** O e-mail não compete com o WhatsApp; é uma seção sóbria própria.

---

## Consentimento & validação

### Gate de consentimento
| Option | Description | Selected |
|--------|-------------|----------|
| Botão ativo + erro inline (Rec.) | Erro acessível (aria-live, foco no checkbox) ao enviar sem marcar | ✓ |
| Botão desabilitado até marcar | Botão inerte; não comunica o motivo (anti-padrão a11y) | |

### Validação de e-mail
| Option | Description | Selected |
|--------|-------------|----------|
| Nativa HTML5 + servidor (Rec.) | type=email + required no cliente, revalidação no Server Action | ✓ |
| Só no servidor | Sem barreira no cliente; feedback só após round-trip | |

**User's choice:** Botão sempre ativo com erro inline acessível; validação HTML5 nativa + revalidação no servidor.
**Notes:** Checkbox desmarcado por padrão, link para /privacidade; é consentimento de processamento de dados do form, distinto do cookie consent da Fase 3.

---

## Sucesso/erro & feedback

### Apresentação do sucesso
| Option | Description | Selected |
|--------|-------------|----------|
| Form vira mensagem (Rec.) | Form substituído por confirmação no mesmo espaço (aria-live, foco) | ✓ |
| Mensagem abaixo do form | Form continua visível, mensagem aria-live abaixo | |

### E-mail já inscrito
| Option | Description | Selected |
|--------|-------------|----------|
| Tratar como sucesso (Rec.) | Mesma mensagem; não revela existência do e-mail | ✓ |
| Mensagem distinta | Aviso "você já estava inscrito" | |

### Sem chave configurada
| Option | Description | Selected |
|--------|-------------|----------|
| Esconder o form (Rec.) | Seção não renderiza sem chave; reaparece ao preencher env | ✓ |
| Mostrar + erro gracioso | Form visível mas envio devolve erro genérico | |

**User's choice:** Sucesso substitui o form (aria-live + foco); já-inscrito = sucesso; sem chave Resend → seção escondida.
**Notes:** Garante preview/CI limpos enquanto a env não está preenchida.

---

## Claude's Discretion

- Copy/tom exato do form (heading, subtexto, label do checkbox, botão, mensagens) — seguindo `brand/tom-de-voz.md`.
- Anti-spam do endpoint público (honeypot / rate-limit básico) — sem CAPTCHA de terceiro.
- Estrutura técnica do estado do form (`useActionState`/`useFormStatus` vs `useState`).
- Nomes do componente e do arquivo do Server Action.
- Design visual do bloco (resolvido no UI-SPEC + referências visuais da marca).

## Deferred Ideas

- LEAD-03 — lead magnet contextual ("guia de direção") — v2.
- NEWS-01 — newsletter com cadência editorial — v2.
- Double opt-in (confirmação por e-mail) — descartado nesta fase, revisitável por deliverability.
- Form na landing/home — fora de escopo; captura é pós-conteúdo do blog.

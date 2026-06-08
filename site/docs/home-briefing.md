# Briefing institucional — Home Dino Team

> **Nota de processo:** este briefing seguiria o agente `briefing-writer` (Marketing/Estratégia), que consulta `memory/ramon/contexto.md` e `memory/performance/registro-angulos.md`. Como o registro de agentes do Claude Code carrega no startup, o `briefing-writer` não resolve na mesma sessão em que foi criado/alterado — este briefing foi redigido seguindo o schema canônico dele + brand book + spec do site. Numa sessão nova, rode `/novo-site` para regerá-lo via pipeline.
> **Sinalização do banco:** `memory/ramon/contexto.md` está em template (fase atual ainda não definida). Briefing produzido **sem o sinal de fase** — quando o slice for populado via `/atualizar-ramon`, revisar o tom à luz da fase do Ramon.

## Estratégia

**Formato:** site (home única — landing de consultoria)
**Objetivo:** vender a consultoria Dino Team. CTA primário = contato qualificado via WhatsApp; storytelling + design carregam credibilidade (CTA secundário implícito).
**Pilar dominante:** Autoridade (Pilar 4) — Ramon como prova viva — sustentado por Transformação/Conversão (Pilar 5) e Educacional (Pilar 1).
**Recorte de público:** homem 18–40 que **já treina mas não evolui** — frustrado com falta de progresso, sem consistência, sem direção técnica, e que sente que está sozinho no processo.
**Ângulo central:** *o método que tirou o Ramon do zero absoluto (calistenia em praça no Acre, sem dinheiro, sem suplemento) ao topo mundial (Mr. Olympia 2025) agora está disponível, adaptado, para você.* Não é mais uma consultoria fitness — é o método de um campeão mundial. **Vende direção, não atalho.**

**Tom:** direto, autoritário (sem arrogância), prático. Mentor de alta performance que já passou pelo caminho. Frases curtas, cada uma com propósito. Segunda pessoa ("você"). Sem promessa de prazo/número, sem motivação vazia, sem vitimismo.

**Tabu (não pode aparecer):** promessa de resultado em prazo X; "atalho"/"fórmula"/"transformação rápida"; clichê fitness solto; superlativo vazio; qualquer cor fora de preto/branco/cinza.

---

## As 7 seções

### 1. Hero
- **Propósito:** fisgar em 3 segundos com a proposta única + CTA primário.
- **Copy:**
  - Olho (tag): `CONSULTORIA DE TREINO E DIETA`
  - Headline (Anton, caixa alta): **"O MÉTODO DO CAMPEÃO, APLICADO EM VOCÊ."**
  - Sub: "Do zero absoluto ao topo mundial. O mesmo nível de estratégia, disciplina e consistência de Ramon Dino — adaptado pra sua realidade."
  - CTA primário: **"Quero minha consultoria"** → WhatsApp.
  - Apoio: "Você não precisa de motivação. Precisa de direção."
- **Visual:** preto dominante, foto do Ramon (palco/treino) com overlay gradiente; headline gigante. Placeholder enquanto o acervo não entra.

### 2. Para quem é
- **Propósito:** qualificar — filtrar curioso de cliente real; gerar identificação pela dor.
- **Copy:** título "PRA QUEM É (E PRA QUEM NÃO É)". Duas colunas:
  - **É pra você se:** já treina mas não evolui; cansou de testar coisa sem resultado; quer direção clara, não mais informação solta; aceita que resultado exige disciplina.
  - **Não é pra você se:** procura atalho ou fórmula mágica; quer resultado sem mudar hábito; não está disposto a seguir um processo.
- **Visual:** duas colunas em alto contraste (✓ branco / ✗ cinza). Sem CTA.

### 3. Método
- **Propósito:** mostrar o "como" — os pilares e o que está incluso, ancorado em método (não promessa).
- **Copy:** título "NÃO É ACHISMO. É MÉTODO." Quatro princípios: Direção > esforço; Disciplina é fazer mesmo sem vontade; Consistência vence intensidade; Resultado vem de execução. + o que compõe: anamnese inicial, protocolo individual (treino+dieta), biblioteca de execução, check-shape mensal, suporte humanizado, Comunidade Dino Team.
- **Visual:** grid de cards (surface #0c0c0c, borda #1f1f1f). Ícones Lucide minimalistas.

### 4. Resultados
- **Propósito:** prova social com números animados; mostrar que funciona para pessoas comuns.
- **Copy:** título "O MÉTODO FUNCIONA — E TEM PROVA." Métricas animadas (contador): seguidores, alunos, anos de trajetória, etc. + espaço para depoimentos/antes-e-depois (placeholder até ter material real).
- **Visual:** números grandes em Anton contando ao entrar no viewport (Framer Motion). Cards de transformação como placeholders.

### 5. Sobre Ramon
- **Propósito:** narrativa do zero ao topo — credibilidade que nenhuma consultoria genérica tem.
- **Copy:** título "DO ACRE AO TOPO DO MUNDO." Narrativa curta: calistenia em praça, sem dinheiro/academia/suplemento → anos errando, ajustando, adaptando → Arnold Classic 2023 → Mr. Olympia 2025, primeiro brasileiro a vencer. Fecho: "Não é teoria. É o caminho que ele andou — e agora te mostra."
- **Visual:** foto editorial P&B do Ramon (placeholder) + timeline de conquistas.

### 6. FAQ
- **Propósito:** derrubar objeções principais.
- **Copy (accordion):**
  - "Funciona pra iniciante?" → Sim. O método se adapta do iniciante ao avançado — o que muda é o ponto de partida, não a lógica.
  - "Quanto tempo até ver resultado?" → Não vendemos prazo. Vendemos direção e método. Resultado vem da execução consistente — e a consultoria encurta o caminho.
  - "Preciso de academia/suplemento?" → O protocolo é individual e parte da sua realidade. Ramon começou sem nada disso.
  - "Como funciona na prática?" → Anamnese → protocolo individual → biblioteca de execução → check-shape mensal → suporte + comunidade.
  - "É o Ramon que me acompanha?" → É o método e o padrão dele, aplicado pela equipe Dino Team com suporte humanizado.
- **Visual:** accordion acessível (teclado + ARIA).

### 7. CTA final
- **Propósito:** fechar.
- **Copy:** título "A ESCOLHA É SUA. O CAMINHO TÁ AQUI." Sub: "Quem tem direção evolui. Quem não tem, repete." CTA: **"Começar minha consultoria"** → WhatsApp. Microcopy: "Sem fórmula mágica. Método, direção e um ambiente que te puxa pra cima."
- **Visual:** seção de fechamento de alto impacto, inversão de contraste possível (branco sobre preto / bloco branco).

---

## Sinalizações para o pipeline
- **copy/design:** caixa alta (Anton) só em títulos/headlines; corpo em Montserrat caixa normal para leitura web. Monocromático estrito.
- **CTA:** destino WhatsApp — número/URL real é **pendência do usuário** (placeholder via env `NEXT_PUBLIC_WHATSAPP_URL` por enquanto).
- **imagens:** acervo do Ramon ainda não está no repo (pendência declarada em `referencias-visuais.md`) — usar placeholders monocromáticos intencionais, nunca stock.
- **tabu:** nenhuma promessa de prazo/número; nenhuma cor fora da paleta.

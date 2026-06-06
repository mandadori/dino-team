import { Reveal } from "@/components/Reveal";

const PRINCIPIOS = [
  {
    numero: "01",
    titulo: "Direção > esforço",
    texto:
      "Sem direção, esforço vira perda de tempo. O método define o caminho certo antes de você colocar um pé na academia.",
  },
  {
    numero: "02",
    titulo: "Consistência vence intensidade",
    texto:
      "Pequenas ações todos os dias geram o resultado. Não é sobre fazer mais — é sobre parar de errar o alvo.",
  },
  {
    numero: "03",
    titulo: "Disciplina é fazer mesmo sem vontade",
    texto:
      "É aí que o jogo muda. A desculpa é o que te mantém no mesmo lugar. O método fecha essa brecha.",
  },
  {
    numero: "04",
    titulo: "Resultado vem de execução",
    texto:
      "Não de motivação. Quem aceita o processo muda de verdade. Quem espera inspiração fica igual.",
  },
];

const INCLUI = [
  "Anamnese inicial",
  "Protocolo individual (treino + dieta)",
  "Biblioteca de execução dos exercícios",
  "Check-shape mensal",
  "Suporte humanizado",
  "Comunidade Dino Team (WhatsApp)",
];

export function Metodo() {
  return (
    <section className="border-t border-line px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
            Não é achismo. É método.
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-5 max-w-2xl font-body text-lg text-muted">
            O mesmo nível de estratégia do fisiculturismo de elite, traduzido em
            um processo replicável pra qualquer pessoa disposta a aplicar.
          </p>
        </Reveal>

        {/* Passos editoriais numerados */}
        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {PRINCIPIOS.map((p, i) => (
            <Reveal key={p.titulo} delay={0.06 * i}>
              <div className="h-full bg-bg p-8">
                <p
                  className="font-display text-5xl uppercase leading-none text-muted sm:text-6xl"
                  aria-hidden
                >
                  {p.numero}
                </p>
                <h3 className="mt-4 font-display text-2xl uppercase leading-tight">
                  {p.titulo}
                </h3>
                <p className="mt-3 font-body text-muted">{p.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bloco branco pontual (D-01) — único bloco de fundo branco da página inteira.
            Texto primário via --color-fg-on-light; secundário via --color-muted-on-light (#595959, ≥4.5:1 sobre branco).
            NUNCA usar text-muted (#7f7f7f) aqui — falha AA sobre branco (~3.5:1). */}
        <Reveal delay={0.1}>
          <div className="mt-px border-x border-b border-line bg-white px-8 py-8">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-muted-on-light)]">
              O que compõe a consultoria
            </p>
            <ul className="mt-5 flex flex-wrap gap-3">
              {INCLUI.map((item) => (
                <li
                  key={item}
                  className="border border-black/15 px-4 py-2 font-body text-sm text-[var(--color-fg-on-light)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { Compass, Repeat, Flame, Target } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const PRINCIPIOS = [
  { icon: Compass, titulo: "Direção > esforço", texto: "Sem direção, esforço vira perda de tempo. O método define o caminho certo." },
  { icon: Repeat, titulo: "Consistência vence intensidade", texto: "Pequenas ações todos os dias geram o resultado. Não é sobre fazer mais." },
  { icon: Flame, titulo: "Disciplina é fazer mesmo sem vontade", texto: "É aí que o jogo muda. A desculpa é o que te mantém no mesmo lugar." },
  { icon: Target, titulo: "Resultado vem de execução", texto: "Não de motivação. Quem aceita o processo muda de verdade." },
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
    <section className="border-t border-line px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl uppercase leading-tight md:text-6xl">
            Não é achismo. É método.
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-5 max-w-2xl font-body text-lg text-muted">
            O mesmo nível de estratégia do fisiculturismo de elite, traduzido em
            um processo replicável pra qualquer pessoa disposta a aplicar.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {PRINCIPIOS.map((p, i) => (
            <Reveal key={p.titulo} delay={0.06 * i}>
              <div className="h-full bg-bg p-8">
                <p.icon className="size-7 text-fg" aria-hidden />
                <h3 className="mt-5 font-display text-2xl uppercase leading-tight">
                  {p.titulo}
                </h3>
                <p className="mt-3 font-body text-muted">{p.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              O que compõe a consultoria
            </p>
            <ul className="mt-5 flex flex-wrap gap-3">
              {INCLUI.map((item) => (
                <li
                  key={item}
                  className="border border-line px-4 py-2 font-body text-sm text-fg"
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

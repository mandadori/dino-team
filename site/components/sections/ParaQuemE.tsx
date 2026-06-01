import { Check, X } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const PRA_VOCE = [
  "Você já treina, mas não evolui como queria.",
  "Cansou de testar coisa solta sem resultado.",
  "Quer direção clara, não mais informação jogada.",
  "Aceita que resultado exige disciplina e processo.",
];

const NAO_E = [
  "Procura atalho, fórmula mágica ou transformação rápida.",
  "Quer resultado sem mudar hábito nenhum.",
  "Não está disposto a seguir um método.",
];

export function ParaQuemE() {
  return (
    <section className="border-t border-line px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
            Pra quem é
            <span className="text-muted"> (e pra quem não é)</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
          <Reveal delay={0.08}>
            <div className="h-full bg-bg p-8">
              <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                É pra você se
              </p>
              <ul className="mt-6 space-y-5">
                {PRA_VOCE.map((item) => (
                  <li key={item} className="flex gap-3 font-body text-muted">
                    <Check className="mt-0.5 size-5 shrink-0 text-fg" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="h-full bg-surface p-8">
              <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                Não é pra você se
              </p>
              <ul className="mt-6 space-y-5">
                {NAO_E.map((item) => (
                  <li key={item} className="flex gap-3 font-body text-muted">
                    <X className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

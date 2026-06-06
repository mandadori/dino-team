import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { PLANS } from "@/lib/site";

// Tonalidade dos cards: "base" (bg-bg) e "elevado" (bg-surface).
// Distinção tonal, nunca cromática. Sem badge "popular", sem cor de destaque (D-09).
const CARD_BG: ReadonlyArray<string> = ["bg-bg", "bg-surface"];

export function Planos() {
  return (
    <section className="border-t border-line px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
            Escolha sua direção.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={0.08 * i}>
              {/* flex flex-col + mt-auto no CTA garante altura igual entre cards */}
              <div
                className={`flex h-full flex-col border border-line p-8 ${CARD_BG[i % CARD_BG.length]}`}
              >
                {/* Nome do plano (H3) — sub-bloco, não título de seção */}
                <h3 className="font-body text-base font-semibold uppercase tracking-wider text-muted">
                  {p.name}
                </h3>

                {/* Preço — anchor visual do card, Anton em destaque */}
                <p className="mt-4 font-display text-5xl uppercase leading-none sm:text-6xl">
                  {p.price}
                </p>

                {/* Lista de inclusos — semântica <ul>/<li> */}
                <ul className="mt-8 flex flex-col gap-3">
                  {p.includes.map((item) => (
                    <li
                      key={item}
                      className="font-body text-base text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA fixado à base do card via mt-auto */}
                <div className="mt-auto pt-8">
                  <CTAButton
                    href={p.whatsappUrl}
                    className="w-full justify-center"
                  >
                    Quero o Plano {p.name}
                  </CTAButton>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

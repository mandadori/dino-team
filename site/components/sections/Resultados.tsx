import { Reveal } from "@/components/Reveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { STATS } from "@/lib/site";

export function Resultados() {
  return (
    <section className="border-t border-line px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
            O método funciona — e tem prova.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={0.08 * i}>
              <div className="h-full bg-bg p-8 text-center">
                <p className="font-display text-5xl uppercase leading-none sm:text-6xl">
                  <AnimatedCounter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-4 font-body text-sm text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

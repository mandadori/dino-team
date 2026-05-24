import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { WHATSAPP_URL } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Fundo: lugar da foto P&B do Ramon (acervo ainda não disponível).
          Por ora, profundidade via gradiente — nunca stock photo. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#161616_0%,#000_60%)]"
      />
      {/* Watermark DINO gigante, baixa opacidade */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 bottom-[-6vw] select-none font-display text-[34vw] leading-none text-fg/[0.04] md:text-[28vw]"
      >
        DINO
      </span>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-28">
        <Reveal>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            Consultoria de treino e dieta
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-4xl font-display text-5xl uppercase leading-[0.95] sm:text-6xl md:text-8xl">
            O método do campeão, aplicado em você.
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-8 max-w-xl font-body text-lg text-muted">
            Do zero absoluto ao topo mundial. O mesmo nível de estratégia,
            disciplina e consistência de Ramon Dino — adaptado pra sua realidade.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <CTAButton href={WHATSAPP_URL}>Quero minha consultoria</CTAButton>
            <p className="font-body text-sm uppercase tracking-wide text-muted">
              Você não precisa de motivação.{" "}
              <span className="text-fg">Precisa de direção.</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

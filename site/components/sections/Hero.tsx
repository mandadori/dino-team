import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { RamonPhoto } from "@/components/RamonPhoto";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { WHATSAPP_URL } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Fundo foto-conduzido: RamonPhoto full-bleed P&B + scrim obrigatório (D-06).
          Placeholder monocromático intencional enquanto o acervo não chega (D-04).
          Envolvido em ParallaxImage para parallax leve via GSAP (D-08). */}
      <ParallaxImage>
        <RamonPhoto
          src="/ramon/hero.jpg"
          alt="Ramon Dino em preto e branco, alto contraste"
          priority
          scrim="hero"
          className="absolute inset-0"
        />
      </ParallaxImage>

      {/* Conteúdo de texto acima do scrim */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-28">
        <Reveal>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            Consultoria Ramon Dino
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-4xl font-display text-5xl uppercase leading-[0.95] lg:text-7xl">
            O topo exige direção.
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
            <CTAButton href={WHATSAPP_URL}>Quero minha direção</CTAButton>
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

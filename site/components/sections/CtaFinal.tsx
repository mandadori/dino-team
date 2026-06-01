import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { WHATSAPP_URL } from "@/lib/site";

export function CtaFinal() {
  return (
    <section className="border-t border-line px-6 py-28 md:py-40">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          {/* Fecho on-brand distinto do H1 do Hero (que já usa o sign-off).
              Âncora no princípio central da marca: consistência + direção (brand-book). */}
          <h2 className="font-display text-5xl uppercase leading-[0.95] lg:text-7xl">
            Consistência vence. Direção define.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-6 max-w-xl font-body text-lg text-muted">
            Quem tem direção evolui. Quem não tem, repete. Método, direção e um
            ambiente que te puxa pra cima — sem fórmula mágica.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-10 flex justify-center">
            <CTAButton href={WHATSAPP_URL}>Quero minha direção</CTAButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

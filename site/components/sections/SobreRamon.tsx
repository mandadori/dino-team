import { Reveal } from "@/components/Reveal";
import { RamonPhoto } from "@/components/RamonPhoto";
import { TIMELINE } from "@/lib/site";

export function SobreRamon() {
  return (
    <section className="border-t border-line px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2 md:gap-20">
        {/* Coluna visual — retrato editorial P&B do Ramon (foto-conduzido, RDSN-02).
            RamonPhoto cuida do role="img"/aria-label e do placeholder intencional (D-04).
            Sem priority: não é LCP (fica lazy). */}
        <Reveal>
          <RamonPhoto
            src="/ramon/retrato.jpg"
            alt="Retrato de Ramon Dino em preto e branco"
            scrim="portrait"
            className="aspect-[4/5] border border-line"
          />
        </Reveal>

        <div className="flex flex-col justify-center">
          <Reveal>
            <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
              Do Acre ao topo do mundo.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 font-body text-lg text-muted">
              Ramon começou treinando calistenia em praças — um dos estados mais
              improváveis do Brasil no esporte. Sem dinheiro, sem academia, sem
              suplemento. Evoluiu errando, ajustando e se adaptando à própria
              realidade, até chegar ao mais alto nível do fisiculturismo mundial.
            </p>
          </Reveal>

          <ol className="mt-10 space-y-6">
            {TIMELINE.map((t, i) => (
              <li key={t.marco} className="border-l border-line pl-5">
                <Reveal delay={0.06 * i}>
                  <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-fg">
                    {t.marco}
                  </p>
                  <p className="mt-2 font-body text-muted">{t.texto}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={0.1}>
            <p className="mt-10 font-display text-2xl uppercase leading-tight md:text-3xl">
              Não é teoria. É o caminho que ele andou — e agora te mostra.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

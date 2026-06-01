import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { TESTIMONIALS } from "@/lib/site";

/**
 * Seção de Depoimentos de alunos — RSC (sem "use client").
 *
 * Gate editorial (D-11): filtra publishable === true antes de renderizar.
 * Na era de placeholder, TESTIMONIALS tem todos publishable: false, portanto
 * a grade fica vazia intencionalmente. Comportamento CORRETO: sem card vazio,
 * sem skeleton, sem "em breve". A seção exibe apenas o heading enquanto
 * nenhum depoimento real é publicável — a grade aparece quando o conteúdo
 * real chegar via lib/site.ts.
 *
 * Avatar (D-12): se t.photo ausente → placeholder monocromático intencional
 * copiando o padrão src-ausente de RamonPhoto. Deliberado, nunca quebrado.
 */
export function Depoimentos() {
  // D-11 — gate editorial: só renderiza itens com publishable: true.
  // Era de placeholder: visible.length === 0 → grade vazia é o comportamento correto.
  const visible = TESTIMONIALS.filter((t) => t.publishable);

  return (
    <section className="border-t border-line px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
            Quem executa, transforma.
          </h2>
        </Reveal>

        {/* Grade de depoimentos — 3 colunas no desktop, empilhado no mobile (D-13).
            Na era de placeholder: grade vazia (zero cards). Correto e intencional.
            Sem "em breve", sem skeleton, sem card vazio. */}
        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {visible.map((t, i) => (
            <Reveal key={t.name} delay={0.08 * i}>
              <div className="flex h-full flex-col bg-surface p-8">
                {/* Avatar — D-12: placeholder monocromático intencional se foto ausente */}
                {t.photo ? (
                  <div className="relative mb-6 h-16 w-16 overflow-hidden border border-line">
                    <Image
                      src={t.photo}
                      alt={`Foto de ${t.name}`}
                      fill
                      sizes="64px"
                      className="object-cover grayscale contrast-125"
                    />
                  </div>
                ) : (
                  <div
                    role="img"
                    aria-label={t.name}
                    className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden border border-line bg-surface"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display text-2xl uppercase tracking-widest text-muted"
                    >
                      {t.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Nome em CAPS — identifica o aluno */}
                <p className="font-body text-sm font-semibold uppercase tracking-wider text-fg">
                  {t.name}
                </p>

                {/* Depoimento em 3 movimentos: contexto → mudança → resultado (CONV-02) */}
                <p className="mt-4 font-body text-base text-muted">
                  {t.context} {t.change} {t.result}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

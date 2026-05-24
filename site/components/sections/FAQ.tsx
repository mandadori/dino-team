"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Funciona pra iniciante?",
    a: "Sim. O método se adapta do iniciante ao avançado — o que muda é o ponto de partida, não a lógica. O protocolo é individual.",
  },
  {
    q: "Quanto tempo até ver resultado?",
    a: "A gente não vende prazo. Vende direção e método. Resultado vem da execução consistente — e a consultoria encurta o caminho, sem desperdício de tempo.",
  },
  {
    q: "Preciso de academia ou suplemento?",
    a: "O protocolo parte da sua realidade. Ramon começou sem nada disso — calistenia em praça. O método se adapta ao que você tem.",
  },
  {
    q: "Como funciona na prática?",
    a: "Anamnese inicial para entender sua rotina e objetivo → protocolo individual de treino e dieta → biblioteca de execução dos exercícios → check-shape mensal para ajustar → suporte humanizado e a Comunidade Dino Team.",
  },
  {
    q: "É o Ramon que me acompanha?",
    a: "É o método e o padrão dele, aplicado pela equipe Dino Team com suporte humanizado. O mesmo nível de estratégia, disciplina e consistência usado no fisiculturismo de elite.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-line px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-4xl uppercase leading-tight md:text-6xl">
          Perguntas que todo mundo faz
        </h2>

        <div className="mt-12">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    id={`faq-trigger-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left font-body text-lg font-medium text-fg transition-colors hover:text-muted"
                  >
                    <span>{f.q}</span>
                    {isOpen ? (
                      <Minus className="size-5 shrink-0" aria-hidden />
                    ) : (
                      <Plus className="size-5 shrink-0" aria-hidden />
                    )}
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 font-body text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

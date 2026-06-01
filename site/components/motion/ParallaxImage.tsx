"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Client island que aplica parallax leve (translate vertical) via GSAP (D-08).
 *
 * Constraints:
 * - Apenas translateY sutil — sem pin, sem scrub coreografado (D-08).
 * - Anima somente transform (nunca height/top — RESEARCH Pitfall 6, evita CLS).
 * - Sob prefers-reduced-motion: timeline NÃO é criada (gsap.matchMedia "no-preference").
 * - Em mobile: amplitude reduzida para evitar jank/CLS.
 * - NÃO importa three.js (D-10).
 *
 * As seções (RSC) importam este island — não o contrário. Nunca adicionar "use client"
 * à seção por causa deste componente (DSGN-05).
 */
export function ParallaxImage({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Parallax só quando o usuário NÃO pediu menos movimento.
      // A timeline nunca é criada sob reduced-motion (não basta acelerar — DSGN-03).
      mm.add(
        {
          // Desktop: amplitude completa
          isDesktop: "(prefers-reduced-motion: no-preference) and (min-width: 640px)",
          // Mobile: amplitude reduzida (evita jank em telas pequenas)
          isMobile: "(prefers-reduced-motion: no-preference) and (max-width: 639px)",
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };
          const yAmount = isDesktop ? 40 : 16;

          gsap.to(scope.current, {
            y: yAmount,
            ease: "none",
            scrollTrigger: {
              trigger: scope.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        },
      );
    },
    { scope },
  );

  return (
    <div ref={scope} className="relative will-change-transform">
      {children}
    </div>
  );
}

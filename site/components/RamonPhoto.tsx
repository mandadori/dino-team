import Image from "next/image";

/**
 * Slot de foto do Ramon — full-bleed P&B + scrim obrigatório.
 *
 * - Se `src` presente: renderiza next/image com grayscale+contrast-125 e
 *   overlay de scrim via token CSS (garantindo contraste AA do texto sobreposto, D-06).
 * - Se `src` ausente: placeholder monocromático intencional (D-04), não um estado de erro —
 *   o acervo é parcial; basta soltar o arquivo em public/ramon/ para a troca ser trivial (D-07).
 *
 * O componente é server-friendly (sem "use client"). A parallax fica em ParallaxImage.
 * O contêiner deve ser `relative overflow-hidden` com dimensões definidas pelo consumidor.
 */
export function RamonPhoto({
  src,
  alt,
  priority = false,
  scrim,
  className,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  scrim: "hero" | "portrait";
  className?: string;
}) {
  const scrimVar =
    scrim === "hero" ? "var(--scrim-hero)" : "var(--scrim-portrait)";

  if (src) {
    return (
      <div className={`overflow-hidden ${className ?? ""}`}>
        {/* Foto P&B: grayscale + contrast-125 para alto contraste mesmo se origem for colorida (D-05) */}
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          className="object-cover object-center grayscale contrast-125"
        />
        {/* Scrim obrigatório — não estético; garante ≥4.5:1 do texto sobreposto (D-06).
            Usa token CSS, nunca hex inline (RESEARCH Anti-Pattern). */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: scrimVar }}
        />
      </div>
    );
  }

  // Placeholder intencional: slot monocromático que parece deliberado, não quebrado (D-04, UI-SPEC §Copy).
  // Troca trivial: basta adicionar o arquivo em public/ramon/.
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex flex-col items-center justify-center overflow-hidden border border-line bg-surface ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="font-display text-2xl uppercase tracking-widest text-muted"
      >
        Foto do Ramon
      </span>
    </div>
  );
}

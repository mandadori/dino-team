import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline";

/**
 * CTA do site. Renderiza um link (os CTAs apontam para WhatsApp externo).
 * Monocromático: primary = branco sólido sobre preto; outline = contorno.
 * Hover scale via CSS puro — respeita reduced-motion via @media global (D-09/DSGN-03).
 * Focus ring monocromático no próprio elemento (DSGN-05 / Pitfall 7).
 */
export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const styles: Record<Variant, string> = {
    primary: "bg-fg text-bg hover:bg-muted",
    outline: "border border-fg/40 text-fg hover:border-fg hover:bg-fg/5",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide",
        // transition-all covers both color and transform; avoids the conflict where
        // transition-transform would override transition-colors (both set transition-property).
        "transition-all duration-200",
        // Microinteração de hover via CSS puro (D-09, RESEARCH A2): auto-respeita reduced-motion
        "hover:scale-[1.04]",
        // Focus ring monocromático — branco sobre fundo escuro (contextualizável via className)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg",
        styles[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}

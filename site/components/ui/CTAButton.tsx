import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline";

/**
 * CTA do site. Renderiza um link (os CTAs apontam para WhatsApp externo).
 * Monocromático: primary = branco sólido sobre preto; outline = contorno.
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
        "inline-flex items-center justify-center gap-2 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wide transition-colors duration-200",
        styles[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}

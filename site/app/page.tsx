import { Hero } from "@/components/sections/Hero";
import { ParaQuemE } from "@/components/sections/ParaQuemE";
import { Metodo } from "@/components/sections/Metodo";
import { Resultados } from "@/components/sections/Resultados";
import { SobreRamon } from "@/components/sections/SobreRamon";
import { Depoimentos } from "@/components/sections/Depoimentos";
import { Comunidade } from "@/components/sections/Comunidade";
import { Planos } from "@/components/sections/Planos";
import { FAQ } from "@/components/sections/FAQ";
import { CtaFinal } from "@/components/sections/CtaFinal";
import { CTAButton } from "@/components/ui/CTAButton";
import { WHATSAPP_URL } from "@/lib/site";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl uppercase tracking-wide">
            Dino Team
          </span>
          <CTAButton href={WHATSAPP_URL} className="px-5 py-2.5 text-xs">
            Quero minha direção
          </CTAButton>
        </div>
      </header>

      <main>
        <Hero />
        <ParaQuemE />
        <Metodo />
        <Resultados />
        <SobreRamon />
        <Depoimentos />
        <Comunidade />
        <Planos />
        <FAQ />
        <CtaFinal />
      </main>

      <footer className="border-t border-line px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <span className="font-display text-xl uppercase tracking-wide">
            Dino Team
          </span>
          <p className="font-body text-sm text-muted">
            Consultoria de treino e dieta · O método do mais alto nível, adaptado
            para você.
          </p>
          <nav className="flex gap-5 font-body text-sm text-muted">
            <Link
              href="/privacidade"
              className="hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos"
              className="hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
            >
              Termos de Uso
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

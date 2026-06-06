import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";
import { WHATSAPP_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de Uso · Dino Team",
  description:
    "As regras de uso deste site da Dino Team: aceitação, descrição do serviço, propriedade intelectual, conduta, limitação de responsabilidade e legislação aplicável.",
};

export default function TermosPage() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-2xl uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
          >
            Dino Team
          </Link>
          <CTAButton href={WHATSAPP_URL} className="px-5 py-2.5 text-xs">
            Quero minha direção
          </CTAButton>
        </div>
      </header>

      <main className="px-6 py-24 pt-[calc(theme(spacing.24)+4rem)] sm:py-32 sm:pt-[calc(theme(spacing.32)+4rem)]">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl uppercase leading-[1.1] text-fg sm:text-5xl">
            TERMOS DE USO
          </h1>
          <p className="mt-4 font-body text-sm text-muted">
            Última atualização: [DATA]
          </p>

          <p className="mt-12 font-body text-base leading-relaxed text-fg">
            Estes Termos definem as regras para o uso deste site. Ao navegar por
            aqui, você concorda com elas. A leitura é curta de propósito: você
            precisa saber o que está aceitando antes de seguir.
          </p>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              1. Aceitação dos termos
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Ao acessar e utilizar este site, você declara que leu, entendeu e
              aceita estes Termos de Uso, bem como a nossa{" "}
              <Link
                href="/privacidade"
                className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fg focus-visible:ring-offset-bg"
              >
                Política de Privacidade
              </Link>
              . Se você não concorda com algum ponto, não utilize o site.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              2. O que é este site
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Este site é o canal institucional da Dino Team, mantida por [RAZÃO
              SOCIAL], inscrita no CNPJ sob o nº [CNPJ]. Por aqui você conhece o
              método e a proposta de consultoria de treino e dieta da marca,
              acessa conteúdo educativo e pode iniciar contato para uma eventual
              consultoria. O site apresenta informação e direção; ele não
              substitui orientação médica, nutricional ou de educação física
              individualizada, nem garante qualquer desfecho específico. O
              resultado depende da aplicação consistente do método por cada
              pessoa.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              3. Propriedade intelectual
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Todo o conteúdo deste site — textos, marca, identidade visual,
              fotografias, vídeos, layout e código — pertence a [RAZÃO SOCIAL] ou
              é por ela licenciado, e está protegido pela legislação de
              propriedade intelectual. Você pode acessar e compartilhar o
              conteúdo para uso pessoal, citando a fonte. Reprodução, modificação
              ou exploração comercial sem autorização prévia e por escrito não é
              permitida.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              4. Conduta do usuário
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Ao usar este site, você se compromete a não praticar atos
              ilícitos, não violar direitos de terceiros, não tentar acessar
              áreas restritas, não comprometer a segurança ou o funcionamento do
              site, e não utilizar o conteúdo para fins que contrariem a lei ou
              estes Termos. O uso é de sua responsabilidade.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              5. Limitação de responsabilidade
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              O conteúdo deste site é fornecido no estado em que se encontra, com
              finalidade informativa e educativa. Empenhamo-nos para mantê-lo
              correto e disponível, mas não garantimos ausência de erros,
              interrupções ou indisponibilidades. As decisões que você tomar com
              base no conteúdo são de sua responsabilidade. Recomendamos
              acompanhamento profissional adequado antes de iniciar qualquer
              programa de treino ou dieta.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              6. Links e serviços de terceiros
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Este site pode conter links para serviços de terceiros, como o
              WhatsApp para contato. Ao seguir esses links, você passa a se
              submeter aos termos e às políticas de privacidade desses serviços,
              sobre os quais não temos controle e pelos quais não nos
              responsabilizamos.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              7. Alterações destes Termos
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Podemos atualizar estes Termos a qualquer momento para refletir
              mudanças no site ou na legislação. Quando isso acontecer, a data de
              &ldquo;última atualização&rdquo; no topo desta página será
              revisada. O uso contínuo do site após a alteração significa que
              você aceita os Termos atualizados.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              8. Legislação aplicável e foro
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Estes Termos são regidos pela legislação brasileira. Fica eleito o
              foro da comarca de [COMARCA/UF] para dirimir quaisquer controvérsias
              decorrentes destes Termos, com renúncia a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              9. Contato
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Dúvidas sobre estes Termos podem ser enviadas para [E-MAIL DO
              ENCARREGADO DE DADOS]. Responderemos no que estiver ao nosso
              alcance.
            </p>
          </section>
        </div>
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

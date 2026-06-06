import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";
import { WHATSAPP_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade · Dino Team",
  description:
    "Como a Dino Team trata seus dados pessoais: o que coletamos, com qual finalidade, sua base legal e os direitos que você tem sob a LGPD.",
};

export default function PrivacidadePage() {
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
            POLÍTICA DE PRIVACIDADE
          </h1>
          <p className="mt-4 font-body text-sm text-muted">
            Última atualização: [DATA]
          </p>

          <p className="mt-12 font-body text-base leading-relaxed text-fg">
            Esta Política descreve como tratamos os seus dados pessoais quando
            você navega neste site. Ela existe para que você saiba, sem rodeios,
            o que coletamos, por que coletamos e o que você pode fazer a
            respeito. A linguagem é direta de propósito: você decide sobre os
            seus dados, e decidir exige clareza.
          </p>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              1. Quem é o controlador dos dados
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              O controlador dos seus dados pessoais — a pessoa jurídica
              responsável pelas decisões sobre esse tratamento — é [RAZÃO
              SOCIAL], inscrita no CNPJ sob o nº [CNPJ]. Para qualquer assunto
              relacionado à privacidade, o contato é o nosso Encarregado de
              Dados (DPO), pelo e-mail [E-MAIL DO ENCARREGADO DE DADOS].
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              2. Quais dados coletamos
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Coletamos apenas o necessário para operar o site e entender como
              ele é usado. Em resumo:
            </p>
            <p className="font-body text-base font-semibold uppercase tracking-wide text-fg">
              Dados de navegação e analytics
            </p>
            <p className="font-body text-base leading-relaxed text-fg">
              Mediante o seu consentimento, utilizamos cookies e tecnologias
              semelhantes de ferramentas de analytics — Google Analytics 4
              (GA4), Meta Pixel e Microsoft Clarity — que registram dados como
              páginas visitadas, tempo de permanência, origem do acesso, tipo de
              dispositivo, sistema operacional, navegador e identificadores
              técnicos atribuídos pelos próprios serviços. Esses dados nos ajudam
              a entender o uso do site e a melhorá-lo.
            </p>
            <p className="font-body text-base font-semibold uppercase tracking-wide text-fg">
              Dados que você fornece voluntariamente
            </p>
            <p className="font-body text-base leading-relaxed text-fg">
              Quando você nos contata pelo WhatsApp a partir deste site, os
              dados dessa conversa — como o seu número, nome e o conteúdo da
              mensagem — são tratados para responder à sua solicitação. O site em
              si não armazena formulários nem dados de cadastro neste momento.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              3. Para que usamos os seus dados
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Tratamos os seus dados para medir e melhorar o desempenho do site,
              entender quais conteúdos são relevantes, dimensionar e otimizar
              nossas ações de comunicação, e responder aos contatos que você
              inicia conosco. Não vendemos os seus dados e não os usamos para
              decisões automatizadas que afetem você de forma significativa.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              4. Em que base legal nos apoiamos
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              O tratamento dos dados de analytics e dos cookies não essenciais se
              apoia no seu <strong>consentimento</strong> (art. 7º, I, da Lei nº
              13.709/2018 — LGPD). Por isso, os scripts de GA4, Meta Pixel e
              Clarity só são ativados depois que você aceita os cookies no banner
              de consentimento. Se você recusar, esses scripts não são
              carregados, e o site continua plenamente utilizável. O tratamento
              dos dados de contato que você nos envia se apoia na adoção de
              medidas a seu pedido, preliminares a uma eventual relação de
              consultoria.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              5. Com quem compartilhamos
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Para operar os recursos acima, os dados de navegação são tratados
              pelos provedores das ferramentas de analytics — Google, Meta e
              Microsoft — na qualidade de operadores ou controladores conjuntos,
              conforme os termos de cada serviço. Esses provedores podem tratar
              dados fora do Brasil; nesses casos, o tratamento se sujeita às
              salvaguardas previstas na LGPD para transferência internacional.
              Não compartilhamos os seus dados com terceiros para finalidades
              estranhas às descritas nesta Política.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              6. Por quanto tempo guardamos
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Os dados de analytics são retidos pelo prazo de retenção
              configurado em cada ferramenta e pelo período em que o seu
              consentimento estiver vigente. O registro da sua escolha de
              consentimento é mantido por até 6 (seis) meses, quando então o
              banner volta a aparecer e você decide de novo. Encerrada a
              finalidade, os dados são eliminados ou anonimizados, salvo
              obrigação legal de guarda.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              7. Seus direitos como titular
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              A LGPD garante a você, a qualquer momento e de forma gratuita, o
              direito de confirmar a existência do tratamento; acessar os seus
              dados; corrigir dados incompletos, inexatos ou desatualizados;
              solicitar a anonimização, o bloqueio ou a eliminação de dados
              desnecessários ou tratados em desconformidade com a lei; pedir a
              portabilidade; revogar o consentimento; e ser informado sobre com
              quem compartilhamos os seus dados. Para exercer qualquer desses
              direitos, basta escrever ao nosso Encarregado, no e-mail [E-MAIL DO
              ENCARREGADO DE DADOS].
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              8. Como você controla os cookies
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              A sua decisão sobre os cookies de analytics é tomada no banner de
              consentimento. Aceitar e recusar têm o mesmo peso: recusar não
              prejudica o uso do site. Você também pode bloquear ou apagar
              cookies diretamente nas configurações do seu navegador. A escolha
              registrada vale por 6 (seis) meses; depois disso, perguntamos
              novamente.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              9. Encarregado e contato
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Dúvidas, pedidos e reclamações sobre o tratamento dos seus dados
              podem ser enviados ao nosso Encarregado de Proteção de Dados, pelo
              e-mail [E-MAIL DO ENCARREGADO DE DADOS]. Você também pode procurar a
              Autoridade Nacional de Proteção de Dados (ANPD) caso entenda que os
              seus direitos não foram atendidos.
            </p>
          </section>

          <section className="mt-16 space-y-8">
            <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg">
              10. Alterações nesta Política
            </h2>
            <p className="font-body text-base leading-relaxed text-fg">
              Esta Política pode ser atualizada para refletir mudanças nas
              ferramentas que usamos ou na legislação aplicável. Quando isso
              acontecer, a data de &ldquo;última atualização&rdquo; no topo desta
              página será revisada. Recomendamos que você a consulte
              periodicamente.
            </p>
          </section>

          <p className="mt-16 font-body text-sm text-muted">
            Esta Política é regida pela legislação brasileira, em especial pela
            Lei nº 13.709/2018 (LGPD).
          </p>
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

import type {
  WithContext,
  Article,
  Person,
  Organization,
  BreadcrumbList,
} from "schema-dts";

/**
 * Emissor tipado de JSON-LD (SEO-05). Renderiza um objeto schema-dts como
 * <script type="application/ld+json"> no servidor (RSC, sem "use client").
 *
 * O `.replace(/</g, "\\u003c")` é OBRIGATÓRIO: escapa o caractere `<` antes de
 * injetar via dangerouslySetInnerHTML, fechando o vetor de XSS por quebra de tag
 * (RESEARCH §4, Pitfall 4). Todo objeto JSON-LD que a Wave 3 emitir passa por
 * este único componente — a higienização vive aqui, uma vez.
 */
type JsonLdData = WithContext<
  Article | Person | Organization | BreadcrumbList
>;

export function JsonLd({ data }: { data: JsonLdData }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c"); // XSS scrub — obrigatório
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

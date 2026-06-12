/**
 * Constantes do site Dino Team. Conteúdo factual ancorado no brand book;
 * nada de números inventados. Dados marcados como PLACEHOLDER aguardam material
 * real do usuário (depoimentos, número de WhatsApp).
 */

// CTA primário. PLACEHOLDER até o número real ser preenchido em NEXT_PUBLIC_WHATSAPP_URL.
export const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ||
  "https://wa.me/0000000000?text=" +
    encodeURIComponent("Quero minha consultoria Dino Team");

// Métricas da seção Resultados — todas defensáveis pelo brand book.
export const STATS: ReadonlyArray<{
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}> = [
  { value: 60, suffix: " MIL+", label: "seguidores acompanhando a jornada" },
  { value: 1, suffix: "º", label: "brasileiro a vencer o Mr. Olympia (2025)" },
  { value: 100, suffix: "%", label: "protocolo individual — treino e dieta sob medida" },
];

// Conquistas para a timeline em Sobre Ramon. Fatos do brand book.
export const TIMELINE: ReadonlyArray<{ marco: string; texto: string }> = [
  { marco: "O início", texto: "Calistenia em praças no Acre — sem dinheiro, sem academia, sem suplemento." },
  { marco: "Os anos de processo", texto: "Anos errando, ajustando e se adaptando à própria realidade." },
  { marco: "Arnold Classic 2023", texto: "Entre os melhores do mundo no Classic Physique." },
  { marco: "Mr. Olympia 2025", texto: "Primeiro brasileiro homem a vencer o maior campeonato do planeta." },
];

// ---------------------------------------------------------------------------
// Constantes de conversão — Fase 2
// ---------------------------------------------------------------------------

// Número extraído de NEXT_PUBLIC_WHATSAPP_URL (espelha WHATSAPP_URL).
// Fallback: "0000000000" enquanto o env var não estiver configurado (D-06/D-19).
const _waBase = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "";
const WA_NUMBER = _waBase.match(/wa\.me\/([^?]+)/)?.[1] ?? "0000000000";

// Builder de deeplink por plano — espelha o padrão de WHATSAPP_URL.
// Texto pré-preenchido: "Quero o Plano X", facilitando identificação no WhatsApp.
function planDeeplink(planName: string): string {
  return (
    "https://wa.me/" +
    WA_NUMBER +
    "?text=" +
    encodeURIComponent("Quero o Plano " + planName)
  );
}

// Planos da consultoria. PLACEHOLDER — nomes, preços e inclusos reais chegam
// via chat sob demanda (D-06). Substituir "PLACEHOLDER A"/"PLACEHOLDER B" pelos
// nomes reais dos planos quando disponíveis.
export const PLANS: ReadonlyArray<{
  name: string;
  price: string;
  includes: ReadonlyArray<string>;
  whatsappUrl: string;
}> = [
  {
    name: "PLACEHOLDER A",
    price: "Sob consulta", // rótulo intencional on-brand — nunca "PLACEHOLDER" cru (Pitfall 5)
    includes: ["PLACEHOLDER"],
    whatsappUrl: planDeeplink("A"),
  },
  {
    name: "PLACEHOLDER B",
    price: "Sob consulta", // rótulo intencional on-brand — nunca "PLACEHOLDER" cru (Pitfall 5)
    includes: ["PLACEHOLDER"],
    whatsappUrl: planDeeplink("B"),
  },
];

// Depoimentos de alunos. PLACEHOLDER — trocar por nomes e textos reais via chat.
// Regra: sem nome real, não publica (publishable: false). O componente Depoimentos
// filtra publishable === false; cards não aparecem enquanto todos forem false.
export const TESTIMONIALS: ReadonlyArray<{
  name: string;
  context: string;
  change: string;
  result: string;
  photo?: string;
  publishable: boolean;
}> = [
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
  { name: "PLACEHOLDER", context: "", change: "", result: "", publishable: false },
];

// Link de convite do grupo exclusivo de alunos — SEPARADO de WHATSAPP_URL (suporte).
// PLACEHOLDER até o link real do grupo ser fornecido pelo usuário (D-14/D-17).
export const COMMUNITY_WHATSAPP_URL =
  "https://chat.whatsapp.com/PLACEHOLDER"; // grupo exclusivo de alunos Dino Team

// Benefícios da comunidade de alunos (3–4 itens, D-15).
// Enquadra a comunidade como parte do método, não como bônus.
// PLACEHOLDER — refinar com copy real quando os dados da Comunidade chegarem via chat.
export const COMMUNITY_BENEFITS: ReadonlyArray<string> = [
  "PLACEHOLDER — Não está sozinho no processo: alunos se apoiam mutuamente com o mesmo método.",
  "PLACEHOLDER — Acesso exclusivo a conteúdo e atualizações diretas de Ramon.",
  "PLACEHOLDER — Comunidade fechada: entra quem contrata, permanece quem executa.",
  "PLACEHOLDER — Direção coletiva: o ambiente reforça o compromisso com o processo.",
];

// ---------------------------------------------------------------------------
// Cookie consent — Fase 3 (LEGAL-03)
// ---------------------------------------------------------------------------

// Chave de localStorage onde a escolha de consentimento é persistida.
export const COOKIE_CONSENT_KEY = "dino-consent";

// Validade da escolha: 6 meses em milissegundos (D-08).
// 6 × 30 dias × 24h × 60min × 60s × 1000ms.
export const COOKIE_CONSENT_TTL_MS = 6 * 30 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Blog — Fase 4 (BLOG-01 / SEO-01 / SEO-05)
// ---------------------------------------------------------------------------

// URL base de todas as URLs absolutas (canonical / OG / sitemap / JSON-LD).
// Espelha o padrão env-com-fallback de WHATSAPP_URL (D-12, SEO-01). Trocar pelo
// domínio real definindo NEXT_PUBLIC_SITE_URL ao publicar.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinoteam.vercel.app";

// Registro de autores (D-04/D-05, EEAT). A chave é referenciada pelo campo
// `author` no frontmatter dos artigos (lib/blog.ts). `satisfies` mantém as chaves
// literais. `photo: undefined` para o Ramon é a MESMA disciplina de placeholder
// intencional de RamonPhoto/TESTIMONIALS — slot deliberado, nunca estado quebrado;
// troca trivial quando o acervo P&B chegar.
export type Author = {
  name: string;
  credential: string;
  photo?: string;
  bio?: string;
};

export const AUTHORS = {
  "ramon-dino": {
    name: "Ramon Dino",
    credential: "primeiro brasileiro campeão do Mr. Olympia (Classic Physique)",
    photo: undefined, // placeholder até o acervo P&B chegar (mesmo bloqueio da Fase 1)
  },
  "mauri-rosolen": {
    name: "Mauri Rosolen",
    credential: "Treinador",
    photo: "/autores/mauri-rosolen.webp", // já no repo
  },
} satisfies Record<string, Author>;

export type AuthorKey = keyof typeof AUTHORS;

// As 4 categorias fixas do blog (D-01) — taxonomia fechada, espelha o enum de
// lib/blog.ts. Diferenciadas só pelo rótulo (sem cor/pill/badge — UI-SPEC §Color).
export const CATEGORIES = [
  { slug: "treino", label: "Treino" },
  { slug: "nutricao", label: "Nutrição" },
  { slug: "mentalidade", label: "Mentalidade" },
  { slug: "bastidores", label: "Bastidores" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

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

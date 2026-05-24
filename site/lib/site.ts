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

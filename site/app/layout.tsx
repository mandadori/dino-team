import type { Metadata } from "next";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";
import { ConsentProvider } from "@/components/ConsentProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { TrackingScripts } from "@/components/TrackingScripts";

// Anton: display/títulos — peso único 400, usado em CAIXA ALTA.
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

// Montserrat: corpo e apoio.
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dino Team — O método do campeão, aplicado em você",
  description:
    "Consultoria de treino e dieta personalizada com o método validado por Ramon Dino — do zero absoluto ao topo mundial. Direção, não atalho.",
  metadataBase: new URL("https://dinoteam.vercel.app"),
  openGraph: {
    title: "Dino Team — O método do campeão, aplicado em você",
    description:
      "Treino e dieta personalizados com o método de Ramon Dino. Consistência vence intensidade.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${anton.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-fg">
        <ConsentProvider>
          {children}
          <CookieBanner />
          <TrackingScripts />
        </ConsentProvider>
      </body>
    </html>
  );
}

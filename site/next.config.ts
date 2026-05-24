import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({});

const nextConfig: NextConfig = {
  // MDX habilitado desde já para o blog futuro (Fase 2).
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // O repo tem um package-lock.json na raiz (tooling de export); fixa o root
  // do site aqui para o Turbopack não inferir o diretório errado.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default withMDX(nextConfig);

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt do site Dino Team (SEO-04).
 *
 * Allow-all + ponteiro para o sitemap, derivado de SITE_URL (build-time env,
 * lib/site.ts). Sem regras de bloqueio: todo o site é indexável.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

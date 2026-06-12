import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { CATEGORIES, SITE_URL } from "@/lib/site";

/**
 * Sitemap do blog Dino Team (SEO-03).
 *
 * Enumera /blog, as 4 rotas de categoria e cada artigo — todas ABSOLUTAS via
 * SITE_URL (derivado de NEXT_PUBLIC_SITE_URL em lib/site.ts, build-time env).
 * Os slugs vêm da enumeração do filesystem em getAllPosts(), nunca de input de
 * request (T-04-12).
 *
 * Chamar getAllPosts() aqui é um caminho de build-time: re-afirma a validação de
 * frontmatter (BLOG-01) — frontmatter inválido aborta `next build` em vez de
 * embarcar um sitemap com URL quebrada.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    { url: `${SITE_URL}/blog`, lastModified: new Date() },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/blog/categoria/${c.slug}`,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.date,
    })),
  ];
}

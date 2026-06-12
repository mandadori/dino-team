import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

/**
 * Build-time content loader para o blog Dino Team.
 *
 * Lê site/content/blog/*.mdx, separa frontmatter + corpo (gray-matter) e VALIDA
 * o frontmatter contra um schema zod. Diferente de lib/dashboard/readers.ts — que
 * envolve tudo num safe() e retorna [] em erro porque o repo pode não estar no
 * filesystem em runtime — aqui a validação faz o OPOSTO: em falha ela LANÇA.
 *
 * Estas funções são chamadas de generateStaticParams()/sitemap.ts (caminhos de
 * build), então um frontmatter inválido ABORTA `next build` em vez de embarcar
 * uma página sem description/date (BLOG-01, RESEARCH §2, Pitfall 3). NÃO envolver
 * a validação num try/catch que engole o erro.
 */

// As 4 categorias fixas (D-01) — espelha CATEGORIES em lib/site.ts.
const FrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.coerce.date(),
  // chave em AUTHORS (lib/site.ts) — validado como string aqui; a referência viva
  // ao registro é exercitada pela rota de artigo na Wave 3.
  author: z.string(),
  category: z.enum(["treino", "nutricao", "mentalidade", "bastidores"]),
  description: z.string(),
  cover: z.string(),
  featured: z.boolean(),
  // marca opcional de "exemplo/semente" (D-09) — aceita mas não exigido.
  example: z.boolean().optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

export type Post = {
  title: string;
  slug: string;
  date: Date;
  author: string;
  category: Frontmatter["category"];
  description: string;
  cover: string;
  featured: boolean;
  example: boolean;
  /** Estimativa de leitura, ex.: "6 min de leitura" (pt-BR). */
  readingTime: string;
  /** Minutos brutos (para metadados/uso futuro). */
  readingMinutes: number;
  /** Corpo MDX cru — a rota de artigo (Wave 3) renderiza isto. */
  body: string;
};

// cwd é site/ quando a app roda — o conteúdo vive DENTRO de site/, então NÃO
// existe o hop ".." de readers.ts.
const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

/** Formata os minutos de leitura no registro pt-BR da marca. */
function formatReadingTime(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));
  return `${rounded} min de leitura`;
}

/** Lê + valida um único arquivo .mdx, lançando em frontmatter inválido. */
function loadPost(fileName: string): Post {
  const filePath = path.join(CONTENT_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const parsed = FrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => {
        const field = issue.path.join(".") || "(raiz)";
        return `${field}: ${issue.message}`;
      })
      .join("; ");
    throw new Error(`[blog] ${fileName}: frontmatter inválido — ${detail}`);
  }

  const fm = parsed.data;
  const stats = readingTime(content);

  return {
    title: fm.title,
    slug: fm.slug,
    date: fm.date,
    author: fm.author,
    category: fm.category,
    description: fm.description,
    cover: fm.cover,
    featured: fm.featured,
    example: fm.example ?? false,
    readingTime: formatReadingTime(stats.minutes),
    readingMinutes: stats.minutes,
    body: content,
  };
}

/**
 * Todos os posts, ordenados por data desc. Validação corre aqui — chamado de
 * generateStaticParams()/sitemap.ts (build-time), então frontmatter inválido
 * aborta o build.
 */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".mdx"))
    .map((d) => loadPost(d.name))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Um post pelo slug. Lança se ausente. */
export function getPostBySlug(slug: string): Post {
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`[blog] post não encontrado para o slug "${slug}".`);
  }
  return post;
}

/** Posts de uma categoria, ordenados por data desc. */
export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

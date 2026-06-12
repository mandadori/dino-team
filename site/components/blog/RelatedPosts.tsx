import type { Post } from "@/lib/blog";
import { PostCard } from "@/components/blog/PostCard";

/**
 * Posts relacionados (BLOG-08) — Server Component (sem diretiva de client).
 *
 * Recebe 2–3 posts da MESMA categoria já filtrados (sem o atual) pela rota de
 * artigo. Heading Anton "CONTINUE LENDO" + grade de PostCards (variante grid).
 * Lista vazia -> não renderiza NADA (sem skeleton, sem "em breve") — mesma
 * disciplina editorial de Depoimentos.
 */
export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-line pt-12">
      <h2 className="font-display text-2xl uppercase leading-[1.2] text-fg sm:text-3xl">
        Continue lendo
      </h2>
      <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} variant="grid" />
        ))}
      </div>
    </section>
  );
}

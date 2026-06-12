import Image from "next/image";
import { AUTHORS, type Author, type AuthorKey } from "@/lib/site";

/**
 * Bloco de autor (EEAT) — Server Component (sem diretiva de client).
 *
 * Resolve o autor pelo registro AUTHORS (D-04). Com foto: imagem P&B
 * (grayscale+contrast-125), tratamento da marca. Sem foto (Ramon, D-05):
 * placeholder monocromático intencional rotulado "Foto do autor" — slot
 * deliberado, NUNCA estado de erro (mesma disciplina de RamonPhoto/Depoimentos).
 *
 * Nome = Anton (Heading tier, uppercase); credencial = Montserrat (Label tier,
 * text-muted); bio opcional. alt da foto = "{name}, {credential}" (A11y).
 */

function resolveAuthor(input: AuthorKey | Author): Author {
  return typeof input === "string" ? AUTHORS[input] : input;
}

export function AuthorBlock({ author }: { author: AuthorKey | Author }) {
  const { name, credential, photo, bio } = resolveAuthor(author);
  const alt = `${name}, ${credential}`;

  return (
    <section className="mt-16 flex flex-col gap-8 border-t border-line pt-8 sm:flex-row sm:items-start">
      {photo ? (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-line">
          <Image
            src={photo}
            alt={alt}
            fill
            sizes="96px"
            className="object-cover grayscale contrast-125"
          />
        </div>
      ) : (
        // Placeholder intencional (D-05): slot monocromático, não erro.
        <div
          role="img"
          aria-label={alt}
          className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-line bg-surface p-2 text-center"
        >
          <span
            aria-hidden="true"
            className="font-display text-sm uppercase leading-tight tracking-widest text-muted"
          >
            Foto do autor
          </span>
        </div>
      )}

      <div>
        <p className="font-display text-2xl uppercase leading-[1.1] text-fg">
          {name}
        </p>
        <p className="mt-2 font-body text-sm leading-[1.4] text-muted">
          {credential}
        </p>
        {bio ? (
          <p className="mt-4 max-w-[60ch] font-body text-base leading-[1.6] text-fg">
            {bio}
          </p>
        ) : null}
      </div>
    </section>
  );
}

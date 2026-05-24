import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin/dashboard" className="font-display text-xl uppercase tracking-wide">
            Dino Team · Admin
          </Link>
          <nav className="flex gap-5 font-body text-sm text-muted">
            <Link href="/admin/dashboard" className="hover:text-fg">Visão geral</Link>
            <Link href="/admin/dashboard/campanhas" className="hover:text-fg">Campanhas</Link>
            <Link href="/admin/dashboard/aprovacoes" className="hover:text-fg">Aprovações</Link>
            <Link href="/admin/dashboard/dados" className="hover:text-fg">Dados</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

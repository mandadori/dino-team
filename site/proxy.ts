import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege /admin/* por token. Aceita token via cookie `dashboard_token` ou
 * query `?token=`. Sem DASHBOARD_TOKEN no env, tudo é negado (redireciona ao login).
 * Roda no Edge — não usa filesystem. (Convenção `proxy` do Next 16, ex-`middleware`.)
 */
export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // A própria página de login é sempre acessível.
  if (pathname === "/admin/login") return NextResponse.next();

  const expected = process.env.DASHBOARD_TOKEN;
  const provided =
    req.cookies.get("dashboard_token")?.value ?? searchParams.get("token");

  if (expected && provided === expected) {
    const res = NextResponse.next();
    // Se veio por query, fixa em cookie para as próximas navegações.
    if (searchParams.get("token")) {
      res.cookies.set("dashboard_token", provided, {
        httpOnly: true,
        sameSite: "lax",
        path: "/admin",
      });
    }
    return res;
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "agroscope-authentication";

// Rotas acessíveis sem autenticação (landing/marketing + fluxo de login/cadastro).
// Tudo que não estiver aqui é tratado como protegido.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/termos",
  "/recursos-detalhes",
  "/landing-dashboard",
  "/landing-settings",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  if (pathname === "/login" || pathname === "/signin" || pathname === "/signup") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/analytics", request.url));
    }
    return NextResponse.next();
  }

  if (!isPublicPath(pathname) && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Aplica a todas as rotas de página, exceto assets estáticos, internals do
// Next.js e rotas de API.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

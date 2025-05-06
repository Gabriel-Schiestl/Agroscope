import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next|static|api).*)"],
};

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get("agroscope-authentication")?.value;

  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signin")
  ) {
    if (cookie) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_PROD}/auth/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `agroscope-authentication=${cookie}`,
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          return NextResponse.redirect(new URL("/", req.url));
        }
      } catch (error) {
        console.error("Erro ao validar cookie no login/signin:", error);
      }
    }
    return NextResponse.next();
  }

  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_PROD}/auth/validate`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `agroscope-authentication=${cookie}`,
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", req.url));
  } catch (error) {
    console.error("Erro ao validar cookie para tela privada:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

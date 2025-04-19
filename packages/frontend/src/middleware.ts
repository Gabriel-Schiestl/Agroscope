import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next|static|api).*)"],
};

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signin")
  ) {
    const cookie = req.cookies.get("agroscope-authentication")?.value;
    if (cookie) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  const cookie = req.cookies.get("agroscope-authentication")?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

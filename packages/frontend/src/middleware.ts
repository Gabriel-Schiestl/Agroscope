import { NextRequest, NextResponse } from "next/server";
import Validate from "../api/login/Validate";

export const config = {
  matcher: ["/((?!_next|static|api).*)"],
};

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("agroscope-authentication")?.value;
  const response = await Validate(cookie);

  const nextResponse = NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/login")) {
    if (response) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return nextResponse;
  }

  if (req.nextUrl.pathname.startsWith("/signin")) {
    if (!response) {
      return nextResponse;
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!response) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    req.nextUrl.pathname.startsWith("/engineer") &&
    typeof response === "object" &&
    !response.isEngineer
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return nextResponse;
}

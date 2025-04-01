import { NextResponse, NextRequest } from "next/server";
import Validate from "../api/login/Validate";
import api from "../shared/http/http.config";

export const config = {
  matcher: ["/((?!_next|static|api).*)"],
};

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }
  const cookie = req.cookies.get("agroscope-authentication")?.value;
  const response = await Validate(cookie);

  if (req.nextUrl.pathname.startsWith("/signin")) {
    if (!response) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (!response) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  api.defaults.headers.common["Authorization"] = cookie;

  if (
    req.nextUrl.pathname.startsWith("/engineer") &&
    typeof response === "object" &&
    !response.isEngineer
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

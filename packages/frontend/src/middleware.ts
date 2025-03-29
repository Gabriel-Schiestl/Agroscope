import { NextResponse, NextRequest } from "next/server";
import Validate from "../api/login/Validate";
import api from "../shared/http/http.config";

export const config = {
  matcher: ["/((?!_next|static|api).*)"],
};

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }
  const cookie = req.cookies.get("agroscope-authentication")?.value;
  console.log("cookie", cookie);
  const response = await Validate(cookie);

  // Se não tiver token, redireciona para o login
  if (!response) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  api.defaults.headers.common["Authorization"] = cookie;

  // Caso contrário, continua para a próxima etapa (renderização da página)
  return NextResponse.next();
}

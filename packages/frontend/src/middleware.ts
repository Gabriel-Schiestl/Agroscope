import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Autenticação desabilitada temporariamente - permite acesso a todas as rotas
  return NextResponse.next();
}

// Ou simplesmente comente/remova o matcher para desativar o middleware
// export const config = {
//   matcher: [],
// };

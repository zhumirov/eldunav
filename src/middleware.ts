import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.url;
  const session = req.cookies.get("__Secure-authjs.session-token");

  const restrictedRoutes = ["/profile", "/chat", "/quiz", "/result"];

  if (restrictedRoutes.some((route) => url.includes(route))) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  if (url.includes("/auth/sign-in") && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

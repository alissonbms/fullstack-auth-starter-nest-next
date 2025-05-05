import { NextRequest, NextResponse } from "next/server";
import jwt, { TokenExpiredError } from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const PUBLIC_ROUTES = ["/", "/login", "/signup"];
const PROTECTED_ROUTES = ["/shop"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("Authentication")?.value;
  const pathname = req.nextUrl.pathname;

  let isAuthenticated: boolean = false;

  if (token) {
    try {
      jwt.verify(token, JWT_ACCESS_SECRET!);
      isAuthenticated = true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const url = new URL("/login", req.url);
        url.searchParams.set("error", "expiredSession");
        return NextResponse.redirect(url);
      }
    }
  }

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isAuthenticated && isPublic) {
    const url = new URL("/shop", req.url);
    url.searchParams.set("error", "alreadyLogged");
    return NextResponse.redirect(url);
  }

  if (!isAuthenticated && isProtected) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "unauthenticated");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

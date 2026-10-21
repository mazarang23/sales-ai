import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/upload", "/mapping", "/customers", "/products", "/advisor", "/profile", "/admin"];
const AUTH_PAGES = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sid")?.value;

  if (PROTECTED.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_PAGES.includes(pathname) && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/upload/:path*", "/mapping/:path*",
    "/customers/:path*", "/products/:path*", "/advisor/:path*",
    "/profile/:path*", "/admin/:path*", "/login", "/register"
  ]
};
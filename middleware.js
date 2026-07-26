import { NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/problems/new", "/profile", "/members", "/internships"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("offbook_session")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
matcher: ["/dashboard/:path*", "/problems/new", "/profile/:path*", "/members/:path*", "/internships/:path*"],};

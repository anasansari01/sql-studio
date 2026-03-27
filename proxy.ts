import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

const PROTECTED_PATHS = ["/attempt", "/dashboard"];
const GUEST_ONLY_PATHS = ["/login", "/register"];

async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("cipher_session")?.value;
  let isAuthenticated = false;

  if (token) {
    const payload = await verifyToken(token);
    isAuthenticated = !!payload;
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isGuestOnly = GUEST_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isGuestOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/attempt/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};

export default proxy;
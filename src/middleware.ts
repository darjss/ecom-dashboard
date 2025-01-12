import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TokenBucket } from "@/lib/rate-limit";

const getRequestBucket = new TokenBucket<string>(100, 1);
const postRequestBucket = new TokenBucket<string>(30, 1);

const publicPaths = [
  "/login",
  "/login/google",
  "/login/google/callback",
  "/_next",
  "/favicon.ico",
  "/public",
];

export async function middleware(request: NextRequest): Promise<NextResponse> {

  if (process.env.NODE_ENV === "development") {
    console.log("Middleware request:", request);
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  const clientIP = request.headers.get("X-Forwarded-For") ?? "";

  // Rate limiting
  if (request.method === "GET" && !getRequestBucket.consume(clientIP, 1)) {
    return new NextResponse(null, { status: 429 });
  }
  if (request.method === "POST" && !postRequestBucket.consume(clientIP, 3)) {
    return new NextResponse(null, { status: 429 });
  }

  // Handle GET requests - cookie extension and auth check
  if (request.method === "GET") {
    // Skip auth for public paths
    if (publicPaths.some((publicPath) => path.startsWith(publicPath))) {
      return NextResponse.next();
    }

    const token = request.cookies.get("session")?.value ?? null;

    // Check auth for protected routes
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Extend cookie expiration on GET requests
    const response = NextResponse.next();
    response.cookies.set("session", token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  }

  // Handle non-GET requests - CORS check
  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");

  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, { status: 403 });
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return new NextResponse(null, { status: 403 });
  }

  if (origin.host !== hostHeader) {
    return new NextResponse(null, { status: 403 });
  }

  // Check auth for non-public API routes
  if (!publicPaths.some((publicPath) => path.startsWith(publicPath))) {
    const token = request.cookies.get("session")?.value ?? null;
    if (!token) {
      return new NextResponse(null, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

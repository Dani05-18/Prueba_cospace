import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface ProxyTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

const ACCESS_COOKIE_NAME = "cospace_access_token";
const REFRESH_COOKIE_NAME = "cospace_refresh_token";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

function getAccessSecret(): Uint8Array {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  return new TextEncoder().encode(secret);
}

async function verifyTokenInProxy(token: string): Promise<ProxyTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role === "ADMIN" ? "ADMIN" : "USER",
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const accessToken: string | undefined = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken: string | undefined = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  const isPrivateRoute: boolean = pathname.startsWith("/dashboard");
  const isAdminRoute: boolean = pathname.startsWith("/admin");
  const isAuthRoute: boolean = pathname.startsWith("/login") || pathname.startsWith("/register");

  const user: ProxyTokenPayload | null = accessToken ? await verifyTokenInProxy(accessToken) : null;

  // 1. Si intenta entrar a ruta privada/admin sin token de acceso válido
  if ((isPrivateRoute || isAdminRoute) && !user) {
    // Si la cookie de acceso expiró pero existe la de refresco, renovamos la sesión sin enviar al login
    if (refreshToken) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(refreshUrl);
    }

    // Si no hay ninguna cookie activa, enviamos a /login guardando la ruta previa
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si intenta entrar a /admin sin rol de ADMIN -> redirigir a /dashboard
  if (isAdminRoute && user && user.role !== "ADMIN") {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Si ya está autenticado e intenta entrar a /login o /register -> enviar a su panel correspondiente
  if (isAuthRoute && user) {
    const targetUrl = new URL(user.role === "ADMIN" ? "/admin" : "/dashboard", request.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRefreshTokenFromCookie,
  verifyRefreshToken,
  clearAuthCookies,
  hashToken,
  issueSession,
  TokenPayload,
} from "@/lib/auth";
import {
  handleRouteError,
  successResponse,
  HttpError,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api-response";

interface RefreshResponse {
  user: TokenPayload;
}

// GET /api/auth/refresh?next=/dashboard -> Redirección transparente desde proxy.ts
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const nextPath: string = searchParams.get("next") || "/dashboard";

  try {
    const refreshToken: string | null = await getRefreshTokenFromCookie();
    if (!refreshToken) {
      await clearAuthCookies();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded: TokenPayload | null = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      await clearAuthCookies();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.refreshTokenHash) {
      await clearAuthCookies();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const hashedIncomingToken: string = hashToken(refreshToken);
    if (user.refreshTokenHash !== hashedIncomingToken) {
      await clearAuthCookies();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    await issueSession(user);
    return NextResponse.redirect(new URL(nextPath, request.url));
  } catch {
    await clearAuthCookies();
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// POST /api/auth/refresh -> Consumo programático / API
export async function POST(): Promise<
  NextResponse<ApiSuccessResponse<RefreshResponse> | ApiErrorResponse>
> {
  try {
    const refreshToken: string | null = await getRefreshTokenFromCookie();

    if (!refreshToken) {
      throw new HttpError(401, "No se proporcionó token de refresco", "NO_REFRESH_TOKEN");
    }

    const decoded: TokenPayload | null = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      await clearAuthCookies();
      throw new HttpError(401, "Token de refresco inválido o expirado", "INVALID_REFRESH_TOKEN");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.refreshTokenHash) {
      await clearAuthCookies();
      throw new HttpError(401, "Sesión revocada o usuario no encontrado", "SESSION_REVOKED");
    }

    const hashedIncomingToken: string = hashToken(refreshToken);
    if (user.refreshTokenHash !== hashedIncomingToken) {
      await clearAuthCookies();
      throw new HttpError(401, "Token de refresco inválido o modificado", "TOKEN_MISMATCH");
    }

    const newPayload: TokenPayload = await issueSession(user);

    return successResponse({ user: newPayload }, 200);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

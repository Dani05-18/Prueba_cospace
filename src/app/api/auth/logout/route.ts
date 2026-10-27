import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRefreshTokenFromCookie,
  clearAuthCookies,
  hashToken,
} from "@/lib/auth";
import {
  handleRouteError,
  successResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api-response";

interface MessageResponse {
  message: string;
}

export async function POST(): Promise<
  NextResponse<ApiSuccessResponse<MessageResponse> | ApiErrorResponse>
> {
  try {
    const refreshToken: string | null = await getRefreshTokenFromCookie();

    if (refreshToken) {
      const hashedToken: string = hashToken(refreshToken);

      await prisma.user.updateMany({
        where: { refreshTokenHash: hashedToken },
        data: { refreshTokenHash: null },
      });
    }

    await clearAuthCookies();

    return successResponse({ message: "Sesión cerrada correctamente" }, 200);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

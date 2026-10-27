import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema, LoginInput } from "@/lib/validations/auth.schema";
import { issueSession, TokenPayload } from "@/lib/auth";
import {
  parseJsonBody,
  handleRouteError,
  successResponse,
  HttpError,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api-response";

interface AuthUserResponse {
  user: TokenPayload;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiSuccessResponse<AuthUserResponse> | ApiErrorResponse>> {
  try {
    const body: LoginInput = await parseJsonBody<LoginInput>(request);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpError(401, "Credenciales incorrectas", "INVALID_CREDENTIALS");
    }

    const isPasswordValid: boolean = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HttpError(401, "Credenciales incorrectas", "INVALID_CREDENTIALS");
    }

    const payload: TokenPayload = await issueSession(user);

    return successResponse({ user: payload }, 200);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

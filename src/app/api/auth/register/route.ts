import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, RegisterInput } from "@/lib/validations/auth.schema";
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
    const body: RegisterInput = await parseJsonBody<RegisterInput>(request);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpError(400, "El correo electrónico ya está registrado", "ALREADY_EXISTS");
    }

    const passwordHash: string = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const payload: TokenPayload = await issueSession(user);

    return successResponse({ user: payload }, 201);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

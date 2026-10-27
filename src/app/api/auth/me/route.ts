import { NextResponse } from "next/server";
import { requireUser, TokenPayload } from "@/lib/auth";
import {
  handleRouteError,
  successResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api-response";

export async function GET(): Promise<
  NextResponse<ApiSuccessResponse<{ user: TokenPayload }> | ApiErrorResponse>
> {
  try {
    const user: TokenPayload = await requireUser();
    return successResponse({ user }, 200);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    code: string = "ERROR",
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status: number = 400,
  code: string = "BAD_REQUEST",
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export async function parseJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    const body: unknown = await request.json();
    return body as T;
  } catch {
    throw new HttpError(400, "Cuerpo JSON inválido o malformado", "INVALID_JSON");
  }
}

export function handleRouteError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof HttpError) {
    return errorResponse(error.message, error.status, error.code, error.details);
  }

  if (error instanceof z.ZodError) {
    const flattened = z.flattenError(error);
    return errorResponse(
      "Datos de validación inválidos",
      400,
      "VALIDATION_ERROR",
      flattened.fieldErrors as Record<string, string[]>
    );
  }

  if (error instanceof SyntaxError) {
    return errorResponse("Cuerpo JSON inválido", 400, "INVALID_JSON");
  }

  // Errores conocidos de Prisma
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaCode: string = String(error.code);
    if (prismaCode === "P2034") {
      return errorResponse(
        "Conflicto de concurrencia al procesar la reserva. Intenta de nuevo.",
        409,
        "CONCURRENCY_CONFLICT"
      );
    }
    if (prismaCode === "P2002") {
      return errorResponse(
        "Ya existe un registro con esos datos únicos.",
        409,
        "ALREADY_EXISTS"
      );
    }
    if (prismaCode === "P2025") {
      return errorResponse("Recurso no encontrado.", 404, "NOT_FOUND");
    }
  }

  console.error("Unhandled Route Error:", error);
  return errorResponse("Error interno del servidor", 500, "INTERNAL_ERROR");
}

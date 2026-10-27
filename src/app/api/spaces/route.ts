import { NextRequest, NextResponse } from "next/server";
import { prisma, SpaceType, Space } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createSpaceSchema, CreateSpaceInput } from "@/lib/validations/business.schema";
import {
  parseJsonBody,
  handleRouteError,
  successResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api-response";

// GET /api/spaces -> Catálogo público (solo espacios activos)
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiSuccessResponse<Space[]> | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const typeQuery: string | null = searchParams.get("type");

    let spaceTypeFilter: SpaceType | undefined = undefined;
    if (typeQuery && Object.values(SpaceType).includes(typeQuery as SpaceType)) {
      spaceTypeFilter = typeQuery as SpaceType;
    }

    const spaces: Space[] = await prisma.space.findMany({
      where: {
        isActive: true,
        ...(spaceTypeFilter ? { type: spaceTypeFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(spaces, 200);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

// POST /api/spaces -> Crear nuevo espacio (Solo ADMIN: 401 si no hay sesión, 403 si no es ADMIN)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiSuccessResponse<Space> | ApiErrorResponse>> {
  try {
    await requireAdmin();

    const body: CreateSpaceInput = await parseJsonBody<CreateSpaceInput>(request);
    const parsed = createSpaceSchema.safeParse(body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const newSpace: Space = await prisma.space.create({
      data: parsed.data,
    });

    return successResponse(newSpace, 201);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

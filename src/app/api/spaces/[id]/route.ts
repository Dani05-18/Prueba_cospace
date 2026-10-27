import { NextRequest, NextResponse } from "next/server";
import { prisma, Space, Role } from "@/lib/prisma";
import { requireAdmin, getSessionUser, TokenPayload } from "@/lib/auth";
import { updateSpaceSchema, UpdateSpaceInput } from "@/lib/validations/business.schema";
import {
  parseJsonBody,
  handleRouteError,
  successResponse,
  HttpError,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/spaces/[id] -> Detalle de espacio (404 si no existe o inactivo para público)
export async function GET(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiSuccessResponse<Space> | ApiErrorResponse>> {
  try {
    const { id } = await context.params;

    const space: Space | null = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      throw new HttpError(404, "Espacio no encontrado", "SPACE_NOT_FOUND");
    }

    if (!space.isActive) {
      const user: TokenPayload | null = await getSessionUser();
      if (!user || user.role !== Role.ADMIN) {
        throw new HttpError(404, "Espacio no encontrado o inactivo", "SPACE_NOT_FOUND");
      }
    }

    return successResponse(space, 200);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

// PATCH /api/spaces/[id] -> Editar espacio (Solo ADMIN)
export async function PATCH(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiSuccessResponse<Space> | ApiErrorResponse>> {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existingSpace: Space | null = await prisma.space.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      throw new HttpError(404, "Espacio no encontrado", "SPACE_NOT_FOUND");
    }

    const body: UpdateSpaceInput = await parseJsonBody<UpdateSpaceInput>(request);
    const parsed = updateSpaceSchema.safeParse(body);

    if (!parsed.success) {
      throw parsed.error;
    }

    // Regla de negocio: Si se intenta desactivar el espacio, verificar reservas futuras confirmadas
    if (parsed.data.isActive === false && existingSpace.isActive) {
      const futureBookingsCount: number = await prisma.booking.count({
        where: {
          spaceId: id,
          status: "CONFIRMED",
          endTime: { gt: new Date() },
        },
      });

      if (futureBookingsCount > 0) {
        throw new HttpError(
          409,
          "No se puede desactivar un espacio que tiene reservas futuras confirmadas",
          "ACTIVE_BOOKINGS_CONFLICT"
        );
      }
    }

    const updatedSpace: Space = await prisma.space.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(updatedSpace, 200);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

// DELETE /api/spaces/[id] -> Desactivar espacio (Solo ADMIN, cambia isActive a false)
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiSuccessResponse<{ message: string; space: Space }> | ApiErrorResponse>> {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const existingSpace: Space | null = await prisma.space.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      throw new HttpError(404, "Espacio no encontrado", "SPACE_NOT_FOUND");
    }

    const futureBookingsCount: number = await prisma.booking.count({
      where: {
        spaceId: id,
        status: "CONFIRMED",
        endTime: { gt: new Date() },
      },
    });

    if (futureBookingsCount > 0) {
      throw new HttpError(
        409,
        "No se puede desactivar un espacio que tiene reservas futuras confirmadas",
        "ACTIVE_BOOKINGS_CONFLICT"
      );
    }

    const deactivatedSpace: Space = await prisma.space.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse(
      {
        message: "Espacio desactivado exitosamente",
        space: deactivatedSpace,
      },
      200
    );
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}


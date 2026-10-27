import { NextRequest, NextResponse } from "next/server";
import { prisma, Space } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  handleRouteError,
  successResponse,
  HttpError,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
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


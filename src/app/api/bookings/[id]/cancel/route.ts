import { NextRequest, NextResponse } from "next/server";
import { prisma, Role, Booking } from "@/lib/prisma";
import { requireUser, TokenPayload } from "@/lib/auth";
import { canUserCancel } from "@/lib/bookings/rules";
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
): Promise<NextResponse<ApiSuccessResponse<{ message: string; booking: Booking }> | ApiErrorResponse>> {
  try {
    const user: TokenPayload = await requireUser();
    const { id } = await context.params;

    const booking: Booking | null = await prisma.booking.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!booking) {
      throw new HttpError(404, "Reserva no encontrada", "BOOKING_NOT_FOUND");
    }

    // Regla de seguridad: Solo el dueño de la reserva o un administrador puede cancelarla
    if (booking.userId !== user.userId && user.role !== Role.ADMIN) {
      throw new HttpError(403, "No tienes permiso para cancelar esta reserva", "FORBIDDEN");
    }

    // Regla: Si ya está cancelada -> 409
    if (booking.status === "CANCELLED") {
      throw new HttpError(409, "La reserva ya se encuentra cancelada", "ALREADY_CANCELLED");
    }

    // Regla: Usuario común solo hasta 2 horas antes de su inicio (Admin no tiene esta restricción)
    if (user.role !== Role.ADMIN) {
      const cancelValidation = canUserCancel(booking.startTime, new Date());
      if (!cancelValidation.valid) {
        throw new HttpError(
          409,
          cancelValidation.reason || "Solo se puede cancelar hasta 2 horas antes del inicio",
          "CANCEL_TIME_LIMIT"
        );
      }
    }

    // Cambiar estado a CANCELLED (no eliminar registro)
    const updatedBooking: Booking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { space: true },
    });

    return successResponse(
      {
        message: "Reserva cancelada exitosamente",
        booking: updatedBooking,
      },
      200
    );
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}


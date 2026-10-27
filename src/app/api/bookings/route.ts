import { NextRequest, NextResponse } from "next/server";
import { prisma, Role, Booking, Prisma } from "@/lib/prisma";
import { requireUser, TokenPayload } from "@/lib/auth";
import { createBookingSchema, CreateBookingInput } from "@/lib/validations/business.schema";
import {
  validateFullHours,
  validateOperatingHoursBogota,
  validateBookingWindow,
  calculateTotalPrice,
} from "@/lib/bookings/rules";
import {
  parseJsonBody,
  handleRouteError,
  successResponse,
  HttpError,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/lib/api-response";

// GET /api/bookings -> Listar reservas (Usuarios solo ven las propias; admin puede usar ?all=true)
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiSuccessResponse<Booking[]> | ApiErrorResponse>> {
  try {
    const user: TokenPayload = await requireUser();
    const { searchParams } = new URL(request.url);
    const viewAll: boolean = searchParams.get("all") === "true" && user.role === Role.ADMIN;

    const bookings: Booking[] = await prisma.booking.findMany({
      where: viewAll ? {} : { userId: user.userId },
      include: {
        space: true,
      },
      orderBy: { startTime: "desc" },
    });

    return successResponse(bookings, 200);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

// POST /api/bookings -> Crear nueva reserva validando reglas de negocio con aislamiento serializable
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiSuccessResponse<Booking> | ApiErrorResponse>> {
  try {
    const user: TokenPayload = await requireUser();
    const body: CreateBookingInput = await parseJsonBody<CreateBookingInput>(request);
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const { spaceId, startTime, endTime } = parsed.data;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // 1. Validar horas completas y duración (1 a 4 horas)
    const durationValidation = validateFullHours(start, end);
    if (!durationValidation.valid) {
      throw new HttpError(400, durationValidation.reason || "Duración inválida", "INVALID_DURATION");
    }

    // 2. Validar horario de operación 7:00 a 21:00 en Bogotá
    const operatingHoursValidation = validateOperatingHoursBogota(start, end);
    if (!operatingHoursValidation.valid) {
      throw new HttpError(
        400,
        operatingHoursValidation.reason || "Fuera del horario de operación",
        "INVALID_OPERATING_HOURS"
      );
    }

    // 3. Validar no pasado y máximo 30 días
    const bookingWindowValidation = validateBookingWindow(start, now);
    if (!bookingWindowValidation.valid) {
      throw new HttpError(
        400,
        bookingWindowValidation.reason || "Ventana de reserva inválida",
        "INVALID_BOOKING_WINDOW"
      );
    }

    // 4. Ejecución en transacción Serializable para evitar solapamientos concurrentes
    const createdBooking: Booking = await prisma.$transaction(
      async (tx: Prisma.TransactionClient): Promise<Booking> => {
        // Verificar existencia y disponibilidad del espacio
        const space = await tx.space.findUnique({
          where: { id: spaceId },
        });

        if (!space) {
          throw new HttpError(404, "El espacio seleccionado no existe", "SPACE_NOT_FOUND");
        }

        if (!space.isActive) {
          throw new HttpError(409, "El espacio seleccionado se encuentra desactivado", "SPACE_INACTIVE");
        }

        // Regla: Máximo 3 reservas futuras confirmadas por usuario
        const futureUserBookingsCount: number = await tx.booking.count({
          where: {
            userId: user.userId,
            status: "CONFIRMED",
            endTime: { gt: now },
          },
        });

        if (futureUserBookingsCount >= 3) {
          throw new HttpError(
            409,
            "Has alcanzado el límite máximo de 3 reservas futuras confirmadas",
            "MAX_FUTURE_BOOKINGS"
          );
        }

        // Regla: Solapamiento por espacio (mismo espacio, reservas confirmadas con start < end y end > start)
        const spaceOverlap = await tx.booking.findFirst({
          where: {
            spaceId,
            status: "CONFIRMED",
            startTime: { lt: end },
            endTime: { gt: start },
          },
        });

        if (spaceOverlap) {
          throw new HttpError(
            409,
            "El espacio ya se encuentra reservado en el horario seleccionado",
            "SPACE_TIME_CONFLICT"
          );
        }

        // Regla: Solapamiento por usuario (mismo usuario no puede tener dos reservas solapadas)
        const userOverlap = await tx.booking.findFirst({
          where: {
            userId: user.userId,
            status: "CONFIRMED",
            startTime: { lt: end },
            endTime: { gt: start },
          },
        });

        if (userOverlap) {
          throw new HttpError(
            409,
            "Ya cuentas con otra reserva confirmada en este mismo horario",
            "USER_TIME_CONFLICT"
          );
        }

        // Regla: Precio calculado por el servidor (horas × precio por hora)
        const totalPrice: number = calculateTotalPrice(
          durationValidation.durationHours,
          space.pricePerHour
        );

        return tx.booking.create({
          data: {
            userId: user.userId,
            spaceId,
            startTime: start,
            endTime: end,
            totalPrice,
            status: "CONFIRMED",
          },
          include: {
            space: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return successResponse(createdBooking, 201);
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}


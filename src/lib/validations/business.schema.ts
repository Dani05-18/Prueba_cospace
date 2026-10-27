import { z } from "zod";
import { SpaceType } from "@/lib/prisma";

export const createSpaceSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  type: z.enum(SpaceType),
  capacity: z.number().int().positive("La capacidad debe ser mayor a 0"),
  pricePerHour: z.number().positive("El precio por hora debe ser mayor a 0"),
  imageUrl: z.url("URL de imagen inválida"),
});

export const updateSpaceSchema = createSpaceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createBookingSchema = z.object({
  spaceId: z.uuid("ID de espacio inválido"),
  startTime: z.iso.datetime({ offset: true }),
  endTime: z.iso.datetime({ offset: true }),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

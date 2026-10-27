import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
  email: z.email("Correo electrónico inválido").toLowerCase(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100),
});

export const loginSchema = z.object({
  email: z.email("Correo electrónico inválido").toLowerCase(),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

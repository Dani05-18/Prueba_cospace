import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma, Role } from "@/lib/prisma";
import { HttpError } from "@/lib/api-response";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

const ACCESS_COOKIE_NAME: string = "cospace_access_token";
const REFRESH_COOKIE_NAME: string = "cospace_refresh_token";

function requireEnv(name: string): string {
  const value: string | undefined = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

function getAccessSecret(): Uint8Array {
  const secret: string = requireEnv("JWT_ACCESS_SECRET");
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret: string = requireEnv("JWT_REFRESH_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  const expiresIn: string = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getAccessSecret());
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  const expiresIn: string = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  const isProd: boolean = process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutos
  });

  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getSessionUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token: string | undefined = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function getRefreshTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueSession(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
}): Promise<TokenPayload> {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const accessToken: string = await signAccessToken(payload);
  const refreshToken: string = await signRefreshToken(payload);
  const refreshTokenHash: string = hashToken(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash },
  });

  await setAuthCookies(accessToken, refreshToken);
  return payload;
}

export async function requireUser(): Promise<TokenPayload> {
  const user: TokenPayload | null = await getSessionUser();
  if (!user) {
    throw new HttpError(401, "No autenticado. Por favor inicie sesión", "UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<TokenPayload> {
  const user: TokenPayload = await requireUser();
  if (user.role !== Role.ADMIN) {
    throw new HttpError(403, "No autorizado. Se requiere rol de administrador", "FORBIDDEN");
  }
  return user;
}

export { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME };

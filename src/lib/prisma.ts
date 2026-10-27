import {
  PrismaClient,
  Prisma,
  Role,
  SpaceType,
  BookingStatus,
  type User,
  type Space,
  type Booking,
} from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export {
  PrismaClient,
  Prisma,
  Role,
  SpaceType,
  BookingStatus,
  type User,
  type Space,
  type Booking,
};

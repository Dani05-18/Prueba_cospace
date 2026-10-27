import { PrismaClient, Role, SpaceType } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPasswordHash: string = await bcrypt.hash("Admin123!", 10);
  const userPasswordHash: string = await bcrypt.hash("User123!", 10);

  // 1. Crear Administrador (obligatorio por seed)
  const admin = await prisma.user.upsert({
    where: { email: "admin@cospace.com" },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      name: "Admin CoSpace",
    },
    create: {
      name: "Admin CoSpace",
      email: "admin@cospace.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      
    },
  });

  // 2. Crear Usuario de prueba
  const demoUser = await prisma.user.upsert({
    where: { email: "user@cospace.com" },
    update: {
      passwordHash: userPasswordHash,
      role: Role.USER,
      name: "Usuario Demo",
    },
    create: {
      name: "Usuario Demo",
      email: "user@cospace.com",
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  // 3. Crear Espacios de ejemplo (Escritorios, Salas de reuniones y Cabinas)
  const spacesCount: number = await prisma.space.count();

  if (spacesCount === 0) {
    await prisma.space.createMany({
      data: [
        {
          name: "Hot Desk Focus A1",
          description:
            "Escritorio individual ergonómico con monitor 4K, ideal para programación y trabajo profundo.",
          type: SpaceType.DESK,
          capacity: 1,
          pricePerHour: 8.5,
          imageUrl:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
          isActive: true,
        },
        {
          name: "Hot Desk Creativo B2",
          description:
            "Espacio individual junto a ventanal con iluminación natural y acceso a zona de café.",
          type: SpaceType.DESK,
          capacity: 1,
          pricePerHour: 10.0,
          imageUrl:
            "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1000&q=80",
          isActive: true,
        },
        {
          name: "Sala de Juntas Nexus",
          description:
            "Sala de reuniones equipada con pantalla interactiva, pizarra de vidrio y sistema de videoconferencia.",
          type: SpaceType.MEETING_ROOM,
          capacity: 8,
          pricePerHour: 35.0,
          imageUrl:
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80",
          isActive: true,
        },
        {
          name: "Sala Ejecutiva Boardroom",
          description:
            "Sala premium para presentaciones con clientes, directorio y sesiones de estrategia.",
          type: SpaceType.MEETING_ROOM,
          capacity: 12,
          pricePerHour: 50.0,
          imageUrl:
            "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1000&q=80",
          isActive: true,
        },
        {
          name: "Cabina Acústica Silence 1",
          description:
            "Cabina insonorizada para llamadas privadas, entrevistas o reuniones remotas individuales.",
          type: SpaceType.BOOTH,
          capacity: 1,
          pricePerHour: 12.0,
          imageUrl:
            "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1000&q=80",
          isActive: true,
        },
        {
          name: "Cabina Duo Pod 2",
          description:
            "Cabina acústica para 2 personas con ventilación silenciosa y conexión Ethernet de alta velocidad.",
          type: SpaceType.BOOTH,
          capacity: 2,
          pricePerHour: 18.0,
          imageUrl:
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80",
          isActive: true,
        },
      ],
    });
  }

  console.log("✅ Seed completado:", {
    adminEmail: admin.email,
    userEmail: demoUser.email,
  });
}

main()
  .catch((error: unknown) => {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
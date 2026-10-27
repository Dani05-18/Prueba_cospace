import { prisma, Space } from "@/lib/prisma";
import { CatalogView } from "@/components/spaces/CatalogView";

// Estrategia exigida por la prueba: SSR (Server-Side Rendering en cada petición)
export const dynamic = "force-dynamic";

export default async function SpacesPage() {
  let spaces: Space[] = [];

  try {
    spaces = await prisma.space.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error: unknown) {
    console.error("Error al obtener espacios en SSR:", error);
  }

  return (
    <main className="w-full">
      <CatalogView initialSpaces={spaces} />
    </main>
  );
}


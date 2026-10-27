import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma, Space, SpaceType } from "@/lib/prisma";
import { BookingForm } from "@/components/spaces/BookingForm";

// Estrategia exigida por la prueba: SSR (Server-Side Rendering dinámico por ID)
export const dynamic = "force-dynamic";

interface SpaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaceDetailPage(props: SpaceDetailPageProps) {
  const { id } = await props.params;

  let space: Space | null = null;

  try {
    space = await prisma.space.findUnique({
      where: { id },
    });
  } catch (error: unknown) {
    console.error("Error al consultar espacio en SSR:", error);
  }

  if (!space || !space.isActive) {
    notFound();
  }

  const typeLabels: Record<SpaceType, string> = {
    [SpaceType.DESK]: "Escritorio Individual",
    [SpaceType.MEETING_ROOM]: "Sala de Juntas",
    [SpaceType.BOOTH]: "Cabina Acústica",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Botón de Regreso */}
      <div className="mb-6">
        <Link
          href="/spaces"
          className="text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors inline-flex items-center gap-1"
        >
          ← Volver al catálogo
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Información del Espacio */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm border border-purple-100 bg-white">
            <Image
              src={space.imageUrl}
              alt={space.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-purple-700 border border-purple-100 shadow-xs">
                {typeLabels[space.type]}
              </span>
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-purple-100 shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">
              {space.name}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {space.description}
            </p>

            {/* Ficha Técnica */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FDFBF7] border border-purple-100/60">
              <div>
                <span className="block text-xs text-slate-400 font-medium">Capacidad</span>
                <span className="text-sm font-bold text-slate-800">
                  {space.capacity} persona{space.capacity > 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Tarifa por hora</span>
                <span className="text-sm font-bold text-purple-600">
                  ${space.pricePerHour.toFixed(2)} USD
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Estado</span>
                <span className="text-sm font-bold text-emerald-600">Disponible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Reserva */}
        <div className="lg:col-span-5">
          <BookingForm space={space} />
        </div>
      </div>
    </div>
  );
}

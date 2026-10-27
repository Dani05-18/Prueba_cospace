"use client";

import Image from "next/image";
import Link from "next/link";
import { Space, SpaceType } from "@/lib/prisma";
import { useI18n } from "@/lib/i18n/context";

interface SpaceCardProps {
  space: Space;
}

export function SpaceCard({ space }: SpaceCardProps) {
  const { t } = useI18n();

  const typeLabels: Record<SpaceType, string> = {
    [SpaceType.DESK]: t.spaces.desk,
    [SpaceType.MEETING_ROOM]: t.spaces.meetingRoom,
    [SpaceType.BOOTH]: t.spaces.booth,
  };

  return (
    <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
      {/* Contenedor de Imagen con Badge Glassmorphism */}
      <div className="relative w-full h-52 bg-stone-100 overflow-hidden">
        <Image
          src={space.imageUrl}
          alt={space.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={false}
        />
        <div className="absolute top-3.5 left-3.5">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-purple-100/80 text-purple-700 shadow-xs">
            {typeLabels[space.type]}
          </span>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h3 className="text-base font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-1">
              {space.name}
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-stone-50 px-2 py-0.5 rounded-md shrink-0 border border-stone-100">
              👥 {space.capacity} {t.spaces.capacity}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {space.description}
          </p>
        </div>

        <div className="pt-4 border-t border-purple-100/60 flex items-center justify-between mt-auto">
          <div>
            <span className="text-2xl font-black text-purple-600">
              ${space.pricePerHour.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-400 ml-1">/ {t.spaces.pricePerHour}</span>
          </div>

          <Link
            href={`/spaces/${space.id}`}
            className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            {t.spaces.viewDetails} →
          </Link>
        </div>
      </div>
    </div>
  );
}

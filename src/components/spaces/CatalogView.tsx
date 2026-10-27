"use client";

import { useState } from "react";
import { Space, SpaceType } from "@/lib/prisma";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { useI18n } from "@/lib/i18n/context";

interface CatalogViewProps {
  initialSpaces: Space[];
}

export function CatalogView({ initialSpaces }: CatalogViewProps) {
  const { t } = useI18n();
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const filteredSpaces: Space[] =
    selectedType === "ALL"
      ? initialSpaces
      : initialSpaces.filter((s) => s.type === selectedType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabecera del Catálogo */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1.5 block">
          Catálogo Oficial
        </span>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight sm:text-4xl mb-2.5">
          {t.spaces.catalogTitle}
        </h1>
        <p className="text-sm text-slate-500">{t.spaces.catalogSubtitle}</p>
      </div>

      {/* Filtros por Categoría */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          type="button"
          onClick={() => setSelectedType("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedType === "ALL"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-purple-700 hover:bg-purple-50/50 border border-purple-100 shadow-xs"
          }`}
        >
          {t.spaces.allTypes} ({initialSpaces.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedType(SpaceType.DESK)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedType === SpaceType.DESK
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-purple-700 hover:bg-purple-50/50 border border-purple-100 shadow-xs"
          }`}
        >
          💻 {t.spaces.desk}
        </button>
        <button
          type="button"
          onClick={() => setSelectedType(SpaceType.MEETING_ROOM)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedType === SpaceType.MEETING_ROOM
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-purple-700 hover:bg-purple-50/50 border border-purple-100 shadow-xs"
          }`}
        >
          📊 {t.spaces.meetingRoom}
        </button>
        <button
          type="button"
          onClick={() => setSelectedType(SpaceType.BOOTH)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedType === SpaceType.BOOTH
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-purple-700 hover:bg-purple-50/50 border border-purple-100 shadow-xs"
          }`}
        >
          🎧 {t.spaces.booth}
        </button>
      </div>

      {/* Grid de Espacios */}
      {filteredSpaces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-purple-100 p-12 text-center max-w-md mx-auto shadow-sm">
          <p className="text-slate-500 text-sm mb-4">{t.spaces.noSpaces}</p>
          <button
            type="button"
            onClick={() => setSelectedType("ALL")}
            className="text-xs font-bold text-purple-600 hover:underline"
          >
            {t.spaces.allTypes}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
}

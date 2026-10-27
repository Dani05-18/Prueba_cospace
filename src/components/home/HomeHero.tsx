"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function HomeHero() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center">
      {/* Sección Hero con fondo beis luminoso y elegante */}
      <section className="w-full relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge con acento lila corporativo */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200/60 text-xs font-bold mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            Next.js 16 • Turbopack • Prisma ORM
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 tracking-tight leading-[1.18] mb-6">
            {t.home.heroTitle.includes(",") ? (
              <>
                {t.home.heroTitle.split(",")[0]},{" "}
                <span className="text-purple-600 block sm:inline">
                  {t.home.heroTitle.split(",")[1].trim()}
                </span>
              </>
            ) : (
              t.home.heroTitle
            )}
          </h1>

          {/* Subtítulo / Llamado a la acción */}
          <p className="text-lg sm:text-xl font-medium text-slate-600 mb-9 max-w-2xl mx-auto leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          {/* Botón Principal (CTA) Centrado hacia el catálogo */}
          <div className="flex items-center justify-center">
            <Link
              href="/spaces"
              className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm tracking-wide shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              {t.home.exploreBtn} →
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Características con Tarjetas Blancas Puras */}
      <section className="w-full max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1.5 block">
            Espacios a tu medida
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            {t.home.featuresTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta Escritorios */}
          <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-5">
              💻
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {t.home.desksTitle}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">{t.home.desksDesc}</p>
          </div>

          {/* Tarjeta Salas */}
          <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-5">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {t.home.roomsTitle}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">{t.home.roomsDesc}</p>
          </div>

          {/* Tarjeta Cabinas */}
          <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-5">
              🎧
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {t.home.boothsTitle}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">{t.home.boothsDesc}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

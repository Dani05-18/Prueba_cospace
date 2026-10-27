"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { ClientClock } from "@/components/shared/ClientClock";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-white/70 backdrop-blur-md border-t border-purple-100/80 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Marca y Derechos */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              C
            </span>
            <span className="font-bold text-slate-800 text-sm tracking-tight">
              Co<span className="text-purple-600">Space</span>
            </span>
          </Link>
          <span className="text-xs text-slate-500">
            © {new Date().getFullYear()} CoSpace. Plataforma Fullstack de Coworking.
          </span>
        </div>

        {/* Componente de Hidratación Segura */}
        <div className="flex items-center gap-4">
          <ClientClock />
        </div>

        {/* Enlaces Rápidos */}
        <div className="flex items-center gap-5 text-xs text-slate-500 font-bold">
          <Link href="/" className="hover:text-purple-600 transition-colors">
            {t.nav.home}
          </Link>
          <Link href="/spaces" className="hover:text-purple-600 transition-colors">
            {t.nav.spaces}
          </Link>
          <Link href="/dashboard" className="hover:text-purple-600 transition-colors">
            {t.nav.dashboard}
          </Link>
        </div>
      </div>
    </footer>
  );
}

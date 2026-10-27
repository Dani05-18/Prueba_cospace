"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/lib/prisma";

export function Navbar() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useI18n();
  const { user, loading, logout } = useAuth();

  const isActive = (path: string): boolean => pathname === path;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-purple-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo con acento violeta elegante */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-purple-500/25 group-hover:bg-purple-700 transition-colors">
              C
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Co<span className="text-purple-600 font-black">Space</span>
            </span>
          </Link>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive("/")
                  ? "bg-purple-50 text-purple-700 shadow-xs"
                  : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
              }`}
            >
              {t.nav.home}
            </Link>
            <Link
              href="/spaces"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive("/spaces") || pathname.startsWith("/spaces/")
                  ? "bg-purple-50 text-purple-700 shadow-xs"
                  : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
              }`}
            >
              {t.nav.spaces}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive("/dashboard")
                    ? "bg-purple-50 text-purple-700 shadow-xs"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                {t.nav.dashboard}
              </Link>
            )}
            {user && user.role === Role.ADMIN && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive("/admin")
                    ? "bg-purple-100 text-purple-900 shadow-xs"
                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                }`}
              >
                🛡️ {t.nav.admin}
              </Link>
            )}
          </nav>
        </div>

        {/* Idioma y Acciones de Usuario */}
        <div className="flex items-center gap-3">
          {/* Selector de Idioma con Acentos Lila */}
          <div className="flex items-center border border-purple-100 rounded-xl p-0.5 bg-white text-xs font-bold shadow-xs">
            <button
              type="button"
              onClick={() => setLanguage("es")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === "es"
                  ? "bg-purple-100 text-purple-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === "en"
                  ? "bg-purple-100 text-purple-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              EN
            </button>
          </div>

          {/* Autenticación */}
          {loading ? (
            <div className="w-24 h-9 bg-purple-50 rounded-xl animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                {t.nav.greeting},{" "}
                <strong className="text-slate-800 font-bold">{user.name.split(" ")[0]}</strong>
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-bold px-3 py-1.5 rounded-xl border border-red-200 transition-all cursor-pointer"
              >
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-600 hover:text-purple-700 px-3.5 py-2 rounded-xl hover:bg-purple-50/50 transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl shadow-sm shadow-purple-500/20 transition-all"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { Role } from "@/lib/prisma";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath: string = searchParams.get("redirect") || "/dashboard";

  const { refreshUser } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Credenciales inválidas");
      }

      await refreshUser();

      const userRole: Role = data.data.user.role;
      if (userRole === Role.ADMIN && redirectPath === "/dashboard") {
        router.push("/admin");
      } else {
        router.push(redirectPath);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Error desconocido al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          {t.auth.loginTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-1">{t.auth.loginSubtitle}</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t.auth.emailLabel}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="usuario@cospace.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t.auth.passwordLabel}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs mt-2 cursor-pointer"
        >
          {loading ? "Ingresando..." : t.auth.loginBtn}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-purple-100/60 text-center">
        <Link
          href="/register"
          className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline"
        >
          {t.auth.noAccount}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-xs text-purple-600 font-bold animate-pulse">
          Cargando formulario...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

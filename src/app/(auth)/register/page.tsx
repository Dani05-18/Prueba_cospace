"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { t } = useI18n();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al registrar la cuenta");
      }

      await refreshUser();
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Error desconocido al registrar usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          {t.auth.registerTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-1">{t.auth.registerSubtitle}</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t.auth.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Juan Pérez"
            className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          />
        </div>

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
            placeholder="juan@ejemplo.com"
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
            minLength={6}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs mt-2 cursor-pointer"
        >
          {loading ? "Creando cuenta..." : t.auth.registerBtn}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-purple-100/60 text-center">
        <Link
          href="/login"
          className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline"
        >
          {t.auth.hasAccount}
        </Link>
      </div>
    </div>
  );
}

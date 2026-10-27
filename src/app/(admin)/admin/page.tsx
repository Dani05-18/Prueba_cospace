"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Space, SpaceType } from "@/lib/prisma";
import { useI18n } from "@/lib/i18n/context";

export default function AdminPage() {
  const { t } = useI18n();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<SpaceType>(SpaceType.DESK);
  const [capacity, setCapacity] = useState<number>(1);
  const [pricePerHour, setPricePerHour] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80"
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const fetchSpaces = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/spaces", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setSpaces(json.data);
      }
    } catch (err: unknown) {
      console.error("Error al cargar espacios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const handleCreateSpace = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          type,
          capacity: Number(capacity),
          pricePerHour: Number(pricePerHour),
          imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Error al crear el espacio");
      }

      setActionSuccess(t.admin.createSuccess);
      setName("");
      setDescription("");
      setCapacity(1);
      setPricePerHour(10);
      setSpaces((prev) => [data.data, ...prev]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Error al crear espacio");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (spaceId: string): Promise<void> => {
    if (!confirm(t.admin.deactivateConfirm)) return;

    setActionError(null);
    setActionSuccess(null);
    setDeactivatingId(spaceId);

    try {
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "No se pudo desactivar el espacio");
      }

      setActionSuccess(t.admin.deactivateSuccess);
      setSpaces((prev) =>
        prev.map((s) => (s.id === spaceId ? { ...s, isActive: false } : s))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Error al desactivar el espacio");
      }
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          {t.admin.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.admin.subtitle}</p>
      </div>

      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          ⚠️ {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
          ✅ {actionSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario de Creación */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-purple-100 shadow-sm h-fit">
          <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-purple-100/60">
            {t.admin.createNewSpace}
          </h2>

          <form onSubmit={handleCreateSpace} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.admin.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej. Hot Desk Creativo A3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.admin.description}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                rows={3}
                placeholder="Mínimo 10 caracteres describiendo equipamiento..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.admin.type}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SpaceType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={SpaceType.DESK}>Escritorio (DESK)</option>
                  <option value={SpaceType.MEETING_ROOM}>Sala (MEETING_ROOM)</option>
                  <option value={SpaceType.BOOTH}>Cabina (BOOTH)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.admin.capacity}
                </label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.admin.price}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={1}
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(parseFloat(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.admin.imageUrl}
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs text-sm mt-2 cursor-pointer"
            >
              {submitting ? "Creando..." : t.admin.createBtn}
            </button>
          </form>
        </div>

        {/* Listado de Espacios Existentes */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-base font-bold text-slate-800 pb-2 border-b border-purple-100/60">
            {t.admin.existingSpaces} ({spaces.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-purple-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {spaces.map((sp) => (
                <div
                  key={sp.id}
                  className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-purple-100/60">
                      <Image
                        src={sp.imageUrl}
                        alt={sp.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{sp.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sp.isActive
                              ? "bg-purple-100 text-purple-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {sp.isActive ? t.admin.activeStatus : t.admin.inactiveStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sp.type} • {sp.capacity} personas • ${sp.pricePerHour}/h
                      </p>
                    </div>
                  </div>

                  {sp.isActive && (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(sp.id)}
                      disabled={deactivatingId === sp.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shrink-0 cursor-pointer"
                    >
                      {deactivatingId === sp.id ? "Procesando..." : t.admin.deactivateBtn}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

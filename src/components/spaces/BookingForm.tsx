"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Space } from "@/lib/prisma";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";

interface BookingFormProps {
  space: Space;
}

export function BookingForm({ space }: BookingFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();

  const today = new Date();
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const minDateStr: string = today.toISOString().split("T")[0];
  const maxDateStr: string = maxDate.toISOString().split("T")[0];

  const [date, setDate] = useState<string>(minDateStr);
  const [startHour, setStartHour] = useState<number>(9);
  const [duration, setDuration] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const maxStartHour: number = 21 - duration;
  const startHourOptions: number[] = [];
  for (let h = 7; h <= 20; h++) {
    startHourOptions.push(h);
  }

  const calculatedTotal: number = Math.round(duration * space.pricePerHour * 100) / 100;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const startHourStr: string = String(startHour).padStart(2, "0");
      const endHour: number = startHour + duration;
      const endHourStr: string = String(endHour).padStart(2, "0");

      const startTimeIso: string = `${date}T${startHourStr}:00:00-05:00`;
      const endTimeIso: string = `${date}T${endHourStr}:00:00-05:00`;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: space.id,
          startTime: startTimeIso,
          endTime: endTimeIso,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al procesar la reserva");
      }

      setSuccessMsg(t.spaceDetail.bookingSuccess);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Error desconocido al reservar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-purple-100 shadow-sm">
      <div className="mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
          Configuración de Reserva
        </span>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          {t.spaceDetail.reserveTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.spaceDetail.hoursRangeNote}</p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t.spaceDetail.date}
          </label>
          <input
            type="date"
            value={date}
            min={minDateStr}
            max={maxDateStr}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          />
        </div>

        {/* Hora de Inicio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t.spaceDetail.startHour}
          </label>
          <select
            value={startHour}
            onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            {startHourOptions.map((h) => (
              <option key={h} value={h} disabled={h > maxStartHour}>
                {String(h).padStart(2, "0")}:00 {h > maxStartHour ? "(Excede 21:00)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t.spaceDetail.duration}
          </label>
          <select
            value={duration}
            onChange={(e) => {
              const newDur = parseInt(e.target.value, 10);
              setDuration(newDur);
              if (startHour + newDur > 21) {
                setStartHour(21 - newDur);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value={1}>1 {t.spaceDetail.hoursOption}</option>
            <option value={2}>2 {t.spaceDetail.hoursOption}</option>
            <option value={3}>3 {t.spaceDetail.hoursOption}</option>
            <option value={4}>4 {t.spaceDetail.hoursOption}</option>
          </select>
        </div>

        {/* Resumen del Precio */}
        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/70 flex items-center justify-between my-2">
          <span className="text-xs font-bold text-slate-600">
            {t.spaceDetail.totalPrice}:
          </span>
          <span className="text-2xl font-black text-purple-600">
            ${calculatedTotal.toFixed(2)} USD
          </span>
        </div>

        {/* Botón de Envío o Aviso de Login */}
        {user ? (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            {loading ? "Procesando..." : t.spaceDetail.confirmBooking}
          </button>
        ) : (
          <div className="text-center pt-1">
            <p className="text-xs text-purple-900 mb-3 bg-purple-50 p-2.5 rounded-xl border border-purple-100 font-medium">
              {t.spaceDetail.mustLoginToReserve}
            </p>
            <Link
              href={`/login?redirect=/spaces/${space.id}`}
              className="inline-block w-full py-2.5 px-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 text-xs transition-colors shadow-xs"
            >
              Iniciar Sesión para Reservar
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}

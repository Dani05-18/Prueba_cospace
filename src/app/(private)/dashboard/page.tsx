"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Booking, Space, BookingStatus } from "@/lib/prisma";
import { useI18n } from "@/lib/i18n/context";

// Estrategia exigida por la prueba: CSR (Client-Side Rendering)
interface BookingWithSpace extends Booking {
  space: Space;
}

export default function DashboardPage() {
  const { t, language } = useI18n();
  const [bookings, setBookings] = useState<BookingWithSpace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setBookings(json.data);
      }
    } catch (err: unknown) {
      console.error("Error al cargar reservas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId: string): Promise<void> => {
    if (!confirm(t.dashboard.cancelConfirm)) return;

    setActionError(null);
    setActionSuccess(null);
    setCancellingId(bookingId);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "No se pudo cancelar la reserva");
      }

      setActionSuccess(t.dashboard.cancelSuccess);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: BookingStatus.CANCELLED } : b
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Error al cancelar la reserva");
      }
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (isoString: string | Date): string => {
    const d = new Date(isoString);
    return d.toLocaleDateString(language === "es" ? "es-CO" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "America/Bogota",
    });
  };

  const formatHour = (isoString: string | Date): string => {
    const d = new Date(isoString);
    return d.toLocaleTimeString(language === "es" ? "es-CO" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bogota",
      hour12: true,
    });
  };

  const isEligibleToCancel = (startTimeIso: string | Date): boolean => {
    const start = new Date(startTimeIso).getTime();
    const now = Date.now();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return start - now >= twoHoursInMs;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        <Link
          href="/spaces"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          + {t.dashboard.exploreSpaces}
        </Link>
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

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-purple-100 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-purple-100 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
            📅
          </div>
          <p className="text-slate-600 text-sm font-medium mb-5">
            {t.dashboard.noBookings}
          </p>
          <Link
            href="/spaces"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            {t.dashboard.exploreSpaces}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const canCancel: boolean =
              booking.status === BookingStatus.CONFIRMED &&
              isEligibleToCancel(booking.startTime);

            return (
              <div
                key={booking.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Info del Espacio */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-purple-100/60">
                    <Image
                      src={booking.space.imageUrl}
                      alt={booking.space.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-slate-800 text-base">
                        {booking.space.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          booking.status === BookingStatus.CONFIRMED
                            ? "bg-purple-100 text-purple-700 border border-purple-200/60"
                            : "bg-slate-100 text-slate-500 line-through"
                        }`}
                      >
                        {booking.status === BookingStatus.CONFIRMED
                          ? t.dashboard.statusConfirmed
                          : t.dashboard.statusCancelled}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>
                        📅 <strong>{formatDate(booking.startTime)}</strong>
                      </p>
                      <p>
                        ⏰ {formatHour(booking.startTime)} - {formatHour(booking.endTime)}{" "}
                        <span className="text-slate-400">(Bogotá UTC-5)</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Precio y Botón de Cancelación */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-purple-100/60">
                  <div className="text-left md:text-right">
                    <span className="block text-[11px] text-slate-400 font-medium uppercase">
                      {t.dashboard.totalLabel}
                    </span>
                    <span className="text-xl font-black text-purple-600">
                      ${booking.totalPrice.toFixed(2)} USD
                    </span>
                  </div>

                  {booking.status === BookingStatus.CONFIRMED && (
                    <div>
                      {canCancel ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                        >
                          {cancellingId === booking.id ? "Cancelando..." : t.dashboard.cancelBtn}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic block max-w-[150px] text-right">
                          {t.dashboard.cannotCancelNote}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

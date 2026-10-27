import { describe, it, expect } from "vitest";
import {
  validateFullHours,
  validateOperatingHoursBogota,
  validateBookingWindow,
  calculateTotalPrice,
  isOverlapping,
  canUserCancel,
} from "./rules";

describe("Reglas de negocio para reservas (rules.ts)", () => {
  describe("validateFullHours", () => {
    it("debe rechazar reservas con minutos que no sean 00 (ej. 30 minutos o 1h 30m)", () => {
      const start = new Date("2026-10-28T14:30:00.000Z");
      const end = new Date("2026-10-28T15:30:00.000Z");
      const result = validateFullHours(start, end);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("horas completas");

      const startFraction = new Date("2026-10-28T14:00:00.000Z");
      const endFraction = new Date("2026-10-28T15:30:00.000Z");
      const resultFraction = validateFullHours(startFraction, endFraction);
      expect(resultFraction.valid).toBe(false);
    });

    it("debe rechazar duraciones de 0 horas o negativas", () => {
      const start = new Date("2026-10-28T14:00:00.000Z");
      const endSame = new Date("2026-10-28T14:00:00.000Z");
      expect(validateFullHours(start, endSame).valid).toBe(false);

      const endPast = new Date("2026-10-28T13:00:00.000Z");
      expect(validateFullHours(start, endPast).valid).toBe(false);
    });

    it("debe rechazar duraciones mayores a 4 horas (ej. 5 horas)", () => {
      const start = new Date("2026-10-28T14:00:00.000Z");
      const end5h = new Date("2026-10-28T19:00:00.000Z");
      const result5h = validateFullHours(start, end5h);
      expect(result5h.valid).toBe(false);
      expect(result5h.reason).toContain("entre 1 y 4 horas");
    });

    it("debe aceptar duraciones límites de 1 hora y 4 horas exactas", () => {
      const start = new Date("2026-10-28T14:00:00.000Z");
      const end1h = new Date("2026-10-28T15:00:00.000Z");
      const result1h = validateFullHours(start, end1h);
      expect(result1h.valid).toBe(true);
      expect(result1h.durationHours).toBe(1);

      const end4h = new Date("2026-10-28T18:00:00.000Z");
      const result4h = validateFullHours(start, end4h);
      expect(result4h.valid).toBe(true);
      expect(result4h.durationHours).toBe(4);
    });
  });

  describe("validateOperatingHoursBogota", () => {
    it("debe rechazar reservas antes de las 7:00 AM hora Bogotá (ej. 6:00 AM)", () => {
      // 06:00 AM Bogotá es 11:00 UTC
      const start = new Date("2026-10-28T11:00:00.000Z");
      const end = new Date("2026-10-28T13:00:00.000Z"); // 08:00 AM Bogotá
      const result = validateOperatingHoursBogota(start, end);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("07:00");
    });

    it("debe rechazar reservas que finalicen después de las 21:00 hora Bogotá (ej. 22:00)", () => {
      // 20:00 Bogotá es 01:00 UTC del 29 de octubre
      // 22:00 Bogotá es 03:00 UTC del 29 de octubre
      const start = new Date("2026-10-29T01:00:00.000Z");
      const end = new Date("2026-10-29T03:00:00.000Z");
      const result = validateOperatingHoursBogota(start, end);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("21:00");
    });

    it("debe rechazar reservas que crucen la medianoche", () => {
      // Inicio 20:00 Bogotá (01:00 UTC) y fin 01:00 Bogotá del día siguiente (06:00 UTC)
      const start = new Date("2026-10-29T01:00:00.000Z");
      const end = new Date("2026-10-29T06:00:00.000Z");
      const result = validateOperatingHoursBogota(start, end);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("mismo día");
    });

    it("debe aceptar el horario límite de apertura (7:00 a 9:00 AM Bogotá)", () => {
      // 07:00 Bogotá es 12:00 UTC
      // 09:00 Bogotá es 14:00 UTC
      const start = new Date("2026-10-28T12:00:00.000Z");
      const end = new Date("2026-10-28T14:00:00.000Z");
      const result = validateOperatingHoursBogota(start, end);
      expect(result.valid).toBe(true);
    });

    it("debe aceptar el horario límite de cierre (19:00 a 21:00 Bogotá)", () => {
      // 19:00 Bogotá es 00:00 UTC del 29 de octubre
      // 21:00 Bogotá es 02:00 UTC del 29 de octubre
      const start = new Date("2026-10-29T00:00:00.000Z");
      const end = new Date("2026-10-29T02:00:00.000Z");
      const result = validateOperatingHoursBogota(start, end);
      expect(result.valid).toBe(true);
    });
  });

  describe("validateBookingWindow", () => {
    it("debe rechazar reservas en el pasado", () => {
      const now = new Date("2026-10-28T12:00:00.000Z");
      const pastStart = new Date("2026-10-28T10:00:00.000Z");
      const result = validateBookingWindow(pastStart, now);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("pasado");
    });

    it("debe rechazar reservas a más de 30 días en el futuro (ej. 31 días)", () => {
      const now = new Date("2026-10-28T12:00:00.000Z");
      const futureStart = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
      const result = validateBookingWindow(futureStart, now);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("30 días");
    });

    it("debe aceptar reservas dentro del rango de 30 días", () => {
      const now = new Date("2026-10-28T12:00:00.000Z");
      const validStart = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const result = validateBookingWindow(validStart, now);
      expect(result.valid).toBe(true);
    });
  });

  describe("isOverlapping", () => {
    it("debe detectar solapamiento si los rangos se cruzan en cualquier punto", () => {
      const startA = new Date("2026-10-28T10:00:00.000Z");
      const endA = new Date("2026-10-28T12:00:00.000Z");

      const startB = new Date("2026-10-28T11:00:00.000Z");
      const endB = new Date("2026-10-28T13:00:00.000Z");

      expect(isOverlapping(startA, endA, startB, endB)).toBe(true);
      expect(isOverlapping(startB, endB, startA, endA)).toBe(true);
    });

    it("debe detectar solapamiento si un intervalo está completamente contenido en otro", () => {
      const startA = new Date("2026-10-28T10:00:00.000Z");
      const endA = new Date("2026-10-28T14:00:00.000Z");

      const startB = new Date("2026-10-28T11:00:00.000Z");
      const endB = new Date("2026-10-28T12:00:00.000Z");

      expect(isOverlapping(startA, endA, startB, endB)).toBe(true);
    });

    it("NO debe considerar solapadas dos reservas consecutivas (12:00-14:00 y 14:00-16:00)", () => {
      const startA = new Date("2026-10-28T12:00:00.000Z");
      const endA = new Date("2026-10-28T14:00:00.000Z");

      const startB = new Date("2026-10-28T14:00:00.000Z");
      const endB = new Date("2026-10-28T16:00:00.000Z");

      expect(isOverlapping(startA, endA, startB, endB)).toBe(false);
      expect(isOverlapping(startB, endB, startA, endA)).toBe(false);
    });
  });

  describe("calculateTotalPrice", () => {
    it("debe calcular correctamente el precio en horas × precio unitario", () => {
      expect(calculateTotalPrice(1, 10.0)).toBe(10.0);
      expect(calculateTotalPrice(2, 8.5)).toBe(17.0);
      expect(calculateTotalPrice(4, 35.0)).toBe(140.0);
      expect(calculateTotalPrice(3, 8.333)).toBe(25.0);
    });
  });

  describe("canUserCancel", () => {
    it("debe permitir cancelar si faltan más de 2 horas para el inicio", () => {
      const now = new Date("2026-10-28T10:00:00.000Z");
      const bookingStart = new Date("2026-10-28T13:00:00.000Z"); // 3 horas de diferencia
      const result = canUserCancel(bookingStart, now);
      expect(result.valid).toBe(true);
    });

    it("debe permitir cancelar exactamente a las 2 horas antes del inicio", () => {
      const now = new Date("2026-10-28T10:00:00.000Z");
      const bookingStart = new Date("2026-10-28T12:00:00.000Z"); // 2 horas exactas
      const result = canUserCancel(bookingStart, now);
      expect(result.valid).toBe(true);
    });

    it("debe rechazar cancelación si faltan menos de 2 horas para el inicio", () => {
      const now = new Date("2026-10-28T10:00:00.000Z");
      const bookingStart = new Date("2026-10-28T11:59:59.000Z"); // Menos de 2 horas
      const result = canUserCancel(bookingStart, now);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("2 horas");
    });

    it("debe rechazar cancelación si la reserva ya inició o está en el pasado", () => {
      const now = new Date("2026-10-28T12:00:00.000Z");
      const bookingStart = new Date("2026-10-28T11:00:00.000Z");
      const result = canUserCancel(bookingStart, now);
      expect(result.valid).toBe(false);
    });
  });
});


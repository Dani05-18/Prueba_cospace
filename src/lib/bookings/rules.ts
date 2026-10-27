export interface BogotaDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface RuleValidationResult {
  valid: boolean;
  reason?: string;
}

export interface DurationValidationResult {
  valid: boolean;
  durationHours: number;
  reason?: string;
}

/**
 * Obtiene los componentes de fecha y hora en la zona horaria America/Bogota (UTC-5)
 */
export function getBogotaParts(date: Date): BogotaDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, number> = {};

  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = parseInt(p.value, 10);
    }
  }

  return {
    year: map.year || 0,
    month: map.month || 0,
    day: map.day || 0,
    hour: map.hour || 0,
    minute: map.minute || 0,
    second: map.second || 0,
  };
}

/**
 * Regla: Una reserva dura entre 1 y 4 horas, en horas completas (minutos y segundos en 0).
 */
export function validateFullHours(start: Date, end: Date): DurationValidationResult {
  const diffMs: number = end.getTime() - start.getTime();

  if (diffMs <= 0) {
    return {
      valid: false,
      durationHours: 0,
      reason: "La fecha y hora de fin debe ser posterior a la fecha y hora de inicio",
    };
  }

  const startBogota = getBogotaParts(start);
  const endBogota = getBogotaParts(end);

  if (
    startBogota.minute !== 0 ||
    startBogota.second !== 0 ||
    start.getMilliseconds() !== 0 ||
    endBogota.minute !== 0 ||
    endBogota.second !== 0 ||
    end.getMilliseconds() !== 0
  ) {
    return {
      valid: false,
      durationHours: 0,
      reason: "Las reservas deben ser en horas completas (minutos y segundos en 00:00)",
    };
  }

  const durationHours: number = diffMs / (1000 * 60 * 60);

  if (!Number.isInteger(durationHours)) {
    return {
      valid: false,
      durationHours,
      reason: "La duración debe ser un número entero de horas",
    };
  }

  if (durationHours < 1 || durationHours > 4) {
    return {
      valid: false,
      durationHours,
      reason: `La duración debe ser entre 1 y 4 horas. Duración solicitada: ${durationHours} horas`,
    };
  }

  return {
    valid: true,
    durationHours,
  };
}

/**
 * Regla: Solo se puede reservar entre las 7:00 y las 21:00 en zona horaria America/Bogota.
 */
export function validateOperatingHoursBogota(start: Date, end: Date): RuleValidationResult {
  const startParts = getBogotaParts(start);
  const endParts = getBogotaParts(end);

  const isSameDay: boolean =
    startParts.year === endParts.year &&
    startParts.month === endParts.month &&
    startParts.day === endParts.day;

  if (!isSameDay) {
    return {
      valid: false,
      reason: "La reserva debe iniciar y finalizar dentro del mismo día calendario (zona Bogotá)",
    };
  }

  if (startParts.hour < 7) {
    return {
      valid: false,
      reason: `No se puede reservar antes de las 07:00 hora Bogotá. Hora inicio: ${startParts.hour}:00`,
    };
  }

  if (endParts.hour > 21) {
    return {
      valid: false,
      reason: `No se puede reservar después de las 21:00 hora Bogotá. Hora fin: ${endParts.hour}:00`,
    };
  }

  return { valid: true };
}

/**
 * Regla: No se puede reservar en el pasado ni con más de 30 días de anticipación.
 */
export function validateBookingWindow(start: Date, now: Date = new Date()): RuleValidationResult {
  if (start.getTime() < now.getTime()) {
    return {
      valid: false,
      reason: "No se puede realizar una reserva en el pasado",
    };
  }

  const maxAllowedTime: number = now.getTime() + 30 * 24 * 60 * 60 * 1000;
  if (start.getTime() > maxAllowedTime) {
    return {
      valid: false,
      reason: "No se puede reservar con más de 30 días de anticipación",
    };
  }

  return { valid: true };
}

/**
 * Regla: El precio total de la reserva lo calcula el servidor (horas × precio por hora).
 */
export function calculateTotalPrice(durationHours: number, pricePerHour: number): number {
  const rawPrice: number = durationHours * pricePerHour;
  return Math.round(rawPrice * 100) / 100;
}

/**
 * Regla: Dos intervalos [startA, endA] y [startB, endB] se solapan si startA < endB && endA > startB.
 * Si una termina a las 12:00 y la otra empieza a las 12:00, NO se solapan.
 */
export function isOverlapping(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Regla: Cancelación.
 * Un usuario puede cancelar su reserva hasta 2 horas antes de su inicio.
 */
export function canUserCancel(bookingStartTime: Date, now: Date = new Date()): RuleValidationResult {
  const twoHoursInMs: number = 2 * 60 * 60 * 1000;
  const timeUntilStart: number = bookingStartTime.getTime() - now.getTime();

  if (timeUntilStart < twoHoursInMs) {
    return {
      valid: false,
      reason: "Solo es posible cancelar una reserva con al menos 2 horas de anticipación a su inicio",
    };
  }

  return { valid: true };
}


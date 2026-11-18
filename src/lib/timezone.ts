/**
 * Time-zone helpers built on the platform's IANA database (Intl).
 *
 * Nothing here is hard-coded to a region: the browser already ships the full
 * worldwide time-zone rules, including daylight-saving transitions, so prayer
 * times can be computed for *the selected city* rather than the phone's own
 * zone. No network request and no paid service is involved.
 */

/** The device's own zone, with a safe fallback for very old browsers. */
export function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const validityCache = new Map<string, boolean>();

/** True when the runtime recognises the IANA zone name. */
export function isValidTimeZone(timeZone: string | undefined | null): boolean {
  if (!timeZone) return false;
  const cached = validityCache.get(timeZone);
  if (cached !== undefined) return cached;
  let ok = true;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
  } catch {
    ok = false;
  }
  validityCache.set(timeZone, ok);
  return ok;
}

interface CivilDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function partsInZone(date: Date, timeZone: string): CivilDate {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    // Some engines report midnight as hour 24.
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  };
}

/**
 * Offset of `timeZone` from UTC, in hours, at the given instant.
 * Positive east of Greenwich (e.g. Asia/Riyadh → 3), negative west.
 */
export function zoneOffsetHours(timeZone: string, date: Date = new Date()): number {
  if (!isValidTimeZone(timeZone)) return -date.getTimezoneOffset() / 60;
  const p = partsInZone(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (asUtc - date.getTime()) / 3_600_000;
}

/** The calendar date currently shown by a zone's clocks. */
export function civilDateInZone(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number } {
  if (!isValidTimeZone(timeZone)) {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }
  const p = partsInZone(date, timeZone);
  return { year: p.year, month: p.month, day: p.day };
}

/** "GMT+03:00" style label for the selected zone. */
export function timeZoneOffsetLabel(timeZone: string, date: Date = new Date()): string {
  const offset = zoneOffsetHours(timeZone, date);
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `GMT${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Formats an instant using a specific zone's wall clock. */
export function formatInZone(
  date: Date,
  timeZone: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  try {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

/**
 * Builds the UTC instant for a wall-clock time on a given civil date in a zone.
 * Used to turn computed prayer hours into real, comparable timestamps.
 */
export function zonedInstant(
  year: number,
  month: number,
  day: number,
  hours: number,
  timeZone: string,
): Date {
  const base = Date.UTC(year, month - 1, day);
  // First approximation, then correct once using the offset at that instant so
  // daylight-saving transitions on the same day resolve correctly.
  const guess = new Date(base + hours * 3_600_000 - zoneOffsetHours(timeZone, new Date(base)) * 3_600_000);
  const refined = new Date(base + hours * 3_600_000 - zoneOffsetHours(timeZone, guess) * 3_600_000);
  return refined;
}

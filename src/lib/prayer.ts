/**
 * Prayer-time computation performed entirely on the device.
 * Implements the standard solar equations used by PrayTimes.org
 * (Julian date, solar declination, equation of time, hour angles).
 * No API key, no network request, no paid service.
 */

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface MethodDef {
  id: string;
  name: { en: string; ar: string };
  fajr: number;
  isha: number;
  /** When set, Isha is a fixed number of minutes after Maghrib. */
  ishaMinutes?: number;
  maghribMinutes?: number;
}

export const METHODS: MethodDef[] = [
  {
    id: 'MWL',
    name: { en: 'Muslim World League', ar: 'رابطة العالم الإسلامي' },
    fajr: 18,
    isha: 17,
  },
  {
    id: 'UMM_AL_QURA',
    name: { en: 'Umm al-Qura, Makkah', ar: 'أم القرى، مكة المكرمة' },
    fajr: 18.5,
    isha: 0,
    ishaMinutes: 90,
  },
  {
    id: 'EGYPT',
    name: { en: 'Egyptian General Authority', ar: 'الهيئة المصرية العامة للمساحة' },
    fajr: 19.5,
    isha: 17.5,
  },
  {
    id: 'KARACHI',
    name: { en: 'University of Islamic Sciences, Karachi', ar: 'جامعة العلوم الإسلامية، كراتشي' },
    fajr: 18,
    isha: 18,
  },
  {
    id: 'ISNA',
    name: { en: 'Islamic Society of North America', ar: 'الجمعية الإسلامية لأمريكا الشمالية' },
    fajr: 15,
    isha: 15,
  },
  {
    id: 'KUWAIT',
    name: { en: 'Kuwait', ar: 'الكويت' },
    fajr: 18,
    isha: 17.5,
  },
  {
    id: 'QATAR',
    name: { en: 'Qatar', ar: 'قطر' },
    fajr: 18,
    isha: 0,
    ishaMinutes: 90,
  },
  {
    id: 'DUBAI',
    name: { en: 'Dubai / UAE', ar: 'دبي / الإمارات' },
    fajr: 18.2,
    isha: 18.2,
  },
  {
    id: 'TURKEY',
    name: { en: 'Diyanet, Turkey', ar: 'ديانت، تركيا' },
    fajr: 18,
    isha: 17,
  },
  {
    id: 'SINGAPORE',
    name: { en: 'Singapore / MUIS', ar: 'سنغافورة / MUIS' },
    fajr: 20,
    isha: 18,
  },
  {
    id: 'MOONSIGHTING',
    name: { en: 'Moonsighting Committee', ar: 'لجنة رؤية الهلال' },
    fajr: 18,
    isha: 18,
  },
  {
    id: 'TEHRAN',
    name: { en: 'Tehran', ar: 'طهران' },
    fajr: 17.7,
    isha: 14,
    maghribMinutes: 4.5,
  },
];

/** How Fajr and Isha are capped when the sun never reaches the angle. */
export type HighLatitudeRule = 'none' | 'middle' | 'seventh' | 'angle';

export const HIGH_LATITUDE_RULES: HighLatitudeRule[] = ['middle', 'seventh', 'angle', 'none'];

export const HIGH_LATITUDE_LABELS: Record<
  HighLatitudeRule,
  { en: string; ar: string }
> = {
  middle: { en: 'Middle of the night', ar: 'منتصف الليل' },
  seventh: { en: 'One-seventh of the night', ar: 'سُبع الليل' },
  angle: { en: 'Angle-based (Diyanet style)', ar: 'حسب الزاوية' },
  none: { en: 'No adjustment', ar: 'بدون تعديل' },
};

/** Looks a method up by id, falling back to the first entry. */
export function methodById(id: string | undefined): MethodDef {
  return METHODS.find((m) => m.id === id) ?? METHODS[0];
}

/**
 * Share of the night (in hours) that Fajr and Isha may not exceed.
 * Returned as a cap measured from sunrise (Fajr) and sunset (Isha).
 */
function nightPortion(rule: HighLatitudeRule, method: MethodDef, night: number): number | null {
  if (!Number.isFinite(night) || night <= 0) return null;
  switch (rule) {
    case 'middle':
      return night / 2;
    case 'seventh':
      return night / 7;
    case 'angle':
      return (night * Math.min(18, Math.max(1, method.fajr))) / 60;
    default:
      return null;
  }
}

import { civilDateInZone, isValidTimeZone, zoneOffsetHours, zonedInstant } from './timezone';

export const DEFAULT_METHOD = 'MWL';

const DEG = Math.PI / 180;

const sin = (d: number) => Math.sin(d * DEG);
const cos = (d: number) => Math.cos(d * DEG);
const tan = (d: number) => Math.tan(d * DEG);
const arcsin = (x: number) => Math.asin(x) / DEG;
const arccos = (x: number) => Math.acos(x) / DEG;
const arctan2 = (y: number, x: number) => Math.atan2(y, x) / DEG;
const arccot = (x: number) => Math.atan(1 / x) / DEG;
const fixHour = (h: number) => ((h % 24) + 24) % 24;

function julianDate(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5
  );
}

function sunPosition(jd: number) {
  const d = jd - 2451545.0;
  const g = fixHour(357.529 + 0.98560028 * d);
  const q = fixHour(280.459 + 0.98564736 * d);
  const L = fixHour(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * d;
  const RA = fixHour(arctan2(cos(e) * sin(L), cos(L)) / 15);
  const declination = arcsin(sin(e) * sin(L));
  const eqt = q / 15 - RA;
  return { declination, equation: eqt };
}

interface TimeSet {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

/** Returns prayer times as fractional hours in the given timezone. */
function computeRaw(
  civil: { year: number; month: number; day: number },
  coords: Coords,
  method: MethodDef,
  asrShadow: number,
  tzOffsetHours: number,
  highLatitude: HighLatitudeRule,
): TimeSet {
  const jd =
    julianDate(civil.year, civil.month, civil.day) -
    coords.longitude / (15 * 24);
  const { declination: decl, equation } = sunPosition(jd);

  const dhuhr = fixHour(12 + tzOffsetHours - coords.longitude / 15 - equation);

  const hourAngle = (altitude: number): number => {
    const numerator = sin(altitude) - sin(decl) * sin(coords.latitude);
    const denominator = cos(decl) * cos(coords.latitude);
    const ratio = numerator / denominator;
    if (ratio > 1 || ratio < -1) return NaN;
    return arccos(ratio) / 15;
  };

  const T = (angle: number, before = true): number => {
    const h = hourAngle(-angle);
    if (Number.isNaN(h)) return NaN;
    return dhuhr + (before ? -h : h);
  };

  // Asr: shadow length equals `asrShadow` times the object's length.
  const asrAltitude = arccot(asrShadow + tan(Math.abs(coords.latitude - decl)));
  // hourAngle() already returns hours, so it is added to Dhuhr directly.
  const asrHourAngle = hourAngle(asrAltitude);

  let fajr = T(method.fajr);
  const sunrise = T(0.833);
  const maghribBase = T(0.833, false);
  const asr = dhuhr + (Number.isNaN(asrHourAngle) ? 3 : asrHourAngle);

  const maghrib =
    method.maghribMinutes != null
      ? maghribBase + method.maghribMinutes / 60
      : maghribBase;

  let isha: number;
  if (method.ishaMinutes != null) {
    isha = maghrib + method.ishaMinutes / 60;
  } else {
    isha = T(method.isha, false);
  }

  // High-latitude handling. Above roughly 48° the sun can fail to reach the
  // Fajr/Isha depression angle in summer, and in winter the angle-based time
  // can land outside a sensible share of the night. The chosen rule caps both
  // prayers at a fraction of the night measured from sunrise and sunset, and
  // is used outright when the angle is unreachable.
  const night = fixHour(sunrise + 24 - maghribBase);
  const cap = nightPortion(highLatitude, method, night);
  const fallback = cap ?? (Number.isFinite(night) && night > 0 ? night / 2 : 6);

  if (!Number.isFinite(fajr)) {
    fajr = sunrise - fallback;
  } else if (cap != null && fajr < sunrise - cap) {
    fajr = sunrise - cap;
  }

  if (!Number.isFinite(isha)) {
    isha = maghribBase + fallback;
  } else if (cap != null && isha > maghribBase + cap) {
    isha = maghribBase + cap;
  }

  return { fajr, sunrise, dhuhr, asr, maghrib, isha };
}

export interface PrayerTimes {
  date: Date;
  times: Record<PrayerKey, Date>;
  method: MethodDef;
  /** IANA zone the times were computed for, when one was supplied. */
  timeZone?: string;
}

export function getPrayerTimes(
  date: Date,
  coords: Coords,
  methodId: string = DEFAULT_METHOD,
  madhab: 'shafii' | 'hanafi' = 'shafii',
  timeZone?: string,
  highLatitude: HighLatitudeRule = 'seventh',
): PrayerTimes {
  const method = methodById(methodId);
  const asrShadow = madhab === 'hanafi' ? 2 : 1;
  // When the selected location's IANA zone is known the times are anchored to
  // that zone's wall clock, so a city abroad shows its own local prayer times
  // regardless of where the phone happens to be. Otherwise the device zone is
  // used, exactly as before.
  const zone = timeZone && isValidTimeZone(timeZone) ? timeZone : undefined;
  const tzOffsetHours = zone ? zoneOffsetHours(zone, date) : -date.getTimezoneOffset() / 60;
  const civil = zone
    ? civilDateInZone(date, zone)
    : { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  const raw = computeRaw(civil, coords, method, asrShadow, tzOffsetHours, highLatitude);

  const toDate = (hours: number): Date => {
    if (zone) {
      return zonedInstant(civil.year, civil.month, civil.day, fixHour(hours), zone);
    }
    const d = new Date(civil.year, civil.month - 1, civil.day);
    d.setMinutes(Math.round(fixHour(hours) * 60));
    return d;
  };

  return {
    date,
    method,
    timeZone: zone,
    times: {
      fajr: toDate(raw.fajr),
      sunrise: toDate(raw.sunrise),
      dhuhr: toDate(raw.dhuhr),
      asr: toDate(raw.asr),
      maghrib: toDate(raw.maghrib),
      isha: toDate(raw.isha),
    },
  };
}

export const PRAYER_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function nextPrayer(
  times: Record<PrayerKey, Date>,
  now: Date = new Date(),
): { key: PrayerKey; at: Date; remainingMs: number } {
  const entries = PRAYER_ORDER.filter((k) => k !== 'sunrise').map((k) => ({
    key: k,
    at: times[k],
  }));
  for (const e of entries) {
    if (e.at.getTime() > now.getTime()) {
      return { ...e, remainingMs: e.at.getTime() - now.getTime() };
    }
  }
  // After Isha: next is tomorrow's Fajr.
  const tomorrow = new Date(times.fajr);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { key: 'fajr', at: tomorrow, remainingMs: tomorrow.getTime() - now.getTime() };
}

export function formatTime(
  d: Date,
  lang: 'en' | 'ar',
  hour12 = true,
  timeZone?: string,
): string {
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12,
      ...(timeZone ? { timeZone } : {}),
    }).format(d);
  } catch {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** City presets so location works even when geolocation is blocked. */
export const CITY_PRESETS: { name: string; nameAr: string; latitude: number; longitude: number }[] = [
  { name: 'Makkah', nameAr: 'مكة المكرمة', latitude: 21.4225, longitude: 39.8262 },
  { name: 'Madinah', nameAr: 'المدينة المنورة', latitude: 24.4672, longitude: 39.6111 },
  { name: 'Jerusalem', nameAr: 'القدس', latitude: 31.7767, longitude: 35.2345 },
  { name: 'Cairo', nameAr: 'القاهرة', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Istanbul', nameAr: 'إسطنبول', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Dubai', nameAr: 'دبي', latitude: 25.2048, longitude: 55.2708 },
  { name: 'London', nameAr: 'لندن', latitude: 51.5072, longitude: -0.1276 },
  { name: 'Paris', nameAr: 'باريس', latitude: 48.8566, longitude: 2.3522 },
  { name: 'New York', nameAr: 'نيويورك', latitude: 40.7128, longitude: -74.006 },
  { name: 'Toronto', nameAr: 'تورونتو', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Kuala Lumpur', nameAr: 'كوالالمبور', latitude: 3.139, longitude: 101.6869 },
  { name: 'Jakarta', nameAr: 'جاكرتا', latitude: -6.2088, longitude: 106.8456 },
  { name: 'Karachi', nameAr: 'كراتشي', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Lagos', nameAr: 'لاغوس', latitude: 6.5244, longitude: 3.3792 },
  { name: 'Nairobi', nameAr: 'نيروبي', latitude: -1.2921, longitude: 36.8219 },
  { name: 'Sydney', nameAr: 'سيدني', latitude: -33.8688, longitude: 151.2093 },
];

/** Qibla bearing + Hijri calendar helpers. */

export const KAABA = { latitude: 21.4224779, longitude: 39.8251832 };

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle initial bearing from a point to the Kaaba, in degrees from true north. */
export function qiblaBearing(latitude: number, longitude: number): number {
  const φ1 = toRad(latitude);
  const φ2 = toRad(KAABA.latitude);
  const Δλ = toRad(KAABA.longitude - longitude);
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/** Distance to the Kaaba in kilometres (haversine). */
export function distanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371;
  const dLat = toRad(KAABA.latitude - latitude);
  const dLon = toRad(KAABA.longitude - longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latitude)) * Math.cos(toRad(KAABA.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

/* ------------------------------- Hijri ---------------------------------- */

export interface HijriDate {
  year: number;
  month: number; // 1..12
  day: number;
}

const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

const HIJRI_MONTHS_AR = [
  'محرّم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

/**
 * Hijri conversion uses the browser's built-in Umm al-Qura calendar
 * (Intl `islamic-umalqura`), so no external API is required.
 */
export function toHijri(date: Date): HijriDate {
  const parts = getHijriParts(date);
  return { year: parts.year, month: parts.month, day: parts.day };
}

let hijriFormatter: Intl.DateTimeFormat | null = null;

function getHijriParts(date: Date): HijriDate {
  try {
    if (!hijriFormatter) {
      hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
    }
    const parts = hijriFormatter.formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
    const year = get('year');
    const month = get('month');
    const day = get('day');
    if (year && month && day) return { year, month, day };
  } catch {
    /* fall through to arithmetic conversion */
  }
  return arithmeticHijri(date);
}

/** Kuwaiti arithmetic algorithm — fallback for engines without Umm al-Qura. */
function arithmeticHijri(date: Date): HijriDate {
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  let jd =
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  month = Math.floor((24 * l) / 709);
  day = l - Math.floor((709 * month) / 24);
  year = 30 * n + j - 30;
  return { year, month: Math.min(12, Math.max(1, month)), day };
}

export function hijriMonthName(month: number, lang: 'en' | 'ar'): string {
  const idx = Math.min(11, Math.max(0, month - 1));
  return lang === 'ar' ? HIJRI_MONTHS_AR[idx] : HIJRI_MONTHS_EN[idx];
}

export function formatHijri(date: Date, lang: 'en' | 'ar', includeYear = true): string {
  const h = toHijri(date);
  const name = hijriMonthName(h.month, lang);
  if (lang === 'ar') {
    return includeYear ? `${h.day} ${name} ${h.year} هـ` : `${h.day} ${name}`;
  }
  return includeYear ? `${h.day} ${name} ${h.year} AH` : `${h.day} ${name}`;
}

/** Islamic occasions keyed by "month-day" in the Hijri calendar. */
export const ISLAMIC_OCCASIONS: { md: string; en: string; ar: string }[] = [
  { md: '1-1', en: 'Islamic New Year', ar: 'رأس السنة الهجرية' },
  { md: '1-10', en: 'Day of Ashura', ar: 'يوم عاشوراء' },
  { md: '3-12', en: 'Mawlid an-Nabi', ar: 'المولد النبوي' },
  { md: '7-27', en: "Isra' and Mi'raj", ar: 'الإسراء والمعراج' },
  { md: '8-15', en: 'Mid-Sha’ban', ar: 'ليلة النصف من شعبان' },
  { md: '9-1', en: 'Ramadan begins', ar: 'بداية رمضان' },
  { md: '9-27', en: 'Laylat al-Qadr (likely night)', ar: 'ليلة القدر (المرجّحة)' },
  { md: '10-1', en: 'Eid al-Fitr', ar: 'عيد الفطر' },
  { md: '12-9', en: 'Day of Arafah', ar: 'يوم عرفة' },
  { md: '12-10', en: 'Eid al-Adha', ar: 'عيد الأضحى' },
];

export function occasionFor(h: HijriDate): { en: string; ar: string } | undefined {
  return ISLAMIC_OCCASIONS.find((o) => o.md === `${h.month}-${h.day}`);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Gregorian date for the first day of a Hijri month (searched, Umm al-Qura based). */
export function hijriMonthStart(year: number, month: number): Date {
  const approx = new Date(year + 622, month - 1, 1);
  // Islamic years are ~354 days; estimate then correct.
  const estimate = new Date(
    approx.getFullYear() - 0,
    approx.getMonth(),
    approx.getDate(),
  );
  const target = estimate.getTime();
  let best = new Date(target);
  let bestDelta = Infinity;
  for (let offset = -45; offset <= 45; offset++) {
    const candidate = new Date(target + offset * 86400000);
    const h = toHijri(candidate);
    const delta = Math.abs(h.year - year) * 400 + Math.abs(h.month - month) * 32 + h.day;
    if (h.year === year && h.month === month && h.day === 1) return candidate;
    if (delta < bestDelta) {
      bestDelta = delta;
      best = candidate;
    }
  }
  // No exact day 1 found in range: walk forward to the closest match.
  for (let offset = 0; offset < 60; offset++) {
    const candidate = new Date(best.getTime() + offset * 86400000);
    const h = toHijri(candidate);
    if (h.year === year && h.month === month && h.day === 1) return candidate;
  }
  return best;
}

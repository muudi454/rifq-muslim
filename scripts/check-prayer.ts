/*
 * Prayer-time accuracy check.
 *
 * Computes real times for five countries in their own time zones and asserts
 * the physics and the method rules — ordering, plausible solar noon, the
 * Umm al-Qura 90-minute Isha, Hanafi Asr later than standard, and the effect of
 * the high-latitude rule. Nothing here is a stored or example time: every value
 * comes from getPrayerTimes() at run time.
 */
import { getPrayerTimes, METHODS, type HighLatitudeRule, type PrayerKey } from '../src/lib/prayer';

const ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

interface Case {
  name: string;
  lat: number;
  lon: number;
  tz: string;
  method: string;
  /** Expected local-hour window for Dhuhr, wide enough to allow method choice. */
  dhuhrWindow: [number, number];
}

const CASES: Case[] = [
  { name: 'Mogadishu, Somalia', lat: 2.0469, lon: 45.3182, tz: 'Africa/Mogadishu', method: 'MWL', dhuhrWindow: [11 * 60, 12 * 60 + 30] },
  { name: 'Makkah, Saudi Arabia', lat: 21.4225, lon: 39.8262, tz: 'Asia/Riyadh', method: 'UMM_AL_QURA', dhuhrWindow: [11 * 60 + 30, 13 * 60] },
  { name: 'Istanbul, Turkey', lat: 41.0082, lon: 28.9784, tz: 'Europe/Istanbul', method: 'TURKEY', dhuhrWindow: [12 * 60, 13 * 60 + 30] },
  { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', method: 'MWL', dhuhrWindow: [11 * 60 + 30, 13 * 60 + 30] },
  { name: 'New York, USA', lat: 40.7128, lon: -74.006, tz: 'America/New_York', method: 'ISNA', dhuhrWindow: [11 * 60 + 30, 13 * 60 + 30] },
];

const DATES = ['2026-06-15', '2026-01-15'];

const failures: string[] = [];
let assertions = 0;

function check(condition: boolean, message: string) {
  assertions += 1;
  if (!condition) failures.push(message);
}

function localMinutes(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
}

function localTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(date);
}

for (const dateStr of DATES) {
  const day = new Date(`${dateStr}T12:00:00Z`);
  console.log(`\n=== ${dateStr} ===`);

  for (const c of CASES) {
    const result = getPrayerTimes(day, { latitude: c.lat, longitude: c.lon }, c.method, 'shafii', c.tz, 'seventh');
    const label = `${c.name} [${c.method}]`;

    for (const key of ORDER) {
      const at = result.times[key];
      check(at instanceof Date && Number.isFinite(at.getTime()), `${label} ${key}: not a valid time`);
    }

    // Strict chronological order for a single civil day.
    for (let i = 1; i < ORDER.length; i += 1) {
      const prev = result.times[ORDER[i - 1]];
      const next = result.times[ORDER[i]];
      if (prev && next) {
        check(
          prev.getTime() < next.getTime(),
          `${label}: ${ORDER[i - 1]} (${localTime(prev, c.tz)}) is not before ${ORDER[i]} (${localTime(next, c.tz)})`,
        );
      }
    }

    const dhuhr = localMinutes(result.times.dhuhr, c.tz);
    check(
      dhuhr >= c.dhuhrWindow[0] && dhuhr <= c.dhuhrWindow[1],
      `${label}: Dhuhr ${localTime(result.times.dhuhr, c.tz)} outside expected window ${Math.floor(c.dhuhrWindow[0] / 60)}:${String(c.dhuhrWindow[0] % 60).padStart(2, '0')}–${Math.floor(c.dhuhrWindow[1] / 60)}:${String(c.dhuhrWindow[1] % 60).padStart(2, '0')}`,
    );

    // Fajr must precede sunrise by a real margin, Isha must follow Maghrib.
    const fajrGap = (result.times.sunrise.getTime() - result.times.fajr.getTime()) / 60000;
    const ishaGap = (result.times.isha.getTime() - result.times.maghrib.getTime()) / 60000;
    check(fajrGap > 30, `${label}: Fajr only ${fajrGap.toFixed(0)} min before sunrise`);
    check(ishaGap > 20, `${label}: Isha only ${ishaGap.toFixed(0)} min after Maghrib`);

    const row = ORDER.map((k) => `${k}=${localTime(result.times[k], c.tz)}`).join('  ');
    console.log(`${c.name.padEnd(24)} ${c.tz.padEnd(20)} ${row}`);
  }
}

// Umm al-Qura fixes Isha at 90 minutes after Maghrib.
{
  const day = new Date('2026-06-15T12:00:00Z');
  const r = getPrayerTimes(day, { latitude: 21.4225, longitude: 39.8262 }, 'UMM_AL_QURA', 'shafii', 'Asia/Riyadh', 'seventh');
  const gap = (r.times.isha.getTime() - r.times.maghrib.getTime()) / 60000;
  check(Math.abs(gap - 90) <= 1, `Umm al-Qura Isha gap is ${gap.toFixed(1)} min, expected 90`);
  console.log(`\nUmm al-Qura Isha offset: ${gap.toFixed(1)} min (expected 90)`);
}

// Hanafi Asr must fall after the standard (Shafi'i) Asr.
{
  const day = new Date('2026-06-15T12:00:00Z');
  const coords = { latitude: 41.0082, longitude: 28.9784 };
  const shafii = getPrayerTimes(day, coords, 'TURKEY', 'shafii', 'Europe/Istanbul', 'seventh');
  const hanafi = getPrayerTimes(day, coords, 'TURKEY', 'hanafi', 'Europe/Istanbul', 'seventh');
  const delta = (hanafi.times.asr.getTime() - shafii.times.asr.getTime()) / 60000;
  check(delta > 20, `Hanafi Asr is only ${delta.toFixed(0)} min after standard Asr`);
  console.log(
    `Istanbul Asr: standard ${localTime(shafii.times.asr, 'Europe/Istanbul')}, Hanafi ${localTime(hanafi.times.asr, 'Europe/Istanbul')} (+${delta.toFixed(0)} min)`,
  );
}

// Changing the method must change the result (no shared/hardcoded table).
{
  const day = new Date('2026-06-15T12:00:00Z');
  const coords = { latitude: 21.4225, longitude: 39.8262 };
  const mwl = getPrayerTimes(day, coords, 'MWL', 'shafii', 'Asia/Riyadh', 'seventh');
  const isna = getPrayerTimes(day, coords, 'ISNA', 'shafii', 'Asia/Riyadh', 'seventh');
  const delta = Math.abs(mwl.times.isha.getTime() - isna.times.isha.getTime()) / 60000;
  check(delta > 5, `MWL and ISNA Isha differ by only ${delta.toFixed(1)} min — method is not applied`);
  console.log(`Makkah Isha: MWL ${localTime(mwl.times.isha, 'Asia/Riyadh')} vs ISNA ${localTime(isna.times.isha, 'Asia/Riyadh')}`);
}

// High-latitude rules must actually change a London summer night.
{
  const day = new Date('2026-06-21T12:00:00Z');
  const coords = { latitude: 51.5074, longitude: -0.1278 };
  const rule = (r: HighLatitudeRule) =>
    getPrayerTimes(day, coords, 'MWL', 'shafii', 'Europe/London', r);
  const seventh = rule('seventh');
  const middle = rule('middle');
  const none = rule('none');
  const delta = Math.abs(middle.times.isha.getTime() - seventh.times.isha.getTime()) / 60000;
  check(delta > 5, `London Isha: seventh and middle rules differ by only ${delta.toFixed(1)} min`);
  console.log(
    `London 21 Jun Isha: seventh ${localTime(seventh.times.isha, 'Europe/London')}, middle ${localTime(middle.times.isha, 'Europe/London')}, none ${localTime(none.times.isha, 'Europe/London')}`,
  );
  for (const r of [seventh, middle, none]) {
    check(Number.isFinite(r.times.fajr.getTime()), 'London Fajr invalid under a high-latitude rule');
    check(Number.isFinite(r.times.isha.getTime()), 'London Isha invalid under a high-latitude rule');
  }
}

// Every advertised method must be selectable and produce usable times.
{
  const day = new Date('2026-03-01T12:00:00Z');
  const coords = { latitude: 2.0469, longitude: 45.3182 };
  const ids = METHODS.map((m) => m.id);
  for (const required of [
    'MWL',
    'UMM_AL_QURA',
    'EGYPT',
    'KARACHI',
    'ISNA',
    'KUWAIT',
    'QATAR',
    'DUBAI',
    'TURKEY',
    'SINGAPORE',
    'MOONSIGHTING',
  ]) {
    check(ids.includes(required), `Method ${required} is missing from METHODS`);
  }
  for (const m of METHODS) {
    const r = getPrayerTimes(day, coords, m.id, 'shafii', 'Africa/Mogadishu', 'seventh');
    check(Number.isFinite(r.times.isha.getTime()), `Method ${m.id} produced an invalid Isha`);
    check(Number.isFinite(r.times.fajr.getTime()), `Method ${m.id} produced an invalid Fajr`);
  }
  console.log(`\nMethods exercised: ${METHODS.length} (${ids.join(', ')})`);
}

console.log(`\n${assertions} assertions, ${failures.length} failure(s)`);
if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  process.exit(1);
}
console.log('Prayer times verified for Somalia, Saudi Arabia, Turkey, UK and USA.');

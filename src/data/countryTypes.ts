/**
 * Shared types for the bundled worldwide location dataset.
 *
 * Country codes follow ISO 3166-1 alpha-2 (the two-letter codes used by the
 * UN and by every mainstream geocoding service). Flags are derived from those
 * codes with Unicode regional indicator symbols, so no flag images are needed
 * and every country — including ones added later — gets a correct flag.
 */

/** [city name, region/state name, latitude, longitude, optional IANA timezone] */
export type CitySeed = [string, string, number, number, string?];

/** [ISO alpha-2 code, English name, Arabic name, IANA timezone, cities] */
export type CountrySeed = [string, string, string, string, CitySeed[]];

export interface City {
  name: string;
  region: string;
  lat: number;
  lon: number;
  tz: string;
  countryCode: string;
  country: string;
  countryAr: string;
  flag: string;
}

export interface Country {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
  tz: string;
  cities: City[];
}

/** Turns "SA" into the 🇸🇦 regional-indicator flag. */
export function flagOf(code: string): string {
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return '🌍';
  return String.fromCodePoint(
    ...[...upper].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)),
  );
}

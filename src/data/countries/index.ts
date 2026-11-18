import { AFRICA } from './africa';
import { ASIA } from './asia';
import { EUROPE } from './europe';
import { AMERICAS } from './americas';
import { OCEANIA } from './oceania';
import { flagOf, type City, type Country, type CountrySeed } from '../countryTypes';

export type { City, Country };

/**
 * Every sovereign state on Earth (193 UN members + 2 observer states = 195),
 * each with ISO 3166-1 alpha-2 code, English/Arabic name, derived flag, IANA
 * time zone and a curated list of cities with their region and coordinates.
 *
 * The data is bundled with the app, so location selection works offline and
 * never depends on a paid or rate-limited geocoding service.
 */
const SEEDS: CountrySeed[] = [...AFRICA, ...ASIA, ...EUROPE, ...AMERICAS, ...OCEANIA];

export const COUNTRIES: Country[] = SEEDS.map(([code, name, nameAr, tz, cities]) => {
  const flag = flagOf(code);
  return {
    code,
    name,
    nameAr,
    flag,
    tz,
    cities: cities.map(([cityName, region, lat, lon, cityTz]) => ({
      name: cityName,
      region,
      lat,
      lon,
      tz: cityTz ?? tz,
      countryCode: code,
      country: name,
      countryAr: nameAr,
      flag,
    })),
  };
}).sort((a, b) => a.name.localeCompare(b.name, 'en'));

/** 195. Exposed so the UI can state the real coverage it ships with. */
export const COUNTRY_COUNT = COUNTRIES.length;

/** Every city in the dataset, flat — used for global search and GPS matching. */
export const ALL_CITIES: City[] = COUNTRIES.flatMap((c) => c.cities);

/** Number of selectable cities (regions included), for the UI copy. */
export const CITY_COUNT = ALL_CITIES.length;

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function countryByCode(code: string | undefined | null): Country | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code.trim().toUpperCase());
}

export function countryByName(name: string): Country | undefined {
  const needle = name.trim().toLowerCase();
  return COUNTRIES.find(
    (c) => c.name.toLowerCase() === needle || c.nameAr === name.trim(),
  );
}

/**
 * Searches countries by English name, Arabic name, ISO code, and by the name
 * of any city or region inside them. An empty query returns every country, so
 * the picker starts with the full worldwide list — never a shortlist.
 */
export function searchCountries(query: string, limit = 60): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES.slice(0, limit);
  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameAr.includes(query.trim()) ||
      c.code.toLowerCase() === q ||
      c.cities.some(
        (city) =>
          city.name.toLowerCase().includes(q) || city.region.toLowerCase().includes(q),
      ),
  ).slice(0, limit);
}

/** Global city search across all 195 countries. */
export function searchCities(query: string, limit = 40): City[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return ALL_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(q) ||
      city.region.toLowerCase().includes(q) ||
      city.country.toLowerCase().includes(q),
  ).slice(0, limit);
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres. */
export function distanceKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Finds the closest city in the dataset to a coordinate pair. This is how GPS
 * results are turned into a human label, country, region and time zone without
 * calling any external reverse-geocoding API.
 */
export function nearestCity(lat: number, lon: number): { city: City; distanceKm: number } {
  let best = ALL_CITIES[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const city of ALL_CITIES) {
    const d = distanceKm(lat, lon, city.lat, city.lon);
    if (d < bestDistance) {
      best = city;
      bestDistance = d;
    }
  }
  return { city: best, distanceKm: bestDistance };
}

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

/** "24.7136°N, 46.6753°E" — readable at a glance in both languages. */
export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${ns}, ${Math.abs(lon).toFixed(4)}°${ew}`;
}

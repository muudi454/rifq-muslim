import { capitalArOf, capitalOf } from '../data/capitals';
import { countryByCode, nearestCity } from '../data/countries';
import { flagOf } from '../data/countryTypes';
import { locationFromCity, type GeoPlace, type UserLocation } from './location';
import { isValidTimeZone, localTimeZone } from './timezone';

/**
 * Free worldwide geocoding — no API key, no paid tier.
 *
 * - Search: Photon (photon.komoot.io), the OpenStreetMap-based geocoder that
 *   covers cities, towns and villages in every country. Used only while the
 *   user is typing; every country and city that ships in the bundle still works
 *   with no network at all.
 * - Reverse: BigDataCloud's keyless reverse-geocode-client, which turns the
 *   device's real GPS coordinates into the actual city, region and country.
 *
 * Both are CORS-enabled public endpoints. If either is unreachable the app
 * falls back to the bundled dataset's nearest real city, and the UI states
 * that the city name came from the offline dataset rather than a live lookup.
 */
const PHOTON_URL = 'https://photon.komoot.io/api/';
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const SEARCH_TIMEOUT_MS = 7000;
const REVERSE_TIMEOUT_MS = 7000;
const CACHE_LIMIT = 60;

const searchCache = new Map<string, GeoPlace[]>();

/** Place kinds worth offering as a location; buildings/streets are not. */
const PLACE_KINDS = new Set([
  'city',
  'town',
  'village',
  'hamlet',
  'municipality',
  'locality',
  'district',
  'county',
  'state',
  'region',
  'province',
  'administrative',
  'suburb',
  'quarter',
  'borough',
]);

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Best available IANA zone for a coordinate pair: the nearest bundled city's
 * zone when it is close enough to be meaningful, otherwise the country's zone,
 * otherwise the device zone.
 */
export function timeZoneForCoords(
  lat: number,
  lon: number,
  countryCode?: string,
): string {
  const { city, distanceKm: distance } = nearestCity(lat, lon);
  if (city && distance <= 400 && isValidTimeZone(city.tz)) return city.tz;
  if (countryCode) {
    const country = countryByCode(countryCode);
    if (country && isValidTimeZone(country.tz)) return country.tz;
  }
  if (city && isValidTimeZone(city.tz)) return city.tz;
  return localTimeZone();
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, unknown>;
}

function normalizePhoton(feature: PhotonFeature): GeoPlace | null {
  const props = feature.properties ?? {};
  const coords = feature.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lon, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const countryCode = String(props.countrycode ?? '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) return null;

  const kind = String(props.type ?? 'place');
  if (!PLACE_KINDS.has(kind)) return null;

  const pick = (key: string) => {
    const value = props[key];
    return typeof value === 'string' ? value.trim() : '';
  };

  const name = pick('name') || pick('city') || pick('locality') || pick('district');
  if (!name) return null;

  const known = countryByCode(countryCode);
  const region =
    pick('state') || pick('county') || pick('district') || pick('city') || pick('locality');

  return {
    id: `${String(props.osm_type ?? 'p')}${String(props.osm_id ?? `${lat.toFixed(3)},${lon.toFixed(3)}`)}`,
    name,
    region,
    country: known?.name ?? pick('country'),
    countryAr: known?.nameAr ?? '',
    countryCode,
    lat,
    lon,
    tz: timeZoneForCoords(lat, lon, countryCode),
    flag: flagOf(countryCode),
    kind,
  };
}

function dedupe(places: GeoPlace[]): GeoPlace[] {
  const seen = new Set<string>();
  const out: GeoPlace[] = [];
  for (const place of places) {
    const key = `${place.name.toLowerCase()}|${place.countryCode}|${place.lat.toFixed(2)}|${place.lon.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(place);
  }
  return out;
}

export interface SearchOutcome {
  places: GeoPlace[];
  /** false when the live geocoder could not be reached (offline or blocked). */
  online: boolean;
}

/**
 * Searches every place on Earth by name (city, town, village, region) through
 * OpenStreetMap. Results are cached in memory so repeated typing is cheap.
 */
export async function searchWorldwide(
  query: string,
  signal?: AbortSignal,
): Promise<SearchOutcome> {
  const q = query.trim();
  if (q.length < 2) return { places: [], online: true };

  const key = q.toLowerCase();
  const cached = searchCache.get(key);
  if (cached) return { places: cached, online: true };

  try {
    const url = `${PHOTON_URL}?q=${encodeURIComponent(q)}&limit=15&lang=en`;
    const data = (await fetchJson(url, SEARCH_TIMEOUT_MS)) as {
      features?: PhotonFeature[];
    };
    if (signal?.aborted) return { places: [], online: true };
    const places = dedupe(
      (data.features ?? [])
        .map(normalizePhoton)
        .filter((p): p is GeoPlace => p !== null),
    ).slice(0, 10);

    if (searchCache.size >= CACHE_LIMIT) {
      const oldest = searchCache.keys().next().value;
      if (oldest) searchCache.delete(oldest);
    }
    searchCache.set(key, places);
    return { places, online: true };
  } catch {
    return { places: [], online: false };
  }
}

interface ReverseResult {
  city: string;
  region: string;
  country: string;
  countryCode: string;
}

interface AdminEntry {
  name?: string;
  adminLevel?: number;
}

/** Picks the most specific administrative name available at a given level. */
function pickAdmin(admin: AdminEntry[], levels: number[]): string {
  for (const level of levels) {
    const match = admin.find((entry) => entry.adminLevel === level && entry.name);
    if (match?.name) return match.name;
  }
  return '';
}

/** Turns real coordinates into the actual city, region and country. */
async function reverseLookup(lat: number, lon: number): Promise<ReverseResult | null> {
  try {
    const url = `${REVERSE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const data = (await fetchJson(url, REVERSE_TIMEOUT_MS)) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
      countryCode?: string;
      localityInfo?: { administrative?: AdminEntry[] };
    };
    const countryCode = String(data.countryCode ?? '').toUpperCase();
    if (!/^[A-Z]{2}$/.test(countryCode)) return null;
    const admin = Array.isArray(data.localityInfo?.administrative)
      ? data.localityInfo!.administrative!
      : [];
    const city = data.city || data.locality || pickAdmin(admin, [8, 7, 6]);
    const region = data.principalSubdivision || pickAdmin(admin, [4, 5]);
    return {
      city,
      region,
      country: data.countryName || countryByCode(countryCode)?.name || '',
      countryCode,
    };
  } catch {
    return null;
  }
}

export interface ResolveResult {
  location: UserLocation;
  /** true when the city/country came from the live reverse geocoder. */
  live: boolean;
  /** Distance to the nearest bundled city, when the fallback was used. */
  fallbackDistanceKm?: number;
}

/**
 * Resolves GPS or hand-entered coordinates into a full location: real city,
 * region, country, capital, time zone and the exact coordinates themselves.
 *
 * Nothing is guessed or defaulted: the coordinates are always the ones the
 * device or the user supplied. If the free reverse geocoder is unreachable,
 * the nearest real city from the bundled dataset supplies the label and is
 * flagged as unverified rather than presented as a live GPS result.
 */
export async function resolveLocationFromCoords(
  lat: number,
  lon: number,
  source: 'gps' | 'manual',
  accuracyM?: number,
): Promise<ResolveResult> {
  const timezone = timeZoneForCoords(lat, lon);
  const reverse = await reverseLookup(lat, lon);

  if (reverse) {
    const known = countryByCode(reverse.countryCode);
    const city = reverse.city || reverse.region || known?.name || '';
    return {
      live: true,
      location: {
        lat,
        lon,
        label: [city, known?.name ?? reverse.country].filter(Boolean).join(', '),
        countryCode: reverse.countryCode,
        country: known?.name ?? reverse.country,
        countryAr: known?.nameAr,
        city: reverse.city || undefined,
        region: reverse.region || undefined,
        timezone,
        capital: capitalOf(reverse.countryCode),
        capitalAr: capitalArOf(reverse.countryCode),
        flag: flagOf(reverse.countryCode),
        source,
        verified: true,
        accuracyM,
      },
    };
  }

  const { city, distanceKm: distance } = nearestCity(lat, lon);
  return {
    live: false,
    fallbackDistanceKm: distance,
    location: {
      ...locationFromCity(city),
      lat,
      lon,
      timezone: timeZoneForCoords(lat, lon, city.countryCode),
      source,
      verified: false,
      accuracyM,
    },
  };
}

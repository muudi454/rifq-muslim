import { capitalArOf, capitalOf } from '../data/capitals';
import { countryByCode, formatCoords, nearestCity, type City } from '../data/countries';
import { flagOf } from '../data/countryTypes';
import { isValidTimeZone, localTimeZone } from './timezone';

/**
 * A place that can become the user's location.
 *
 * `GeoPlace` is the common shape for a city found in the bundled dataset and
 * for one returned by the free OpenStreetMap geocoder, so the UI and the
 * prayer/Qibla maths treat both identically.
 */
export interface GeoPlace {
  id: string;
  name: string;
  region: string;
  country: string;
  countryAr: string;
  countryCode: string;
  lat: number;
  lon: number;
  tz: string;
  flag: string;
  kind: string;
}

/** How the place was chosen — shown honestly in the UI. */
export type LocationSource = 'gps' | 'manual' | 'city' | 'search';

/**
 * The user's location. Only `lat`/`lon`/`label` are required so settings saved
 * by earlier versions keep working; the richer fields are filled whenever the
 * place came from the dataset, from GPS or from a live geocoder.
 */
export interface UserLocation {
  lat: number;
  lon: number;
  label: string;
  countryCode?: string;
  country?: string;
  countryAr?: string;
  city?: string;
  region?: string;
  timezone?: string;
  /** Capital of the country — displayed as its own fact, never as the user's city. */
  capital?: string;
  capitalAr?: string;
  flag?: string;
  source?: LocationSource;
  /** true when city/country came from a live geocoder; false = nearest bundled city. */
  verified?: boolean;
  /** GPS accuracy in metres, when the browser reported it. */
  accuracyM?: number;
}

const capitalFields = (code?: string) => ({
  capital: capitalOf(code),
  capitalAr: capitalArOf(code),
  flag: code ? flagOf(code) : undefined,
});

/** Builds a location from a city in the bundled dataset. */
export function locationFromCity(city: City): UserLocation {
  return {
    lat: city.lat,
    lon: city.lon,
    label: `${city.name}, ${city.country}`,
    countryCode: city.countryCode,
    country: city.country,
    countryAr: city.countryAr,
    city: city.name,
    region: city.region,
    timezone: city.tz,
    ...capitalFields(city.countryCode),
    source: 'city',
    verified: true,
  };
}

/** Builds a location from a place returned by the worldwide geocoder. */
export function locationFromPlace(
  place: GeoPlace,
  source: LocationSource = 'search',
): UserLocation {
  return {
    lat: place.lat,
    lon: place.lon,
    label: [place.name, place.country].filter(Boolean).join(', '),
    countryCode: place.countryCode,
    country: place.country,
    countryAr: place.countryAr,
    city: place.name,
    region: place.region || undefined,
    timezone: place.tz,
    ...capitalFields(place.countryCode),
    source,
    verified: true,
  };
}

/**
 * Builds a location from raw coordinates without a network call, using the
 * closest real city in the bundled dataset for the friendly label, country and
 * time zone. Coordinates themselves are always the exact ones supplied.
 */
export function locationFromCoords(
  lat: number,
  lon: number,
  source: 'gps' | 'manual',
  label?: string,
): UserLocation {
  const { city } = nearestCity(lat, lon);
  return {
    lat,
    lon,
    label: label?.trim() || `${city.name}, ${city.country}`,
    countryCode: city.countryCode,
    country: city.country,
    countryAr: city.countryAr,
    city: city.name,
    region: city.region,
    timezone: city.tz,
    ...capitalFields(city.countryCode),
    source,
    verified: false,
  };
}

/** The IANA zone to compute and display times in for this location. */
export function locationTimeZone(location: UserLocation | null | undefined): string {
  if (location?.timezone && isValidTimeZone(location.timezone)) return location.timezone;
  if (location?.countryCode) {
    const country = countryByCode(location.countryCode);
    if (country && isValidTimeZone(country.tz)) return country.tz;
  }
  return localTimeZone();
}

/** Display name of the place, honouring the app language. */
export function locationLabel(
  location: UserLocation | null | undefined,
  lang: 'en' | 'ar',
): string {
  if (!location) return '';
  if (lang === 'ar') {
    const country = location.countryAr ?? location.country;
    if (location.city && country) return `${location.city}، ${country}`;
    if (location.city) return location.city;
  }
  return location.label;
}

/** Secondary line: region + coordinates. */
export function locationDetail(location: UserLocation | null | undefined): string {
  if (!location) return '';
  const coords = formatCoords(location.lat, location.lon);
  return location.region ? `${location.region} · ${coords}` : coords;
}

export interface LocationSummary {
  flag: string;
  country: string;
  capital: string;
  city: string;
  region: string;
  coordinates: string;
  timezone: string;
  verified: boolean;
}

/**
 * The separate facts the app displays for a location: flag, country, the
 * country's capital, the user's actual city and region, the real coordinates
 * and the time zone. Each is a distinct field — the capital is never used as
 * the user's city.
 */
export function locationSummary(
  location: UserLocation | null | undefined,
  lang: 'en' | 'ar',
): LocationSummary | null {
  if (!location) return null;
  const known = countryByCode(location.countryCode);
  const arabic = lang === 'ar';
  return {
    flag: location.flag ?? (location.countryCode ? flagOf(location.countryCode) : '📍'),
    country: (arabic ? location.countryAr ?? known?.nameAr : location.country ?? known?.name) ?? '',
    capital:
      (arabic ? location.capitalAr ?? known?.capitalAr : location.capital ?? known?.capital) ?? '',
    city: location.city ?? '',
    region: location.region ?? '',
    coordinates: formatCoords(location.lat, location.lon),
    timezone: locationTimeZone(location),
    verified: location.verified !== false,
  };
}

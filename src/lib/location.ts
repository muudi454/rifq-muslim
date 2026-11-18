import { countryByCode, formatCoords, nearestCity, type City } from '../data/countries';
import { isValidTimeZone, localTimeZone } from './timezone';

/**
 * A user-chosen place. Only `lat`/`lon`/`label` are required, so settings saved
 * by earlier versions of the app keep working; the richer fields are filled in
 * whenever the place came from the bundled worldwide dataset.
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
  source?: 'gps' | 'manual' | 'city';
}

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
    source: 'city',
  };
}

/**
 * Builds a location from raw coordinates (GPS or manual entry). The closest
 * bundled city supplies a friendly label, country and IANA time zone, so no
 * reverse-geocoding service — free or paid — has to be called at runtime.
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
    source,
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
  if (lang === 'ar' && location.city) {
    const country = location.countryAr ?? location.country;
    return country ? `${location.city}، ${country}` : location.city;
  }
  return location.label;
}

/** Secondary line: region + coordinates. */
export function locationDetail(location: UserLocation | null | undefined): string {
  if (!location) return '';
  const coords = formatCoords(location.lat, location.lon);
  return location.region ? `${location.region} · ${coords}` : coords;
}

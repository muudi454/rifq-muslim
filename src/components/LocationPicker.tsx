import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import {
  COUNTRIES,
  COUNTRY_COUNT,
  isValidLatitude,
  isValidLongitude,
  searchCities,
  searchCountries,
  type City,
  type Country,
} from '../data/countries';
import { flagOf } from '../data/countryTypes';
import {
  locationDetail,
  locationFromCity,
  locationFromCoords,
  locationLabel,
  type UserLocation,
} from '../lib/location';

type GpsState = 'idle' | 'locating' | 'denied' | 'unavailable' | 'timeout' | 'error';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: (location: UserLocation) => void;
}

/**
 * Worldwide location picker: search any of the 195 countries (by name, Arabic
 * name, ISO code, city or region), drill into a country's cities and regions,
 * detect the current position with GPS, or type coordinates by hand.
 */
export default function LocationPicker({ open, onClose, onSaved }: Props) {
  const { t, lang } = useI18n();
  const { settings, updateSettings } = useStore();

  const [query, setQuery] = useState('');
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [gps, setGps] = useState<GpsState>('idle');
  const [manualOpen, setManualOpen] = useState(false);
  const [latText, setLatText] = useState('');
  const [lonText, setLonText] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setOpenCode(null);
    setGps('idle');
    setManualOpen(false);
    setManualError(null);
    setLatText('');
    setLonText('');
    const id = window.setTimeout(() => searchRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const countryMatches = useMemo(() => searchCountries(query, 80), [query]);
  const cityMatches = useMemo(() => searchCities(query, 24), [query]);

  if (!open) return null;

  const save = (location: UserLocation) => {
    updateSettings({ location });
    onSaved?.(location);
    onClose();
  };

  const detectGps = () => {
    if (!('geolocation' in navigator)) {
      setGps('unavailable');
      return;
    }
    setGps('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGps('idle');
        save(locationFromCoords(latitude, longitude, 'gps'));
      },
      (error) => {
        // 1 = permission denied, 2 = position unavailable, 3 = timeout.
        setGps(error.code === 1 ? 'denied' : error.code === 3 ? 'timeout' : 'unavailable');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300_000 },
    );
  };

  const saveManual = () => {
    const lat = Number.parseFloat(latText.replace(',', '.'));
    const lon = Number.parseFloat(lonText.replace(',', '.'));
    if (!isValidLatitude(lat)) {
      setManualError(t('loc.invalidLat'));
      return;
    }
    if (!isValidLongitude(lon)) {
      setManualError(t('loc.invalidLon'));
      return;
    }
    setManualError(null);
    save(locationFromCoords(lat, lon, 'manual'));
  };

  const chooseCity = (city: City) => save(locationFromCity(city));

  const gpsMessage =
    gps === 'denied'
      ? t('loc.gpsDenied')
      : gps === 'unavailable'
        ? t('loc.gpsUnavailable')
        : gps === 'timeout'
          ? t('loc.gpsTimeout')
          : gps === 'error'
            ? t('loc.gpsError')
            : null;

  const groupsOf = (country: Country) => {
    const map = new Map<string, City[]>();
    country.cities.forEach((city) => {
      const list = map.get(city.region) ?? [];
      list.push(city);
      map.set(city.region, list);
    });
    return [...map.entries()];
  };

  return (
    <div className="lp-overlay" role="dialog" aria-modal="true" aria-label={t('loc.title')}>
      <div className="lp-sheet">
        <div className="lp-head">
          <div>
            <h2 className="lp-title">{t('loc.title')}</h2>
            <p className="tiny muted">
              {t('loc.coverage')
                .replace('{countries}', String(COUNTRY_COUNT))
                .replace('{cities}', String(COUNTRIES.reduce((n, c) => n + c.cities.length, 0)))}
            </p>
          </div>
          <button type="button" className="lp-close" onClick={onClose} aria-label={t('loc.close')}>
            ✕
          </button>
        </div>

        <div className="lp-body">
          {settings.location && (
            <div className="lp-current">
              <span className="lp-flag" aria-hidden="true">
                {settings.location.countryCode ? flagOf(settings.location.countryCode) : '📍'}
              </span>
              <div className="lp-current-main">
                <p className="lp-current-label">{locationLabel(settings.location, lang)}</p>
                <p className="tiny muted">{locationDetail(settings.location)}</p>
              </div>
              <span className="badge badge-gold">{t('loc.current')}</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={detectGps}
            disabled={gps === 'locating'}
          >
            {gps === 'locating' ? t('loc.gpsLocating') : `📍 ${t('loc.useGps')}`}
          </button>

          {gpsMessage && (
            <div className="alert alert-info" role="status">
              <p>{gpsMessage}</p>
              <p className="tiny">{t('loc.gpsFallback')}</p>
            </div>
          )}

          <label className="field">
            <span className="small">{t('loc.search')}</span>
            <input
              ref={searchRef}
              className="input"
              type="search"
              value={query}
              placeholder={t('loc.searchPlaceholder')}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenCode(null);
              }}
              autoComplete="off"
            />
          </label>

          {cityMatches.length > 0 && (
            <div className="lp-group">
              <p className="lp-group-title">{t('loc.cities')}</p>
              <ul className="lp-list">
                {cityMatches.map((city) => (
                  <li key={`${city.countryCode}-${city.name}`}>
                    <button
                      type="button"
                      className="lp-item"
                      onClick={() => chooseCity(city)}
                      data-testid={`city-${city.countryCode}-${city.name}`}
                    >
                      <span className="lp-flag" aria-hidden="true">
                        {city.flag}
                      </span>
                      <span className="lp-name">
                        {city.name}
                        <span className="lp-sub">
                          {city.region} · {city.country}
                        </span>
                      </span>
                      <span className="lp-code">{city.countryCode}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="lp-group">
            <p className="lp-group-title">{t('loc.countries')}</p>
            {countryMatches.length === 0 ? (
              <p className="small muted">{t('loc.noResults')}</p>
            ) : (
              <ul className="lp-list">
                {countryMatches.map((country) => {
                  const expanded = openCode === country.code;
                  return (
                    <li key={country.code}>
                      <button
                        type="button"
                        className={`lp-item ${expanded ? 'lp-item-open' : ''}`}
                        onClick={() => setOpenCode(expanded ? null : country.code)}
                        aria-expanded={expanded}
                        data-testid={`country-${country.code}`}
                      >
                        <span className="lp-flag" aria-hidden="true">
                          {country.flag}
                        </span>
                        <span className="lp-name">
                          {lang === 'ar' ? country.nameAr : country.name}
                          <span className="lp-sub">
                            {country.cities.length} {t('loc.citiesCount')} · {country.tz}
                          </span>
                        </span>
                        <span className="lp-code">{country.code}</span>
                      </button>

                      {expanded && (
                        <div className="lp-cities">
                          {groupsOf(country).map(([region, cities]) => (
                            <div key={region} className="lp-region">
                              <p className="lp-region-title">{region}</p>
                              <div className="lp-city-grid">
                                {cities.map((city) => (
                                  <button
                                    key={city.name}
                                    type="button"
                                    className="lp-city"
                                    onClick={() => chooseCity(city)}
                                    data-testid={`city-${city.countryCode}-${city.name}`}
                                  >
                                    {city.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="lp-manual">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setManualOpen((v) => !v)}
              aria-expanded={manualOpen}
            >
              {manualOpen ? '−' : '+'} {t('loc.manual')}
            </button>

            {manualOpen && (
              <div className="lp-manual-body">
                <p className="tiny muted">{t('loc.manualHint')}</p>
                <div className="lp-coord-row">
                  <label className="field">
                    <span className="small">{t('loc.latitude')}</span>
                    <input
                      className="input"
                      inputMode="decimal"
                      value={latText}
                      placeholder="21.4225"
                      onChange={(e) => setLatText(e.target.value)}
                      data-testid="manual-lat"
                    />
                  </label>
                  <label className="field">
                    <span className="small">{t('loc.longitude')}</span>
                    <input
                      className="input"
                      inputMode="decimal"
                      value={lonText}
                      placeholder="39.8262"
                      onChange={(e) => setLonText(e.target.value)}
                      data-testid="manual-lon"
                    />
                  </label>
                </div>
                {manualError && (
                  <p className="alert alert-error" role="alert">
                    {manualError}
                  </p>
                )}
                <button type="button" className="btn btn-gold btn-block" onClick={saveManual}>
                  {t('loc.saveManual')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

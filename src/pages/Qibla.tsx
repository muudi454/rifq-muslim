import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { distanceToKaaba, qiblaBearing } from '../lib/qibla';
import { CITY_PRESETS } from '../lib/prayer';
import { IconCompass, IconInfo, IconMapPin } from '../components/Icons';

type OrientationEventLike = DeviceOrientationEvent & { webkitCompassHeading?: number };

export default function QiblaPage() {
  const { t, lang } = useI18n();
  const { settings, updateSettings, toast } = useStore();
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coords = settings.location;
  const bearing = useMemo(
    () => (coords ? qiblaBearing(coords.lat, coords.lon) : null),
    [coords],
  );
  const distance = useMemo(
    () => (coords ? distanceToKaaba(coords.lat, coords.lon) : null),
    [coords],
  );

  const attach = () => {
    const handler = (event: Event) => {
      const e = event as OrientationEventLike;
      if (typeof e.webkitCompassHeading === 'number') {
        setHeading(e.webkitCompassHeading);
        return;
      }
      if (e.alpha != null) {
        // alpha counts counter-clockwise from north; convert to compass heading.
        const absolute = (e as DeviceOrientationEvent & { absolute?: boolean }).absolute;
        setHeading(absolute === false ? e.alpha : (360 - e.alpha) % 360);
      }
    };
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  };

  const enableCompass = async () => {
    const DOE = window.DeviceOrientationEvent as unknown as
      | { requestPermission?: () => Promise<PermissionState | 'granted' | 'denied'> }
      | undefined;
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const state = await DOE.requestPermission();
        if (state !== 'granted') {
          setNeedsPermission(true);
          return;
        }
      } catch {
        setNeedsPermission(true);
        return;
      }
    }
    setNeedsPermission(false);
    attach();
    if (typeof DeviceOrientationEvent === 'undefined') setNeedsPermission(true);
  };

  useEffect(() => {
    if (needsPermission) return undefined;
    // Attach silently: browsers without a compass simply never fire events.
    return attach();
  }, [needsPermission]);

  const useMyLocation = () => {
    setError(null);
    if (!('geolocation' in navigator)) {
      setError(t('prayer.locationDenied'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        updateSettings({ location: { lat, lon, label: `${lat}, ${lon}` } });
        setLocating(false);
        toast(t('common.saved'));
      },
      () => {
        setLocating(false);
        setError(t('prayer.locationDenied'));
      },
      { timeout: 12000, maximumAge: 600000 },
    );
  };

  const aligned =
    bearing != null && heading != null && Math.abs(((bearing - heading + 540) % 360) - 180) > 175;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('qibla.title')}</h1>
          <p className="page-sub">{coords?.label ?? t('qibla.needsLocation')}</p>
        </div>
        <button className="icon-btn" onClick={useMyLocation} aria-label={t('prayer.useLocation')}>
          <IconMapPin size={20} />
        </button>
      </header>

      {error && <p className="alert alert-error">{error}</p>}

      {!coords && (
        <section className="card">
          <h2 className="row-title">{t('qibla.needsLocation')}</h2>
          <p className="row-sub">{t('qibla.help')}</p>
          <button className="btn btn-primary" onClick={useMyLocation} disabled={locating}>
            {locating ? t('prayer.locating') : t('qibla.enable')}
          </button>
          <label className="field" style={{ marginTop: 14 }}>
            <span>{t('prayer.location')}</span>
            <select
              className="select"
              defaultValue=""
              onChange={(e) => {
                const city = CITY_PRESETS.find((c) => c.name === e.target.value);
                if (city)
                  updateSettings({
                    location: {
                      lat: city.latitude,
                      lon: city.longitude,
                      label: lang === 'ar' ? city.nameAr : city.name,
                    },
                  });
              }}
            >
              <option value="">{t('prayer.location')}</option>
              {CITY_PRESETS.map((c) => (
                <option key={c.name} value={c.name}>
                  {lang === 'ar' ? c.nameAr : c.name}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}

      {coords && bearing != null && (
        <>
          <section className="card compass-card">
            <div className="compass-wrap">
              <div
                className="compass"
                style={{ transform: `rotate(${heading != null ? -heading : 0}deg)` }}
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="compass-tick"
                    style={{ transform: `rotate(${i * 15}deg)` }}
                  />
                ))}
                <span className="compass-n">N</span>
                <span className="compass-e">E</span>
                <span className="compass-s">S</span>
                <span className="compass-w">W</span>
                <div className="compass-needle" style={{ transform: `rotate(${bearing}deg)` }}>
                  <span className="compass-kaaba" aria-hidden="true">
                    🕋
                  </span>
                </div>
              </div>
            </div>

            <div className="compass-readout">
              <p className="stat-value">{Math.round(bearing)}°</p>
              <p className="stat-label">{t('qibla.bearing')}</p>
              <p className="small muted">
                {distance?.toLocaleString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')} km ·{' '}
                {t('qibla.distance')}
              </p>
            </div>

            {aligned ? (
              <p className="alert alert-ok">{t('qibla.aligned')}</p>
            ) : heading == null ? (
              <>
                <p className="help">{t('qibla.noCompass')}</p>
                <button className="btn btn-primary" onClick={enableCompass}>
                  <IconCompass size={16} /> {t('qibla.enable')}
                </button>
              </>
            ) : (
              <p className="alert alert-info">
                {bearing - heading > 0 && bearing - heading < 180
                  ? t('qibla.turnRight')
                  : t('qibla.turnLeft')}
              </p>
            )}
          </section>

          <section className="card">
            <p className="small muted">
              <IconInfo size={14} /> {t('qibla.help')}
            </p>
            <p className="help">
              {coords.label} → {t('qibla.bearing')} {Math.round(bearing)}°
            </p>
          </section>
        </>
      )}

      <p className="footer-note">{t('app.tagline')}</p>
    </div>
  );
}

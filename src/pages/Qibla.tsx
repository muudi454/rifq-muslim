import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { distanceToKaaba, qiblaBearing } from '../lib/qibla';
import { resolveLocationFromCoords } from '../lib/geocode';
import LocationFacts from '../components/LocationFacts';
import LocationPicker from '../components/LocationPicker';
import { IconCompass, IconInfo, IconMapPin } from '../components/Icons';

type OrientationEventLike = DeviceOrientationEvent & { webkitCompassHeading?: number };

export default function QiblaPage() {
  const { t, lang } = useI18n();
  const { settings, updateSettings, toast } = useStore();
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

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
      setError(t('loc.gpsUnavailable'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Real device coordinates; only the place names come from the free geocoder.
        const { location } = await resolveLocationFromCoords(
          pos.coords.latitude,
          pos.coords.longitude,
          'gps',
          pos.coords.accuracy,
        );
        updateSettings({ location });
        setLocating(false);
        toast(t('common.saved'));
      },
      (err) => {
        setLocating(false);
        // Graceful degradation: denial/timeouts explain the manual alternative.
        setError(
          err.code === err.PERMISSION_DENIED
            ? t('loc.gpsDenied')
            : err.code === err.TIMEOUT
              ? t('loc.gpsTimeout')
              : t('loc.gpsUnavailable'),
        );
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

      {coords && (
        <section className="card">
          <h2 className="section-title">{t('loc.facts')}</h2>
          <LocationFacts location={coords} />
        </section>
      )}

      {!coords && (
        <section className="card">
          <h2 className="row-title">{t('qibla.needsLocation')}</h2>
          <p className="row-sub">{t('qibla.help')}</p>
          <button className="btn btn-primary" onClick={useMyLocation} disabled={locating}>
            {locating ? t('prayer.locating') : t('qibla.enable')}
          </button>
          <button
            className="btn btn-ghost btn-block"
            style={{ marginTop: 10 }}
            onClick={() => setPickerOpen(true)}
          >
            <IconMapPin size={16} /> {t('loc.change')}
          </button>
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
            <button className="btn btn-ghost btn-sm" onClick={() => setPickerOpen(true)}>
              <IconMapPin size={15} /> {t('loc.change')}
            </button>
          </section>
        </>
      )}

      <p className="footer-note">{t('app.tagline')}</p>

      <LocationPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}

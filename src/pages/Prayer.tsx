import { useEffect, useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import {
  CITY_PRESETS,
  METHODS,
  PRAYER_ORDER,
  formatCountdown,
  formatTime,
  getPrayerTimes,
  nextPrayer,
  type PrayerKey,
} from '../lib/prayer';
import { IconCompass, IconMapPin, IconRefresh } from '../components/Icons';

export default function PrayerPage() {
  const { t, lang } = useI18n();
  const { settings, updateSettings, toast } = useStore();
  const [now, setNow] = useState(() => new Date());
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const coords = settings.location
    ? { latitude: settings.location.lat, longitude: settings.location.lon }
    : null;

  const today = useMemo(
    () => (coords ? getPrayerTimes(now, coords, settings.method, settings.madhab) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coords?.latitude, coords?.longitude, settings.method, settings.madhab, now.toDateString()],
  );

  const upcoming = today ? nextPrayer(today.times, now) : null;

  const week = useMemo(() => {
    if (!coords) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      return { date, times: getPrayerTimes(date, coords, settings.method, settings.madhab).times };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.latitude, coords?.longitude, settings.method, settings.madhab, now.toDateString()]);

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
        updateSettings({
          location: { lat, lon, label: `${lat}, ${lon}` },
        });
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

  const methodDef = METHODS.find((m) => m.id === settings.method) ?? METHODS[0];

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('prayer.title')}</h1>
          <p className="page-sub">{settings.location?.label ?? t('prayer.manualHint')}</p>
        </div>
        <button className="icon-btn" onClick={useMyLocation} aria-label={t('prayer.useLocation')}>
          <IconMapPin size={20} />
        </button>
      </header>

      {error && <p className="alert alert-error">{error}</p>}

      {!coords && (
        <section className="card">
          <h2 className="row-title">{t('prayer.useLocation')}</h2>
          <p className="row-sub">{t('prayer.manualHint')}</p>
          <button className="btn btn-primary" onClick={useMyLocation} disabled={locating}>
            {locating ? t('prayer.locating') : t('prayer.useLocation')}
          </button>
        </section>
      )}

      <section className="card">
        <label className="field">
          <span>{t('prayer.location')}</span>
          <select
            className="select"
            value={settings.location?.label ?? ''}
            onChange={(e) => {
              const city = CITY_PRESETS.find((c) => c.name === e.target.value);
              if (city) {
                updateSettings({
                  location: {
                    lat: city.latitude,
                    lon: city.longitude,
                    label: lang === 'ar' ? city.nameAr : city.name,
                  },
                });
              }
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

        <label className="field">
          <span>{t('prayer.method')}</span>
          <select
            className="select"
            value={settings.method}
            onChange={(e) => updateSettings({ method: e.target.value })}
          >
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name[lang]}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span>{t('prayer.madhab')}</span>
          <div className="segmented">
            <button
              className={`seg-btn ${settings.madhab === 'shafii' ? 'active' : ''}`}
              onClick={() => updateSettings({ madhab: 'shafii' })}
            >
              {t('prayer.shafii')}
            </button>
            <button
              className={`seg-btn ${settings.madhab === 'hanafi' ? 'active' : ''}`}
              onClick={() => updateSettings({ madhab: 'hanafi' })}
            >
              {t('prayer.hanafi')}
            </button>
          </div>
        </div>
      </section>

      {today && (
        <section className="card">
          <div className="row">
            <div className="row-main">
              <p className="small muted">{t('home.nextPrayer')}</p>
              <h2 className="row-title">
                {upcoming ? t(`prayer.${upcoming.key}`) : '—'}{' '}
                <span className="small muted">
                  {upcoming ? formatTime(upcoming.at, lang) : ''}
                </span>
              </h2>
            </div>
            <div className="countdown">{formatCountdown(upcoming?.remainingMs ?? 0)}</div>
          </div>

          <div className="prayer-list">
            {PRAYER_ORDER.map((key: PrayerKey) => (
              <div
                key={key}
                className={`prayer-row ${upcoming?.key === key ? 'active' : ''}`}
              >
                <span className="prayer-name">{t(`prayer.${key}`)}</span>
                <span className="prayer-time">{formatTime(today.times[key], lang)}</span>
                {today.times[key].getTime() < now.getTime() && (
                  <span className="prayer-tag">{t('prayer.passed')}</span>
                )}
              </div>
            ))}
          </div>
          <p className="help">
            {t('prayer.computed')} · {methodDef.name[lang]}
          </p>
          <Link to="/qibla" className="btn btn-ghost btn-sm">
            <IconCompass size={16} /> {t('nav.qibla')}
          </Link>
        </section>
      )}

      {!!week.length && (
        <section className="card">
          <h2 className="section-title">
            {t('prayer.monthly')} <IconRefresh size={14} />
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('common.today')}</th>
                  <th>{t('prayer.fajr')}</th>
                  <th>{t('prayer.dhuhr')}</th>
                  <th>{t('prayer.asr')}</th>
                  <th>{t('prayer.maghrib')}</th>
                  <th>{t('prayer.isha')}</th>
                </tr>
              </thead>
              <tbody>
                {week.map(({ date, times }) => (
                  <tr key={date.toDateString()}>
                    <td>{date.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td>{formatTime(times.fajr, lang, false)}</td>
                    <td>{formatTime(times.dhuhr, lang, false)}</td>
                    <td>{formatTime(times.asr, lang, false)}</td>
                    <td>{formatTime(times.maghrib, lang, false)}</td>
                    <td>{formatTime(times.isha, lang, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="footer-note">{t('prayer.manualHint')}</p>
    </div>
  );
}

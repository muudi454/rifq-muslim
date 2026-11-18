import { useEffect, useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import {
  METHODS,
  PRAYER_ORDER,
  formatCountdown,
  formatTime,
  getPrayerTimes,
  nextPrayer,
  type PrayerKey,
} from '../lib/prayer';
import { locationDetail, locationTimeZone } from '../lib/location';
import LocationPicker from '../components/LocationPicker';
import { IconCompass, IconMapPin, IconRefresh } from '../components/Icons';

export default function PrayerPage() {
  const { t, lang } = useI18n();
  const { settings, updateSettings } = useStore();
  const [now, setNow] = useState(() => new Date());
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const place = settings.location;
  // The selected city's own IANA zone (falls back to the device zone), so a
  // place chosen anywhere in the world shows its own local prayer times.
  const timeZone = locationTimeZone(place);
  const lat = place?.lat;
  const lon = place?.lon;
  const coords = lat != null && lon != null ? { latitude: lat, longitude: lon } : null;

  const today = useMemo(
    () =>
      coords ? getPrayerTimes(now, coords, settings.method, settings.madhab, timeZone) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lat, lon, settings.method, settings.madhab, timeZone, now.toDateString()],
  );

  const upcoming = today ? nextPrayer(today.times, now) : null;

  const week = useMemo(() => {
    if (!coords) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      return {
        date,
        times: getPrayerTimes(date, coords, settings.method, settings.madhab, timeZone).times,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, settings.method, settings.madhab, timeZone, now.toDateString()]);

  const methodDef = METHODS.find((m) => m.id === settings.method) ?? METHODS[0];

  const dayLabel = (date: Date) =>
    date.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      ...(timeZone ? { timeZone } : {}),
    });

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('prayer.title')}</h1>
          <p className="page-sub">{place ? locationDetail(place) : t('loc.none')}</p>
        </div>
        <button
          className="icon-btn"
          onClick={() => setPickerOpen(true)}
          aria-label={t('loc.change')}
        >
          <IconMapPin size={20} />
        </button>
      </header>

      {!coords && (
        <section className="card">
          <h2 className="row-title">{t('loc.none')}</h2>
          <p className="row-sub">{t('loc.choosePrompt')}</p>
          <button className="btn btn-primary" onClick={() => setPickerOpen(true)}>
            <IconMapPin size={16} /> {t('loc.change')}
          </button>
        </section>
      )}

      <section className="card">
        <div className="row">
          <div className="row-main">
            <p className="small muted">{t('loc.current')}</p>
            <h2 className="row-title">{place ? place.label : t('loc.none')}</h2>
            <p className="row-sub">
              {place ? locationDetail(place) : t('loc.worldwide')}
            </p>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setPickerOpen(true)}>
          <IconMapPin size={15} /> {t('loc.change')}
        </button>

        <label className="field" style={{ marginTop: 14 }}>
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
                  {upcoming ? formatTime(upcoming.at, lang, true, timeZone) : ''}
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
                <span className="prayer-time">{formatTime(today.times[key], lang, true, timeZone)}</span>
                {today.times[key].getTime() < now.getTime() && (
                  <span className="prayer-tag">{t('prayer.passed')}</span>
                )}
              </div>
            ))}
          </div>
          <p className="help">
            {t('prayer.computed')} · {methodDef.name[lang]}
            {timeZone ? ` · ${timeZone}` : ''}
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
                    <td>{dayLabel(date)}</td>
                    <td>{formatTime(times.fajr, lang, false, timeZone)}</td>
                    <td>{formatTime(times.dhuhr, lang, false, timeZone)}</td>
                    <td>{formatTime(times.asr, lang, false, timeZone)}</td>
                    <td>{formatTime(times.maghrib, lang, false, timeZone)}</td>
                    <td>{formatTime(times.isha, lang, false, timeZone)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="footer-note">{t('prayer.manualHint')}</p>

      <LocationPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}

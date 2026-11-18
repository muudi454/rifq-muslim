import { useEffect, useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { dayIndex, loadHadith, loadQuran, type Hadith, type QuranData } from '../lib/data';
import { DUAS } from '../data/duas';
import {
  formatCountdown,
  formatTime,
  getPrayerTimes,
  nextPrayer,
  type PrayerKey,
} from '../lib/prayer';
import { formatHijri } from '../lib/qibla';
import {
  IconBeads,
  IconBook,
  IconBookmark,
  IconCalendar,
  IconCompass,
  IconHands,
  IconMoon,
  IconMosque,
  IconScroll,
  IconSparkle,
} from '../components/Icons';

const QUICK = [
  { to: '/quran', key: 'nav.quran', Icon: IconBook },
  { to: '/prayer', key: 'nav.prayer', Icon: IconMosque },
  { to: '/qibla', key: 'nav.qibla', Icon: IconCompass },
  { to: '/tasbih', key: 'nav.tasbih', Icon: IconBeads },
  { to: '/duas', key: 'nav.duas', Icon: IconHands },
  { to: '/hadith', key: 'nav.hadith', Icon: IconScroll },
  { to: '/calendar', key: 'nav.calendar', Icon: IconCalendar },
  { to: '/bookmarks', key: 'nav.bookmarks', Icon: IconBookmark },
] as const;

export default function HomePage() {
  const { t, lang } = useI18n();
  const { settings, bookmarks, sessions } = useStore();
  const [quran, setQuran] = useState<QuranData | null>(null);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    loadQuran()
      .then((d) => alive && setQuran(d))
      .catch(() => undefined);
    loadHadith()
      .then((d) => alive && setHadiths(d.hadiths))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? t('home.greetingMorning') : hour < 17 ? t('home.greetingAfternoon') : t('home.greetingEvening');

  const prayer = useMemo(() => {
    if (!settings.location) return null;
    const times = getPrayerTimes(
      now,
      { latitude: settings.location.lat, longitude: settings.location.lon },
      settings.method,
      settings.madhab,
    );
    return { times: times.times, next: nextPrayer(times.times, now) };
  }, [now, settings.location, settings.method, settings.madhab]);

  const dailyAyah = useMemo(() => {
    if (!quran) return null;
    const flat: { surah: number; ayah: number; ar: string; en: string; name: string }[] = [];
    quran.surahs.forEach((s) =>
      s.ayahs.forEach((a, i) => flat.push({ surah: s.n, ayah: i + 1, ar: a[0], en: a[1], name: s.en })),
    );
    return flat[dayIndex(new Date(), flat.length)] ?? null;
  }, [quran]);

  const dailyDua = useMemo(() => DUAS[dayIndex(new Date(), DUAS.length)], []);
  const dailyHadith = useMemo(
    () => (hadiths.length ? hadiths[dayIndex(new Date(), hadiths.length)] : null),
    [hadiths],
  );

  const todayCount = useMemo(() => {
    const key = new Date().toDateString();
    return sessions
      .filter((s) => new Date(s.createdAt).toDateString() === key)
      .reduce((sum, s) => sum + s.count, 0);
  }, [sessions]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="page-sub">{greeting}</p>
          <h1 className="page-title">{formatHijri(now, lang)}</h1>
          <p className="small muted">
            {now.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="ornament" aria-hidden="true">
          <IconMoon size={26} />
        </div>
      </header>

      <section className="card prayer-hero">
        {prayer ? (
          <>
            <div className="row">
              <div className="row-main">
                <p className="small muted">{t('home.nextPrayer')}</p>
                <h2 className="row-title">{t(`prayer.${prayer.next.key}`)}</h2>
                <p className="row-sub">
                  {formatTime(prayer.next.at, lang)} · {settings.location?.label}
                </p>
              </div>
              <div className="countdown">{formatCountdown(prayer.next.remainingMs)}</div>
            </div>
            <div className="chip-row">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerKey[]).map((k) => (
                <span key={k} className={`chip ${prayer.next.key === k ? 'chip-active' : ''}`}>
                  {t(`prayer.${k}`)} · {formatTime(prayer.times[k], lang)}
                </span>
              ))}
            </div>
            <Link to="/prayer" className="btn btn-ghost btn-sm">
              {t('common.viewAll')}
            </Link>
          </>
        ) : (
          <>
            <h2 className="row-title">{t('home.nextPrayer')}</h2>
            <p className="row-sub">{t('prayer.manualHint')}</p>
            <Link to="/prayer" className="btn btn-primary btn-sm">
              {t('prayer.useLocation')}
            </Link>
          </>
        )}
      </section>

      <section>
        <h2 className="section-title">{t('home.quick')}</h2>
        <div className="grid quick-grid">
          {QUICK.map(({ to, key, Icon }) => (
            <Link key={to} to={to} className="quick-tile">
              <span className="quick-icon">
                <Icon size={22} />
              </span>
              <span className="quick-label">{t(key)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="row">
          <div className="row-main">
            <p className="small muted">
              <IconSparkle size={13} /> {t('home.dailyAyah')}
            </p>
            {dailyAyah ? (
              <>
                <p className="arabic" dir="rtl">
                  {dailyAyah.ar}
                </p>
                <p className="row-sub">{dailyAyah.en}</p>
                <p className="tiny muted">
                  {t('quran.surah')} {dailyAyah.name} · {dailyAyah.surah}:{dailyAyah.ayah}
                </p>
                <Link to={`/quran/${dailyAyah.surah}`} className="btn btn-ghost btn-sm">
                  {t('home.openQuran')}
                </Link>
              </>
            ) : (
              <div className="skeleton" style={{ height: 64 }} />
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <p className="small muted">{t('home.dailyDua')}</p>
        <p className="arabic" dir="rtl">
          {dailyDua.arabic}
        </p>
        <p className="row-sub">{lang === 'ar' ? dailyDua.titleAr : dailyDua.titleEn}</p>
        <p className="tiny muted">{lang === 'ar' ? dailyDua.referenceAr : dailyDua.referenceEn}</p>
        <Link to="/duas" className="btn btn-ghost btn-sm">
          {t('common.viewAll')}
        </Link>
      </section>

      {dailyHadith && (
        <section className="card">
          <p className="small muted">{t('home.dailyHadith')}</p>
          <p className="arabic" dir="rtl">
            {dailyHadith.arabic}
          </p>
          <p className="row-sub">{dailyHadith.text}</p>
          <p className="tiny muted">
            {dailyHadith.reference} · {dailyHadith.grade}
          </p>
          <Link to="/hadith" className="btn btn-ghost btn-sm">
            {t('common.viewAll')}
          </Link>
        </section>
      )}

      <section className="grid stats-grid">
        <div className="stat">
          <p className="stat-value">{bookmarks.length}</p>
          <p className="stat-label">{t('nav.bookmarks')}</p>
        </div>
        <div className="stat">
          <p className="stat-value">{todayCount}</p>
          <p className="stat-label">{t('home.streak')}</p>
        </div>
      </section>
    </div>
  );
}

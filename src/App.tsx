import { useEffect, useRef, useState } from 'react';
import { Link, RouterProvider, matchRoute, useRouter } from './lib/router';
import { I18nProvider, useI18n } from './lib/i18n';
import { AuthProvider, useAuth } from './lib/auth';
import { StoreProvider, useStore } from './lib/store';
import { startAthanScheduler } from './lib/athan';
import { api, getDeviceId, devicePlatform } from './lib/api';
import { APP_VERSION } from './lib/credit';
import { InstallBanner } from './components/InstallBanner';
import HomePage from './pages/Home';
import QuranPage from './pages/Quran';
import PrayerPage from './pages/Prayer';
import QiblaPage from './pages/Qibla';
import TasbihPage from './pages/Tasbih';
import DuasPage from './pages/Duas';
import HadithPage from './pages/Hadith';
import CalendarPage from './pages/Calendar';
import BookmarksPage from './pages/Bookmarks';
import SettingsPage from './pages/Settings';
import ProfilePage from './pages/Profile';
import AboutPage from './pages/About';
import AuthPage from './pages/Auth';
import NotificationsPage from './pages/Notifications';
import ContactPage from './pages/Contact';
import PrivacyPage from './pages/Privacy';
import AdminPage from './pages/Admin';
import {
  IconBeads,
  IconBook,
  IconBookmark,
  IconCalendar,
  IconCompass,
  IconHands,
  IconHome,
  IconInfo,
  IconMoon,
  IconSettings,
  IconUser,
  IconGlobe,
} from './components/Icons';

function Shell() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const { path } = useRouter();
  const [menu, setMenu] = useState(false);
  const { settings, toast } = useStore();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const langRef = useRef(lang);
  langRef.current = lang;

  // Athan scheduling uses the saved coordinates and calculation method.
  useEffect(
    () =>
      startAthanScheduler({
        getSettings: () => settingsRef.current,
        onEvent: (event) => {
          const label = event.prayer.charAt(0).toUpperCase() + event.prayer.slice(1);
          if (event.kind === 'athan') {
            toast(
              langRef.current === 'ar'
                ? `${label} — حان وقت الصلاة`
                : `${label} — it is time for prayer`,
            );
          } else {
            toast(
              langRef.current === 'ar'
                ? `تذكير: ${label} بعد قليل`
                : `Reminder: ${label} is coming up`,
            );
          }
        },
      }),
    [toast],
  );

  // Anonymous activity heartbeat + announcements from the app team.
  useEffect(() => {
    const deviceId = getDeviceId();
    const loc = settingsRef.current.location as unknown as Record<string, unknown> | null;
    const city = typeof loc?.city === 'string' ? loc.city : '';
    const country = typeof loc?.country === 'string' ? loc.country : '';
    api('/api/activity', {
      method: 'POST',
      json: {
        deviceId,
        platform: devicePlatform(),
        lang: langRef.current,
        appVersion: APP_VERSION,
        locationLabel: [city, country].filter(Boolean).join(', ') || undefined,
      },
    }).catch(() => undefined);

    const since = Number(localStorage.getItem('rifq.announcements.since') || 0);
    api<{ announcements?: { title: string }[] }>(
      `/api/announcements?deviceId=${encodeURIComponent(deviceId)}&since=${since}`,
    )
      .then((data) => {
        const list = data.announcements || [];
        if (!list.length) return;
        const latest = list[list.length - 1];
        toast(`📣 ${latest.title}`);
        localStorage.setItem('rifq.announcements.since', String(Date.now()));
      })
      .catch(() => undefined);
  }, [toast]);

  const surahMatch = matchRoute('/quran/:n', path);
  const surah = surahMatch ? Number(surahMatch.n) : undefined;

  const primary = [
    { to: '/', label: t('nav.home'), icon: <IconHome size={20} /> },
    { to: '/quran', label: t('nav.quran'), icon: <IconBook size={20} /> },
    { to: '/prayer', label: t('nav.prayer'), icon: <IconCompass size={20} /> },
    { to: '/tasbih', label: t('nav.tasbih'), icon: <IconBeads size={20} /> },
  ];

  const more = [
    { to: '/qibla', label: t('nav.qibla'), icon: <IconCompass size={20} /> },
    { to: '/duas', label: t('nav.duas'), icon: <IconHands size={20} /> },
    { to: '/hadith', label: t('nav.hadith'), icon: <IconInfo size={20} /> },
    { to: '/calendar', label: t('nav.calendar'), icon: <IconCalendar size={20} /> },
    { to: '/bookmarks', label: t('nav.bookmarks'), icon: <IconBookmark size={20} /> },
    { to: '/notifications', label: t('nav.notifications'), icon: <IconMoon size={20} /> },
    { to: '/contact', label: t('nav.contact'), icon: <IconGlobe size={20} /> },
    { to: '/settings', label: t('nav.settings'), icon: <IconSettings size={20} /> },
    { to: '/privacy', label: t('nav.privacy'), icon: <IconInfo size={20} /> },
    { to: '/admin', label: t('nav.admin'), icon: <IconUser size={20} /> },
    { to: user ? '/profile' : '/auth/signin', label: t('auth.profile'), icon: <IconUser size={20} /> },
  ];

  const render = () => {
    if (path === '/' || path === '') return <HomePage />;
    if (path === '/quran' || surahMatch) return <QuranPage surah={surah} />;
    if (path === '/prayer') return <PrayerPage />;
    if (path === '/qibla') return <QiblaPage />;
    if (path === '/tasbih') return <TasbihPage />;
    if (path === '/duas') return <DuasPage />;
    if (path === '/hadith') return <HadithPage />;
    if (path === '/calendar') return <CalendarPage />;
    if (path === '/bookmarks') return <BookmarksPage />;
    if (path === '/settings') return <SettingsPage />;
    if (path === '/notifications') return <NotificationsPage />;
    if (path === '/contact') return <ContactPage />;
    if (path === '/privacy') return <PrivacyPage />;
    if (path === '/admin') return <AdminPage />;
    if (path === '/about') return <AboutPage />;
    if (path === '/profile') return <ProfilePage />;
    if (path === '/auth/signin') return <AuthPage mode="signin" />;
    if (path === '/auth/signup') return <AuthPage mode="signup" />;
    if (path === '/auth/forgot') return <AuthPage mode="forgot" />;
    if (path === '/auth/reset') return <AuthPage mode="reset" />;
    return <HomePage />;
  };

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <IconMoon size={20} />
          </span>
          <span className="brand-text">
            <span className="brand-name">{t('app.name')}</span>
            <span className="brand-sub">{t('app.tagline')}</span>
          </span>
        </Link>

        <div className="header-actions">
          <button
            className="chip chip-sm"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            aria-label={t('settings.language')}
          >
            <IconGlobe size={15} />
            <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>
          <Link to={user ? '/profile' : '/auth/signin'} className="avatar-btn" aria-label={t('auth.profile')}>
            {user ? (
              <span className="avatar-initial">{(user.name || user.email || 'R')[0].toUpperCase()}</span>
            ) : (
              <IconUser size={18} />
            )}
          </Link>
        </div>
      </header>

      <main className="app-main" key={path}>
        {render()}
      </main>

      <InstallBanner />

      <nav className="bottom-nav">
        {primary.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${path === item.to ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <button className="nav-item" onClick={() => setMenu(true)} aria-expanded={menu}>
          <IconSettings size={20} />
          <span>{t('nav.more')}</span>
        </button>
      </nav>

      {menu && (
        <div className="sheet-backdrop" onClick={() => setMenu(false)} role="presentation">
          <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="sheet-handle" />
            <div className="more-grid">
              {more.map((item) => (
                <Link key={item.to} to={item.to} className="more-item" onClick={() => setMenu(false)}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <p className="small muted center">
              {t('app.name')} · {t('settings.version')} 1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider>
        <AuthProvider>
          <StoreProvider>
            <Shell />
          </StoreProvider>
        </AuthProvider>
      </RouterProvider>
    </I18nProvider>
  );
}

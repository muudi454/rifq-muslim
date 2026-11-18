import { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { useInstall } from '../lib/install';
import {
  IconBookmark,
  IconCalendar,
  IconCompass,
  IconDownload,
  IconGlobe,
  IconHands,
  IconInfo,
  IconMoon,
  IconQuran,
  IconSettings,
  IconTasbih,
  IconUser,
  IconX,
} from '../components/Icons';

export function InstallBanner() {
  const { t } = useI18n();
  const { available, installed, promptInstall, ios } = useInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('rifq.install.dismissed') === '1';
    } catch {
      return false;
    }
  });

  if (installed || dismissed || (!available && !ios)) return null;

  return (
    <div className="install-banner">
      <div className="row-main">
        <p className="row-title">
          <IconDownload size={16} /> {t('install.title')}
        </p>
        <p className="row-sub">{ios ? t('install.ios') : t('install.help')}</p>
      </div>
      {available && (
        <button className="btn btn-gold btn-sm" onClick={() => promptInstall()}>
          {t('common.install')}
        </button>
      )}
      <button
        className="icon-btn"
        aria-label={t('install.later')}
        onClick={() => {
          setDismissed(true);
          try {
            localStorage.setItem('rifq.install.dismissed', '1');
          } catch {
            /* ignore */
          }
        }}
      >
        <IconX size={16} />
      </button>
    </div>
  );
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const { toast, syncState } = useStore();
  const [menu, setMenu] = useState(false);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    const onClick = () => setPath(window.location.pathname);
    window.addEventListener('rifq:navigate', onClick);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('rifq:navigate', onClick);
    };
  }, []);

  const nav = [
    { to: '/', label: t('nav.home'), icon: <IconMoon size={20} /> },
    { to: '/quran', label: t('nav.quran'), icon: <IconQuran size={20} /> },
    { to: '/prayer', label: t('nav.prayer'), icon: <IconCompass size={20} /> },
    { to: '/qibla', label: t('nav.qibla'), icon: <IconCompass size={20} /> },
    { to: '/tasbih', label: t('nav.tasbih'), icon: <IconTasbih size={20} /> },
  ];

  const more = [
    { to: '/duas', label: t('nav.duas'), icon: <IconHands size={20} /> },
    { to: '/hadith', label: t('nav.hadith'), icon: <IconInfo size={20} /> },
    { to: '/calendar', label: t('nav.calendar'), icon: <IconCalendar size={20} /> },
    { to: '/bookmarks', label: t('nav.bookmarks'), icon: <IconBookmark size={20} /> },
    { to: '/settings', label: t('nav.settings'), icon: <IconSettings size={20} /> },
  ];

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
            <IconGlobe size={15} /> {lang === 'ar' ? 'EN' : 'ع'}
          </button>
          <Link to={user ? '/profile' : '/auth/signin'} className="avatar-btn" aria-label={t('auth.profile')}>
            {user ? (
              <span className="avatar-initial">{(user.name || user.email)[0].toUpperCase()}</span>
            ) : (
              <IconUser size={18} />
            )}
          </Link>
        </div>
      </header>

      <main className="app-main" key={path}>
        <Routes path={path} />
      </main>

      <InstallBanner />

      <nav className="bottom-nav" aria-label={t('nav.home')}>
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${path === item.to ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          className={`nav-item ${more.some((m) => m.to === path) ? 'active' : ''}`}
          onClick={() => setMenu(true)}
        >
          <IconSettings size={20} />
          <span>{t('nav.more')}</span>
        </button>
      </nav>

      {menu && (
        <div className="sheet-backdrop" onClick={() => setMenu(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="more-grid">
              {more.map((item) => (
                <Link key={item.to} to={item.to} className="more-item" onClick={() => setMenu(false)}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <p className="small muted" style={{ textAlign: 'center' }}>
              {t('app.name')} · {t('settings.version')} 1.0.0
            </p>
          </div>
        </div>
      )}

      <div className="toast" role="status" aria-live="polite">
        {toastMessage(toast)}
      </div>
      <span hidden>{syncState}</span>
    </div>
  );
}

/** The store exposes a toast function; this keeps a single visible element. */
function toastMessage(toast: (m: string) => void) {
  return null;
}

function Routes({ path }: { path: string }) {
  const { t } = useI18n();
  const routes: { pattern: string; element: JSX.Element }[] = [];
  return <>{t('app.name')}</>;
}

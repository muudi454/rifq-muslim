import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { useInstall } from '../lib/install';
import { CITY_PRESETS, METHODS } from '../lib/prayer';
import { DEFAULT_SETTINGS } from '../lib/data';
import { IconBookmark, IconGlobe, IconMoon, IconUser } from '../components/Icons';

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { settings, updateSettings, toast, bookmarks, sessions } = useStore();
  const { user, cloud, signOut } = useAuth();
  const { available, installed, promptInstall, ios } = useInstall();

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="page-sub">{t('app.name')}</p>
        </div>
      </header>

      <section className="card">
        <h2 className="section-title">
          <IconGlobe size={16} /> {t('settings.language')}
        </h2>
        <div className="segmented">
          <button
            className={`seg-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            {t('settings.english')}
          </button>
          <button
            className={`seg-btn ${lang === 'ar' ? 'active' : ''}`}
            onClick={() => setLang('ar')}
          >
            {t('settings.arabic')}
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">
          <IconMoon size={16} /> {t('settings.appearance')}
        </h2>
        <div className="segmented">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <button
              key={mode}
              className={`seg-btn ${settings.theme === mode ? 'active' : ''}`}
              onClick={() => updateSettings({ theme: mode })}
            >
              {t(`settings.${mode}`)}
            </button>
          ))}
        </div>

        <label className="field">
          <span>
            {t('settings.arabicSize')} · {settings.arabicSize}px
          </span>
          <input
            className="range"
            type="range"
            min={22}
            max={44}
            step={2}
            value={settings.arabicSize}
            onChange={(e) => updateSettings({ arabicSize: Number(e.target.value) })}
          />
        </label>

        <label className="switch-row">
          <span>{t('quran.showTranslation')}</span>
          <input
            type="checkbox"
            className="switch"
            checked={settings.showTranslation}
            onChange={(e) => updateSettings({ showTranslation: e.target.checked })}
          />
        </label>

        <label className="switch-row">
          <span>{t('tasbih.vibrate')}</span>
          <input
            type="checkbox"
            className="switch"
            checked={settings.vibrate}
            onChange={(e) => updateSettings({ vibrate: e.target.checked })}
          />
        </label>
      </section>

      <section className="card">
        <h2 className="section-title">{t('settings.prayerSettings')}</h2>
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
            <option value="">{t('prayer.useLocation')}</option>
            {CITY_PRESETS.map((c) => (
              <option key={c.name} value={c.name}>
                {lang === 'ar' ? c.nameAr : c.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card">
        <h2 className="section-title">
          <IconUser size={16} /> {t('settings.account')}
        </h2>
        <p className="row-sub">
          {user ? `${t('auth.signedInAs')} ${user.email}` : t('auth.guest')}
        </p>
        <p className="row-sub">
          {cloud ? t('auth.cloudModeHelp') : t('auth.localModeHelp')}
        </p>
        <div className="row">
          <Link to={user ? '/profile' : '/auth/signin'} className="btn btn-primary btn-sm">
            {user ? t('auth.profile') : t('auth.signIn')}
          </Link>
          {user && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                await signOut();
                toast(t('auth.signOut'));
              }}
            >
              {t('auth.signOut')}
            </button>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">
          <IconBookmark size={16} /> {t('settings.offline')}
        </h2>
        <p className="row-sub">
          {bookmarks.length} {t('nav.bookmarks')} · {sessions.length} {t('tasbih.history')}
        </p>
        {installed ? (
          <p className="alert alert-ok">{t('common.installed')}</p>
        ) : (
          <>
            <p className="row-sub">{ios ? t('install.ios') : t('install.help')}</p>
            {available && (
              <button className="btn btn-gold btn-sm" onClick={() => promptInstall()}>
                {t('common.install')}
              </button>
            )}
          </>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">{t('settings.dataSources')}</h2>
        <p className="row-sub">
          {t('quran.title')}: Tanzil Uthmani · {t('quran.translation')}: Sahih International
        </p>
        <p className="row-sub">{t('hadith.source')}: Hadeeth Encyclopedia (hadeethenc.com)</p>
        <p className="row-sub">{t('prayer.title')}: {t('prayer.computed')}</p>
      </section>

      <section className="card">
        <h2 className="section-title">{t('settings.version')}</h2>
        <p className="row-sub">RIFQ Muslim 1.0.0</p>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            updateSettings(DEFAULT_SETTINGS);
            toast(t('settings.saved'));
          }}
        >
          {t('settings.reset')}
        </button>
      </section>
    </div>
  );
}

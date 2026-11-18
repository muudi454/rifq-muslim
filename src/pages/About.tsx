import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { COUNTRIES, COUNTRY_COUNT } from '../data/countries';
import { IconBook, IconCompass, IconGlobe, IconMoon } from '../components/Icons';

/** Shown in Settings and on the app information screen. */
export const APP_VERSION = '1.1.0';
/** Exact developer credit, rendered verbatim everywhere it appears. */
export const DEVELOPER_CREDIT = 'Made by Eng Mohamud Yusuf';

const CITY_COUNT = COUNTRIES.reduce((total, country) => total + country.cities.length, 0);

export default function AboutPage() {
  const { t, lang } = useI18n();

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('about.title')}</h1>
          <p className="page-sub">{t('about.subtitle')}</p>
        </div>
      </header>

      <section className="about-hero">
        <span className="brand-mark" aria-hidden="true">
          <IconMoon size={24} />
        </span>
        <h1>{t('app.name')}</h1>
        <p>{t('app.tagline')}</p>
        <span className="credit">
          <span className="credit-mark" aria-hidden="true">
            ✦
          </span>
          <span className="credit-gold">{DEVELOPER_CREDIT}</span>
        </span>
      </section>

      <section className="card">
        <h2 className="section-title">{t('about.developer')}</h2>
        <div className="credit-hero">
          <span className="credit-mark" aria-hidden="true">
            ✦
          </span>
          <span className="credit-name">{DEVELOPER_CREDIT}</span>
          <span className="credit-role">{t('credit.role')}</span>
        </div>
        <div className="about-rows" style={{ marginTop: 12 }}>
          <div className="about-row">
            <span>{t('about.version')}</span>
            <span>{APP_VERSION}</span>
          </div>
          <div className="about-row">
            <span>{t('loc.timezone')}</span>
            <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">
          <IconGlobe size={16} /> {t('about.locationTitle')}
        </h2>
        <p className="row-sub">{t('about.locationText')}</p>
        <div className="about-rows" style={{ marginTop: 10 }}>
          <div className="about-row">
            <span>{t('loc.countries')}</span>
            <span>{COUNTRY_COUNT}</span>
          </div>
          <div className="about-row">
            <span>{t('loc.cities')}</span>
            <span>{CITY_COUNT}</span>
          </div>
          <div className="about-row">
            <span>ISO 3166-1</span>
            <span>{lang === 'ar' ? 'رموز دولية' : 'alpha-2 codes'}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">
          <IconBook size={16} /> {t('about.whatTitle')}
        </h2>
        <p className="row-sub">{t('about.whatText')}</p>
        <ul className="about-list" style={{ marginTop: 10 }}>
          <li>{t('about.dataQuran')}</li>
          <li>{t('about.dataHadith')}</li>
          <li>{t('about.dataPrayer')}</li>
          <li>{t('about.dataLocation')}</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="section-title">
          <IconCompass size={16} /> {t('about.freeTitle')}
        </h2>
        <p className="row-sub">{t('about.freeText')}</p>
        <p className="help" style={{ marginTop: 8 }}>
          {t('about.thanks')}
        </p>
      </section>

      <Link to="/settings" className="btn btn-ghost btn-block">
        {t('nav.settings')}
      </Link>
    </div>
  );
}

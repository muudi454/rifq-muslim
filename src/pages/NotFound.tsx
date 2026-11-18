import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { DEVELOPER_CREDIT } from '../lib/credit';

/**
 * Shown when the address does not match any screen in the app.
 * Replaces the old silent fallback to Home, so an unknown link is stated
 * clearly instead of pretending to be a different page.
 */
export default function NotFoundPage({ path }: { path: string }) {
  const { t } = useI18n();

  const destinations = [
    { to: '/', label: t('notFound.home') },
    { to: '/quran', label: t('nav.quran') },
    { to: '/prayer', label: t('nav.prayer') },
    { to: '/qibla', label: t('nav.qibla') },
    { to: '/tasbih', label: t('nav.tasbih') },
    { to: '/settings', label: t('nav.settings') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <div className="page" data-testid="not-found">
      <header className="page-head">
        <div>
          <p className="page-sub">{t('app.name')}</p>
          <h1 className="page-title">{t('notFound.title')}</h1>
        </div>
      </header>

      <section className="card">
        <p className="row-sub">{t('notFound.body')}</p>
        <p className="tiny muted">
          {t('notFound.address')}: <code dir="ltr">{path || '/'}</code>
        </p>
      </section>

      <section>
        <h2 className="section-title">{t('nav.more')}</h2>
        <div className="grid quick-grid">
          {destinations.map((d) => (
            <Link key={d.to} to={d.to} className="quick-tile">
              <span className="quick-label">{d.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <p className="small muted center">{DEVELOPER_CREDIT}</p>
    </div>
  );
}

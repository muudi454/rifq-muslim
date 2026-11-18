import { useI18n } from '../lib/i18n';
import { useInstall } from '../lib/install';

export function InstallBanner() {
  const { t } = useI18n();
  const { available, installed, promptInstall, ios } = useInstall();
  const [dismissed, setDismissed] = React.useState(() => {
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
        <p className="row-title">{t('install.title')}</p>
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
        ✕
      </button>
    </div>
  );
}

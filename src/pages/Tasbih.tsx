import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { IconRefresh, IconTrash } from '../components/Icons';

const DHIKR = [
  { key: 'tasbih.subhanallah', arabic: 'سُبْحَانَ اللهِ' },
  { key: 'tasbih.alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ' },
  { key: 'tasbih.allahuakbar', arabic: 'اللهُ أَكْبَرُ' },
  { key: 'tasbih.lailaha', arabic: 'لَا إِلَٰهَ إِلَّا اللهُ' },
  { key: 'tasbih.astaghfirullah', arabic: 'أَسْتَغْفِرُ اللهَ' },
  { key: 'tasbih.salawat', arabic: 'صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ' },
] as const;

const TARGETS = [33, 99, 100];

export default function TasbihPage() {
  const { t, lang } = useI18n();
  const { settings, updateSettings, sessions, addSession, toast } = useStore();
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const [target, setTarget] = useState(33);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  const dhikr = DHIKR[dhikrIndex];

  useEffect(() => {
    setCount(0);
  }, [dhikrIndex, target]);

  const progress = useMemo(() => Math.min(100, Math.round((count / target) * 100)), [count, target]);

  const tap = () => {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 140);
    setCount((prev) => {
      const next = prev + 1;
      if (settings.vibrate && 'vibrate' in navigator) navigator.vibrate(12);
      if (next === target) {
        toast(t('tasbih.completed'));
        if ('vibrate' in navigator) navigator.vibrate([40, 60, 40]);
      }
      return next;
    });
  };

  const save = () => {
    if (count === 0) return;
    addSession({ dhikr: t(dhikr.key), count, target });
    toast(t('tasbih.saved'));
    setCount(0);
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('tasbih.title')}</h1>
          <p className="page-sub">{t('tasbih.tap')}</p>
        </div>
        <button
          className="icon-btn"
          aria-label={t('tasbih.vibrate')}
          onClick={() => updateSettings({ vibrate: !settings.vibrate })}
        >
          {settings.vibrate ? '📳' : '🔇'}
        </button>
      </header>

      <div className="chip-row">
        {DHIKR.map((d, i) => (
          <button
            key={d.key}
            className={`chip ${i === dhikrIndex ? 'chip-active' : ''}`}
            onClick={() => setDhikrIndex(i)}
          >
            {t(d.key)}
          </button>
        ))}
      </div>

      <section className="card tasbih-stage">
        <p className="tasbih-dhikr arabic" dir="rtl">
          {dhikr.arabic}
        </p>
        <button
          className={`tasbih-btn ${pulse ? 'pulse' : ''}`}
          onClick={tap}
          aria-label={`${t('tasbih.count')} ${count}`}
        >
          <span className="tasbih-count">{count}</span>
          <span className="tiny muted">/ {target}</span>
        </button>
        <div className="tasbih-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="segmented">
          {TARGETS.map((v) => (
            <button
              key={v}
              className={`seg-btn ${target === v ? 'active' : ''}`}
              onClick={() => setTarget(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="row">
          <button className="btn btn-ghost" onClick={() => setCount(0)}>
            <IconRefresh size={16} /> {t('tasbih.reset')}
          </button>
          <button className="btn btn-primary" onClick={save} disabled={count === 0}>
            {t('common.save')}
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">
          {t('tasbih.history')}{' '}
          <span className="badge">{sessions.length}</span>
        </h2>
        {sessions.length === 0 ? (
          <p className="empty">{t('tasbih.noHistory')}</p>
        ) : (
          <div className="list">
            {sessions.map((s) => (
              <div key={s.id} className="row">
                <div className="row-main">
                  <p className="row-title">{s.dhikr}</p>
                  <p className="row-sub">
                    {new Date(s.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="badge">
                  {s.count}/{s.target}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="footer-note">{t('tasbih.sound')}</p>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { dayIndex, loadHadith, type Hadith, type HadithData } from '../lib/data';
import { IconBookmark, IconCopy, IconRefresh, IconSearch } from '../components/Icons';

const CATEGORIES = ['all', 'manners', 'creed', 'fiqh', 'seerah'] as const;
type Cat = (typeof CATEGORIES)[number];

export default function HadithPage() {
  const { t, lang } = useI18n();
  const { toggleBookmark, isBookmarked, toast } = useStore();
  const [data, setData] = useState<HadithData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Cat>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadHadith()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(t('common.error')));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    if (!data) return [] as Hadith[];
    const q = query.trim().toLowerCase();
    return data.hadiths.filter((h) => {
      const inCat = category === 'all' || h.category === category;
      const inQuery =
        !q ||
        h.title.toLowerCase().includes(q) ||
        h.text.toLowerCase().includes(q) ||
        h.arabic.includes(query.trim()) ||
        h.reference.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [data, category, query]);

  const random = () => {
    if (!data?.hadiths.length) return;
    const pick = data.hadiths[Math.floor(Math.random() * data.hadiths.length)];
    setCategory('all');
    setQuery('');
    setOpenId(pick.id);
    toast(t('hadith.random'));
    window.setTimeout(() => {
      document.getElementById(`hadith-${pick.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const copy = async (h: Hadith) => {
    try {
      await navigator.clipboard.writeText(
        `${h.arabic}\n\n${h.text}\n\n${h.attribution} — ${h.reference} (${h.grade})`,
      );
      toast(t('common.copied'));
    } catch {
      toast(t('common.error'));
    }
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('hadith.title')}</h1>
          <p className="page-sub">
            {data ? `${data.hadiths.length} ${t('hadith.count')}` : t('common.loading')}
          </p>
        </div>
        <button className="icon-btn" onClick={random} aria-label={t('hadith.random')}>
          <IconRefresh size={20} />
        </button>
      </header>

      <label className="search-row">
        <IconSearch size={18} />
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('hadith.search')}
          aria-label={t('hadith.search')}
        />
      </label>

      <div className="chip-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'chip-active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c === 'all' ? t('common.all') : t(`hadith.categories.${c}`)}
          </button>
        ))}
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {!data && !error && <p className="empty">{t('common.loading')}</p>}
      {data && !list.length && <p className="empty">{t('common.empty')}</p>}

      <div className="list">
        {list.map((h) => {
          const id = `hadith:${h.id}`;
          const open = openId === h.id;
          return (
            <article key={h.id} id={`hadith-${h.id}`} className="card hadith-card">
              <div className="row">
                <div className="row-main">
                  <span className="badge badge-gold">{t(`hadith.categories.${h.category}`)}</span>
                  <h2 className="row-title">{h.title}</h2>
                </div>
                <button
                  className="icon-btn"
                  aria-label={t('common.save')}
                  onClick={() =>
                    toggleBookmark({
                      id,
                      type: 'hadith',
                      ref: '/hadith',
                      title: h.title,
                      text: h.arabic,
                    })
                  }
                >
                  <IconBookmark size={18} className={isBookmarked(id) ? 'filled' : ''} />
                </button>
              </div>

              <p className="arabic" dir="rtl">
                {h.arabic}
              </p>
              <p className="row-sub">{h.text}</p>

              <div className="meta-row">
                <span className="badge">{h.grade}</span>
                <span className="small muted">{h.reference}</span>
              </div>

              {open && (
                <>
                  <p className="small muted">{h.attribution}</p>
                  <p className="row-sub">{h.explanation}</p>
                </>
              )}

              <div className="row">
                <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(open ? null : h.id)}>
                  {open ? t('common.close') : t('hadith.explanation')}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => copy(h)}>
                  <IconCopy size={15} /> {t('common.copy')}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {data && (
        <p className="footer-note">
          {t('hadith.source')}: {data.source.name}. {data.source.note}
        </p>
      )}
    </div>
  );
}

export const dailyHadith = (hadiths: Hadith[], date: Date) =>
  hadiths.length ? hadiths[dayIndex(date, hadiths.length)] : null;

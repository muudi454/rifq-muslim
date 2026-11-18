import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { loadQuran, RECITER, type QuranData } from '../lib/data';
import {
  IconBookmark,
  IconChevronLeft,
  IconChevronRight,
  IconPause,
  IconPlay,
  IconSearch,
  IconX,
} from '../components/Icons';

export default function QuranPage({ surah: surahParam }: { surah?: number }) {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const { settings, updateSettings, toggleBookmark, isBookmarked, toast } = useStore();
  const [data, setData] = useState<QuranData | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    loadQuran()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => {
      audioRef.current?.pause();
      setPlaying(null);
    };
  }, [surahParam]);

  const surahs = data?.surahs ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.en.toLowerCase().includes(q) ||
        s.tr.toLowerCase().includes(q) ||
        s.name.includes(query.trim()) ||
        String(s.n) === q,
    );
  }, [surahs, query]);

  const surah = surahParam ? surahs.find((s) => s.n === surahParam) : undefined;

  const playAyah = (surahNo: number, ayahNo: number) => {
    const id = `${surahNo}:${ayahNo}`;
    if (playing === id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.src = RECITER.url(surahNo, ayahNo);
    audio.onended = () => setPlaying(null);
    audio.onerror = () => {
      setPlaying(null);
      toast(t('common.error'));
    };
    void audio.play().then(() => setPlaying(id)).catch(() => setPlaying(null));
  };

  if (error) {
    return (
      <div className="page">
        <div className="empty">
          <p>{t('common.error')}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 64, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 240 }} />
      </div>
    );
  }

  if (!surahParam) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <h1 className="page-title">{t('quran.title')}</h1>
            <p className="page-sub">{t('quran.source')}</p>
          </div>
        </header>

        <div className="input-group">
          <IconSearch size={18} />
          <input
            className="input"
            type="search"
            value={query}
            placeholder={t('quran.search')}
            aria-label={t('quran.search')}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="icon-btn" onClick={() => setQuery('')} aria-label={t('common.close')}>
              <IconX size={16} />
            </button>
          )}
        </div>

        <div className="list">
          {filtered.map((s) => (
            <Link key={s.n} to={`/quran/${s.n}`} className="surah-card">
              <span className="surah-num">{s.n}</span>
              <span className="row-main">
                <span className="row-title">{lang === 'ar' ? s.name : s.en}</span>
                <span className="row-sub">
                  {s.tr} · {s.ayahs.length} {t('quran.ayahs')} ·{' '}
                  {s.type === 'Meccan' ? t('quran.meccan') : t('quran.medinan')}
                </span>
              </span>
              <span className="surah-name-ar arabic" dir="rtl">
                {s.name}
              </span>
            </Link>
          ))}
          {!filtered.length && <p className="empty">{t('common.empty')}</p>}
        </div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="page">
        <div className="empty">
          <p>{t('common.empty')}</p>
          <Link to="/quran" className="btn btn-primary">
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  const prev = surah.n > 1 ? surah.n - 1 : null;
  const next = surah.n < 114 ? surah.n + 1 : null;

  return (
    <div className="page">
      <header className="surah-header">
        <button className="icon-btn" onClick={() => navigate('/quran')} aria-label={t('common.back')}>
          <IconChevronLeft size={20} />
        </button>
        <div className="row-main" style={{ textAlign: 'center' }}>
          <h1 className="row-title">{lang === 'ar' ? surah.name : surah.en}</h1>
          <p className="row-sub">
            {surah.tr} · {surah.ayahs.length} {t('quran.ayahs')}
          </p>
        </div>
        <button
          className="icon-btn"
          aria-label={t('quran.bookmark')}
          onClick={() =>
            toggleBookmark({
              id: `surah:${surah.n}`,
              type: 'ayah',
              ref: `/quran/${surah.n}`,
              title: `${surah.en} (${surah.n})`,
              text: surah.ayahs[0]?.[1] ?? '',
            })
          }
        >
          <IconBookmark size={20} className={isBookmarked(`surah:${surah.n}`) ? 'filled' : ''} />
        </button>
      </header>

      <div className="reader-toolbar">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => updateSettings({ showTranslation: !settings.showTranslation })}
        >
          {settings.showTranslation ? t('quran.hideTranslation') : t('quran.showTranslation')}
        </button>
        <div className="segmented">
          <button
            className="seg-btn"
            aria-label={t('settings.arabicSize')}
            onClick={() => updateSettings({ arabicSize: Math.max(20, settings.arabicSize - 2) })}
          >
            A−
          </button>
          <button
            className="seg-btn"
            aria-label={t('settings.arabicSize')}
            onClick={() => updateSettings({ arabicSize: Math.min(44, settings.arabicSize + 2) })}
          >
            A+
          </button>
        </div>
      </div>

      {surah.n !== 1 && surah.n !== 9 && (
        <p className="bismillah arabic" dir="rtl">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      )}

      <div className="ayah-list">
        {surah.ayahs.map(([ar, en], i) => {
          const ayahNo = i + 1;
          const id = `${surah.n}:${ayahNo}`;
          return (
            <article className="ayah" key={id}>
              <div className="ayah-head">
                <span className="ayah-num">{ayahNo}</span>
                <div className="chip-row">
                  <button
                    className="icon-btn"
                    aria-label={playing === id ? t('common.pause') : t('quran.play')}
                    onClick={() => playAyah(surah.n, ayahNo)}
                  >
                    {playing === id ? <IconPause size={18} /> : <IconPlay size={18} />}
                  </button>
                  <button
                    className="icon-btn"
                    aria-label={t('quran.bookmark')}
                    onClick={() =>
                      toggleBookmark({
                        id: `ayah:${id}`,
                        type: 'ayah',
                        ref: `/quran/${surah.n}`,
                        title: `${surah.en} ${surah.n}:${ayahNo}`,
                        text: en,
                      })
                    }
                  >
                    <IconBookmark
                      size={18}
                      className={isBookmarked(`ayah:${id}`) ? 'filled' : ''}
                    />
                  </button>
                </div>
              </div>
              <p className="ayah-text arabic" dir="rtl">
                {ar}
              </p>
              {settings.showTranslation && <p className="ayah-translation">{en}</p>}
            </article>
          );
        })}
      </div>

      <div className="row nav-row">
        {prev ? (
          <Link to={`/quran/${prev}`} className="btn btn-ghost">
            <IconChevronLeft size={16} /> {t('quran.prev')}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/quran/${next}`} className="btn btn-ghost">
            {t('quran.next')} <IconChevronRight size={16} />
          </Link>
        ) : (
          <span />
        )}
      </div>

      <p className="footer-note">{t('quran.source')}</p>
    </div>
  );
}

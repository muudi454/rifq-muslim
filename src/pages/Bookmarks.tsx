import { useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { IconBookmark, IconTrash } from '../components/Icons';

const FILTERS = ['all', 'ayah', 'dua', 'hadith'] as const;

export default function BookmarksPage() {
  const { t, lang } = useI18n();
  const { bookmarks, removeBookmark, toast } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');

  const list = useMemo(
    () =>
      [...bookmarks]
        .filter((b) => filter === 'all' || b.type === filter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookmarks, filter],
  );

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('bookmarks.title')}</h1>
          <p className="page-sub">
            {bookmarks.length} {t('common.all')}
          </p>
        </div>
        <span className="ornament" aria-hidden="true">
          <IconBookmark size={24} />
        </span>
      </header>

      <div className="chip-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`chip ${filter === f ? 'chip-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all'
              ? t('common.all')
              : f === 'ayah'
                ? t('bookmarks.ayahs')
                : f === 'dua'
                  ? t('bookmarks.duas')
                  : t('bookmarks.hadith')}
          </button>
        ))}
      </div>

      {!list.length && <p className="empty">{t('bookmarks.empty')}</p>}

      <div className="list">
        {list.map((b) => (
          <article key={b.id} className="card">
            <div className="row">
              <div className="row-main">
                <span className="badge">
                  {b.type === 'ayah'
                    ? t('bookmarks.ayahs')
                    : b.type === 'dua'
                      ? t('bookmarks.duas')
                      : t('bookmarks.hadith')}
                </span>
                <h2 className="row-title">{b.title}</h2>
              </div>
              <button
                className="icon-btn"
                aria-label={t('common.delete')}
                onClick={() => {
                  removeBookmark(b.id);
                  toast(t('bookmarks.removed'));
                }}
              >
                <IconTrash size={17} />
              </button>
            </div>
            <p className="arabic small-ar" dir="rtl">
              {b.text.length > 220 ? `${b.text.slice(0, 220)}…` : b.text}
            </p>
            <p className="row-sub">
              {new Date(b.createdAt).toLocaleDateString(
                lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB',
                { day: '2-digit', month: 'short', year: 'numeric' },
              )}
            </p>
            <Link to={b.ref} className="btn btn-ghost btn-sm">
              {t('common.viewAll')}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

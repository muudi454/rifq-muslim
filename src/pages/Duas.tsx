import { useMemo, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { DUAS, type DuaCategory } from '../data/duas';
import { IconBookmark, IconCopy, IconHands } from '../components/Icons';

const CATEGORIES: (DuaCategory | 'all')[] = ['all', 'morning', 'daily', 'quran', 'distress', 'travel'];

export default function DuasPage() {
  const { t, lang } = useI18n();
  const { toggleBookmark, isBookmarked, toast } = useStore();
  const [category, setCategory] = useState<DuaCategory | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () => (category === 'all' ? DUAS : DUAS.filter((d) => d.category === category)),
    [category],
  );

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(t('common.copied'));
    } catch {
      toast(t('common.error'));
    }
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('duas.title')}</h1>
          <p className="page-sub">
            {list.length} {t('duas.count')}
          </p>
        </div>
        <span className="ornament" aria-hidden="true">
          <IconHands size={24} />
        </span>
      </header>

      <div className="chip-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'chip-active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c === 'all' ? t('common.all') : t(`duas.categories.${c}`)}
          </button>
        ))}
      </div>

      <div className="list">
        {list.map((dua) => {
          const id = `dua:${dua.id}`;
          const open = openId === dua.id;
          return (
            <article key={dua.id} className="card dua-card">
              <div className="row">
                <div className="row-main">
                  <h2 className="row-title">{lang === 'ar' ? dua.titleAr : dua.titleEn}</h2>
                  <p className="row-sub">{lang === 'ar' ? dua.referenceAr : dua.referenceEn}</p>
                </div>
                <button
                  className="icon-btn"
                  aria-label={t('duas.favorite')}
                  onClick={() =>
                    toggleBookmark({
                      id,
                      type: 'dua',
                      ref: '/duas',
                      title: lang === 'ar' ? dua.titleAr : dua.titleEn,
                      text: dua.arabic,
                    })
                  }
                >
                  <IconBookmark size={18} className={isBookmarked(id) ? 'filled' : ''} />
                </button>
              </div>

              <p className="arabic" dir="rtl">
                {dua.arabic}
              </p>

              {open && (
                <>
                  <p className="translit">{dua.transliteration}</p>
                  <p className="row-sub">{dua.english}</p>
                </>
              )}

              <div className="row">
                <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(open ? null : dua.id)}>
                  {open ? t('common.close') : t('common.viewAll')}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => copy(`${dua.arabic}\n\n${dua.english}\n\n${dua.referenceEn}`)}
                >
                  <IconCopy size={15} /> {t('common.copy')}
                </button>
              </div>
            </article>
          );
        })}
        {!list.length && <p className="empty">{t('common.empty')}</p>}
      </div>
    </div>
  );
}

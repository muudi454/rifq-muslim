import { useMemo, useState } from 'react';
import { useI18n } from '../lib/i18n';
import {
  ISLAMIC_OCCASIONS,
  formatHijri,
  hijriMonthName,
  hijriMonthStart,
  isSameDay,
  occasionFor,
  toHijri,
} from '../lib/qibla';
import { IconChevronLeft, IconChevronRight } from '../components/Icons';

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function CalendarPage() {
  const { t, lang } = useI18n();
  const today = useMemo(() => new Date(), []);
  const todayHijri = useMemo(() => toHijri(today), [today]);
  const [view, setView] = useState({ year: todayHijri.year, month: todayHijri.month });

  const grid = useMemo(() => {
    const start = hijriMonthStart(view.year, view.month);
    const nextMonth =
      view.month === 12
        ? hijriMonthStart(view.year + 1, 1)
        : hijriMonthStart(view.year, view.month + 1);
    const days = Math.round((nextMonth.getTime() - start.getTime()) / 86400000);
    const lead = start.getDay();
    const cells: { date: Date | null; hijri?: ReturnType<typeof toHijri> }[] = [];
    for (let i = 0; i < lead; i++) cells.push({ date: null });
    for (let d = 0; d < days; d++) {
      const date = new Date(start.getTime() + d * 86400000);
      cells.push({ date, hijri: toHijri(date) });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null });
    return cells;
  }, [view]);

  const shift = (delta: number) => {
    setView((prev) => {
      let month = prev.month + delta;
      let year = prev.year;
      if (month > 12) {
        month = 1;
        year += 1;
      }
      if (month < 1) {
        month = 12;
        year -= 1;
      }
      return { year, month };
    });
  };

  const occasionsThisMonth = useMemo(
    () =>
      ISLAMIC_OCCASIONS.filter((o) => {
        const parts = o.md.split(/[-/]/).map(Number);
        return parts[0] === view.month || parts[1] === view.month;
      }),
    [view.month],
  );

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('calendar.title')}</h1>
          <p className="page-sub">{formatHijri(today, lang)}</p>
        </div>
      </header>

      <section className="card">
        <div className="cal-head">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label={t('common.back')}>
            <IconChevronLeft size={18} />
          </button>
          <div className="cal-title">
            <h2 className="row-title">
              {hijriMonthName(view.month, lang)} {view.year}
            </h2>
            <p className="row-sub">
              {grid.find((c) => c.date)?.date?.toLocaleDateString(
                lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB',
                { month: 'long', year: 'numeric' },
              )}
            </p>
          </div>
          <button className="icon-btn" onClick={() => shift(1)} aria-label={t('common.next')}>
            <IconChevronRight size={18} />
          </button>
        </div>

        <div className="cal-grid">
          {(lang === 'ar' ? WEEKDAYS_AR : WEEKDAYS_EN).map((d) => (
            <div key={d} className="cal-dow">
              {d}
            </div>
          ))}
          {grid.map((cell, i) => {
            if (!cell.date) return <div key={`empty-${i}`} className="cal-cell cal-empty" />;
            const isToday = isSameDay(cell.date, today);
            const occasion = cell.hijri ? occasionFor(cell.hijri) : undefined;
            return (
              <div
                key={cell.date.toISOString()}
                className={`cal-cell ${isToday ? 'cal-today' : ''} ${occasion ? 'cal-event' : ''}`}
              >
                <span className="cal-hijri">{cell.hijri?.day}</span>
                <span className="cal-greg">
                  {cell.date.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', {
                    day: 'numeric',
                  })}
                </span>
                {occasion && <span className="cal-dot" aria-hidden="true" />}
              </div>
            );
          })}
        </div>

        <p className="help">{t('calendar.note')}</p>
      </section>

      <section className="card">
        <h2 className="section-title">{t('calendar.events')}</h2>
        <div className="list">
          {occasionsThisMonth.map((o) => (
            <div key={o.md} className="row">
              <span className="badge badge-gold">{o.md}</span>
              <span className="row-title">{lang === 'ar' ? o.ar : o.en}</span>
            </div>
          ))}
          {!occasionsThisMonth.length && <p className="empty">{t('common.none')}</p>}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">{t('calendar.todayIs')}</h2>
        <p className="row-title">{formatHijri(today, lang)}</p>
        <p className="row-sub">
          {today.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </section>
    </div>
  );
}

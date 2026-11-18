import { useEffect, useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useStore } from '../lib/store';
import { formatCountdown, formatTime, getPrayerTimes } from '../lib/prayer';
import { locationTimeZone } from '../lib/location';
import type { AthanPrayer, AthanSettings } from '../lib/data';
import {
  ATHAN_PRAYERS,
  ATHAN_SOUNDS,
  athanPermission,
  enablePushNotifications,
  nextAthan,
  normalizeAthan,
  previewAthanSound,
  requestAthanPermission,
  showSystemNotification,
  stopAthanPreview,
  type PermissionState,
} from '../lib/athan';

function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="switch-knob" />
    </button>
  );
}

export default function NotificationsPage() {
  const { t, lang } = useI18n();
  const { settings, updateSettings, toast } = useStore();
  const L = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const athan = useMemo(() => normalizeAthan(settings.athan), [settings.athan]);
  const [now, setNow] = useState(() => new Date());
  const [permission, setPermission] = useState<PermissionState>(() => athanPermission());
  const [soundNote, setSoundNote] = useState<string | null>(null);
  const [pushNote, setPushNote] = useState<string | null>(null);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const refresh = () => setPermission(athanPermission());
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      stopAthanPreview();
    };
  }, []);

  const timeZone = settings.location ? locationTimeZone(settings.location) : undefined;
  const times = useMemo(() => {
    if (!settings.location) return null;
    try {
      return getPrayerTimes(now, { latitude: settings.location.lat, longitude: settings.location.lon }, settings.method, settings.madhab, timeZone, settings.highLatitude).times;
    } catch {
      return null;
    }
  }, [now, settings.location, settings.method, settings.madhab, timeZone]);

  const upcoming = useMemo(() => nextAthan(settings, now), [settings, now]);

  const patch = (next: Partial<AthanSettings>) => updateSettings({ athan: { ...athan, ...next } });

  const askPermission = async () => {
    const result = await requestAthanPermission();
    setPermission(result);
    if (result === 'granted') toast(L('Notifications allowed on this device', 'تم السماح بالإشعارات'));
    else if (result === 'denied') toast(L('Notifications are blocked in browser settings', 'الإشعارات محظورة في إعدادات المتصفح'));
  };

  const toggleMaster = async (next: boolean) => {
    if (next && permission === 'default') await askPermission();
    patch({ enabled: next });
  };

  const testSound = async (id: string) => {
    const result = await previewAthanSound(id, athan.volume);
    if (result.ok) setSoundNote(L('Playing… tap again to replay', 'يتم التشغيل… اضغط مرة أخرى'));
    else if (result.reason === 'system_sound')
      setSoundNote(L('This option uses your device sound, so there is nothing to preview.', 'هذا الخيار يستخدم صوت الجهاز، لا يوجد ما يُسمع هنا.'));
    else setSoundNote(L('The browser blocked playback. Tap the button again.', 'منع المتصفح التشغيل. اضغط الزر مرة أخرى.'));
  };

  const testNotification = async () => {
    if (permission !== 'granted') {
      await askPermission();
      return;
    }
    const ok = await showSystemNotification(
      L('RIFQ Muslim test', 'اختبار رِفْق مسلم'),
      L('Athan notifications are working on this device.', 'إشعارات الأذان تعمل على هذا الجهاز.'),
      'rifq-test',
    );
    toast(ok ? L('Test notification sent', 'تم إرسال إشعار تجريبي') : L('Could not show a notification', 'تعذّر عرض الإشعار'));
  };

  const enablePush = async () => {
    setPushBusy(true);
    const result = await enablePushNotifications();
    setPushBusy(false);
    if (result.ok) {
      setPushNote(L('Background push is enabled for this device.', 'تم تشغيل الإشعارات في الخلفية لهذا الجهاز.'));
      return;
    }
    if (result.reason === 'not_configured')
      setPushNote(
        L(
          'Background push needs the server push keys. Athan still works while the app is open or installed.',
          'إشعارات الخلفية تحتاج مفاتيح الخادم. الأذان يعمل أثناء فتح التطبيق أو بعد تثبيته.',
        ),
      );
    else if (result.reason === 'denied')
      setPushNote(L('Notification permission was not granted.', 'لم يتم منح إذن الإشعارات.'));
    else if (result.reason === 'unsupported')
      setPushNote(L('This browser does not support background push.', 'هذا المتصفح لا يدعم إشعارات الخلفية.'));
    else setPushNote(L('Could not enable background push. Try again later.', 'تعذّر تشغيل إشعارات الخلفية. حاول لاحقًا.'));
  };

  const permissionText =
    permission === 'granted'
      ? L('Allowed', 'مسموح')
      : permission === 'denied'
        ? L('Blocked', 'محظور')
        : permission === 'unsupported'
          ? L('Not supported', 'غير مدعوم')
          : L('Not requested yet', 'لم يُطلب بعد');

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{L('Athan notifications', 'إشعارات الأذان')}</h1>
          <p className="muted small">
            {L(
              'Times are calculated from your saved coordinates and calculation method.',
              'تُحسب المواقيت من إحداثياتك وطريقة الحساب المختارة.',
            )}
          </p>
        </div>
      </header>

      {!settings.location && (
        <div className="alert alert-warn">
          <strong>{L('No location saved yet', 'لم يُحفظ موقع بعد')}</strong>
          <p className="small">
            {L(
              'Athan needs your real coordinates. Set your location first — GPS or manual search.',
              'الأذان يحتاج إحداثياتك الحقيقية. حدّد موقعك أولًا — عبر GPS أو البحث اليدوي.',
            )}
          </p>
          <Link className="btn btn-primary btn-sm" to="/settings">
            {L('Set my location', 'حدّد موقعي')}
          </Link>
        </div>
      )}

      <section className="card">
        <div className="row">
          <div className="row-main">
            <div className="row-title">{L('Device notifications', 'إشعارات الجهاز')}</div>
            <div className="row-sub">
              {L('Status', 'الحالة')}: <strong data-testid="notif-permission">{permissionText}</strong>
            </div>
          </div>
          {permission !== 'granted' && permission !== 'unsupported' && (
            <button className="btn btn-primary btn-sm" onClick={askPermission} type="button">
              {L('Allow', 'السماح')}
            </button>
          )}
        </div>
        <p className="tiny muted">
          {L(
            'Your browser or phone asks once. If it was blocked, allow notifications for this site in the browser settings.',
            'يسألك المتصفح مرة واحدة. إذا تم الحظر، اسمح بالإشعارات لهذا الموقع من إعدادات المتصفح.',
          )}
        </p>
        {permission === 'granted' && (
          <button className="btn btn-ghost btn-sm" onClick={testNotification} type="button">
            {L('Send test notification', 'إرسال إشعار تجريبي')}
          </button>
        )}
      </section>

      <section className="card">
        <div className="row">
          <div className="row-main">
            <div className="row-title">{L('Athan alerts', 'تنبيهات الأذان')}</div>
            <div className="row-sub">
              {L('Play the Adhan when each prayer begins', 'تشغيل الأذان عند دخول وقت كل صلاة')}
            </div>
          </div>
          <Switch
            checked={athan.enabled}
            onChange={toggleMaster}
            label={L('Athan alerts', 'تنبيهات الأذان')}
            disabled={!settings.location}
          />
        </div>

        {athan.enabled && upcoming && (
          <div className="next-athan" data-testid="next-athan">
            <div className="tiny muted">{L('Next Athan', 'الأذان القادم')}</div>
            <div className="next-athan-main">
              <strong>{t(`prayer.${upcoming.prayer}`)}</strong>
              <span className="muted">· {formatTime(upcoming.at, lang, true, timeZone)}</span>
            </div>
            <div className="countdown" data-testid="next-athan-countdown">
              {formatCountdown(upcoming.remainingMs)}
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-title">{L('Per prayer', 'لكل صلاة')}</div>
        <p className="tiny muted">
          {L(
            'Turn each prayer on or off separately. Times shown are today’s for your location.',
            'يمكنك تشغيل أو إيقاف كل صلاة على حدة. المواقيت المعروضة هي مواقيت اليوم لموقعك.',
          )}
        </p>
        <ul className="athan-list">
          {ATHAN_PRAYERS.map((prayer: AthanPrayer) => (
            <li className="athan-row" key={prayer}>
              <div className="row-main">
                <div className="row-title">{t(`prayer.${prayer}`)}</div>
                <div className="row-sub" data-testid={`athan-time-${prayer}`}>
                  {times ? formatTime(times[prayer], lang, true, timeZone) : '—'}
                </div>
              </div>
              <Switch
                checked={athan.prayers[prayer]}
                onChange={(next) => patch({ prayers: { ...athan.prayers, [prayer]: next } })}
                label={t(`prayer.${prayer}`)}
                disabled={!athan.enabled}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="section-title">{L('Athan sound', 'صوت الأذان')}</div>
        <div className="sound-list" data-testid="sound-list">
          {ATHAN_SOUNDS.map((sound) => (
            <label className={`sound-option${athan.sound === sound.id ? ' selected' : ''}`} key={sound.id}>
              <input
                type="radio"
                name="athan-sound"
                value={sound.id}
                checked={athan.sound === sound.id}
                onChange={() => patch({ sound: sound.id })}
              />
              <span className="row-main">
                <span className="row-title">{lang === 'ar' ? sound.nameAr : sound.nameEn}</span>
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => testSound(sound.id)}
                aria-label={`${L('Preview', 'استماع')} ${sound.nameEn}`}
              >
                {L('Preview', 'استماع')}
              </button>
            </label>
          ))}
        </div>
        {soundNote && <p className="tiny muted">{soundNote}</p>}

        <label className="field">
          <span>{L('Volume', 'مستوى الصوت')}</span>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={Math.round(athan.volume * 100)}
            onChange={(event) => patch({ volume: Number(event.target.value) / 100 })}
          />
        </label>
      </section>

      <section className="card">
        <div className="row">
          <div className="row-main">
            <div className="row-title">{L('Special Fajr setting', 'إعداد خاص بالفجر')}</div>
            <div className="row-sub">
              {L('Use a different sound for Fajr', 'استخدام صوت مختلف لصلاة الفجر')}
            </div>
          </div>
          <Switch
            checked={athan.fajrSpecial}
            onChange={(next) => patch({ fajrSpecial: next })}
            label={L('Special Fajr setting', 'إعداد خاص بالفجر')}
          />
        </div>
        {athan.fajrSpecial && (
          <label className="field">
            <span>{L('Fajr sound', 'صوت الفجر')}</span>
            <select
              value={athan.fajrSound}
              onChange={(event) => patch({ fajrSound: event.target.value })}
              data-testid="fajr-sound"
            >
              {ATHAN_SOUNDS.map((sound) => (
                <option value={sound.id} key={sound.id}>
                  {lang === 'ar' ? sound.nameAr : sound.nameEn}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="card">
        <div className="section-title">{L('Reminder before prayer', 'تذكير قبل الصلاة')}</div>
        <label className="field">
          <span>{L('How early?', 'قبل كم؟')}</span>
          <select
            value={athan.preReminderMinutes}
            onChange={(event) => patch({ preReminderMinutes: Number(event.target.value) })}
            data-testid="pre-reminder"
          >
            <option value={0}>{L('Off', 'إيقاف')}</option>
            {[5, 10, 15, 20, 30].map((minutes) => (
              <option value={minutes} key={minutes}>
                {lang === 'ar' ? `${minutes} دقائق قبل الأذان` : `${minutes} minutes before`}
              </option>
            ))}
          </select>
        </label>
        <p className="tiny muted">
          {L(
            'A short notification appears before the prayer time. It does not play the Adhan.',
            'يظهر إشعار قصير قبل وقت الصلاة، ولا يشغّل الأذان.',
          )}
        </p>
      </section>

      <section className="card">
        <div className="section-title">{L('Background notifications', 'إشعارات في الخلفية')}</div>
        <p className="small muted">
          {L(
            'Athan audio plays while RIFQ Muslim is open or installed. Push keeps you reachable when the app is closed, and also delivers announcements from the app team.',
            'يعمل صوت الأذان أثناء فتح رِفْق مسلم أو بعد تثبيته. أما الإشعارات الفورية فتُبقيك على تواصل عند إغلاق التطبيق، وتوصلك إعلانات فريق التطبيق.',
          )}
        </p>
        <button className="btn btn-primary btn-sm" onClick={enablePush} disabled={pushBusy} type="button">
          {pushBusy ? L('Enabling…', 'جارٍ التشغيل…') : L('Enable background push', 'تشغيل إشعارات الخلفية')}
        </button>
        {pushNote && (
          <p className="tiny" data-testid="push-note">
            {pushNote}
          </p>
        )}
      </section>

      <section className="card">
        <div className="section-title">{L('Device limits', 'حدود الأجهزة')}</div>
        <ul className="info-list tiny">
          <li>
            {L(
              'iPhone and iPad: notifications work from iOS 16.4 onwards, and only after you add RIFQ Muslim to the Home Screen.',
              'آيفون وآيباد: تعمل الإشعارات من iOS 16.4 فما فوق، وبعد إضافة رِفْق مسلم إلى الشاشة الرئيسية.',
            )}
          </li>
          <li>
            {L(
              'Android: allow notifications and exclude the app from battery optimisation so alerts are not delayed.',
              'أندرويد: اسمح بالإشعارات واستثنِ التطبيق من تحسين البطارية حتى لا تتأخر التنبيهات.',
            )}
          </li>
          <li>
            {L(
              'Some browsers only play audio after you interact with the page. Tap “Preview” once to unlock sound.',
              'بعض المتصفحات لا تشغّل الصوت إلا بعد تفاعل منك. اضغط «استماع» مرة واحدة لتفعيل الصوت.',
            )}
          </li>
          <li>
            {L(
              'Athan times follow your saved coordinates. Change your location any time in Settings.',
              'تتبع مواقيت الأذان إحداثياتك المحفوظة. يمكنك تغيير موقعك في أي وقت من الإعدادات.',
            )}
          </li>
        </ul>
      </section>
    </div>
  );
}

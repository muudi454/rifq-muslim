/*
 * Athan notifications.
 *
 * Prayer times are never hardcoded: every schedule is computed from the
 * coordinates and calculation method the user chose, in the location's own
 * time zone. Audio files are bundled with the app so playback does not depend
 * on a third-party host at prayer time.
 */
import { DEFAULT_ATHAN, type AthanPrayer, type AthanSettings, type UserSettings } from './data';
import { getPrayerTimes } from './prayer';
import { locationTimeZone } from './location';
import { api, urlBase64ToUint8Array, getDeviceId } from './api';
import { showNotification } from './notify';

export interface AthanSound {
  id: string;
  /** Bundled file, or null when the device's own notification sound is used. */
  file: string | null;
  nameEn: string;
  nameAr: string;
}

export const ATHAN_PRAYERS: AthanPrayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const ATHAN_SOUNDS: AthanSound[] = [
  {
    id: 'adhan-makkah',
    file: '/audio/adhan-makkah.mp3',
    nameEn: 'Adhan · recording 1',
    nameAr: 'أذان · تسجيل ١',
  },
  {
    id: 'adhan-madinah',
    file: '/audio/adhan-madinah.mp3',
    nameEn: 'Adhan · recording 2',
    nameAr: 'أذان · تسجيل ٢',
  },
  {
    id: 'adhan-makkah-2',
    file: '/audio/adhan-makkah-2.mp3',
    nameEn: 'Adhan · recording 3',
    nameAr: 'أذان · تسجيل ٣',
  },
  {
    id: 'chime',
    file: '/audio/chime.mp3',
    nameEn: 'Short chime (no recitation)',
    nameAr: 'نغمة قصيرة (بدون أذان)',
  },
  {
    id: 'system',
    file: null,
    nameEn: 'Device notification sound only',
    nameAr: 'صوت الإشعار في الجهاز فقط',
  },
];

export const soundById = (id: string): AthanSound =>
  ATHAN_SOUNDS.find((s) => s.id === id) ?? ATHAN_SOUNDS[0];

const clampVolume = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0.05, value)) : DEFAULT_ATHAN.volume;

/** Stored settings may predate this feature, so always merge with defaults. */
export function normalizeAthan(raw?: Partial<AthanSettings> | null): AthanSettings {
  const source = raw || {};
  return {
    ...DEFAULT_ATHAN,
    ...source,
    prayers: { ...DEFAULT_ATHAN.prayers, ...(source.prayers || {}) },
    sound: soundById(source.sound || DEFAULT_ATHAN.sound).id,
    fajrSound: soundById(source.fajrSound || DEFAULT_ATHAN.fajrSound).id,
    volume: clampVolume(Number(source.volume ?? DEFAULT_ATHAN.volume)),
    preReminderMinutes: [0, 5, 10, 15, 20, 30].includes(Number(source.preReminderMinutes))
      ? Number(source.preReminderMinutes)
      : 0,
  };
}

/* ------------------------------------------------------------------ audio */

let audioEl: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'auto';
  }
  return audioEl;
}

/**
 * Play a sound from a user gesture. This also unlocks the audio element so a
 * later scheduled Athan is not blocked by the browser's autoplay policy.
 */
export async function previewAthanSound(
  id: string,
  volume = DEFAULT_ATHAN.volume,
): Promise<{ ok: boolean; reason?: 'system_sound' | 'blocked' | 'missing' }> {
  const sound = soundById(id);
  if (!sound.file) return { ok: false, reason: 'system_sound' };
  const audio = getAudio();
  if (!audio) return { ok: false, reason: 'missing' };
  try {
    audio.pause();
    audio.src = sound.file;
    audio.volume = clampVolume(volume);
    await audio.play();
    return { ok: true };
  } catch {
    return { ok: false, reason: 'blocked' };
  }
}

export function stopAthanPreview(): void {
  try {
    audioEl?.pause();
  } catch {
    /* nothing to stop */
  }
}

async function playAthanSound(id: string, volume: number): Promise<void> {
  const sound = soundById(id);
  if (!sound.file) return;
  const audio = getAudio();
  if (!audio) return;
  try {
    audio.pause();
    audio.src = sound.file;
    audio.volume = clampVolume(volume);
    await audio.play();
  } catch {
    /* Autoplay can be blocked before the first user interaction. */
  }
}

/* ------------------------------------------------------------ permissions */

export type PermissionState = NotificationPermission | 'unsupported';

export function athanPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestAthanPermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/*
 * Notification titles, icons and tap destinations live in lib/notify.ts, so
 * every alert carries the official RIFQ Muslim name and its category.
 */

/* -------------------------------------------------------------- schedule */

export interface AthanMoment {
  prayer: AthanPrayer;
  at: Date;
  remainingMs: number;
  soundId: string;
}

export interface AthanEvent {
  kind: 'athan' | 'reminder';
  prayer: AthanPrayer;
  at: Date;
  soundId: string;
}

/** Next enabled prayer with an Athan, computed from the user's own location. */
export function nextAthan(settings: UserSettings, now = new Date()): AthanMoment | null {
  const athan = normalizeAthan(settings.athan);
  if (!settings.location) return null;
  const timeZone = locationTimeZone(settings.location);
  for (let offset = 0; offset < 4; offset += 1) {
    const day = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const times = getPrayerTimes(day, { latitude: settings.location.lat, longitude: settings.location.lon }, settings.method, settings.madhab, timeZone, settings.highLatitude)
      .times;
    for (const prayer of ATHAN_PRAYERS) {
      const at = times[prayer];
      if (!at || at.getTime() <= now.getTime()) continue;
      if (!athan.prayers[prayer]) continue;
      const soundId =
        prayer === 'fajr' && athan.fajrSpecial ? athan.fajrSound : athan.sound;
      return { prayer, at, remainingMs: at.getTime() - now.getTime(), soundId };
    }
  }
  return null;
}

const FIRED_PREFIX = 'rifq.athan.fired.';
const FIRE_WINDOW_MS = 90_000;

function dayKeyOf(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function pruneFired(keep: string): void {
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(FIRED_PREFIX) && !key.includes(keep)) stale.push(key);
    }
    for (const key of stale) localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

function alreadyFired(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markFired(key: string): void {
  try {
    localStorage.setItem(key, '1');
  } catch {
    /* storage unavailable */
  }
}

/**
 * Watch the clock and fire Athan / pre-prayer reminders.
 * Returns a cleanup function. Times are recomputed on every check, so changing
 * the location or calculation method takes effect immediately.
 */
export function startAthanScheduler(options: {
  getSettings: () => UserSettings;
  onEvent: (event: AthanEvent) => void;
}): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let stopped = false;
  let timer: number | null = null;

  const check = () => {
    const settings = options.getSettings();
    const athan = normalizeAthan(settings.athan);
    if (!athan.enabled || !settings.location) return;

    const now = new Date();
    const timeZone = locationTimeZone(settings.location);
    const times = getPrayerTimes(
      now,
      { latitude: settings.location.lat, longitude: settings.location.lon },
      settings.method,
      settings.madhab,
      timeZone,
      settings.highLatitude,
    ).times;
    const dayKey = dayKeyOf(now);

    for (const prayer of ATHAN_PRAYERS) {
      if (!athan.prayers[prayer]) continue;
      const at = times[prayer];
      if (!at) continue;
      const soundId = prayer === 'fajr' && athan.fajrSpecial ? athan.fajrSound : athan.sound;

      const elapsed = now.getTime() - at.getTime();
      if (elapsed >= 0 && elapsed <= FIRE_WINDOW_MS) {
        const key = `${FIRED_PREFIX}${dayKey}.${prayer}`;
        if (!alreadyFired(key)) {
          markFired(key);
          pruneFired(dayKey);
          void showNotification('athan', {
            title: `${prayerLabel(prayer)} · ${timeText(at)}`,
            body: 'It is time for prayer. Hayya ala-s-salah.',
            tag: `athan-${prayer}-${dayKey}`,
          });
          void playAthanSound(soundId, athan.volume);
          if (settings.vibrate && typeof navigator.vibrate === 'function') {
            navigator.vibrate([220, 120, 220]);
          }
          options.onEvent({ kind: 'athan', prayer, at, soundId });
        }
      }

      const minutes = athan.preReminderMinutes;
      if (minutes > 0) {
        const target = at.getTime() - minutes * 60_000;
        const preElapsed = now.getTime() - target;
        if (preElapsed >= 0 && preElapsed <= FIRE_WINDOW_MS) {
          const key = `${FIRED_PREFIX}${dayKey}.${prayer}.pre`;
          if (!alreadyFired(key)) {
            markFired(key);
            pruneFired(dayKey);
            void showNotification('reminder', {
              title: `${prayerLabel(prayer)} in ${minutes} min · ${timeText(at)}`,
              body: 'Prepare for prayer',
              tag: `pre-${prayer}-${dayKey}`,
            });
            if (settings.vibrate && typeof navigator.vibrate === 'function') {
              navigator.vibrate(120);
            }
            options.onEvent({ kind: 'reminder', prayer, at, soundId: 'system' });
          }
        }
      }
    }
  };

  const tick = () => {
    if (stopped) return;
    check();
    timer = window.setTimeout(tick, 20_000);
  };

  const onVisible = () => {
    if (document.visibilityState === 'visible') check();
  };

  tick();
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);

  return () => {
    stopped = true;
    if (timer) window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onVisible);
    stopAthanPreview();
  };
}

export function prayerLabel(prayer: AthanPrayer): string {
  return prayer.charAt(0).toUpperCase() + prayer.slice(1);
}

function timeText(date: Date): string {
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}

/* ------------------------------------------------------------ web push */

export async function enablePushNotifications(): Promise<{
  ok: boolean;
  reason?: 'not_configured' | 'unsupported' | 'denied' | 'error';
}> {
  if (typeof window === 'undefined') return { ok: false, reason: 'unsupported' };
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' };
  }
  try {
    const config = await api<{ pushPublicKey: string | null }>('/api/config');
    if (!config.pushPublicKey) return { ok: false, reason: 'not_configured' };
    const permission = await requestAthanPermission();
    if (permission !== 'granted') return { ok: false, reason: 'denied' };
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.pushPublicKey),
      }));
    await api('/api/push/subscribe', {
      method: 'POST',
      json: { deviceId: getDeviceId(), subscription: subscription.toJSON() },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

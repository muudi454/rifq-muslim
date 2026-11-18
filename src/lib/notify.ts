/*
 * RIFQ Muslim notification branding.
 *
 * Every notification the app raises passes through this module, so the title,
 * icon, grouping tag and tap destination are consistent and always carry the
 * official app name — never a development host, a *.dev domain or a generic
 * website title.
 *
 * Web push vs native: the notification *content* (title, body, icon, tap
 * target) is fully under our control here. The small line Android prints under
 * a web notification ("<origin> · now") and the single per-site notification
 * channel are created by Chrome for web push and cannot be renamed from the
 * page. Real per-category channels with our own names need a native build
 * (Capacitor/FCM), which maps to CATEGORY_CHANNEL below. See
 * docs/MOBILE_RELEASE.md → "Notification branding".
 */

export type NotificationCategory = 'athan' | 'quran' | 'dua' | 'reminder' | 'hadith' | 'daily';

export const APP_NOTIFICATION_NAME = 'RIFQ Muslim';

/** The category name shown after "RIFQ Muslim – ". */
export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  athan: 'Athan',
  quran: 'Quran Audio',
  dua: 'Daily Dua',
  reminder: 'Prayer Reminder',
  hadith: 'Hadith',
  daily: 'Daily Reminder',
};

/** Android notification channel used by a native (Capacitor/FCM) build. */
export const CATEGORY_CHANNEL: Record<NotificationCategory, string> = {
  athan: 'RIFQ Muslim Athan',
  quran: 'RIFQ Muslim Quran Audio',
  dua: 'RIFQ Muslim Reminders',
  reminder: 'RIFQ Muslim Reminders',
  hadith: 'RIFQ Muslim Reminders',
  daily: 'RIFQ Muslim Reminders',
};

/** Where a tap on this category should land inside the app. */
export const CATEGORY_ROUTE: Record<NotificationCategory, string> = {
  athan: '/prayer',
  quran: '/quran',
  dua: '/duas',
  reminder: '/notifications',
  hadith: '/hadith',
  daily: '/',
};

export const NOTIFICATION_ICON = '/icons/icon-192.png';
export const NOTIFICATION_BADGE = '/icons/notification-badge.png';

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'athan',
  'quran',
  'dua',
  'reminder',
  'hadith',
  'daily',
];

export interface NotificationContent {
  /** Always "RIFQ Muslim – <Category>". */
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  channel: string;
  data: { url: string; category: NotificationCategory };
}

export interface NotificationInput {
  /** Detail line, e.g. "Fajr · 05:12". Merged into the body. */
  title?: string;
  body?: string;
  /** Same-origin route to open on tap. Defaults to the category route. */
  url?: string;
  /** Stable grouping tag so repeated alerts replace instead of stack. */
  tag?: string;
}

export function categoryTitle(category: NotificationCategory): string {
  return `${APP_NOTIFICATION_NAME} – ${CATEGORY_LABEL[category]}`;
}

/** Build the exact payload shown to the user. */
export function buildNotification(
  category: NotificationCategory,
  input: NotificationInput = {},
): NotificationContent {
  const detail = [input.title, input.body].filter(Boolean).join(' · ');
  const route = input.url || CATEGORY_ROUTE[category];
  return {
    title: categoryTitle(category),
    body: detail || CATEGORY_LABEL[category],
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    tag: input.tag || `rifq-${category}`,
    channel: CATEGORY_CHANNEL[category],
    data: { url: route, category },
  };
}

/**
 * Show a branded notification through the service worker (preferred: it keeps
 * the click handler and survives the page being backgrounded).
 */
export async function showNotification(
  category: NotificationCategory,
  input: NotificationInput = {},
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  const payload = buildNotification(category, input);
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.showNotification) {
      await registration.showNotification(payload.title, {
        body: payload.body,
        tag: payload.tag,
        icon: payload.icon,
        badge: payload.badge,
        data: payload.data,
      });
      return true;
    }
    new Notification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: payload.icon,
    });
    return true;
  } catch {
    return false;
  }
}

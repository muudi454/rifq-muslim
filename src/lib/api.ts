/* Shared client helpers for the contact form, admin dashboard and device identity. */

export const CONTACT = {
  email: 'mohamoudistanbul@gmail.com',
  phone: '+252-612215593',
  phoneDial: '+252612215593',
  whatsapp: '252612215593',
  developer: 'Made by Eng Mohamud Yusuf',
} as const;

export const TEL_LINK = `tel:${CONTACT.phoneDial}`;

export function mailtoLink(subject = 'RIFQ Muslim enquiry', body = ''): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${CONTACT.email}?${params.toString()}`;
}

export function whatsappLink(message = 'As-salamu alaykum, I am contacting you about RIFQ Muslim.'): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const FALLBACK_MESSAGE: Record<number, string> = {
  400: 'Some details were not accepted. Please check the form and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to do that.',
  404: 'That item no longer exists.',
  409: 'That entry already exists.',
  429: 'Too many attempts. Please wait a moment and try again.',
  503: 'This feature is not configured on the server yet.',
};

interface ApiOptions extends Omit<RequestInit, 'body'> {
  json?: unknown;
  body?: BodyInit | null;
}

/** Fetch JSON from the app's own API, with clear errors and admin CSRF header. */
export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...rest,
      headers: {
        'x-rifq-admin': '1',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(headers || {}),
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, 'network');
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok || data?.ok === false) {
    const message =
      data?.message || FALLBACK_MESSAGE[response.status] || `Request failed (${response.status}).`;
    throw new ApiError(message, response.status, data?.error || 'request_failed');
  }
  return (data ?? {}) as T;
}

const DEVICE_KEY = 'rifq.device.id';

/** Stable anonymous device id used for activity stats and targeted notifications. */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const existing = window.localStorage.getItem(DEVICE_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,80}$/.test(existing)) return existing;
    const bytes = new Uint8Array(16);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    const id = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    window.localStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return 'anonymous-device';
  }
}

export function devicePlatform(): string {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'web';
}

export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normalized);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

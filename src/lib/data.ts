import { supabase } from './supabase';

export interface Surah {
  n: number;
  name: string;
  en: string;
  tr: string;
  type: 'Meccan' | 'Medinan';
  ayahs: [arabic: string, translation: string][];
}

export interface QuranData {
  source: { arabic: string; translation: string; retrieved: string };
  surahs: Surah[];
}

export interface Hadith {
  id: string;
  category: 'manners' | 'creed' | 'fiqh' | 'seerah';
  title: string;
  arabic: string;
  text: string;
  attribution: string;
  grade: string;
  reference: string;
  explanation: string;
}

export interface HadithData {
  source: { name: string; note: string; retrieved: string };
  hadiths: Hadith[];
}

let quranPromise: Promise<QuranData> | null = null;
let hadithPromise: Promise<HadithData> | null = null;

async function fetchJson<T>(path: string): Promise<T> {
  try {
    const res = await fetch(path, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    // Offline fallback: read from the service-worker cache.
    if (typeof caches !== 'undefined') {
      const cached = await caches.match(path);
      if (cached) return (await cached.json()) as T;
    }
    throw err;
  }
}

export function loadQuran(): Promise<QuranData> {
  if (!quranPromise) {
    quranPromise = fetchJson<QuranData>('/data/quran.json').catch((err) => {
      quranPromise = null;
      throw err;
    });
  }
  return quranPromise;
}

export function loadHadith(): Promise<HadithData> {
  if (!hadithPromise) {
    hadithPromise = fetchJson<HadithData>('/data/hadith.json').catch((err) => {
      hadithPromise = null;
      throw err;
    });
  }
  return hadithPromise;
}

/** Deterministic "daily" picks so the same content shows all day. */
export function dayIndex(date: Date, length: number): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return (dayOfYear + date.getFullYear() * 7) % Math.max(1, length);
}

export const RECITER = {
  id: 'Alafasy_128kbps',
  nameEn: 'Mishary Rashid Alafasy',
  nameAr: 'مشاري راشد العفاسي',
  /** Free, key-less audio host used by many open Quran projects. */
  url: (surah: number, ayah: number) =>
    `https://everyayah.com/data/${RECITER.id}/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
};

export type BookmarkType = 'ayah' | 'dua' | 'hadith';

export interface Bookmark {
  id: string;
  type: BookmarkType;
  ref: string;
  title: string;
  text: string;
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  arabicSize: number;
  showTranslation: boolean;
  method: string;
  madhab: 'shafii' | 'hanafi';
  location: { lat: number; lon: number; label: string } | null;
  vibrate: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  arabicSize: 28,
  showTranslation: true,
  method: 'MWL',
  madhab: 'shafii',
  // A sensible starting point so prayer times are visible before the user
  // shares their own location; "Use my location" replaces it.
  location: { lat: 21.4225, lon: 39.8262, label: 'Makkah' },
  vibrate: true,
};

export interface TasbihSession {
  id: string;
  dhikr: string;
  count: number;
  target: number;
  createdAt: string;
}

/* ----------------------------- cloud helpers ---------------------------- */

export async function fetchCloudBookmarks(userId: string): Promise<Bookmark[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id, type, ref, title, text, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    type: r.type as BookmarkType,
    ref: r.ref as string,
    title: r.title as string,
    text: r.text as string,
    createdAt: r.created_at as string,
  }));
}

export async function saveCloudBookmark(userId: string, b: Bookmark): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('bookmarks').upsert(
    {
      id: b.id,
      user_id: userId,
      type: b.type,
      ref: b.ref,
      title: b.title,
      text: b.text,
      created_at: b.createdAt,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function deleteCloudBookmark(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('bookmarks').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchCloudSettings(userId: string): Promise<UserSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.settings as UserSettings) ?? null;
}

export async function saveCloudSettings(userId: string, settings: UserSettings): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function saveCloudTasbih(userId: string, s: TasbihSession): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('tasbih_sessions').upsert(
    {
      id: s.id,
      user_id: userId,
      dhikr: s.dhikr,
      count: s.count,
      target: s.target,
      created_at: s.createdAt,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

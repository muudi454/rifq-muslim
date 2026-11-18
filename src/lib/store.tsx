import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  deleteCloudBookmark,
  fetchCloudBookmarks,
  fetchCloudSettings,
  saveCloudBookmark,
  saveCloudSettings,
  saveCloudTasbih,
  type Bookmark,
  type TasbihSession,
  type UserSettings,
} from './data';
import { supabase } from './supabase';
import { useAuth } from './auth';

interface StoreValue {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  bookmarks: Bookmark[];
  toggleBookmark: (b: Omit<Bookmark, 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  sessions: TasbihSession[];
  addSession: (s: Omit<TasbihSession, 'id' | 'createdAt'>) => void;
  toast: (message: string) => void;
  syncState: 'local' | 'syncing' | 'synced' | 'error';
}

const StoreContext = createContext<StoreValue | null>(null);

const keyFor = (kind: string, userId: string | null) => `rifq.${kind}.${userId ?? 'guest'}`;

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, cloud } = useAuth();
  const userId = user?.id ?? null;
  const [settings, setSettings] = useState<UserSettings>(() =>
    mergeSettings(readLocal(keyFor('settings', null), DEFAULT_SETTINGS)),
  );
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => readLocal(keyFor('bookmarks', null), []));
  const [sessions, setSessions] = useState<TasbihSession[]>(() =>
    readLocal(keyFor('sessions', null), []),
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<'local' | 'syncing' | 'synced' | 'error'>('local');
  const toastTimer = useRef<number | null>(null);

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2600);
  }, []);

  /* ---------------------- load state when user changes -------------------- */

  useEffect(() => {
    const localSettings = readLocal(keyFor('settings', userId), DEFAULT_SETTINGS);
    const localBookmarks = readLocal(keyFor('bookmarks', userId), [] as Bookmark[]);
    const localSessions = readLocal(keyFor('sessions', userId), [] as TasbihSession[]);
    setSettings(mergeSettings(localSettings));
    setBookmarks(localBookmarks);
    setSessions(localSessions);

    if (!cloud || !userId || !supabase) {
      setSyncState('local');
      return;
    }

    let cancelled = false;
    setSyncState('syncing');
    (async () => {
      try {
        const [cloudBookmarks, cloudSettings] = await Promise.all([
          fetchCloudBookmarks(userId),
          fetchCloudSettings(userId),
        ]);
        if (cancelled) return;

        // Merge: cloud rows win, local-only rows are pushed up.
        const merged = new Map<string, Bookmark>();
        for (const b of localBookmarks) merged.set(b.id, b);
        for (const b of cloudBookmarks) merged.set(b.id, b);
        const localOnly = localBookmarks.filter(
          (b) => !cloudBookmarks.some((c) => c.id === b.id),
        );
        for (const b of localOnly) {
          await saveCloudBookmark(userId, b).catch(() => undefined);
        }
        const list = Array.from(merged.values()).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        );
        setBookmarks(list);
        writeLocal(keyFor('bookmarks', userId), list);

        if (cloudSettings) {
          const next = mergeSettings(cloudSettings as Partial<UserSettings>);
          setSettings(next);
          writeLocal(keyFor('settings', userId), next);
        } else {
          await saveCloudSettings(userId, localSettings).catch(() => undefined);
        }
        setSyncState('synced');
      } catch {
        if (!cancelled) setSyncState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, cloud]);

  /* -------------------------- theme + font effects ------------------------ */

  useEffect(() => {
    const apply = () => {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const resolved = settings.theme === 'system' ? (prefersDark ? 'dark' : 'light') : settings.theme;
      document.documentElement.dataset.theme = resolved;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', resolved === 'dark' ? '#07150f' : '#065f46');
    };
    apply();
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (settings.theme === 'system' && mq) {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
    return undefined;
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--arabic-size', `${settings.arabicSize}px`);
  }, [settings.arabicSize]);

  /* -------------------------------- actions ------------------------------- */

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        writeLocal(keyFor('settings', userId), next);
        if (cloud && userId) {
          saveCloudSettings(userId, next).catch(() => setSyncState('error'));
        }
        return next;
      });
    },
    [cloud, userId],
  );

  const toggleBookmark = useCallback(
    (entry: Omit<Bookmark, 'createdAt'>) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.id === entry.id);
        let next: Bookmark[];
        if (exists) {
          next = prev.filter((b) => b.id !== entry.id);
          if (cloud && supabase) deleteCloudBookmark(entry.id).catch(() => setSyncState('error'));
        } else {
          const created: Bookmark = { ...entry, createdAt: new Date().toISOString() };
          next = [created, ...prev];
          if (cloud && userId && supabase) {
            saveCloudBookmark(userId, created).catch(() => setSyncState('error'));
          }
        }
        writeLocal(keyFor('bookmarks', userId), next);
        return next;
      });
    },
    [cloud, userId],
  );

  const removeBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => {
        const next = prev.filter((b) => b.id !== id);
        writeLocal(keyFor('bookmarks', userId), next);
        if (cloud && supabase) deleteCloudBookmark(id).catch(() => setSyncState('error'));
        return next;
      });
    },
    [cloud, userId],
  );

  const isBookmarked = useCallback((id: string) => bookmarks.some((b) => b.id === id), [bookmarks]);

  const addSession = useCallback(
    (s: Omit<TasbihSession, 'id' | 'createdAt'>) => {
      const record: TasbihSession = {
        ...s,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => {
        const next = [record, ...prev].slice(0, 60);
        writeLocal(keyFor('sessions', userId), next);
        return next;
      });
      if (cloud && userId && supabase) {
        saveCloudTasbih(userId, record).catch(() => setSyncState('error'));
      }
    },
    [cloud, userId],
  );

  const value = useMemo<StoreValue>(
    () => ({
      settings,
      updateSettings,
      bookmarks,
      toggleBookmark,
      removeBookmark,
      isBookmarked,
      sessions,
      addSession,
      toast,
      syncState,
    }),
    [
      settings,
      updateSettings,
      bookmarks,
      toggleBookmark,
      removeBookmark,
      isBookmarked,
      sessions,
      addSession,
      toast,
      syncState,
    ],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          <span aria-hidden="true">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

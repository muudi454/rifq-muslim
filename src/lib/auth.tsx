import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase, isCloudConfigured } from './supabase';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  city: string;
  country: string;
  createdAt: string;
}

interface AuthValue {
  user: AppUser | null;
  loading: boolean;
  cloud: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (patch: Partial<Pick<AppUser, 'name' | 'city' | 'country'>>) => Promise<void>;
  deleteMyData: () => Promise<void>;
  mapError: (err: unknown) => string;
}

const AuthContext = createContext<AuthValue | null>(null);

const USERS_KEY = 'rifq.local.users';
const SESSION_KEY = 'rifq.local.session';

/* ------------------------- on-device password hashing -------------------- */

const enc = new TextEncoder();

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const hexToBytes = (hex: string): Uint8Array => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
};

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex) as unknown as BufferSource, iterations: 210000, hash: 'SHA-256' },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function randomSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bytesToHex(salt);
}

interface LocalRecord {
  id: string;
  email: string;
  name: string;
  city: string;
  country: string;
  salt: string;
  hash: string;
  createdAt: string;
}

function readUsers(): LocalRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalRecord[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: LocalRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toAppUser(rec: LocalRecord): AppUser {
  return {
    id: rec.id,
    email: rec.email,
    name: rec.name,
    city: rec.city,
    country: rec.country,
    createdAt: rec.createdAt,
  };
}

/* --------------------------------- context ------------------------------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const cloud = isCloudConfigured;

  const loadCloudProfile = useCallback(async (id: string, email: string, fallbackName: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, city, country, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') {
      // Profile table may not exist yet; still allow a session.
      console.warn('profile fetch failed', error.message);
    }
    if (!data) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id,
        full_name: fallbackName,
        city: '',
        country: '',
      });
      if (insertError) console.warn('profile create failed', insertError.message);
      return {
        id,
        email,
        name: fallbackName,
        city: '',
        country: '',
        createdAt: new Date().toISOString(),
      } satisfies AppUser;
    }
    return {
      id,
      email,
      name: (data.full_name as string) || fallbackName,
      city: (data.city as string) || '',
      country: (data.country as string) || '',
      createdAt: (data.created_at as string) || new Date().toISOString(),
    } satisfies AppUser;
  }, []);

  /* ------------------------------ bootstrap ------------------------------ */

  useEffect(() => {
    let cancelled = false;

    if (!cloud) {
      const users = readUsers();
      const sessionId = localStorage.getItem(SESSION_KEY);
      const rec = users.find((u) => u.id === sessionId);
      if (rec && !cancelled) setUser(toAppUser(rec));
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    supabase!.auth
      .getSession()
      .then(async ({ data }) => {
        const s = data.session;
        if (!s?.user) {
          if (!cancelled) setUser(null);
          return;
        }
        const name =
          (s.user.user_metadata?.full_name as string) || s.user.email?.split('@')[0] || 'Friend';
        const profile = await loadCloudProfile(s.user.id, s.user.email ?? '', name);
        if (!cancelled) setUser(profile);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const { data: sub } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const name =
        (session.user.user_metadata?.full_name as string) ||
        session.user.email?.split('@')[0] ||
        'Friend';
      const profile = await loadCloudProfile(session.user.id, session.user.email ?? '', name);
      setUser(profile);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [cloud, loadCloudProfile]);

  /* -------------------------------- actions ------------------------------ */

  const signUp = useCallback<AuthValue['signUp']>(
    async (email, password, name) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cloud) {
        const users = readUsers();
        if (users.some((u) => u.email === cleanEmail)) throw new Error('USER_EXISTS');
        const salt = randomSalt();
        const hash = await hashPassword(password, salt);
        const rec: LocalRecord = {
          id: crypto.randomUUID(),
          email: cleanEmail,
          name: name.trim() || cleanEmail.split('@')[0],
          city: '',
          country: '',
          salt,
          hash,
          createdAt: new Date().toISOString(),
        };
        writeUsers([...users, rec]);
        localStorage.setItem(SESSION_KEY, rec.id);
        setUser(toAppUser(rec));
        return { needsConfirmation: false };
      }
      const { data, error } = await supabase!.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
      return { needsConfirmation: !data.session };
    },
    [cloud],
  );

  const signIn = useCallback<AuthValue['signIn']>(
    async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cloud) {
        const rec = readUsers().find((u) => u.email === cleanEmail);
        if (!rec) throw new Error('INVALID_CREDENTIALS');
        const hash = await hashPassword(password, rec.salt);
        if (hash !== rec.hash) throw new Error('INVALID_CREDENTIALS');
        localStorage.setItem(SESSION_KEY, rec.id);
        setUser(toAppUser(rec));
        return;
      }
      const { error } = await supabase!.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;
    },
    [cloud],
  );

  const signOut = useCallback(async () => {
    if (!cloud) {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      return;
    }
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, [cloud]);

  const requestReset = useCallback<AuthValue['requestReset']>(
    async (email) => {
      if (!cloud) throw new Error('LOCAL_RESET');
      const { error } = await supabase!.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    [cloud],
  );

  const updatePassword = useCallback<AuthValue['updatePassword']>(
    async (password) => {
      if (!cloud) throw new Error('LOCAL_PASSWORD');
      const { error } = await supabase!.auth.updateUser({ password });
      if (error) throw error;
    },
    [cloud],
  );

  const updateProfile = useCallback<AuthValue['updateProfile']>(
    async (patch) => {
      if (!user) throw new Error('NOT_SIGNED_IN');
      const next = { ...user, ...patch };
      if (!cloud) {
        const users = readUsers().map((u) =>
          u.id === user.id ? { ...u, name: next.name, city: next.city, country: next.country } : u,
        );
        writeUsers(users);
        setUser(next);
        return;
      }
      const { error } = await supabase!
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: next.name,
            city: next.city,
            country: next.country,
          },
          { onConflict: 'id' },
        );
      if (error) throw error;
      await supabase!.auth.updateUser({ data: { full_name: next.name } });
      setUser(next);
    },
    [cloud, user],
  );

  const deleteMyData = useCallback(async () => {
    if (!user) throw new Error('NOT_SIGNED_IN');
    if (cloud) {
      const tables = ['bookmarks', 'tasbih_sessions', 'user_settings', 'profiles'];
      for (const table of tables) {
        const { error } = await supabase!.from(table).delete().eq('user_id', user.id);
        if (error && table !== 'profiles') throw error;
        if (error && table === 'profiles') {
          const { error: e2 } = await supabase!.from('profiles').delete().eq('id', user.id);
          if (e2) throw e2;
        }
      }
      await supabase!.auth.signOut();
      setUser(null);
      return;
    }
    writeUsers(readUsers().filter((u) => u.id !== user.id));
    localStorage.removeItem(SESSION_KEY);
    ['bookmarks', 'settings', 'sessions'].forEach((k) =>
      localStorage.removeItem(`rifq.${k}.${user.id}`),
    );
    setUser(null);
  }, [cloud, user]);

  const mapError = useCallback((err: unknown): string => {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
          ? err
          : 'errors.generic';
    switch (message) {
      case 'USER_EXISTS':
        return 'errors.exists';
      case 'INVALID_CREDENTIALS':
        return 'errors.credentials';
      case 'LOCAL_RESET':
        return 'auth.localResetUnavailable';
      case 'LOCAL_PASSWORD':
        return 'auth.localPasswordUnavailable';
      case 'NOT_SIGNED_IN':
        return 'errors.generic';
      default:
        break;
    }
    const m = message.toLowerCase();
    if (m.includes('invalid login') || m.includes('invalid credentials')) return 'errors.credentials';
    if (m.includes('already registered') || m.includes('already exists')) return 'errors.exists';
    if (m.includes('at least') && m.includes('character')) return 'errors.shortPassword';
    if (m.includes('rate limit') || m.includes('too many')) return 'errors.rate';
    if (m.includes('email not confirmed')) return 'auth.confirmEmail';
    if (m.includes('failed to fetch') || m.includes('network')) return 'errors.offline';
    if (m.includes('user not found')) return 'errors.notFound';
    if (m.includes('invalid') && m.includes('email')) return 'errors.invalidEmail';
    return 'errors.generic';
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      cloud,
      signUp,
      signIn,
      signOut,
      requestReset,
      updatePassword,
      updateProfile,
      deleteMyData,
      mapError,
    }),
    [user, loading, cloud, signUp, signIn, signOut, requestReset, updatePassword, updateProfile, deleteMyData, mapError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

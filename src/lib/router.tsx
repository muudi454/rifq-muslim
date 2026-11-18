import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface RouterValue {
  path: string;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
  /** Returns to the previous in-app screen, or Home when this is the first screen. */
  back: () => void;
}

const RouterContext = createContext<RouterValue | null>(null);

function currentPath(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname + window.location.search;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState<string>(currentPath);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    if (to === currentPath()) return;
    const state = { rifq: true };
    if (opts?.replace) window.history.replaceState(state, '', to);
    else window.history.pushState(state, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  // In-app back: only unwinds history the app itself created. A screen opened
  // directly (deep link, PWA relaunch) falls back to Home instead of leaving the app.
  const back = useCallback(() => {
    const state = window.history.state as { rifq?: boolean } | null;
    if (state?.rifq) window.history.back();
    else navigate('/');
  }, [navigate]);

  const value = useMemo(() => ({ path, navigate, back }), [path, navigate, back]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider');
  return ctx;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Matches "/quran/:n" style patterns. */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';
  const p = pattern.split('/').filter(Boolean);
  const c = cleanPath.split('/').filter(Boolean);
  if (p.length !== c.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(c[i]);
    else if (p[i] !== c[i]) return null;
  }
  return params;
}

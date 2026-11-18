import { useEffect, useState } from 'react';

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferred: PromptEvent | null = null;
const listeners = new Set<(available: boolean) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as PromptEvent;
    listeners.forEach((l) => l(true));
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l(false));
  });
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function useInstall() {
  const [available, setAvailable] = useState<boolean>(Boolean(deferred));
  const [installed, setInstalled] = useState<boolean>(isStandalone());

  useEffect(() => {
    const listener = (value: boolean) => {
      setAvailable(value);
      if (!value) setInstalled(isStandalone());
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferred) return 'unavailable';
    await deferred.prompt();
    const choice = await deferred.userChoice;
    deferred = null;
    setAvailable(false);
    if (choice.outcome === 'accepted') setInstalled(true);
    return choice.outcome;
  };

  return { available, installed, promptInstall, ios: isIos() };
}

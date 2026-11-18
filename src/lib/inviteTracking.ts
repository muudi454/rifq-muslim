/*
 * Invitation link counting — opt-in only.
 *
 * Nothing leaves the device unless the user turns this on in Invite friends.
 * When it is on, the app sends one anonymous counter increment to our own API:
 * a share, or an invitation link that was opened. No names, contacts, message
 * contents, device identifiers or IP addresses are stored.
 */
export type ShareChannel = 'whatsapp' | 'telegram' | 'facebook' | 'sms' | 'native' | 'copy';

const CONSENT_KEY = 'rifq.invite.consent';
const STATS_KEY = 'rifq.invite.stats';
const OPEN_KEY = 'rifq.invite.openCounted';

export interface InviteStats {
  shares: number;
  opens: number;
}

export function inviteConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setInviteConsent(next: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, next ? '1' : '0');
  } catch {
    /* private mode — consent simply stays off */
  }
}

export function inviteStats(): InviteStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { shares: 0, opens: 0 };
    const parsed = JSON.parse(raw) as Partial<InviteStats>;
    return { shares: Number(parsed.shares) || 0, opens: Number(parsed.opens) || 0 };
  } catch {
    return { shares: 0, opens: 0 };
  }
}

function bump(field: keyof InviteStats): void {
  const next = inviteStats();
  next[field] += 1;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

function post(kind: 'share' | 'open', channel?: string): void {
  if (!inviteConsent()) return;
  try {
    void fetch('/api/invite/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, channel: channel || 'link' }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* offline: the local counter still works */
  }
}

export function recordShare(channel: ShareChannel): void {
  bump('shares');
  post('share', channel);
}

/** Add the invitation marker so opens can be counted (with consent). */
export function shareUrlWithRef(url: string): string {
  try {
    const next = new URL(url);
    next.searchParams.set('ref', 'invite');
    return next.toString();
  } catch {
    return url;
  }
}

/** Count this visit if it came from an invitation link. Once per session. */
export function trackInviteOpen(): void {
  try {
    if (sessionStorage.getItem(OPEN_KEY) === '1') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref') !== 'invite') return;
    sessionStorage.setItem(OPEN_KEY, '1');
    bump('opens');
    post('open');
  } catch {
    /* storage unavailable */
  }
}

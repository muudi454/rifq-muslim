/*
 * Invite Friends.
 *
 * Every channel opens the platform's own share target (WhatsApp, Telegram,
 * Facebook, SMS) or the browser's Web Share sheet. The invitation URL is stored
 * locally so it can be switched to the Google Play listing later without a code
 * change — until then it points at the live app, which installs from the
 * browser. No store link is ever invented.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as QRCode from 'qrcode';
import { useI18n } from '../lib/i18n';

const STORAGE_KEY = 'rifq.invite.url';

const MESSAGES = {
  en: 'Join RIFQ Muslim – Your Faith, Your Daily Companion.',
  ar: 'انضم إلى رِفْق مسلم – رفيقك اليومي في عبادتك.',
};

function liveAppUrl(): string {
  if (typeof window === 'undefined') return 'https://ovd6yt3g8d.dev.ap-jt.com/';
  return `${window.location.origin}/`;
}

function readStoredUrl(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && /^https?:\/\//i.test(stored)) return stored;
  } catch {
    /* private mode — fall through to the live URL */
  }
  return liveAppUrl();
}

export default function InvitePage() {
  const { t, lang } = useI18n();
  const [inviteUrl, setInviteUrl] = useState<string>(readStoredUrl);
  const [draft, setDraft] = useState<string>(readStoredUrl);
  const [qr, setQr] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [canShare, setCanShare] = useState(false);
  const [editing, setEditing] = useState(false);

  const message = MESSAGES[lang] ?? MESSAGES.en;
  const shareText = `${message} ${inviteUrl}`;

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  // Real QR of whatever URL is currently selected — regenerated when it changes.
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(inviteUrl, {
      width: 640,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#065f46ff', light: '#ffffffff' },
    })
      .then((dataUrl) => {
        if (alive) setQr(dataUrl);
      })
      .catch(() => {
        if (alive) setQr('');
      });
    return () => {
      alive = false;
    };
  }, [inviteUrl]);

  const openExternal = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setStatus(t('invite.copied'));
    } catch {
      setStatus(t('invite.copyFailed'));
    }
  }, [inviteUrl, t]);

  const nativeShare = useCallback(async () => {
    if (!canShare) {
      setStatus(t('invite.shareUnavailable'));
      return;
    }
    try {
      await navigator.share({ title: 'RIFQ Muslim', text: message, url: inviteUrl });
    } catch {
      /* the user dismissed the sheet — nothing to report */
    }
  }, [canShare, inviteUrl, message, t]);

  const saveUrl = useCallback(() => {
    const next = draft.trim();
    if (!/^https:\/\/.+/i.test(next)) {
      setStatus(t('invite.invalid'));
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the link still applies for this session */
    }
    setInviteUrl(next);
    setEditing(false);
    setStatus(t('invite.saved'));
  }, [draft, t]);

  const resetUrl = useCallback(() => {
    const live = liveAppUrl();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setInviteUrl(live);
    setDraft(live);
    setEditing(false);
    setStatus(t('invite.saved'));
  }, [t]);

  const channels = useMemo(
    () => [
      {
        id: 'whatsapp',
        label: t('invite.whatsapp'),
        href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        tone: 'whatsapp',
      },
      {
        id: 'telegram',
        label: t('invite.telegram'),
        href: `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(message)}`,
        tone: 'telegram',
      },
      {
        id: 'facebook',
        label: t('invite.facebook'),
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}`,
        tone: 'facebook',
      },
      {
        id: 'sms',
        label: t('invite.sms'),
        href: `sms:?&body=${encodeURIComponent(shareText)}`,
        tone: 'sms',
      },
    ],
    [inviteUrl, message, shareText, t],
  );

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('invite.title')}</h1>
          <p className="page-sub">{t('invite.sub')}</p>
        </div>
      </header>

      <section className="card">
        <p className="row-sub" data-testid="invite-message">
          {message}
        </p>

        <label className="field" style={{ marginTop: 12 }}>
          <span>{t('invite.linkLabel')}</span>
          <input
            className="input"
            data-testid="invite-link"
            readOnly
            value={inviteUrl}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button className="btn btn-primary" data-testid="invite-copy" onClick={copyLink}>
            {t('invite.copy')}
          </button>
          <button className="btn btn-ghost" data-testid="invite-share" onClick={nativeShare}>
            {t('invite.share')}
          </button>
        </div>

        {status && (
          <p className="small" data-testid="invite-status" role="status" style={{ marginTop: 10 }}>
            {status}
          </p>
        )}

        <p className="row-sub" style={{ marginTop: 12 }}>
          {t('invite.noStore')}
        </p>
      </section>

      <section className="card">
        <h2 className="section-title">{t('invite.qr')}</h2>
        {qr ? (
          <img
            src={qr}
            alt={t('invite.qr')}
            data-testid="invite-qr"
            width={220}
            height={220}
            style={{
              display: 'block',
              width: 220,
              height: 220,
              margin: '0 auto',
              borderRadius: 16,
              background: '#fff',
              padding: 8,
            }}
          />
        ) : (
          <p className="row-sub">{t('invite.qrHint')}</p>
        )}
        <p className="row-sub" style={{ marginTop: 10, textAlign: 'center' }}>
          {t('invite.qrHint')}
        </p>
      </section>

      <section className="card">
        <h2 className="section-title">{t('invite.title')}</h2>
        <div className="invite-channels">
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              className={`btn btn-ghost invite-channel invite-${channel.tone}`}
              data-testid={`invite-${channel.id}`}
              onClick={() => openExternal(channel.href)}
            >
              {channel.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">{t('invite.configure')}</h2>
        {editing ? (
          <>
            <label className="field">
              <span>{t('invite.linkLabel')}</span>
              <input
                className="input"
                data-testid="invite-url-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" data-testid="invite-save" onClick={saveUrl}>
                {t('invite.save')}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>
                {t('settings.cancel')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="row-sub">{t('invite.configureHint')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-ghost"
                data-testid="invite-edit-url"
                onClick={() => {
                  setDraft(inviteUrl);
                  setEditing(true);
                }}
              >
                {t('invite.configure')}
              </button>
              <button className="btn btn-ghost" data-testid="invite-reset" onClick={resetUrl}>
                {t('invite.reset')}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => openExternal(inviteUrl)}
                data-testid="invite-open"
              >
                {t('invite.openLink')}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

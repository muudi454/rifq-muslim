import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { useRouter, Link } from '../lib/router';
import { IconEye, IconEyeOff, IconLock, IconMail, IconUser } from '../components/Icons';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AuthPage({
  mode: initialMode = 'signin',
  onGuest,
}: {
  mode?: Mode;
  onGuest?: () => void;
}) {
  const { t } = useI18n();
  const { cloud, signIn, signUp, requestReset, updatePassword, mapError } = useAuth();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    setNotice(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('errors.invalidEmail'));
      return;
    }
    if (mode === 'signup' || mode === 'reset') {
      if (password.length < 8) {
        setError(t('errors.shortPassword'));
        return;
      }
      if (mode === 'signup' && password !== confirm) {
        setError(t('errors.mismatch'));
        return;
      }
    }
    if (mode === 'signin' && !password) {
      setError(t('errors.credentials'));
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const { needsConfirmation } = await signUp(email, password, name);
        if (needsConfirmation) {
          setNotice(t('auth.confirmEmail'));
        } else {
          navigate('/');
        }
      } else if (mode === 'signin') {
        await signIn(email, password);
        navigate('/');
      } else if (mode === 'forgot') {
        await requestReset(email);
        setNotice(t('auth.resetSent'));
      } else if (mode === 'reset') {
        await updatePassword(password);
        setNotice(t('auth.passwordUpdated'));
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (err) {
      setError(t(mapError(err)));
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === 'signup'
      ? t('auth.createTitle')
      : mode === 'forgot'
        ? t('auth.resetTitle')
        : mode === 'reset'
          ? t('auth.newPassword')
          : t('auth.signIn');

  return (
    <div className="auth-wrap">
      <div className="auth-brand">
        <span className="brand-mark" aria-hidden="true">
          ☾
        </span>
        <h1 className="brand-name">{t('app.name')}</h1>
        <p className="brand-sub arabic" dir="rtl">
          رِفْق مسلم
        </p>
        <p className="small muted">{t('app.tagline')}</p>
      </div>

      <form className="card auth-card" onSubmit={submit} noValidate>
        <h2 className="section-title">{title}</h2>

        {mode === 'signup' && (
          <label className="field">
            <span>{t('auth.fullName')}</span>
            <span className="input-group">
              <IconUser size={18} />
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </span>
          </label>
        )}

        <label className="field">
          <span>{t('auth.email')}</span>
          <span className="input-group">
            <IconMail size={18} />
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              required
            />
          </span>
        </label>

        {mode !== 'forgot' && (
          <label className="field">
            <span>{mode === 'reset' ? t('auth.newPassword') : t('auth.password')}</span>
            <span className="input-group">
              <IconLock size={18} />
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={mode === 'signin' ? undefined : 8}
                required
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('common.close') : t('auth.password')}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </span>
          </label>
        )}

        {(mode === 'signup' || mode === 'reset') && (
          <label className="field">
            <span>{t('auth.confirmPassword')}</span>
            <span className="input-group">
              <IconLock size={18} />
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </span>
          </label>
        )}

        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="alert alert-ok" role="status">
            {notice}
          </p>
        )}

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy
            ? t('common.loading')
            : mode === 'signup'
              ? t('auth.signUp')
              : mode === 'forgot'
                ? t('auth.sendReset')
                : mode === 'reset'
                  ? t('auth.updatePassword')
                  : t('auth.signIn')}
        </button>

        <div className="auth-links">
          {mode === 'signin' && (
            <>
              <button type="button" className="link-btn" onClick={() => { setMode('signup'); reset(); }}>
                {t('auth.noAccount')}
              </button>
              <button type="button" className="link-btn" onClick={() => { setMode('forgot'); reset(); }}>
                {t('auth.forgot')}
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button type="button" className="link-btn" onClick={() => { setMode('signin'); reset(); }}>
              {t('auth.haveAccount')}
            </button>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <button type="button" className="link-btn" onClick={() => { setMode('signin'); reset(); }}>
              {t('auth.signIn')}
            </button>
          )}
        </div>

        <p className="help">
          {cloud ? t('auth.cloudModeHelp') : t('auth.localModeHelp')}
        </p>
        {mode === 'forgot' && !cloud && <p className="help">{t('auth.localResetUnavailable')}</p>}
      </form>

      {onGuest && (
        <button className="btn btn-ghost btn-block" onClick={onGuest}>
          {t('auth.guest')}
        </button>
      )}

      <p className="footer-note">
        <Link to="/">{t('nav.home')}</Link>
      </p>
    </div>
  );
}

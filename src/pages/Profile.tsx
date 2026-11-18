import { useState } from 'react';
import { Link, useRouter } from '../lib/router';
import { useI18n } from '../lib/i18n';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { IconLock, IconUser } from '../components/Icons';

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, cloud, signOut, updateProfile, updatePassword, deleteMyData, mapError } = useAuth();
  const { toast, syncState, bookmarks, sessions } = useStore();
  const { navigate } = useRouter();

  const [name, setName] = useState(user?.name ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <h1 className="page-title">{t('auth.profile')}</h1>
            <p className="page-sub">{t('auth.guest')}</p>
          </div>
        </header>
        <section className="card">
          <p className="row-sub">{t('auth.localModeHelp')}</p>
          <div className="row">
            <Link to="/auth/signin" className="btn btn-primary">
              {t('auth.signIn')}
            </Link>
            <Link to="/auth/signup" className="btn btn-ghost">
              {t('auth.signUp')}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const saveProfile = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateProfile({ name: name.trim(), city: city.trim(), country: country.trim() });
      toast(t('settings.profileSaved'));
    } catch (err) {
      setError(mapError(err));
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    if (password.length < 6) {
      setError(t('errors.shortPassword'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updatePassword(password);
      setPassword('');
      toast(t('auth.passwordUpdated'));
    } catch (err) {
      setError(err instanceof Error && err.message === 'LOCAL_PASSWORD' ? t('auth.localPasswordUnavailable') : mapError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{t('auth.profile')}</h1>
          <p className="page-sub">{user.email}</p>
        </div>
        <span className="avatar-btn" aria-hidden="true">
          <span className="avatar-initial">{(user.name || user.email)[0].toUpperCase()}</span>
        </span>
      </header>

      <section className="card">
        <p className="row-sub">
          <span className={`badge ${cloud ? 'badge-gold' : ''}`}>
            {cloud ? t('auth.cloudMode') : t('auth.localMode')}
          </span>{' '}
          {syncState === 'synced'
            ? t('common.saved')
            : syncState === 'syncing'
              ? t('common.loading')
              : syncState === 'error'
                ? t('common.offline')
                : t('settings.offline')}
        </p>
        <p className="row-sub">
          {bookmarks.length} {t('nav.bookmarks')} · {sessions.length} {t('tasbih.history')}
        </p>
      </section>

      {error && <p className="alert alert-error">{error}</p>}

      <section className="card">
        <h2 className="section-title">
          <IconUser size={16} /> {t('auth.profile')}
        </h2>
        <label className="field">
          <span>{t('auth.fullName')}</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>{t('settings.city')}</span>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="field">
          <span>{t('settings.country')}</span>
          <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>
        <button className="btn btn-primary" onClick={saveProfile} disabled={busy}>
          {t('common.save')}
        </button>
      </section>

      <section className="card">
        <h2 className="section-title">
          <IconLock size={16} /> {t('settings.changePassword')}
        </h2>
        <label className="field">
          <span>{t('auth.newPassword')}</span>
          <input
            className="input"
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn-primary" onClick={changePassword} disabled={busy || !password}>
          {t('auth.updatePassword')}
        </button>
        {!cloud && <p className="help">{t('auth.localPasswordUnavailable')}</p>}
      </section>

      <section className="card">
        <h2 className="section-title">{t('settings.account')}</h2>
        <div className="row">
          <button
            className="btn btn-ghost"
            onClick={async () => {
              await signOut();
              toast(t('auth.signOut'));
              navigate('/');
            }}
          >
            {t('auth.signOut')}
          </button>
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!window.confirm(t('settings.deleteWarning'))) return;
              setBusy(true);
              try {
                await deleteMyData();
                toast(t('common.delete'));
                navigate('/');
              } catch (err) {
                setError(mapError(err));
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
          >
            {t('settings.deleteAccount')}
          </button>
        </div>
      </section>
    </div>
  );
}

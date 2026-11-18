import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError, CONTACT } from '../lib/api';

/* --------------------------------------------------------------- types */

interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'support';
  roleLabel?: string;
  permissions?: string[];
  createdAt?: string;
}

interface DeviceRow {
  id: string;
  firstSeen?: string;
  lastSeen?: string;
  platform?: string;
  lang?: string;
  appVersion?: string;
  locationLabel?: string;
  timezone?: string;
  blocked?: boolean;
  sessions?: number;
}

interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  replyDelivered?: boolean;
  emailDelivered?: boolean;
}

interface ContentRow {
  id: string;
  kind: 'ayah' | 'dua' | 'hadith' | 'adhkar';
  title: string;
  arabic?: string;
  text: string;
  reference?: string;
  language?: string;
  active: boolean;
  createdAt?: string;
  createdBy?: string;
}

interface AuditRow {
  id?: string;
  action?: string;
  detail?: string;
  at?: string;
  by?: string;
  admin?: string;
  ip?: string;
}

type Tab = 'overview' | 'users' | 'messages' | 'content' | 'notifications' | 'team' | 'audit' | 'settings';

const TABS: { id: Tab; label: string; permission: string }[] = [
  { id: 'overview', label: 'Overview', permission: 'overview' },
  { id: 'users', label: 'Users', permission: 'users' },
  { id: 'messages', label: 'Messages', permission: 'messages' },
  { id: 'content', label: 'Content', permission: 'content' },
  { id: 'notifications', label: 'Notifications', permission: 'notifications' },
  { id: 'team', label: 'Team', permission: 'admins' },
  { id: 'audit', label: 'Audit log', permission: 'audit' },
  { id: 'settings', label: 'Settings', permission: 'config' },
];

function errText(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Request failed. Please try again.';
}

function pick(stats: Record<string, unknown> | undefined, keys: string[]): number {
  if (!stats) return 0;
  for (const key of keys) {
    const value = stats[key];
    if (typeof value === 'number') return value;
  }
  return 0;
}

function shortDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* --------------------------------------------------------------- page */

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [notice, setNotice] = useState('');
  const [failure, setFailure] = useState('');

  const flash = useCallback((ok: string, bad = '') => {
    setNotice(ok);
    setFailure(bad);
  }, []);

  useEffect(() => {
    api<{ admin: AdminAccount }>('/api/admin/session')
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
  }, []);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setLoginError('');
    try {
      const data = await api<{ admin: AdminAccount }>('/api/admin/login', {
        method: 'POST',
        json: { email: email.trim(), password },
      });
      setAdmin(data.admin);
      setPassword('');
    } catch (err) {
      setLoginError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try {
      await api('/api/admin/logout', { method: 'POST' });
    } catch {
      /* session is cleared server-side even if the response is lost */
    }
    setAdmin(null);
  };

  const allowed = useMemo(() => {
    const perms = admin?.permissions || [];
    return TABS.filter((entry) => perms.includes(entry.permission) || admin?.role === 'owner');
  }, [admin]);

  useEffect(() => {
    if (allowed.length && !allowed.some((entry) => entry.id === tab)) {
      setTab(allowed[0].id);
    }
  }, [allowed, tab]);

  if (checking) {
    return (
      <div className="page">
        <div className="card admin-login">
          <p className="muted">Checking admin session…</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="page">
        <div className="card admin-login">
          <div className="admin-crest" aria-hidden="true">ع</div>
          <h1 className="page-title">Admin sign-in</h1>
          <p className="muted">
            Authorised staff only. Sign-in attempts are rate limited and recorded in the audit log.
          </p>
          <form onSubmit={signIn} className="admin-form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="admin-email"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="admin-password"
              />
            </label>
            {loginError && (
              <p className="form-error" role="alert" data-testid="admin-login-error">
                {loginError}
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={busy} data-testid="admin-submit">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="admin-hint">
            The owner account is created from <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in the
            hosting environment variables — no credentials are stored in the app bundle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin">
      <header className="page-head admin-head">
        <div>
          <p className="eyebrow">RIFQ Muslim · Administration</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted">
            {admin.name} · {admin.roleLabel || admin.role} · {admin.email}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={signOut} data-testid="admin-signout">
          Sign out
        </button>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        {allowed.map((entry) => (
          <button
            key={entry.id}
            className={`admin-tab${tab === entry.id ? ' is-active' : ''}`}
            onClick={() => {
              setTab(entry.id);
              flash('', '');
            }}
            data-testid={`admin-tab-${entry.id}`}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      {notice && (
        <p className="form-success" role="status" data-testid="admin-notice">
          {notice}
        </p>
      )}
      {failure && (
        <p className="form-error" role="alert" data-testid="admin-failure">
          {failure}
        </p>
      )}

      {tab === 'overview' && <OverviewTab />}
      {tab === 'users' && <UsersTab flash={flash} />}
      {tab === 'messages' && <MessagesTab flash={flash} />}
      {tab === 'content' && <ContentTab flash={flash} />}
      {tab === 'notifications' && <NotificationsTab flash={flash} />}
      {tab === 'team' && <TeamTab flash={flash} admin={admin} />}
      {tab === 'audit' && <AuditTab />}
      {tab === 'settings' && <SettingsTab flash={flash} />}

      <p className="credit admin-credit">
        <span className="credit-mark" aria-hidden="true">✦</span> {CONTACT.developer}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------- overview */

function OverviewTab() {
  const [data, setData] = useState<{
    stats?: Record<string, unknown>;
    activity?: Record<string, unknown>[];
    status?: Record<string, unknown>;
    recentMessages?: MessageRow[];
    recentAudit?: AuditRow[];
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<typeof data>('/api/admin/overview')
      .then((payload) => setData(payload))
      .catch((err) => setError(errText(err)));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!data) return <p className="muted">Loading dashboard…</p>;

  const stats = data.stats || {};
  const activity = data.activity || [];
  const status = data.status || {};
  const peak = Math.max(1, ...activity.map((a) => Number(a.count ?? a.devices ?? a.value ?? 0)));

  return (
    <>
      <div className="stats-grid" data-testid="admin-stats">
        <Stat label="Total users" value={pick(stats, ['totalUsers', 'devices', 'users', 'total'])} />
        <Stat label="Active 24h" value={pick(stats, ['active24h', 'active24', 'activeToday'])} />
        <Stat label="Active 7 days" value={pick(stats, ['active7d', 'active7', 'activeWeek'])} />
        <Stat label="New messages" value={pick(stats, ['newMessages', 'messagesNew', 'unreadMessages'])} />
      </div>

      <section className="card">
        <h2 className="section-title">Activity · last 14 days</h2>
        {activity.length === 0 ? (
          <p className="muted">No activity recorded yet.</p>
        ) : (
          <div className="admin-chart" data-testid="admin-activity">
            {activity.map((entry, index) => {
              const value = Number(entry.count ?? entry.devices ?? entry.value ?? 0);
              return (
                <div className="admin-bar" key={String(entry.day ?? entry.date ?? index)}>
                  <div
                    className="admin-bar-fill"
                    style={{ height: `${Math.max(4, (value / peak) * 100)}%` }}
                    title={`${value}`}
                  />
                  <span className="admin-bar-label">
                    {String(entry.day ?? entry.date ?? '').slice(5) || index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">System status</h2>
        <ul className="admin-status">
          <li>
            <span>Admin sign-in</span>
            <span className={status.adminConfigured ? 'ok' : 'warn'}>
              {status.adminConfigured ? 'Configured' : 'Not configured'}
            </span>
          </li>
          <li>
            <span>Email delivery (contact form)</span>
            <span className={status.emailConfigured ? 'ok' : 'warn'}>
              {status.emailConfigured ? 'Live' : 'Inbox only — set RESEND_API_KEY'}
            </span>
          </li>
          <li>
            <span>Web push</span>
            <span className={status.pushConfigured ? 'ok' : 'warn'}>
              {status.pushConfigured ? 'Live' : 'In-app only — set VAPID keys'}
            </span>
          </li>
          <li>
            <span>Push subscribers</span>
            <span>{pick(stats, ['pushSubscribers', 'subscribers'])}</span>
          </li>
          <li>
            <span>Storage</span>
            <span>{String(status.storage ?? 'file')}</span>
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="section-title">Latest messages</h2>
        {(data.recentMessages || []).length === 0 ? (
          <p className="muted">No messages yet.</p>
        ) : (
          <ul className="admin-list">
            {(data.recentMessages || []).slice(0, 5).map((m) => (
              <li key={m.id}>
                <strong>{m.subject}</strong>
                <span className="muted"> · {m.name} · {shortDate(m.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------- users */

function UsersTab({ flash }: { flash: (ok: string, bad?: string) => void }) {
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (search: string) => {
      setLoading(true);
      try {
        const data = await api<{ users: DeviceRow[]; total: number }>(
          `/api/admin/users?query=${encodeURIComponent(search)}`,
        );
        setRows(data.users || []);
        setTotal(data.total || 0);
      } catch (err) {
        flash('', errText(err));
      } finally {
        setLoading(false);
      }
    },
    [flash],
  );

  useEffect(() => {
    load('');
  }, [load]);

  const act = async (id: string, blocked: boolean) => {
    try {
      await api(`/api/admin/users/${id}/block`, { method: 'POST', json: { blocked } });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, blocked } : r)));
      flash(blocked ? 'User blocked.' : 'User unblocked.');
    } catch (err) {
      flash('', errText(err));
    }
  };

  const remove = async (id: string) => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      setRows((prev) => prev.filter((r) => r.id !== id));
      flash('User record deleted.');
    } catch (err) {
      flash('', errText(err));
    }
  };

  return (
    <section className="card">
      <h2 className="section-title">Registered users ({total})</h2>
      <form
        className="admin-inline"
        onSubmit={(e) => {
          e.preventDefault();
          load(query);
        }}
      >
        <input
          className="admin-input"
          placeholder="Search id, platform, city or language"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="admin-user-search"
        />
        <button className="btn btn-primary btn-sm" type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading users…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No users match this search.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table" data-testid="admin-users">
            <thead>
              <tr>
                <th>Device</th>
                <th>Platform</th>
                <th>Location</th>
                <th>Last seen</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code>{row.id.slice(0, 14)}</code>
                    <div className="muted small">{row.lang || '—'} · {row.appVersion || '—'}</div>
                  </td>
                  <td>{row.platform || '—'}</td>
                  <td>
                    {row.locationLabel || '—'}
                    <div className="muted small">{row.timezone || ''}</div>
                  </td>
                  <td>{shortDate(row.lastSeen)}</td>
                  <td>
                    <span className={row.blocked ? 'warn' : 'ok'}>{row.blocked ? 'Blocked' : 'Active'}</span>
                  </td>
                  <td className="admin-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => act(row.id, !row.blocked)}>
                      {row.blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button className="btn btn-ghost btn-sm danger" onClick={() => remove(row.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------- messages */

function MessagesTab({ flash }: { flash: (ok: string, bad?: string) => void }) {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [filter, setFilter] = useState('');
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (status: string) => {
      try {
        const data = await api<{ messages: MessageRow[]; emailConfigured: boolean }>(
          `/api/admin/messages${status ? `?status=${encodeURIComponent(status)}` : ''}`,
        );
        setRows(data.messages || []);
        setEmailConfigured(Boolean(data.emailConfigured));
      } catch (err) {
        flash('', errText(err));
      }
    },
    [flash],
  );

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const setStatus = async (id: string, status: string) => {
    try {
      await api(`/api/admin/messages/${id}/status`, { method: 'POST', json: { status } });
      setRows((prev) => prev.map((m) => (m.id === id ? { ...m, status: status as MessageRow['status'] } : m)));
      flash('Message updated.');
    } catch (err) {
      flash('', errText(err));
    }
  };

  const sendReply = async (id: string) => {
    setBusy(true);
    try {
      const data = await api<{ delivered: boolean; message: string; reason?: string }>(
        `/api/admin/messages/${id}/reply`,
        { method: 'POST', json: { text: replyText } },
      );
      setReplyFor(null);
      setReplyText('');
      await load(filter);
      if (data.delivered) flash('Reply emailed to the sender.');
      else flash(data.message || 'Reply saved. Email is not configured, so it was not sent.', '');
    } catch (err) {
      flash('', errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card">
      <h2 className="section-title">Contact messages</h2>
      {!emailConfigured && (
        <p className="admin-hint">
          Email delivery is not configured, so form submissions are stored in this inbox and replies are saved
          here. Add <code>RESEND_API_KEY</code> and <code>CONTACT_FROM_EMAIL</code> to send real email.
        </p>
      )}
      <div className="admin-filters">
        {['', 'new', 'read', 'replied', 'archived'].map((status) => (
          <button
            key={status || 'all'}
            className={`chip${filter === status ? ' is-active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status || 'all'}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="muted">No messages in this view.</p>
      ) : (
        <ul className="admin-messages" data-testid="admin-messages">
          {rows.map((m) => (
            <li key={m.id} className="admin-message">
              <div className="admin-message-head">
                <strong>{m.subject}</strong>
                <span className={`badge badge-${m.status}`}>{m.status}</span>
              </div>
              <p className="muted small">
                {m.name} · <a href={`mailto:${m.email}`}>{m.email}</a> · {shortDate(m.createdAt)}
              </p>
              <p className="admin-message-body">{m.message}</p>
              {m.reply && (
                <p className="admin-reply">
                  <strong>Reply:</strong> {m.reply}
                  <span className="muted small"> · {m.replyDelivered ? 'emailed' : 'saved only'}</span>
                </p>
              )}
              <div className="admin-actions">
                {m.status !== 'read' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus(m.id, 'read')}>
                    Mark read
                  </button>
                )}
                {m.status !== 'archived' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus(m.id, 'archived')}>
                    Archive
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setReplyFor(m.id);
                    setReplyText(m.reply || '');
                  }}
                >
                  Reply
                </button>
                <a className="btn btn-ghost btn-sm" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}>
                  Open in mail app
                </a>
              </div>
              {replyFor === m.id && (
                <div className="admin-reply-form">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply…"
                    data-testid="admin-reply-text"
                  />
                  <div className="admin-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={busy || replyText.trim().length < 5}
                      onClick={() => sendReply(m.id)}
                      data-testid="admin-reply-send"
                    >
                      {busy ? 'Sending…' : 'Send reply'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setReplyFor(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------ content */

const KINDS: ContentRow['kind'][] = ['ayah', 'dua', 'hadith', 'adhkar'];

function ContentTab({ flash }: { flash: (ok: string, bad?: string) => void }) {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [kind, setKind] = useState<ContentRow['kind']>('dua');
  const [title, setTitle] = useState('');
  const [arabic, setArabic] = useState('');
  const [text, setText] = useState('');
  const [reference, setReference] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ content: ContentRow[] }>('/api/admin/content');
      setRows(data.content || []);
    } catch (err) {
      flash('', errText(err));
    }
  }, [flash]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api('/api/admin/content', {
        method: 'POST',
        json: { kind, title, arabic, text, reference, language },
      });
      setTitle('');
      setArabic('');
      setText('');
      setReference('');
      await load();
      flash('Content saved and published to the app.');
    } catch (err) {
      flash('', errText(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (id: string) => {
    try {
      await api(`/api/admin/content/${id}/toggle`, { method: 'POST' });
      await load();
      flash('Visibility updated.');
    } catch (err) {
      flash('', errText(err));
    }
  };

  const remove = async (id: string) => {
    try {
      await api(`/api/admin/content/${id}`, { method: 'DELETE' });
      await load();
      flash('Content deleted.');
    } catch (err) {
      flash('', errText(err));
    }
  };

  return (
    <>
      <section className="card">
        <h2 className="section-title">Add daily content</h2>
        <p className="admin-hint">
          Only add text you can verify against an authentic source. Record the reference for every Hadith and
          Ayah so users can check it.
        </p>
        <form className="admin-form" onSubmit={create} data-testid="admin-content-form">
          <div className="admin-grid-2">
            <label className="field">
              <span>Type</span>
              <select value={kind} onChange={(e) => setKind(e.target.value as ContentRow['kind'])}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} />
          </label>
          <label className="field">
            <span>Arabic text (optional)</span>
            <textarea rows={2} dir="rtl" value={arabic} onChange={(e) => setArabic(e.target.value)} />
          </label>
          <label className="field">
            <span>Text / translation</span>
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} required minLength={2} />
          </label>
          <label className="field">
            <span>Reference (Surah:Ayah, Hadith collection)</span>
            <input value={reference} onChange={(e) => setReference(e.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy} data-testid="admin-content-save">
            {busy ? 'Saving…' : 'Publish content'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title">Published content ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="muted">Nothing added yet. The app uses its verified built-in library.</p>
        ) : (
          <ul className="admin-list" data-testid="admin-content-list">
            {rows.map((row) => (
              <li key={row.id} className="admin-content-row">
                <div>
                  <span className="badge">{row.kind}</span>{' '}
                  <strong>{row.title}</strong>
                  <span className="muted small"> · {row.language || 'en'} · {row.active ? 'active' : 'hidden'}</span>
                  {row.reference && <div className="muted small">{row.reference}</div>}
                </div>
                <div className="admin-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => toggle(row.id)}>
                    {row.active ? 'Hide' : 'Show'}
                  </button>
                  <button className="btn btn-ghost btn-sm danger" onClick={() => remove(row.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/* ------------------------------------------------------ notifications */

function NotificationsTab({ flash }: { flash: (ok: string, bad?: string) => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [target, setTarget] = useState<'all' | 'selected'>('all');
  const [users, setUsers] = useState<DeviceRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ message: string; sent: number; failed: number; pushConfigured: boolean } | null>(
    null,
  );

  useEffect(() => {
    api<{ users: DeviceRow[] }>('/api/admin/users')
      .then((data) => setUsers(data.users || []))
      .catch(() => setUsers([]));
  }, []);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const data = await api<{
        message: string;
        sent: number;
        failed: number;
        pushConfigured: boolean;
      }>('/api/admin/notifications', {
        method: 'POST',
        json: { title, body, url, target, deviceIds: selected },
      });
      setResult(data);
      flash('Notification published.');
      setTitle('');
      setBody('');
    } catch (err) {
      flash('', errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card">
      <h2 className="section-title">Send a notification</h2>
      <p className="admin-hint">
        Announcements appear inside the app for the chosen audience. Browser push is delivered to devices that
        enabled notifications when VAPID keys are configured on the server.
      </p>
      <form className="admin-form" onSubmit={send} data-testid="admin-notify-form">
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} maxLength={80} />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} required minLength={2} maxLength={300} />
        </label>
        <label className="field">
          <span>Open route (optional)</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/prayer" />
        </label>
        <div className="segmented">
          <button
            type="button"
            className={`seg-btn${target === 'all' ? ' is-active' : ''}`}
            onClick={() => setTarget('all')}
          >
            All users
          </button>
          <button
            type="button"
            className={`seg-btn${target === 'selected' ? ' is-active' : ''}`}
            onClick={() => setTarget('selected')}
          >
            Selected users
          </button>
        </div>

        {target === 'selected' && (
          <div className="admin-recipients">
            {users.length === 0 ? (
              <p className="muted">No devices recorded yet.</p>
            ) : (
              users.map((user) => (
                <label key={user.id} className="admin-check">
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked ? [...prev, user.id] : prev.filter((id) => id !== user.id),
                      )
                    }
                  />
                  <span>
                    {user.locationLabel || user.id.slice(0, 12)} · {user.platform || 'web'}
                  </span>
                </label>
              ))
            )}
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={busy} data-testid="admin-notify-send">
          {busy ? 'Sending…' : 'Publish notification'}
        </button>
      </form>

      {result && (
        <div className="admin-result" data-testid="admin-notify-result">
          <p>{result.message}</p>
          <p className="muted small">
            Push delivered: {result.sent} · failed: {result.failed} ·{' '}
            {result.pushConfigured ? 'push configured' : 'push not configured'}
          </p>
        </div>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- team */

function TeamTab({
  flash,
  admin,
}: {
  flash: (ok: string, bad?: string) => void;
  admin: AdminAccount;
}) {
  const [rows, setRows] = useState<AdminAccount[]>([]);
  const [roles, setRoles] = useState<{ role: string; label: string; permissions: string[] }[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('support');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ admins: AdminAccount[]; roles: typeof roles }>('/api/admin/admins');
      setRows(data.admins || []);
      setRoles(data.roles || []);
    } catch (err) {
      flash('', errText(err));
    }
  }, [flash]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api('/api/admin/admins', { method: 'POST', json: { email, name, role, password } });
      setEmail('');
      setName('');
      setPassword('');
      await load();
      flash('Admin account created.');
    } catch (err) {
      flash('', errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="card">
        <h2 className="section-title">Administrators</h2>
        <p className="admin-hint">
          You are signed in as <strong>{admin.email}</strong>. Roles are enforced by the server on every request,
          so changing a role in the browser cannot grant extra access.
        </p>
        <ul className="admin-list" data-testid="admin-team">
          {rows.map((row) => (
            <li key={row.id} className="admin-content-row">
              <div>
                <strong>{row.name}</strong>
                <div className="muted small">
                  {row.email} · {row.roleLabel || row.role}
                </div>
              </div>
              <span className="badge">{row.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="section-title">Create an admin account</h2>
        <form className="admin-form" onSubmit={create} data-testid="admin-team-form">
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {(roles.length ? roles.map((r) => r.role) : ['owner', 'editor', 'support']).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Password (min 10 characters)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={10}
              required
              autoComplete="new-password"
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        {roles.length > 0 && (
          <ul className="admin-list muted small">
            {roles.map((r) => (
              <li key={r.role}>
                <strong>{r.label || r.role}</strong>: {r.permissions.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/* -------------------------------------------------------------- audit */

function AuditTab() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ audit: AuditRow[] }>('/api/admin/audit')
      .then((data) => setRows(data.audit || []))
      .catch((err) => setError(errText(err)));
  }, []);

  if (error) return <p className="form-error">{error}</p>;

  return (
    <section className="card">
      <h2 className="section-title">Audit log</h2>
      <p className="admin-hint">Every privileged action is recorded with the admin, action and time.</p>
      {rows.length === 0 ? (
        <p className="muted">No admin actions recorded yet.</p>
      ) : (
        <ul className="admin-list admin-audit" data-testid="admin-audit">
          {rows.map((row, index) => (
            <li key={row.id || `${row.action}-${index}`}>
              <code>{row.action || 'action'}</code>{' '}
              <span>{row.detail || ''}</span>
              <div className="muted small">
                {row.by || row.admin || 'system'} · {shortDate(row.at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ----------------------------------------------------------- settings */

function SettingsTab({ flash }: { flash: (ok: string, bad?: string) => void }) {
  const [languages, setLanguages] = useState<string[]>(['en', 'ar']);
  const [busy, setBusy] = useState(false);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const save = async () => {
    setBusy(true);
    try {
      const data = await api<{ config: { languages: string[] } }>('/api/admin/config', {
        method: 'POST',
        json: { languages },
      });
      setLanguages(data.config.languages);
      flash('App languages updated.');
    } catch (err) {
      flash('', errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="card">
        <h2 className="section-title">App languages</h2>
        <p className="admin-hint">Enabled languages are published through the public config endpoint.</p>
        <div className="admin-filters">
          {[
            { code: 'en', label: 'English' },
            { code: 'ar', label: 'العربية' },
          ].map((lang) => (
            <label key={lang.code} className="admin-check">
              <input
                type="checkbox"
                checked={languages.includes(lang.code)}
                onChange={() => toggleLanguage(lang.code)}
              />
              <span>{lang.label}</span>
            </label>
          ))}
        </div>
        <button className="btn btn-primary" onClick={save} disabled={busy} data-testid="admin-config-save">
          {busy ? 'Saving…' : 'Save settings'}
        </button>
      </section>

      <section className="card">
        <h2 className="section-title">Store & policy links</h2>
        <ul className="admin-list">
          <li>
            <a href="/privacy">Privacy policy</a> — required for both stores and linked from Settings.
          </li>
          <li>
            <a href="/contact">Contact page</a> — {CONTACT.email} · {CONTACT.phone}
          </li>
          <li>
            <a href="/about">About RIFQ Muslim</a> — version and developer credit.
          </li>
        </ul>
      </section>
    </>
  );
}

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const DIST = path.join(__dirname, 'dist');

/* ------------------------------------------------------------------ config */

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Eng Mohamud Yusuf';
const CONTACT_TO = (process.env.CONTACT_TO_EMAIL || 'rifqmuslim@gmail.com').trim();
const CONTACT_FROM = process.env.CONTACT_FROM_EMAIL || '';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const emailConfigured = () => Boolean(RESEND_KEY && CONTACT_FROM);
const pushConfigured = () => Boolean(VAPID_PUBLIC && VAPID_PRIVATE);
const adminConfigured = () => Boolean(ADMIN_EMAIL && (ADMIN_PASSWORD || ADMIN_PASSWORD_HASH));

/* -------------------------------------------------------------- data store */

function resolveDataDir() {
  const preferred = process.env.DATA_DIR || path.join(__dirname, 'var');
  for (const dir of [preferred, path.join(os.tmpdir(), 'rifq-muslim-data')]) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch {
      /* try the next location */
    }
  }
  return os.tmpdir();
}

const DATA_DIR = resolveDataDir();
const STORE_FILE = path.join(DATA_DIR, 'store.json');

const emptyStore = () => ({
  version: 1,
  admins: [],
  sessions: [],
  devices: {},
  activity: [],
  messages: [],
  announcements: [],
  pushSubs: [],
  content: [],
  audit: [],
  config: { languages: ['en', 'ar'] },
});

function loadStore() {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...emptyStore(), ...parsed, config: { ...emptyStore().config, ...(parsed.config || {}) } };
  } catch {
    return emptyStore();
  }
}

const db = loadStore();

let persistTimer = null;
function persist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const tmp = `${STORE_FILE}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(db));
      fs.renameSync(tmp, STORE_FILE);
    } catch (error) {
      console.error('[rifq] could not persist data store:', error?.message || error);
    }
  }, 120);
}

/* ------------------------------------------------------------------ crypto */

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `s1$${salt.toString('hex')}$${derived.toString('hex')}`;
}

function verifyPassword(password, stored) {
  try {
    const [scheme, saltHex, hashHex] = String(stored).split('$');
    if (scheme !== 's1' || !saltHex || !hashHex) return false;
    const derived = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64, {
      N: 16384,
      r: 8,
      p: 1,
    });
    const expected = Buffer.from(hashHex, 'hex');
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

const newId = (prefix) => `${prefix}_${crypto.randomBytes(9).toString('hex')}`;

/* ------------------------------------------------------------ roles / RBAC */

const PERMISSIONS = {
  owner: ['overview', 'users', 'messages', 'content', 'notifications', 'admins', 'audit', 'config'],
  editor: ['overview', 'messages', 'content', 'notifications', 'audit'],
  support: ['overview', 'messages'],
};

const ROLE_LABEL = {
  owner: 'Owner — full control',
  editor: 'Editor — content & messages',
  support: 'Support — messages only',
};

const can = (role, permission) => (PERMISSIONS[role] || []).includes(permission);

/* --------------------------------------------------------------- bootstrap */

function bootstrapOwner() {
  if (!adminConfigured()) return;
  let owner = db.admins.find((a) => a.email === ADMIN_EMAIL);
  if (!owner) {
    owner = {
      id: newId('adm'),
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'owner',
      hash: ADMIN_PASSWORD_HASH || hashPassword(ADMIN_PASSWORD),
      createdAt: new Date().toISOString(),
      createdBy: 'environment',
      active: true,
    };
    db.admins.push(owner);
    db.audit.unshift({
      id: newId('aud'),
      at: new Date().toISOString(),
      adminId: owner.id,
      email: owner.email,
      action: 'admin.bootstrap',
      detail: 'Owner account created from environment configuration',
      ip: 'server',
    });
    persist();
  } else if (ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH) {
    // The owner account is controlled by the environment: changing the
    // configured password rotates the stored hash on the next boot.
    if (!verifyPassword(ADMIN_PASSWORD, owner.hash)) {
      owner.hash = hashPassword(ADMIN_PASSWORD);
      persist();
    }
  }
  db.sessions = db.sessions.filter((s) => s.exp > Date.now());
}

bootstrapOwner();

/* --------------------------------------------------------------- utilities */

const nowIso = () => new Date().toISOString();
const clientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.ip || 'unknown';
};
const safe = (value, max = 400) => String(value ?? '').trim().slice(0, max);
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || ''));

const rateBuckets = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = rateBuckets.get(key);
  if (!entry || now > entry.reset) {
    rateBuckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

function audit(admin, action, detail, req) {
  db.audit.unshift({
    id: newId('aud'),
    at: nowIso(),
    adminId: admin?.id || null,
    email: admin?.email || 'system',
    action,
    detail: safe(detail, 600),
    ip: req ? clientIp(req) : 'server',
  });
  if (db.audit.length > 500) db.audit.length = 500;
  persist();
}

/* ------------------------------------------------------------------ email */

async function sendEmail({ to, subject, text, replyTo }) {
  if (!emailConfigured()) return { sent: false, reason: 'email_not_configured' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [to],
        subject: safe(subject, 180),
        text: String(text || '').slice(0, 8000),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!response.ok) {
      return { sent: false, reason: `provider_${response.status}` };
    }
    return { sent: true };
  } catch {
    return { sent: false, reason: 'provider_unreachable' };
  }
}

/* ------------------------------------------------------------------- push */

let webpushModule;
let webpushTried = false;

async function getWebPush() {
  if (webpushTried) return webpushModule;
  webpushTried = true;
  if (!pushConfigured()) return null;
  try {
    const mod = await import('web-push');
    const wp = mod.default ?? mod;
    wp.setVapidDetails(`mailto:${CONTACT_TO}`, VAPID_PUBLIC, VAPID_PRIVATE);
    webpushModule = wp;
    return wp;
  } catch (error) {
    console.warn('[rifq] web-push unavailable:', error?.message || error);
    return null;
  }
}

async function pushToSubscriptions(subs, payload) {
  const wp = await getWebPush();
  if (!wp || !subs.length) return { sent: 0, failed: 0, configured: Boolean(wp) };
  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    try {
      await wp.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload),
      );
      sent += 1;
    } catch (error) {
      failed += 1;
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        db.pushSubs = db.pushSubs.filter((s) => s.endpoint !== sub.endpoint);
      }
    }
  }
  persist();
  return { sent, failed, configured: true };
}

/* ------------------------------------------------------------ middleware */

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

function readCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function currentAdmin(req) {
  const token = readCookies(req).rifq_admin;
  if (!token) return null;
  const hashed = sha256(token);
  const session = db.sessions.find((s) => s.token === hashed);
  if (!session) return null;
  if (session.exp < Date.now()) {
    db.sessions = db.sessions.filter((s) => s.token !== hashed);
    persist();
    return null;
  }
  const admin = db.admins.find((a) => a.id === session.adminId && a.active !== false);
  return admin || null;
}

function requireAdmin(req, res, next) {
  const admin = currentAdmin(req);
  if (!admin) return res.status(401).json({ ok: false, error: 'unauthorized' });
  req.admin = admin;
  next();
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ ok: false, error: 'unauthorized' });
    if (!can(req.admin.role, permission)) {
      return res.status(403).json({ ok: false, error: 'forbidden', permission });
    }
    next();
  };
}

function requireCsrfHeader(req, res, next) {
  if (req.get('x-rifq-admin') !== '1') {
    return res.status(400).json({ ok: false, error: 'missing_request_header' });
  }
  next();
}

function sessionCookie(res, token, secure) {
  const parts = [
    `rifq_admin=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'rifq_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}

const adminView = (admin) => ({
  id: admin.id,
  email: admin.email,
  name: admin.name,
  role: admin.role,
  roleLabel: ROLE_LABEL[admin.role] || admin.role,
  permissions: PERMISSIONS[admin.role] || [],
  createdAt: admin.createdAt,
});

/* ------------------------------------------------------------- public API */

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'rifq-muslim',
    time: nowIso(),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL),
    adminConfigured: adminConfigured(),
    emailConfigured: emailConfigured(),
    pushConfigured: pushConfigured(),
  });
});

app.get('/api/config', (_req, res) => {
  res.json({
    ok: true,
    languages: db.config.languages || ['en', 'ar'],
    pushPublicKey: pushConfigured() ? VAPID_PUBLIC : null,
    emailConfigured: emailConfigured(),
    adminConfigured: adminConfigured(),
    contact: {
      email: 'rifqmuslim@gmail.com',
      phone: '+252-612215593',
      whatsapp: '252612215593',
    },
  });
});

app.post('/api/activity', (req, res) => {
  const ip = clientIp(req);
  if (!rateLimit(`activity:${ip}`, 90, 60_000)) {
    return res.status(429).json({ ok: false, error: 'rate_limited' });
  }
  const id = safe(req.body?.deviceId, 80);
  if (!id || !/^[A-Za-z0-9_-]{8,80}$/.test(id)) {
    return res.status(400).json({ ok: false, error: 'invalid_device' });
  }
  const existing = db.devices[id];
  const record = {
    id,
    firstSeen: existing?.firstSeen || nowIso(),
    lastSeen: nowIso(),
    platform: safe(req.body?.platform, 40) || 'web',
    lang: safe(req.body?.lang, 8) || 'en',
    appVersion: safe(req.body?.appVersion, 20) || '1.0.0',
    locationLabel: safe(req.body?.locationLabel, 120),
    timezone: safe(req.body?.timezone, 60),
    blocked: existing?.blocked || false,
    sessions: (existing?.sessions || 0) + 1,
  };
  db.devices[id] = record;

  const day = nowIso().slice(0, 10);
  if (!db.activity.some((a) => a.day === day && a.deviceId === id)) {
    db.activity.push({ day, deviceId: id });
    if (db.activity.length > 8000) db.activity = db.activity.slice(-8000);
  }
  persist();
  res.json({ ok: true, blocked: record.blocked });
});

app.get('/api/announcements', (req, res) => {
  const deviceId = safe(req.query.deviceId, 80);
  const since = Number(req.query.since || 0);
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const items = db.announcements
    .filter((a) => new Date(a.createdAt).getTime() > cutoff)
    .filter((a) => (a.target === 'selected' ? a.deviceIds.includes(deviceId) : true))
    .filter((a) => new Date(a.createdAt).getTime() > since)
    .map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      url: a.url,
      createdAt: a.createdAt,
    }));
  res.json({ ok: true, announcements: items });
});

app.get('/api/content/daily', (_req, res) => {
  const latest = {};
  for (const item of db.content) {
    if (item.active === false) continue;
    const current = latest[item.kind];
    if (!current || item.createdAt > current.createdAt) latest[item.kind] = item;
  }
  const shape = (item) =>
    item
      ? {
          kind: item.kind,
          title: item.title,
          arabic: item.arabic,
          text: item.text,
          reference: item.reference,
          language: item.language,
        }
      : null;
  res.json({
    ok: true,
    ayah: shape(latest.ayah),
    dua: shape(latest.dua),
    hadith: shape(latest.hadith),
    adhkar: shape(latest.adhkar),
  });
});

app.post('/api/contact', async (req, res) => {
  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
    return res.status(429).json({
      ok: false,
      error: 'rate_limited',
      message: 'Too many messages from this device. Please try again later.',
    });
  }

  const name = safe(req.body?.name, 80);
  const email = safe(req.body?.email, 120).toLowerCase();
  const subject = safe(req.body?.subject, 140);
  const message = safe(req.body?.message, 2000);

  const errors = {};
  if (name.length < 2) errors.name = 'name_required';
  if (!isEmail(email)) errors.email = 'email_invalid';
  if (subject.length < 3) errors.subject = 'subject_required';
  if (message.length < 10) errors.message = 'message_too_short';
  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, error: 'validation_failed', errors });
  }

  const record = {
    id: newId('msg'),
    name,
    email,
    subject,
    message,
    status: 'new',
    createdAt: nowIso(),
    ipHash: sha256(ip).slice(0, 16),
    reply: null,
    repliedAt: null,
    emailDelivered: false,
  };

  const delivery = await sendEmail({
    to: CONTACT_TO,
    subject: `[RIFQ Muslim] ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    replyTo: email,
  });
  record.emailDelivered = delivery.sent;

  db.messages.unshift(record);
  if (db.messages.length > 500) db.messages.length = 500;
  persist();

  res.json({
    ok: true,
    id: record.id,
    emailDelivered: delivery.sent,
    emailConfigured: emailConfigured(),
    message: delivery.sent
      ? 'Your message was sent. We will reply to your email.'
      : 'Your message was received and saved to the RIFQ Muslim inbox. Email forwarding is not configured yet, so a reply may take longer.',
  });
});

app.post('/api/push/subscribe', (req, res) => {
  const deviceId = safe(req.body?.deviceId, 80);
  const subscription = req.body?.subscription;
  if (!deviceId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ ok: false, error: 'invalid_subscription' });
  }
  db.pushSubs = db.pushSubs.filter((s) => s.endpoint !== subscription.endpoint);
  db.pushSubs.push({
    deviceId,
    endpoint: safe(subscription.endpoint, 500),
    keys: {
      p256dh: safe(subscription.keys.p256dh, 200),
      auth: safe(subscription.keys.auth, 200),
    },
    createdAt: nowIso(),
  });
  persist();
  res.json({ ok: true });
});

app.delete('/api/push/subscribe', (req, res) => {
  const endpoint = safe(req.body?.endpoint, 500);
  db.pushSubs = db.pushSubs.filter((s) => s.endpoint !== endpoint);
  persist();
  res.json({ ok: true });
});

/* -------------------------------------------------------------- admin API */

app.post('/api/admin/login', async (req, res) => {
  if (!adminConfigured() && db.admins.length === 0) {
    return res.status(503).json({
      ok: false,
      error: 'admin_not_configured',
      message:
        'Admin sign-in is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in the hosting environment variables, then restart the app.',
    });
  }
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000)) {
    return res.status(429).json({
      ok: false,
      error: 'rate_limited',
      message: 'Too many sign-in attempts. Please wait 15 minutes.',
    });
  }

  const email = safe(req.body?.email, 120).toLowerCase();
  const password = String(req.body?.password || '');
  const admin = db.admins.find((a) => a.email === email && a.active !== false);

  const ok = Boolean(admin) && verifyPassword(password, admin.hash);
  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    audit(admin || { email }, 'admin.login_failed', `Failed sign-in for ${email}`, req);
    return res.status(401).json({ ok: false, error: 'invalid_credentials', message: 'Incorrect email or password.' });
  }

  db.sessions = db.sessions.filter((s) => s.exp > Date.now());
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({
    token: sha256(token),
    adminId: admin.id,
    exp: Date.now() + SESSION_TTL_MS,
    ip: sha256(ip).slice(0, 16),
    createdAt: nowIso(),
  });
  persist();
  sessionCookie(res, token, req.secure || req.get('x-forwarded-proto') === 'https');
  audit(admin, 'admin.login', 'Signed in to the admin dashboard', req);
  res.json({ ok: true, admin: adminView(admin) });
});

app.post('/api/admin/logout', requireAdmin, requireCsrfHeader, (req, res) => {
  const token = readCookies(req).rifq_admin;
  if (token) db.sessions = db.sessions.filter((s) => s.token !== sha256(token));
  persist();
  clearSessionCookie(res);
  audit(req.admin, 'admin.logout', 'Signed out', req);
  res.json({ ok: true });
});

app.get('/api/admin/session', (req, res) => {
  const admin = currentAdmin(req);
  if (!admin) return res.status(401).json({ ok: false, authenticated: false });
  res.json({ ok: true, authenticated: true, admin: adminView(admin) });
});

app.get('/api/admin/overview', requireAdmin, requirePermission('overview'), (req, res) => {
  const devices = Object.values(db.devices);
  const dayMs = 24 * 60 * 60 * 1000;
  const active24 = devices.filter((d) => Date.now() - new Date(d.lastSeen).getTime() < dayMs).length;
  const active7 = devices.filter((d) => Date.now() - new Date(d.lastSeen).getTime() < 7 * dayMs).length;

  const activity = [];
  for (let i = 13; i >= 0; i -= 1) {
    const day = new Date(Date.now() - i * dayMs).toISOString().slice(0, 10);
    const unique = new Set(db.activity.filter((a) => a.day === day).map((a) => a.deviceId));
    activity.push({ day, devices: unique.size });
  }

  res.json({
    ok: true,
    stats: {
      totalUsers: devices.length,
      active24h: active24,
      active7d: active7,
      blocked: devices.filter((d) => d.blocked).length,
      messages: db.messages.length,
      newMessages: db.messages.filter((m) => m.status === 'new').length,
      announcements: db.announcements.length,
      contentItems: db.content.filter((c) => c.active !== false).length,
      admins: db.admins.filter((a) => a.active !== false).length,
      pushSubscribers: db.pushSubs.length,
    },
    activity,
    status: {
      adminConfigured: adminConfigured() || db.admins.length > 0,
      emailConfigured: emailConfigured(),
      pushConfigured: pushConfigured(),
      storage: DATA_DIR,
    },
    recentAudit: db.audit.slice(0, 8),
    recentMessages: db.messages.slice(0, 5).map((m) => ({
      id: m.id,
      name: m.name,
      subject: m.subject,
      status: m.status,
      createdAt: m.createdAt,
    })),
    languages: db.config.languages,
  });
});

app.get('/api/admin/users', requireAdmin, requirePermission('users'), (req, res) => {
  const query = safe(req.query.query, 80).toLowerCase();
  const list = Object.values(db.devices)
    .filter((d) =>
      !query
        ? true
        : `${d.id} ${d.platform} ${d.locationLabel} ${d.lang}`.toLowerCase().includes(query),
    )
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
    .slice(0, 200)
    .map((d) => ({
      id: d.id,
      firstSeen: d.firstSeen,
      lastSeen: d.lastSeen,
      platform: d.platform,
      lang: d.lang,
      appVersion: d.appVersion,
      locationLabel: d.locationLabel,
      timezone: d.timezone,
      blocked: Boolean(d.blocked),
      sessions: d.sessions,
    }));
  res.json({ ok: true, users: list, total: Object.keys(db.devices).length });
});

app.post('/api/admin/users/:id/block', requireAdmin, requirePermission('users'), requireCsrfHeader, (req, res) => {
  const device = db.devices[req.params.id];
  if (!device) return res.status(404).json({ ok: false, error: 'not_found' });
  device.blocked = Boolean(req.body?.blocked);
  persist();
  audit(req.admin, device.blocked ? 'user.block' : 'user.unblock', `Device ${device.id}`, req);
  res.json({ ok: true, blocked: device.blocked });
});

app.delete('/api/admin/users/:id', requireAdmin, requirePermission('users'), requireCsrfHeader, (req, res) => {
  if (!db.devices[req.params.id]) return res.status(404).json({ ok: false, error: 'not_found' });
  delete db.devices[req.params.id];
  persist();
  audit(req.admin, 'user.delete', `Device ${req.params.id}`, req);
  res.json({ ok: true });
});

app.get('/api/admin/messages', requireAdmin, requirePermission('messages'), (req, res) => {
  const status = safe(req.query.status, 20);
  const list = db.messages
    .filter((m) => !status || m.status === status)
    .slice(0, 200);
  res.json({ ok: true, messages: list, emailConfigured: emailConfigured() });
});

app.post('/api/admin/messages/:id/status', requireAdmin, requirePermission('messages'), requireCsrfHeader, (req, res) => {
  const message = db.messages.find((m) => m.id === req.params.id);
  if (!message) return res.status(404).json({ ok: false, error: 'not_found' });
  const status = safe(req.body?.status, 20);
  if (!['new', 'read', 'replied', 'archived'].includes(status)) {
    return res.status(400).json({ ok: false, error: 'invalid_status' });
  }
  message.status = status;
  persist();
  audit(req.admin, 'message.status', `${message.id} → ${status}`, req);
  res.json({ ok: true, message });
});

app.post('/api/admin/messages/:id/reply', requireAdmin, requirePermission('messages'), requireCsrfHeader, async (req, res) => {
  const message = db.messages.find((m) => m.id === req.params.id);
  if (!message) return res.status(404).json({ ok: false, error: 'not_found' });
  const text = safe(req.body?.text, 4000);
  if (text.length < 5) return res.status(400).json({ ok: false, error: 'reply_too_short' });

  const delivery = await sendEmail({
    to: message.email,
    subject: `Re: ${message.subject}`,
    text,
    replyTo: CONTACT_TO,
  });
  message.reply = text;
  message.repliedAt = nowIso();
  message.status = delivery.sent ? 'replied' : message.status;
  message.replyDelivered = delivery.sent;
  persist();
  audit(req.admin, 'message.reply', `${message.id} (${delivery.sent ? 'emailed' : 'saved only'})`, req);

  res.json({
    ok: true,
    delivered: delivery.sent,
    reason: delivery.reason || null,
    message: delivery.sent
      ? 'Reply sent by email.'
      : 'Reply saved to the message. Email is not configured, so copy it or use the mail link to send it.',
  });
});

app.get('/api/admin/content', requireAdmin, requirePermission('content'), (_req, res) => {
  res.json({ ok: true, content: db.content.slice(0, 300) });
});

app.post('/api/admin/content', requireAdmin, requirePermission('content'), requireCsrfHeader, (req, res) => {
  const kinds = ['ayah', 'dua', 'hadith', 'adhkar'];
  const kind = safe(req.body?.kind, 20);
  if (!kinds.includes(kind)) return res.status(400).json({ ok: false, error: 'invalid_kind' });
  const title = safe(req.body?.title, 140);
  const text = safe(req.body?.text, 2000);
  if (title.length < 2 || text.length < 2) {
    return res.status(400).json({ ok: false, error: 'validation_failed' });
  }
  const item = {
    id: newId('cnt'),
    kind,
    title,
    arabic: safe(req.body?.arabic, 2000),
    text,
    reference: safe(req.body?.reference, 200),
    language: ['en', 'ar'].includes(req.body?.language) ? req.body.language : 'en',
    active: true,
    createdAt: nowIso(),
    createdBy: req.admin.email,
  };
  db.content.unshift(item);
  persist();
  audit(req.admin, 'content.create', `${kind}: ${title}`, req);
  res.json({ ok: true, item });
});

app.post('/api/admin/content/:id/toggle', requireAdmin, requirePermission('content'), requireCsrfHeader, (req, res) => {
  const item = db.content.find((c) => c.id === req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: 'not_found' });
  item.active = !item.active;
  persist();
  audit(req.admin, 'content.toggle', `${item.kind}: ${item.title} → ${item.active ? 'active' : 'hidden'}`, req);
  res.json({ ok: true, item });
});

app.delete('/api/admin/content/:id', requireAdmin, requirePermission('content'), requireCsrfHeader, (req, res) => {
  const before = db.content.length;
  db.content = db.content.filter((c) => c.id !== req.params.id);
  if (db.content.length === before) return res.status(404).json({ ok: false, error: 'not_found' });
  persist();
  audit(req.admin, 'content.delete', req.params.id, req);
  res.json({ ok: true });
});

app.post('/api/admin/notifications', requireAdmin, requirePermission('notifications'), requireCsrfHeader, async (req, res) => {
  const title = safe(req.body?.title, 80);
  const body = safe(req.body?.body, 300);
  const target = req.body?.target === 'selected' ? 'selected' : 'all';
  const deviceIds = Array.isArray(req.body?.deviceIds)
    ? req.body.deviceIds.map((id) => safe(id, 80)).filter(Boolean).slice(0, 200)
    : [];
  const url = safe(req.body?.url, 200) || '/';

  if (title.length < 2 || body.length < 2) {
    return res.status(400).json({ ok: false, error: 'validation_failed' });
  }
  if (target === 'selected' && deviceIds.length === 0) {
    return res.status(400).json({ ok: false, error: 'no_recipients' });
  }

  const announcement = {
    id: newId('ann'),
    title,
    body,
    url,
    target,
    deviceIds,
    createdAt: nowIso(),
    createdBy: req.admin.email,
  };
  db.announcements.unshift(announcement);
  if (db.announcements.length > 200) db.announcements.length = 200;

  const subs =
    target === 'selected'
      ? db.pushSubs.filter((s) => deviceIds.includes(s.deviceId))
      : db.pushSubs;
  const result = await pushToSubscriptions(subs, {
    title,
    body,
    url,
    id: announcement.id,
  });

  announcement.push = result;
  persist();
  audit(
    req.admin,
    'notification.send',
    `${target} · ${title} · push sent ${result.sent}, failed ${result.failed}`,
    req,
  );

  res.json({
    ok: true,
    announcement,
    pushConfigured: result.configured,
    sent: result.sent,
    failed: result.failed,
    recipients: target === 'selected' ? deviceIds.length : Object.keys(db.devices).length,
    message: result.configured
      ? `Sent to ${result.sent} subscribed device(s).`
      : 'Announcement published. It appears inside the app for the target devices; browser push needs VAPID keys to be configured.',
  });
});

app.get('/api/admin/audit', requireAdmin, requirePermission('audit'), (_req, res) => {
  res.json({ ok: true, audit: db.audit.slice(0, 200) });
});

app.get('/api/admin/admins', requireAdmin, requirePermission('admins'), (_req, res) => {
  res.json({
    ok: true,
    admins: db.admins.map(adminView),
    roles: Object.keys(PERMISSIONS).map((role) => ({ role, label: ROLE_LABEL[role], permissions: PERMISSIONS[role] })),
  });
});

app.post('/api/admin/admins', requireAdmin, requirePermission('admins'), requireCsrfHeader, (req, res) => {
  const email = safe(req.body?.email, 120).toLowerCase();
  const name = safe(req.body?.name, 80) || email.split('@')[0];
  const role = safe(req.body?.role, 20);
  const password = String(req.body?.password || '');
  if (!isEmail(email)) return res.status(400).json({ ok: false, error: 'email_invalid' });
  if (!['owner', 'editor', 'support'].includes(role)) {
    return res.status(400).json({ ok: false, error: 'invalid_role' });
  }
  if (password.length < 10) return res.status(400).json({ ok: false, error: 'weak_password' });
  if (db.admins.some((a) => a.email === email)) {
    return res.status(409).json({ ok: false, error: 'exists' });
  }
  const admin = {
    id: newId('adm'),
    email,
    name,
    role,
    hash: hashPassword(password),
    createdAt: nowIso(),
    createdBy: req.admin.email,
    active: true,
  };
  db.admins.push(admin);
  persist();
  audit(req.admin, 'admin.create', `${email} as ${role}`, req);
  res.json({ ok: true, admin: adminView(admin) });
});

app.post('/api/admin/admins/:id/role', requireAdmin, requirePermission('admins'), requireCsrfHeader, (req, res) => {
  const admin = db.admins.find((a) => a.id === req.params.id);
  if (!admin) return res.status(404).json({ ok: false, error: 'not_found' });
  const role = safe(req.body?.role, 20);
  if (!['owner', 'editor', 'support'].includes(role)) {
    return res.status(400).json({ ok: false, error: 'invalid_role' });
  }
  if (admin.role === 'owner' && role !== 'owner') {
    const owners = db.admins.filter((a) => a.role === 'owner' && a.active !== false);
    if (owners.length <= 1) {
      return res.status(400).json({ ok: false, error: 'last_owner' });
    }
  }
  admin.role = role;
  persist();
  audit(req.admin, 'admin.role', `${admin.email} → ${role}`, req);
  res.json({ ok: true, admin: adminView(admin) });
});

app.delete('/api/admin/admins/:id', requireAdmin, requirePermission('admins'), requireCsrfHeader, (req, res) => {
  const admin = db.admins.find((a) => a.id === req.params.id);
  if (!admin) return res.status(404).json({ ok: false, error: 'not_found' });
  if (admin.role === 'owner') {
    const owners = db.admins.filter((a) => a.role === 'owner' && a.active !== false);
    if (owners.length <= 1) return res.status(400).json({ ok: false, error: 'last_owner' });
  }
  db.admins = db.admins.filter((a) => a.id !== admin.id);
  db.sessions = db.sessions.filter((s) => s.adminId !== admin.id);
  persist();
  audit(req.admin, 'admin.delete', admin.email, req);
  res.json({ ok: true });
});

app.post('/api/admin/config', requireAdmin, requirePermission('config'), requireCsrfHeader, (req, res) => {
  const languages = Array.isArray(req.body?.languages)
    ? req.body.languages.filter((l) => ['en', 'ar'].includes(l))
    : db.config.languages;
  if (!languages.length) return res.status(400).json({ ok: false, error: 'no_language' });
  db.config.languages = Array.from(new Set(languages));
  persist();
  audit(req.admin, 'config.update', `languages: ${db.config.languages.join(', ')}`, req);
  res.json({ ok: true, config: db.config });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, error: 'not_found' });
});

/* ------------------------------------------------------------ static files */

if (!fs.existsSync(DIST)) {
  app.get('/', (_req, res) => {
    res
      .status(503)
      .type('text/plain')
      .send('Build output missing. Run "npm run build" before "npm start".');
  });
} else {
  app.use(
    '/assets',
    express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y' }),
  );
  app.use(
    '/data',
    express.static(path.join(DIST, 'data'), {
      maxAge: '7d',
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=604800');
      },
    }),
  );
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));

  app.get('/', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(DIST, 'index.html'));
  });

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RIFQ Muslim listening on http://0.0.0.0:${PORT}`);
  console.log(`[rifq] data store: ${STORE_FILE}`);
  if (!adminConfigured() && db.admins.length === 0) {
    console.warn(
      '[rifq] Admin dashboard disabled: set ADMIN_EMAIL and ADMIN_PASSWORD to enable the owner account.',
    );
  }
});

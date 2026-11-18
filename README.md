# RIFQ Muslim · رِفْق مسلم

A calm, installable Islamic PWA: Quran with authentic Arabic text and translation, prayer times, Qibla compass, digital Tasbih, daily Duas, authentic Hadith, Hijri calendar, bookmarks and user settings — in English and Arabic with full RTL support.

Built with **React + TypeScript + Vite**, **Supabase Free** (auth + database) and deployable to any free static/Node host.

## Features

| Feature | What it does |
| --- | --- |
| Quran | All 114 surahs (6,236 ayahs) with Uthmani Arabic text and Sahih International translation, search, bookmarking and adjustable Arabic size |
| Prayer times | Computed on-device (no API keys) with selectable calculation method, Asr madhab, location or preset city, next-prayer countdown and a monthly table |
| Qibla | Great-circle bearing to the Kaaba with a live compass (device orientation) and distance readout |
| Tasbih | Large tap counter, 33/99/100 targets, dhikr selection, vibration, session history |
| Duas | Categorised authentic supplications with Arabic, transliteration, translation and source |
| Hadith | Curated authentic hadith with Arabic, translation, grading and reference, searchable by category |
| Hijri calendar | Hijri month grid with Gregorian mapping and Islamic occasions |
| Bookmarks | Save ayahs, duas and hadith; stored locally and synced to Supabase when signed in |
| Settings | Language (EN/AR + RTL), theme, Arabic font size, translation toggle, prayer method, install prompt |

## Authentication

Email + password sign up, sign in, sign out, forgot password, password reset, profile editing and persistent sessions.

Two modes, chosen automatically:

- **Cloud mode** — when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. Accounts, bookmarks, settings and tasbih sessions live in Supabase with row-level security.
- **On-device mode** — when they are empty. Accounts are stored only in this browser/device (password hashed with PBKDF2-SHA-256, 210k iterations) so the app is fully usable without any configuration. Data never leaves the device.

## Setup (5 minutes, all free)

### 1. Supabase Free project

1. Create a project at [supabase.com](https://supabase.com) (Free plan — no card required).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates `profiles`, `bookmarks`, `user_settings`, `tasbih_sessions`, enables RLS for each and adds the new-user trigger.
3. **Authentication → Providers → Email**: enable Email. For instant testing turn *Confirm email* off; leave it on for production (the app shows a "check your inbox" message).
4. **Authentication → URL Configuration**: set *Site URL* to your deployed URL and add `<your-url>/auth/reset` to the redirect allow-list so password reset links work.
5. **Project Settings → API**: copy the Project URL and the `anon` public key.

### 2. Environment variables

```bash
cp .env.example .env
# then fill in
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

In AppJet, add the same two names in **Settings → Environment variables**. Both are optional: without them the app runs in on-device mode.

Only the public `anon` key is used — it is safe for browsers because every table is protected by row-level security. Never add the service-role key.

### 3. Run locally

```bash
npm install
npm run dev     # http://localhost:5173
```

### 4. Production

```bash
npm run build   # type-check + Vite build into dist/
npm start       # Express serves dist/ and the API on $PORT (default 3000)
```

## Deployment

- **AppJet hosting** — `Dockerfile` builds and serves the PWA on port 3000 (non-root, Alpine).
- **Cloudflare Pages** (free) — build command `npm run build`, output directory `dist`. Add the two `VITE_*` variables in *Settings → Environment variables*, then add the Pages URL to Supabase redirect URLs.

The service worker (`public/sw.js`) caches the app shell plus `data/quran.json` and `data/hadith.json`, so the Quran and Hadith read offline after the first visit. Supabase requests are never cached.

## Install on a phone (Add to Home Screen)

- **Android / Chrome**: open the site → menu → *Install app* (or use the in-app install banner).
- **iPhone / Safari**: Share → *Add to Home Screen*. iOS does not support the automatic install prompt, so the app shows these instructions instead.

## Data integrity

Nothing is generated or paraphrased. Bundled content comes from:

- **Quran Arabic** — Tanzil Uthmani text; **translation** — Sahih International, both fetched by `scripts/fetch-quran.mjs`.
- **Hadith** — Hadeeth Encyclopedia (hadeethenc.com) API via `scripts/fetch-hadith.mjs`, keeping only authentically graded entries (sahih/hasan) with their reference and grade.
- **Duas** — Quranic and well-known prophetic supplications with references in `src/data/duas.ts`.
- **Prayer times / Qibla / Hijri** — computed locally (`src/lib/prayer.ts`, `src/lib/qibla.ts`) using standard astronomical formulas and the Umm al-Qura calendar; no paid or rate-limited API.

Refresh the bundled data at any time:

```bash
npm run data:quran
npm run data:hadith
```

## Privacy

No analytics, no ads, no subscriptions, no third-party trackers. Location is used only in the browser for prayer times and the Qibla bearing and is never uploaded.

## Project structure

```
public/            manifest, service worker, icons, bundled Quran + Hadith JSON
src/lib/           auth, supabase client, prayer, qibla, hijri, i18n, store, router
src/pages/         Home, Quran, Prayer, Qibla, Tasbih, Duas, Hadith, Calendar, Bookmarks, Settings, Profile, Auth
src/components/    Icons, InstallBanner
supabase/schema.sql
server.js          production server (static dist + /api/health)
```

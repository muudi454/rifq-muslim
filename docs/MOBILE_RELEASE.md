# RIFQ Muslim — Android & iOS release preparation

**Status:** the web app and PWA are complete and deployable. Native **AAB/IPA packages are not built in this environment** and the app is **not published** on Google Play or the App Store. Nothing in this document claims store approval.

## What already exists

| Item | Status |
| --- | --- |
| Installable PWA (Add to Home Screen) | Ready — `public/manifest.webmanifest`, `public/sw.js` |
| App icons (192, 512, maskable, Apple touch, SVG) | Ready — `public/icons/` |
| Splash / theme colours | Ready — emerald `#0F5132`, gold `#B88F2D` |
| Privacy policy page | Ready — `/privacy` |
| Store descriptions (EN + AR) | Ready — `docs/STORE_LISTING.md` |
| Native shell configuration | Ready — `capacitor.config.ts` |
| Android AAB | **Not built** (no Android SDK/JDK in this environment) |
| iOS IPA | **Not built** (requires macOS + Xcode, unavailable here) |
| Play Store / App Store submission | **Not done** |

## Why native packages cannot be produced here

* Android: needs the Android SDK, build-tools and a signing keystore. This sandbox has no Android SDK and native compilation is out of scope.
* iOS: Apple requires macOS with Xcode and a paid Apple Developer account. This is impossible to run in a Linux sandbox and impossible for you to sign without your own account.

The Capacitor configuration and all web assets are ready, so packaging is a local build step on your machine — no application code changes are needed.

## Prerequisites (on your machine)

* Node.js 20 or newer, plus this repository
* **Android:** Android Studio (with JDK 17) and a Google Play Developer account (one-time $25)
* **iOS:** macOS 14+, Xcode 15+, an Apple Developer Program membership ($99/year)
* A signing keystore for Android (keep it and its passwords safe; losing it blocks future updates)

## Build steps

```bash
# 1. Install and build the web assets
npm ci
npm run build                     # produces dist/

# 2. Add the native platforms (one time)
npm i -D @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios                   # macOS only

# 3. Sync the built web app into both platforms after every build
npx cap sync

# 4. Generate native icons and splash from the existing PNG assets
npm i -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0F5132' --splashBackgroundColor '#0F5132'
```

### Android AAB

1. `npx cap open android` → Android Studio.
2. Set `versionCode` / `versionName` in `android/app/build.gradle`.
3. **Build → Generate Signed Bundle / APK → Android App Bundle**, create or select your keystore.
4. Upload `android/app/release/app-release.aab` to the Play Console.

### iOS IPA

1. `npx cap open ios` → Xcode.
2. Select your team under *Signing & Capabilities*, set the bundle identifier `com.rifqmuslim.app`.
3. *Product → Archive*, then *Distribute App → App Store Connect*.
4. Upload the resulting build through Xcode Organizer or Transporter.

## Notifications in the native build

The Athan engine (`src/lib/athan.ts`) already computes each prayer time from the user's real coordinates and calculation method, with per-prayer switches, sound choice, a Fajr-specific sound and optional pre-prayer reminders.

* **PWA / web push:** works where the browser allows it, including when the tab is in the background (service worker `push` handler is in `public/sw.js`). iOS Safari only delivers web push to apps added to the Home Screen (iOS 16.4+), and the user must grant permission.
* **Native:** for guaranteed background delivery, schedule the same computed times with `@capacitor/local-notifications` (install it, then request permission and schedule each prayer). Add `POST_NOTIFICATIONS` and, for exact timing, `SCHEDULE_EXACT_ALARM` to `android/app/src/main/AndroidManifest.xml`; on iOS add the notification capability in Xcode. Battery-optimisation settings on some Android phones can still delay or drop notifications — this is a device limitation, not an app defect.

## Store requirements checklist

* [x] Privacy policy (`/privacy`) — needs a public URL after deployment
* [x] App icon 512×512 PNG and 1024×1024 for iOS
* [x] Splash background colour and app name
* [ ] Phone screenshots — capture from a real device or emulator after the native build (Play: min 2, 1080×1920 recommended; App Store: 6.7" and 6.1" sets)
* [x] Store descriptions — see `docs/STORE_LISTING.md`
* [ ] Data safety / App privacy questionnaire (declare: optional email account, contact form, device location for prayer times, no ads, no tracking)
* [ ] Content rating questionnaire (Islamic religious content, no user-generated public content)
* [ ] Signed AAB / IPA

## Honest limitations

* Native compilation, signing, screenshots from a device and store submission are **not possible in this environment**; they must be done on your own machine and developer accounts.
* Store review is controlled by Google and Apple. The app should be described as **prepared for submission**, never as published, until both stores approve it.

## Why the home-screen icon looked like Chrome

Chrome on Android installs a site in one of three ways, and only the second gives a
real RIFQ Muslim icon, splash screen and standalone window:

| Result | What Chrome creates | How to tell |
| --- | --- | --- |
| Plain shortcut | A bookmark icon on the launcher. Chrome shows its own logo or a tiny favicon because no manifest icon was used. | Opens inside Chrome with the address bar visible. |
| **WebAPK** (the real PWA install) | An Android app package generated by Google Play Services from the web manifest. | Own icon, own splash screen, no address bar, appears in Android Settings → Apps. |
| Native app | An APK/AAB you built and signed yourself. | Installed from Google Play or a downloaded `.aab`/`.apk`. |

Chrome only generates a WebAPK when every installability rule passes at the moment
the user taps **Install**:

1. HTTPS with no certificate errors (the AppJet deployment URL is HTTPS).
2. `manifest.webmanifest` served with a manifest JSON content type — `server.js`
   sets `application/manifest+json` so the file is never served as plain text.
3. `name`, `short_name`, `start_url`, `display` set to `standalone` (or `fullscreen`/`minimal-ui`).
4. A **192×192** and a **512×512** PNG icon, plus a `purpose: "maskable"` icon so the
   launcher can crop to its own shape.
5. A registered service worker that handles `fetch` — `public/sw.js` does.

If Chrome was used before the manifest/icons were corrected, the old shortcut keeps
its old icon. Uninstall the shortcut from the launcher, open the live URL in Chrome
again and use **Install app** (menu ⋮ → *Add to Home screen* is enough only when the
install prompt is available). Nothing needs to be rebuilt for that.

So: the current build is a **PWA (WebAPK once Chrome installs it)** — not a native
Android app. A native Android build only exists after the steps in the AAB section
above are run on a machine with the Android SDK, and it becomes a "real" store app
only after Google Play approves it.

## The launch sequence, and where the Chrome logo comes from

Launching an installed RIFQ Muslim PWA passes through four frames:

1. **Chrome's own launch screen** — drawn by Chrome/Google Play Services before a
   single byte of the app runs. For a WebAPK this is generated by Android from the
   manifest: a solid window background plus the app icon on top. This is the frame
   that shows the Chrome logo when the install is a *shortcut* rather than a WebAPK.
2. **RIFQ Muslim launch screen** — the `#launch-splash` block in `index.html`.
   It is plain HTML/CSS in the document head, so it paints before the JavaScript
   bundle is downloaded or parsed: emerald gradient, gold crescent, "RIFQ Muslim",
   the Arabic name and the developer credit.
3. **First React paint** — `main.tsx` removes the splash after two animation frames
   and fades it out over ~0.5 s. There is no white flash because the body background
   is the same emerald as the splash.
4. **App UI** — the Home screen.

Frame 1 is the only one the app cannot paint itself, and it is exactly the frame the
user described. What can and cannot be changed from the web app:

| Frame | Controlled by | Can the web app fix it? |
| --- | --- | --- |
| Chrome logo / blank window at launch | Chrome + the Android WebAPK shell (and, on some OEM launchers, the launcher's own window animation) | **No.** It is drawn by Chrome before the page loads. |
| Splash background colour and icon for a WebAPK | The manifest (`background_color`, `theme_color`, 512 icon) | **Yes** — this is what we configure. |
| The gap between the Android splash and the app UI | `index.html` + `main.tsx` | **Yes** — the branded launch screen covers it. |

So the Chrome logo at launch has two distinct causes, with two different fixes:

* **The install is a shortcut, not a WebAPK.** Chrome's own icon is used because no
  Android package was generated. Fix: uninstall the shortcut, open the live URL in
  Chrome, and use **Install app**. Reinstalling after a manifest change is required
  because Chrome bakes the icons and splash into the installed package.
* **It is already a WebAPK but shows Chrome branding.** Some Chrome versions draw
  their own launch animation before handing over, and this cannot be styled away.
  The only way to fully replace that frame is a **native Android package** (an AAB
  with a native splash theme and a Trusted Web Activity or a bundled WebView), built
  as described above.

### Native splash configuration (for the AAB)

If you build the native package, set the Android 12+ splash API so the very first
frame is already RIFQ Muslim:

```xml
<!-- android/app/src/main/res/values/styles.xml -->
<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
  <item name="windowSplashScreenBackground">@color/rifq_emerald</item>
  <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>
  <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
</style>
```

```xml
<!-- android/app/src/main/res/values/colors.xml -->
<color name="rifq_emerald">#065F46</color>
<color name="rifq_gold">#C9A227</color>
```

`npx capacitor-assets generate --iconBackgroundColor '#065F46' --splashBackgroundColor '#065F46'`
produces the launcher icons and splash bitmaps from `public/icons/icon-512.png`.
Only a native build can guarantee that Chrome's own launch frame never appears.

## Notification branding and its one hard limit

All app notifications are raised through `src/lib/notify.ts` (client) and
`public/sw.js` (push), so title, icon, badge and tap destination are consistent:

| Category | Title shown | Opens |
| --- | --- | --- |
| `athan` | RIFQ Muslim – Athan | `/prayer` |
| `quran` | RIFQ Muslim – Quran Audio | `/quran` |
| `dua` | RIFQ Muslim – Daily Dua | `/duas` |
| `reminder` | RIFQ Muslim – Prayer Reminder | `/notifications` |
| `hadith` | RIFQ Muslim – Hadith | `/hadith` |
| `daily` | RIFQ Muslim – Daily Reminder | `/` |

Channels exposed to the platform: **RIFQ Muslim Athan**, **RIFQ Muslim Quran Audio**
and **RIFQ Muslim Reminders**. Development hosts (`*.ap-jt.com`, `localhost`,
`127.0.0.1`) are stripped from notification text in both the client and the service
worker, so a temporary project URL can never appear in a notification.

**The limitation, stated plainly:** in a browser-delivered (web push) notification,
Android prints a small line with the **site origin** under the notification — for
example `ovd6yt3g8d.dev.ap-jt.com` — and Chrome's notification settings list the site
by its URL. The app cannot remove that line: it is rendered by Android's system
notification UI from the origin that pushed the message. Two things reduce it:

* a short, official domain instead of a temporary `*.ap-jt.com` host (requires a
  custom domain, which is a paid AppJet feature);
* a **native Android build**, where notifications are posted by the app's own
  package (`com.rifqmuslim.app`) with a native notification channel, so Android shows
  "RIFQ Muslim" and the RIFQ Muslim icon instead of a URL.

Until a native package exists, everything inside the notification (title, body,
icon, badge, tap target, grouping) is fully RIFQ Muslim, and the origin line remains
a platform-rendered detail.


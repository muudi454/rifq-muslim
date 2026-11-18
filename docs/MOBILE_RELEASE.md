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

import type { CapacitorConfig } from '@capacitor/cli';

/**
 * RIFQ Muslim — native shell configuration.
 *
 * The web app is already a PWA. Wrapping the built `dist/` folder gives the
 * Android (AAB) and iOS (IPA) packages without changing any application code.
 * Build steps and prerequisites are documented in docs/MOBILE_RELEASE.md.
 */
const config: CapacitorConfig = {
  appId: 'com.rifqmuslim.app',
  appName: 'RIFQ Muslim',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    backgroundColor: '#0F5132',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0F5132',
    limitsNavigationsToAppBoundDomains: false,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#0F5132',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_rifq',
      iconColor: '#B88F2D',
    },
  },
};

export default config;

# RIFQ Muslim — store listing pack

Ready-to-paste metadata for Google Play and the Apple App Store. Nothing here implies the app is published; submission and approval are separate steps owned by you.

## Identity

| Field | Value |
| --- | --- |
| App name | RIFQ Muslim |
| Arabic name | رِفْق مسلم |
| Bundle / package ID | `com.rifqmuslim.app` |
| Category | Lifestyle (secondary: Education) |
| Content rating | Everyone / 4+ — religious content, no ads, no public user content |
| Price | Free, no in-app purchases, no subscriptions |
| Developer credit | Made by Eng Mohamud Yusuf |
| Support email | mohamoudistanbul@gmail.com |
| Support phone | +252-612215593 |
| Privacy policy | `https://<your-domain>/privacy` |

## Short description (Play, 80 chars max)

```
Quran, prayer times, Qibla, Athan alerts, duas and Hadith — free, no ads.
```

## Full description (English)

```
RIFQ Muslim is a calm, ad-free companion for your daily worship.

QURAN — Read the complete Quran in authentic Arabic text with translations, page-by-page navigation and bookmarks that follow you between devices.

PRAYER TIMES & ATHAN — Accurate times for Fajr, Dhuhr, Asr, Maghrib and Isha computed from your own GPS position or a city you choose. Choose from several recognised calculation methods and the Shafi'i or Hanafi madhab. Turn the Athan on or off for each prayer separately, pick from multiple Athan recordings, set a different sound for Fajr, and add optional reminders before the prayer begins.

QIBLA — A live compass that points to the Kaaba using your real coordinates, with a clear bearing readout and distance to Makkah.

WORLDWIDE LOCATION — Every country, city, town and village is supported, with country flags, capitals, region names, real coordinates and time zones. If GPS is unavailable you can search any place or enter coordinates manually.

DUAS & HADITH — Authentic daily supplications and verified Hadith, in Arabic with English translation.

HIJRI CALENDAR, TASBIH & BOOKMARKS — A digital counter that keeps your dhikr sessions, a Hijri calendar, and bookmarks for verses and duas.

LANGUAGES & DESIGN — Full Arabic and English interfaces with complete right-to-left support, in an emerald green, gold and white Islamic design.

PRIVACY — No advertisements, no subscriptions, no tracking for advertising. Your location is used only to calculate prayer times and Qibla on your device.

Made by Eng Mohamud Yusuf.
```

## Full description (Arabic)

```
رِفْق مسلم رفيقك الهادئ في عبادتك اليومية، بلا إعلانات وبلا اشتراكات.

القرآن الكريم — اقرأ القرآن كاملاً بالنص العربي الأصيل مع الترجمة والتنقل صفحة بصفحة والعلامات المرجعية.

مواقيت الصلاة والأذان — مواقيت دقيقة للفجر والظهر والعصر والمغرب والعشاء تُحسب من موقعك الفعلي عبر نظام تحديد المواقع أو من مدينة تختارها. اختر من عدة طرق حساب معتمدة ومن مذهب الشافعي أو الحنفي. شغّل الأذان أو أوقفه لكل صلاة على حدة، واختر من عدة تسجيلات للأذان، وخصّص صوتاً للفجر، وأضف تذكيراً اختيارياً قبل الصلاة.

اتجاه القبلة — بوصلة حيّة تشير إلى الكعبة باستخدام إحداثياتك الحقيقية، مع درجة الاتجاه والمسافة إلى مكة المكرمة.

المواقع حول العالم — جميع الدول والمدن والقرى مدعومة، مع أعلام الدول والعواصم وأسماء المناطق والإحداثيات الحقيقية والمناطق الزمنية. وإذا تعذّر تحديد الموقع يمكنك البحث عن أي مكان أو إدخال الإحداثيات يدوياً.

الأدعية والأحاديث — أدعية يومية وأحاديث موثّقة بالعربية مع الترجمة الإنجليزية.

التقويم الهجري والمسبحة والعلامات المرجعية — عدّاد رقمي يحفظ جلسات الذكر، وتقويم هجري، وعلامات مرجعية للآيات والأدعية.

اللغات والتصميم — واجهة عربية وإنجليزية كاملة مع دعم كامل للكتابة من اليمين إلى اليسار، بتصميم إسلامي بالأخضر الزمردي والذهبي والأبيض.

الخصوصية — لا إعلانات ولا اشتراكات ولا تتبّع إعلاني. يُستخدم موقعك فقط لحساب مواقيت الصلاة والقبلة على جهازك.

من إعداد المهندس محمود يوسف.
```

## Keywords / tags

`Quran, prayer times, Athan, adhan, Qibla, duas, Hadith, tasbih, Hijri calendar, Muslim, Islam, Ramadan, adhkar`

## Screenshot plan (to capture after the native build)

| Store | Requirement | Screens to capture |
| --- | --- | --- |
| Play | min 2, up to 8 — 1080×1920 (9:16) | Home, Prayer times + Athan settings, Qibla compass, Quran reader |
| App Store | 6.7" (1290×2796) and 6.1" (1179×2556) sets | Same four screens, Arabic and English |

Feature graphic (Play): 1024×500, emerald background with the gold crest.
App icon: 512×512 PNG (already in `public/icons/icon-512.png`), iOS 1024×1024 without transparency.

## Data safety / privacy answers

* Location: collected **on device** to compute prayer times and Qibla; not sold or shared for advertising. Sent to a geocoding service only when you press GPS or search a place, to name that place.
* Account: optional email and password if the user signs in; stored with Supabase (or locally if not configured).
* Contact form: name, email, subject and message are sent to the developer to answer the enquiry.
* No ads, no third-party analytics, no tracking identifiers.

## Submission checklist

* [ ] Signed AAB uploaded to Play Console
* [ ] IPA uploaded to App Store Connect
* [ ] Privacy policy URL set to the deployed `/privacy` page
* [ ] Data safety / App privacy questionnaire completed from the section above
* [ ] Content rating questionnaire completed
* [ ] Screenshots captured from the native build
* [ ] Store review completed and approved

Until every box is ticked, describe RIFQ Muslim as **prepared for release**, not published.

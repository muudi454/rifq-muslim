import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'ar';

type Entry = [en: string, ar: string];

/** Every UI string in the app, English and Arabic. */
const dict: Record<string, Entry> = {
  'app.name': ['RIFQ Muslim', 'رِفْق مسلم'],
  'app.tagline': ['Companion for your daily worship', 'رفيقك في عبادتك اليومية'],
  'app.salam': ['As-salamu alaykum', 'السلام عليكم'],

  'nav.home': ['Home', 'الرئيسية'],
  'nav.quran': ['Quran', 'القرآن'],
  'nav.notifications': ['Athan', 'الأذان'],
  'nav.contact': ['Contact', 'اتصل بنا'],
  'nav.privacy': ['Privacy', 'الخصوصية'],
  'nav.admin': ['Admin', 'الإدارة'],
  'nav.prayer': ['Prayer', 'الصلاة'],
  'nav.qibla': ['Qibla', 'القبلة'],
  'nav.tasbih': ['Tasbih', 'التسبيح'],
  'nav.duas': ['Duas', 'الأدعية'],
  'nav.hadith': ['Hadith', 'الحديث'],
  'nav.calendar': ['Calendar', 'التقويم'],
  'nav.bookmarks': ['Bookmarks', 'المحفوظات'],
  'nav.settings': ['Settings', 'الإعدادات'],
  'nav.more': ['More', 'المزيد'],

  'auth.signIn': ['Sign in', 'تسجيل الدخول'],
  'auth.signUp': ['Create account', 'إنشاء حساب'],
  'auth.signOut': ['Sign out', 'تسجيل الخروج'],
  'auth.email': ['Email', 'البريد الإلكتروني'],
  'auth.password': ['Password', 'كلمة المرور'],
  'auth.confirmPassword': ['Confirm password', 'تأكيد كلمة المرور'],
  'auth.fullName': ['Full name', 'الاسم الكامل'],
  'auth.forgot': ['Forgot password?', 'هل نسيت كلمة المرور؟'],
  'auth.resetTitle': ['Reset your password', 'استعادة كلمة المرور'],
  'auth.resetHelp': [
    'Enter your email and we will send a reset link.',
    'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
  ],
  'auth.sendReset': ['Send reset link', 'إرسال رابط الاستعادة'],
  'auth.resetSent': [
    'Check your inbox for the reset link.',
    'تفقّد بريدك الإلكتروني للحصول على رابط الاستعادة.',
  ],
  'auth.newPassword': ['New password', 'كلمة المرور الجديدة'],
  'auth.updatePassword': ['Update password', 'تحديث كلمة المرور'],
  'auth.passwordUpdated': ['Password updated.', 'تم تحديث كلمة المرور.'],
  'auth.haveAccount': ['Already have an account?', 'لديك حساب بالفعل؟'],
  'auth.noAccount': ['New to RIFQ Muslim?', 'جديد على رِفْق مسلم؟'],
  'auth.welcome': ['Welcome back', 'مرحبًا بعودتك'],
  'auth.createTitle': ['Begin your journey', 'ابدأ رحلتك'],
  'auth.profile': ['Profile', 'الملف الشخصي'],
  'auth.guest': ['Guest', 'زائر'],
  'auth.signedInAs': ['Signed in as', 'مسجّل الدخول باسم'],
  'auth.confirmEmail': [
    'Account created. Check your email to confirm it, then sign in.',
    'تم إنشاء الحساب. تحقّق من بريدك لتأكيده ثم سجّل الدخول.',
  ],
  'auth.required': ['Sign in to sync your bookmarks.', 'سجّل الدخول لمزامنة محفوظاتك.'],
  'auth.localResetUnavailable': [
    'Password reset links need Supabase. In on-device mode your password is stored only on this phone.',
    'روابط استعادة كلمة المرور تحتاج Supabase. في وضع الجهاز تُحفظ كلمة المرور على هذا الهاتف فقط.',
  ],
  'auth.localPasswordUnavailable': [
    'In on-device mode your password is stored locally. Connect Supabase to change it securely.',
    'في وضع الجهاز تُحفظ كلمة المرور محليًا. اربط Supabase لتغييرها بأمان.',
  ],
  'auth.localMode': ['On-device account', 'حساب على الجهاز'],
  'auth.localModeHelp': [
    'Supabase is not connected, so accounts and data stay on this device only. Connect Supabase to sync across devices.',
    'لم يتم ربط Supabase، لذا يبقى الحساب والبيانات على هذا الجهاز فقط. اربط Supabase للمزامنة بين الأجهزة.',
  ],
  'auth.cloudMode': ['Cloud account', 'حساب سحابي'],
  'auth.cloudModeHelp': [
    'Secured by Supabase. Your bookmarks and settings sync to every device.',
    'محمي بواسطة Supabase. تُزامن محفوظاتك وإعداداتك على كل أجهزتك.',
  ],

  'common.save': ['Save', 'حفظ'],
  'common.saved': ['Saved', 'تم الحفظ'],
  'common.cancel': ['Cancel', 'إلغاء'],
  'common.delete': ['Delete', 'حذف'],
  'common.close': ['Close', 'إغلاق'],
  'common.back': ['Back', 'رجوع'],
  'common.loading': ['Loading…', 'جارٍ التحميل…'],
  'common.search': ['Search', 'بحث'],
  'common.error': ['Something went wrong.', 'حدث خطأ ما.'],
  'common.retry': ['Try again', 'إعادة المحاولة'],
  'common.offline': ['You are offline — cached content is shown.', 'أنت غير متصل — يتم عرض المحتوى المحفوظ.'],
  'common.install': ['Install app', 'تثبيت التطبيق'],
  'common.installed': ['Installed', 'مثبّت'],
  'common.copy': ['Copy', 'نسخ'],
  'common.copied': ['Copied', 'تم النسخ'],
  'common.all': ['All', 'الكل'],
  'common.none': ['None', 'لا شيء'],
  'common.empty': ['Nothing here yet.', 'لا يوجد شيء بعد.'],
  'common.optional': ['optional', 'اختياري'],
  'common.today': ['Today', 'اليوم'],
  'common.viewAll': ['View all', 'عرض الكل'],
  'common.minutes': ['min', 'دقيقة'],
  'common.hours': ['h', 'ساعة'],
  'common.next': ['Next', 'التالي'],
  'common.pause': ['Pause', 'إيقاف مؤقت'],

  'home.greetingMorning': ['Good morning', 'صباح الخير'],
  'home.greetingAfternoon': ['Good afternoon', 'طاب نهارك'],
  'home.greetingEvening': ['Good evening', 'طاب مساؤك'],
  'home.nextPrayer': ['Next prayer', 'الصلاة القادمة'],
  'home.timeLeft': ['remaining', 'متبقٍ'],
  'home.dailyAyah': ['Ayah of the day', 'آية اليوم'],
  'home.dailyHadith': ['Hadith of the day', 'حديث اليوم'],
  'home.dailyDua': ['Dua of the day', 'دعاء اليوم'],
  'home.quick': ['Quick access', 'وصول سريع'],
  'home.streak': ['Tasbih today', 'تسبيح اليوم'],
  'home.openQuran': ['Continue reading', 'واصل القراءة'],
  'home.hijriToday': ['Hijri date', 'التاريخ الهجري'],

  'quran.title': ['The Noble Quran', 'القرآن الكريم'],
  'quran.search': ['Search surah name or number', 'ابحث باسم السورة أو رقمها'],
  'quran.meccan': ['Meccan', 'مكية'],
  'quran.medinan': ['Medinan', 'مدنية'],
  'quran.ayahs': ['ayahs', 'آية'],
  'quran.surah': ['Surah', 'سورة'],
  'quran.ayah': ['Ayah', 'آية'],
  'quran.translation': ['Translation', 'الترجمة'],
  'quran.showTranslation': ['Show translation', 'إظهار الترجمة'],
  'quran.hideTranslation': ['Hide translation', 'إخفاء الترجمة'],
  'quran.play': ['Play recitation', 'تشغيل التلاوة'],
  'quran.bookmark': ['Bookmark ayah', 'حفظ الآية'],
  'quran.bookmarked': ['Bookmarked', 'محفوظة'],
  'quran.jump': ['Go to ayah', 'الانتقال إلى آية'],
  'quran.prev': ['Previous surah', 'السورة السابقة'],
  'quran.next': ['Next surah', 'السورة التالية'],
  'quran.bismillah': ['In the name of Allah, the Most Gracious, the Most Merciful', 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'],
  'quran.source': [
    'Arabic: Tanzil Uthmani text · Translation: Sahih International',
    'النص العربي: مصحف تنزيل بالرسم العثماني · الترجمة: صحيح إنترناشونال',
  ],

  'prayer.title': ['Prayer times', 'أوقات الصلاة'],
  'prayer.fajr': ['Fajr', 'الفجر'],
  'prayer.sunrise': ['Sunrise', 'الشروق'],
  'prayer.dhuhr': ['Dhuhr', 'الظهر'],
  'prayer.asr': ['Asr', 'العصر'],
  'prayer.maghrib': ['Maghrib', 'المغرب'],
  'prayer.isha': ['Isha', 'العشاء'],
  'prayer.method': ['Calculation method', 'طريقة الحساب'],
  'prayer.madhab': ['Asr madhab', 'مذهب العصر'],
  'prayer.shafii': ['Shafi‘i / Maliki / Hanbali', 'الشافعي / المالكي / الحنبلي'],
  'prayer.hanafi': ['Hanafi', 'الحنفي'],
  'prayer.location': ['Location', 'الموقع'],
  'prayer.useLocation': ['Use my location', 'استخدم موقعي'],
  'prayer.locating': ['Locating…', 'جارٍ تحديد الموقع…'],
  'prayer.manual': ['Enter a city', 'أدخل مدينة'],
  'prayer.manualHint': ['City name or latitude, longitude', 'اسم المدينة أو خط العرض، خط الطول'],
  'prayer.locationDenied': [
    'Location permission was denied. You can set a city manually.',
    'تم رفض إذن الموقع. يمكنك تحديد مدينة يدويًا.',
  ],
  'prayer.locationError': [
    'Could not detect your location. Please set a city manually.',
    'تعذّر تحديد موقعك. يرجى تحديد مدينة يدويًا.',
  ],
  'prayer.usingCity': ['Using', 'يُستخدم'],
  'prayer.monthly': ['This month', 'هذا الشهر'],
  'prayer.computed': [
    'Times are calculated astronomically on your device.',
    'تُحسب الأوقات فلكيًا على جهازك.',
  ],
  'prayer.passed': ['Passed', 'انتهت'],
  'prayer.now': ['Now', 'الآن'],

  'qibla.title': ['Qibla direction', 'اتجاه القبلة'],
  'qibla.help': [
    'Hold your phone flat and turn until the needle turns gold.',
    'أمسك هاتفك أفقيًا وأدره حتى يتحول المؤشر إلى الذهبي.',
  ],
  'qibla.enable': ['Enable compass', 'تفعيل البوصلة'],
  'qibla.bearing': ['Qibla bearing from north', 'اتجاه القبلة من الشمال'],
  'qibla.distance': ['Distance to Makkah', 'المسافة إلى مكة'],
  'qibla.aligned': ['You are facing the Qibla', 'أنت متجه إلى القبلة'],
  'qibla.turnRight': ['Turn right', 'أدر يمينًا'],
  'qibla.turnLeft': ['Turn left', 'أدر يسارًا'],
  'qibla.noCompass': [
    'Your device did not report a compass. Use the bearing above with a physical compass.',
    'لا يدعم جهازك البوصلة. استخدم الاتجاه أعلاه مع بوصلة عادية.',
  ],
  'qibla.needsLocation': [
    'Allow location access to calculate the Qibla for where you are.',
    'اسمح بالوصول إلى الموقع لحساب القبلة من مكانك.',
  ],

  'tasbih.title': ['Digital Tasbih', 'المسبحة الرقمية'],
  'tasbih.subhanallah': ['SubhanAllah', 'سُبْحَانَ اللَّه'],
  'tasbih.alhamdulillah': ['Alhamdulillah', 'الْحَمْدُ لِلَّه'],
  'tasbih.allahuakbar': ['Allahu Akbar', 'اللَّهُ أَكْبَر'],
  'tasbih.lailaha': ['La ilaha illa Allah', 'لَا إِلَهَ إِلَّا اللَّه'],
  'tasbih.astaghfirullah': ['Astaghfirullah', 'أَسْتَغْفِرُ اللَّه'],
  'tasbih.salawat': ['Salawat', 'الصلاة على النبي'],
  'tasbih.target': ['Target', 'الهدف'],
  'tasbih.reset': ['Reset', 'تصفير'],
  'tasbih.count': ['Count', 'العدد'],
  'tasbih.tap': ['Tap the circle to count', 'اضغط الدائرة للتسبيح'],
  'tasbih.completed': ['Target reached, may Allah accept.', 'بلغت الهدف، تقبّل الله.'],
  'tasbih.saved': ['Session saved', 'تم حفظ الجلسة'],
  'tasbih.history': ['Recent sessions', 'الجلسات الأخيرة'],
  'tasbih.vibrate': ['Vibration', 'الاهتزاز'],
  'tasbih.sound': ['Sound', 'الصوت'],
  'tasbih.noHistory': ['No sessions yet.', 'لا توجد جلسات بعد.'],

  'duas.title': ['Duas & Adhkar', 'الأدعية والأذكار'],
  'duas.categories.morning': ['Morning & evening', 'الصباح والمساء'],
  'duas.categories.daily': ['Daily life', 'الحياة اليومية'],
  'duas.categories.quran': ['From the Quran', 'من القرآن'],
  'duas.categories.distress': ['Distress & healing', 'الهم والشفاء'],
  'duas.categories.travel': ['Travel & food', 'السفر والطعام'],
  'duas.transliteration': ['Transliteration', 'النقل الحرفي'],
  'duas.reference': ['Reference', 'المصدر'],
  'duas.copy': ['Copy dua', 'نسخ الدعاء'],
  'duas.favorite': ['Save dua', 'حفظ الدعاء'],
  'duas.count': ['duas', 'أدعية'],

  'hadith.title': ['Authentic Hadith', 'الحديث الصحيح'],
  'hadith.search': ['Search hadith text', 'ابحث في نص الحديث'],
  'hadith.grade': ['Grade', 'الدرجة'],
  'hadith.reference': ['Reference', 'المرجع'],
  'hadith.attribution': ['Narrator', 'الراوي'],
  'hadith.random': ['Random hadith', 'حديث عشوائي'],
  'hadith.categories.manners': ['Virtues & manners', 'الأخلاق والفضائل'],
  'hadith.categories.creed': ['Creed', 'العقيدة'],
  'hadith.categories.fiqh': ['Jurisprudence', 'الفقه'],
  'hadith.categories.seerah': ['Seerah & history', 'السيرة والتاريخ'],
  'hadith.source': [
    'Source: Hadeeth Encyclopedia (hadeethenc.com), each entry graded and referenced.',
    'المصدر: موسوعة الحديث (hadeethenc.com)، وكل حديث مخرّج ومحكوم عليه.',
  ],
  'hadith.explanation': ['Explanation', 'الشرح'],
  'hadith.count': ['hadith', 'أحاديث'],

  'calendar.title': ['Hijri calendar', 'التقويم الهجري'],
  'calendar.hijri': ['Hijri', 'هجري'],
  'calendar.gregorian': ['Gregorian', 'ميلادي'],
  'calendar.todayIs': ['Today', 'اليوم'],
  'calendar.events': ['Islamic occasions', 'المناسبات الإسلامية'],
  'calendar.note': [
    'Hijri dates use the Umm al-Qura calendar of your browser. Local moon sighting may differ by a day.',
    'التواريخ الهجرية وفق تقويم أم القرى في متصفحك. قد تختلف رؤية الهلال محليًا بيوم واحد.',
  ],
  'calendar.months.1': ['Muharram', 'محرم'],
  'calendar.months.2': ['Safar', 'صفر'],
  'calendar.months.3': ['Rabi al-Awwal', 'ربيع الأول'],
  'calendar.months.4': ['Rabi al-Thani', 'ربيع الآخر'],
  'calendar.months.5': ['Jumada al-Awwal', 'جمادى الأولى'],
  'calendar.months.6': ['Jumada al-Thani', 'جمادى الآخرة'],
  'calendar.months.7': ['Rajab', 'رجب'],
  'calendar.months.8': ["Sha'ban", 'شعبان'],
  'calendar.months.9': ['Ramadan', 'رمضان'],
  'calendar.months.10': ['Shawwal', 'شوال'],
  'calendar.months.11': ["Dhu al-Qi'dah", 'ذو القعدة'],
  'calendar.months.12': ['Dhu al-Hijjah', 'ذو الحجة'],

  'bookmarks.title': ['Bookmarks', 'المحفوظات'],
  'bookmarks.empty': ['No bookmarks yet. Tap the bookmark icon on any ayah, dua or hadith.', 'لا توجد محفوظات بعد. اضغط أيقونة الحفظ على أي آية أو دعاء أو حديث.'],
  'bookmarks.ayahs': ['Ayahs', 'آيات'],
  'bookmarks.duas': ['Duas', 'أدعية'],
  'bookmarks.hadith': ['Hadith', 'أحاديث'],
  'bookmarks.removed': ['Bookmark removed', 'تم حذف الحفظ'],

  'settings.title': ['Settings', 'الإعدادات'],

  // ── Worldwide location ───────────────────────────────────────────
  'loc.title': ['Choose your location', 'اختر موقعك'],
  'loc.coverage': [
    '{countries} countries · {cities} cities and regions · works offline',
    '{countries} دولة · {cities} مدينة ومنطقة · يعمل دون اتصال',
  ],
  'loc.search': ['Search countries, cities or ISO codes', 'ابحث عن دولة أو مدينة أو رمز ISO'],
  'loc.searchPlaceholder': [
    'e.g. Somalia, Soomaaliya, SO, Mogadishu',
    'مثال: الصومال، SO، مقديشو',
  ],
  'loc.countries': ['All countries', 'جميع الدول'],
  'loc.cities': ['Matching cities', 'مدن مطابقة'],
  'loc.citiesCount': ['cities', 'مدينة'],
  'loc.useGps': ['Use my current location', 'استخدم موقعي الحالي'],
  'loc.gpsLocating': ['Detecting your location…', 'جارٍ تحديد موقعك…'],
  'loc.gpsDenied': [
    'Location permission was denied. You can still pick your country and city below, or enter coordinates by hand.',
    'تم رفض إذن الموقع. يمكنك اختيار دولتك ومدينتك أدناه أو إدخال الإحداثيات يدويًا.',
  ],
  'loc.gpsUnavailable': [
    'Your position could not be determined right now. Please choose a country and city, or enter coordinates by hand.',
    'تعذّر تحديد موقعك حاليًا. يرجى اختيار الدولة والمدينة أو إدخال الإحداثيات يدويًا.',
  ],
  'loc.gpsTimeout': [
    'Locating took too long. Try again, or choose your city manually.',
    'استغرق تحديد الموقع وقتًا طويلًا. حاول مرة أخرى أو اختر مدينتك يدويًا.',
  ],
  'loc.gpsError': [
    'Location is unavailable on this device. Manual selection works everywhere.',
    'خدمة الموقع غير متاحة على هذا الجهاز. الاختيار اليدوي يعمل دائمًا.',
  ],
  'loc.gpsFallback': [
    'No problem — every country and city below is available without GPS.',
    'لا مشكلة — جميع الدول والمدن أدناه متاحة دون الحاجة إلى GPS.',
  ],
  'loc.manual': ['Enter coordinates manually', 'إدخال الإحداثيات يدويًا'],
  'loc.manualHint': [
    'Latitude between -90 and 90, longitude between -180 and 180.',
    'خط العرض بين -90 و90، وخط الطول بين -180 و180.',
  ],
  'loc.latitude': ['Latitude', 'خط العرض'],
  'loc.longitude': ['Longitude', 'خط الطول'],
  'loc.invalidLat': [
    'Latitude must be a number between -90 and 90.',
    'يجب أن يكون خط العرض رقمًا بين -90 و90.',
  ],
  'loc.invalidLon': [
    'Longitude must be a number between -180 and 180.',
    'يجب أن يكون خط الطول رقمًا بين -180 و180.',
  ],
  'loc.saveManual': ['Save this location', 'حفظ هذا الموقع'],
  'loc.current': ['Current', 'الحالي'],
  'loc.change': ['Change location', 'تغيير الموقع'],
  'loc.none': ['No location chosen yet', 'لم يتم اختيار موقع بعد'],
  'loc.noResults': ['No country or city matches that search.', 'لا توجد دولة أو مدينة تطابق البحث.'],
  'loc.timezone': ['Time zone', 'المنطقة الزمنية'],
  'loc.country': ['Country', 'الدولة'],
  'loc.capital': ['Capital', 'العاصمة'],
  'loc.city': ['City', 'المدينة'],
  'loc.region': ['Region', 'المنطقة'],
  'loc.coordinates': ['Coordinates', 'الإحداثيات'],
  'loc.facts': ['Location details', 'تفاصيل الموقع'],
  'loc.identifying': ['Identifying your city and country…', 'جارٍ تحديد مدينتك ودولتك…'],
  'loc.gpsVerified': [
    'Your city, region and country were identified from your GPS position.',
    'تم تحديد مدينتك ومنطقتك ودولتك من موقع GPS الخاص بك.',
  ],
  'loc.gpsOffline': [
    'Your exact coordinates are saved. The city shown is the nearest one in the offline dataset because the place lookup could not be reached.',
    'تم حفظ إحداثياتك الدقيقة. المدينة المعروضة هي الأقرب في البيانات دون اتصال لأن خدمة تحديد المكان لم تكن متاحة.',
  ],
  'loc.accuracy': ['GPS accuracy', 'دقة GPS'],
  'loc.worldwideSearch': [
    'Any city, town or village worldwide (OpenStreetMap)',
    'أي مدينة أو بلدة أو قرية في العالم (OpenStreetMap)',
  ],
  'loc.searching': ['Searching worldwide…', 'جارٍ البحث في العالم…'],
  'loc.worldwideResults': ['Worldwide results', 'نتائج من جميع أنحاء العالم'],
  'loc.offlineSearch': [
    'Worldwide search needs internet right now. Every country and city bundled in the app still works offline.',
    'البحث العالمي يحتاج إلى الإنترنت الآن. جميع الدول والمدن المضمّنة في التطبيق تعمل دون اتصال.',
  ],
  'loc.choosePrompt': [
    'Pick your country and city — prayer times and Qibla follow your own coordinates.',
    'اختر دولتك ومدينتك — أوقات الصلاة والقبلة تتبع إحداثياتك.',
  ],
  'loc.close': ['Close', 'إغلاق'],
  'loc.detected': ['Location detected', 'تم تحديد الموقع'],
  'loc.worldwide': [
    'Worldwide coverage, 195 countries with ISO codes, flags and IANA time zones.',
    'تغطية عالمية: 195 دولة برموز ISO وأعلام ومناطق زمنية.',
  ],

  // ── Developer credit & app information ──────────────────────────
  'credit.madeBy': ['Made by Eng Mohamud Yusuf', 'Made by Eng Mohamud Yusuf'],
  'credit.role': ['Developer of RIFQ Muslim', 'مطوّر رِفْق مسلم'],
  'about.title': ['About RIFQ Muslim', 'عن رِفْق مسلم'],
  'about.subtitle': ['A free companion for your daily worship', 'رفيق مجاني لعبادتك اليومية'],
  'about.developer': ['Developer', 'المطوّر'],
  'about.version': ['Version', 'الإصدار'],
  'about.whatTitle': ['What the app does', 'ماذا يقدّم التطبيق'],
  'about.whatText': [
    'RIFQ Muslim brings the Quran, prayer times, Qibla, tasbih, duas, hadith and the Hijri calendar into one calm, installable app.',
    'يجمع رِفْق مسلم القرآن وأوقات الصلاة والقبلة والمسبحة والأدعية والأحاديث والتقويم الهجري في تطبيق واحد هادئ وقابل للتثبيت.',
  ],
  'about.locationTitle': ['Worldwide location', 'الموقع حول العالم'],
  'about.locationText': [
    'All 195 countries with ISO 3166-1 codes, flags, cities and regions are bundled in the app. Choose a place by search, use GPS, or enter coordinates manually — prayer times and Qibla are computed from those coordinates in the place\'s own time zone.',
    'جميع الدول الـ195 مع رموز ISO 3166-1 والأعلام والمدن والمناطق مضمنة داخل التطبيق. اختر مكانك بالبحث أو عبر GPS أو بإدخال الإحداثيات — وتُحسب أوقات الصلاة والقبلة من تلك الإحداثيات بتوقيت المكان نفسه.',
  ],
  'about.dataTitle': ['Sources', 'المصادر'],
  'about.dataQuran': [
    'Quran: Tanzil Uthmani text with the Sahih International translation.',
    'القرآن: نص مصحف تنزيل العثماني مع ترجمة صحيح إنترناشونال.',
  ],
  'about.dataHadith': [
    'Hadith: Hadeeth Encyclopedia (hadeethenc.com) with reference and grade.',
    'الحديث: موسوعة الحديث (hadeethenc.com) مع المرجع والدرجة.',
  ],
  'about.dataPrayer': [
    'Prayer times: computed on-device from solar positions, with several calculation methods and Asr madhhabs.',
    'أوقات الصلاة: تُحسب على الجهاز من مواقع الشمس، مع عدة طرق حساب ومذاهب للعصر.',
  ],
  'about.dataLocation': [
    'Location and time zones: bundled country/city dataset and the device IANA time-zone database. No paid API is used.',
    'الموقع والمناطق الزمنية: بيانات الدول والمدن المضمنة وقاعدة المناطق الزمنية في الجهاز. لا تُستخدم أي واجهة مدفوعة.',
  ],
  'about.freeTitle': ['Always free', 'مجاني دائمًا'],
  'about.freeText': [
    'No ads, no subscriptions and no paid tiers. Accounts and bookmarks stay yours.',
    'لا إعلانات ولا اشتراكات ولا خطط مدفوعة. حسابك ومحفوظاتك تبقى لك.',
  ],
  'about.thanks': ['Jazakum Allahu khayran for using RIFQ Muslim.', 'جزاكم الله خيرًا لاستخدامكم رِفْق مسلم.'],
  'settings.language': ['Language', 'اللغة'],
  'settings.english': ['English', 'الإنجليزية'],
  'settings.arabic': ['Arabic', 'العربية'],
  'settings.appearance': ['Appearance', 'المظهر'],
  'settings.light': ['Light', 'فاتح'],
  'settings.dark': ['Dark', 'داكن'],
  'settings.system': ['System', 'النظام'],
  'settings.arabicSize': ['Arabic text size', 'حجم النص العربي'],
  'settings.prayerSettings': ['Prayer calculation', 'حساب الصلاة'],
  'settings.account': ['Account', 'الحساب'],
  'settings.about': ['About', 'حول التطبيق'],
  'settings.dataSources': ['Data sources', 'مصادر البيانات'],
  'settings.version': ['Version', 'الإصدار'],
  'settings.reset': ['Reset local settings', 'تصفير الإعدادات المحلية'],
  'settings.saved': ['Settings saved', 'تم حفظ الإعدادات'],
  'settings.name': ['Display name', 'الاسم المعروض'],
  'settings.city': ['City', 'المدينة'],
  'settings.country': ['Country', 'الدولة'],
  'settings.profileSaved': ['Profile saved', 'تم حفظ الملف الشخصي'],
  'settings.changePassword': ['Change password', 'تغيير كلمة المرور'],
  'settings.deleteAccount': ['Delete account', 'حذف الحساب'],
  'settings.deleteWarning': [
    'This removes your account and all synced data. This cannot be undone.',
    'سيؤدي هذا إلى حذف حسابك وكل بياناتك المزامنة، ولا يمكن التراجع.',
  ],
  'settings.notifications': ['Reminders', 'التذكيرات'],
  'settings.remindersHelp': [
    'Adhan reminders are not enabled in this version.',
    'تنبيهات الأذان غير مفعّلة في هذا الإصدار.',
  ],
  'settings.offline': ['Offline ready', 'جاهز دون اتصال'],

  'install.title': ['Install RIFQ Muslim', 'ثبّت رِفْق مسلم'],
  'install.help': [
    'Add it to your home screen for a full-screen, offline-friendly experience.',
    'أضفه إلى الشاشة الرئيسية لتجربة ملء الشاشة تعمل دون اتصال.',
  ],
  'install.ios': [
    'On iPhone: tap the Share button in Safari, then "Add to Home Screen".',
    'على iPhone: اضغط زر المشاركة في Safari ثم "إضافة إلى الشاشة الرئيسية".',
  ],
  'install.android': [
    'On Android: open the browser menu, then "Install app" or "Add to Home screen".',
    'على Android: افتح قائمة المتصفح ثم "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".',
  ],
  'install.later': ['Not now', 'ليس الآن'],

  'errors.invalidEmail': ['Enter a valid email address.', 'أدخل بريدًا إلكترونيًا صحيحًا.'],
  'errors.shortPassword': ['Password must be at least 8 characters.', 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.'],
  'errors.mismatch': ['Passwords do not match.', 'كلمتا المرور غير متطابقتين.'],
  'errors.credentials': ['Incorrect email or password.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
  'errors.exists': ['An account with this email already exists.', 'يوجد حساب بهذا البريد بالفعل.'],
  'errors.rate': ['Too many attempts. Please wait a moment.', 'محاولات كثيرة. يرجى الانتظار قليلًا.'],
  'errors.notFound': ['No account found with this email.', 'لا يوجد حساب بهذا البريد.'],
  'errors.offline': ['No internet connection.', 'لا يوجد اتصال بالإنترنت.'],
  'errors.generic': ['Please try again.', 'يرجى المحاولة مرة أخرى.'],
};

interface I18nValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  pick: (en: string, ar: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const LANG_KEY = 'rifq.lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;
    if (stored === 'ar' || stored === 'en') return stored;
    const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
    return nav.toLowerCase().startsWith('ar') ? 'ar' : 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* storage unavailable */
    }
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir,
      isRTL: dir === 'rtl',
      setLang,
      toggleLang: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      t: (key: string) => {
        const entry = dict[key];
        if (!entry) return key;
        return lang === 'ar' ? entry[1] : entry[0];
      },
      pick: (en: string, ar: string) => (lang === 'ar' ? ar : en),
    }),
    [lang, dir],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

export function hijriMonthName(month: number, lang: Lang): string {
  const key = `calendar.months.${month}`;
  const entry = dict[key];
  if (!entry) return String(month);
  return lang === 'ar' ? entry[1] : entry[0];
}

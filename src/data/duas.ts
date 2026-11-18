/**
 * Curated duas and adhkar.
 * Every entry cites a primary source (Quran ayah or hadith collection).
 * Nothing here is invented: texts are the well-known supplications
 * transmitted in the Quran and the authentic Sunnah.
 */

export type DuaCategory = 'morning' | 'daily' | 'quran' | 'distress' | 'travel';

export interface Dua {
  id: string;
  category: DuaCategory;
  titleEn: string;
  titleAr: string;
  arabic: string;
  transliteration: string;
  english: string;
  referenceEn: string;
  referenceAr: string;
}

export const DUAS: Dua[] = [
  /* ------------------------------ morning ------------------------------- */
  {
    id: 'morning-1',
    category: 'morning',
    titleEn: 'Sayyid al-Istighfar (the master supplication)',
    titleAr: 'سيد الاستغفار',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration:
      "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li, fa-innahu la yaghfirudh-dhunuba illa anta",
    english:
      'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I keep Your covenant and promise as much as I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You.',
    referenceEn: 'Sahih al-Bukhari 6306',
    referenceAr: 'صحيح البخاري ٦٣٠٦',
  },
  {
    id: 'morning-2',
    category: 'morning',
    titleEn: 'When morning comes',
    titleAr: 'دعاء الصباح',
    arabic:
      'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir",
    english:
      'We have entered the morning and the dominion belongs to Allah. All praise is for Allah. There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is able to do all things.',
    referenceEn: 'Sahih Muslim 2723',
    referenceAr: 'صحيح مسلم ٢٧٢٣',
  },
  {
    id: 'morning-3',
    category: 'morning',
    titleEn: 'Protection in the name of Allah',
    titleAr: 'الحفظ باسم الله',
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration:
      "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama', wa huwas-Sami'ul-'Alim",
    english:
      'In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing. (Three times morning and evening.)',
    referenceEn: 'Sunan Abi Dawud 5088, Jami at-Tirmidhi 3388',
    referenceAr: 'سنن أبي داود ٥٠٨٨، جامع الترمذي ٣٣٨٨',
  },
  {
    id: 'morning-4',
    category: 'morning',
    titleEn: 'Contentment with Allah, Islam and the Prophet ﷺ',
    titleAr: 'الرضا بالله والإسلام والنبي ﷺ',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    transliteration: 'Raditu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin ﷺ nabiyya',
    english:
      'I am content with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet. (Three times.)',
    referenceEn: 'Sunan Abi Dawud 5072, Jami at-Tirmidhi 3389',
    referenceAr: 'سنن أبي داود ٥٠٧٢، جامع الترمذي ٣٣٨٩',
  },
  {
    id: 'morning-5',
    category: 'morning',
    titleEn: 'Seeking well-being in this life and the next',
    titleAr: 'سؤال العافية في الدنيا والآخرة',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي',
    transliteration:
      "Allahumma inni as'alukal-'afiyata fid-dunya wal-akhirah, Allahumma inni as'alukal-'afwa wal-'afiyata fi dini wa dunyaya wa ahli wa mali",
    english:
      'O Allah, I ask You for well-being in this world and the Hereafter. O Allah, I ask You for pardon and well-being in my religion, my worldly life, my family and my wealth.',
    referenceEn: 'Sunan Ibn Majah 3871, Sunan Abi Dawud 5074',
    referenceAr: 'سنن ابن ماجه ٣٨٧١، سنن أبي داود ٥٠٧٤',
  },
  {
    id: 'morning-6',
    category: 'morning',
    titleEn: 'Evening supplication',
    titleAr: 'دعاء المساء',
    arabic:
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir",
    english:
      'We have entered the evening and the dominion belongs to Allah. All praise is for Allah. There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is able to do all things.',
    referenceEn: 'Sahih Muslim 2723',
    referenceAr: 'صحيح مسلم ٢٧٢٣',
  },

  /* -------------------------------- daily -------------------------------- */
  {
    id: 'daily-1',
    category: 'daily',
    titleEn: 'Before eating',
    titleAr: 'قبل الطعام',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    english:
      'In the name of Allah. If one forgets at the start: "Bismillahi awwalahu wa akhirahu" — In the name of Allah at its beginning and its end.',
    referenceEn: 'Sunan Abi Dawud 3767, Jami at-Tirmidhi 1858',
    referenceAr: 'سنن أبي داود ٣٧٦٧، جامع الترمذي ١٨٥٨',
  },
  {
    id: 'daily-2',
    category: 'daily',
    titleEn: 'After eating',
    titleAr: 'بعد الطعام',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration:
      "Alhamdulillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    english:
      'All praise is for Allah who fed me this and provided it for me without any strength or power on my part.',
    referenceEn: 'Jami at-Tirmidhi 3458, Sunan Ibn Majah 3285',
    referenceAr: 'جامع الترمذي ٣٤٥٨، سنن ابن ماجه ٣٢٨٥',
  },
  {
    id: 'daily-3',
    category: 'daily',
    titleEn: 'Entering the home',
    titleAr: 'دعاء دخول المنزل',
    arabic:
      'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala rabbina tawakkalna",
    english:
      'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we depend. Then greet the household.',
    referenceEn: 'Sunan Abi Dawud 5096',
    referenceAr: 'سنن أبي داود ٥٠٩٦',
  },
  {
    id: 'daily-4',
    category: 'daily',
    titleEn: 'Entering the bathroom',
    titleAr: 'دعاء دخول الخلاء',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith",
    english: 'O Allah, I seek refuge with You from male and female devils.',
    referenceEn: 'Sahih al-Bukhari 142, Sahih Muslim 375',
    referenceAr: 'صحيح البخاري ١٤٢، صحيح مسلم ٣٧٥',
  },
  {
    id: 'daily-5',
    category: 'daily',
    titleEn: 'Leaving the bathroom',
    titleAr: 'دعاء الخروج من الخلاء',
    arabic: 'غُفْرَانَكَ',
    transliteration: 'Ghufranak',
    english: 'I seek Your forgiveness.',
    referenceEn: 'Sunan Abi Dawud 30, Jami at-Tirmidhi 7',
    referenceAr: 'سنن أبي داود ٣٠، جامع الترمذي ٧',
  },
  {
    id: 'daily-6',
    category: 'daily',
    titleEn: 'Before sleeping',
    titleAr: 'دعاء النوم',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    english: 'In Your name, O Allah, I die and I live.',
    referenceEn: 'Sahih al-Bukhari 6324',
    referenceAr: 'صحيح البخاري ٦٣٢٤',
  },
  {
    id: 'daily-7',
    category: 'daily',
    titleEn: 'Upon waking',
    titleAr: 'دعاء الاستيقاظ',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdulillahil-ladhi ahyana ba\'da ma amatana wa ilayhin-nushur',
    english:
      'All praise is for Allah who gave us life after He caused us to die, and to Him is the return.',
    referenceEn: 'Sahih al-Bukhari 6312',
    referenceAr: 'صحيح البخاري ٦٣١٢',
  },
  {
    id: 'daily-8',
    category: 'daily',
    titleEn: 'Entering the mosque',
    titleAr: 'دعاء دخول المسجد',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahummaftah li abwaba rahmatik',
    english: 'O Allah, open for me the gates of Your mercy.',
    referenceEn: 'Sahih Muslim 713',
    referenceAr: 'صحيح مسلم ٧١٣',
  },
  {
    id: 'daily-9',
    category: 'daily',
    titleEn: 'Leaving the mosque',
    titleAr: 'دعاء الخروج من المسجد',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: "Allahumma inni as'aluka min fadlik",
    english: 'O Allah, I ask You from Your bounty.',
    referenceEn: 'Sahih Muslim 713',
    referenceAr: 'صحيح مسلم ٧١٣',
  },
  {
    id: 'daily-10',
    category: 'daily',
    titleEn: 'After ablution',
    titleAr: 'دعاء بعد الوضوء',
    arabic:
      'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration:
      'Ash-hadu an la ilaha illallahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan \'abduhu wa rasuluh',
    english:
      'I bear witness that there is no god but Allah alone, without partner, and I bear witness that Muhammad is His servant and Messenger.',
    referenceEn: 'Sahih Muslim 234',
    referenceAr: 'صحيح مسلم ٢٣٤',
  },
  {
    id: 'daily-11',
    category: 'daily',
    titleEn: 'When someone sneezes',
    titleAr: 'دعاء العطاس',
    arabic: 'الْحَمْدُ لِلَّهِ — يَرْحَمُكَ اللَّهُ — يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ',
    transliteration:
      'Alhamdulillah — Yarhamukallah — Yahdikumullahu wa yuslihu balakum',
    english:
      'The one who sneezes says "All praise is for Allah"; the listener replies "May Allah have mercy on you"; and the sneezer answers "May Allah guide you and set your affairs right."',
    referenceEn: 'Sahih al-Bukhari 6224',
    referenceAr: 'صحيح البخاري ٦٢٢٤',
  },
  {
    id: 'daily-12',
    category: 'daily',
    titleEn: 'Wearing new clothes',
    titleAr: 'دعاء لبس الثوب الجديد',
    arabic:
      'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
    transliteration:
      "Allahumma lakal-hamdu anta kasawtanih, as'aluka min khayrihi wa khayri ma suni'a lah, wa a'udhu bika min sharrihi wa sharri ma suni'a lah",
    english:
      'O Allah, to You belongs all praise; You have clothed me with it. I ask You for its good and the good for which it was made, and I seek refuge in You from its evil and the evil for which it was made.',
    referenceEn: 'Sunan Abi Dawud 4020, Jami at-Tirmidhi 1767',
    referenceAr: 'سنن أبي داود ٤٠٢٠، جامع الترمذي ١٧٦٧',
  },

  /* ------------------------------- quranic ------------------------------- */
  {
    id: 'quran-1',
    category: 'quran',
    titleEn: 'Good in both worlds',
    titleAr: 'خير الدنيا والآخرة',
    arabic:
      'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar',
    english:
      'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    referenceEn: "Quran 2:201",
    referenceAr: 'القرآن ٢:٢٠١',
  },
  {
    id: 'quran-2',
    category: 'quran',
    titleEn: 'Expansion of the chest',
    titleAr: 'شرح الصدر',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    transliteration: 'Rabbish-rah li sadri wa yassir li amri',
    english: 'My Lord, expand for me my chest and ease for me my task.',
    referenceEn: 'Quran 20:25-26',
    referenceAr: 'القرآن ٢٠:٢٥-٢٦',
  },
  {
    id: 'quran-3',
    category: 'quran',
    titleEn: 'Steadfast hearts',
    titleAr: 'ثبات القلوب',
    arabic:
      'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
    transliteration:
      'Rabbana la tuzigh qulubana ba\'da idh hadaytana wa hab lana min ladunka rahmatan innaka antal-Wahhab',
    english:
      'Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. Indeed You are the Bestower.',
    referenceEn: 'Quran 3:8',
    referenceAr: 'القرآن ٣:٨',
  },
  {
    id: 'quran-4',
    category: 'quran',
    titleEn: 'Increase in knowledge',
    titleAr: 'طلب العلم',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: "Rabbi zidni 'ilma",
    english: 'My Lord, increase me in knowledge.',
    referenceEn: 'Quran 20:114',
    referenceAr: 'القرآن ٢٠:١١٤',
  },
  {
    id: 'quran-5',
    category: 'quran',
    titleEn: 'Righteous family',
    titleAr: 'الذرية الصالحة',
    arabic:
      'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration:
      'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a\'yunin waj\'alna lil-muttaqina imama',
    english:
      'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us leaders for the righteous.',
    referenceEn: 'Quran 25:74',
    referenceAr: 'القرآن ٢٥:٧٤',
  },
  {
    id: 'quran-6',
    category: 'quran',
    titleEn: 'Establishing prayer and forgiveness for parents',
    titleAr: 'إقامة الصلاة والدعاء للوالدين',
    arabic:
      'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي، رَبَّنَا وَتَقَبَّلْ دُعَاءِ، رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    transliteration:
      "Rabbij'alni muqimas-salati wa min dhurriyyati, rabbana wa taqabbal du'a', rabbanaghfir li wa liwalidayya wa lil-mu'minina yawma yaqumul-hisab",
    english:
      'My Lord, make me an establisher of prayer, and from my descendants. Our Lord, accept my supplication. Our Lord, forgive me and my parents and the believers on the Day the account is established.',
    referenceEn: 'Quran 14:40-41',
    referenceAr: 'القرآن ١٤:٤٠-٤١',
  },
  {
    id: 'quran-7',
    category: 'quran',
    titleEn: 'Mercy for parents',
    titleAr: 'الدعاء للوالدين',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbir-hamhuma kama rabbayani saghira',
    english: 'My Lord, have mercy upon them as they brought me up when I was small.',
    referenceEn: 'Quran 17:24',
    referenceAr: 'القرآن ١٧:٢٤',
  },
  {
    id: 'quran-8',
    category: 'quran',
    titleEn: 'Sufficiency in Allah',
    titleAr: 'حسبنا الله',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: "Hasbunallahu wa ni'mal-wakil",
    english: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
    referenceEn: 'Quran 3:173',
    referenceAr: 'القرآن ٣:١٧٣',
  },
  {
    id: 'quran-9',
    category: 'quran',
    titleEn: 'The supplication of Yunus عليه السلام',
    titleAr: 'دعاء يونس عليه السلام',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin',
    english:
      'There is no god but You, glory be to You. Indeed, I have been of the wrongdoers.',
    referenceEn: 'Quran 21:87',
    referenceAr: 'القرآن ٢١:٨٧',
  },

  /* ------------------------------- distress ------------------------------ */
  {
    id: 'distress-1',
    category: 'distress',
    titleEn: 'Relief from anxiety and debt',
    titleAr: 'دعاء الهم والحزن',
    arabic:
      'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration:
      "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal",
    english:
      'O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by others.',
    referenceEn: 'Sahih al-Bukhari 6369',
    referenceAr: 'صحيح البخاري ٦٣٦٩',
  },
  {
    id: 'distress-2',
    category: 'distress',
    titleEn: 'The dua of distress',
    titleAr: 'دعاء الكرب',
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    transliteration:
      "La ilaha illallahul-'Azimul-Halim, la ilaha illallahu Rabbul-'Arshil-'Azim, la ilaha illallahu Rabbus-samawati wa Rabbul-ardi wa Rabbul-'Arshil-Karim",
    english:
      'There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.',
    referenceEn: 'Sahih al-Bukhari 6345, Sahih Muslim 2730',
    referenceAr: 'صحيح البخاري ٦٣٤٥، صحيح مسلم ٢٧٣٠',
  },
  {
    id: 'distress-3',
    category: 'distress',
    titleEn: 'Seeking healing',
    titleAr: 'دعاء الشفاء',
    arabic:
      'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شَافِيَ إِلَّا أَنْتَ',
    transliteration:
      "Allahumma Rabban-nas, adhhibil-ba's, ishfi antash-Shafi, la shafiya illa ant",
    english:
      'O Allah, Lord of mankind, remove the harm. Heal, for You are the Healer; there is no healer but You.',
    referenceEn: 'Sahih al-Bukhari 5675, Sahih Muslim 2191',
    referenceAr: 'صحيح البخاري ٥٦٧٥، صحيح مسلم ٢١٩١',
  },
  {
    id: 'distress-4',
    category: 'distress',
    titleEn: 'Protection from every harm',
    titleAr: 'الاستعاذة من كل شر',
    arabic:
      'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    transliteration:
      "A'udhu bikalimatillahit-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah",
    english:
      'I seek refuge in the perfect words of Allah from every devil and every poisonous creature, and from every evil eye.',
    referenceEn: 'Sahih al-Bukhari 3371',
    referenceAr: 'صحيح البخاري ٣٣٧١',
  },
  {
    id: 'distress-5',
    category: 'distress',
    titleEn: 'Visiting the sick',
    titleAr: 'دعاء عيادة المريض',
    arabic: 'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ',
    transliteration: "La ba's, tahurun in sha' Allah",
    english: 'Do not worry, it is a purification, if Allah wills.',
    referenceEn: 'Sahih al-Bukhari 3618',
    referenceAr: 'صحيح البخاري ٣٦١٨',
  },
  {
    id: 'distress-6',
    category: 'distress',
    titleEn: 'A treasure of Paradise',
    titleAr: 'كنز من كنوز الجنة',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    english: 'There is no might nor power except with Allah.',
    referenceEn: 'Sahih al-Bukhari 6384, Sahih Muslim 2704',
    referenceAr: 'صحيح البخاري ٦٣٨٤، صحيح مسلم ٢٧٠٤',
  },

  /* -------------------------------- travel ------------------------------- */
  {
    id: 'travel-1',
    category: 'travel',
    titleEn: 'Boarding a vehicle',
    titleAr: 'دعاء الركوب',
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration:
      'Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun',
    english:
      'Glory to Him who has subjected this to us, and we could never have it by our own efforts. And indeed, to our Lord we will surely return.',
    referenceEn: 'Quran 43:13-14 · Sahih Muslim 1342',
    referenceAr: 'القرآن ٤٣:١٣-١٤ · صحيح مسلم ١٣٤٢',
  },
  {
    id: 'travel-2',
    category: 'travel',
    titleEn: 'Dua for travel',
    titleAr: 'دعاء السفر',
    arabic:
      'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ',
    transliteration:
      "Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda, Allahumma hawwin 'alayna safarana hadha watwi 'anna bu'dah",
    english:
      'O Allah, we ask You in this journey of ours for righteousness and piety, and for deeds that please You. O Allah, make this journey easy for us and shorten its distance.',
    referenceEn: 'Sahih Muslim 1342',
    referenceAr: 'صحيح مسلم ١٣٤٢',
  },
  {
    id: 'travel-3',
    category: 'travel',
    titleEn: 'Returning from travel',
    titleAr: 'دعاء العودة من السفر',
    arabic: 'آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ',
    transliteration: "Ayibun, ta'ibun, 'abidun, li rabbina hamidun",
    english:
      'We return, repenting, worshipping, and praising our Lord.',
    referenceEn: 'Sahih Muslim 1342',
    referenceAr: 'صحيح مسلم ١٣٤٢',
  },
  {
    id: 'travel-4',
    category: 'travel',
    titleEn: 'Dua for the host',
    titleAr: 'دعاء للضيف والمضيف',
    arabic: 'اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ، وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ',
    transliteration: "Allahumma barik lahum fima razaqtahum, waghfir lahum warhamhum",
    english:
      'O Allah, bless them in what You have provided them, forgive them and have mercy on them.',
    referenceEn: 'Sahih Muslim 2042',
    referenceAr: 'صحيح مسلم ٢٠٤٢',
  },
  {
    id: 'travel-5',
    category: 'travel',
    titleEn: 'Entering a new town',
    titleAr: 'دعاء دخول البلدة',
    arabic:
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا',
    transliteration:
      "Allahumma inni as'aluka khayra hadhihil-qaryati wa khayra ahliha, wa a'udhu bika min sharriha wa sharri ahliha",
    english:
      'O Allah, I ask You for the good of this town and the good of its people, and I seek refuge in You from its evil and the evil of its people.',
    referenceEn: 'Sunan al-Kubra an-Nasa’i 8790 (hasan)',
    referenceAr: 'السنن الكبرى للنسائي ٨٧٩٠ (حسن)',
  },
  {
    id: 'travel-6',
    category: 'travel',
    titleEn: 'Before a meal at a guest’s table',
    titleAr: 'دعاء عند طعام المضيف',
    arabic:
      'اللَّهُمَّ أَطْعِمْ مَنْ أَطْعَمَنِي، وَاسْقِ مَنْ سَقَانِي',
    transliteration: "Allahumma at'im man at'amani, wasqi man saqani",
    english:
      'O Allah, feed the one who has fed me, and give drink to the one who has given me drink.',
    referenceEn: 'Sahih Muslim 2055',
    referenceAr: 'صحيح مسلم ٢٠٥٥',
  },
];

export function duasByCategory(category: DuaCategory): Dua[] {
  return DUAS.filter((d) => d.category === category);
}

export function findDua(id: string): Dua | undefined {
  return DUAS.find((d) => d.id === id);
}

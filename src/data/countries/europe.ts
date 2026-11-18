import type { CountrySeed } from '../countryTypes';

/** All 44 European sovereign states (ISO 3166-1 alpha-2). */
export const EUROPE: CountrySeed[] = [
  ['AL', 'Albania', 'ألبانيا', 'Europe/Tirane', [
    ['Tirana', 'Tirana', 41.3275, 19.8187],
    ['Durrës', 'Durrës', 41.3246, 19.4565],
    ['Shkodër', 'Shkodër', 42.0693, 19.5033],
  ]],
  ['AD', 'Andorra', 'أندورا', 'Europe/Andorra', [
    ['Andorra la Vella', 'Andorra la Vella', 42.5063, 1.5218],
    ['Escaldes-Engordany', 'Escaldes-Engordany', 42.509, 1.5341],
    ['Encamp', 'Encamp', 42.5361, 1.5828],
  ]],
  ['AT', 'Austria', 'النمسا', 'Europe/Vienna', [
    ['Vienna', 'Vienna', 48.2082, 16.3738],
    ['Graz', 'Styria', 47.0707, 15.4395],
    ['Salzburg', 'Salzburg', 47.8095, 13.055],
  ]],
  ['BY', 'Belarus', 'بيلاروسيا', 'Europe/Minsk', [
    ['Minsk', 'Minsk', 53.9006, 27.559],
    ['Gomel', 'Gomel', 52.4345, 30.9754],
    ['Brest', 'Brest', 52.0976, 23.7341],
  ]],
  ['BE', 'Belgium', 'بلجيكا', 'Europe/Brussels', [
    ['Brussels', 'Brussels', 50.8503, 4.3517],
    ['Antwerp', 'Antwerp', 51.2194, 4.4025],
    ['Liège', 'Liège', 50.6326, 5.5797],
  ]],
  ['BA', 'Bosnia and Herzegovina', 'البوسنة والهرسك', 'Europe/Sarajevo', [
    ['Sarajevo', 'Sarajevo', 43.8563, 18.4131],
    ['Banja Luka', 'Republika Srpska', 44.7722, 17.191],
    ['Tuzla', 'Tuzla', 44.5384, 18.6739],
  ]],
  ['BG', 'Bulgaria', 'بلغاريا', 'Europe/Sofia', [
    ['Sofia', 'Sofia', 42.6977, 23.3219],
    ['Plovdiv', 'Plovdiv', 42.1354, 24.7453],
    ['Varna', 'Varna', 43.2141, 27.9147],
  ]],
  ['HR', 'Croatia', 'كرواتيا', 'Europe/Zagreb', [
    ['Zagreb', 'Zagreb', 45.815, 15.9819],
    ['Split', 'Split-Dalmatia', 43.5081, 16.4402],
    ['Rijeka', 'Primorje-Gorski Kotar', 45.3271, 14.4422],
  ]],
  ['CZ', 'Czechia', 'التشيك', 'Europe/Prague', [
    ['Prague', 'Prague', 50.0755, 14.4378],
    ['Brno', 'South Moravian', 49.1951, 16.6068],
    ['Ostrava', 'Moravian-Silesian', 49.8209, 18.2625],
  ]],
  ['DK', 'Denmark', 'الدنمارك', 'Europe/Copenhagen', [
    ['Copenhagen', 'Capital Region', 55.6761, 12.5683],
    ['Aarhus', 'Central Jutland', 56.1629, 10.2039],
    ['Odense', 'Southern Denmark', 55.4038, 10.4024],
  ]],
  ['EE', 'Estonia', 'إستونيا', 'Europe/Tallinn', [
    ['Tallinn', 'Harju', 59.437, 24.7536],
    ['Tartu', 'Tartu', 58.3776, 26.729],
    ['Narva', 'Ida-Viru', 59.3799, 28.1791],
  ]],
  ['FI', 'Finland', 'فنلندا', 'Europe/Helsinki', [
    ['Helsinki', 'Uusimaa', 60.1699, 24.9384],
    ['Tampere', 'Pirkanmaa', 61.4978, 23.761],
    ['Turku', 'Southwest Finland', 60.4518, 22.2666],
  ]],
  ['FR', 'France', 'فرنسا', 'Europe/Paris', [
    ['Paris', 'Île-de-France', 48.8566, 2.3522],
    ['Marseille', "Provence-Alpes-Côte d'Azur", 43.2965, 5.3698],
    ['Lyon', 'Auvergne-Rhône-Alpes', 45.764, 4.8357],
    ['Toulouse', 'Occitanie', 43.6047, 1.4442],
  ]],
  ['DE', 'Germany', 'ألمانيا', 'Europe/Berlin', [
    ['Berlin', 'Berlin', 52.52, 13.405],
    ['Hamburg', 'Hamburg', 53.5511, 9.9937],
    ['Munich', 'Bavaria', 48.1351, 11.582],
    ['Cologne', 'North Rhine-Westphalia', 50.9375, 6.9603],
  ]],
  ['GR', 'Greece', 'اليونان', 'Europe/Athens', [
    ['Athens', 'Attica', 37.9838, 23.7275],
    ['Thessaloniki', 'Central Macedonia', 40.6401, 22.9444],
    ['Patras', 'Western Greece', 38.2466, 21.7346],
  ]],
  ['HU', 'Hungary', 'المجر', 'Europe/Budapest', [
    ['Budapest', 'Budapest', 47.4979, 19.0402],
    ['Debrecen', 'Hajdú-Bihar', 47.5316, 21.6273],
    ['Szeged', 'Csongrád-Csanád', 46.253, 20.1414],
  ]],
  ['IS', 'Iceland', 'آيسلندا', 'Atlantic/Reykjavik', [
    ['Reykjavík', 'Capital Region', 64.1466, -21.9426],
    ['Akureyri', 'Northeastern', 65.6835, -18.1002],
    ['Keflavík', 'Southern Peninsula', 63.9996, -22.56],
  ]],
  ['IE', 'Ireland', 'أيرلندا', 'Europe/Dublin', [
    ['Dublin', 'Leinster', 53.3498, -6.2603],
    ['Cork', 'Munster', 51.8985, -8.4756],
    ['Galway', 'Connacht', 53.2707, -9.0568],
  ]],
  ['IT', 'Italy', 'إيطاليا', 'Europe/Rome', [
    ['Rome', 'Lazio', 41.9028, 12.4964],
    ['Milan', 'Lombardy', 45.4642, 9.19],
    ['Naples', 'Campania', 40.8518, 14.2681],
    ['Palermo', 'Sicily', 38.1157, 13.3615],
  ]],
  ['LV', 'Latvia', 'لاتفيا', 'Europe/Riga', [
    ['Riga', 'Riga', 56.9496, 24.1052],
    ['Daugavpils', 'Daugavpils', 55.8747, 26.536],
    ['Liepāja', 'Liepāja', 56.5047, 21.0108],
  ]],
  ['LI', 'Liechtenstein', 'ليختنشتاين', 'Europe/Vaduz', [
    ['Vaduz', 'Vaduz', 47.141, 9.5209],
    ['Schaan', 'Schaan', 47.1667, 9.51],
    ['Triesen', 'Triesen', 47.1, 9.5333],
  ]],
  ['LT', 'Lithuania', 'ليتوانيا', 'Europe/Vilnius', [
    ['Vilnius', 'Vilnius', 54.6872, 25.2797],
    ['Kaunas', 'Kaunas', 54.8985, 23.9036],
    ['Klaipėda', 'Klaipėda', 55.7033, 21.1443],
  ]],
  ['LU', 'Luxembourg', 'لوكسمبورغ', 'Europe/Luxembourg', [
    ['Luxembourg', 'Luxembourg', 49.6116, 6.1319],
    ['Esch-sur-Alzette', 'Esch-sur-Alzette', 49.4958, 5.9806],
    ['Differdange', 'Differdange', 49.5242, 5.8914],
  ]],
  ['MT', 'Malta', 'مالطا', 'Europe/Malta', [
    ['Valletta', 'Valletta', 35.8989, 14.5146],
    ['Birkirkara', 'Birkirkara', 35.8972, 14.4611],
    ['Sliema', 'Sliema', 35.9122, 14.5042],
  ]],
  ['MD', 'Moldova', 'مولدوفا', 'Europe/Chisinau', [
    ['Chișinău', 'Chișinău', 47.0105, 28.8638],
    ['Bălți', 'Bălți', 47.7622, 27.9289],
    ['Tiraspol', 'Transnistria', 46.8403, 29.6433],
  ]],
  ['MC', 'Monaco', 'موناكو', 'Europe/Monaco', [
    ['Monaco', 'Monaco', 43.7384, 7.4246],
    ['Monte Carlo', 'Monte Carlo', 43.7403, 7.4267],
    ['La Condamine', 'La Condamine', 43.735, 7.42],
  ]],
  ['ME', 'Montenegro', 'الجبل الأسود', 'Europe/Podgorica', [
    ['Podgorica', 'Podgorica', 42.4304, 19.2594],
    ['Nikšić', 'Nikšić', 42.7731, 18.9445],
    ['Budva', 'Budva', 42.2864, 18.84],
  ]],
  ['NL', 'Netherlands', 'هولندا', 'Europe/Amsterdam', [
    ['Amsterdam', 'North Holland', 52.3676, 4.9041],
    ['Rotterdam', 'South Holland', 51.9244, 4.4777],
    ['The Hague', 'South Holland', 52.0705, 4.3007],
  ]],
  ['MK', 'North Macedonia', 'مقدونيا الشمالية', 'Europe/Skopje', [
    ['Skopje', 'Skopje', 41.9973, 21.428],
    ['Bitola', 'Pelagonia', 41.0297, 21.3292],
    ['Kumanovo', 'Northeastern', 42.1322, 21.7144],
  ]],
  ['NO', 'Norway', 'النرويج', 'Europe/Oslo', [
    ['Oslo', 'Oslo', 59.9139, 10.7522],
    ['Bergen', 'Vestland', 60.3913, 5.3221],
    ['Tromsø', 'Troms', 69.6492, 18.9553],
  ]],
  ['PL', 'Poland', 'بولندا', 'Europe/Warsaw', [
    ['Warsaw', 'Masovia', 52.2297, 21.0122],
    ['Kraków', 'Lesser Poland', 50.0647, 19.945],
    ['Gdańsk', 'Pomerania', 54.352, 18.6466],
  ]],
  ['PT', 'Portugal', 'البرتغال', 'Europe/Lisbon', [
    ['Lisbon', 'Lisbon', 38.7223, -9.1393],
    ['Porto', 'North', 41.1579, -8.6291],
    ['Faro', 'Algarve', 37.0194, -7.9304],
  ]],
  ['RO', 'Romania', 'رومانيا', 'Europe/Bucharest', [
    ['Bucharest', 'Bucharest', 44.4268, 26.1025],
    ['Cluj-Napoca', 'Cluj', 46.7712, 23.6236],
    ['Timișoara', 'Timiș', 45.7489, 21.2087],
  ]],
  ['RU', 'Russia', 'روسيا', 'Europe/Moscow', [
    ['Moscow', 'Moscow', 55.7558, 37.6173],
    ['Saint Petersburg', 'Saint Petersburg', 59.9311, 30.3609],
    ['Kazan', 'Tatarstan', 55.7963, 49.1088],
    ['Novosibirsk', 'Novosibirsk Oblast', 55.0084, 82.9357, 'Asia/Novosibirsk'],
    ['Vladivostok', 'Primorsky Krai', 43.1155, 131.8855, 'Asia/Vladivostok'],
  ]],
  ['SM', 'San Marino', 'سان مارينو', 'Europe/San_Marino', [
    ['San Marino', 'San Marino', 43.9424, 12.4578],
    ['Serravalle', 'Serravalle', 43.97, 12.48],
    ['Borgo Maggiore', 'Borgo Maggiore', 43.9419, 12.4478],
  ]],
  ['RS', 'Serbia', 'صربيا', 'Europe/Belgrade', [
    ['Belgrade', 'Belgrade', 44.7866, 20.4489],
    ['Novi Sad', 'Vojvodina', 45.2671, 19.8335],
    ['Niš', 'Nišava', 43.3209, 21.8958],
  ]],
  ['SK', 'Slovakia', 'سلوفاكيا', 'Europe/Bratislava', [
    ['Bratislava', 'Bratislava', 48.1486, 17.1077],
    ['Košice', 'Košice', 48.7164, 21.2611],
    ['Prešov', 'Prešov', 48.9984, 21.2339],
  ]],
  ['SI', 'Slovenia', 'سلوفينيا', 'Europe/Ljubljana', [
    ['Ljubljana', 'Central Slovenia', 46.0569, 14.5058],
    ['Maribor', 'Maribor', 46.5547, 15.6459],
    ['Koper', 'Coastal-Karst', 45.5481, 13.7302],
  ]],
  ['ES', 'Spain', 'إسبانيا', 'Europe/Madrid', [
    ['Madrid', 'Madrid', 40.4168, -3.7038],
    ['Barcelona', 'Catalonia', 41.3874, 2.1686],
    ['Valencia', 'Valencian Community', 39.4699, -0.3763],
    ['Seville', 'Andalusia', 37.3891, -5.9845],
  ]],
  ['SE', 'Sweden', 'السويد', 'Europe/Stockholm', [
    ['Stockholm', 'Stockholm', 59.3293, 18.0686],
    ['Gothenburg', 'Västra Götaland', 57.7089, 11.9746],
    ['Malmö', 'Skåne', 55.605, 13.0038],
  ]],
  ['CH', 'Switzerland', 'سويسرا', 'Europe/Zurich', [
    ['Zurich', 'Zurich', 47.3769, 8.5417],
    ['Geneva', 'Geneva', 46.2044, 6.1432],
    ['Basel', 'Basel-Stadt', 47.5596, 7.5886],
  ]],
  ['UA', 'Ukraine', 'أوكرانيا', 'Europe/Kyiv', [
    ['Kyiv', 'Kyiv', 50.4501, 30.5234],
    ['Kharkiv', 'Kharkiv Oblast', 49.9935, 36.2304],
    ['Odesa', 'Odesa Oblast', 46.4825, 30.7233],
    ['Lviv', 'Lviv Oblast', 49.8397, 24.0297],
  ]],
  ['GB', 'United Kingdom', 'المملكة المتحدة', 'Europe/London', [
    ['London', 'England', 51.5074, -0.1278],
    ['Birmingham', 'England', 52.4862, -1.8904],
    ['Manchester', 'England', 53.4808, -2.2426],
    ['Glasgow', 'Scotland', 55.8642, -4.2518],
    ['Cardiff', 'Wales', 51.4816, -3.1791],
  ]],
  ['VA', 'Vatican City', 'الفاتيكان', 'Europe/Vatican', [
    ['Vatican City', 'Vatican City', 41.9029, 12.4534],
    ["St. Peter's Square", 'Vatican City', 41.9022, 12.4567],
  ]],
];

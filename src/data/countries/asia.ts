import type { CountrySeed } from '../countryTypes';

/** All 48 Asian sovereign states (ISO 3166-1 alpha-2). */
export const ASIA: CountrySeed[] = [
  ['AF', 'Afghanistan', 'أفغانستان', 'Asia/Kabul', [
    ['Kabul', 'Kabul', 34.5553, 69.2075],
    ['Kandahar', 'Kandahar', 31.6089, 65.7067],
    ['Herat', 'Herat', 34.3529, 62.204],
    ['Mazar-i-Sharif', 'Balkh', 36.709, 67.1109],
  ]],
  ['AM', 'Armenia', 'أرمينيا', 'Asia/Yerevan', [
    ['Yerevan', 'Yerevan', 40.1792, 44.4991],
    ['Gyumri', 'Shirak', 40.7942, 43.8453],
    ['Vanadzor', 'Lori', 40.8074, 44.497],
  ]],
  ['AZ', 'Azerbaijan', 'أذربيجان', 'Asia/Baku', [
    ['Baku', 'Baku', 40.4093, 49.8671],
    ['Ganja', 'Ganja', 40.6828, 46.3606],
    ['Sumqayit', 'Sumqayit', 40.5897, 49.6686],
  ]],
  ['BH', 'Bahrain', 'البحرين', 'Asia/Bahrain', [
    ['Manama', 'Capital', 26.2285, 50.586],
    ['Riffa', 'Southern', 26.13, 50.555],
    ['Muharraq', 'Muharraq', 26.2572, 50.6119],
  ]],
  ['BD', 'Bangladesh', 'بنغلاديش', 'Asia/Dhaka', [
    ['Dhaka', 'Dhaka', 23.8103, 90.4125],
    ['Chattogram', 'Chattogram', 22.3569, 91.7832],
    ['Sylhet', 'Sylhet', 24.8949, 91.8687],
    ['Khulna', 'Khulna', 22.8456, 89.5403],
  ]],
  ['BT', 'Bhutan', 'بوتان', 'Asia/Thimphu', [
    ['Thimphu', 'Thimphu', 27.4712, 89.6339],
    ['Phuntsholing', 'Chukha', 26.8516, 89.3884],
    ['Paro', 'Paro', 27.4287, 89.4164],
  ]],
  ['BN', 'Brunei', 'بروناي', 'Asia/Brunei', [
    ['Bandar Seri Begawan', 'Brunei-Muara', 4.9031, 114.9398],
    ['Kuala Belait', 'Belait', 4.5833, 114.2333],
    ['Tutong', 'Tutong', 4.8022, 114.6492],
  ]],
  ['KH', 'Cambodia', 'كمبوديا', 'Asia/Phnom_Penh', [
    ['Phnom Penh', 'Phnom Penh', 11.5564, 104.9282],
    ['Siem Reap', 'Siem Reap', 13.3671, 103.8448],
    ['Battambang', 'Battambang', 13.0957, 103.2022],
  ]],
  ['CN', 'China', 'الصين', 'Asia/Shanghai', [
    ['Beijing', 'Beijing', 39.9042, 116.4074],
    ['Shanghai', 'Shanghai', 31.2304, 121.4737],
    ['Guangzhou', 'Guangdong', 23.1291, 113.2644],
    ['Ürümqi', 'Xinjiang', 43.8256, 87.6168, 'Asia/Urumqi'],
  ]],
  ['CY', 'Cyprus', 'قبرص', 'Asia/Nicosia', [
    ['Nicosia', 'Nicosia', 35.1856, 33.3823],
    ['Limassol', 'Limassol', 34.7071, 33.0226],
    ['Larnaca', 'Larnaca', 34.9182, 33.6197],
  ]],
  ['GE', 'Georgia', 'جورجيا', 'Asia/Tbilisi', [
    ['Tbilisi', 'Tbilisi', 41.7151, 44.8271],
    ['Batumi', 'Ajaria', 41.6168, 41.6367],
    ['Kutaisi', 'Imereti', 42.2679, 42.6946],
  ]],
  ['IN', 'India', 'الهند', 'Asia/Kolkata', [
    ['Delhi', 'Delhi', 28.6139, 77.209],
    ['Mumbai', 'Maharashtra', 19.076, 72.8777],
    ['Bengaluru', 'Karnataka', 12.9716, 77.5946],
    ['Hyderabad', 'Telangana', 17.385, 78.4867],
    ['Srinagar', 'Jammu and Kashmir', 34.0837, 74.7973],
  ]],
  ['ID', 'Indonesia', 'إندونيسيا', 'Asia/Jakarta', [
    ['Jakarta', 'Jakarta', -6.2088, 106.8456],
    ['Surabaya', 'East Java', -7.2575, 112.7521],
    ['Medan', 'North Sumatra', 3.5952, 98.6722],
    ['Makassar', 'South Sulawesi', -5.1477, 119.4327, 'Asia/Makassar'],
    ['Jayapura', 'Papua', -2.5337, 140.7181, 'Asia/Jayapura'],
  ]],
  ['IR', 'Iran', 'إيران', 'Asia/Tehran', [
    ['Tehran', 'Tehran', 35.6892, 51.389],
    ['Mashhad', 'Razavi Khorasan', 36.2605, 59.6168],
    ['Isfahan', 'Isfahan', 32.6546, 51.668],
    ['Tabriz', 'East Azerbaijan', 38.0962, 46.2738],
  ]],
  ['IQ', 'Iraq', 'العراق', 'Asia/Baghdad', [
    ['Baghdad', 'Baghdad', 33.3152, 44.3661],
    ['Basra', 'Basra', 30.5081, 47.7835],
    ['Mosul', 'Nineveh', 36.335, 43.1189],
    ['Erbil', 'Erbil', 36.1911, 44.0092],
  ]],
  ['IL', 'Israel', 'إسرائيل', 'Asia/Jerusalem', [
    ['Jerusalem', 'Jerusalem', 31.7683, 35.2137],
    ['Tel Aviv', 'Tel Aviv', 32.0853, 34.7818],
    ['Haifa', 'Haifa', 32.794, 34.9896],
  ]],
  ['JP', 'Japan', 'اليابان', 'Asia/Tokyo', [
    ['Tokyo', 'Tokyo', 35.6762, 139.6503],
    ['Osaka', 'Osaka', 34.6937, 135.5023],
    ['Sapporo', 'Hokkaido', 43.0618, 141.3545],
    ['Fukuoka', 'Fukuoka', 33.5904, 130.4017],
  ]],
  ['JO', 'Jordan', 'الأردن', 'Asia/Amman', [
    ['Amman', 'Amman', 31.9454, 35.9284],
    ['Zarqa', 'Zarqa', 32.0728, 36.088],
    ['Irbid', 'Irbid', 32.5556, 35.85],
  ]],
  ['KZ', 'Kazakhstan', 'كازاخستان', 'Asia/Almaty', [
    ['Almaty', 'Almaty', 43.222, 76.8512],
    ['Astana', 'Astana', 51.1694, 71.4491],
    ['Shymkent', 'Shymkent', 42.3417, 69.5901],
    ['Atyrau', 'Atyrau', 47.0945, 51.9238, 'Asia/Atyrau'],
  ]],
  ['KW', 'Kuwait', 'الكويت', 'Asia/Kuwait', [
    ['Kuwait City', 'Capital', 29.3759, 47.9774],
    ['Al Ahmadi', 'Al Ahmadi', 29.0769, 48.0838],
    ['Hawalli', 'Hawalli', 29.3328, 48.0286],
  ]],
  ['KG', 'Kyrgyzstan', 'قيرغيزستان', 'Asia/Bishkek', [
    ['Bishkek', 'Bishkek', 42.8746, 74.5698],
    ['Osh', 'Osh', 40.5139, 72.8161],
    ['Jalal-Abad', 'Jalal-Abad', 40.9333, 73.0],
  ]],
  ['LA', 'Laos', 'لاوس', 'Asia/Vientiane', [
    ['Vientiane', 'Vientiane', 17.9757, 102.6331],
    ['Savannakhet', 'Savannakhet', 16.5418, 104.755],
    ['Luang Prabang', 'Luang Prabang', 19.8856, 102.1347],
  ]],
  ['LB', 'Lebanon', 'لبنان', 'Asia/Beirut', [
    ['Beirut', 'Beirut', 33.8938, 35.5018],
    ['Tripoli', 'North', 34.4367, 35.8497],
    ['Sidon', 'South', 33.5571, 35.3729],
  ]],
  ['MY', 'Malaysia', 'ماليزيا', 'Asia/Kuala_Lumpur', [
    ['Kuala Lumpur', 'Kuala Lumpur', 3.139, 101.6869],
    ['George Town', 'Penang', 5.4141, 100.3288],
    ['Johor Bahru', 'Johor', 1.4927, 103.7414],
    ['Kota Kinabalu', 'Sabah', 5.9804, 116.0735, 'Asia/Kuching'],
  ]],
  ['MV', 'Maldives', 'المالديف', 'Indian/Maldives', [
    ['Malé', 'Kaafu', 4.1755, 73.5093],
    ['Addu City', 'Addu', -0.629, 73.157],
    ['Kulhudhuffushi', 'Haa Dhaalu', 6.6221, 73.07],
  ]],
  ['MN', 'Mongolia', 'منغوليا', 'Asia/Ulaanbaatar', [
    ['Ulaanbaatar', 'Ulaanbaatar', 47.8864, 106.9057],
    ['Erdenet', 'Orkhon', 49.0333, 104.0833],
    ['Khovd', 'Khovd', 48.0056, 91.6419, 'Asia/Hovd'],
  ]],
  ['MM', 'Myanmar', 'ميانمار', 'Asia/Yangon', [
    ['Yangon', 'Yangon', 16.8661, 96.1951],
    ['Mandalay', 'Mandalay', 21.9588, 96.0891],
    ['Naypyidaw', 'Naypyidaw', 19.7633, 96.0785],
  ]],
  ['NP', 'Nepal', 'نيبال', 'Asia/Kathmandu', [
    ['Kathmandu', 'Bagmati', 27.7172, 85.324],
    ['Pokhara', 'Gandaki', 28.2096, 83.9856],
    ['Biratnagar', 'Koshi', 26.4525, 87.2718],
  ]],
  ['KP', 'North Korea', 'كوريا الشمالية', 'Asia/Pyongyang', [
    ['Pyongyang', 'Pyongyang', 39.0392, 125.7625],
    ['Hamhung', 'South Hamgyong', 39.9183, 127.5364],
    ['Chongjin', 'North Hamgyong', 41.7956, 129.7756],
  ]],
  ['OM', 'Oman', 'عُمان', 'Asia/Muscat', [
    ['Muscat', 'Muscat', 23.588, 58.3829],
    ['Salalah', 'Dhofar', 17.0151, 54.0924],
    ['Sohar', 'Al Batinah North', 24.347, 56.709],
  ]],
  ['PK', 'Pakistan', 'باكستان', 'Asia/Karachi', [
    ['Karachi', 'Sindh', 24.8607, 67.0011],
    ['Lahore', 'Punjab', 31.5204, 74.3587],
    ['Islamabad', 'Islamabad', 33.6844, 73.0479],
    ['Peshawar', 'Khyber Pakhtunkhwa', 34.0151, 71.5249],
  ]],
  ['PS', 'Palestine', 'فلسطين', 'Asia/Hebron', [
    ['Jerusalem (Al-Quds)', 'Al-Quds', 31.7683, 35.2137],
    ['Gaza', 'Gaza', 31.5017, 34.4668],
    ['Hebron', 'Al-Khalil', 31.5326, 35.0998],
    ['Nablus', 'Nablus', 32.2211, 35.2544],
    ['Ramallah', 'Ramallah', 31.9038, 35.2034],
  ]],
  ['PH', 'Philippines', 'الفلبين', 'Asia/Manila', [
    ['Manila', 'Metro Manila', 14.5995, 120.9842],
    ['Cebu City', 'Cebu', 10.3157, 123.8854],
    ['Davao City', 'Davao del Sur', 7.1907, 125.4553],
    ['Zamboanga City', 'Zamboanga del Sur', 6.9214, 122.079],
  ]],
  ['QA', 'Qatar', 'قطر', 'Asia/Qatar', [
    ['Doha', 'Doha', 25.2854, 51.531],
    ['Al Rayyan', 'Al Rayyan', 25.2919, 51.4244],
    ['Al Wakrah', 'Al Wakrah', 25.1659, 51.5986],
  ]],
  ['SA', 'Saudi Arabia', 'المملكة العربية السعودية', 'Asia/Riyadh', [
    ['Makkah', 'Makkah', 21.4225, 39.8262],
    ['Madinah', 'Al Madinah', 24.4672, 39.6111],
    ['Riyadh', 'Riyadh', 24.7136, 46.6753],
    ['Jeddah', 'Makkah', 21.4858, 39.1925],
    ['Dammam', 'Eastern Province', 26.4207, 50.0888],
  ]],
  ['SG', 'Singapore', 'سنغافورة', 'Asia/Singapore', [
    ['Singapore', 'Central', 1.3521, 103.8198],
    ['Woodlands', 'North', 1.4382, 103.789],
    ['Tampines', 'East', 1.3496, 103.9568],
  ]],
  ['KR', 'South Korea', 'كوريا الجنوبية', 'Asia/Seoul', [
    ['Seoul', 'Seoul', 37.5665, 126.978],
    ['Busan', 'Busan', 35.1796, 129.0756],
    ['Incheon', 'Incheon', 37.4563, 126.7052],
  ]],
  ['LK', 'Sri Lanka', 'سريلانكا', 'Asia/Colombo', [
    ['Colombo', 'Western', 6.9271, 79.8612],
    ['Kandy', 'Central', 7.2906, 80.6337],
    ['Jaffna', 'Northern', 9.6615, 80.0255],
  ]],
  ['SY', 'Syria', 'سوريا', 'Asia/Damascus', [
    ['Damascus', 'Damascus', 33.5138, 36.2765],
    ['Aleppo', 'Aleppo', 36.2021, 37.1343],
    ['Homs', 'Homs', 34.7324, 36.7137],
  ]],
  ['TJ', 'Tajikistan', 'طاجيكستان', 'Asia/Dushanbe', [
    ['Dushanbe', 'Dushanbe', 38.5598, 68.787],
    ['Khujand', 'Sughd', 40.2833, 69.6333],
    ['Kulob', 'Khatlon', 37.9146, 69.7847],
  ]],
  ['TH', 'Thailand', 'تايلاند', 'Asia/Bangkok', [
    ['Bangkok', 'Bangkok', 13.7563, 100.5018],
    ['Chiang Mai', 'Chiang Mai', 18.7883, 98.9853],
    ['Hat Yai', 'Songkhla', 7.0084, 100.4767],
  ]],
  ['TL', 'Timor-Leste', 'تيمور الشرقية', 'Asia/Dili', [
    ['Dili', 'Dili', -8.5569, 125.5603],
    ['Baucau', 'Baucau', -8.4667, 126.45],
    ['Maliana', 'Bobonaro', -8.9917, 125.22],
  ]],
  ['TR', 'Türkiye', 'تركيا', 'Europe/Istanbul', [
    ['Istanbul', 'Istanbul', 41.0082, 28.9784],
    ['Ankara', 'Ankara', 39.9334, 32.8597],
    ['İzmir', 'İzmir', 38.4237, 27.1428],
    ['Diyarbakır', 'Diyarbakır', 37.9144, 40.2306],
  ]],
  ['TM', 'Turkmenistan', 'تركمانستان', 'Asia/Ashgabat', [
    ['Ashgabat', 'Ashgabat', 37.9601, 58.3261],
    ['Türkmenabat', 'Lebap', 39.0733, 63.5786],
    ['Daşoguz', 'Daşoguz', 41.8361, 59.9667],
  ]],
  ['AE', 'United Arab Emirates', 'الإمارات العربية المتحدة', 'Asia/Dubai', [
    ['Dubai', 'Dubai', 25.2048, 55.2708],
    ['Abu Dhabi', 'Abu Dhabi', 24.4539, 54.3773],
    ['Sharjah', 'Sharjah', 25.3463, 55.4209],
    ['Al Ain', 'Abu Dhabi', 24.2075, 55.7447],
  ]],
  ['UZ', 'Uzbekistan', 'أوزبكستان', 'Asia/Tashkent', [
    ['Tashkent', 'Tashkent', 41.2995, 69.2401],
    ['Samarkand', 'Samarqand', 39.627, 66.975],
    ['Bukhara', 'Bukhara', 39.7747, 64.4286],
  ]],
  ['VN', 'Vietnam', 'فيتنام', 'Asia/Ho_Chi_Minh', [
    ['Hanoi', 'Hanoi', 21.0278, 105.8342],
    ['Ho Chi Minh City', 'Ho Chi Minh', 10.8231, 106.6297],
    ['Da Nang', 'Da Nang', 16.0544, 108.2022],
  ]],
  ['YE', 'Yemen', 'اليمن', 'Asia/Aden', [
    ["Sana'a", 'Amanat Al Asimah', 15.3694, 44.191],
    ['Aden', 'Aden', 12.7855, 45.0187],
    ['Taiz', 'Taiz', 13.5795, 44.0209],
  ]],
];

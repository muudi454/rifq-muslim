import type { CountrySeed } from '../countryTypes';

/** All 14 sovereign states of Oceania (ISO 3166-1 alpha-2). */
export const OCEANIA: CountrySeed[] = [
  ['AU', 'Australia', 'أستراليا', 'Australia/Sydney', [
    ['Sydney', 'New South Wales', -33.8688, 151.2093],
    ['Melbourne', 'Victoria', -37.8136, 144.9631, 'Australia/Melbourne'],
    ['Brisbane', 'Queensland', -27.4698, 153.0251, 'Australia/Brisbane'],
    ['Perth', 'Western Australia', -31.9505, 115.8605, 'Australia/Perth'],
    ['Adelaide', 'South Australia', -34.9285, 138.6007, 'Australia/Adelaide'],
  ]],
  ['FJ', 'Fiji', 'فيجي', 'Pacific/Fiji', [
    ['Suva', 'Central', -18.1416, 178.4419],
    ['Nadi', 'Western', -17.7765, 177.4356],
    ['Lautoka', 'Western', -17.6167, 177.45],
  ]],
  ['KI', 'Kiribati', 'كيريباتي', 'Pacific/Tarawa', [
    ['South Tarawa', 'Tarawa', 1.3291, 172.979],
    ['Betio', 'Tarawa', 1.3583, 172.9333],
    ['Kiritimati', 'Line Islands', 1.8721, -157.4278, 'Pacific/Kiritimati'],
  ]],
  ['MH', 'Marshall Islands', 'جزر مارشال', 'Pacific/Majuro', [
    ['Majuro', 'Majuro', 7.1164, 171.1858],
    ['Ebeye', 'Kwajalein', 8.7833, 167.7167],
    ['Jaluit', 'Jaluit', 5.9167, 169.65],
  ]],
  ['FM', 'Micronesia', 'ميكرونيزيا', 'Pacific/Pohnpei', [
    ['Palikir', 'Pohnpei', 6.9248, 158.1611],
    ['Weno', 'Chuuk', 7.4464, 151.8417],
    ['Colonia', 'Yap', 9.5167, 138.1167],
  ]],
  ['NR', 'Nauru', 'ناورو', 'Pacific/Nauru', [
    ['Yaren', 'Yaren', -0.5477, 166.9209],
    ['Denigomodu', 'Denigomodu', -0.5236, 166.9157],
    ['Aiwo', 'Aiwo', -0.53, 166.91],
  ]],
  ['NZ', 'New Zealand', 'نيوزيلندا', 'Pacific/Auckland', [
    ['Auckland', 'Auckland', -36.8485, 174.7633],
    ['Wellington', 'Wellington', -41.2866, 174.7756],
    ['Christchurch', 'Canterbury', -43.5321, 172.6362],
  ]],
  ['PW', 'Palau', 'بالاو', 'Pacific/Palau', [
    ['Ngerulmud', 'Melekeok', 7.5006, 134.6242],
    ['Koror', 'Koror', 7.3419, 134.4791],
    ['Airai', 'Airai', 7.3667, 134.55],
  ]],
  ['PG', 'Papua New Guinea', 'بابوا غينيا الجديدة', 'Pacific/Port_Moresby', [
    ['Port Moresby', 'National Capital District', -9.4438, 147.1803],
    ['Lae', 'Morobe', -6.732, 146.9955],
    ['Mount Hagen', 'Western Highlands', -5.8583, 144.2333],
  ]],
  ['WS', 'Samoa', 'ساموا', 'Pacific/Apia', [
    ['Apia', 'Tuamasaga', -13.8506, -171.7513],
    ['Vaitele', 'Tuamasaga', -13.8333, -171.75],
    ['Salelologa', "Savai'i", -13.7333, -172.2167],
  ]],
  ['SB', 'Solomon Islands', 'جزر سليمان', 'Pacific/Guadalcanal', [
    ['Honiara', 'Guadalcanal', -9.4456, 159.9729],
    ['Auki', 'Malaita', -8.7678, 160.6978],
    ['Gizo', 'Western', -8.1, 156.85],
  ]],
  ['TO', 'Tonga', 'تونغا', 'Pacific/Tongatapu', [
    ["Nuku'alofa", 'Tongatapu', -21.1393, -175.2049],
    ['Neiafu', "Vava'u", -18.65, -173.9833],
    ['Haveluloto', 'Tongatapu', -21.15, -175.2167],
  ]],
  ['TV', 'Tuvalu', 'توفالو', 'Pacific/Funafuti', [
    ['Funafuti', 'Funafuti', -8.5243, 179.1942],
    ['Vaiaku', 'Funafuti', -8.5167, 179.2],
    ['Asau', 'Vaitupu', -7.5, 178.6667],
  ]],
  ['VU', 'Vanuatu', 'فانواتو', 'Pacific/Efate', [
    ['Port Vila', 'Shefa', -17.7333, 168.3273],
    ['Luganville', 'Sanma', -15.5194, 167.1767],
    ['Isangel', 'Tafea', -19.55, 169.2667],
  ]],
];

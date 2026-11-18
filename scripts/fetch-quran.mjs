import fs from 'node:fs';
const get = async (u) => {
  const r = await fetch(u);
  if (!r.ok) throw new Error(u + ' -> ' + r.status);
  return r.json();
};
const ar = await get('https://api.alquran.cloud/v1/quran/quran-uthmani');
const en = await get('https://api.alquran.cloud/v1/quran/en.sahih');
if (ar.code !== 200 || en.code !== 200) throw new Error('bad payload');
const out = {
  source: {
    arabic: 'Tanzil Uthmani text via AlQuran Cloud API (api.alquran.cloud, free, no key)',
    translation: 'Sahih International (en.sahih) via AlQuran Cloud API',
    retrieved: new Date().toISOString().slice(0, 10),
  },
  surahs: ar.data.surahs.map((s, i) => {
    const e = en.data.surahs[i];
    if (!e || e.number !== s.number) throw new Error('mismatch ' + s.number);
    return {
      n: s.number,
      name: s.name,
      en: s.englishName,
      tr: s.englishNameTranslation,
      type: s.revelationType,
      ayahs: s.ayahs.map((a, j) => [a.text, e.ayahs[j].text]),
    };
  }),
};
fs.writeFileSync('public/data/quran.json', JSON.stringify(out));
const bytes = fs.statSync('public/data/quran.json').size;
let verses = 0; out.surahs.forEach(s => verses += s.ayahs.length);
console.log('surahs', out.surahs.length, 'ayahs', verses, 'bytes', bytes);
console.log('check 2:255', out.surahs[1].ayahs[254][0].slice(0, 40));

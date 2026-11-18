// Builds public/data/hadith.json from the Hadeeth Encyclopedia
// (hadeethenc.com) — a free, open API with graded, referenced hadith
// in Arabic with English translations. No API key, no paid tier.
import fs from 'node:fs';

const BASE = 'https://hadeethenc.com/api/v1';
const CATEGORIES = [
  { id: '5', key: 'manners' },
  { id: '3', key: 'creed' },
  { id: '4', key: 'fiqh' },
  { id: '7', key: 'seerah' },
];
const PER_CATEGORY = 22;

const get = async (url, tries = 3) => {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' } });
      if (r.ok) return await r.json();
      if (r.status === 404) return null;
    } catch {
      /* retry */
    }
    await new Promise((res) => setTimeout(res, 400 * (i + 1)));
  }
  return null;
};

const cats = await get(`${BASE}/categories/list/?language=en`);
const catTitles = new Map((cats || []).map((c) => [String(c.id), c.title]));

const pick = [];
for (const c of CATEGORIES) {
  const list = await get(
    `${BASE}/hadeeths/list/?language=en&category_id=${c.id}&page=1&per_page=${PER_CATEGORY}`,
  );
  const rows = Array.isArray(list?.data) ? list.data : [];
  for (const row of rows) pick.push({ id: String(row.id), category: c.key });
  console.log(c.id, catTitles.get(c.id), '->', rows.length);
}

const items = [];
let cursor = 0;
const worker = async () => {
  while (cursor < pick.length) {
    const { id, category } = pick[cursor++];
    const [en, ar] = await Promise.all([
      get(`${BASE}/hadeeths/one/?language=en&id=${id}`),
      get(`${BASE}/hadeeths/one/?language=ar&id=${id}`),
    ]);
    if (!en || !ar || !ar.hadeeth) continue;
    items.push({
      id,
      category,
      title: en.title || '',
      arabic: ar.hadeeth,
      text: en.hadeeth,
      attribution: en.attribution || ar.attribution || '',
      grade: en.grade || ar.grade || '',
      reference: en.reference || ar.reference || '',
      explanation: en.explanation || '',
    });
  }
};
await Promise.all(Array.from({ length: 6 }, worker));

items.sort((a, b) => a.id.localeCompare(b.id));
const out = {
  source: {
    name: 'Hadeeth Encyclopedia (hadeethenc.com)',
    note: 'Free open API. Each entry keeps its own attribution, grade and reference.',
    retrieved: new Date().toISOString().slice(0, 10),
  },
  hadiths: items,
};
fs.mkdirSync('public/data', { recursive: true });
fs.writeFileSync('public/data/hadith.json', JSON.stringify(out));
console.log('hadiths', items.length, 'bytes', fs.statSync('public/data/hadith.json').size);
console.log(JSON.stringify(items[0], null, 1).slice(0, 700));

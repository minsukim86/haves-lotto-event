const urls = [
  'https://haves-lotto-event.vercel.app/',
  'https://haves-lotto-event.vercel.app/entry/a',
  'https://haves-evt-01.vercel.app/',
];

for (const u of urls) {
  const r = await fetch(u, { redirect: 'follow' });
  const t = await r.text();
  console.log(u, '->', r.url, 'okTitle', /오픈 기념/.test(t), 'cta', /haveslotto\.com/.test(t));
}

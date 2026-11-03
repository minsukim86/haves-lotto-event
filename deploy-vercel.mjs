import { execSync } from 'node:child_process';
import { writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
process.chdir(root);

const names = [
  'haves-lotto-event',
  'haves-evt-01',
  'haves-evt-02',
  'haves-evt-03',
  'haves-evt-04',
  'haves-open-01',
  'haves-open-02',
  'haves-gift-01',
  'haves-gift-02',
  'haves-ticket-01',
];

const scope = 'hosoonlee503-1299';

function run(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  });
}

const results = [];

for (const name of names) {
  const vercelDir = join(root, '.vercel');
  if (existsSync(vercelDir)) rmSync(vercelDir, { recursive: true, force: true });

  try {
    run(`npx --yes vercel project add ${name} --scope ${scope}`);
    console.log('PROJECT', name);
  } catch (e) {
    const msg = String(e.stderr || e.stdout || e.message || e);
    if (/already exists|Project already/i.test(msg)) {
      console.log('PROJECT exists', name);
    } else {
      console.log('PROJECT add note', name, msg.slice(0, 240));
    }
  }

  mkdirSync(vercelDir, { recursive: true });
  // link non-interactively via deploy with --name is deprecated; use project + deploy
  try {
    const out = run(
      `npx --yes vercel deploy --prod --yes --scope ${scope} --name ${name}`,
      { env: { ...process.env, VERCEL_PROJECT_ID: undefined } }
    );
    const urlMatch = out.match(/https:\/\/[^\s]+\.vercel\.app/g) || [];
    const prod =
      urlMatch.find((u) => u.includes(name) && !u.includes('-git-') && !/\w{8,}\.vercel\.app/.test(u.replace('https://',''))) ||
      urlMatch.find((u) => u.startsWith(`https://${name}`)) ||
      `https://${name}.vercel.app`;
    // Prefer stable production domain
    const stable = `https://${name}.vercel.app/`;
    console.log('DEPLOYED', name, '\n', out.slice(-500));
    results.push({ name, url: stable, raw: urlMatch });
  } catch (e) {
    console.error('FAIL', name, String(e.stderr || e.stdout || e.message).slice(0, 800));
    throw e;
  }
}

writeFileSync(join(root, 'reserve-sites.json'), JSON.stringify(results, null, 2));
console.log('\n=== LIVE URLS ===');
results.forEach((r, i) => console.log(`${i + 1}. ${r.url}`));

import { execSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';
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

for (const name of names) {
  const v = join(root, '.vercel');
  if (existsSync(v)) rmSync(v, { recursive: true, force: true });
  console.log('REDEPLOY', name);
  const out = execSync(
    `npx --yes vercel deploy --prod --yes --name ${name} --scope hosoonlee503-1299`,
    { encoding: 'utf8' }
  );
  const alias = (out.match(/Aliased\s+(https:\/\/\S+)/) || [])[1];
  console.log(' OK', alias || name);
}

console.log('done');

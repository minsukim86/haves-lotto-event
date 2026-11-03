import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
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

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function parseJsonBlob(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No JSON in: ' + text.slice(0, 400));
  return JSON.parse(m[0]);
}

const results = [];

for (const name of names) {
  let site;
  try {
    const out = run(`npx --yes netlify-cli sites:create --name ${name} --json`);
    site = parseJsonBlob(out);
    console.log('CREATED', name, site.id);
  } catch (e) {
    const msg = String(e.stderr || e.stdout || e.message || e);
    if (/already exists|name is already taken|Name already/i.test(msg)) {
      console.log('EXISTS', name, '— looking up…');
      const list = parseJsonBlob(run('npx --yes netlify-cli api listSites'));
      const arr = Array.isArray(list) ? list : (list.sites || []);
      site = arr.find((s) => s.name === name || s.default_domain === `${name}.netlify.app`);
      if (!site) throw new Error('Site exists but not found in list: ' + name + '\n' + msg.slice(0, 300));
    } else {
      console.error('FAIL create', name, msg.slice(0, 500));
      throw e;
    }
  }

  try {
    const payload = JSON.stringify({
      site_id: site.id,
      body: { sso_login: false, sso_login_context: 'all' },
    });
    run(`npx --yes netlify-cli api updateSite --data ${JSON.stringify(payload)}`);
  } catch (e) {
    console.log('SSO update warn', name, String(e.message || e).slice(0, 200));
  }

  try {
    run(`npx --yes netlify-cli deploy --prod --dir . --site ${site.id}`);
    console.log('DEPLOYED', name);
  } catch (e) {
    console.error('DEPLOY FAIL', name, String(e.stderr || e.message || e).slice(0, 600));
    throw e;
  }

  results.push({
    name,
    id: site.id,
    url: `https://${name}.netlify.app/`,
  });
}

writeFileSync(join(root, 'reserve-sites.json'), JSON.stringify(results, null, 2));
console.log('\n=== DONE ===');
results.forEach((r, i) => console.log(`${i + 1}. ${r.url}`));

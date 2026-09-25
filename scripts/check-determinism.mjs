// Same inputs, same bytes. Builds the site twice with the same SITE_DATE and fails
// if any file differs, so a deploy only rewrites pages whose content changed.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env, SITE_DATE: process.env.SITE_DATE || '2026-01-01' };

function snapshot() {
  execFileSync(process.execPath, ['build.mjs', '--preview'], { cwd: ROOT, env, stdio: 'ignore' });
  const hashes = new Map();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else hashes.set(path.relative(ROOT, full), crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'));
    }
  };
  walk(path.join(ROOT, 'dist'));
  hashes.set('preview.html', crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'preview.html'))).digest('hex'));
  return hashes;
}

const a = snapshot();
const b = snapshot();
const differ = [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k));
if (differ.length) {
  console.error(`Not deterministic: ${differ.length} file(s) differ between two identical builds:\n  ${differ.join('\n  ')}`);
  process.exit(1);
}
console.log(`Deterministic: ${a.size} files identical across two builds (SITE_DATE=${env.SITE_DATE}).`);

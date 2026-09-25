// Serve dist/ for tests and local review. No dependencies.
// The same files answer at "/" and at "/eunice-site/", because the live site sits
// under a base path on GitHub Pages and every internal link is relative: tests run
// against both, so a link that only works at one of them fails.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT || 4173);
const BASE = '/eunice-site';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2',
};

function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p === BASE) p = '/';
  else if (p.startsWith(BASE + '/')) p = p.slice(BASE.length);
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) return null; // no path traversal out of dist/
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) return path.join(file, 'index.html');
  return file;
}

http.createServer((req, res) => {
  const file = resolve(req.url || '/');
  if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
    return;
  }
  res.writeHead(404, { 'content-type': TYPES['.html'] });
  fs.createReadStream(path.join(ROOT, '404.html')).pipe(res);
}).listen(PORT, () => console.log(`dist/ on http://localhost:${PORT}/ and http://localhost:${PORT}${BASE}/`));

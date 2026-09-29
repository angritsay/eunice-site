// Width and height of an image under src/assets, read from its header at build time.
// An <img> that carries them keeps its box while the file loads, so the page does not
// jump when it arrives (a plate with no size is 0px tall until then).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');

/** PNG, JPEG or SVG (from its viewBox); null for anything else. `file` is relative to src/assets. */
export function imageSize(file: string): { width: number; height: number } | null {
  const b = fs.readFileSync(path.join(ASSETS, file));
  if (file.endsWith('.svg')) {
    const box = /viewBox="[\d.-]+[ ,]+[\d.-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/.exec(b.toString('utf8'));
    return box ? { width: Number(box[1]), height: Number(box[2]) } : null;
  }
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  for (let i = 2; i + 9 < b.length; ) {
    if (b[i] !== 0xff) break;
    const marker = b[i + 1] ?? 0;
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

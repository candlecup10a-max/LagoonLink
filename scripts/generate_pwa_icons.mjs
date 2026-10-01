import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Helper to create a valid RGBA PNG buffer of width x height with a lagoon gradient & center emblem
function createPngBuffer(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth 8
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * (isMaskable ? 0.34 : 0.42);
  const ringR = maxR * 0.72;

  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);

      // Deep lagoon background (#07131D -> #0284C7)
      let r = 7;
      let g = 28 + Math.round((y / height) * 60);
      let b = 45 + Math.round((y / height) * 110);
      let a = 255;

      if (dist <= maxR) {
        // Inner circular game token badge
        r = 56;
        g = 189;
        b = 248;
        if (dist <= ringR) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(raw);
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', iend),
  ]);
}

const publicDir = path.resolve('public');
fs.mkdirSync(publicDir, { recursive: true });

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="lagoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#07131D" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#lagoonGrad)" />
  <path d="M128 340 Q256 180 384 320" fill="none" stroke="#38BDF8" stroke-width="36" stroke-linecap="round" />
  <path d="M128 340 Q256 180 384 320" fill="none" stroke="#1D4ED8" stroke-width="20" stroke-linecap="round" />
  <circle cx="128" cy="340" r="44" fill="#FFFFFF" stroke="#38BDF8" stroke-width="10" />
  <circle cx="256" cy="252" r="44" fill="#FACC15" stroke="#FFFFFF" stroke-width="10" />
  <circle cx="384" cy="320" r="44" fill="#FFFFFF" stroke="#38BDF8" stroke-width="10" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg, 'utf8');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngBuffer(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngBuffer(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPngBuffer(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngBuffer(180, 180, false));

console.log('Generated PWA SVG and PNG icons in /public');

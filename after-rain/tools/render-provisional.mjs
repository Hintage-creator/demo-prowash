// Renders the two provisional product images (dry / wet) with Chromium's canvas.
// Both share the exact same geometry so the crossfade and the compare slider line up.
// Replace images/jacket-dry.jpg and images/jacket-wet.jpg with the real photos when they exist.
//
// Usage (from the repo root): node after-rain/tools/render-provisional.mjs
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// CommonJS require so a globally installed Playwright (NODE_PATH) is found too.
const { chromium } = createRequire(import.meta.url)('playwright');

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'images');

function render(kind) {
  const W = 1200, H = 1500, CX = 600, wet = kind === 'wet';
  const rng = seed => () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const canvas = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const lerpFn = pts => y => {
    if (y <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (y <= pts[i][0]) { const [y0, v0] = pts[i - 1], [y1, v1] = pts[i]; return v0 + (v1 - v0) * (y - y0) / (y1 - y0); }
    }
    return pts[pts.length - 1][1];
  };
  const BASE = '#6a1828';

  // Shading for a quilted column (body, sleeve, hood) inside the current clip.
  function shadeColumn(x, cx, top, y0, y1, n, hwMax, opts = {}) {
    const h = (y1 - y0) / n;
    const L = cx - hwMax - 40, R = cx + hwMax + 40;
    const lg = x.createLinearGradient(0, top, 0, y1);
    lg.addColorStop(0, '#74202f'); lg.addColorStop(1, '#4e1020');
    x.fillStyle = lg; x.fillRect(L - 200, top - 200, R - L + 400, y1 - top + 400);
    for (let i = 0; i < n; i++) {
      const a = y0 + i * h, g = x.createLinearGradient(0, a, 0, a + h);
      g.addColorStop(0, 'rgba(14,2,5,.78)');
      g.addColorStop(.12, 'rgba(14,2,5,.22)');
      g.addColorStop(.34, `rgba(255,205,205,${wet ? .16 : .12})`);
      g.addColorStop(.58, 'rgba(0,0,0,0)');
      g.addColorStop(.86, 'rgba(14,2,5,.32)');
      g.addColorStop(1, 'rgba(14,2,5,.8)');
      x.fillStyle = g; x.fillRect(L - 200, a, R - L + 400, h);
      // crest sheen: matte when dry, glossy when wet
      const sy = a + h * .3, sh = wet ? 9 : 16, sg = x.createLinearGradient(0, sy - sh, 0, sy + sh);
      sg.addColorStop(0, 'rgba(255,225,220,0)');
      sg.addColorStop(.5, `rgba(255,225,220,${wet ? .15 : .06})`);
      sg.addColorStop(1, 'rgba(255,225,220,0)');
      x.fillStyle = sg; x.fillRect(L - 200, sy - sh, R - L + 400, sh * 2);
    }
    if (opts.topBand) {
      const g = x.createLinearGradient(0, top, 0, y0);
      g.addColorStop(0, 'rgba(255,205,205,.08)'); g.addColorStop(1, 'rgba(14,2,5,.5)');
      x.fillStyle = g; x.fillRect(L - 200, top, R - L + 400, y0 - top);
    }
    // cylinder: darker toward both sides, key light from the left
    const cg = x.createLinearGradient(L, 0, R, 0);
    cg.addColorStop(0, 'rgba(8,1,3,.7)');
    cg.addColorStop(.16, 'rgba(8,1,3,.18)');
    cg.addColorStop(.38, 'rgba(255,215,210,.07)');
    cg.addColorStop(.62, 'rgba(0,0,0,0)');
    cg.addColorStop(.86, 'rgba(8,1,3,.3)');
    cg.addColorStop(1, 'rgba(8,1,3,.78)');
    x.fillStyle = cg; x.fillRect(L - 200, top - 200, R - L + 400, y1 - top + 400);
    // stitch lines
    for (let i = 1; i < n; i++) {
      const s = y0 + i * h;
      x.fillStyle = 'rgba(8,1,3,.55)'; x.fillRect(L - 200, s - 1.5, R - L + 400, 3);
      x.fillStyle = 'rgba(255,210,210,.05)'; x.fillRect(L - 200, s + 2, R - L + 400, 1);
    }
  }

  // Outline with scalloped sides, one bulge per channel.
  function sides(x, cx, y0, n, h, hw, bulge, from, toTop) {
    for (let i = from; i < n; i++) {
      const a = y0 + i * h, m = a + h / 2, b = a + h;
      x.quadraticCurveTo(cx + hw(m) + bulge * 2, m, cx + hw(b), b);
    }
    return () => {
      for (let i = n - 1; i >= toTop; i--) {
        const a = y0 + i * h, m = a + h / 2;
        x.quadraticCurveTo(cx - hw(m) - bulge * 2, m, cx - hw(a), a);
      }
    };
  }

  const J = canvas(), x = J.getContext('2d');

  // ---- Sleeves (behind the body) ----
  function sleeve(dir) {
    const top = [CX + dir * 228, 512], cuff = [CX + dir * 352, 1196];
    const dx = cuff[0] - top[0], dy = cuff[1] - top[1], len = Math.hypot(dx, dy);
    x.save();
    x.translate(top[0], top[1]); x.rotate(Math.atan2(-dx, dy));
    const y0 = 34, y1 = len - 44, n = 7, h = (y1 - y0) / n;
    const hw = lerpFn([[0, 96], [len, 72]]);
    x.beginPath();
    x.moveTo(-hw(y0), y0);
    x.bezierCurveTo(-hw(y0), -46, hw(y0), -46, hw(y0), y0);
    const back = sides(x, 0, y0, n, h, hw, 6, 0, 0);
    x.quadraticCurveTo(0, y1 + 10, -hw(y1), y1);
    back();
    x.closePath();
    x.save(); x.clip();
    shadeColumn(x, 0, -60, y0, y1, n, 96, { topBand: true });
    x.restore();
    // knit cuff
    x.beginPath();
    x.roundRect(-64, y1 - 6, 128, 50, [6, 6, 14, 14]);
    const cg = x.createLinearGradient(-64, 0, 64, 0);
    cg.addColorStop(0, '#1e060b'); cg.addColorStop(.4, '#3a0d17'); cg.addColorStop(1, '#16040a');
    x.fillStyle = cg; x.fill();
    x.save(); x.clip();
    x.strokeStyle = 'rgba(255,200,200,.06)'; x.lineWidth = 2;
    for (let r = -60; r < 64; r += 6) { x.beginPath(); x.moveTo(r, y1 - 6); x.lineTo(r, y1 + 44); x.stroke(); }
    x.restore();
    x.restore();
  }
  sleeve(-1); sleeve(1);

  // ---- Hood ----
  x.save();
  x.beginPath();
  x.moveTo(CX - 120, 436);
  x.bezierCurveTo(CX - 222, 410, CX - 238, 214, CX - 158, 160);
  x.bezierCurveTo(CX - 100, 118, CX + 100, 118, CX + 158, 160);
  x.bezierCurveTo(CX + 238, 214, CX + 222, 410, CX + 120, 436);
  x.closePath();
  x.save(); x.clip();
  shadeColumn(x, CX, 110, 130, 440, 5, 230);
  x.restore();
  // face opening, dark interior with a rolled rim
  x.beginPath();
  x.moveTo(CX - 104, 414);
  x.bezierCurveTo(CX - 142, 330, CX - 118, 186, CX, 182);
  x.bezierCurveTo(CX + 118, 186, CX + 142, 330, CX + 104, 414);
  x.closePath();
  const ig = x.createRadialGradient(CX, 360, 10, CX, 320, 170);
  ig.addColorStop(0, '#2a0a11'); ig.addColorStop(.7, '#12040799'); ig.addColorStop(1, '#0a0204');
  x.fillStyle = '#0b0204'; x.fill();
  x.fillStyle = ig; x.fill();
  x.lineWidth = 24; x.strokeStyle = 'rgba(96,24,38,.95)'; x.stroke();
  x.lineWidth = 10; x.strokeStyle = 'rgba(255,205,205,.07)'; x.stroke();
  x.lineWidth = 3; x.strokeStyle = 'rgba(8,1,3,.6)'; x.stroke();
  x.restore();

  // ---- Funnel collar ----
  x.save();
  x.beginPath(); x.roundRect(CX - 122, 376, 244, 72, 18);
  x.save(); x.clip();
  shadeColumn(x, CX, 376, 376, 448, 1, 122);
  x.restore();
  x.restore();

  // ---- Body ----
  const y0 = 422, y1 = 1298, n = 9, h = (y1 - y0) / n;
  const hw = lerpFn([[422, 120], [y0 + h, 252], [700, 262], [960, 254], [1298, 270]]);
  const bodyPath = () => {
    x.beginPath();
    x.moveTo(CX - hw(y0 + h), y0 + h);
    x.quadraticCurveTo(CX - hw(y0 + h) * .86, y0 + 6, CX - 116, y0);
    x.lineTo(CX + 116, y0);
    x.quadraticCurveTo(CX + hw(y0 + h) * .86, y0 + 6, CX + hw(y0 + h), y0 + h);
    const back = sides(x, CX, y0, n, h, hw, 7, 1, 1);
    x.quadraticCurveTo(CX, y1 + 26, CX - hw(y1), y1);
    back();
    x.closePath();
  };
  x.save();
  bodyPath();
  x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 34; x.fillStyle = BASE; x.fill();
  x.restore();
  x.save();
  bodyPath(); x.clip();
  shadeColumn(x, CX, y0, y0, y1, n, 270);
  // storm flap shadow + zipper
  const zf = x.createLinearGradient(CX - 30, 0, CX + 30, 0);
  zf.addColorStop(0, 'rgba(8,1,3,0)'); zf.addColorStop(.42, 'rgba(8,1,3,.5)'); zf.addColorStop(.58, 'rgba(8,1,3,.5)'); zf.addColorStop(1, 'rgba(8,1,3,0)');
  x.fillStyle = zf; x.fillRect(CX - 30, y0, 60, y1 - y0 + 40);
  x.restore();
  const zip = (ya, yb) => {
    x.fillStyle = '#16050a'; x.fillRect(CX - 6, ya, 12, yb - ya);
    x.fillStyle = 'rgba(255,215,215,.12)';
    for (let y = ya; y < yb; y += 6) x.fillRect(CX - 4, y, 8, 2);
  };
  zip(384, 1312);
  x.beginPath(); x.roundRect(CX - 9, 392, 18, 50, 6);
  const zg = x.createLinearGradient(CX - 9, 0, CX + 9, 0);
  zg.addColorStop(0, '#24090f'); zg.addColorStop(.5, '#4a1a22'); zg.addColorStop(1, '#1a060b');
  x.fillStyle = zg; x.fill();
  x.lineWidth = 1; x.strokeStyle = 'rgba(255,215,215,.18)'; x.stroke();
  // welt pockets
  [[-1], [1]].forEach(([d]) => {
    x.save();
    x.translate(CX + d * 178, 990); x.rotate(d * -.32);
    x.fillStyle = 'rgba(8,1,3,.85)'; x.fillRect(-3, -62, 6, 124);
    x.fillStyle = 'rgba(255,210,210,.08)'; x.fillRect(4, -62, 2, 124);
    x.restore();
  });

  // ---- Whole-garment light ----
  x.save();
  x.globalCompositeOperation = 'source-atop';
  const kl = x.createRadialGradient(CX - 220, 320, 0, CX - 220, 320, 1150);
  kl.addColorStop(0, 'rgba(255,220,212,.14)'); kl.addColorStop(.55, 'rgba(0,0,0,0)'); kl.addColorStop(1, 'rgba(0,0,0,.35)');
  x.fillStyle = kl; x.fillRect(0, 0, W, H);
  x.restore();

  // ---- Wet: deeper tone, tonal cheetah, beads of water ----
  if (wet) {
    const orig = canvas(); orig.getContext('2d').drawImage(J, 0, 0);
    const S = canvas(), s = S.getContext('2d'), r = rng(19);
    s.fillStyle = 'rgb(196,176,182)'; s.fillRect(0, 0, W, H);
    s.filter = 'blur(1.3px)';
    s.fillStyle = 'rgb(118,66,78)';
    const cell = 38;
    for (let gy = 0; gy < H / cell + 1; gy++) {
      for (let gx = -1; gx < W / cell + 1; gx++) {
        if (r() < .12) continue;
        const cx = (gx + .5 + (r() - .5) * .9) * cell + (gy % 2 ? cell * .5 : 0);
        const cy = (gy + .5 + (r() - .5) * .9) * cell;
        const rad = 5 + r() * r() * 11 + r() * 3, k = 9, pts = [];
        for (let i = 0; i < k; i++) {
          const a = i / k * Math.PI * 2, rr = rad * (.62 + r() * .6);
          pts.push([cx + Math.cos(a) * rr * 1.1, cy + Math.sin(a) * rr * .9]);
        }
        const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        const m0 = mid(pts[k - 1], pts[0]);
        s.beginPath(); s.moveTo(m0[0], m0[1]);
        for (let i = 0; i < k; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % k]); s.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
        s.closePath(); s.fill();
      }
    }
    // Only tint fully opaque fabric, never the soft shadow around the garment.
    const od = orig.getContext('2d').getImageData(0, 0, W, H).data;
    const M = canvas(), mx = M.getContext('2d'), md = mx.createImageData(W, H);
    for (let i = 3; i < od.length; i += 4) { md.data[i] = od[i] > 250 ? 255 : 0; }
    mx.putImageData(md, 0, 0);
    s.filter = 'none';
    s.globalCompositeOperation = 'destination-in'; s.drawImage(M, 0, 0);
    x.save(); x.globalCompositeOperation = 'multiply'; x.drawImage(S, 0, 0); x.restore();

    const onJacket = (px, py) => od[((py | 0) * W + (px | 0)) * 4 + 3] > 250;
    const dr = rng(5);
    for (let i = 0; i < 190; i++) {
      const px = 220 + dr() * 760, py = 140 + dr() * 1180;
      if (!onJacket(px, py)) continue;
      const rr = 2 + dr() * dr() * 6;
      const g = x.createRadialGradient(px - rr * .3, py - rr * .35, 0, px, py, rr);
      g.addColorStop(0, 'rgba(255,240,236,.85)'); g.addColorStop(.35, 'rgba(255,220,220,.12)');
      g.addColorStop(.8, 'rgba(10,1,3,.35)'); g.addColorStop(1, 'rgba(255,220,220,.2)');
      x.fillStyle = g; x.beginPath(); x.ellipse(px, py, rr, rr * 1.15, 0, 0, Math.PI * 2); x.fill();
    }
  }

  // ---- Studio backdrop ----
  const O = canvas(), o = O.getContext('2d');
  const bg = o.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, wet ? '#150a0d' : '#1a0c0f'); bg.addColorStop(.72, wet ? '#0f0709' : '#12080a'); bg.addColorStop(1, '#0a0506');
  o.fillStyle = bg; o.fillRect(0, 0, W, H);
  const glow = o.createRadialGradient(CX, 640, 0, CX, 640, 760);
  glow.addColorStop(0, wet ? 'rgba(96,22,38,.55)' : 'rgba(120,30,48,.5)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
  o.fillStyle = glow; o.fillRect(0, 0, W, H);
  const fl = o.createRadialGradient(CX, 1352, 0, CX, 1352, 420);
  fl.addColorStop(0, 'rgba(0,0,0,.75)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
  o.save(); o.translate(0, 1352); o.scale(1, .12); o.translate(0, -1352); o.fillStyle = fl; o.fillRect(0, 900, W, 900); o.restore();
  o.save();
  o.shadowColor = 'rgba(0,0,0,.7)'; o.shadowBlur = 70; o.shadowOffsetY = 34;
  o.drawImage(J, 0, 0);
  o.restore();
  const vg = o.createRadialGradient(CX, 700, 380, CX, 700, 1050);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
  o.fillStyle = vg; o.fillRect(0, 0, W, H);
  const T = canvas(180, 180), tx = T.getContext('2d'), id = tx.createImageData(180, 180), gr = rng(3);
  for (let i = 0; i < id.data.length; i += 4) { const v = gr() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 12; }
  tx.putImageData(id, 0, 0);
  o.fillStyle = o.createPattern(T, 'repeat'); o.fillRect(0, 0, W, H);
  return O.toDataURL('image/jpeg', .9);
}

const browser = await chromium.launch();
const page = await browser.newPage();
for (const kind of ['dry', 'wet']) {
  const url = await page.evaluate(render, kind);
  const file = path.join(outDir, `jacket-${kind}.jpg`);
  await writeFile(file, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', file);
}
await browser.close();

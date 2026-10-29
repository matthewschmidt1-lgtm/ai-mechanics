/* Chapter 9 figures: mixture of experts. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const { S, C, T, R, L, P, rise, label } = Kit;
  const grp = (g, d) => { const e = S('g'); g.append(e); return rise(e, d); };
  const NS = [1, 4, 16], ES = [1, 8, 64];
  const LOSS = [[2.50, 2.30, 2.18], [2.20, 2.06, 1.98], [1.95, 1.86, 1.81]];   /* rows: active size N, columns: experts E */
  const arrow = (p, x1, y1, x2, y2, col = C.mute, sw = 2.5) => { P(p, `M${x1} ${y1} L${x2} ${y2}`, { stroke: col, sw }); const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; p.append(S('polygon', { points: '0,0 -11,-6 -11,6', fill: col, transform: `translate(${x2},${y2}) rotate(${a})` })); };

  function ill1(g) {
    label(g, 'A ROUTER PICKS TWO OF EIGHT EXPERTS FOR EACH TOKEN', 600, 66);
    const t = grp(g, .1); R(t, 70, 270, 150, 70, { r: 16, fill: C.blue + '33', stroke: C.blue, sw: 3 }); T(t, 'bank', 145, 316, { size: 32, weight: 700, anchor: 'middle' }); T(t, 'token', 145, 258, { size: 18, fill: C.mute, anchor: 'middle', ls: 2 });
    const r = grp(g, .5); R(r, 330, 255, 170, 100, { r: 20, fill: C.yellow + '22', stroke: C.yellow, sw: 3 }); T(r, 'Router', 415, 316, { size: 30, weight: 700, anchor: 'middle' });
    arrow(grp(g, .4), 222, 305, 328, 305);
    const pick = new Set([1, 4]);
    for (let i = 0; i < 8; i++) {
      const cx = 640 + (i % 2) * 230, cy = 120 + Math.floor(i / 2) * 105, on = pick.has(i), e = grp(g, 1.0 + i * .08);
      R(e, cx, cy, 190, 76, { r: 16, fill: on ? C.green + '33' : 'none', stroke: on ? C.green : C.dim, sw: on ? 3.5 : 2, dash: on ? 'none' : '6 6' });
      T(e, 'Expert ' + (i + 1), cx + 95, cy + 47, { size: 24, weight: on ? 700 : 500, fill: on ? C.ink : C.dim, anchor: 'middle' });
      const a = grp(g, 1.8); if (on) arrow(a, 502, 305, cx - 2, cy + 38, C.green, 3.5); else P(a, `M502 305 L${cx - 2} ${cy + 38}`, { stroke: C.line, sw: 1.5 });
    }
    rise(T(g, 'Chosen: 2 experts. The other 6 stay idle for this token.', 600, 568, { size: 24, fill: C.mute, anchor: 'middle' }), 2.3);
  }

  function ill2(g) {
    label(g, 'LOSS FOR EACH SIZE AND EXPERT COUNT  (INVENTED NUMBERS)', 600, 66);
    const x0 = 360, y0 = 190, cw = 190, ch = 95, lo = 1.81, hi = 2.50;
    ES.forEach((e, j) => { const a = grp(g, .1 + j * .1); T(a, e === 1 ? '1 expert' : e + ' experts', x0 + j * cw + cw / 2, y0 - 24, { size: 24, weight: 700, anchor: 'middle' }); });
    T(grp(g, .1), 'EXPERTS', x0 + 1.5 * cw, 120, { size: 18, weight: 700, fill: C.mute, ls: 3, anchor: 'middle' });
    T(grp(g, .1), 'ACTIVE SIZE', 90, y0 - 24, { size: 18, weight: 700, fill: C.mute, ls: 3 });
    NS.forEach((n, i) => {
      const a = grp(g, .2 + i * .2); T(a, n + 'B', x0 - 24, y0 + i * ch + ch / 2 + 9, { size: 28, weight: 700, anchor: 'end' });
      ES.forEach((e, j) => { const v = LOSS[i][j], k = (hi - v) / (hi - lo), c = grp(g, .5 + i * .25 + j * .15);
        R(c, x0 + j * cw + 4, y0 + i * ch + 4, cw - 8, ch - 8, { r: 14, fill: C.green, }).setAttribute('fill-opacity', .12 + k * .7); T(c, v.toFixed(2), x0 + j * cw + cw / 2, y0 + i * ch + ch / 2 + 11, { size: 34, mono: true, weight: 700, anchor: 'middle' }); });
      const gain = LOSS[i][0] - LOSS[i][2], b = grp(g, 1.6 + i * .2); T(b, `experts save ${gain.toFixed(2)}`, x0 + 3 * cw + 24, y0 + i * ch + ch / 2 + 9, { size: 24, weight: 700, fill: C.yellow });
    });
    rise(T(g, 'Lower is better. In this table, experts help less as the active size grows.', 600, 568, { size: 24, fill: C.mute, anchor: 'middle' }), 2.4);
  }

  function ill3(g) {
    label(g, 'STORED VERSUS USED  (INVENTED MODEL: 41B TOTAL, 11B ACTIVE)', 600, 66);
    const bars = [['Stored in memory', 41, '82 GB', C.orange, 150, 'every expert must be ready'], ['Used for one token', 11, '22 GB', C.green, 340, 'only the shared parts and chosen experts compute']];
    bars.forEach(([t, n, gb, col, y, d], i) => { const e = grp(g, .2 + i * .6), w = n / 41 * 800;
      T(e, t, 150, y - 18, { size: 26, weight: 700, fill: col }); R(e, 150, y, w, 70, { r: 14, fill: col }); T(e, `${n}B`, 170, y + 46, { size: 30, weight: 800, fill: '#000' });
      T(e, gb, 150 + w + 20, y + 46, { size: 32, mono: true, weight: 800 }); T(e, d, 150, y + 108, { size: 21, fill: C.mute }); });
    rise(T(g, 'Fewer calculations per token do not mean less memory.', 600, 556, { size: 26, fill: C.mute, anchor: 'middle' }), 1.8);
  }
  window.__STAGES7 = [{ ill: ill1 }, { ill: ill2 }, { ill: ill3 }];
  window.__MOE = { NS, ES, LOSS };
})();

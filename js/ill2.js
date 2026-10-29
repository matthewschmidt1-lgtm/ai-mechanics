/* Chapter 2 figures: attention. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const { S, C, T, R, L, P, rise, label, softmax } = Kit;
  const grp = (g, d) => { const e = S('g'); g.append(e); return rise(e, d); };
  const SENT = ['The', 'animal', 'didn’t', 'cross', 'the', 'street', 'because', 'it'];
  const W10 = [.02, .55, .04, .05, .03, .15, .08, .08];     /* illustrative weights for "it" over the 8 words up to and including itself */
  /* the worked example: tokens animal, street, it */
  const q = [2, 1], K = [[1.5, 1], [-1, .5], [.5, .5]], V = [[1, 0], [0, 1], [.5, .5]], names = ['animal', 'street', 'it'];
  const sc = K.map(k => (q[0] * k[0] + q[1] * k[1]) / Math.sqrt(2)), wt = softmax(sc);
  const out = [0, 1].map(j => wt.reduce((a, w, i) => a + w * V[i][j], 0));

  function ill1(g) {
    label(g, 'WHAT DOES “it” MEAN?', 600, 70);
    const w = 108, gap = 8, x0 = (1200 - (SENT.length * w + (SENT.length - 1) * gap)) / 2, cy = 430, cx = SENT.map((_, i) => x0 + i * (w + gap) + w / 2);
    SENT.forEach((s, i) => { const e = grp(g, .05 + i * .05), hot = i === 7; R(e, cx[i] - w / 2, cy - 30, w, 60, { r: 14, fill: hot ? C.blue + '33' : C.panel, stroke: hot ? C.blue : C.line, sw: hot ? 3 : 2 }); T(e, s, cx[i], cy + 9, { size: 24, weight: 600, anchor: 'middle', fill: i === 1 ? C.yellow : C.ink }); });
    const tot = W10.reduce((a, b) => a + b, 0);
    W10.forEach((wv, i) => { if (i === 7) return; const p = wv / tot, h = 70 + (7 - i) * 22, e = grp(g, .9 + i * .08);
      P(e, `M${cx[7]} ${cy - 32} C ${cx[7]} ${cy - 32 - h}, ${cx[i]} ${cy - 32 - h}, ${cx[i]} ${cy - 32}`, { stroke: i === 1 ? C.yellow : C.blue, sw: 2 + p * 22, op: .3 + p * 1.2 }); });
    const a = grp(g, 1.6); T(a, '55%', cx[1], 200, { size: 28, weight: 800, fill: C.yellow, anchor: 'middle' }); T(a, '15%', cx[5], 238, { size: 22, weight: 700, fill: C.blue, anchor: 'middle' });
    rise(T(g, '“it” looks back at every earlier word and borrows most from “animal”.', 600, 540, { size: 26, fill: C.mute, anchor: 'middle' }), 2.0);
  }

  function ill2(g) {
    const cols = [['QUERY', 'what I am looking for', 150], ['KEY', 'what each word offers', 500], ['VALUE', 'what each word gives', 880]];
    cols.forEach(([t, d, x], i) => { const e = grp(g, .05 + i * .1); T(e, t, x + 90, 112, { size: 30, weight: 800, fill: [C.cyan, C.yellow, C.green][i], anchor: 'middle', ls: 3 }); T(e, d, x + 90, 144, { size: 20, fill: C.mute, anchor: 'middle' }); });
    const qb = grp(g, .5); R(qb, 60, 270, 180, 100, { r: 18, fill: C.cyan + '22', stroke: C.cyan, sw: 3 }); T(qb, 'it', 150, 332, { size: 40, weight: 700, anchor: 'middle' });
    names.forEach((n, i) => {
      const y = 200 + i * 120, e = grp(g, .9 + i * .25);
      P(e, `M240 320 C 330 320, 330 ${y + 40}, 410 ${y + 40}`, { stroke: C.cyan, sw: 2.5, op: .7 });
      R(e, 410, y, 180, 80, { r: 16, fill: C.yellow + '22', stroke: C.yellow, sw: 2.5 }); T(e, n, 500, y + 50, { size: 30, weight: 600, anchor: 'middle' });
      P(e, `M590 ${y + 40} H 790 M778 ${y + 30} L790 ${y + 40} L778 ${y + 50}`, { stroke: C.dim, sw: 2.5 });
      R(e, 790, y, 180, 80, { r: 16, fill: C.green + '22', stroke: C.green, sw: 2.5 }); T(e, n, 880, y + 50, { size: 30, weight: 600, anchor: 'middle' });
    });
    rise(T(g, 'The query is compared with every key. The best matches decide how much of each value to take.', 600, 570, { size: 24, fill: C.mute, anchor: 'middle' }), 2.0);
  }

  function ill3(g) {
    label(g, 'ONE WORD (“it”) READING THREE WORDS', 600, 70);
    const hd = grp(g, .05); [['word', 150], ['score', 400], ['weight', 640], ['value', 960]].forEach(([t, x]) => T(hd, t.toUpperCase(), x, 130, { size: 18, weight: 700, fill: C.mute, ls: 3, anchor: x === 150 ? 'start' : 'middle' }));
    names.forEach((n, i) => {
      const y = 160 + i * 86, e = grp(g, .3 + i * .35);
      T(e, n, 150, y + 40, { size: 30, weight: 600 }); T(e, sc[i].toFixed(2), 400, y + 40, { size: 28, mono: true, anchor: 'middle', fill: sc[i] < 0 ? C.pink : C.ink });
      R(e, 520, y + 12, 240, 36, { r: 8, fill: C.panel2 }); R(e, 520, y + 12, Math.max(4, wt[i] * 240), 36, { r: 8, fill: i === 0 ? C.yellow : C.blue });
      T(e, (wt[i] * 100).toFixed(1) + '%', 780, y + 40, { size: 24, mono: true, weight: 700 });
      T(e, `(${V[i][0]}, ${V[i][1]})`, 960, y + 40, { size: 28, mono: true, anchor: 'middle' });
    });
    const o = grp(g, 1.7); L(o, 140, 440, 1060, 440, { stroke: C.dim, sw: 2 });
    T(o, 'blend', 150, 492, { size: 26, weight: 700, fill: C.green });
    T(o, `${wt.map((w, i) => w.toFixed(2) + ' × (' + V[i][0] + ', ' + V[i][1] + ')').join('  +  ')}`, 600, 492, { size: 22, mono: true, anchor: 'middle', fill: C.mute });
    T(o, `=  (${out[0].toFixed(2)}, ${out[1].toFixed(2)})`, 600, 540, { size: 34, mono: true, weight: 800, anchor: 'middle', fill: C.green });
  }

  function ill4(g) {
    label(g, 'WHO CAN READ WHOM', 600, 70);
    const words = ['The', 'cat', 'sat', 'on', 'the'], n = 5, cs = 66, x0 = 430, y0 = 150;
    const raw = [[0], [1, 2], [1.0, 2.0, .5], [.1, .8, 1.4, 1.9], [.5, 1.1, .3, 1.5, 1.2]];
    const wts = raw.map(r => softmax(r));
    words.forEach((w, i) => {
      const e = grp(g, .1 + i * .06); T(e, w, x0 - 18, y0 + i * cs + cs / 2 + 8, { size: 24, weight: 600, anchor: 'end' }); T(e, w, x0 + i * cs + cs / 2, y0 - 16, { size: 20, weight: 600, anchor: 'middle', fill: C.mute });
    });
    wts.forEach((r, i) => { for (let j = 0; j < n; j++) { const e = grp(g, .4 + i * .12 + j * .02);
      if (j <= i) { R(e, x0 + j * cs + 3, y0 + i * cs + 3, cs - 6, cs - 6, { r: 10, fill: C.blue, }).setAttribute('fill-opacity', .15 + r[j] * .85); T(e, (r[j] * 100).toFixed(0), x0 + j * cs + cs / 2, y0 + i * cs + cs / 2 + 7, { size: 20, mono: true, weight: 700, anchor: 'middle' }); }
      else { R(e, x0 + j * cs + 3, y0 + i * cs + 3, cs - 6, cs - 6, { r: 10, fill: 'none', stroke: C.dim, sw: 2, dash: '5 5' }); T(e, '×', x0 + j * cs + cs / 2, y0 + i * cs + cs / 2 + 8, { size: 24, anchor: 'middle', fill: C.dim }); } } });
    const a = grp(g, 1.8); T(a, 'ROWS', 60, 190, { size: 18, weight: 700, fill: C.mute, ls: 3 }); T(a, 'Each row is one word', 60, 222, { size: 22, fill: C.ink }); T(a, 'collecting clues.', 60, 250, { size: 22, fill: C.ink });
    const b = grp(g, 2.2); T(b, 'BLOCKED', 800, 190, { size: 18, weight: 700, fill: C.pink, ls: 3 }); T(b, 'The × cells are later', 800, 222, { size: 22 }); T(b, 'words. They get 0%.', 800, 250, { size: 22 });
    rise(T(g, 'Numbers are percentages. Each row adds up to about 100%. Values are illustrative.', 600, 570, { size: 22, fill: C.mute, anchor: 'middle' }), 2.4);
  }
  window.__STAGES4 = [{ ill: ill1 }, { ill: ill2 }, { ill: ill3 }, { ill: ill4 }];
  window.__ATTN = { q, K, V, names, sc, wt, out };
})();

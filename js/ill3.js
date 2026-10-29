/* Chapter 3 figures: the transformer block. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const { S, C, T, R, L, P, rise, label } = Kit;
  const grp = (g, d) => { const e = S('g'); g.append(e); return rise(e, d); };
  const dot = (p, x, y, r, fill) => { const c = S('circle', { cx: x, cy: y, r, fill }); p.append(c); return c; };
  const arrow = (p, x1, y1, x2, y2, col = C.mute) => { P(p, `M${x1} ${y1} L${x2} ${y2}`, { stroke: col, sw: 2.5 }); const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; p.append(S('polygon', { points: '0,0 -12,-6.5 -12,6.5', fill: col, transform: `translate(${x2},${y2}) rotate(${a})` })); };

  function ill1(g) {
    const heads = [['Head 1', 'the word just before', C.blue, (i) => i > 0 ? [i - 1] : []], ['Head 2', 'the first word', C.cyan, (i) => i > 0 ? [0] : []], ['Head 3', 'the subject, “cat”', C.yellow, (i) => i >= 2 ? [1] : []], ['Head 4', 'a broad blend', C.pink, (i) => [...Array(i).keys()]]];
    const words = ['The', 'cat', 'sat', 'on', 'the'];
    heads.forEach(([t, d, col, links], k) => {
      const x = 60 + (k % 2) * 580, y = 70 + Math.floor(k / 2) * 240, e = grp(g, .1 + k * .35), xs = (i) => x + 60 + i * 100, yb = y + 170;
      R(e, x, y, 520, 220, { r: 22, fill: C.panel, stroke: C.line });
      T(e, t, x + 24, y + 38, { size: 26, weight: 700, fill: col }); T(e, d, x + 496, y + 38, { size: 20, fill: C.mute, anchor: 'end' });
      for (let i = 0; i < 5; i++) links(i).forEach(j => { const hh = 28 + (i - j) * 18; P(e, `M${xs(i)} ${yb - 8} C ${xs(i)} ${yb - 8 - hh}, ${xs(j)} ${yb - 8 - hh}, ${xs(j)} ${yb - 8}`, { stroke: col, sw: k === 3 ? 1.6 : 3, op: k === 3 ? .55 : .95 }); });
      words.forEach((w, i) => { dot(e, xs(i), yb, 9, col); T(e, w, xs(i), yb + 30, { size: 20, weight: 600, anchor: 'middle' }); });
    });
    rise(T(g, 'Patterns are illustrative. The results from all four heads are joined side by side.', 600, 572, { size: 22, fill: C.mute, anchor: 'middle' }), 1.8);
  }

  function ill2(g) {
    label(g, 'EACH WORD THINKS ALONE', 600, 66);
    const cell = 34, step = 46, dim = new Set([0, 3, 5, 6, 9, 12, 14]);
    const stack = (x, n, d0, col) => { const e = grp(g, d0); for (let i = 0; i < n; i++) R(e, x, 170 + i * step, cell, cell, { r: 8, fill: col }); return e; };
    stack(150, 4, .1, C.blue);
    const mid = grp(g, .7);
    for (let i = 0; i < 16; i++) { const cx = 480 + (i % 4) * step, cy = 170 + Math.floor(i / 4) * step, off = dim.has(i); R(mid, cx, cy, cell, cell, { r: 8, fill: off ? 'none' : C.yellow, stroke: off ? C.dim : 'none', sw: 2, dash: off ? '4 4' : 'none' }); if (off) T(mid, '0', cx + cell / 2, cy + 24, { size: 17, mono: true, fill: C.dim, anchor: 'middle' }); }
    stack(1016, 4, 1.7, C.green);
    const a1 = grp(g, .5); arrow(a1, 230, 262, 466, 262); T(a1, 'expand', 348, 236, { size: 24, weight: 700, anchor: 'middle' });
    const a2 = grp(g, 1.5); arrow(a2, 700, 262, 1000, 262); T(a2, 'shrink', 850, 236, { size: 24, weight: 700, anchor: 'middle' });
    const l = grp(g, 1.0); T(l, 'filter: negative values become 0', 572, 410, { size: 22, weight: 600, fill: C.yellow, anchor: 'middle' });
    [['d numbers', 167], ['4d numbers', 572], ['d numbers', 1033]].forEach(([t, x], i) => { const e = grp(g, .1 + i * .8); T(e, t, x, 142, { size: 22, fill: C.mute, anchor: 'middle', weight: 600 }); });
    rise(T(g, 'Words do not talk to each other in this step. Each one is processed separately.', 600, 540, { size: 24, fill: C.mute, anchor: 'middle' }), 2.2);
  }

  function ill3(g) {
    label(g, 'ADD THE CHANGE. KEEP THE ORIGINAL.', 600, 66);
    const y = 330, bx = (x, w, t, col, d) => { const e = grp(g, d); R(e, x, y - 45, w, 90, { r: 18, fill: col + '22', stroke: col, sw: 3 }); T(e, t, x + w / 2, y + 10, { size: 26, weight: 700, anchor: 'middle' }); };
    bx(50, 130, 'Word', C.ink, .1); bx(300, 190, 'Attention', C.blue, .5); bx(690, 190, 'Feed-forward', C.yellow, 1.3); bx(1030, 130, 'Word', C.green, 2.1);
    const plus = (x, d) => { const e = grp(g, d); e.append(S('circle', { cx: x, cy: y, r: 30, fill: C.panel, stroke: C.ink, 'stroke-width': 3 })); T(e, '+', x, y + 12, { size: 40, weight: 700, anchor: 'middle' }); };
    plus(590, .8); plus(960, 1.7);
    const f = grp(g, .5); arrow(f, 180, y, 300, y); arrow(f, 490, y, 556, y);
    const f2 = grp(g, 1.3); arrow(f2, 622, y, 690, y); arrow(f2, 880, y, 926, y);
    const f3 = grp(g, 2.1); arrow(f3, 992, y, 1030, y);
    const b1 = grp(g, 1.0); P(b1, `M115 ${y - 50} V 170 H 590 V ${y - 34}`, { stroke: C.cyan, sw: 3 }); b1.append(S('polygon', { points: '0,0 -12,-6.5 -12,6.5', fill: C.cyan, transform: `translate(590,${y - 33}) rotate(90)` })); T(b1, 'the original is kept', 350, 150, { size: 22, weight: 600, fill: C.cyan, anchor: 'middle' });
    const b2 = grp(g, 1.9); P(b2, `M590 ${y + 36} V 470 H 960 V ${y + 34}`, { stroke: C.cyan, sw: 3 }); b2.append(S('polygon', { points: '0,0 -12,-6.5 -12,6.5', fill: C.cyan, transform: `translate(960,${y + 33}) rotate(-90)` })); T(b2, 'and carried forward again', 775, 506, { size: 22, weight: 600, fill: C.cyan, anchor: 'middle' });
    rise(T(g, 'Each step adds a small correction. Nothing is overwritten.', 600, 570, { size: 24, fill: C.mute, anchor: 'middle' }), 2.4);
  }

  function ill4(g) {
    label(g, 'ONE BLOCK, STACKED', 600, 66);
    const b = grp(g, .1); R(b, 90, 110, 420, 400, { r: 26, fill: C.panel, stroke: C.line }); T(b, 'One block', 120, 156, { size: 28, weight: 700 });
    const parts = [['Attention', C.blue, 190], ['Feed-forward', C.yellow, 340]];
    parts.forEach(([t, col, y], i) => { const e = grp(g, .5 + i * .6); R(e, 130, y, 340, 90, { r: 18, fill: col + '22', stroke: col, sw: 3 }); T(e, t, 300, y + 55, { size: 28, weight: 700, anchor: 'middle' }); T(e, '+ keep the original', 460, y + 112, { size: 18, fill: C.mute, anchor: 'end' }); });
    arrow(grp(g, 1.0), 300, 282, 300, 338);
    const a = grp(g, 1.8); arrow(a, 520, 310, 650, 310); T(a, 'repeat N times', 590, 288, { size: 19, weight: 700, fill: C.blue, anchor: 'middle' });
    ['Block 1', 'Block 2', '⋮', 'Block N'].forEach((t, i) => { const e = grp(g, 2.0 + i * .3), y = 130 + i * 92; if (t !== '⋮') { R(e, 670, y, 280, 72, { r: 16, fill: C.panel, stroke: C.blue, sw: 2.5 }); T(e, t, 810, y + 46, { size: 26, weight: 600, anchor: 'middle' }); } else T(e, t, 810, y + 46, { size: 34, fill: C.mute, anchor: 'middle' }); });
    const o = grp(g, 3.3); arrow(o, 960, 440, 1060, 440); T(o, 'scores', 1080, 448, { size: 24, weight: 700 });
    rise(T(g, 'Same design every time. Each block has its own learned weights.', 600, 570, { size: 24, fill: C.mute, anchor: 'middle' }), 3.4);
  }
  window.__STAGES5 = [{ ill: ill1 }, { ill: ill2 }, { ill: ill3 }, { ill: ill4 }];
})();

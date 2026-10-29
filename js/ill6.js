/* Chapter 6 figures: scaling laws. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const { S, C, T, R, L, P, rise, label } = Kit;
  const grp = (g, d) => { const e = S('g'); g.append(e); return rise(e, d); };
  const FLOOR = 1.0, A = 1.5, ALPHA = 0.3, loss = (n) => FLOOR + A * Math.pow(n, -ALPHA);
  const dot = (p, x, y, r, fill) => { const c = S('circle', { cx: x, cy: y, r, fill }); p.append(c); return c; };

  function ill1(g) {
    const X = (n) => 150 + n * 9.1, Y = (l) => 490 - (l - 1) * 190;
    label(g, 'LOSS FALLS AS THE MODEL GROWS  (INVENTED NUMBERS)', 600, 66);
    const ax = grp(g, .05); L(ax, 150, 490, 1060, 490, { stroke: C.dim }); L(ax, 150, 100, 150, 490, { stroke: C.dim });
    [0, 25, 50, 75, 100].forEach(n => T(ax, n + 'B', X(n), 524, { size: 18, mono: true, fill: C.dim, anchor: 'middle' }));
    [1, 1.5, 2, 2.5, 3].forEach(l => T(ax, l.toFixed(1), 132, Y(l) + 6, { size: 18, mono: true, fill: C.dim, anchor: 'end' }));
    T(ax, 'model size (billions of parameters)', 605, 560, { size: 20, fill: C.mute, anchor: 'middle' }); T(ax, 'loss', 100, 92, { size: 20, fill: C.mute });
    const fl = grp(g, .4); L(fl, 150, Y(1), 1060, Y(1), { stroke: C.green, sw: 2.5, dash: '10 8' }); T(fl, 'floor: 1.0', 1060, Y(1) - 14, { size: 22, weight: 700, fill: C.green, anchor: 'end' });
    let d = ''; for (let n = 0.5; n <= 100.01; n += .5) d += (d ? 'L' : 'M') + X(n).toFixed(1) + ' ' + Y(loss(n)).toFixed(1);
    rise(P(g, d, { stroke: C.blue, sw: 5 }), .3);
    [[1, 'right'], [10, 'right'], [100, 'above']].forEach(([n, pos], i) => { const e = grp(g, 1.2 + i * .4), x = X(n), y = Y(loss(n)); dot(e, x, y, 10, C.yellow);
      const t = `${n}B  →  loss ${loss(n).toFixed(2)}`; if (pos === 'right') T(e, t, x + 22, y - 12, { size: 24, weight: 700 }); else T(e, t, x, y - 26, { size: 24, weight: 700, anchor: 'end' }); });
    rise(T(g, 'Fast gains at first, then slower and slower.', 640, 270, { size: 24, fill: C.mute }), 2.4);
  }

  function ill2(g) {
    const X = (n) => 150 + Math.log10(n) / 2 * 900, V = (n) => Math.log10(A * Math.pow(n, -ALPHA)), Y = (v) => 100 + (0.35 - v) * 370;
    label(g, 'ON A LOG-LOG PLOT, A POWER LAW IS A STRAIGHT LINE', 600, 66);
    const ax = grp(g, .05); L(ax, 150, 490, 1060, 490, { stroke: C.dim }); L(ax, 150, 100, 150, 490, { stroke: C.dim });
    [1, 10, 100].forEach(n => T(ax, n + 'B', X(n), 524, { size: 20, mono: true, fill: C.dim, anchor: 'middle' }));
    [2, 1, .5, .25].forEach(gp => T(ax, String(gp), 132, Y(Math.log10(gp)) + 6, { size: 18, mono: true, fill: C.dim, anchor: 'end' }));
    T(ax, 'model size (log scale)', 605, 560, { size: 20, fill: C.mute, anchor: 'middle' }); T(ax, 'gap above the floor (log scale)', 170, 100, { size: 18, fill: C.mute });
    rise(P(g, `M${X(1)} ${Y(V(1))} L${X(100)} ${Y(V(100))}`, { stroke: C.blue, sw: 5 }), .3);
    [1, 10, 100].forEach((n, i) => { const e = grp(g, 1.0 + i * .35); dot(e, X(n), Y(V(n)), 10, C.yellow); });
    const t = grp(g, 2.0); T(t, 'Every 10x in size', 650, 170, { size: 24, weight: 600 }); T(t, 'cuts the gap about in half.', 650, 202, { size: 24, weight: 600 }); T(t, '1.5  →  0.75  →  0.38', 650, 240, { size: 26, mono: true, weight: 700, fill: C.yellow });
  }

  function ill3(g) {
    label(g, 'THREE INGREDIENTS, ONE BUDGET', 600, 66);
    const box = (x, y, w, t, sub, col, d) => { const e = grp(g, d); R(e, x, y, w, 110, { r: 22, fill: col + '22', stroke: col, sw: 3 }); T(e, t, x + w / 2, y + 52, { size: 32, weight: 700, anchor: 'middle' }); T(e, sub, x + w / 2, y + 86, { size: 21, fill: C.mute, anchor: 'middle' }); };
    L(g, 600, 215, 270, 375, { stroke: C.dim, sw: 3 }); L(g, 600, 215, 930, 375, { stroke: C.dim, sw: 3 }); L(g, 420, 435, 780, 435, { stroke: C.dim, sw: 3 });
    box(450, 105, 300, 'Model size N', 'parameters', C.blue, .1); box(100, 375, 320, 'Data D', 'training tokens', C.yellow, .5); box(780, 375, 320, 'Compute C', 'total arithmetic', C.green, .9);
    const e = grp(g, 1.5); T(e, 'C ≈ 6 × N × D', 600, 330, { size: 42, mono: true, weight: 800, anchor: 'middle', fill: C.green });
    rise(T(g, 'For a fixed budget, grow N and D together: about 20 tokens per parameter.', 600, 566, { size: 24, fill: C.mute, anchor: 'middle' }), 2.2);
  }
  window.__STAGES6 = [{ ill: ill1 }, { ill: ill2 }, { ill: ill3 }];
  window.__SCALE = { FLOOR, A, ALPHA, loss };
})();

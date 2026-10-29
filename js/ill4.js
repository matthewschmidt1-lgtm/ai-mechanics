/* Chapter 4 figures: loss and gradient descent. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const { S, C, T, R, L, P, rise, label } = Kit;
  const grp = (g, d) => { const e = S('g'); g.append(e); return rise(e, d); };
  const WORDS = ['mat', 'floor', 'sofa', 'rug', 'chair', 'moon', 'the', 'banana'];
  const BEFORE = [0.125, 0.12, 0.13, 0.125, 0.13, 0.12, 0.125, 0.125];
  const AFTER = (() => { const z = [3.1, 2.2, 1.4, 1.0, 0.6, -0.5, -1.2, -2.0], m = Math.max(...z), e = z.map(v => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); })();

  function panel(g, x0, title, probs, d0, dec = 0) {
    const e0 = grp(g, d0); R(e0, x0, 96, 480, 420, { r: 22, fill: C.panel, stroke: C.line });
    T(e0, title, x0 + 28, 146, { size: 28, weight: 700 });
    probs.forEach((p, i) => {
      const y = 176 + i * 40, e = grp(g, d0 + .15 + i * .07), hit = i === 0;
      T(e, WORDS[i], x0 + 28, y + 22, { size: 22, weight: hit ? 700 : 500, fill: hit ? C.green : C.mute });
      R(e, x0 + 130, y + 2, Math.max(4, p / 0.6 * 250), 22, { r: 6, fill: hit ? C.green : C.dim });
      T(e, (p * 100).toFixed(dec || (p < .1 ? 1 : 0)) + '%', x0 + 130 + Math.max(4, p / 0.6 * 250) + 12, y + 22, { size: 20, mono: true, fill: hit ? C.green : C.mute });
    });
  }
  function ill1(g) {
    label(g, 'THE TRUE NEXT WORD IN THE TRAINING TEXT IS  “mat”', 600, 70);
    panel(g, 70, 'Before training', BEFORE, .1, 1);
    panel(g, 650, 'After training', AFTER, .9);
    const a = grp(g, 1.8); P(a, 'M560 306 H640 M628 294 L640 306 L628 318', { stroke: C.mute, sw: 3 });
    rise(T(g, 'Training moves chance toward the true word.', 600, 568, { size: 26, fill: C.mute, anchor: 'middle' }), 2.2);
  }

  /* loss = -ln(p) */
  function ill2(g) {
    const X = (p) => 150 + 900 * p, Y = (l) => 470 - l * 72, ln = (p) => -Math.log(p);
    label(g, 'LOSS  =  −ln( chance given to the true word )', 600, 66);
    const ax = grp(g, .05);
    L(ax, 150, 470, 1060, 470, { stroke: C.dim }); L(ax, 150, 100, 150, 470, { stroke: C.dim });
    [0, .25, .5, .75, 1].forEach(p => T(ax, (p * 100) + '%', X(p), 500, { size: 18, mono: true, fill: C.dim, anchor: 'middle' }));
    [0, 1, 2, 3, 4, 5].forEach(l => T(ax, String(l), 130, Y(l) + 6, { size: 18, mono: true, fill: C.dim, anchor: 'end' }));
    T(ax, 'chance given to the true word', 605, 538, { size: 20, fill: C.mute, anchor: 'middle' });
    T(ax, 'loss', 100, 90, { size: 20, fill: C.mute });
    let d = ''; for (let p = 0.0067; p <= 1.0001; p += 0.004) d += (d ? 'L' : 'M') + X(p).toFixed(1) + ' ' + Y(ln(Math.min(p, 1))).toFixed(1);
    rise(P(g, d, { stroke: C.blue, sw: 5 }), .3);
    [[.01, 'right', 1.0], [.1, 'right', 1.4], [.5, 'above', 1.8], [.9, 'above', 2.2]].forEach(([p, pos, dl]) => {
      const e = grp(g, dl), x = X(p), y = Y(ln(p)), r = S('circle', { cx: x, cy: y, r: 9, fill: C.yellow }); e.append(r);
      const txt = `p = ${p}   loss ${ln(p).toFixed(2)}`;
      if (pos === 'right') T(e, txt, x + 24, y + 8, { size: 22, weight: 600 }); else T(e, txt, x, y - 24, { size: 22, weight: 600, anchor: 'middle' });
    });
    rise(T(g, 'Confident and wrong: a huge penalty.', 440, 190, { size: 22, fill: C.pink, weight: 600 }), 2.6);
    rise(T(g, 'Right and confident: almost no penalty.', 1050, 340, { size: 22, fill: C.green, weight: 600, anchor: 'end' }), 2.9);
  }

  /* one dial, loss = (w - 3)^2 */
  const WX = (w) => 100 + 125 * (w + 1), LY = (l) => 470 - 22 * l;
  function curve(g, d0) {
    const ax = grp(g, d0); L(ax, 100, 470, 1100, 470, { stroke: C.dim });
    for (let w = 0; w <= 6; w++) T(ax, String(w), WX(w), 500, { size: 18, mono: true, fill: C.dim, anchor: 'middle' });
    T(ax, 'w  (one dial inside the model)', 600, 538, { size: 20, fill: C.mute, anchor: 'middle' }); T(ax, 'loss', 60, 100, { size: 20, fill: C.mute });
    let d = ''; for (let w = -1; w <= 7.001; w += .05) d += (d ? 'L' : 'M') + WX(w).toFixed(1) + ' ' + LY((w - 3) ** 2).toFixed(1);
    rise(P(g, d, { stroke: C.blue, sw: 5 }), d0 + .1);
  }
  function ill3(g) {
    label(g, 'LOSS CHANGES AS ONE DIAL IS TURNED', 600, 66); curve(g, .05);
    const w0 = 0, l0 = 9, gr = 2 * (w0 - 3), t = grp(g, 1.0);
    const xa = WX(w0 - .7), xb = WX(w0 + .9);
    L(t, xa, LY(l0 + gr * -.7), xb, LY(l0 + gr * .9), { stroke: C.yellow, sw: 4 });
    t.append(S('circle', { cx: WX(w0), cy: LY(l0), r: 13, fill: C.yellow }));
    T(t, 'start: w = 0', WX(w0) - 6, LY(l0) - 90, { size: 24, weight: 700, anchor: 'start' });
    const s = grp(g, 1.5); T(s, 'The slope here is −6.', 470, 170, { size: 25, weight: 600, fill: C.yellow });
    T(s, 'Loss falls when w goes up.', 470, 204, { size: 22, fill: C.mute });
    const m = grp(g, 2.0); m.append(S('circle', { cx: WX(3), cy: LY(0), r: 11, fill: C.green }));
    T(m, 'lowest loss at w = 3', WX(3), LY(0) - 28, { size: 24, weight: 700, fill: C.green, anchor: 'middle' });
  }
  function ill4(g) {
    label(g, 'SMALL STEPS DOWNHILL, EACH ONE A LITTLE SMALLER', 600, 66); curve(g, .05);
    const ws = [0, 1, 2, 3, 4, 5].map(k => 3 - 3 * Math.pow(0.8, k)), ls = ws.map(w => (w - 3) ** 2);
    ws.forEach((w, k) => {
      const e = grp(g, .7 + k * .55), x = WX(w), y = LY(ls[k]);
      if (k > 0) P(e, `M${WX(ws[k - 1])} ${LY(ls[k - 1])} L${x} ${y}`, { stroke: C.yellow, sw: 2.5 });
      e.append(S('circle', { cx: x, cy: y, r: k === 0 ? 13 : 10, fill: C.yellow }));
      T(e, String(k), x, y - 22, { size: 20, mono: true, weight: 700, anchor: 'middle' });
    });
    const r = grp(g, 4.2); T(r, 'loss:  ' + ls.map(v => v.toFixed(1)).join('  →  '), 600, 575, { size: 24, mono: true, anchor: 'middle', fill: C.mute });
  }

  /* the training loop */
  function ill5(g) {
    label(g, 'ONE TRIP AROUND THE LOOP CHANGES EVERY DIAL A TINY AMOUNT', 600, 70);
    const items = [['1', 'Predict', 'Let the model guess the next word.', C.blue], ['2', 'Measure', 'Compute the loss.', C.yellow], ['3', 'Find slopes', 'Work out how each dial affected the loss.', C.pink], ['4', 'Nudge', 'Turn every dial a little downhill.', C.green]];
    const w = 236, gap = 42, x0 = (1200 - (4 * w + 3 * gap)) / 2, y0 = 150, h = 190;
    items.forEach(([n, t, d, col], i) => {
      const x = x0 + i * (w + gap), e = grp(g, .15 + i * .45);
      R(e, x, y0, w, h, { r: 22, fill: C.panel, stroke: col, sw: 2.5 });
      e.append(S('circle', { cx: x + 36, cy: y0 + 40, r: 20, fill: col })); T(e, n, x + 36, y0 + 48, { size: 24, weight: 800, fill: '#000', anchor: 'middle' });
      T(e, t, x + 22, y0 + 100, { size: 28, weight: 700 });
      const words = d.split(' '); let line = '', yy = y0 + 134;
      words.forEach(wd => { const tt = line ? line + ' ' + wd : wd; if (tt.length > 20 && line) { T(e, line, x + 22, yy, { size: 20, fill: C.mute }); yy += 26; line = wd; } else line = tt; });
      T(e, line, x + 22, yy, { size: 20, fill: C.mute });
      if (i < 3) { const a = grp(g, .5 + i * .45); P(a, `M${x + w + 6} ${y0 + 95} H${x + w + gap - 6} M${x + w + gap - 16} ${y0 + 85} L${x + w + gap - 6} ${y0 + 95} L${x + w + gap - 16} ${y0 + 105}`, { stroke: C.mute, sw: 3 }); }
    });
    const lp = grp(g, 2.2), xl = x0 + 3 * (w + gap) + w / 2, xr = x0 + w / 2;
    P(lp, `M${xl} ${y0 + h + 6} V430 H${xr} V${y0 + h + 14} M${xr - 10} ${y0 + h + 28} L${xr} ${y0 + h + 12} L${xr + 10} ${y0 + h + 28}`, { stroke: C.blue, sw: 3 });
    T(lp, 'repeat, many thousands of times', 600, 478, { size: 26, weight: 600, fill: C.blue, anchor: 'middle' });
    rise(T(g, 'The loss drifts down. The model gets better at predicting.', 600, 556, { size: 24, fill: C.mute, anchor: 'middle' }), 2.8);
  }
  window.__STAGES3 = [{ ill: ill1 }, { ill: ill2 }, { ill: ill3 }, { ill: ill4 }, { ill: ill5 }];
})();

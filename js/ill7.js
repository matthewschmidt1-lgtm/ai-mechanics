/* Chapter 7 figures: in-context learning. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const { S, C, T, R, L, P, rise, label } = Kit;
  const grp = (g, d) => { const e = S('g'); g.append(e); return rise(e, d); };
  const arrow = (p, x1, y1, x2, y2, col = C.mute, sw = 2.5) => { P(p, `M${x1} ${y1} L${x2} ${y2}`, { stroke: col, sw }); const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; p.append(S('polygon', { points: '0,0 -11,-6 -11,6', fill: col, transform: `translate(${x2},${y2}) rotate(${a})` })); };

  /* 8.1: a prompt with examples, weights locked */
  function ill1(g) {
    label(g, 'THE PROMPT TEACHES THE TASK. THE WEIGHTS DO NOT CHANGE.', 600, 66);
    const card = grp(g, .1); R(card, 70, 100, 700, 420, { r: 24, fill: C.panel, stroke: C.line }); T(card, 'PROMPT', 100, 140, { size: 18, weight: 700, fill: C.mute, ls: 3 });
    const rows = [['“I loved it.”', 'GREEN'], ['“What a waste of time.”', 'RED'], ['“Loved some parts, hated others.”', 'YELLOW'], ['“What a lovely day.”', '?']];
    rows.forEach(([t, lab], i) => { const e = grp(g, .5 + i * .45), y = 200 + i * 78, q = lab === '?', col = q ? C.blue : { GREEN: C.green, RED: C.pink, YELLOW: C.yellow }[lab];
      T(e, t, 100, y + 8, { size: 26, fill: q ? C.ink : C.mute }); T(e, '→', 530, y + 8, { size: 28, fill: C.dim }); R(e, 570, y - 26, 170, 50, { r: 12, fill: col + '33', stroke: col, sw: 2.5 }); T(e, lab, 655, y + 9, { size: 26, mono: true, weight: 800, anchor: 'middle', fill: col }); });
    arrow(grp(g, 2.4), 790, 310, 880, 310, C.mute, 3);
    const m = grp(g, 2.6); R(m, 890, 190, 240, 240, { r: 24, fill: C.panel, stroke: C.green, sw: 3 }); T(m, 'Model', 1010, 270, { size: 32, weight: 700, anchor: 'middle' });
    R(m, 940, 300, 140, 50, { r: 12, fill: C.green + '22', stroke: C.green, sw: 2 }); T(m, 'weights: locked', 1010, 332, { size: 20, weight: 700, fill: C.green, anchor: 'middle' });
    T(m, 'answers GREEN', 1010, 390, { size: 22, mono: true, weight: 700, anchor: 'middle' });
    rise(T(g, 'Examples in the prompt are enough to set up a new labeling scheme.', 600, 568, { size: 24, fill: C.mute, anchor: 'middle' }), 3.0);
  }

  /* 8.2: pattern copying (induction) */
  function ill2(g) {
    label(g, 'IF  “blue”  WAS FOLLOWED BY  “sky”  BEFORE, GUESS  “sky”  AGAIN', 600, 70);
    const toks = ['blue', 'sky', 'red', 'rose', 'blue', '?'], w = 150, gap = 24, x0 = (1200 - (toks.length * w + (toks.length - 1) * gap)) / 2, cy = 380, cx = toks.map((_, i) => x0 + i * (w + gap) + w / 2);
    toks.forEach((t, i) => { const e = grp(g, .1 + i * .12), q = t === '?', hot = i === 0 || i === 4 || i === 1;
      R(e, cx[i] - w / 2, cy - 40, w, 80, { r: 16, fill: q ? 'none' : (i === 1 ? C.yellow + '33' : C.panel), stroke: q ? C.blue : (hot ? (i === 1 ? C.yellow : C.cyan) : C.line), sw: hot || q ? 3 : 2, dash: q ? '8 6' : 'none' });
      T(e, t, cx[i], cy + 11, { size: 34, weight: 700, anchor: 'middle', fill: q ? C.blue : C.ink }); T(e, String(i + 1), cx[i], cy + 70, { size: 18, mono: true, fill: C.dim, anchor: 'middle' }); });
    const a = grp(g, 1.2); P(a, `M${cx[4]} ${cy - 44} C ${cx[4]} 170, ${cx[0]} 170, ${cx[0]} ${cy - 44}`, { stroke: C.cyan, sw: 4 }); T(a, '1. Find the earlier  “blue”', (cx[0] + cx[4]) / 2, 198, { size: 24, weight: 700, fill: C.cyan, anchor: 'middle' }); a.append(S('polygon', { points: '0,0 -12,-6.5 -12,6.5', fill: C.cyan, transform: `translate(${cx[0]},${cy - 42}) rotate(90)` }));
    const b = grp(g, 2.0); P(b, `M${cx[0] + 20} ${cy - 44} C ${cx[0] + 40} 250, ${cx[1] - 20} 250, ${cx[1]} ${cy - 44}`, { stroke: C.yellow, sw: 4 }); b.append(S('polygon', { points: '0,0 -12,-6.5 -12,6.5', fill: C.yellow, transform: `translate(${cx[1]},${cy - 42}) rotate(90)` })); T(b, '2. See what came next', cx[1] + 70, 268, { size: 22, weight: 700, fill: C.yellow, anchor: 'start' });
    const c = grp(g, 2.8); P(c, `M${cx[1] + 30} ${cy + 96} C ${cx[1] + 30} 520, ${cx[5]} 520, ${cx[5]} ${cy + 46}`, { stroke: C.green, sw: 4 }); T(c, '3. Copy it', (cx[1] + cx[5]) / 2, 545, { size: 24, weight: 700, fill: C.green, anchor: 'middle' }); c.append(S('polygon', { points: '0,0 -12,-6.5 -12,6.5', fill: C.green, transform: `translate(${cx[5]},${cy + 44}) rotate(-90)` }));
    rise(T(g, 'Researchers call the attention heads that do this induction heads.', 600, 590, { size: 20, fill: C.mute, anchor: 'middle' }), 3.3);
  }

  /* 8.3: working memory versus weights */
  function ill3(g) {
    const l = grp(g, .1); R(l, 70, 100, 500, 380, { r: 26, fill: C.panel, stroke: C.green, sw: 3 }); T(l, 'Context window', 100, 150, { size: 32, weight: 700 }); T(l, 'working memory', 100, 184, { size: 22, fill: C.green, weight: 600 });
    ['The cat sat on the mat.', 'Examples you pasted in.', 'The chapter you provided.'].forEach((t, i) => { const e = grp(g, .6 + i * .4); R(e, 100, 215 + i * 62, 440, 48, { r: 10, fill: C.panel2 }); T(e, t, 120, 247 + i * 62, { size: 22 }); });
    const lb = grp(g, 1.9); T(lb, 'seen directly  ·  small  ·  temporary', 100, 450, { size: 20, fill: C.mute });
    const r = grp(g, .5); R(r, 630, 100, 500, 380, { r: 26, fill: 'none', stroke: C.orange, sw: 3, dash: '10 8' }); T(r, 'Weights', 660, 150, { size: 32, weight: 700 }); T(r, 'hazy recollection', 660, 184, { size: 22, fill: C.orange, weight: 600 });
    ['a huge slice of the internet,', 'squeezed into numbers,', 'fuzzy in the details.'].forEach((t, i) => { const e = grp(g, 1.0 + i * .4); T(e, t, 660, 250 + i * 52, { size: 26, fill: C.mute }).setAttribute('opacity', .75 - i * .2); });
    const rb = grp(g, 2.2); T(rb, 'huge  ·  compressed  ·  changed only by training', 660, 450, { size: 20, fill: C.mute });
    rise(T(g, 'When accuracy matters, put what you need in the context.', 600, 548, { size: 26, fill: C.ink, anchor: 'middle', weight: 600 }), 2.8);
  }
  window.__STAGES8 = [{ ill: ill1 }, { ill: ill2 }, { ill: ill3 }];
})();

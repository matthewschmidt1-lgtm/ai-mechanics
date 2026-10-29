/* Chapter 8 figures: how chat models are tuned. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const { S, C, T, R, L, P, rise, label } = Kit;
  const grp = (g, d) => { const e = S('g'); g.append(e); return rise(e, d); };
  const arrow = (p, x1, y1, x2, y2, col = C.mute, sw = 2.5) => { P(p, `M${x1} ${y1} L${x2} ${y2}`, { stroke: col, sw }); const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; p.append(S('polygon', { points: '0,0 -11,-6 -11,6', fill: col, transform: `translate(${x2},${y2}) rotate(${a})` })); };
  const wrap = (p, str, x, y, max, size, col = C.mute, lh = 1.3) => { let line = '', yy = y; str.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (t.length * size * .52 > max && line) { T(p, line, x, yy, { size, fill: col }); yy += size * lh; line = w; } else line = t; }); T(p, line, x, yy, { size, fill: col }); };
  const sig = (x) => 1 / (1 + Math.exp(-x));

  function ill1(g) {
    label(g, 'FOUR STAGES FROM RAW TEXT TO ASSISTANT', 600, 66);
    const st = [['1', 'Pretraining', 'Predict the next token on a huge pile of text.', 'base model', C.blue], ['2', 'Fine-tuning', 'Learn from example conversations.', 'follows instructions', C.cyan], ['3', 'Preferences', 'Learn what people prefer between two answers.', 'a reward model', C.yellow], ['4', 'Reinforcement', 'Favor answers that score well.', 'the assistant', C.green]];
    const w = 244, gap = 40, x0 = (1200 - (4 * w + 3 * gap)) / 2, y0 = 130, h = 290;
    st.forEach(([n, t, d, res, col], i) => { const x = x0 + i * (w + gap), e = grp(g, .15 + i * .5);
      R(e, x, y0, w, h, { r: 22, fill: C.panel, stroke: col, sw: 2.5 }); e.append(S('circle', { cx: x + 38, cy: y0 + 40, r: 20, fill: col })); T(e, n, x + 38, y0 + 48, { size: 24, weight: 800, fill: '#000', anchor: 'middle' });
      T(e, t, x + 20, y0 + 104, { size: 28, weight: 700 }); wrap(e, d, x + 20, y0 + 142, w - 40, 21);
      L(e, x + 20, y0 + 228, x + w - 20, y0 + 228, { stroke: C.line }); T(e, 'RESULT', x + 20, y0 + 256, { size: 15, weight: 700, fill: C.mute, ls: 3 }); T(e, res, x + 20, y0 + 280, { size: 22, weight: 700, fill: col });
      if (i < 3) arrow(grp(g, .4 + i * .5), x + w + 4, y0 + 145, x + w + gap - 4, y0 + 145); });
    rise(T(g, 'Not every lab uses all four, and the details differ. This is the common outline.', 600, 540, { size: 24, fill: C.mute, anchor: 'middle' }), 2.3);
  }

  function ill2(g) {
    label(g, 'THE SAME PROMPT, TWO MODELS  (ILLUSTRATIVE)', 600, 66);
    const pr = grp(g, .1); R(pr, 300, 96, 600, 70, { r: 18, fill: C.panel2 }); T(pr, 'What is the capital of France?', 600, 142, { size: 30, weight: 600, anchor: 'middle' });
    const panel = (x, title, col, lines, d) => { const e = grp(g, d); R(e, x, 210, 520, 270, { r: 24, fill: C.panel, stroke: col, sw: 3 }); T(e, title, x + 28, 262, { size: 30, weight: 700, fill: col });
      lines.forEach((t, i) => T(e, t, x + 28, 322 + i * 44, { size: 26, fill: i === 0 && col === C.green ? C.ink : C.mute, weight: i === 0 && col === C.green ? 600 : 500 })); };
    panel(60, 'Base model', C.orange, ['What is the capital of Germany?', 'What is the capital of Spain?', 'What is the capital of Italy?', '…'], .6);
    panel(620, 'Assistant', C.green, ['The capital of France is Paris.', 'Would you like to know more about', 'the city?'], 1.4);
    arrow(grp(g, .5), 450, 172, 350, 206, C.mute, 3); arrow(grp(g, 1.3), 750, 172, 850, 206, C.mute, 3);
    rise(T(g, 'A base model continues the document. An assistant answers the person.', 600, 548, { size: 26, fill: C.mute, anchor: 'middle' }), 2.2);
  }

  function ill3(g) {
    label(g, 'A HUMAN PICKS THE BETTER ANSWER. A REWARD MODEL LEARNS TO AGREE.', 600, 66);
    const q = grp(g, .1); R(q, 250, 92, 700, 56, { r: 16, fill: C.panel2 }); T(q, 'Explain gravity to a child.', 600, 130, { size: 28, weight: 600, anchor: 'middle' });
    const cards = [['Answer A', 'Gravity is the pull that makes things fall to the ground.', 2.0, C.green, 70], ['Answer B', 'Gravity is a force proportional to the product of masses.', 0.5, C.dim, 640]];
    cards.forEach(([t, txt, sc, col, x], i) => { const e = grp(g, .6 + i * .5); R(e, x, 190, 490, 220, { r: 22, fill: C.panel, stroke: col, sw: i ? 2 : 3.5 }); T(e, t, x + 26, 238, { size: 26, weight: 700, fill: i ? C.mute : C.green }); wrap(e, txt, x + 26, 284, 440, 23, C.ink);
      T(e, 'reward score', x + 26, 376, { size: 17, weight: 700, fill: C.mute, ls: 2 }); T(e, sc.toFixed(1), x + 464, 380, { size: 36, mono: true, weight: 800, anchor: 'end', fill: i ? C.mute : C.green }); });
    const h = grp(g, 1.7); T(h, 'a human prefers A', 315, 450, { size: 22, weight: 700, fill: C.green, anchor: 'middle' });
    const r = grp(g, 2.2); T(r, `chance the reward model gives A:  ${(sig(1.5) * 100).toFixed(1)}%`, 600, 520, { size: 30, mono: true, weight: 800, anchor: 'middle' }); T(r, 'sigmoid( 2.0 − 0.5 )', 600, 558, { size: 22, mono: true, fill: C.mute, anchor: 'middle' });
  }

  function ill4(g) {
    label(g, 'EIGHT ATTEMPTS AT ONE MATH PROBLEM', 600, 66);
    const right = [1, 0, 0, 1, 0, 1, 0, 0], mean = right.reduce((a, b) => a + b) / right.length, w = 120, gap = 14, x0 = (1200 - (8 * w + 7 * gap)) / 2;
    right.forEach((r, i) => { const x = x0 + i * (w + gap), col = r ? C.green : C.pink, e = grp(g, .2 + i * .18);
      R(e, x, 150, w, 120, { r: 18, fill: col + '22', stroke: col, sw: 3 }); T(e, 'try ' + (i + 1), x + w / 2, 192, { size: 20, fill: C.mute, anchor: 'middle', weight: 600 }); T(e, r ? 'right' : 'wrong', x + w / 2, 242, { size: 28, weight: 800, fill: col, anchor: 'middle' });
      const a = grp(g, 2.0 + i * .08); T(a, (r - mean >= 0 ? '+' : '−') + Math.abs(r - mean).toFixed(3), x + w / 2, 330, { size: 28, mono: true, weight: 800, anchor: 'middle', fill: col }); });
    const l = grp(g, 1.8); T(l, 'how far each attempt is from the average reward', 600, 372, { size: 20, fill: C.mute, anchor: 'middle' });
    const m = grp(g, 2.8); T(m, `3 of 8 right, so the average reward is ${mean}`, 600, 432, { size: 28, weight: 700, anchor: 'middle' }); T(m, 'Right attempts become more likely. Wrong attempts become less likely.', 600, 476, { size: 24, fill: C.mute, anchor: 'middle' });
    rise(T(g, 'The whole attempt shares one verdict, however many steps it took.', 600, 548, { size: 24, fill: C.mute, anchor: 'middle' }), 3.2);
  }
  window.__STAGES9 = [{ ill: ill1 }, { ill: ill2 }, { ill: ill3 }, { ill: ill4 }];
})();

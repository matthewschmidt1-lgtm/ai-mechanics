/* Chapter 5 figures: softmax and decoding. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const { h, S, C, T, R, L, P, rise, label, softmax, shell, MONO } = Kit;
  const CAND = [['mat', 3.1], ['floor', 2.2], ['sofa', 1.4], ['rug', 1.0], ['chair', 0.6], ['moon', -0.5], ['the', -1.2], ['banana', -2.0]];
  const Z = CAND.map(c => c[1]), E = Z.map(Math.exp), SUM = E.reduce((a, b) => a + b, 0), PR = E.map(v => v / SUM);
  const COL = [C.blue, C.cyan, C.yellow, C.pink, C.green, C.orange, '#8e8e93', '#636366'];
  const pct = (p, d = 1) => (p * 100).toFixed(d) + '%';
  const grp = (g, d) => { const e = S('g'); g.append(e); return rise(e, d); };

  function ill1(g) {
    label(g, 'RAW SCORES (LOGITS), ONE PER TOKEN', 480, 92);
    const x0 = 480, k = 80;
    L(g, x0, 112, x0, 500, { stroke: C.dim, sw: 2 });
    CAND.forEach(([w, z], i) => {
      const y = 126 + i * 46, e = grp(g, .1 + i * .1), pos = z >= 0, len = Math.abs(z) * k;
      T(e, w, pos ? x0 - 18 : x0 + 18, y + 25, { size: 24, weight: 600, anchor: pos ? 'end' : 'start' });
      R(e, pos ? x0 : x0 - len, y, len, 32, { r: 8, fill: pos ? C.blue : C.pink });
      T(e, (z > 0 ? '+' : '') + z.toFixed(1), pos ? x0 + len + 14 : x0 - len - 14, y + 25, { size: 22, mono: true, fill: C.mute, anchor: pos ? 'start' : 'end' });
    });
    const c = grp(g, 1.1); R(c, 850, 150, 280, 270, { r: 22, fill: C.panel, stroke: C.line });
    T(c, 'Not yet usable', 874, 196, { size: 25, weight: 600 });
    ['Some are negative.', 'They add up to', 'nothing meaningful.', '', 'We want chances', 'that add up to 100%.'].forEach((s, i) => T(c, s, 874, 240 + i * 29, { size: 21, fill: C.mute }));
  }

  function ill2(g) {
    label(g, 'SCORE', 300, 92); label(g, 'e RAISED TO THE SCORE', 700, 92, 'middle');
    CAND.forEach(([w, z], i) => {
      const y = 116 + i * 46, e = grp(g, .1 + i * .13);
      T(e, w, 170, y + 25, { size: 24, weight: 600, anchor: 'end' });
      T(e, (z > 0 ? '+' : '') + z.toFixed(1), 300, y + 25, { size: 22, mono: true, fill: z >= 0 ? C.blue : C.pink, anchor: 'middle' });
      P(e, `M345 ${y + 16} H395 M385 ${y + 9} L395 ${y + 16} L385 ${y + 23}`, { stroke: C.dim, sw: 2.5 });
      const wd = Math.max(5, E[i] * 30); R(e, 420, y, wd, 32, { r: 8, fill: C.green });
      T(e, E[i].toFixed(E[i] < 1 ? 2 : 1), 420 + wd + 14, y + 25, { size: 22, mono: true, fill: C.mute });
    });
    
    rise(T(g, 'Every result is positive. A 0.9 lead in score becomes a 2.5 times lead.', 600, 560, { size: 24, fill: C.mute, anchor: 'middle' }), 1.4);
  }

  function ill3(g) {
    label(g, 'ALL THE VALUES TOGETHER = ' + SUM.toFixed(1) + '  =  100%', 600, 92);
    const x0 = 90, W = 1020; let x = x0;
    PR.forEach((p, i) => {
      const w = p * W, e = grp(g, .1 + i * .1);
      R(e, x, 112, Math.max(w - 3, 2), 66, { r: 8, fill: COL[i] });
      if (w > 60) T(e, pct(p), x + w / 2 - 1.5, 155, { size: 26, weight: 700, fill: '#000', anchor: 'middle' });
      x += w;
    });
    label(g, 'EACH VALUE  ÷  TOTAL  =  PROBABILITY', 600, 232);
    CAND.forEach(([w], i) => {
      const y = 252 + i * 36, e = grp(g, .9 + i * .1);
      R(e, 150, y + 3, 16, 16, { r: 4, fill: COL[i] });
      T(e, w, 182, y + 20, { size: 21, weight: 600 });
      T(e, E[i].toFixed(1) + ' ÷ ' + SUM.toFixed(1), 420, y + 20, { size: 19, mono: true, fill: C.mute });
      R(e, 640, y + 2, PR[i] * 640, 20, { r: 6, fill: COL[i] });
      T(e, pct(PR[i]), 640 + PR[i] * 640 + 12, y + 20, { size: 20, mono: true, weight: 600 });
    });
  }

  function ill4(g) {
    const specs = [[0.5, 'T = 0.5', 'Sharper'], [1, 'T = 1', 'As trained'], [2, 'T = 2', 'Flatter']];
    specs.forEach(([t, name, sub], k) => {
      const px = 70 + k * 370, e = grp(g, .15 + k * .35), p = softmax(Z, t), base = 430;
      R(e, px, 90, 320, 450, { r: 24, fill: C.panel, stroke: C.line });
      T(e, name, px + 28, 142, { size: 32, weight: 700 }); T(e, sub, px + 292, 140, { size: 20, fill: C.mute, anchor: 'end' });
      L(e, px + 24, base, px + 296, base, { stroke: C.dim });
      p.forEach((v, i) => {
        const bx = px + 28 + i * 33, bh = v * 250;
        R(e, bx, base - bh, 24, bh, { r: 5, fill: COL[i] });
        T(e, CAND[i][0].slice(0, 3), bx + 12, base + 22, { size: 13, mono: true, fill: C.mute, anchor: 'middle' });
      });
      T(e, 'mat ' + pct(p[0]), px + 28, 500, { size: 26, weight: 700, fill: C.blue });
      T(e, 'banana ' + pct(p[7], 1), px + 292, 500, { size: 20, mono: true, fill: C.mute, anchor: 'end' });
    });
  }

  function ill5(g) {
    const u = 0.66, x0 = 90, W = 1020, y = 280;
    label(g, 'THE PROBABILITIES, LAID END TO END FROM 0 TO 1', 600, 92);
    let x = x0, hit = 0, cum = 0;
    PR.forEach((p, i) => { if (u >= cum && u < cum + p) hit = i; cum += p; });
    PR.forEach((p, i) => {
      const w = p * W, e = grp(g, .1 + i * .08);
      R(e, x, y, Math.max(w - 3, 2), 78, { r: 8, fill: COL[i], stroke: i === hit ? C.ink : 'none', sw: 3 });
      if (w > 60) { T(e, CAND[i][0], x + w / 2, y + 112, { size: 22, weight: 600, anchor: 'middle' }); T(e, pct(p), x + w / 2, y + 140, { size: 19, mono: true, fill: C.mute, anchor: 'middle' }); }
      x += w;
    });
    T(g, '0', x0, y - 14, { size: 18, mono: true, fill: C.dim }); T(g, '1', x0 + W, y - 14, { size: 18, mono: true, fill: C.dim, anchor: 'end' });
    const mx = x0 + u * W, m = grp(g, 1.0);
    T(m, 'random number  ' + u.toFixed(2), mx, 150, { size: 26, weight: 700, anchor: 'middle' });
    L(m, mx, 168, mx, y - 4, { stroke: C.ink, sw: 3 });
    m.append(S('polygon', { points: `${mx - 11},${y - 18} ${mx + 11},${y - 18} ${mx},${y - 2}`, fill: C.ink }));
    const a = grp(g, 1.5); R(a, 90, 468, 500, 84, { r: 20, fill: C.panel, stroke: C.line }); R(a, 610, 468, 500, 84, { r: 20, fill: C.panel, stroke: C.green, sw: 2.5 });
    T(a, 'Greedy', 116, 505, { size: 20, fill: C.mute, weight: 600, ls: 2 }); T(a, 'always “mat”', 116, 538, { size: 28, weight: 600 });
    T(a, 'Sampling', 636, 505, { size: 20, fill: C.green, weight: 600, ls: 2 }); T(a, 'lands on “' + CAND[hit][0] + '” this time', 636, 538, { size: 28, weight: 600 });
  }

  function ill6(g) {
    const keep = 4, x0 = 90, bw = 70, gp = 28, base = 430; let cum = 0;
    label(g, 'SORTED BY PROBABILITY, KEEP UNTIL 90% IS REACHED', 480, 92);
    PR.forEach((p, i) => {
      cum += p; const bx = x0 + i * (bw + gp), bh = p * 520, ok = i < keep, e = grp(g, .1 + i * .12);
      R(e, bx, base - bh, bw, bh, { r: 8, fill: ok ? COL[i] : 'none', stroke: ok ? 'none' : C.dim, sw: 2, dash: ok ? 'none' : '6 6' });
      T(e, pct(cum), bx + bw / 2, base - bh - 12, { size: 18, mono: true, fill: ok ? C.ink : C.dim, anchor: 'middle' });
      T(e, CAND[i][0], bx + bw / 2, base + 30, { size: 20, weight: 600, fill: ok ? C.ink : C.dim, anchor: 'middle' });
    });
    const cx = x0 + keep * (bw + gp) - gp / 2, c = grp(g, 1.0);
    L(c, cx, 130, cx, 470, { stroke: C.pink, sw: 3, dash: '10 8' }); T(c, 'cut', cx + 12, 150, { size: 20, fill: C.pink, weight: 700 });
    const kept = PR.slice(0, keep), ks = kept.reduce((a, b) => a + b, 0), r = grp(g, 1.5);
    R(r, 880, 150, 250, 290, { r: 22, fill: C.panel, stroke: C.line });
    T(r, 'After the cut', 902, 196, { size: 24, weight: 700 });
    [['Kept', keep + ' tokens'], ['Chance kept', pct(ks)], ['Rescaled:', ''], ['mat', pct(kept[0] / ks)], ['floor', pct(kept[1] / ks)]].forEach(([a, b], i) => { T(r, a, 902, 244 + i * 38, { size: 20, fill: C.mute }); T(r, b, 1108, 244 + i * 38, { size: 20, mono: true, anchor: 'end', weight: 600 }); });
  }

  const stages = [
    { mood: 'look', name: 'Scores', icon: 'scores', title: 'The model outputs raw scores.', body: 'The last layer produces one number for every token, called a logit. Bigger means more likely, but the numbers can be negative and mean nothing as chances yet.', math: 'z ∈ R^V', note: 'These are the same eight candidates from Lesson 1.', ill: ill1 },
    { mood: 'wow', name: 'Exponentiate', icon: 'exp', title: 'Make every score positive.', body: 'Raising e to each score gives a positive number and stretches the gaps. A lead of 0.9 in score becomes a lead of about 2.5 times.', math: 'a_i = exp(z_i)', note: '', ill: ill2 },
    { mood: 'happy', name: 'Normalize', icon: 'divide', title: 'Divide by the total.', body: 'Dividing every value by their sum leaves numbers between 0 and 1 that add up to exactly 1. Those are probabilities.', math: 'p_i = a_i / Σ_j a_j', note: 'Steps 2 and 3 together are called softmax. Here the sum runs over 8 tokens; in a real model it runs over the whole vocabulary.', ill: ill3 },
    { mood: 'think', name: 'Temperature', icon: 'temp', title: 'Temperature sharpens or flattens.', body: 'Dividing the scores by T before softmax changes the shape. Below 1 the leader pulls away. Above 1 the choices even out. As T approaches 0 the model becomes greedy.', math: 'p_i = softmax(z_i / T)', note: '', ill: ill4 },
    { mood: 'grin', name: 'Sampling', icon: 'dice', title: 'Then one token is drawn.', body: 'Greedy decoding always takes the top token. Sampling lays the probabilities along a strip, draws a random number, and takes whichever token owns that spot. Likelier tokens win more often, but not always.', math: 'x ~ Categorical(p)', note: '', ill: ill5 },
    { mood: 'happy', name: 'Top-p', icon: 'cut', title: 'Top-p trims the unlikely tail.', body: 'Keep the smallest group of top tokens whose probabilities add up to p, drop the rest, and rescale. It blocks rare nonsense words while keeping variety.', math: 'keep smallest S with Σ_(i in S) p_i ≥ p', note: 'Top-k does the same with a fixed count instead of a probability total.', ill: ill6 },
  ];

  const settings = [['Greedy', 'Always the top token. Same answer every time.', 'Extraction, classification'], ['Low T, 0.2 to 0.5', 'Mostly the leader, with a little variation.', 'Code, facts, summaries'], ['T near 1', 'The distribution as trained.', 'General conversation'], ['High T, above 1', 'Flatter choices and more surprises.', 'Brainstorming, fiction']];
  const mini = () => h('div', { class: 'mini-bars' }, CAND.slice(0, 5).map(([w], i) => h('div', { class: 'mb' }, h('b', {}, w), h('div', { class: 'mb-t' }, h('i', { style: { '--w': (PR[i] / PR[0]) * 100 + '%' } })), h('span', {}, pct(PR[i])))));

  const cfg = {
    crumb: 'Lesson 2  ·  Softmax and decoding', eyebrow: 'Lesson 2  ·  Foundations', dwell: 5600,
    heroTitle: ['From scores to a ', h('em', {}, 'single word'), '.'],
    lead: 'The model ends with a list of raw numbers. Scroll to watch them become probabilities, and then a single chosen word.',
    stages, exploreEyebrow: 'Watch it happen', exploreTitle: 'Six steps, in order.', exploreSub: '',
    before: [h('section', { class: 'band' }, h('div', { class: 'wrap two' },
      h('div', { class: 'reveal' }, h('div', { class: 'eyebrow' }, 'The problem'), h('h2', {}, 'Scores are not chances.'), h('p', { class: 'big' }, 'The network outputs one raw number per token. To choose a word we need probabilities: positive, and adding up to 100%.'), h('p', {}, 'Softmax is the small, fixed recipe that does this. After it, decoding decides which token to take.')),
      h('div', { class: 'reveal card' }, mini())))],
    after: [
      h('section', { class: 'band' }, h('div', { class: 'wrap' },
        h('div', { class: 'sec-head reveal' }, h('div', { class: 'eyebrow' }, 'In practice'), h('h2', {}, 'Choosing the setting.'), h('p', {}, 'Decoding is a dial between predictable and varied. The right setting depends on the job.')),
        h('div', { class: 'nextgrid four reveal' }, settings.map(([t, d, u]) => h('div', { class: 'ncard' }, h('span', {}, 'Setting'), h('b', {}, t), h('p', {}, d), h('em', {}, u)))))),
      h('section', { class: 'band' }, h('div', { class: 'wrap' },
        h('div', { class: 'sec-head reveal' }, h('div', { class: 'eyebrow' }, 'In one line'), h('h2', {}, 'Softmax with temperature.')),
        h('div', { class: 'card reveal bigeq' }, h('code', { html: 'p<sub>i</sub> = <span class="e6">exp( z<sub>i</sub> / T )</span> / <span class="e5">Σ<sub>j</sub> exp( z<sub>j</sub> / T )</span>' }), h('div', { class: 'eq-legend' }, h('span', { class: 'e6' }, 'Exponentiate'), h('span', { class: 'e5' }, 'Divide by the total'))))),
      h('section', { class: 'band next' }, h('div', { class: 'wrap' },
        h('div', { class: 'sec-head reveal' }, h('div', { class: 'eyebrow' }, 'Next in the course'), h('h2', {}, 'Open the next box.')),
        h('div', { class: 'nextgrid reveal' }, h('a', { class: 'ncard', href: 'index.html' }, h('span', {}, 'Lesson 1'), h('b', {}, 'The full pipeline'), h('p', {}, 'Review the whole machine.')),
          h('div', { class: 'ncard' }, h('span', {}, 'Lesson 3'), h('b', {}, 'Loss and gradient descent'), h('p', {}, 'How training sets all the numbers inside the machine.')),
          h('div', { class: 'ncard' }, h('span', {}, 'Lesson 4'), h('b', {}, 'Attention'), h('p', {}, 'How tokens gather information from each other.')))))]
  };
  if (window.__video) { window.__STAGES2 = stages; return; }
  (window.__story === 'comic' ? Kit.comic : window.__story ? Kit.story : shell)(cfg);
})();

/* Chapter 1 figures: the full pipeline. Drawn on a 1200 x 600 canvas. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  function props(e, p) {
    for (const [k, v] of Object.entries(p || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.setAttribute('class', v);
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
  }
  const add = (e, kids) => { for (const k of kids.flat(Infinity)) { if (k == null || k === false) continue; e.append(k.nodeType ? k : document.createTextNode(k)); } };
  const h = (t, p, ...k) => { const e = document.createElement(t); props(e, p); add(e, k); return e; };
  const S = (t, p, ...k) => { const e = document.createElementNS(NS, t); props(e, p); add(e, k); return e; };

  const C = { bg: '#0b0b0d', ink: '#f5f5f7', mute: '#a1a1a6', dim: '#636366', line: '#2c2c2e', panel: '#1c1c1e', panel2: '#2c2c2e',
    blue: '#0a84ff', cyan: '#64d2ff', yellow: '#ffd60a', pink: '#ff375f', green: '#30d158', orange: '#ff9f0a' };
  const TOK = [C.blue, C.cyan, C.yellow, C.pink, C.green];
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,system-ui,"Helvetica Neue",Arial,sans-serif';
  const MONO = 'ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace';

  function T(p, str, x, y, o = {}) {
    const e = S('text', { x, y, 'font-size': o.size || 24, 'font-weight': o.weight || 500, fill: o.fill || C.ink, 'text-anchor': o.anchor || 'start',
      'font-family': o.mono ? MONO : FONT, 'letter-spacing': o.ls || 0 }, str); p.append(e); return e;
  }
  function R(p, x, y, w, hh, o = {}) {
    const e = S('rect', { x, y, width: w, height: hh, rx: o.r ?? 10, fill: o.fill || C.panel, stroke: o.stroke || 'none', 'stroke-width': o.sw || 2 }); p.append(e); return e;
  }
  function L(p, x1, y1, x2, y2, o = {}) {
    const e = S('line', { x1, y1, x2, y2, stroke: o.stroke || C.line, 'stroke-width': o.sw || 2, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || 'none' }); p.append(e); return e;
  }
  function P(p, d, o = {}) {
    const e = S('path', { d, fill: o.fill || 'none', stroke: o.stroke || C.ink, 'stroke-width': o.sw || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: o.op ?? 1 }); p.append(e); return e;
  }
  function Ci(p, cx, cy, r, o = {}) { const e = S('circle', { cx, cy, r, fill: o.fill || C.blue, stroke: o.stroke || 'none', 'stroke-width': o.sw || 2 }); p.append(e); return e; }
  const rise = (e, d = 0) => { e.classList.add('rise'); e.style.setProperty('--d', d + 's'); return e; };
  const label = (g, str, x, y, anchor = 'middle') => T(g, str, x, y, { size: 17, fill: C.mute, anchor, ls: 3, weight: 600 });
  const arrowHead = (g, x, y, ang, col = C.mute, s = 12) => { const e = S('polygon', { points: `0,0 ${-s},${-s * .55} ${-s},${s * .55}`, fill: col, transform: `translate(${x},${y}) rotate(${ang})` }); g.append(e); return e; };

  const val = (r, c) => { const x = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
  const heat = (v) => { const a = Math.min(1, Math.abs(v)); return v < 0 ? `rgba(10,132,255,${.18 + a * .82})` : `rgba(255,159,10,${.18 + a * .82})`; };
  const WORDS = ['The', ' cat', ' sat', ' on', ' the'], IDS = [464, 3797, 3332, 319, 262];
  const CAND = [['mat', 3.1], ['floor', 2.2], ['sofa', 1.4], ['rug', 1.0], ['chair', 0.6], ['moon', -0.5], ['the', -1.2], ['banana', -2.0]];
  const softmax = (z) => { const m = Math.max(...z), e = z.map(v => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); };
  const PROB = softmax(CAND.map(c => c[1]));

  /* ============ the seven illustrations (1200 x 600 canvas) ============ */
  function ill1(g) {
    label(g, 'PROMPT', 600, 98);
    rise(R(g, 230, 122, 740, 124, { r: 26, fill: C.panel, stroke: C.line }), 0);
    const tx = rise(T(g, 'The cat sat on the', 600, 205, { size: 58, weight: 600, anchor: 'middle' }), .15);
    const b = tx.getBBox(); const caret = R(g, b.x + b.width + 10, 156, 4, 58, { r: 2, fill: C.blue }); caret.classList.add('blink');
    label(g, 'THE SAME TEXT, AS CHARACTERS', 600, 330);
    const s = 'The cat sat on the', w = 46, gap = 6, x0 = 600 - (s.length * (w + gap) - gap) / 2;
    [...s].forEach((ch, i) => {
      const x = x0 + i * (w + gap), sp = ch === ' ';
      rise(R(g, x, 352, w, 56, { r: 10, fill: sp ? 'none' : C.panel, stroke: sp ? C.dim : C.line }), .4 + i * .03);
      if (!sp) rise(T(g, ch, x + w / 2, 390, { size: 28, mono: true, weight: 600, anchor: 'middle' }), .45 + i * .03);
      rise(T(g, String(i), x + w / 2, 436, { size: 15, mono: true, fill: C.dim, anchor: 'middle' }), .5 + i * .03);
    });
    rise(T(g, '18 characters. Nothing here can be added or multiplied yet.', 600, 520, { size: 27, fill: C.mute, anchor: 'middle' }), 1.1);
  }

  function ill2(g) {
    const W = [118, 112, 112, 102, 112], gap = 18, tot = W.reduce((a, b) => a + b, 0) + gap * 4; let x = 600 - tot / 2; const cx = [];
    label(g, 'TOKENS', 600, 92);
    WORDS.forEach((w, i) => {
      const grp = S('g'); g.append(grp); rise(grp, .1 + i * .12);
      R(grp, x, 112, W[i], 78, { r: 16, fill: TOK[i] + '24', stroke: TOK[i], sw: 2.5 });
      if (w[0] === ' ') T(grp, '·', x + 16, 164, { size: 36, fill: C.dim, mono: true });
      T(grp, w.trim(), x + W[i] / 2 + (w[0] === ' ' ? 6 : 0), 163, { size: 40, weight: 600, anchor: 'middle' });
      if (window.Kit) Kit.eyes(grp, x + W[i] / 2, 108, { r: 7, gap: 13, look: i % 2 ? 2 : -2 });
      cx.push(x + W[i] / 2); x += W[i] + gap;
    });
    label(g, 'INTEGER IDS', 600, 338);
    IDS.forEach((id, i) => {
      const grp = S('g'); g.append(grp); rise(grp, .8 + i * .12);
      L(grp, cx[i], 196, cx[i], 238, { stroke: TOK[i], sw: 2.5 });
      arrowHead(grp, cx[i], 242, 90, TOK[i], 10);
      R(grp, cx[i] - 56, 250, 112, 54, { r: 14, fill: C.panel, stroke: TOK[i] });
      T(grp, String(id), cx[i], 288, { size: 32, mono: true, weight: 600, anchor: 'middle', fill: TOK[i] });
    });
    label(g, 'VOCABULARY  ·  A FIXED LOOKUP LIST OF 50,000 TO 200,000 TOKENS', 600, 394);
    const ent = [['0', '!'], ['1', '"'], null, ['262', ' the'], null, ['3797', ' cat'], null, ['50256', '<end>']];
    let ex = 168; ent.forEach((e, i) => {
      if (!e) { rise(T(g, '...', ex + 22, 462, { size: 30, fill: C.dim, anchor: 'middle', mono: true }), 1.5 + i * .05); ex += 66; return; }
      const hi = e[0] === '3797' || e[0] === '262', w = 72 + e[1].length * 8; const grp = S('g'); g.append(grp); rise(grp, 1.5 + i * .06);
      R(grp, ex, 420, w + 40, 64, { r: 14, fill: hi ? C.panel2 : C.panel, stroke: hi ? C.yellow : C.line });
      T(grp, e[0], ex + 14, 449, { size: 17, mono: true, fill: C.dim }); T(grp, e[1].replace(' ', ' '), ex + 14, 474, { size: 22, mono: true, weight: 600, fill: hi ? C.yellow : C.ink });
      ex += w + 58;
    });
    rise(T(g, 'The ids shown are illustrative. Real tokenizers learn their pieces from data.', 600, 556, { size: 21, fill: C.dim, anchor: 'middle' }), 2.2);
  }

  function ill3(g) {
    const CW = 22, CH = 13, COLS = 16, ROWS = 21, x0 = 90, y0 = 160, hi = [3, 7, 10, 14, 18];
    label(g, 'E   ·   LEARNED TABLE, ONE ROW PER TOKEN', x0 + COLS * CW / 2 + 40, 120);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const e = R(g, x0 + c * CW, y0 + r * CH, CW - 1.5, CH - 1.5, { r: 2, fill: heat(val(r, c)) }); e.style.opacity = hi.includes(r) ? 1 : .28; rise(e, Math.min(.9, r * .02));
    }
    const X0 = 740, RH = 52, Y0 = 206;
    label(g, 'X   ·   THE 5 TOKENS, AS ROWS', X0 + COLS * 24 / 2 - 30, 120);
    hi.forEach((r, i) => {
      const yL = y0 + r * CH + CH / 2, yR = Y0 + i * RH + 20, grp = S('g'); g.append(grp); rise(grp, 1 + i * .15);
      R(grp, x0 - 5, y0 + r * CH - 3, COLS * CW + 8, CH + 4, { r: 5, fill: 'none', stroke: TOK[i], sw: 2.5 });
      P(grp, `M ${x0 + COLS * CW + 8} ${yL} C 560 ${yL}, 600 ${yR}, ${X0 - 70} ${yR}`, { stroke: TOK[i], sw: 2.5, op: .9 });
      T(grp, WORDS[i].trim(), X0 - 18, yR + 8, { size: 24, weight: 600, anchor: 'end', fill: TOK[i] });
      for (let c = 0; c < COLS; c++) R(grp, X0 + c * 24, Y0 + i * RH, 22.5, 40, { r: 5, fill: heat(val(r, c)) });
    });
    rise(T(g, '16 columns shown. Real models use 768 to 12,288.', X0 + 190, 498, { size: 20, fill: C.dim, anchor: 'middle' }), 2);
    rise(T(g, 'A token id selects a row. The numbers in the table are learned during training.', 600, 566, { size: 25, fill: C.mute, anchor: 'middle' }), 2.2);
  }

  function ill4(g) {
    const cols = [270, 395, 520, 645, 770], tops = [120, 285, 405], names = ['Layer N', 'Layer 2', 'Layer 1'];
    cols.forEach((x, i) => { rise(T(g, WORDS[i].trim(), x, 568, { size: 26, weight: 600, anchor: 'middle', fill: TOK[i] }), 0); });
    tops.forEach((y, li) => {
      const grp = S('g'); g.append(grp); rise(grp, .2 + (2 - li) * .35);
      R(grp, 210, y, 640, 100, { r: 20, fill: C.panel, stroke: C.line });
      T(grp, names[li], 194, y + 56, { size: 20, fill: C.mute, anchor: 'end', weight: 600 });
      cols.forEach((x, i) => {
        for (let j = i + 1; j < 5; j++) {
          const d = cols[j] - x, w = (j === 4 ? .9 : .45) * (1 - (j - i) * .12);
          P(grp, `M ${x} ${y + 40} C ${x} ${y + 40 - d * .17 - 8}, ${cols[j]} ${y + 40 - d * .17 - 8}, ${cols[j]} ${y + 40}`, { stroke: C.blue, sw: 1.2 + w * 3, op: .25 + w * .65 });
        }
        Ci(grp, x, y + 40, 6, { fill: C.blue });
        R(grp, x - 22, y + 56, 44, 30, { r: 8, fill: C.orange + '30', stroke: C.orange, sw: 2 });
      });
    });
    [[505, 405], [385, 285]].forEach(([a, b], k) => cols.forEach((x, i) => { const l = L(g, x, a + 22, x, b + 100 - 2, { stroke: i === 4 ? C.green : C.dim, sw: i === 4 ? 3 : 1.5, dash: '6 6' }); l.classList.add('flow'); rise(l, 1 + k * .2); }));
    cols.forEach((x, i) => { const l = L(g, x, 548, x, 516, { stroke: TOK[i], sw: 2.5 }); rise(l, .1); });
    T(g, '⋮', 520, 266, { size: 36, fill: C.dim, anchor: 'middle' });
    const l2 = L(g, 770, 118, 770, 74, { stroke: C.green, sw: 3 }); rise(l2, 1.6); arrowHead(g, 770, 70, -90, C.green, 12);
    rise(T(g, 'this output predicts the next token', 770, 54, { size: 22, weight: 600, fill: C.green, anchor: 'middle' }), 1.7);
    const lg = S('g'); g.append(lg); rise(lg, 1.9);
    P(lg, 'M 880 150 C 900 130, 930 130, 950 150', { stroke: C.blue, sw: 3 }); T(lg, 'attention', 964, 152, { size: 22, weight: 600, fill: C.blue });
    T(lg, 'positions exchange', 880, 182, { size: 18, fill: C.mute }); T(lg, 'information, looking back only', 880, 204, { size: 18, fill: C.mute });
    R(lg, 880, 250, 44, 30, { r: 8, fill: C.orange + '30', stroke: C.orange, sw: 2 }); T(lg, 'MLP', 938, 273, { size: 22, weight: 600, fill: C.orange });
    T(lg, 'each position processes', 880, 308, { size: 18, fill: C.mute }); T(lg, 'what it gathered', 880, 330, { size: 18, fill: C.mute });
    T(lg, 'repeated N times', 880, 400, { size: 22, weight: 600 }); T(lg, '12 to 100+ layers', 880, 428, { size: 18, fill: C.mute });
  }

  function ill5(g) {
    label(g, 'LAST POSITION, h', 232, 190);
    for (let c = 0; c < 16; c++) rise(R(g, 60 + c * 22, 210, 20.5, 56, { r: 4, fill: heat(val(2, c + 5)) }), c * .02);
    T(g, 'd numbers', 232, 304, { size: 20, fill: C.dim, anchor: 'middle' });
    rise(L(g, 420, 238, 480, 238, { stroke: C.mute, sw: 3 }), .5); arrowHead(g, 488, 238, 0, C.mute, 12);
    const wg = S('g'); g.append(wg); rise(wg, .6);
    R(wg, 500, 140, 130, 196, { r: 18, fill: C.panel, stroke: C.line });
    for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) R(wg, 518 + c * 24, 160 + r * 24, 20, 20, { r: 4, fill: heat(val(r + 30, c)) });
    T(wg, 'W_out', 565, 372, { size: 24, weight: 600, anchor: 'middle', mono: true }); T(wg, 'd × V', 565, 398, { size: 19, fill: C.dim, anchor: 'middle', mono: true });
    rise(L(g, 640, 238, 690, 238, { stroke: C.mute, sw: 3 }), .9); arrowHead(g, 698, 238, 0, C.mute, 12);
    label(g, 'z   ·   ONE RAW SCORE PER TOKEN', 920, 98);
    const zx = 900, sc = 62;
    L(g, zx, 118, zx, 500, { stroke: C.dim, sw: 2 });
    CAND.forEach(([w, z], i) => {
      const y = 130 + i * 46, grp = S('g'); g.append(grp); rise(grp, 1 + i * .09);
      T(grp, w, 736, y + 25, { size: 24, weight: 600, anchor: 'end', fill: i === 0 ? C.ink : C.mute });
      const x = z >= 0 ? zx : zx + z * sc, wd = Math.abs(z) * sc;
      R(grp, x, y + 6, wd, 28, { r: 6, fill: z >= 0 ? C.blue : C.panel2, stroke: z >= 0 ? 'none' : C.dim });
      T(grp, (z > 0 ? '+' : z < 0 ? '−' : '') + Math.abs(z).toFixed(1), z >= 0 ? zx + wd + 12 : zx + 12, y + 27, { size: 21, mono: true, fill: C.mute });
    });
    rise(T(g, '... and tens of thousands more, one for every token', 920, 534, { size: 21, fill: C.dim, anchor: 'middle' }), 1.9);
    rise(T(g, 'Scores can be any size and can be negative. They are not probabilities yet.', 600, 578, { size: 24, fill: C.mute, anchor: 'middle' }), 2.1);
  }

  function ill6(g) {
    label(g, 'SCORES, z', 170, 98); label(g, 'PROBABILITIES, p', 900, 98);
    CAND.forEach(([w, z], i) => {
      const y = 130 + i * 46, grp = S('g'); g.append(grp); rise(grp, i * .07);
      T(grp, w, 90, y + 27, { size: 24, weight: 600, fill: i === 0 ? C.ink : C.mute }); T(grp, (z > 0 ? '+' : z < 0 ? '−' : '') + Math.abs(z).toFixed(1), 270, y + 27, { size: 22, mono: true, fill: C.dim, anchor: 'end' });
    });
    const sg = S('g'); g.append(sg); rise(sg, .8);
    L(sg, 300, 316, 380, 316, { stroke: C.mute, sw: 3 }); arrowHead(sg, 388, 316, 0, C.mute, 12);
    R(sg, 400, 250, 190, 132, { r: 22, fill: C.panel, stroke: C.blue, sw: 2.5 });
    T(sg, 'softmax', 495, 308, { size: 32, weight: 600, anchor: 'middle' }); T(sg, 'e^z / Σ e^z', 495, 346, { size: 21, anchor: 'middle', mono: true, fill: C.mute });
    L(sg, 600, 316, 650, 316, { stroke: C.mute, sw: 3 }); arrowHead(sg, 658, 316, 0, C.mute, 12);
    const mx = Math.max(...PROB);
    CAND.forEach(([w], i) => {
      const y = 130 + i * 46, grp = S('g'); g.append(grp); rise(grp, 1.1 + i * .09);
      T(grp, w, 740, y + 27, { size: 24, weight: 600, fill: i === 0 ? C.ink : C.mute });
      R(grp, 840, y + 6, 240, 28, { r: 6, fill: C.panel });
      R(grp, 840, y + 6, Math.max(4, 240 * PROB[i] / mx), 28, { r: 6, fill: i === 0 ? C.green : '#48484a' });
      T(grp, (PROB[i] * 100).toFixed(1) + '%', 1092, y + 28, { size: 22, mono: true, fill: C.mute });
    });
    const st = S('g'); g.append(st); rise(st, 2);
    let sx = 740; PROB.forEach((p, i) => { const w = 340 * p; R(st, sx, 518, w, 22, { r: 0, fill: i === 0 ? C.green : ['#48484a', '#636366', '#8e8e93', '#a1a1a6', '#aeaeb2', '#c7c7cc', '#d1d1d6'][i - 1] }); sx += w; });
    T(st, 'sum = 100%', 740, 566, { size: 21, weight: 600, fill: C.mute });
    rise(T(g, 'All positive. They add up to 100%.', 90, 548, { size: 22, fill: C.mute }), 2.1); rise(T(g, 'The ranking of the scores is preserved.', 90, 578, { size: 22, fill: C.mute }), 2.15);
    rise(T(g, '8 tokens shown', 1080, 566, { size: 17, fill: C.dim, anchor: 'end' }), 2.2);
  }

  function ill7(g) {
    label(g, 'THE TEXT, NOW LONGER', 340, 78);
    const W = [96, 90, 90, 80, 90], gap = 12; let x = 90; const y = 96;
    WORDS.forEach((w, i) => { const grp = S('g'); g.append(grp); rise(grp, i * .06); R(grp, x, y, W[i], 58, { r: 12, fill: C.panel, stroke: C.line }); T(grp, w.trim(), x + W[i] / 2, y + 39, { size: 28, weight: 600, anchor: 'middle' }); x += W[i] + gap; });
    const slotX = x; const slot = S('g'); g.append(slot); rise(slot, 1.6);
    R(slot, slotX, y, 110, 58, { r: 12, fill: C.green + '26', stroke: C.green, sw: 3 }); T(slot, 'mat', slotX + 55, y + 39, { size: 28, weight: 600, anchor: 'middle' });
    const q = S('g'); g.append(q); const dash = R(q, slotX, y, 110, 58, { r: 12, fill: 'none', stroke: C.blue, sw: 3 }); dash.setAttribute('stroke-dasharray', '8 6'); T(q, '?', slotX + 55, y + 42, { size: 32, weight: 700, anchor: 'middle', fill: C.blue }); q.classList.add('fadeout');
    label(g, 'PICK FROM THE DISTRIBUTION', 340, 232);
    const mx = PROB[0];
    CAND.slice(0, 4).forEach(([w], i) => {
      const yy = 256 + i * 54, grp = S('g'); g.append(grp); rise(grp, .5 + i * .1);
      T(grp, w, 90, yy + 30, { size: 26, weight: 600, fill: i === 0 ? C.ink : C.mute });
      R(grp, 190, yy + 6, 380, 32, { r: 7, fill: C.panel }); R(grp, 190, yy + 6, 380 * PROB[i] / mx, 32, { r: 7, fill: i === 0 ? C.green : '#48484a' });
      T(grp, (PROB[i] * 100).toFixed(1) + '%', 584, yy + 31, { size: 23, mono: true, fill: C.mute });
    });
    const pk = S('g'); g.append(pk); rise(pk, 1.2);
    P(pk, `M 520 266 C 640 200, ${slotX + 30} 200, ${slotX + 55} ${y + 70}`, { stroke: C.green, sw: 3 }); arrowHead(pk, slotX + 55, y + 66, 90, C.green, 12);
    const cards = [['Greedy', 'Always take the top token. Same input, same output.', 700], ['Sampling', 'A weighted random draw. Floor wins about 1 in 5.', 700]];
    cards.forEach(([t, d, cx], i) => { const gg = S('g'); g.append(gg); rise(gg, 1.8 + i * .2); const y0 = 246 + i * 146; R(gg, 690, y0, 340, 130, { r: 18, fill: C.panel, stroke: C.line }); T(gg, t, 714, y0 + 38, { size: 26, weight: 600, fill: i ? C.cyan : C.green }); wrap(gg, d, 714, y0 + 70, 290, 20); });
    const lp = S('g'); g.append(lp); rise(lp, 2.3);
    P(lp, `M ${slotX + 120} ${y + 29} H 1062 V 548 H 170`, { stroke: C.blue, sw: 3 }); arrowHead(lp, 160, 548, 180, C.blue, 13);
    T(lp, 'append the token, then run the whole pipeline again', 616, 582, { size: 22, weight: 600, fill: C.blue, anchor: 'middle' });
  }
  function wrap(g, str, x, y, w, size) {
    const words = str.split(' '); let line = '', yy = y;
    words.forEach(wd => { const t = line ? line + ' ' + wd : wd; if (t.length * size * .52 > w && line) { T(g, line, x, yy, { size, fill: C.mute }); yy += size + 8; line = wd; } else line = t; });
    T(g, line, x, yy, { size, fill: C.mute });
  }

  /* ============ content ============ */
  const STAGES = [
    { mood: 'look', name: 'Text', icon: 'text', title: 'It starts as text.', body: 'A prompt is a string of characters. A computer cannot calculate with letters, so the first job is to turn text into numbers.', math: 'text ∈ Σ*', note: '', ill: ill1 },
    { mood: 'happy', name: 'Tokens', icon: 'tokens', title: 'Text becomes tokens.', body: 'The text is cut into pieces called tokens: whole words, word fragments or punctuation. Each piece has a fixed integer id in the model’s vocabulary.', math: 'ids = tokenize(text) ∈ {0 … V−1}^n', note: 'Common words stay whole. Rare words are split, for example “unbelievably” into “Un”, “believ” and “ably”.', ill: ill2 },
    { mood: 'think', name: 'Vectors', icon: 'vectors', title: 'Tokens become vectors.', body: 'Each id selects one row from a large learned table. That row, a list of numbers, is the token’s vector. Tokens used in similar ways end up with similar rows.', math: 'X = E[ids] ∈ R^(n×d)', note: 'The table E is part of the model. Its numbers are set by training.', ill: ill3 },
    { mood: 'think', name: 'Transformer', icon: 'layers', title: 'The transformer mixes and thinks.', body: 'In attention, every position gathers information from the positions before it. A feed-forward block then processes what each position collected. The pair repeats dozens of times.', math: 'H = Transformer(X) ∈ R^(n×d)', note: 'Chapter 4 opens this box and shows how attention works.', ill: ill4 },
    { mood: 'look', name: 'Scores', icon: 'scores', title: 'One score for every token.', body: 'The final position’s vector is multiplied by an output matrix. The result is one raw score, called a logit, for each token in the vocabulary.', math: 'z = h_n · W_out ∈ R^V', note: 'Only the last position is used, because that is where the next token is predicted.', ill: ill5 },
    { mood: 'wow', name: 'Probabilities', icon: 'prob', title: 'Scores become probabilities.', body: 'Softmax turns the scores into positive numbers that add up to 100%. The model now holds a distribution over what could come next.', math: 'p_i = exp(z_i) / Σ_j exp(z_j)', note: 'Chapter 2 works through softmax step by step.', ill: ill6 },
    { mood: 'grin', name: 'Pick', icon: 'pick', title: 'Pick one, then go again.', body: 'A token is chosen, either the top one or a random draw from the distribution. It is appended to the text, and the entire process runs again on the longer input.', math: 'x_(n+1) ~ p,   text ← text + x_(n+1)', note: 'This loop, run again and again, is how every response is generated.', ill: ill7 },
  ];

  function icon(kind) {
    const s = S('svg', { viewBox: '0 0 40 40', width: 34, height: 34, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
    const add2 = (...els) => els.forEach(e => s.append(e));
    if (kind === 'text') add2(S('path', { d: 'M8 12h24M8 20h24M8 28h14' }));
    if (kind === 'tokens') add2(S('rect', { x: 5, y: 14, width: 8, height: 12, rx: 3 }), S('rect', { x: 16, y: 14, width: 8, height: 12, rx: 3 }), S('rect', { x: 27, y: 14, width: 8, height: 12, rx: 3 }));
    if (kind === 'vectors') for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) add2(S('circle', { cx: 10 + c * 10, cy: 10 + r * 10, r: 2.2, fill: 'currentColor' }));
    if (kind === 'layers') add2(S('rect', { x: 6, y: 7, width: 28, height: 7, rx: 3 }), S('rect', { x: 6, y: 17, width: 28, height: 7, rx: 3 }), S('rect', { x: 6, y: 27, width: 28, height: 7, rx: 3 }));
    if (kind === 'scores') add2(S('path', { d: 'M9 31V19M16 31V11M23 31V24M30 31V15' }));
    if (kind === 'prob') add2(S('path', { d: 'M8 28h24M10 28V16M20 28V9M30 28V22' }));
    if (kind === 'pick') add2(S('path', { d: 'M12 14a11 11 0 1 1-2 9' }), S('path', { d: 'M8 8v7h7' }));
    return s;
  }

  /* ============ page ============ */
  function build() {
    let idx = 0;
    const themeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark theme', onclick() {
      const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', cur === 'light' ? 'dark' : 'light');
    } }, '◐');

    /* hero diagram: all seven stages, clickable */
    const heroRail = h('div', { class: 'hero-rail' }, STAGES.map((st, i) => h('button', { class: 'hr-node', style: { '--i': i }, onclick: () => openStage(i), 'aria-label': `Open stage ${i + 1}: ${st.name}` },
      h('span', { class: 'hr-ic' }, icon(st.icon)), h('span', { class: 'hr-n' }, String(i + 1).padStart(2, '0')), h('b', {}, st.name))));

    /* the explorer */
    const stageSvg = S('svg', { viewBox: '0 0 1200 600', class: 'ex-svg', role: 'img', 'aria-label': 'Illustration of the current stage' });
    const g = S('g'); stageSvg.append(g);
    const idxLabel = h('div', { class: 'ex-idx' });
    const prev = h('button', { class: 'ex-arrow left', 'aria-label': 'Previous stage', onclick: () => go(idx - 1) }, '‹');
    const next = h('button', { class: 'ex-arrow right', 'aria-label': 'Next stage', onclick: () => go(idx + 1) }, '›');
    const canvas = h('div', { class: 'ex-canvas' }, stageSvg, idxLabel, prev, next);
    const tabs = h('div', { class: 'ex-tabs', role: 'tablist' }, STAGES.map((st, i) => h('button', { class: 'ex-tab', role: 'tab', onclick: () => go(i) }, h('span', {}, String(i + 1).padStart(2, '0')), st.name)));
    const fill = h('i'); const bar = h('div', { class: 'ex-bar' }, fill);
    const tTitle = h('h3'), tBody = h('p', { class: 'ex-body' }), tMath = h('div', { class: 'formula' }), tNote = h('p', { class: 'ex-note' });
    const text = h('div', { class: 'ex-text' }, h('div', { class: 'ex-stagehead' }, tTitle), h('div', { class: 'ex-detail' }, tBody, tMath, tNote));
    let timer = null;
    const playBtn = h('button', { class: 'btn play', onclick() { timer ? stop() : play(); } });
    const setPlay = () => { playBtn.textContent = timer ? 'Pause' : (idx >= STAGES.length - 1 ? 'Replay' : 'Play all stages'); playBtn.classList.toggle('on', !!timer); };
    function stop() { clearInterval(timer); timer = null; setPlay(); }
    function play() { if (idx >= STAGES.length - 1) go(0, true); clearInterval(timer); timer = setInterval(() => { go(idx + 1, true); if (idx >= STAGES.length - 1) stop(); }, 5600); setPlay(); }
    const explorer = h('section', { class: 'explorer', id: 'explore' }, h('div', { class: 'wrap' },
      h('div', { class: 'sec-head' }, h('div', { class: 'eyebrow' }, 'Follow one prompt'), h('h2', {}, 'Watch the machine run.'), h('p', {}, 'The same sentence, “The cat sat on the”, travels through seven stages. Press play to watch it in order, or pick a stage to look closer.')),
      h('div', { class: 'ex-ctrl' }, playBtn, h('span', { class: 'hint' }, 'or step through with the arrows')), tabs, bar, canvas, text));

    function go(i, auto) {
      if (!auto) stop();
      idx = Math.max(0, Math.min(STAGES.length - 1, i)); const st = STAGES[idx];
      [...tabs.children].forEach((t, j) => { t.classList.toggle('on', j === idx); t.classList.toggle('past', j < idx); t.setAttribute('aria-selected', j === idx); });
      fill.style.width = (idx / (STAGES.length - 1)) * 100 + '%';
      g.replaceChildren(); st.ill(g);
      idxLabel.textContent = `${String(idx + 1).padStart(2, '0')} / 07  ·  ${st.name.toUpperCase()}`;
      tTitle.textContent = st.title; tBody.textContent = st.body; tMath.textContent = st.math; tNote.textContent = st.note; tNote.style.display = st.note ? '' : 'none';
      text.classList.remove('swap'); void text.offsetWidth; text.classList.add('swap');
      prev.disabled = idx === 0; next.disabled = idx === STAGES.length - 1; setPlay();
    }
    function openStage(i) { go(i); document.getElementById('explore').scrollIntoView({ behavior: 'smooth' }); }

    /* "one job" picture (HTML bars) */
    const mini = h('div', { class: 'mini' }, h('div', { class: 'mini-sent' }, ...['The', 'cat', 'sat', 'on', 'the'].map(w => h('span', { class: 'mtok' }, w)), h('span', { class: 'mtok ghost' }, '?')),
      h('div', { class: 'mini-bars' }, CAND.slice(0, 5).map(([w], i) => h('div', { class: 'mb' }, h('b', {}, w), h('div', { class: 'mb-t' }, h('i', { style: { '--w': (PROB[i] / PROB[0]) * 100 + '%' } })), h('span', {}, (PROB[i] * 100).toFixed(0) + '%')))));

    /* loop picture */
    const rounds = [[['The', 'cat', 'sat', 'on', 'the'], 'mat'], [['The', 'cat', 'sat', 'on', 'the', 'mat'], '.'], [['The', 'cat', 'sat', 'on', 'the', 'mat', '.'], 'The']];
    const loopPic = h('div', { class: 'loop' }, rounds.map(([toks, nx], r) => h('div', { class: 'lp-row reveal', style: { '--rd': r * .15 + 's' } }, h('span', { class: 'lp-n' }, 'Pass ' + (r + 1)),
      h('div', { class: 'lp-toks' }, toks.map((t, i) => h('span', { class: 'mtok' + (r > 0 && i === toks.length - 1 ? ' new' : '') }, t))), h('span', { class: 'lp-arrow' }, '→'), h('span', { class: 'mtok pick' }, nx))));

    const eq = h('div', { class: 'bigeq' },
      h('code', { html: 'p(x<sub>n+1</sub> | x<sub>1</sub> … x<sub>n</sub>) = <span class="e6">softmax</span>( <span class="e4">Transformer</span>( <span class="e3">E</span>[x<sub>1</sub> … x<sub>n</sub>] )<sub>n</sub> · <span class="e5">W<sub>out</sub></span> )' }),
      h('div', { class: 'eq-legend' }, [['e3', '3  Vectors'], ['e4', '4  Transformer'], ['e5', '5  Scores'], ['e6', '6  Probabilities']].map(([c, t]) => h('span', { class: c }, t))));

    const ideaSec = h('section', { class: 'band' }, h('div', { class: 'wrap two' },
        h('div', { class: 'reveal' }, h('div', { class: 'eyebrow' }, 'The idea'), h('h2', {}, 'A language model does one thing.'), h('p', { class: 'big' }, 'Given the text so far, it assigns a probability to every possible next token. That is the entire task.'), h('p', {}, 'Everything else, the tokens, the vectors, the layers, exists to make that one prediction as good as possible.')),
        h('div', { class: 'reveal card' }, mini)));
    const loopSec = h('section', { class: 'band' }, h('div', { class: 'wrap' },
        h('div', { class: 'sec-head reveal' }, h('div', { class: 'eyebrow' }, 'Then it repeats'), h('h2', {}, 'A reply is the same pass, run again and again.'), h('p', {}, 'The chosen token is added to the text, and the longer text goes back in. Each pass produces exactly one token.')),
        h('div', { class: 'card reveal' }, loopPic)));
    const eqSec = h('section', { class: 'band' }, h('div', { class: 'wrap' },
        h('div', { class: 'sec-head reveal' }, h('div', { class: 'eyebrow' }, 'In one line'), h('h2', {}, 'The whole pipeline, written down.'), h('p', {}, 'Read it from the inside out: look up the vectors, run the transformer, take the last position, score every token, turn scores into probabilities.')),
        h('div', { class: 'card reveal' }, eq)));
    const nextSec = h('section', { class: 'band next' }, h('div', { class: 'wrap' },
        h('div', { class: 'sec-head reveal' }, h('div', { class: 'eyebrow' }, 'Next in the course'), h('h2', {}, 'Open each box.')),
        h('div', { class: 'nextgrid reveal' }, [['Softmax and decoding', 'How scores become probabilities, and how one token is chosen.'], ['Loss and gradient descent', 'How training sets all the numbers inside the machine.'], ['Attention', 'How tokens gather information from each other.']].map(([t, d], i) => h(i === 0 ? 'a' : 'div', { class: 'ncard', href: i === 0 ? 'lesson2.html' : null }, h('span', {}, 'Lesson ' + (i + 2)), h('b', {}, t), h('p', {}, d))))));
    if (window.__video) { window.__STAGES = STAGES; window.__ICON = icon; return { node: document.createElement('div'), init() {} }; }
    if (window.__story) {
      (window.__story === 'comic' ? Kit.comic : Kit.story)({ crumb: 'Lesson 1  ·  The full pipeline', eyebrow: 'Lesson 1  ·  Foundations', iconFn: icon, stages: STAGES,
        heroTitle: ['From a prompt to the ', h('em', {}, 'next word'), '.'], lead: 'Every reply from a language model is built by one machine, run over and over. Scroll to watch one sentence travel through it.',
        before: [ideaSec], after: [loopSec, eqSec, nextSec] });
      return { node: document.createElement('div'), init() {} };
    }
    const node = h('div', { id: 'top' },
      h('header', { class: 'top' }, h('a', { class: 'brand', href: '#top' }, h('span', { class: 'logo' }, 'AI'), 'AI Academy'), h('span', { class: 'crumb' }, 'Lesson 1  ·  The full pipeline'), h('div', { class: 'tools' }, themeBtn)),
      h('section', { class: 'hero' }, h('div', { class: 'wrap' },
        h('div', { class: 'eyebrow' }, 'Lesson 1  ·  Foundations'),
        h('h1', {}, 'From a prompt to the ', h('em', {}, 'next word'), '.'),
        h('p', { class: 'lead' }, 'Every reply from a language model is built by one machine, run over and over. This lesson shows the whole machine in seven pictures.'),
        h('div', { class: 'row' }, h('a', { class: 'btn primary lg', href: '#explore', onclick(e) { e.preventDefault(); openStage(0); } }, 'Start exploring'), h('span', { class: 'hint' }, 'or choose a stage below')),
        heroRail)),
      ideaSec,
      explorer,
      loopSec, eqSec, nextSec,
      h('footer', { class: 'foot2' }, 'Examples and numbers are illustrative.'));

    const rev = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    requestAnimationFrame(() => { node.querySelectorAll('.reveal').forEach(e => rev.observe(e)); });
    document.addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      const r = explorer.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      if (e.key === 'ArrowRight') { go(idx + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { go(idx - 1); e.preventDefault(); }
    });
    window.__pipelineGo = go;
    return { node, init: () => go(0, false) };
  }

  const b = build(); if (!window.__story && !window.__video) { document.getElementById('app').replaceChildren(b.node); b.init(); }
})();

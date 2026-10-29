/* Chapter 5: Softmax and decoding. */
(function () {
  'use strict';
  const { h, S, sm, f, pc, P, prose, box, eq, T, ans, fig: fig0 } = Book;
  const ST2 = window.__STAGES2, fig = (i, n, t, c) => fig0(i, n, t, c, ST2);
  const CAND = [['mat', 3.1], ['floor', 2.2], ['sofa', 1.4], ['rug', 1.0], ['chair', 0.6], ['moon', -0.5], ['the', -1.2], ['banana', -2.0]];
  const Z = CAND.map(c => c[1]), PR = sm(Z);
  const z3 = [2.0, 1.0, -1.0], e3 = z3.map(Math.exp), s3 = e3.reduce((a, b) => a + b, 0), p3 = e3.map(v => v / s3);
  const tp = (t) => sm(z3, t);
  let cum = 0; const bounds = PR.map(p => { const lo = cum; cum += p; return [lo, cum]; });
  const u = 0.30, hit = bounds.findIndex(([lo, hi]) => u >= lo && u < hi);
  const keep = 4, kept = PR.slice(0, keep), ks = kept.reduce((a, b) => a + b, 0);
  const cumP = []; PR.reduce((a, p, i) => (cumP[i] = a + p, a + p), 0);
  const tab = (head, rows, o = {}) => h('table', { class: 'calc' }, h('tr', {}, head.map(t => h('th', {}, t))), rows.map(r => h('tr', { class: r.cls || '' }, r.cells.map((c, i) => h('td', { class: (r.hl || []).includes(i) ? 'hl' : '' }, c)))));

  /* interactive: temperature slider over the eight candidates */
  function tempWidget() {
    const bars = [], pcs = [], tv = h('b', {}, '1.0'), top = h('div', { class: 'wsum' });
    const upd = (t) => { const p = sm(Z, t); tv.textContent = f(t, 2); p.forEach((v, i) => { bars[i].style.width = v * 100 + '%'; pcs[i].textContent = pc(v, v < .1 ? 1 : 0); });
      top.textContent = t < .35 ? 'Almost all the chance sits on one token. The model always picks its top word.' : t > 1.8 ? 'The choices are nearly even. Unlikely tokens now get real chances.' : 'In between: the leader is favored, but others stay possible.'; };
    const inp = h('input', { type: 'range', min: .1, max: 3, step: .05, value: 1, 'aria-label': 'Temperature', oninput: () => upd(+inp.value), style: { width: '100%', accentColor: 'var(--brand)' } });
    const rows = CAND.map(([w], i) => { const bar = h('i'), pcEl = h('span', { class: 'pc' }); bars.push(bar); pcs.push(pcEl); return h('div', { class: 'wrow wide' }, h('b', {}, w), h('div', { class: 'bar' }, bar), pcEl); });
    const w = h('div', { class: 'widget' }, h('div', { class: 'wh' }, 'Try it  ·  Temperature'), h('div', { class: 'wb' }, h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1rem' } }, h('span', { class: 'mono', style: { whiteSpace: 'nowrap' } }, 'T ='), inp, h('span', { class: 'mono', style: { minWidth: '3ch' } }, tv)), rows, top));
    upd(1); return w;
  }

  const secs = [
    ['5.1', 'Scores are not chances', [
      prose('Chapter 1 gave the gist of softmax. This chapter zooms in on it, and on the dial that controls it.'),
      prose('The model has just read <i>The cat sat on the…</i> (the eight-candidate list from Chapter 1). For every possible next token it has produced one score. These scores are called <b>logits</b>. Higher means the model likes that token more.'),
      fig(0, '5.1', 'Raw scores', 'One logit per token. Some are negative, and the list adds up to nothing meaningful.'),
      prose('Scores are hard to use. Is 3.1 a lot? What does −2.0 mean?',
        'We want <b>chances</b> instead: numbers that are never negative and add up to 100%. Then “mat has a 54% chance” has a clear meaning, and we can pick a word by rolling dice weighted by those chances.'),
      box('def', 'Definition', P(`A ${T('probability distribution')} is a list of chances that are never negative and add up to 1 (100%).`)),
      box('key', 'Key idea', P('<b>Softmax</b> turns scores into chances. A separate step then picks one word from those chances.'))]],
    ['5.2', 'From scores to chances', [
      prose('Softmax has two steps. Step one makes every score positive. Step two divides by the total so the results add up to 1.',
        'You can do every step with a calculator. The symbol Σ just means “add them all up”.'),
      box('def', 'Definition', P(`${T('Softmax')}: apply <code>exp</code> to each score, then divide by the total.`), eq('p<sub>i</sub> = exp(z<sub>i</sub>) / Σ<sub>j</sub> exp(z<sub>j</sub>)')),
      prose('<code>exp(z)</code> means <i>e</i> raised to the power <i>z</i>, where <i>e</i> is about 2.7. It has three useful properties. It is always positive. A bigger score gives a bigger result. And each extra point of score multiplies the result by about 2.7.'),
      fig(1, '5.2', 'Step one: exp', 'Every result is positive. A lead of 0.9 in score becomes about 2.5 times.'),
      fig(2, '5.3', 'Step two: divide by the total', 'The whole bar is the total (100%). Each token’s slice is its share.'),
      box('example', 'Worked example 5.1  ·  Softmax by hand', P('Three tokens have logits <code>2.0</code>, <code>1.0</code> and <code>−1.0</code>. Find their probabilities.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Apply exp to each score.' }), h('li', { html: `Add the results: ${f(e3[0], 3)} + ${f(e3[1], 3)} + ${f(e3[2], 3)} = <b>${f(s3, 3)}</b>.` }), h('li', { html: 'Divide each result by the total.' })]),
        tab(['z', 'exp(z)', 'p'], [...z3.map((z, i) => ({ cells: [f(z, 1), f(e3[i], 3), pc(p3[i], 1)], hl: i === 0 ? [2] : [] })), { cls: 'sum', cells: ['Total', f(s3, 3), pc(p3.reduce((a, b) => a + b), 0)] }]),
        P(`<b>Answer:</b> ${pc(p3[0], 1)}, ${pc(p3[1], 1)} and ${pc(p3[2], 1)}. The negative score still gives a positive result (${f(e3[2], 3)}). A lead of 1 point multiplies the result by <i>e</i>, about 2.72.`)),
      box('check', 'Check your understanding',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>Logits are 5.0 and 5.0. What are the probabilities?' }), ans('50% each. Softmax depends only on the gaps between scores, and here the gap is zero.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>Can a token ever get a chance of exactly 0?' }), ans('Not in the maths. Every exp is positive, so every token keeps a small chance. (A computer may round a tiny chance to 0.)')))]],
    ['5.3', 'Temperature', [
      prose('Plain softmax gives the model’s own preferences. Sometimes we want it more careful, sometimes more adventurous. The control is <b>temperature</b>, T: divide every score by T before applying softmax.'),
      box('def', 'Definition', P(`${T('Temperature')} (T) is a positive number. Divide every score by T, then apply softmax.`), eq('p<sub>i</sub> = exp(z<sub>i</sub> / T) / Σ<sub>j</sub> exp(z<sub>j</sub> / T)'), P('T = 1: no change. T below 1: the favorite pulls further ahead (more predictable). T above 1: chances even out (more surprising).')),
      tempWidget(),
      fig(3, '5.4', 'Three temperatures', 'The eight word scores at T = 0.5, 1 and 2. Lower temperature piles chance onto the leader; higher spreads it out.'),
      box('analogy', 'Analogy', P('A cold model is careful: it keeps choosing its favorite word. A hot model is adventurous: it tries more words.')),
      box('example', 'Worked example 5.2  ·  Effect of temperature', P('Same three scores. Just divide by T first. Use the three logits <code>2.0, 1.0, −1.0</code> again. Find the probabilities at T = 0.5 and T = 2.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Divide each score by T. At T = 0.5 the scores become 4, 2, −2.' }), h('li', { html: 'At T = 2 they become 1.0, 0.5, −0.5.' }), h('li', { html: 'Apply softmax to each new list.' })]),
        tab(['Token', 'T = 0.5', 'T = 1', 'T = 2'], z3.map((z, i) => ({ cells: ['Token ' + 'ABC'[i], pc(tp(.5)[i], 1), pc(tp(1)[i], 1), pc(tp(2)[i], 1)], hl: [] }))),
        P(`<b>Answer:</b> the leader gets ${pc(tp(.5)[0], 1)} at T = 0.5, ${pc(tp(1)[0], 1)} at T = 1 and ${pc(tp(2)[0], 1)} at T = 2.`)),
      box('key', 'Key idea', P('Very low T: the model always picks its top token. Very high T: every token is almost equally likely.'))]],
    ['5.4', 'Picking one token', [
      prose('Chapter 1 gave two ways to pick: greedy takes the top token, and sampling spins the weighted wheel. Here is the wheel in action.'),
      fig(4, '5.5', 'Sampling with a random number', 'The chances are laid end to end from 0 to 1. A random number picks the slice it lands in.'),
      box('example', 'Worked example 5.3  ·  Drawing a token', P(`Same wheel as Chapter 1. Using the chances in Figure 5.5, a random number between 0 and 1 is drawn: <b>${u}</b>. Which token is chosen?`),
        h('ol', { class: 'steps' }, [h('li', { html: 'Line the chances up end to end between 0 and 1. Each token owns a slice.' }), h('li', { html: `Find the slice that contains ${u}.` })]),
        tab(['Token', 'p', 'Slice'], CAND.slice(0, 4).map(([n], i) => ({ cells: [n, f(PR[i], 3), `${f(bounds[i][0], 3)} to ${f(bounds[i][1], 3)}`], hl: i === hit ? [1, 2] : [] }))),
        P(`<b>Answer:</b> ${u} lies in the slice ${f(bounds[hit][0], 3)} to ${f(bounds[hit][1], 3)}, so the token is <b>${CAND[hit][0]}</b>. (The table shows the first four of eight tokens.) A different random number, such as 0.66, would have given <i>floor</i>.`)),
      box('note', 'Which one to use', P('Greedy is predictable but can repeat itself. Sampling adds variety. Use greedy when there is one right answer, and sampling when you want ideas.'))]],
    ['5.5', 'Trimming the tail', [
      prose('A real model chooses among tens of thousands of tokens. Most are nonsense here, but their tiny chances add up to a few percent. So now and then, sampling picks a word that ruins the sentence. The fix: drop the unlikely words before sampling.'),
      box('def', 'Definition', P(`${T('Top-p')} keeps the likeliest tokens until their chances add up to p (say 90%). Then it rescales the survivors so they add to 100% and samples as before.`), P('<b>Top-k</b> is a simpler cousin: it keeps a fixed number, k, of tokens.')),
      fig(5, '5.6', 'Keeping 90 percent', 'Tokens sorted by chance, with running totals. The cut falls where the total first reaches 90%. The dashed tokens are removed.'),
      box('example', 'Worked example 5.4  ·  Top-p with p = 0.9', P('No new maths: sort, add, divide. Apply top-p with p = 0.9 to the eight chances, then rescale.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Sort by chance (they already are) and keep a running total.' }), h('li', { html: 'Keep tokens until the running total first reaches 0.9.' }), h('li', { html: `Divide each kept chance by the kept total (${pc(ks, 1)}) so they add to 100%.` })]),
        tab(['Token', 'p', 'Running total', 'Kept', 'Rescaled'], CAND.map(([n], i) => ({ cells: [n, f(PR[i], 3), f(cumP[i], 3), i < keep ? 'yes' : 'no', i < keep ? pc(PR[i] / ks, 1) : '0%'], hl: i < keep ? [3] : [] }))),
        P(`<b>Answer:</b> four tokens survive (mat, floor, sofa, rug), holding ${pc(ks, 1)} of the original chance. After rescaling, <i>mat</i> has ${pc(kept[0] / ks, 1)}. (Rounded, so the last column adds to 100.1%.)`)),
      box('analogy', 'Analogy', P('A casting call. You skip the unlikely actors and invite a shortlist. You still choose among them with some luck, but nobody wildly unsuitable gets the part.'))]],
    ['5.6', 'Chapter summary and practice', [
      prose('Rules of thumb for choosing settings:'),
      tab(['Setting', 'Behavior', 'Typical use'], [
        { cells: ['Greedy', 'Always the top token', 'Pulling out facts, sorting into categories'] }, { cells: ['T = 0.2 to 0.5', 'Mostly the leader, a little variation', 'Code, facts, summaries'] }, { cells: ['T near 1', 'The distribution as trained', 'Conversation'] }, { cells: ['T above 1', 'Flatter choices, more surprises', 'Brainstorming, fiction'] }, { cells: ['Top-p 0.9 to 0.95', 'Drops very unlikely words', 'Use with T near 1'] }]),
      box('key', 'Chapter in one line', P('Softmax turns scores into chances. Temperature makes them sharper or flatter. Then top-p trims the tail and sampling picks one token.')),
      prose('Try these without a calculator first. The answers are one click away.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>Logits are 1.0 and 0.0. Find the probabilities.' }), ans('exp(1) = 2.718 and exp(0) = 1. They add to 3.718, so 73.1% and 26.9%.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>For the same logits, what are the probabilities at T = 2?' }), ans('The scores become 0.5 and 0. exp(0.5) = 1.649 and exp(0) = 1, which add to 2.649. So 62.2% and 37.8%, flatter than at T = 1.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span>You need a model to pull a date out of an email. Which setting would you choose?' }), ans('Greedy or a very low temperature. There is one right answer, so variety only adds risk.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span>Why does top-p adapt better than top-k when the model is very sure?' }), ans('If one token holds 98%, top-p with p = 0.9 keeps just that token. Top-k with k = 40 would keep 40 tokens and let 39 unlikely ones back in.')))]]
  ];

  Book.render({ n: 5, secs, crumb: 'Chapter 5  ·  Softmax and decoding', kicker: 'Chapter 5  ·  The machine', title: 'Softmax and decoding',
    sub: 'How raw scores become chances, how temperature reshapes them, and how one token is finally chosen.',
    meta: '<span><b>6</b> sections</span><span><b>4</b> worked examples</span><span><b>6</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

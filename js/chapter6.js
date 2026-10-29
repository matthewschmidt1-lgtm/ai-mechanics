/* Chapter 6: Scaling laws. */
(function () {
  'use strict';
  const { h, f, pc, P, prose, box, eq, T, ans, fig: fig0 } = Book;
  const ST6 = window.__STAGES6, fig = (i, n, t, c) => fig0(i, n, t, c, ST6);
  const { FLOOR, A, ALPHA, loss } = window.__SCALE;
  const tab = (head, rows) => h('table', { class: 'calc' }, h('tr', {}, head.map(t => h('th', {}, t))), rows.map(r => h('tr', { class: r.cls || '' }, r.cells.map((c, i) => h('td', { class: (r.hl || []).includes(i) ? 'hl' : '' }, c)))));
  const sci = (v) => { const e = Math.floor(Math.log10(v)); return `${(v / Math.pow(10, e)).toFixed(2)} × 10^${e}`; };
  const big = (n) => Math.round(n).toLocaleString('en-US');
  const ns = [1, 10, 100], dbl = [10, 20, 40, 80];

  /* interactive: the scaling playground */
  function playground() {
    const out = h('div', { class: 'wsum', 'aria-live': 'polite' }), lv = h('b', {}, '10'), bar = h('i', { style: { display: 'block', height: '100%', background: 'var(--brand)', transition: 'width .25s' } }), row = (a, b) => h('div', { class: 'wrow wide', style: { gridTemplateColumns: '150px 1fr' } }, h('b', {}, a), b);
    const lossEl = h('span', { class: 'mono' }), gapEl = h('span', { class: 'mono' }), nextEl = h('span', { class: 'mono' });
    const upd = (n) => { lv.textContent = Number.isInteger(n) ? n : n.toFixed(1); lossEl.textContent = f(loss(n), 3); gapEl.textContent = f(loss(n) - FLOOR, 3); const save = loss(n) - loss(2 * n); nextEl.textContent = f(save, 3);
      bar.style.width = (loss(n) - FLOOR) / (loss(0.5) - FLOOR) * 100 + '%'; out.textContent = save < .10 ? 'Doubling the size now buys very little.' : save < .20 ? 'Each doubling still helps, but less than before.' : 'Early on, each doubling buys a lot.'; };
    const inp = h('input', { type: 'range', min: 0.5, max: 100, step: .5, value: 10, 'aria-label': 'Model size in billions of parameters', oninput: () => upd(+inp.value), style: { width: '100%', accentColor: 'var(--brand)' } });
    const w = h('div', { class: 'widget' }, h('div', { class: 'wh' }, 'Try it  ·  Scaling playground'), h('div', { class: 'wb' },
      h('p', { style: { margin: '0 0 .8rem', fontFamily: 'var(--sans)', fontSize: '.95rem', color: 'var(--muted)' } }, 'Drag the slider to change the model size. The numbers are invented: floor 1.0, a = 1.5, α = 0.3.'),
      h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1rem' } }, h('span', { class: 'mono', style: { whiteSpace: 'nowrap' } }, 'Size'), inp, h('span', { class: 'mono', style: { minWidth: '5ch' } }, lv, 'B')),
      row('Predicted loss', lossEl), row('Gap above floor', gapEl), row('Saved by doubling the size', nextEl),
      h('p', { style: { margin: '.6rem 0 .2rem', fontFamily: 'var(--sans)', fontSize: '.85rem', color: 'var(--muted)' } }, 'Bar: how much gap above the floor is left. A full bar is the gap at 0.5B.'),
      h('div', { class: 'bar', style: { margin: '.4rem 0 .6rem', height: '14px', borderRadius: '7px', background: 'var(--panel2)', overflow: 'hidden' } }, bar), out));
    upd(10); return w;
  }

  const secs = [
    ['6.1', 'A forecast before the spending', [
      prose('Training a large model can cost millions of dollars. No one wants to guess how well it will turn out. Scaling laws let researchers forecast it.',
        'The method is simple. Train several small models and measure the loss of each. Draw the curve, then extend it to estimate a much larger model.'),
      box('def', 'Definition', P(`A ${T('scaling law')} is a rule, found by measurement, that predicts a model’s loss from the resources spent on it, such as its size. Loss is the number from Chapter 4. Lower is better.`)),
      box('analogy', 'Analogy', P('Time a runner over short races to guess a marathon time. It works until tiredness changes the pattern.')),
      box('key', 'Key idea', P('Within the sizes tested, loss falls with size in a smooth, predictable way, so you can forecast before you spend.')),
      prose('All numbers in the figures are invented, to show the shape of the curve. The calculations use a calculator with a power button (<code>y^x</code>).')]],
    ['6.2', 'The shape of the curve', [
      prose('Plot loss against model size and you get a curve. It falls fast at first, then more slowly.',
        'It never reaches zero, because language is partly unpredictable. It flattens toward a floor.',
        'For now, assume the model always gets enough training data.'),
      fig(0, '6.1', 'Loss against model size', 'Three sizes are marked. The dashed line is the floor that the curve approaches but never crosses. Invented numbers.'),
      box('def', 'Definition', P(`A ${T('power law')} is a curve in which every doubling of size shrinks the gap above the floor by the same fraction. Scaling laws for language models often take this form:`), eq('loss = floor + a / N^α'), P('N is the model’s size in billions of parameters. Read it as: floor plus a divided by N to the power α. (α is the Greek letter alpha, a fitted number. Here it is 0.3.) The floor, a and α are fitted to measurements, and the values here are invented.')),
      box('example', 'Worked example 6.1  ·  Predicting three sizes', P(`Use floor = ${FLOOR}, a = ${A} and α = ${ALPHA}. Predict the loss for models of 1, 10 and 100 billion parameters. A calculator helps.`),
        h('ol', { class: 'steps' }, [h('li', { html: `Compute N^${ALPHA} with the power button.` }), h('li', { html: `Divide ${A} by that result.` }), h('li', { html: `Add the floor, ${FLOOR}.` })]),
        tab(['N (billions)', `N^${ALPHA}`, `${A} ÷ N^${ALPHA}`, 'Loss'], ns.map(n => ({ cells: [String(n), f(Math.pow(n, ALPHA), 3), f(A / Math.pow(n, ALPHA), 3), f(loss(n), 2)] }))),
        P(`<b>Answer:</b> ${f(loss(1), 2)}, ${f(loss(10), 2)} and ${f(loss(100), 2)}. Ten times the size cut the loss by ${f(loss(1) - loss(10), 2)}, and the next ten times cut it by only ${f(loss(10) - loss(100), 2)}.`)),
      box('key', 'Key idea', P('Loss is a floor plus a gap, and the gap shrinks as the model grows.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> What happens to the loss as the model becomes enormous?' }), ans('It gets closer and closer to the floor, 1.0 here, but never goes below it.')))]],
    ['6.3', 'Diminishing returns', [
      prose(`Look at the gap above the floor. Each time you double the size, the gap shrinks to about ${f(Math.pow(2, -ALPHA), 2)} of what it was.`,
        `So each doubling removes only about ${Math.round((1 - Math.pow(2, -ALPHA)) * 100)}% of what is left. (Behind this is 2^−${ALPHA} = 1 ÷ 1.23 ≈ ${f(Math.pow(2, -ALPHA), 2)}. You can skip the algebra.)`),
      fig(1, '6.2', 'A straight line on a log-log plot', 'Both axes use a log scale. Along the bottom, each step is ten times larger. Up the side, each step is half as large. Invented numbers.'),
      box('analogy', 'Analogy', P('Studying for an exam. The first hour teaches a lot. The tenth hour teaches much less.')),
      box('example', 'Worked example 6.2  ·  Three doublings', P('This is only subtraction. Start at 10 billion parameters and double the size three times. How much does each doubling save?'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Compute each loss as in Worked example 6.1: N^0.3, divide, add the floor.' }), h('li', { html: 'Subtract each loss from the one before.' })]),
        tab(['Size', 'Loss', 'Saved by this doubling'], dbl.map((n, i) => ({ cells: [n + 'B', f(loss(n), 3), i ? f(loss(dbl[i - 1]) - loss(n), 3) : '–'] }))),
        P(`<b>Answer:</b> the savings are ${f(loss(10) - loss(20), 3)}, ${f(loss(20) - loss(40), 3)} and ${f(loss(40) - loss(80), 3)}. Each doubling costs twice as much as the last, and saves less.`)),
      playground(),
      box('key', 'Key idea', P('Each doubling adds twice as many parameters as the last, and buys a smaller gain.'))]],
    ['6.4', 'Spending a budget', [
      prose('Size is not the only ingredient. A model also needs training data and compute. Compute is the total arithmetic done during training.'),
      box('def', 'Definition', P(`<b>D</b> is the number of ${T('tokens')} the model reads in training. A token is a small piece of text. Compute, <b>C</b>, is the total arithmetic done. A rule of thumb links the three (≈ means “about equal”):`), eq('compute ≈ 6 × N × D')),
      fig(2, '6.3', 'Size, data and compute', 'The three ingredients are tied together by one rule. Spend more of one and the budget forces a choice about the others.'),
      prose('In 2022, a study called Chinchilla found that, for a fixed compute budget, the best results came from growing the model and the data together. The rule of thumb is about 20 tokens per parameter.'),
      box('example', 'Worked example 6.3  ·  Budgeting a 70-billion-parameter model', P('A model has N = 70 billion parameters. This is only multiplying; a calculator helps. Find the tokens it should read and the compute needed.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Tokens: D ≈ 20 × N = 20 × 70 billion.' }), h('li', { html: 'Compute: 6 × N × D. Here we write N as 70 (billions) and D as 1.4 (trillions). Multiply the plain numbers: 6 × 70 × 1.4 = 588. The billions and trillions supply 10^9 × 10^12 = 10^21, so the answer is 588 × 10^21. (10^21 means a 1 followed by 21 zeros.)' })]),
        tab(['Quantity', 'Value'], [{ cells: ['N', '70 billion'] }, { cells: ['D = 20 × N', `${f(20 * 70 / 1000, 1)} trillion tokens`] }, { cells: ['C = 6 × N × D', `${sci(6 * 70e9 * 1.4e12)} arithmetic operations`] }]),
        P(`<b>Answer:</b> about 1.4 trillion tokens and 588 × 10^21 operations, written ${sci(6 * 70e9 * 1.4e12)}. Chinchilla itself was a 70-billion-parameter model trained on about 1.4 trillion tokens.`)),
      box('note', 'A rule of thumb, not a law', P('Many recent models read far more than 20 tokens per parameter. For example, Llama 3’s 8-billion-parameter model read about 15 trillion tokens. A smaller model trained longer is cheaper to run afterward.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> A 10-billion-parameter model follows the rule of thumb. How many tokens should it read?' }), ans('20 × 10 billion = 200 billion tokens.')))]],
    ['6.5', 'What scaling laws do not tell you', [
      prose('A scaling law is a forecast, and forecasts have limits.',
        'It predicts <b>loss</b>, not intelligence. A lower loss means better next-word prediction, which usually helps, but it is not the same as general ability.'),
      prose('It is <b>empirical</b>. It describes what was measured, not a law of nature. Inside the tested range it fits well. Outside it, the curve may bend.',
        'It also depends on the setup: the data, the architecture and how the model is trained. Change the setup and the numbers change.'),
      box('key', 'Key idea', P('Use a scaling law as a forecast, not a promise.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> A scaling law fitted on models up to 10 billion parameters is used to predict a 1-trillion-parameter model. Why be cautious?' }), ans('The prediction is 100 times beyond the measured range. The curve might bend, or the floor might be different.')))]],
    ['6.6', 'Chapter summary and practice', [
      tab(['Word', 'Plain meaning'], [{ cells: ['Scaling law', 'A measured rule that predicts loss from resources'] }, { cells: ['Power law', 'Each doubling shrinks the gap by the same fraction'] }, { cells: ['Floor', 'The loss the curve approaches but never crosses'] }, { cells: ['Tokens (D)', 'How much text the model reads in training'] }, { cells: ['Compute (C)', 'Total arithmetic in training, about 6 × N × D'] }]),
      box('key', 'Chapter in one line', P('Loss falls predictably as size grows, with diminishing returns, so researchers forecast the payoff and balance size, data and compute.')),
      prose('Try these before you open the answers.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> Using floor = 1.0, a = 1.5 and α = 0.3, predict the loss at N = 4 billion.' }), ans(`4^0.3 = ${f(Math.pow(4, .3), 3)}, so 1.5 ÷ ${f(Math.pow(4, .3), 3)} = ${f(1.5 / Math.pow(4, .3), 3)}. Adding the floor gives ${f(loss(4), 2)}.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span> By what factor does one doubling of N multiply the gap above the floor?' }), ans(`2^−0.3 = 1 ÷ 2^0.3 = 1 ÷ ${f(Math.pow(2, .3), 3)}, about ${f(Math.pow(2, -.3), 2)}.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span> A 30-billion-parameter model follows the rule of thumb. How many tokens, and how much compute?' }), ans(`Tokens: 20 × 30 billion = 600 billion. Compute: 6 × 30 billion × 600 billion = ${sci(6 * 30e9 * 600e9)} operations.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span> Why can loss never reach zero in this scaling law?' }), ans('The curve approaches the floor. The gap shrinks toward zero, but the floor stays.')))]]
  ];

  Book.render({ n: 6, secs, crumb: 'Chapter 6  ·  Scaling laws', kicker: 'Chapter 6  ·  Scale', title: 'Scaling laws',
    sub: 'How researchers predict a model’s quality before they build it, and why each extra bit of size buys less.',
    meta: '<span><b>6</b> sections</span><span><b>3</b> worked examples</span><span><b>3</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

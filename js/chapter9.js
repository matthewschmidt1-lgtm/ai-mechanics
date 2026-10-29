/* Chapter 9: Mixture of experts and routed scaling. */
(function () {
  'use strict';
  const { h, f, P, prose, box, eq, T, ans, fig: fig0 } = Book;
  const ST7 = window.__STAGES7, fig = (i, n, t, c) => fig0(i, n, t, c, ST7);
  const { NS, ES, LOSS } = window.__MOE;
  const tab = (head, rows) => h('table', { class: 'calc' }, h('tr', {}, head.map(t => h('th', {}, t))), rows.map(r => h('tr', { class: r.cls || '' }, r.cells.map((c, i) => h('td', { class: (r.hl || []).includes(i) ? 'hl' : '' }, c)))));
  const shared = 1, expert = 5, nE = 8, top = 2, total = shared + nE * expert, active = shared + top * expert;
  /* equivalent dense size by interpolating between the dense losses in log size */
  const dense = NS.map((n, i) => [n, LOSS[i][0]]);
  const effective = (v) => { if (v >= dense[0][1]) return dense[0][0]; for (let i = 0; i < dense.length - 1; i++) { const [n0, l0] = dense[i], [n1, l1] = dense[i + 1]; if (v <= l0 && v >= l1) return Math.exp(Math.log(n0) + (l0 - v) / (l0 - l1) * (Math.log(n1) - Math.log(n0))); } return null; };

  /* interactive: pick an active size and an expert count */
  function picker() {
    let ni = 0, ej = 2; const out = h('div', { class: 'wsum', 'aria-live': 'polite' }), cells = [];
    const seg = (name, vals, fmtv, get, set) => { const btns = vals.map((v, i) => h('button', { class: 'replay', style: { marginRight: '8px' }, onclick: () => { set(i); upd(); } }, fmtv(v)));
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '.8rem', flexWrap: 'wrap' } }, h('span', { class: 'mono', style: { minWidth: '9ch' } }, name), h('div', {}, btns)); };
    const sN = seg('Active size', NS, v => v + 'B', () => ni, i => ni = i), sE = seg('Experts', ES, v => String(v), () => ej, i => ej = i);
    const lossEl = h('span', { class: 'mono' }), gainEl = h('span', { class: 'mono' }), effEl = h('span', { class: 'mono' });
    const row = (a, b) => h('div', { class: 'wrow wide', style: { gridTemplateColumns: '170px 1fr' } }, h('b', {}, a), b);
    const upd = () => { [...sN.querySelectorAll('button')].forEach((b, i) => b.style.borderColor = i === ni ? 'var(--brand)' : ''); [...sE.querySelectorAll('button')].forEach((b, i) => b.style.borderColor = i === ej ? 'var(--brand)' : '');
      const v = LOSS[ni][ej]; lossEl.textContent = f(v, 2); gainEl.textContent = f(LOSS[ni][0] - v, 2); const e = effective(v); effEl.textContent = e == null ? 'more than 16B (off the end of the table)' : `about ${f(e, 1)}B`;
      out.textContent = ej === 0 ? 'This is a plain dense model.' : `Same arithmetic per token as the dense ${NS[ni]}B model, but it matches a dense model of ${e == null ? 'more than 16B' : 'about ' + f(e, 1) + 'B'}.`; };
    const w = h('div', { class: 'widget' }, h('div', { class: 'wh' }, 'Try it  ·  Two knobs'), h('div', { class: 'wb' }, h('p', { style: { margin: '0 0 .8rem', fontFamily: 'var(--sans)', fontSize: '.95rem', color: 'var(--muted)' } }, 'Pick an active size and a number of experts. The numbers are invented.'), sN, sE, row('Loss (lower is better)', lossEl), row('Saved by experts', gainEl), row('Equivalent dense size', effEl), out));
    upd(); return w;
  }

  const secs = [
    ['9.1', 'More capacity without more work', [
      prose('A dense model uses all of its parameters for every token. Make it bigger and every token costs more.',
        'A mixture of experts tries something different. Store a lot of knowledge, but use only a part of it for each token.'),
      box('def', 'Definition', P(`A ${T('mixture of experts')} (MoE) model splits part of its network into many separate pieces called experts. For each token, only a few experts do any work. So the model can hold far more knowledge than it uses on any one token.`)),
      box('analogy', 'Analogy', P('A help desk with eight specialists. A receptionist sends each caller to the two best suited. Nobody handles every call. Which specialist suits which call is learned, not planned.'))]],
    ['9.2', 'Router and experts', [
      prose('In Chapter 3, each block had one feed-forward step. In an MoE block, that step is replaced by many parallel copies. Each copy is an expert.',
        'A small network called the router decides which experts see each token.'),
      box('def', 'Definition', P(`The ${T('router')} scores the experts for each token and picks the best few. ${T('Total parameters')} are all the parameters stored in the model. ${T('Active parameters')} are the ones used to process one token.`)),
      fig(0, '9.1', 'Routing one token', 'The router sends the token <i>bank</i> to two of eight experts. Which experts it picks is learned during training.'),
      box('example', 'Worked example 9.1  ·  Total versus active', P(`A toy MoE model has ${shared}B shared parameters plus ${nE} experts of ${expert}B each. (B means billion. Shared parameters are used for every token.) The router picks ${top} experts per token. Find the total and the active parameters. This is only multiplying and adding.`),
        h('ol', { class: 'steps' }, [h('li', { html: `Total: ${shared} + ${nE} × ${expert} = <b>${total}B</b>.` }), h('li', { html: `Active: ${shared} + ${top} × ${expert} = <b>${active}B</b>.` })]),
        tab(['Kind', 'Calculation', 'Parameters'], [{ cells: ['Total', `${shared} + ${nE} × ${expert}`, total + 'B'] }, { cells: ['Active', `${shared} + ${top} × ${expert}`, active + 'B'], hl: [2] }]),
        P(`<b>Answer:</b> ${total}B total and ${active}B active. The model stores ${f(total / active, 1)} times more than it uses on each token.`)),
      prose('Experts are not tidy topics like “medicine” or “law”. Training decides what each one learns.'),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>Which count sets how much arithmetic one token needs: total or active parameters?' }), ans('Active parameters. Only the chosen experts and the shared parts do any work for that token.')))]],
    ['9.3', 'Two knobs', [
      prose('For a dense model there is one knob: size. A routed model has two. <b>Active size</b> N roughly sets the arithmetic per token. <b>Expert count</b> E sets how much extra capacity is stored.',
        'A 2022 paper, <i>Unified Scaling Laws for Routed Language Models</i>, measured how loss depends on both knobs. Its formula adds up three effects: size, experts, and how the two affect each other.',
        'It tested models with hundreds of experts and hundreds of billions of total parameters. The table below is made up.'),
      fig(1, '9.2', 'Loss at each size and expert count', 'Each cell is a loss. Darker green is better. These numbers are invented to show the pattern, not results from the paper.'),
      box('example', 'Worked example 9.2  ·  Reading the table', P('This is only subtraction. Use Figure 9.2. Find how much going from 1 expert to 64 experts saves at each active size.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'For each row, read the loss with 1 expert and with 64 experts.' }), h('li', { html: 'Subtract.' })]),
        tab(['Active size', '1 expert', '64 experts', 'Saved'], NS.map((n, i) => ({ cells: [n + 'B', f(LOSS[i][0], 2), f(LOSS[i][2], 2), f(LOSS[i][0] - LOSS[i][2], 2)], hl: [3] }))),
        P(`<b>Answer:</b> ${f(LOSS[0][0] - LOSS[0][2], 2)}, ${f(LOSS[1][0] - LOSS[1][2], 2)} and ${f(LOSS[2][0] - LOSS[2][2], 2)}. The benefit of experts shrinks as the active size grows. The formula captures this by letting the benefit of experts depend on size.`)),
      picker(),
      box('key', 'Key idea', P('Experts help, but how much they help depends on how big the model already is.'))]],
    ['9.4', 'Effective parameters', [
      prose('How do you compare a routed model with a dense one? The paper translates its measured loss into the size of the dense model that would score the same.'),
      box('def', 'Definition', P(`The ${T('effective parameter count')} of a routed model is the size of the dense model with the same loss. It is a comparison, not a literal count. The picker above makes a rough estimate by reading between the table’s rows. The paper uses a formula.`)),
      box('example', 'Worked example 9.3  ·  Finding the match', P('No formula needed: just compare three numbers. Use the invented table. The routed model with 1B active parameters and 64 experts has loss 2.18. Which dense model scores about the same?'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Read the dense losses (1 expert): 1B is 2.50, 4B is 2.20, 16B is 1.95.' }), h('li', { html: '2.18 is lower than 2.20 (the 4B model) but higher than 1.95 (the 16B model). So the match lies between 4B and 16B, just past 4B.' })]),
        P(`<b>Answer:</b> 2.18 is just below the dense 4B model’s 2.20. The routed model acts like a dense model of about 4.5B (a rough estimate, read between the table’s rows), while doing the arithmetic of a 1B model.`)),
      box('note', 'A caution', P('Effective parameters describe loss, not every ability. They are not a claim that the two models behave the same on every task.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>Is the effective parameter count the number of parameters stored?' }), ans('No. It is a performance comparison: the size of the dense model that matches the routed model’s loss.')))]],
    ['9.5', 'Cheaper to compute, not to store', [
      prose('Experts save arithmetic. They do not save memory. Every expert must sit ready in memory, because the router may choose any of them for the next token.'),
      fig(2, '9.3', 'Stored versus used', 'At 2 bytes per parameter, 41B parameters take 82 GB to store. One token only uses 22 GB worth of them. Invented model.'),
      box('example', 'Worked example 9.4  ·  Memory for the toy model', P(`This is one multiplication. Each parameter is stored in 2 bytes. How much memory does the ${total}B toy model need, and how much does one token use? A billion parameters at 2 bytes is 2 GB (GB means gigabyte).`),
        h('ol', { class: 'steps' }, [h('li', { html: `Stored: ${total} × 2 GB = <b>${total * 2} GB</b>.` }), h('li', { html: `Used for one token: ${active} × 2 GB = <b>${active * 2} GB</b>.` })]),
        P(`<b>Answer:</b> ${total * 2} GB must be held in memory, but one token uses only ${active * 2} GB worth of it. This counts only the model’s parameters. Running it needs extra memory too.`)),
      box('analogy', 'Analogy', P('A kitchen with 100 chefs. Each order needs only two, but the whole kitchen must stay staffed and equipped. One lone customer wastes most of it. A crowd of customers shares the cost.')),
      prose('Real services handle many users at once. They group many tokens into one batch. With a big batch, every expert gets some tokens, so loading all of them is worth it.'),
      box('key', 'Key idea', P('A mixture of experts cuts the arithmetic per token. It does not cut the memory to hold the model.'))]],
    ['9.6', 'What the paper does not show', [
      prose('A strong result can be stretched too far. The paper does not show that more experts always improve every kind of intelligence. It measured loss on text the model had not trained on.',
        'It tested three routing methods. The same kind of formula fitted all three, but each method got different constants. It did not test every possible design.'),
      prose('It does not say total parameters are irrelevant. They set memory and serving costs.',
        'It trained every model on the same amount of data, about 130 billion tokens according to the course source notes. The best amount of data for a given budget was left open. And it is a 2022 paper, so its numbers are not automatic predictions for today’s models.'),
      box('key', 'Key idea', P('Treat the result as a method for forecasting, not as a final answer for any model.'))]],
    ['9.7', 'Chapter summary and practice', [
      tab(['Word', 'Plain meaning'], [{ cells: ['Mixture of experts', 'Many experts, only a few used per token'] }, { cells: ['Router', 'Picks which experts see each token'] }, { cells: ['Total parameters', 'Everything stored in the model'] }, { cells: ['Active parameters', 'What one token actually uses'] }, { cells: ['Effective parameters', 'Size of the dense model with the same loss'] }]),
      box('key', 'Chapter in one line', P('A routed model stores a lot and computes with a little, and a two-variable scaling law predicts how much the extra experts help.')),
      prose('Try these before you open the answers.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>A model has 2B shared parameters and 16 experts of 3B each. The router picks 2. Find the total and active parameters.' }), ans(`Total: 2 + 16 × 3 = 50B. Active: 2 + 2 × 3 = 8B.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>At 2 bytes per parameter, how much memory does a 50B model need?' }), ans('50 × 2 GB = 100 GB.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span>In Figure 9.2, which saves more by going from 1 to 64 experts: the 4B row or the 16B row?' }), ans(`The 4B row, ${f(LOSS[1][0] - LOSS[1][2], 2)} against ${f(LOSS[2][0] - LOSS[2][2], 2)}.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span>Why does a model with many experts still need a lot of memory?' }), ans('The router may pick any expert for the next token, so all of them must be ready.')))]]
  ];

  Book.render({ n: 9, secs, crumb: 'Chapter 9  ·  Mixture of experts', kicker: 'Chapter 9  ·  Going further', title: 'Mixture of experts',
    sub: 'How a model can store far more than it uses, and what a scaling law with two knobs says about the trade.',
    meta: '<span><b>7</b> sections</span><span><b>4</b> worked examples</span><span><b>3</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

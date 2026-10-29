/* Chapter 4: Loss and gradient descent. */
(function () {
  'use strict';
  const { h, S, f, pc, P, prose, box, eq, T, ans, fig: fig0 } = Book;
  const ST3 = window.__STAGES3, fig = (i, n, t, c) => fig0(i, n, t, c, ST3);
  const tab = (head, rows) => h('table', { class: 'calc' }, h('tr', {}, head.map(t => h('th', {}, t))), rows.map(r => h('tr', { class: r.cls || '' }, r.cells.map((c, i) => h('td', { class: (r.hl || []).includes(i) ? 'hl' : '' }, c)))));
  const loss = (p) => -Math.log(p);
  /* the toy dial: loss = (w - 3)^2, slope = 2 (w - 3) */
  const L = (w) => (w - 3) ** 2, G = (w) => 2 * (w - 3);
  const run = (lr, n, w0 = 0) => { const r = [{ w: w0, g: G(w0), l: L(w0) }]; for (let k = 0; k < n; k++) { const p = r[r.length - 1], w = p.w - lr * p.g; r.push({ w, g: G(w), l: L(w) }); } return r; };
  const A = run(0.1, 4), B = run(1.1, 3);
  const ps = [0.5, 0.2, 0.8, 0.1], ls = ps.map(loss), avg = ls.reduce((a, b) => a + b) / ls.length;
  const fmt = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);

  /* interactive: gradient descent on the toy dial */
  function descentWidget() {
    const W = 600, H = 250, X = (w) => 30 + (w + 3) * 45, Y = (l) => 232 - Math.min(l, 36) * 5.8;
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, style: { width: '100%', display: 'block', background: 'var(--canvas)', borderRadius: '12px' }, role: 'img', 'aria-label': 'Loss curve with the current dial position' });
    let d = ''; for (let w = -3; w <= 9.001; w += .1) d += (d ? 'L' : 'M') + X(w).toFixed(1) + ' ' + Y(L(w)).toFixed(1);
    svg.append(S('line', { x1: 30, y1: 232, x2: 570, y2: 232, stroke: '#636366', 'stroke-width': 1.5 }), S('path', { d, fill: 'none', stroke: '#0a84ff', 'stroke-width': 3.5 }), S('circle', { cx: X(3), cy: Y(0), r: 6, fill: '#30d158' }), S('text', { x: X(3), y: 218, 'text-anchor': 'middle', fill: '#30d158', 'font-size': 13, 'font-family': 'var(--sans)' }, 'lowest loss'), S('text', { x: 570, y: 246, 'text-anchor': 'end', fill: '#a1a1a6', 'font-size': 13, 'font-family': 'var(--sans)' }, 'w'), S('text', { x: 36, y: 20, fill: '#a1a1a6', 'font-size': 13, 'font-family': 'var(--sans)' }, 'loss'));
    const trail = S('g'), ball = S('circle', { r: 9, fill: '#ffd60a' }); svg.append(trail, ball);
    let lr = 0.1, path = [0];
    const read = h('div', { class: 'wsum', 'aria-live': 'polite' }), lrv = h('b', {}, '0.10');
    const draw = () => {
      trail.replaceChildren(); path.forEach((w, i) => { if (i > 0) trail.append(S('line', { x1: X(Math.max(-3, Math.min(9, path[i - 1]))), y1: Y(L(path[i - 1])), x2: X(Math.max(-3, Math.min(9, w))), y2: Y(L(w)), stroke: '#ffd60a', 'stroke-width': 1.5, opacity: .6 })); trail.append(S('circle', { cx: X(Math.max(-3, Math.min(9, w))), cy: Y(L(w)), r: 3.5, fill: '#ffd60a', opacity: .8 })); });
      const w = path[path.length - 1]; ball.setAttribute('cx', X(Math.max(-3, Math.min(9, w)))); ball.setAttribute('cy', Y(L(w)));
      const msg = lr < .15 ? 'Safe but slow. Many steps are needed.' : lr < .5 ? 'A good size. It glides toward the bottom without crossing it.' : lr < .501 ? 'Just right here: one step lands on the bottom.' : lr < 1 ? 'Overshoots each time, then slowly settles.' : lr < 1.001 ? 'It bounces between two points and never settles.' : 'Too big. Each step lands farther away.';
      read.textContent = `Step ${path.length - 1}   w = ${fmt(w)}${Math.abs(w - 3) > 6 ? ' (off the chart)' : ''}   loss = ${fmt(L(w))}.  ${msg}`;
    };
    const step = (n = 1) => { for (let i = 0; i < n; i++) { const w = path[path.length - 1]; path.push(w - lr * G(w)); } draw(); };
    const reset = () => { path = [0]; draw(); };
    const inp = h('input', { type: 'range', min: .05, max: 1.2, step: .05, value: .1, 'aria-label': 'Learning rate', oninput: () => { lr = +inp.value; lrv.textContent = lr.toFixed(2); reset(); }, style: { width: '100%', accentColor: 'var(--brand)' } });
    const btn = (t, fn) => h('button', { class: 'replay', onclick: fn, style: { marginRight: '8px' } }, t);
    const body = h('div', { class: 'wb' }, h('p', { style: { margin: '0 0 .8rem', fontFamily: 'var(--sans)', fontSize: '.95rem', color: 'var(--muted)' } }, 'Choose a learning rate, then press Step. The yellow dot is the dial’s current setting. The green dot is the lowest loss.'),
      h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1rem' } }, h('span', { class: 'mono', style: { whiteSpace: 'nowrap' } }, 'Learning rate'), inp, h('span', { class: 'mono', style: { minWidth: '4ch' } }, lrv)),
      svg, h('div', { style: { margin: '.9rem 0 .3rem' } }, btn('Step', () => step(1)), btn('Run 10 steps', () => step(10)), btn('Reset', reset)), read);
    draw(); return h('div', { class: 'widget' }, h('div', { class: 'wh' }, 'Try it  ·  Gradient descent'), body);
  }

  const secs = [
    ['4.1', 'How a model learns', [
      prose('A new model knows nothing. Ask it to finish <i>The cat sat on the</i> and it gives every word about the same chance. Training fixes that.',
        'Here is the whole idea. Show the model real text with the next word hidden. Let it guess, then check the guess against the real word.',
        'Finally, adjust the model so the real word would have been a little more likely.'),
      fig(0, '4.1', 'Before and after training', 'The true word is <i>mat</i>. Training moves chance toward it. Only eight candidate words are shown; a real model spreads its chances over about 50,000. The untrained numbers are illustrative.'),
      prose('Do this billions of times on books, websites and code. The model’s chances slowly come to match real text.'),
      box('def', 'Definition', P(`${T('Training')} is repeating <i>guess, check, adjust</i> until the guesses are good.`)),
      box('note', 'In this chapter', P('Two questions: how do we measure a bad guess, and how do we adjust the model? You only need to add, subtract, multiply and divide, plus one button on a calculator.'))]],
    ['4.2', 'Measuring a mistake', [
      prose('To adjust the model, we need one number for how bad a guess was. If the true word is <i>mat</i>, a high chance for <i>mat</i> is a good guess. A low chance is a bad one.',
        'The number uses <code>ln</code>, the natural logarithm. It is a button on any calculator.'),
      box('def', 'Definition', P(`${T('Loss')} is that number. It is computed from <b>p</b>, the chance the model gave to the true word.`), eq('loss = −ln(p)')),
      prose('You only need the shape. When p is near 1, the loss is near 0. When p is near 0, the loss is large and grows fast.'),
      fig(1, '4.2', 'The loss curve', 'Loss against the chance given to the true word. The yellow dots are the four cases in Worked example 4.1.'),
      box('analogy', 'Analogy', P('A quiz that charges extra for confident wrong answers. Saying “I am sure it is X” and being wrong costs far more than shrugging.')),
      box('example', 'Worked example 4.1  ·  Computing the loss', P('Press <code>ln</code> on a calculator, then flip the sign. Four times. The true word is <i>mat</i>. Find the loss when the model gave <i>mat</i> a chance of 90%, 50%, 10% and 1%.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Write each chance as a decimal: 0.9, 0.5, 0.1, 0.01.' }), h('li', { html: 'Press <code>ln</code>, then flip the sign.' })]),
        tab(['Chance p', 'Loss = −ln(p)', 'Verdict'], [[.9, 'Good'], [.5, 'Fair'], [.1, 'Poor'], [.01, 'Awful']].map(([p, v]) => ({ cells: [pc(p, 0), f(loss(p), 2), v] }))),
        P(`<b>Answer:</b> ${f(loss(.9), 2)}, ${f(loss(.5), 2)}, ${f(loss(.1), 2)} and ${f(loss(.01), 2)}. Dropping from 10% to 1% adds 2.30 to the loss. Dropping from 50% to 10% adds only 1.61.`)),
      box('key', 'Key idea', P('Loss is low when the true word got a high chance, and very high when the model was confident and wrong.')),
      box('check', 'Check your understanding',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>The model gave the true word a chance of 1 (100%). What is the loss?' }), ans('Zero. −ln(1) = 0. A perfect guess costs nothing.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>Which is worse: giving the true word 1% or 10%?' }), ans(`1%. Its loss is ${f(loss(.01), 2)}, against ${f(loss(.1), 2)} for 10%.`)))]],
    ['4.3', 'One number for the whole model', [
      prose('One guess teaches a noisy lesson. So training averages the loss over many guesses. That average is one number for how well the model is doing.'),
      box('example', 'Worked example 4.2  ·  Average loss', P('A model makes four guesses and gives the true word these chances: 50%, 20%, 80% and 10%. What is the average loss?'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Find the loss for each guess.' }), h('li', { html: `Add them: ${ls.map(v => f(v, 3)).join(' + ')} = <b>${f(ls.reduce((a, b) => a + b), 3)}</b>.` }), h('li', { html: 'Divide by 4.' })]),
        tab(['Guess', 'Chance p', 'Loss'], [...ps.map((p, i) => ({ cells: [String(i + 1), pc(p, 0), f(ls[i], 3)] })), { cls: 'sum', cells: ['Average', '', f(avg, 3)] }]),
        P(`<b>Answer:</b> ${f(avg, 2)}. Lower is better.`)),
      prose('A useful benchmark: an untrained model with 50,000 tokens gives each one a chance of 1 in 50,000. Its loss is −ln(1/50,000), about <b>10.8</b>. Training pushes the average down from there.'),
      box('key', 'Key idea', P('Training has one goal: make the average loss as low as possible.'))]],
    ['4.4', 'Dials and slopes', [
      prose('Inside the model are billions of numbers called <b>parameters</b>. Picture them as dials. Chapters 2 and 3 showed where they live: the tables inside attention and the feed-forward step.',
        'Every setting of every dial changes the loss a little.',
        'We want settings where the loss is low. Start with just one dial, called <b>w</b>. Plot the loss for each setting of w and you get a curve with a valley.',
        'In this toy example the loss is (w − 3)², and its slope is 2(w − 3). It is not the −ln(p) loss. It is just a curve with one valley. You need no calculus: in a real model, the computer finds every slope.'),
      box('def', 'Definition', P(`A ${T('parameter')} is one adjustable number inside the model, also called a <b>weight</b>. All of the model’s knowledge lives in its parameters.`), P(`The ${T('gradient')} is the slope of the loss at the current setting. It says which way the loss rises, and how steeply.`)),
      fig(2, '4.3', 'Loss for one dial', 'At w = 0 the slope is −6, so the loss falls as w increases. The lowest loss is at w = 3.'),
      box('analogy', 'Analogy', P('A hiker in thick fog cannot see the valley. But the hiker can feel which way the ground slopes underfoot. Step downhill, feel again, step again.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>At w = 5 the slope is 2(5 − 3) = 4. Which way should we turn the dial?' }), ans('Down. A positive slope means the loss rises as w rises, so we lower w.')))]],
    ['4.5', 'Gradient descent', [
      prose('The rule is simple: step <b>against</b> the slope. How far to step depends on the slope and on a number we choose, the <b>learning rate</b>.'),
      box('def', 'Definition', P(`${T('Gradient descent')} repeats one update. The ${T('learning rate')} sets how big each step is.`), eq('new w = old w − learning rate × slope')),
      fig(3, '4.4', 'Walking downhill', 'Six positions on the way to the bottom, with a learning rate of 0.1. Each step is smaller than the last.'),
      box('example', 'Worked example 4.3  ·  Four steps downhill', P('Start at w = 0 with a learning rate of 0.1. This is only multiplying and subtracting. Find the first four steps.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Find the slope: 2(w − 3).' }), h('li', { html: 'Compute new w = old w − 0.1 × slope.' }), h('li', { html: 'Compute the loss: (w − 3)². Repeat.' })]),
        tab(['Step', 'w', 'Slope', 'Loss'], A.map((r, i) => ({ cells: [String(i), fmt(r.w, 3), fmt(r.g, 2), fmt(r.l, 2)] }))),
        P(`<b>Answer:</b> the loss falls from ${f(A[0].l, 1)} to ${f(A[4].l, 1)} in four steps. The steps shrink because the slope flattens near the bottom.`)),
      descentWidget(),
      box('example', 'Worked example 4.4  ·  A learning rate that is too big', P('Same walk, bigger steps. Just multiply and subtract again. Repeat Worked example 4.3 with a learning rate of 1.1.'),
        tab(['Step', 'w', 'Slope', 'Loss'], B.map((r, i) => ({ cells: [String(i), fmt(r.w, 3), fmt(r.g, 2), fmt(r.l, 2)] }))),
        P(`<b>Answer:</b> each step overshoots the bottom and lands farther away. The loss grows from ${f(B[0].l, 1)} to ${f(B[3].l, 1)}.`)),
      box('key', 'Key idea', P('Too small is slow. Too big overshoots. The learning rate is chosen in between.')),
      box('check', 'Check your understanding',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>What happens when the slope is exactly 0?' }), ans('The update does nothing: new w = old w − learning rate × 0. We are at a flat spot, such as the bottom of the valley.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>Why do the steps get smaller as we approach the bottom?' }), ans('Each step is the learning rate times the slope. The slope shrinks as the ground flattens, so the steps shrink too.')))]],
    ['4.6', 'Billions of dials', [
      prose('A real model has billions of dials, not one. The idea is unchanged. For every dial, find its slope. Then turn every dial a little downhill.',
        'Finding billions of slopes sounds impossible. It is not.'),
      box('def', 'Definition', P(`${T('Backpropagation')} finds the slope of every dial in one backward sweep through the model. It passes blame from the loss back to each dial.`)),
      fig(4, '4.5', 'The training loop', 'Four steps, repeated. On average, the loss gets a little lower each trip.'),
      prose('Training also works in small batches. The model checks a few thousand sentences, measures their average loss, and nudges the dials. A small batch is a good enough estimate, and much faster than reading everything.'),
      box('analogy', 'Analogy', P('A giant mixing board with billions of dials, and a producer who can tell, for every dial, which way to turn it to improve the sound.')),
      box('key', 'Key idea', P('Training is the same four steps, repeated: <b>predict, measure, find slopes, nudge</b>.'))]],
    ['4.7', 'Chapter summary and practice', [
      tab(['Word', 'Plain meaning'], [{ cells: ['Training', 'Repeating guess, check, adjust'] }, { cells: ['Loss', 'One number for how bad a guess was'] }, { cells: ['Parameter', 'One adjustable number (a dial) inside the model'] }, { cells: ['Gradient', 'The slope of the loss: which way is uphill. We step the other way'] }, { cells: ['Learning rate', 'How big each step is'] }, { cells: ['Gradient descent', 'Step against the slope, again and again'] }, { cells: ['Backpropagation', 'A fast way to find every dial’s slope'] }]),
      box('key', 'Chapter in one line', P('Training measures each mistake as a loss, finds which way to turn every dial, and nudges them all downhill, over and over.')),
      prose('Try these before you open the answers.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>The model gave the true word a chance of 25%. Find the loss.' }), ans(`−ln(0.25) = ${f(loss(.25), 2)}.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>A dial is at w = 5, the slope is 4, and the learning rate is 0.1. What is the new w?' }), ans('new w = 5 − 0.1 × 4 = 4.6.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span>Why not always use the smallest learning rate, to be safe?' }), ans('Tiny steps are safe but slow. Training a large model already takes weeks, so wasted steps are expensive.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span>Why does an untrained model with 50,000 tokens start with a loss near 10.8?' }), ans('It gives each token a chance of 1 in 50,000. −ln(1/50,000) is about 10.8.')))]]
  ];

  Book.render({ n: 4, secs, crumb: 'Chapter 4  ·  Loss and gradient descent', kicker: 'Chapter 4  ·  The machine', title: 'Loss and gradient descent',
    sub: 'How a model measures its mistakes, and how it uses them to set the billions of numbers inside it.',
    meta: '<span><b>7</b> sections</span><span><b>4</b> worked examples</span><span><b>5</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

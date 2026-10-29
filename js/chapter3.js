/* Chapter 3: The transformer block. */
(function () {
  'use strict';
  const { h, f, P, prose, box, eq, T, ans, fig: fig0 } = Book;
  const ST5 = window.__STAGES5, fig = (i, n, t, c) => fig0(i, n, t, c, ST5);
  const tab = (head, rows) => h('table', { class: 'calc' }, h('tr', {}, head.map(t => h('th', {}, t))), rows.map(r => h('tr', { class: r.cls || '' }, r.cells.map((c, i) => h('td', { class: (r.hl || []).includes(i) ? 'hl' : '' }, c)))));
  const fmt = (v, d = 1) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
  const vec = (a, d = 1) => `(${a.map(x => fmt(x, d)).join(', ')})`;
  const big = (n) => Math.round(n).toLocaleString('en-US');
  /* worked example 5.2: tiny feed-forward step */
  const x = [1, -2], W1 = [[1, 1], [1, -1], [-1, .5]], W2 = [[1, .5, 0], [0, -1, 1]];
  const z = W1.map(r => r[0] * x[0] + r[1] * x[1]), hid = z.map(v => Math.max(0, v)), outv = W2.map(r => r.reduce((a, w, i) => a + w * hid[i], 0));
  /* worked example 5.3: residual */
  const x0 = [1, 2], dA = [.3, -.5], dM = [-.2, .4], x1 = x0.map((v, i) => v + dA[i]), x2 = x1.map((v, i) => v + dM[i]);
  /* worked example 5.4: parameter count */
  const models = [['GPT-2 small', 12, 768, 12, 50257, '124 million'], ['GPT-3', 96, 12288, 96, 50257, '175 billion']];
  const est = models.map(([n, L, d, hh, V]) => ({ layers: 12 * L * d * d, emb: V * d }));

  const LEX = 'https://podcasts.apple.com/us/podcast/333-andrej-karpathy-tesla-ai-self-driving-optimus-aliens/id1434243584?i=1000584342757', PS = 'https://podscripts.co/podcasts/lex-fridman-podcast/333-andrej-karpathy-tesla-ai-self-driving-optimus-aliens-and-agi';
  const a = (href, t) => `<a href="${href}" target="_blank" rel="noopener">${t}</a>`;
  const ref = (...kids) => box('ref', 'From the interviews', ...kids);
  const secs = [
    ['3.1', 'Many questions at once', [
      prose('One attention step asks one kind of question. But a word may need several answers at once. The last word, <i>the</i>, might need <i>on</i> just before it, and also the subject <i>cat</i> at the start.',
        'So the model runs several attention steps side by side. Each one is called a head.'),
      box('def', 'Definition', P(`An ${T('attention head')} is one complete attention step, with its own queries, keys and values. ${T('Multi-head attention')} runs many heads in parallel, then joins their results side by side.`)),
      fig(0, '3.1', 'Four heads reading the same words', 'Each arc points back to an earlier word. Each head follows its own pattern. The patterns are made up for illustration; real heads are less tidy.'),
      box('analogy', 'Analogy', P('A panel of readers marking up the same page. One looks at the nearest word, one at the opening word, one at the subject. Their notes are then joined into one report.')),
      prose('Each word’s vector has <b>d</b> numbers. With <b>H</b> heads, each head works with d ÷ H of them. The results are joined back to the full length d.'),
      box('example', 'Worked example 3.1  ·  How big is each head?', P('This is one division. A word’s vector has d numbers, and the model uses H heads. Find how many numbers each head works with.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Divide d by H.' }), h('li', { html: 'Check: multiply the answer by H to get d back.' })]),
        tab(['Model', 'd', 'Heads H', 'd ÷ H', 'Check'], [['GPT-2 small', 768, 12], ['Llama 2 7B', 4096, 32], ['GPT-3', 12288, 96]].map(([n, d, hh]) => ({ cells: [n, big(d), String(hh), String(d / hh), `${d / hh} × ${hh} = ${big(d)}`] }))),
        P('<b>Answer:</b> 64, 128 and 128 numbers per head.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>A model has d = 1,024 and 16 heads. How many numbers does each head use?' }), ans('1,024 ÷ 16 = 64.')))]],
    ['3.2', 'Thinking alone: the feed-forward step', [
      prose('After attention, each word holds clues from other words. Now each word thinks them over on its own. This is the feed-forward step, sometimes called an MLP.',
        'It makes three moves: expand, filter, shrink.'),
      box('def', 'Definition', P(`The ${T('feed-forward step')} works on one word at a time, in three moves. It expands the word’s list, usually four times longer.`), P(`It sets every negative number to 0, a filter called ${T('ReLU')}. Then it shrinks the list back to its original length.`)),
      fig(1, '3.2', 'Expand, filter, shrink', 'Dashed cells were negative and became 0. Many models use a smoother filter, but the idea is the same.'),
      prose('Why filter? Expanding and then shrinking, with nothing between, is the same as one single multiplication. The filter is the small step that lets the block learn richer patterns.'),
      box('analogy', 'Analogy', P('Attention is a meeting where everyone shares notes. The feed-forward step is each person going back to their desk to think.')),
      box('example', 'Worked example 3.2  ·  A tiny feed-forward step', P(`A word has the list <code>${vec(x)}</code>. The expand step uses three weight rows, the filter is ReLU, and the shrink step uses two weight rows. We expand 2 numbers to 3 (real models expand four times), filter, and shrink back to 2. This is only multiplying, adding and zeroing.`),
        h('ol', { class: 'steps' }, [h('li', { html: `Expand. Each number in the longer middle list, the hidden list, is the dot product of a weight row with the list. Rows: ${W1.map(r => vec(r)).join(', ')}. Results: <b>${vec(z, 0)}</b>.` }), h('li', { html: `Filter. Negative numbers become 0: <b>${vec(hid, 0)}</b>.` }), h('li', { html: `Shrink. Rows: ${W2.map(r => vec(r)).join(', ')}. Results: <b>${vec(outv, 1)}</b>.` })]),
        tab(['Stage', 'Numbers'], [{ cells: ['Input', vec(x, 0)] }, { cells: ['After expand', vec(z, 0)] }, { cells: ['After filter (ReLU)', vec(hid, 0)] }, { cells: ['After shrink', vec(outv, 1)] }]),
        P(`<b>Answer:</b> the word leaves as <code>${vec(outv, 1)}</code>. Two of the three hidden numbers were negative, so the filter switched them off.`)),
      box('key', 'Key idea', P('Attention moves information between words. The feed-forward step processes it inside each word.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>Why does the block need the filter?' }), ans('Without it, the two steps would collapse into a single multiplication.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>Apply ReLU to the list (−3, 0, 2, −1).' }), ans('(0, 0, 2, 0). Negative numbers become 0 and the rest stay the same.')))]],
    ['3.3', 'Keeping the original', [
      prose('Attention and the feed-forward step each add something to a word. Neither replaces it. The block adds the change to the original vector.'),
      box('def', 'Definition', P(`A ${T('residual connection')} adds a step’s output to its own input, instead of replacing it.`), eq('new vector = old vector + change')),
      fig(2, '3.3', 'Adding the change', 'The word travels along the top and bottom paths unchanged. Each step adds its correction.'),
      box('analogy', 'Analogy', P('Editing with tracked changes. The original text stays, and each edit is added on top.')),
      box('example', 'Worked example 3.3  ·  Two additions', P(`This is only addition. A word starts as <code>${vec(x0)}</code>. Attention proposes the change <code>${vec(dA)}</code>. The feed-forward step then proposes <code>${vec(dM)}</code>. Find the word after the block.`),
        h('ol', { class: 'steps' }, [h('li', { html: `Add the attention change: ${vec(x0)} + ${vec(dA)} = <b>${vec(x1)}</b>.` }), h('li', { html: `Add the feed-forward change: ${vec(x1)} + ${vec(dM)} = <b>${vec(x2)}</b>.` })]),
        P(`<b>Answer:</b> <code>${vec(x2)}</code>. Each step nudged the word. Nothing was erased.`)),
      ref(P(`<b>Karpathy on the Lex Fridman Podcast</b> (#333, from about 38:18). Each block pairs attention with a feed-forward network (an MLP), and the blocks are stacked. He points to the residual pathway: gradients flow straight back to the early blocks, and this lets the network first learn a short algorithm, which later blocks refine. He also mentions a reshuffling of where layer normalization sits as one of the few changes to the design. ${a(LEX, 'Listen')} \u00b7 ${a(PS, 'Transcript (third-party)')}`)),
      prose('Early information is never overwritten, so it still reaches the last block.',
        'And each step only has to learn a small correction, which is easier than rebuilding the whole word.'),
      box('key', 'Key idea', P('Each step adds a small correction. Nothing is overwritten.'))]],
    ['3.4', 'One block, many times', [
      prose('Attention and the feed-forward step, each with its residual connection, make one block. Chapter 1 called each repeat a layer. From now on we call it a block. A model with N blocks stacks the same design N times, and every block has its own learned parameters.'),
      fig(3, '3.4', 'One block, repeated', 'The first block’s output feeds the second, and so on. The last output goes on to the scoring step of Chapter 1 (section 1.5).'),
      tab(['Model', 'Blocks', 'd', 'Heads', 'Published parameters'], models.map(([n, L, d, hh, V, p]) => ({ cells: [n, String(L), big(d), String(hh), p] }))),
      prose('Parameters are the dials that training sets (Chapter 4). We can estimate how many there are with a short rule.'),
      box('example', 'Worked example 3.4  ·  Counting the dials', P('This is multiplying and adding, and a calculator helps. Estimate the parameters of GPT-2 small and GPT-3.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'A weight table is a grid of learned numbers (the dials that training sets, Chapter 4). Attention has four such tables, each d × d (d rows, d columns). That is 4 × d × d, written 4d². (d² just means d × d.)' }), h('li', { html: 'The feed-forward step has two tables, d × 4d and 4d × d. That is 8d².' }), h('li', { html: 'One block holds 12d² (ignoring small extras). Multiply by the number of blocks.' }), h('li', { html: 'Add the word-vector table: vocabulary × d.' })]),
        tab(['Model', 'Blocks × 12d²', 'Vocabulary × d', 'Estimate', 'Published'], models.map(([n, L, d, hh, V, p], i) => ({ cells: [n, big(est[i].layers), big(est[i].emb), big(est[i].layers + est[i].emb), p] }))),
        P(`<b>Answer:</b> about ${f((est[0].layers + est[0].emb) / 1e6, 1)} million and ${f((est[1].layers + est[1].emb) / 1e9, 1)} billion. These are about 0.4% and 0.2% below the published 124 million and 175 billion. The rule skips small extras, such as position information, so a close miss is expected.`)),
      ref(P(`<b>Karpathy on the Lex Fridman Podcast</b> (#333, from about 38:18). He describes the transformer as something like a general-purpose computer (he has called it a general-purpose differentiable computer). It is expressive in the forward pass, it can be optimized by gradient descent, and it runs efficiently on parallel hardware such as GPUs. He notes it has changed little since it was introduced. He suspects better designs exist, but says the trend is to keep the transformer and scale the data. ${a(LEX, 'Listen')} \u00b7 ${a(PS, 'Transcript (third-party)')}`)),
      box('key', 'Key idea', P('A large model is not a new idea. It is the same block, made wider and stacked deeper.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>Which holds more of a block’s weights: attention or feed-forward?' }), ans('Feed-forward. In the usual design it holds 8d² of the block’s 12d², which is two thirds.')))]],
    ['3.5', 'Chapter summary and practice', [
      tab(['Word', 'Plain meaning'], [{ cells: ['Attention head', 'One attention step with its own question'] }, { cells: ['Multi-head attention', 'Many heads side by side, results joined'] }, { cells: ['Feed-forward step', 'Each word thinks alone: expand, filter, shrink'] }, { cells: ['Residual connection', 'Add the change to the original'] }, { cells: ['Block', 'Attention plus feed-forward, with residuals'] }]),
      box('key', 'Chapter in one line', P('A transformer is one block, repeated: heads gather clues, each word thinks alone, and every step adds a correction.')),
      prose('Try these before you open the answers.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>A model has d = 2,048 and 16 heads. How many numbers per head?' }), ans('2,048 ÷ 16 = 128.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>A word is (2, 1) and a step proposes the change (−1, 0.5). What is the word after the residual addition?' }), ans('(2, 1) + (−1, 0.5) = (1, 1.5).')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span>A model has 24 blocks and d = 1,024. Estimate the weights in its blocks (12 × blocks × d²).' }), ans(`12 × 24 × 1,024² = ${big(12 * 24 * 1024 * 1024)}, about 302 million.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span>Why do residual connections help a model with many blocks?' }), ans('Early information is carried forward instead of being overwritten, and each block only has to learn a small correction.')))]]
  ];

  Book.render({ n: 3, secs, crumb: 'Chapter 3  ·  The transformer block', kicker: 'Chapter 3  ·  The machine', title: 'The transformer block',
    sub: 'How attention, a private thinking step and a simple habit of adding corrections combine into the unit a model repeats dozens of times.',
    meta: '<span><b>5</b> sections</span><span><b>4</b> worked examples</span><span><b>4</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

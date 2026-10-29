/* Chapter 2: Attention. */
(function () {
  'use strict';
  const { h, sm, f, pc, P, prose, box, eq, T, ans, fig: fig0 } = Book;
  const ST4 = window.__STAGES4, fig = (i, n, t, c) => fig0(i, n, t, c, ST4);
  const { q, K, V, names, sc, wt, out } = window.__ATTN;
  const tab = (head, rows) => h('table', { class: 'calc' }, h('tr', {}, head.map(t => h('th', {}, t))), rows.map(r => h('tr', { class: r.cls || '' }, r.cells.map((c, i) => h('td', { class: (r.hl || []).includes(i) ? 'hl' : '' }, c)))));
  const fmt = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
  const vec = (a) => `(${a.map(x => fmt(x, 1)).join(', ')})`;
  const dots = K.map(k => q[0] * k[0] + q[1] * k[1]), ex = sc.map(Math.exp), exs = ex.reduce((a, b) => a + b, 0);
  /* masked example: the third word of "The cat sat on the" */
  const m = [1.0, 2.0, 0.5], me = m.map(Math.exp), ms = me.reduce((a, b) => a + b, 0), mw = me.map(v => v / ms);

  const LEX = 'https://podcasts.apple.com/us/podcast/333-andrej-karpathy-tesla-ai-self-driving-optimus-aliens/id1434243584?i=1000584342757', PS = 'https://podscripts.co/podcasts/lex-fridman-podcast/333-andrej-karpathy-tesla-ai-self-driving-optimus-aliens-and-agi';
  const a = (href, t) => `<a href="${href}" target="_blank" rel="noopener">${t}</a>`;
  const ref = (...kids) => box('ref', 'From the interviews', ...kids);
  const secs = [
    ['2.1', 'Words need their neighbors', [
      prose('In Chapter 1 the transformer was a black box. Here we open it, starting with attention, the step that lets each word use the words around it.'),
      prose('Take this sentence, read up to the word <i>it</i>: <i>The animal didn’t cross the street because it</i>. What does <i>it</i> mean? Most readers say the animal, because streets do not act.',
        'At first, the model has only the vector for the word <i>it</i>, which says little about animals. The model must look back and find the right word.'),
      fig(0, '2.1', 'A word looking back', 'The word <i>it</i> reads every earlier word. Thicker arcs mean it borrows more. With seven earlier words to read, the weights are spread thinner than in the three-word example below. The weights are illustrative, and real patterns vary from model to model.'),
      box('def', 'Definition', P(`${T('Attention')} is the step where each word gathers information from the words before it, and from itself. This gives every word the context it is missing.`)),
      prose('We follow one word, <i>it</i>, through the whole attention step, in two moves: score and weigh, then mix. You only need basic arithmetic and a calculator.')]],
    ['2.2', 'Query, key and value', [
      prose('To look back, each word needs a way to ask a question and a way to be found. So attention gives every word three short lists of numbers.'),
      box('def', 'Definition', P(`The ${T('query')} is what this word is looking for.`), P(`The ${T('key')} is what this word offers to others.`), P(`The ${T('value')} is the information this word hands over when it is picked.`)),
      box('analogy', 'Analogy', P('Think of a library. You walk in with a question: that is the query. Each book has a label on its spine: that is the key. The contents of the book are the value. The better the match, the more you read from that book, and you may read a little from several.')),
      ref(P(`<b>Karpathy again</b>, on the Lex Fridman Podcast (#333, October 2022; the transformers segment starts about 38:18). He pictures attention as message passing. Each position holds a vector and broadcasts what it is looking for and what it contains, and positions pass information to each other. In this section’s terms, these correspond to the query and the key. He adds that attention is only one part of the full architecture. ${a(LEX, 'Listen')} \u00b7 ${a(PS, 'Transcript (third-party)')}`)),
      fig(1, '2.2', 'Three roles', 'The query from <i>it</i> is compared with the key of each earlier word. Each word then offers its value.'),
      prose('The model makes all three from a word’s vector, using three learned tables of numbers (parameters, also called weights). Like all parameters in the model, they are set during training, the subject of Chapter 4.'),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> Which of the three does a word use to ask its question?' }), ans('The query. The keys are what the other words offer, and the values are what they give.')))]],
    ['2.3', 'First move: score and weigh', [
      prose('The query of <i>it</i> is compared with the key of every earlier word. The comparison is the dot product from Chapter 1: multiply matching numbers, then add. A bigger result means a better match.',
        'Two more moves turn these scores into weights. First, divide each score by √d, the square root of the number of values in each list. Longer lists tend to give bigger dot products, so dividing keeps the scores in a sensible range.',
        'With only two numbers per list the effect is small, but real models use many more. Then apply softmax, which Chapter 1 introduced and Chapter 5 covers in detail.'),
      box('def', 'Definition', P(`${T('Attention weights')} are chances that add up to 100%. They say how much a word takes from each word it reads. Do not confuse them with the learned weights above: attention weights are worked out fresh for every text.`), eq('attention weights = softmax( <span class="frac"><span class="num">query · key</span><span class="den">√d</span></span> )'), P('Here d is the length of each query and key list. With several heads (Chapter 3), each head’s lists are shorter than the whole vector.')),
      box('example', 'Worked example 2.1  ·  Scoring three words', P(`To keep the sums small, we use only three of the words: <i>animal</i>, <i>street</i> and <i>it</i>. Each word has a list of 2 numbers, so d = 2 and √d ≈ 1.414. The query of <i>it</i> is <code>${vec(q)}</code>. Find the attention weights over <i>animal</i>, <i>street</i> and <i>it</i>. The table shows rounded values, but the weights are calculated from unrounded ones.`),
        h('ol', { class: 'steps' }, [h('li', { html: 'Dot product of the query with each key: multiply matching numbers, then add.' }), h('li', { html: 'Divide each by √2, which is about 1.414.' }), h('li', { html: 'Apply softmax: exp of each, then divide by the total.' })]),
        tab(['Word', 'Key', 'Dot product', '÷ 1.414', 'exp', 'Weight'], names.map((n, i) => ({ cells: [n, vec(K[i]), fmt(dots[i], 1), fmt(sc[i], 2), fmt(ex[i], 2), pc(wt[i], 1)], hl: i === 0 ? [5] : [] }))),
        P(`<b>Answer:</b> ${pc(wt[0], 0)} on <i>animal</i>, ${pc(wt[1], 0)} on <i>street</i> and ${pc(wt[2], 0)} on <i>it</i> itself. The exp column adds to about ${fmt(exs, 1)}.`)),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> Two words have keys that give the same score. What are their weights?' }), ans('Equal. Softmax uses only the scores, so equal scores get equal weights.')))]],
    ['2.4', 'Second move: mix the values', [
      prose('Each word also has a value. The weights say how much of each value to take. Multiply each value by its weight, then add the results.',
        'In this simplified example, the blend is the new vector for <i>it</i>.'),
      box('example', 'Worked example 2.2  ·  Blending the values', P(`This is only multiplying and adding. The values are <code>animal = ${vec(V[0])}</code>, <code>street = ${vec(V[1])}</code> and <code>it = ${vec(V[2])}</code>. Use the weights from Worked example 2.1.`),
        h('ol', { class: 'steps' }, [h('li', { html: 'Multiply each value by its weight.' }), h('li', { html: 'Add the results, number by number.' })]),
        tab(['Word', 'Weight', 'Value', 'Weight × value'], [...names.map((n, i) => ({ cells: [n, fmt(wt[i], 4), vec(V[i]), `(${fmt(wt[i] * V[i][0], 4)}, ${fmt(wt[i] * V[i][1], 4)})`] })), { cls: 'sum', cells: ['Blend', '', '', `(${fmt(out[0], 4)}, ${fmt(out[1], 4)})`] }]),
        P(`<b>Answer:</b> the new vector for <i>it</i> is about <code>(${fmt(out[0], 2)}, ${fmt(out[1], 2)})</code>. It is close to the value of <i>animal</i>, which was (1, 0).`)),
      fig(2, '2.3', 'The whole step for one word', 'Scores become weights, and the weights blend the values. The numbers are those of Worked examples 2.1 and 2.2.'),
      box('key', 'Key idea', P('The new vector is a weighted blend of the values. <i>Animal</i> had the biggest weight, so the blend is mostly animal information.'))]],
    ['2.5', 'Looking only backward', [
      prose('When a model generates text, it only has the tokens so far. So each word may read the words before it, and itself, but never the ones after.',
        'In this kind of language model, this rule is a <b>causal mask</b>. It sets the score of each later word to minus infinity (−∞), a value so low that exp turns it into 0. Softmax then gives those words exactly 0%.'),
      box('analogy', 'Analogy', P('Reading a sentence with a card covering everything to the right of the word you are on.')),
      fig(3, '2.4', 'Who can read whom', 'Each row is one reading word. Blocked cells are later words. Percentages are rounded to whole numbers, so a row can add to 99 or 101. The values are illustrative.'),
      box('example', 'Worked example 2.3  ·  A masked row', P('Back to our cat sentence. Same softmax as before, with two words switched off. The third word of <i>The cat sat on the</i> is <i>sat</i>. Its scores (already divided by √d) for <i>The</i>, <i>cat</i> and <i>sat</i> are 1.0, 2.0 and 0.5. The words <i>on</i> and <i>the</i> are masked. Find the weights.'),
        tab(['Word read', 'Score', 'exp', 'Weight'], [...['The', 'cat', 'sat'].map((n, i) => ({ cells: [n, fmt(m[i], 1), fmt(me[i], 3), pc(mw[i], 1)] })), ...['on', 'the'].map(n => ({ cells: [n, '−∞', '0', '0%'] })), { cls: 'sum', cells: ['Total', '', fmt(ms, 3), '100%'] }]),
        P(`<b>Answer:</b> ${pc(mw[0], 1)}, ${pc(mw[1], 1)} and ${pc(mw[2], 1)} on the three visible words. The masked words get 0%.`)),
      box('check', 'Check your understanding',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> Why must the model not read later words while learning?' }), ans('Training text already contains the next token at every position. If a position could read it, the model would copy the answer instead of learning to predict it.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span> How much weight does the very first word put on itself?' }), ans('100%. In this example it is the only word it may read, so softmax over a single score gives 1.')))]],
    ['2.6', 'Chapter summary and practice', [
      tab(['Word', 'Plain meaning'], [{ cells: ['Attention', 'Each word gathers information from earlier words and itself'] }, { cells: ['Query', 'What this word is looking for'] }, { cells: ['Key', 'What this word offers to others'] }, { cells: ['Value', 'What this word hands over when picked'] }, { cells: ['Attention weights', 'Chances, adding to 100%, that say how much to take from each word'] }, { cells: ['Causal mask', 'Blocks later words, so a word cannot read what comes after it'] }]),
      box('key', 'Chapter in one line', P('Each word compares its query with the keys of the words it may read, turns the scores into weights, and blends their values by those weights.')),
      prose('Attention is one half of a transformer layer. Chapter 3 adds the other half and shows how the pieces stack.'),
      prose('Try these before you open the answers.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> Two keys both score 0 for a query, and no other words are read. What are the two weights?' }), ans('50% each. exp(0) = 1 for both, so each weight is 1 ÷ 2.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span> The weights are 50% and 50%, and the values are (2, 0) and (0, 2). What is the blend?' }), ans('0.5 × (2, 0) + 0.5 × (0, 2) = (1, 0) + (0, 1) = (1, 1).')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span> Why divide the scores by √d?' }), ans('Longer lists tend to give bigger dot products. Very large scores make softmax put almost all the weight on one word, because exp grows so fast. Dividing by √d keeps the scores moderate.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span> In a five-word sentence, how many words can the last word read?' }), ans('Five: the four before it, and itself.')))]]
  ];

  Book.render({ n: 2, secs, crumb: 'Chapter 2  ·  Attention', kicker: 'Chapter 2  ·  The machine', title: 'Attention',
    sub: 'How each word looks back at the words before it, decides which ones matter, and blends what they hold.',
    meta: '<span><b>6</b> sections</span><span><b>3</b> worked examples</span><span><b>4</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

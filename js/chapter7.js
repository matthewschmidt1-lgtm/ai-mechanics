/* Chapter 7: In-context learning. */
(function () {
  'use strict';
  const { h, f, P, prose, box, eq, T, ans, fig: fig0 } = Book;
  const ST8 = window.__STAGES8, fig = (i, n, t, c) => fig0(i, n, t, c, ST8);
  const tab = (head, rows) => h('table', { class: 'calc' }, h('tr', {}, head.map(t => h('th', {}, t))), rows.map(r => h('tr', { class: r.cls || '' }, r.cells.map((c, i) => h('td', { class: (r.hl || []).includes(i) ? 'hl' : '' }, c)))));
  const big = (n) => Math.round(n).toLocaleString('en-US');
  const YT = 'https://www.youtube.com/watch?v=lXUZvyajciY', DW = 'https://www.dwarkesh.com/p/andrej-karpathy', LEX = 'https://podcasts.apple.com/us/podcast/333-andrej-karpathy-tesla-ai-self-driving-optimus-aliens/id1434243584?i=1000584342757';
  const a = (href, t) => `<a href="${href}" target="_blank" rel="noopener">${t}</a>`;
  const ref = (...kids) => box('ref', 'From the interviews', ...kids);
  const PS = 'https://podscripts.co/podcasts/lex-fridman-podcast/333-andrej-karpathy-tesla-ai-self-driving-optimus-aliens-and-agi';
  /* invented chances that the model answers GREEN for "What a lovely day." after k examples */
  const SHIFT = [[34, 33, 33], [48, 26, 26], [61, 20, 19], [78, 12, 10], [88, 7, 5]], LAB = ['GREEN', 'RED', 'YELLOW'];

  /* interactive: how examples shift the model's chances */
  function fewShot() {
    let k = 0; const bars = [], pcs = [], out = h('div', { class: 'wsum', 'aria-live': 'polite' }), kv = h('b', {}, '0');
    const upd = () => { kv.textContent = k; SHIFT[k].forEach((v, i) => { bars[i].style.width = v + '%'; pcs[i].textContent = v + '%'; });
      out.textContent = k === 0 ? 'No examples: the model has no idea what GREEN, RED and YELLOW mean here.' : k < 3 ? 'Each example makes the right label a bit more likely.' : 'The pattern is clear.'; };
    const inp = h('input', { type: 'range', min: 0, max: 4, step: 1, value: 0, 'aria-label': 'Number of examples in the prompt', oninput: () => { k = +inp.value; upd(); }, style: { width: '100%', accentColor: 'var(--brand)' } });
    const rows = LAB.map((l, i) => { const bar = h('i'), pcEl = h('span', { class: 'pc' }); bars.push(bar); pcs.push(pcEl); return h('div', { class: 'wrow wide', style: { gridTemplateColumns: '90px 1fr 54px' } }, h('b', {}, l), h('div', { class: 'bar' }, bar), pcEl); });
    const w = h('div', { class: 'widget' }, h('div', { class: 'wh' }, 'Try it  ·  Examples in the prompt'), h('div', { class: 'wb' },
      h('p', { style: { margin: '0 0 .8rem', fontFamily: 'var(--sans)', fontSize: '.95rem', color: 'var(--muted)' } }, 'The prompt ends with “What a lovely day. →”. Drag to add examples. The chances are illustrative, not measured.'),
      h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1rem' } }, h('span', { class: 'mono', style: { whiteSpace: 'nowrap' } }, 'Examples'), inp, h('span', { class: 'mono', style: { minWidth: '2ch' } }, kv)), rows, out));
    upd(); return w;
  }

  const secs = [
    ['7.1', 'Learning without changing a weight', [
      prose('In Chapter 4, learning meant changing the parameters, the dials. Many people call them weights, and we will use both words. That took weeks of training. But a model can also pick up a new task in a few seconds, from the text you give it alone.',
        'Show it a few examples and it follows the pattern. Not one weight changes. The examples mostly show which task you want; training supplied the skills.'),
      box('def', 'Definition', P(`${T('In-context learning')} is when a model picks up a task from examples or instructions in its prompt, with no change to its weights. The <b>prompt</b> is the text you give the model before it answers.`)),
      fig(0, '7.1', 'A task taught by the prompt', 'Three examples define a labeling scheme the model has to infer. It then labels the new sentence.'),
      prose('Three set-ups are common. <b>Zero-shot</b> gives an instruction and no examples. <b>One-shot</b> gives one example. <b>Few-shot</b> gives a handful.'),
      box('example', 'Worked example 7.1  ·  How examples shift the chances', P('A prompt defines GREEN, RED and YELLOW labels with examples, then ends with <i>What a lovely day.</i> The right label is GREEN. The chances below are illustrative. Find how much each added example helps.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Read the chance of GREEN after 0, 1, 2, 3 and 4 examples.' }), h('li', { html: 'Subtract each from the next. This is only subtraction.' })]),
        tab(['Examples', 'GREEN', 'RED', 'YELLOW', 'GREEN gain'], SHIFT.map((r, i) => ({ cells: [String(i), r[0] + '%', r[1] + '%', r[2] + '%', i ? '+' + (r[0] - SHIFT[i - 1][0]) + ' points' : '–'], hl: [1] }))),
        P(`<b>Answer:</b> the chance of GREEN rises from ${SHIFT[0][0]}% to ${SHIFT[4][0]}% (illustrative), in steps of 14, 13, 17 and 10 points. The weights stayed the same. Only the prompt changed.`)),
      ref(P(`<b>Karpathy on the Lex Fridman Podcast</b> (#333, October 2022; this comes about 1:10, near the end of the conversation). He says the way we program computers is converging on how we program people: you prompt a person to do things, and plain-language prompts are starting to be the way we program computers. ${a(LEX, 'Listen')} \u00b7 ${a(PS, 'Transcript (third-party)')}`)),
      fewShot(),
      box('key', 'Key idea', P('A model can learn a task from its prompt, and lose it as soon as the prompt is gone.'))]],
    ['7.2', 'One way it works: copying patterns', [
      prose('Remember the model’s one job: predict the next token. If the prompt holds a clear pattern, the likeliest next token is the one that continues it.',
        'Attention from Chapter 2 makes this possible. The model can look back at every earlier word (really, every earlier token).'),
      fig(1, '7.2', 'Copying a pattern', 'The last word, <i>blue</i>, matches an earlier <i>blue</i>. The word that followed it, <i>sky</i>, becomes the guess.'),
      box('def', 'Definition', P(`An ${T('induction head')} is a kind of attention head (Chapter 3) that spots a repeat and copies what came next. If the text once said <i>A then B</i> and now says <i>A</i>, it pushes the model toward <i>B</i>.`)),
      box('example', 'Worked example 7.2  ·  Tracing a copy', P('The text is <code>blue sky red rose blue</code>. What does the induction rule predict next? No arithmetic is needed; just follow the steps.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'The last word is <b>blue</b>.' }), h('li', { html: 'Look back for an earlier <b>blue</b>. It is word 1.' }), h('li', { html: 'See what came after it. Word 2 is <b>sky</b>.' }), h('li', { html: 'Predict <b>sky</b>.' })]),
        tab(['Position', 'Word'], ['blue', 'sky', 'red', 'rose', 'blue'].map((w, i) => ({ cells: [String(i + 1), w], hl: i === 1 ? [0, 1] : [] }))),
        P('<b>Answer:</b> <i>sky</i>. This simple rule only matches and copies. It does not need to know what a sky is. Real models also use meaning.')),
      ref(P(`<b>Andrej Karpathy</b>, an AI researcher who helped build modern language models, was asked on the Dwarkesh Patel podcast (October 2025, about 14:42) whether in-context learning is gradient descent. He is hesitant to say yes. He points to a paper in which networks learned to fit a line from examples in the prompt, in ways that resemble gradient descent, and says nobody really knows. ${a(YT, 'Watch')} \u00b7 ${a(DW, 'Transcript')}`)),
      prose('Induction heads copy exact repeats. Real tasks need looser matching, and researchers think more flexible circuits help too. This is still being studied.'),
      box('key', 'Key idea', P('In-context learning works partly by spotting and continuing patterns, and attention is what lets the model see them.'))]],
    ['7.3', 'Working memory and long-term memory', [
      prose('A model has two places to hold knowledge. The weights hold what it learned in training. The context window holds the prompt.',
        'They behave very differently.'),
      fig(2, '7.3', 'Two kinds of memory', 'Knowledge in the weights is permanent but blurry. Knowledge in the context is sharp but temporary.'),
      ref(P(`<b>Karpathy on the Dwarkesh Patel podcast</b> (around 17:46). He describes knowledge in the weights as a hazy recollection, because the weights hold only a compressed trace of the training text. The context window is closer to working memory: the model can see everything in it directly. His tip: for better answers about a book chapter, put the chapter in the prompt instead of relying on the model’s memory. ${a(YT, 'Watch')} · ${a(DW, 'Transcript')}`)),
      box('def', 'Definition', P(`The ${T('context window')} is the most text, counted in tokens, that a model can read at once. The prompt and the reply must both fit.`)),
      prose('A useful rule of thumb: one token is about three quarters of a word. So 8,000 tokens is about 6,000 words.'),
      box('example', 'Worked example 7.3  ·  How many examples fit?', P('A model has an 8,000-token context window (a toy size; real models hold far more). The instructions, the new question and room for the reply take 300 tokens. Each example takes 40 tokens. How many examples fit? This is one subtraction and one division.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Space left for examples: 8,000 − 300 = <b>7,700</b> tokens.' }), h('li', { html: 'Divide by the size of one example: 7,700 ÷ 40 = 192.5. Round down, since half an example does not fit.' })]),
        P(`<b>Answer:</b> <b>192</b> examples fit. A 1,000-example prompt needs 40,000 tokens, so it would not fit.`)),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> You want a model to answer questions about a document it was never trained on. Where should the document go?' }), ans('In the prompt, inside the context window. The weights do not contain it, and the model can read the prompt directly.')))]],
    ['7.4', 'What it cannot do', [
      prose('In-context learning is powerful, but it has limits.',
        'It is <b>temporary</b>. When the conversation ends, the model remembers nothing. The weights are exactly as they were.'),
      prose('It is <b>bounded</b>. Only what fits in the context window can be used.',
        'It is <b>sensitive</b>. The order and wording of the examples can change the answer. And a long prompt costs more to process.'),
      ref(P(`<b>Karpathy on the Dwarkesh Patel podcast</b> (near the start, and about 21:16 to 24:02). He says today’s assistants cannot learn new things from one conversation. People seem to fold each day into their brain’s weights, perhaps during sleep, and language models have no equivalent step. He floats ideas for fixing this and expects the work to take roughly a decade. ${a(YT, 'Watch')} · ${a(DW, 'Transcript')}`)),
      box('key', 'Key idea', P('The context window is a notepad. The weights are a lifetime of reading. Only training can change the weights.')),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> You teach a model your labeling scheme in one conversation. You start a new conversation. What does it remember?' }), ans('Nothing. The scheme lived only in the earlier prompt, and the weights never changed. (Some apps save notes and paste them into the new prompt, but that is the prompt again.)')))]],
    ['7.5', 'Further listening', [
      prose('This chapter paraphrases two public conversations. Listen to the originals for Karpathy’s exact words and the context around them.'),
      h('table', { class: 'summary-table' }, h('tr', {}, ['Conversation', 'Worth listening for'].map(t => h('th', {}, t))),
        h('tr', {}, h('td', { html: `${a(YT, 'Dwarkesh Patel')}<br><span style="font-weight:400;color:var(--muted)">October 2025 · ${a(DW, 'transcript')}</span>` }), h('td', { style: { fontFamily: 'var(--sans)', color: 'var(--ink)' } }, 'In-context learning as pattern completion, and whether it resembles gradient descent (about 14:42). Weights as a hazy recollection versus context as working memory (about 17:46). Why assistants cannot yet remember new things (near the start, and about 21:16 to 24:02).')),
        h('tr', {}, h('td', { html: `${a(LEX, 'Lex Fridman #333')}<br><span style="font-weight:400;color:var(--muted)">October 2022</span>` }), h('td', { style: { fontFamily: 'var(--sans)', color: 'var(--ink)' } }, 'Transformers as a general-purpose computer, attention as message passing, and why the design has barely changed (from about 38:18). Language models as next-word predictors that pick up many skills at scale (from about 46:34), and plain-language prompting as programming (about 1:10).'))),
      box('note', 'A note on sources', P('Timestamps are approximate and may be off by a minute or so. The prompting-as-programming remark comes much later, about 1:10. Karpathy’s views here are paraphrased, so check the original before quoting him. The Lex Fridman points come from a third-party, auto-generated transcript and episode notes, which can contain errors.'))]],
    ['7.6', 'Chapter summary and practice', [
      tab(['Word', 'Plain meaning'], [{ cells: ['In-context learning', 'Picking up a task from the prompt, with no change to the weights'] }, { cells: ['Zero-shot, few-shot', 'No examples, or a handful'] }, { cells: ['Induction head', 'Spots a repeat and copies what followed'] }, { cells: ['Context window', 'The most text a model can read at once'] }, { cells: ['Weights', 'Another name for the parameters: what training stored, permanent but blurry (not the attention weights of Chapter 2)'] }]),
      box('key', 'Chapter in one line', P('A model can learn a task from its prompt, because attention lets it spot patterns in the prompt, but that learning is gone when the prompt is.')),
      prose('Try these before you open the answers.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> Does in-context learning change the model’s weights?' }), ans('No. Only the prompt changes. The weights stay exactly as they were.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span> The text is <code>cat sat dog ran cat</code>. What does the induction rule predict next?' }), ans('<i>sat</i>. The last word, <i>cat</i>, appeared earlier, and <i>sat</i> followed it.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span> A context window holds 4,000 tokens. Instructions, question and reply take 400. Each example takes 50. How many examples fit?' }), ans(`4,000 − 400 = 3,600. Then 3,600 ÷ 50 = ${big(3600 / 50)} examples.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span> Why can a model not remember what you told it yesterday?' }), ans('What you told it lived in yesterday’s prompt. A new conversation starts with an empty context, and the weights never changed. (Some apps save notes and paste them back in.)')))]]
  ];

  Book.render({ n: 7, secs, crumb: 'Chapter 7  ·  In-context learning', kicker: 'Chapter 7  ·  From model to assistant', title: 'In-context learning',
    sub: 'How a model learns a task from its prompt alone, why that works, and what it can never do. With pointers to Andrej Karpathy’s public interviews.',
    meta: '<span><b>6</b> sections</span><span><b>3</b> worked examples</span><span><b>3</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

/* Chapter 1: The full pipeline. */
(function () {
  'use strict';
  const { h, S, sm, f, pc, P, prose, box, eq, T, ans, fig } = Book;
  /* ---------- data for the worked problems ---------- */
  const CAND = [['mat', 3.1], ['floor', 2.2], ['sofa', 1.4], ['rug', 1.0], ['chair', 0.6], ['moon', -0.5], ['the', -1.2], ['banana', -2.0]];
  const Z = CAND.map(c => c[1]), PR = sm(Z);
  const z3 = [3.1, 2.2, 1.4], e3 = z3.map(Math.exp), s3 = e3.reduce((a, b) => a + b, 0), p3 = e3.map(v => v / s3);
  const vec = { cat: [0.9, 0.8], dog: [0.85, 0.75], car: [-0.7, 0.2] };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  let cum = 0; const bounds = PR.map(p => { const lo = cum; cum += p; return [lo, cum]; });
  const u = 0.66, hit = bounds.findIndex(([lo, hi]) => u >= lo && u < hi);

  /* ---------- interactive: softmax calculator ---------- */
  function softmaxWidget() {
    const names = ['mat', 'floor', 'sofa'], init = [3.1, 2.2, 1.4], rows = [], sumEl = h('div', { class: 'wsum' });
    const upd = () => { const z = rows.map(r => +r.inp.value), p = sm(z); rows.forEach((r, i) => { r.val.textContent = f(z[i], 1); r.bar.style.width = p[i] * 100 + '%'; r.pc.textContent = pc(p[i], 1); }); sumEl.textContent = 'The three probabilities add up to ' + pc(p.reduce((a, b) => a + b, 0), 0) + ', whatever the scores are.'; };
    names.forEach((n, i) => { const inp = h('input', { type: 'range', min: -3, max: 5, step: .1, value: init[i], 'aria-label': 'Score for ' + n, oninput: upd }), val = h('span'), bar = h('i'), pcEl = h('span', { class: 'pc' });
      rows.push({ inp, val, bar, pc: pcEl }); });
    const body = h('div', { class: 'wb' }, h('div', { class: 'wcol' }, h('span'), h('span', {}, 'Score z'), h('span'), h('span', {}, 'Probability'), h('span')),
      rows.map((r, i) => h('div', { class: 'wrow' }, h('b', {}, names[i]), r.inp, r.val, h('div', { class: 'bar' }, r.bar), r.pc)), sumEl);
    upd(); return h('div', { class: 'widget' }, h('div', { class: 'wh' }, 'Try it  ·  Softmax calculator'), body);
  }

  /* ---------- the chapter ---------- */
  const LEX = 'https://podcasts.apple.com/us/podcast/333-andrej-karpathy-tesla-ai-self-driving-optimus-aliens/id1434243584?i=1000584342757', PS = 'https://podscripts.co/podcasts/lex-fridman-podcast/333-andrej-karpathy-tesla-ai-self-driving-optimus-aliens-and-agi';
  const a = (href, t) => `<a href="${href}" target="_blank" rel="noopener">${t}</a>`;
  const ref = (...kids) => box('ref', 'From the interviews', ...kids);
  const secs = [
    ['1.1', 'What a language model does', [
      prose('A chatbot can feel like it thinks in whole ideas. It does not. A language model has one job: <b>guess the next small piece of text</b>.',
        'It writes a paragraph by guessing one piece, adding it, and guessing again.'),
      box('def', 'Definition', P(`A ${T('language model')} reads some text and gives every possible next piece a <b>probability</b> (this book also says <b>chance</b>): a number from 0 to 1 for how likely it is to come next.`)),
      prose('Take <i>The cat sat on the</i>. A good model gives most of the probability to <i>mat</i>, <i>floor</i> and <i>sofa</i>, and almost none to <i>banana</i>. It does not look up a stored answer. It works the probabilities out fresh each time.'),
      box('key', 'Key idea', P('A reply is built one piece at a time, and every piece is a prediction.')),
      prose('We will follow <i>The cat sat on the</i> through seven stages. You only need to add and multiply.')]],
    ['1.2', 'From text to tokens', [
      prose('A computer calculates with numbers, not letters. So the text must become numbers. First, we cut it into pieces.'),
      box('def', 'Definition', P(`A ${T('token')} is one piece of text: a word, part of a word, or a punctuation mark. The model knows a fixed list of tokens, its ${T('vocabulary')}, often 50,000 to 200,000 long. Each token has its own whole number, its ${T('id')}. From here on, “word” is shorthand for “token”.`)),
      fig(1, '1.1', 'Tokens and ids', 'The sentence is cut into five tokens. Each token is looked up in the vocabulary to get its id. The ids shown are illustrative.'),
      prose('Common words are one token. Rare words are split into smaller known pieces, so nothing is out of reach.'),
      box('example', 'Worked example 1.1  ·  Tokenizing a sentence', P('Turn <i>The cat sat on the</i> into token ids.'),
        h('ol', { class: 'steps' }, [
          h('li', { html: 'Cut the text into pieces. Each space stays attached to the word after it.' }),
          h('li', { html: 'Look each piece up in the vocabulary.' })]),
        h('table', { class: 'calc' }, h('tr', {}, ['Position', 'Token', 'Id'].map(t => h('th', {}, t))), ...['The', ' cat', ' sat', ' on', ' the'].map((t, i) => h('tr', {}, h('td', {}, String(i)), h('td', {}, JSON.stringify(t)), h('td', {}, String([464, 3797, 3332, 319, 262][i]))))),
        P('<b>Answer:</b> <code>[464, 3797, 3332, 319, 262]</code>. Note that <i>The</i> and <i> the</i> get different ids: a capital letter or a leading space makes a different token.')),
      box('analogy', 'Analogy', P('Think of a coat check. A coat-check ticket number stands for your coat. The model handles the tickets, not the coats.'))]],
    ['1.3', 'From tokens to vectors', [
      prose('Ids are labels, like jersey numbers. Player 23 is not better than player 7. The model needs numbers that carry meaning.'),
      box('def', 'Definition', P(`A ${T('vector')} is a list of numbers. An ${T('embedding')} is the vector that stands for one token. They are kept in one big table: one row per token.`)),
      box('analogy', 'Analogy', P('On a map, every city has two numbers, and nearby cities have similar ones. Embeddings do this for words, with hundreds of numbers instead of two. Similar meaning means nearby.')),
      prose('The id is just a row number. Row 3797 holds hundreds of numbers for <i> cat</i>. They start random. Training nudges them until similar words get similar rows (Chapter 4).'),
      fig(2, '1.2', 'The embedding table', 'Each id selects one row of the table. The five rows, stacked, are what enters the transformer. Only 16 columns are drawn.'),
      box('example', 'Worked example 1.2  ·  Measuring similarity', P('Four multiplications and two additions. That is all. A toy model gives each word two numbers: <code>cat = (0.9, 0.8)</code>, <code>dog = (0.85, 0.75)</code>, <code>car = (−0.7, 0.2)</code>. Which word is closest to <i>cat</i>? (Real vectors have hundreds of numbers.)'),
        h('ol', { class: 'steps' }, [
          h('li', { html: 'To score similarity, use the <b>dot product</b>: multiply the first numbers, multiply the second numbers, then add. A bigger result means more alike.' }),
          h('li', { html: `cat · dog = (0.9)(0.85) + (0.8)(0.75) = ${f(vec.cat[0] * vec.dog[0], 3)} + ${f(vec.cat[1] * vec.dog[1], 3)} = <b>${f(dot(vec.cat, vec.dog), 3)}</b>` }),
          h('li', { html: `cat · car = (0.9)(−0.7) + (0.8)(0.2) = ${f(vec.cat[0] * vec.car[0], 3)} + ${f(vec.cat[1] * vec.car[1], 3)} = <b>${f(dot(vec.cat, vec.car), 3)}</b>` })]),
        P(`<b>Answer:</b> <i>dog</i> scores ${f(dot(vec.cat, vec.dog), 3)} and <i>car</i> scores ${f(dot(vec.cat, vec.car), 3)}. Bigger means closer, so dog is the match.`))]],
    ['1.4', 'The transformer', [
      prose('We now have five vectors, one per token. Each one knows only its own token. The final <i>the</i> has no idea the sentence began with <i>cat</i>. The next stage fixes that.'),
      box('def', 'Definition', P(`A ${T('transformer')} is a stack of layers. Each layer has two parts. ${T('Attention')}: each word gathers clues from the words before it. The ${T('feed-forward step')}: each word then thinks over those clues on its own.`)),
      fig(3, '1.3', 'Layers of attention and processing', 'Blue arcs are attention: each position reads from itself and the positions before it, never after. Orange boxes are the feed-forward step (Chapter 3). Real models stack 12 to 100 or more layers (Chapter 3 calls each layer a block).'),
      ref(P(`<b>Andrej Karpathy</b>, an AI researcher who helped build modern language models, on the Lex Fridman Podcast (#333, October 2022; from about 38:18). He notes that one architecture, the transformer, has taken over across text, images and speech, so a single design can take any of them as input. ${a(LEX, 'Listen')} \u00b7 ${a(PS, 'Transcript (third-party)')}`)),
      prose('Attention looks <b>backward only</b>. At the word <i>on</i>, the model may use <i>The cat sat</i>, but never what comes later. That keeps the prediction honest: it cannot peek at the answer.'),
      box('analogy', 'Analogy', P('Five people sit in a row, each holding a note about one word. In each round, everyone reads the notes to their left, then rewrites their own. After many rounds, the last note sums up the sentence, and the model uses it to predict the next word.')),
      box('key', 'Key idea', P('The transformer turns five separate vectors into five vectors that <b>know their surroundings</b>. The last one is used to predict what comes next.'))]],
    ['1.5', 'Scores and probabilities', [
      prose('The last position now holds a list of numbers that sums up the whole sentence. The model multiplies it by a large table of learned numbers, called weights, to produce one score for every token in the vocabulary. Chapter 4 shows how they are learned.'),
      box('def', 'Definition', P(`A ${T('logit')} is a token’s raw score. Higher means more likely. Logits can be negative, and they do not add up to 1, so they are not yet probabilities.`)),
      fig(4, '1.4', 'One score for every token', 'One logit per token. Eight candidates are shown; the real list has tens of thousands.'),
      prose('We want probabilities: numbers that are never negative and that add up to 1. <b>Softmax</b> gets there in two moves.'),
      h('div', { class: 'prose' }, h('ol', { class: 'plain', html: '<li>Turn each score into a positive number with <code>exp</code> (a button on any calculator).</li><li>Divide each by the total.</li>' })),
      box('example', 'Worked example 1.3  ·  Softmax by hand', P('Three candidates have logits <code>mat = 3.1</code>, <code>floor = 2.2</code>, <code>sofa = 1.4</code>. Find their probabilities. This is only exp, adding and dividing. Here we score just three candidates, so the numbers differ from the eight-candidate figure.'),
        h('ol', { class: 'steps' }, [
          h('li', { html: 'Apply exp to each score.' }),
          h('li', { html: `Add the results: ${f(e3[0], 3)} + ${f(e3[1], 3)} + ${f(e3[2], 3)} = <b>${f(s3, 3)}</b>.` }),
          h('li', { html: 'Divide each result by the total.' })]),
        h('table', { class: 'calc' }, h('tr', {}, ['Token', 'z', 'exp(z)', 'p = exp(z) / ' + f(s3, 3)].map(t => h('th', {}, t))),
          ...['mat', 'floor', 'sofa'].map((n, i) => h('tr', {}, h('td', {}, n), h('td', {}, f(z3[i], 1)), h('td', {}, f(e3[i], 3)), h('td', { class: i === 0 ? 'hl' : '' }, pc(p3[i], 1)))),
          h('tr', { class: 'sum' }, h('td', {}, 'Total'), h('td'), h('td', {}, f(s3, 3)), h('td', {}, pc(p3.reduce((a, b) => a + b), 0)))),
        P('<b>Answer:</b> mat 62.9%, floor 25.6%, sofa 11.5%. A lead of just 0.9 in score became about 2.5 times the probability. (With all eight candidates in Figure 1.5, mat gets 54.3%, because there is more competition.)')),
      box('def', 'The same thing as a formula', P('<code>exp(z)</code> means <i>e</i> raised to <i>z</i>, where <i>e</i> is about 2.718.'), eq('p<sub>i</sub> = exp(z<sub>i</sub>) / (exp(z<sub>1</sub>) + exp(z<sub>2</sub>) + … + exp(z<sub>n</sub>))')),
      softmaxWidget(),
      fig(5, '1.5', 'From scores to probabilities', 'Softmax applied to all eight candidates. The percentages cover only the eight tokens drawn here.'),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>If you add 5 to every logit, what happens to the probabilities?' }), ans('Nothing. Adding 5 to every score multiplies every exp by the same amount, and that amount cancels in the division. Only the gaps between scores matter.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>Which token gets the highest probability: the one with the highest logit, or the lowest?' }), ans('The highest. Softmax keeps the ranking, so a bigger score always means a bigger probability.')))]],
    ['1.6', 'Choosing a token, and the loop', [
      prose('Now the model must choose one token. There are two common ways.'),
      box('def', 'Definition', P(`${T('Greedy decoding')} always takes the top token. ${T('Sampling')} spins a weighted wheel: a token with 20% probability is picked about 20% of the time.`)),
      box('analogy', 'Analogy', P('Picture a roulette wheel with slices of different sizes. Greedy always bets on the biggest slice. Sampling spins the wheel. The big slice wins most often, but not always. That is why one prompt can give different replies.')),
      box('example', 'Worked example 1.4  ·  Sampling a token', P(`No calculation needed, only reading a table. Use the eight probabilities from Figure 1.5. The computer draws a random number between 0 and 1: <b>${u}</b>. Which token is chosen?`),
        h('ol', { class: 'steps' }, [
          h('li', { html: 'Lay the probabilities end to end on a strip from 0 to 1. Each token owns a slice as wide as its probability.' }),
          h('li', { html: 'Find the slice that contains the random number.' })]),
        h('table', { class: 'calc' }, h('tr', {}, ['Token', 'Probability', 'Slice'].map(t => h('th', {}, t))),
          ...CAND.slice(0, 5).map(([n], i) => h('tr', {}, h('td', {}, n), h('td', { class: i === hit ? 'hl' : '' }, f(PR[i], 3)), h('td', { class: i === hit ? 'hl' : '' }, `${f(bounds[i][0], 3)} to ${f(bounds[i][1], 3)}`))),
          h('tr', {}, h('td', {}, '3 more'), h('td', {}, f(1 - bounds[4][1], 3)), h('td', {}, `${f(bounds[4][1], 3)} to 1`))),
        P(`<b>Answer:</b> ${u} falls in the slice ${f(bounds[hit][0], 3)} to ${f(bounds[hit][1], 3)}, so the token is <b>${CAND[hit][0]}</b>. Greedy would have chosen <i>mat</i>. Run this many times and <i>mat</i> would be drawn about 54 times in 100.`)),
      fig(6, '1.6', 'Choose, append, repeat', 'The chosen token is added to the text and the longer text goes back to the start.'),
      prose('The chosen token is added to the end of the text, and the process runs again. A reply of 200 tokens means 200 trips through the pipeline. (Real systems reuse earlier work to save time.)'),
      box('key', 'Key idea', P('Everything a language model writes comes from one loop: <b>text → tokens → vectors → transformer → scores → probabilities → pick → append</b>.'))]],
    ['1.7', 'Chapter summary and practice', [
      h('table', { class: 'summary-table' }, h('tr', {}, ['Stage', 'What happens'].map(t => h('th', {}, t))),
        ...[['Text', 'The sentence you type.'], ['Tokens', 'Cut into pieces. Each gets a whole number.'], ['Vectors', 'Each number picks a row: a list of numbers that carries meaning.'], ['Transformer', 'The lists share clues, looking only backward.'], ['Scores', 'One raw score per token in the vocabulary.'], ['Probabilities', 'Scores become chances that add up to 100%.'], ['Pick', 'One token is chosen and added. Repeat.']].map(r => h('tr', {}, r.map(c => h('td', {}, c))))),
      box('key', 'Chapter in one line', P('A language model turns text into numbers, lets each word gather context, scores every token, picks one, and repeats.')),
      prose('Try these before you open the answers.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span>Why can the same prompt produce different replies?' }), ans('The model picks the next token by sampling: a weighted random draw. Likely tokens win more often, but not every time.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span>The word <i>the</i> is the fifth token. Which other tokens can it attend to?' }), ans('All earlier tokens (<i>The</i>, <i>cat</i>, <i>sat</i>, <i>on</i>) and itself. Attention looks backward only.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span>A model outputs logits 2.0 and 0.0 for two tokens. Find the probabilities.' }), ans('exp(2.0) = 7.39 and exp(0) = 1. They add to 8.39. So 88.1% and 11.9%.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span>A model writes a reply of 120 tokens. How many times does the pipeline run?' }), ans('120 times, once per token.')))]]
  ];

  Book.render({ n: 1, secs, crumb: 'Chapter 1  ·  The full pipeline', kicker: 'Chapter 1  ·  Orientation', title: 'The full pipeline',
    sub: 'How a language model turns a prompt into the next word. Seven stages, one sentence, and the arithmetic behind each step.',
    meta: '<span><b>7</b> sections</span><span><b>4</b> worked examples</span><span><b>6</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

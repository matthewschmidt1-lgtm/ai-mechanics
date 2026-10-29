/* Chapter 8: How chat models are tuned. */
(function () {
  'use strict';
  const { h, f, pc, P, prose, box, eq, T, ans, fig: fig0 } = Book;
  const ST9 = window.__STAGES9, fig = (i, n, t, c) => fig0(i, n, t, c, ST9);
  const tab = (head, rows) => h('table', { class: 'calc' }, h('tr', {}, head.map(t => h('th', {}, t))), rows.map(r => h('tr', { class: r.cls || '' }, r.cells.map((c, i) => h('td', { class: (r.hl || []).includes(i) ? 'hl' : '' }, c)))));
  const loss = (p) => -Math.log(p), sig = (x) => 1 / (1 + Math.exp(-x));
  const YT = 'https://www.youtube.com/watch?v=lXUZvyajciY', DW = 'https://www.dwarkesh.com/p/andrej-karpathy', SG = 'https://www.youtube.com/watch?v=bZQun8Y4L2A';
  const a = (href, t) => `<a href="${href}" target="_blank" rel="noopener">${t}</a>`;
  const ref = (...kids) => box('ref', 'From the interviews', ...kids);
  /* worked example 9.1: loss on answer tokens only */
  const pa = [0.6, 0.3, 0.8, 0.5], la = pa.map(loss), avg = la.reduce((x, y) => x + y) / la.length;
  /* worked example 9.3: compare each attempt with the average */
  const right = [1, 0, 0, 1, 0, 1, 0, 0], mean = right.reduce((x, y) => x + y) / right.length;

  /* interactive: reward gap -> chance the reward model agrees */
  function gapWidget() {
    let d = 1.5; const out = h('div', { class: 'wsum', 'aria-live': 'polite' }), dv = h('b', {}, '1.5'), pEl = h('span', { class: 'mono' }), aEl = h('span', { class: 'mono' }), bEl = h('span', { class: 'mono' });
    const row = (x, y) => h('div', { class: 'wrow wide', style: { gridTemplateColumns: '230px 1fr' } }, h('b', {}, x), y);
    const upd = () => { dv.textContent = d.toFixed(1); const p = sig(d); pEl.textContent = pc(p, 1); aEl.textContent = f(-Math.log(p), 3); bEl.textContent = f(-Math.log(1 - p), 3);
      out.textContent = d < .5 ? 'Nearly equal scores: close to a coin flip.' : d < 2 ? 'A clear lead for A, but not certain.' : 'A big lead: the reward model is very sure. If people picked B instead, its loss in training would be large.'; };
    const inp = h('input', { type: 'range', min: 0, max: 5, step: .1, value: d, 'aria-label': 'Reward score of A minus B', oninput: () => { d = +inp.value; upd(); }, style: { width: '100%', accentColor: 'var(--brand)' } });
    const w = h('div', { class: 'widget' }, h('div', { class: 'wh' }, 'Try it  ·  Reward gap'), h('div', { class: 'wb' },
      h('p', { style: { margin: '0 0 .8rem', fontFamily: 'var(--sans)', fontSize: '.95rem', color: 'var(--muted)' } }, 'Drag to change how much higher the reward model scores answer A than answer B.'),
      h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1rem' } }, h('span', { class: 'mono', style: { whiteSpace: 'nowrap' } }, 'Score A − B'), inp, h('span', { class: 'mono', style: { minWidth: '3ch' } }, dv)),
      row('Chance the model says A wins', pEl), row('Loss if people pick A', aEl), row('Loss if people pick B', bEl), out));
    upd(); return w;
  }

  const secs = [
    ['8.1', 'From autocomplete to assistant', [
      prose('Chapter 4 trained a model to predict the next token on real text. That gives a <b>base model</b>. It is brilliant at continuing documents. It is not an assistant.',
        'Ask a base model a question and it may simply write more questions, because that is what often follows one on the internet.'),
      fig(1, '8.1', 'Same prompt, two models', 'A base model continues the document. An assistant answers the person. The outputs are illustrative.'),
      box('def', 'Definition', P(`A ${T('base model')} predicts the next token on internet-style text. An ${T('assistant')} is a base model that has been tuned further to follow instructions and give helpful answers. The tuning is called ${T('post-training')}.`)),
      prose('Here is the whole route in one picture. Each stage gets its own section.'),
      fig(0, '8.2', 'The stages', 'Most assistants pass through some version of these four stages.'),
      ref(P(`<b>Andrej Andrej Karpathy</b>’s talk <i>State of GPT</i> (Microsoft Build, May 2023) lays out this same outline: pretraining, then fine-tuning, then preferences, then reinforcement learning. We have not checked it against a transcript, so listen for his own wording. ${a(SG, 'Watch')}`)),
      prose('Pretraining gives the model knowledge. Post-training shapes how it behaves.')]],
    ['8.2', 'Stage two: learn from examples', [
      prose('This stage is the simplest. Collect example conversations written by people. Each shows a good answer to a prompt. Then keep training the model on them.',
        'It is the same method as Chapter 4: predict the next token, measure the loss, nudge the weights. Only the data is different.'),
      box('def', 'Definition', P(`${T('Supervised fine-tuning')} (SFT) trains a model on example prompts paired with good answers. In most setups the loss counts only the answer tokens, because those are what we want the model to learn to write.`)),
      box('example', 'Worked example 8.1  ·  Loss on the answer only', P('The prompt <i>What is the capital of France?</i> is followed by a four-token answer. The model gave the correct next token these chances: 60%, 30%, 80% and 50%. Find the average loss over the answer tokens. This is Chapter 4 again, and a calculator helps.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Find −ln(p) for each answer token.' }), h('li', { html: `Add them: ${la.map(v => f(v, 3)).join(' + ')} = <b>${f(la.reduce((x, y) => x + y), 3)}</b>.` }), h('li', { html: 'Divide by 4. The prompt tokens are not counted.' })]),
        tab(['Answer token', 'p', 'Loss = −ln(p)'], [...pa.map((p, i) => ({ cells: [String(i + 1), pc(p, 0), f(la[i], 3)] })), { cls: 'sum', cells: ['Average', '', f(avg, 3)] }]),
        P(`<b>Answer:</b> ${f(avg, 2)}. Training nudges the weights to lower it.`)),
      ref(P(`<b>Karpathy on the Dwarkesh Patel podcast</b> (October 2025, around 41:00). He found it striking how quickly a base model, fine-tuned on example conversations, turns into an assistant while keeping what it learned in pretraining. ${a(YT, 'Watch')} · ${a(DW, 'Transcript')}`)),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> Why does the loss count only the answer tokens?' }), ans('The goal is to teach the model to write good answers. The prompt is given, not something it should learn to produce. (This is the usual choice, not a universal rule.)')))]],
    ['8.3', 'Stage three: learn from preferences', [
      prose('Examples are expensive to write. Comparing is easier. Show a person two answers and ask which is better.',
        'A second network, the <b>reward model</b>, learns to give higher scores to the answers people prefer.'),
      box('def', 'Definition', P(`A ${T('reward model')} scores an answer: higher means people would prefer it. It turns human taste into a number. In Section 8.4 you will see how its scores can steer an assistant. That combination is called ${T('reinforcement learning from human feedback')} (RLHF).`)),
      fig(2, '8.3', 'Learning what people prefer', 'A person prefers answer A. The reward model scores A higher than B, and the chance it gives to A winning comes from the gap in scores. Illustrative.'),
      prose('The reward model turns the gap in scores into a chance between 0% and 100%. A gap of 0 is a coin flip, 50%. A bigger gap pushes the chance toward 100%.',
        'The curve that does this is the <b>sigmoid</b>: <code>1 ÷ (1 + e^−gap)</code>. Here e is about 2.718, as in Chapter 1.'),
      box('example', 'Worked example 8.2  ·  Do the scores agree?', P('Answer A scores 2.0 and answer B scores 0.5. Find the chance the reward model gives to A winning. Then find the loss if people did prefer A, and if they preferred B. A calculator with an e<sup>x</sup> key does the hard part.'),
        h('ol', { class: 'steps' }, [h('li', { html: 'Gap: 2.0 − 0.5 = <b>1.5</b>.' }), h('li', { html: `Chance: sigmoid(1.5) = 1 ÷ (1 + e^−1.5) = 1 ÷ (1 + ${f(Math.exp(-1.5), 3)}) = <b>${pc(sig(1.5), 1)}</b>.` }), h('li', { html: 'Loss is −ln of the chance given to the answer people actually picked.' })]),
        tab(['People pick', 'Chance given', 'Loss'], [{ cells: ['A', pc(sig(1.5), 1), f(-Math.log(sig(1.5)), 3)] }, { cells: ['B', pc(1 - sig(1.5), 1), f(-Math.log(1 - sig(1.5)), 3)] }]),
        P(`<b>Answer:</b> ${pc(sig(1.5), 1)} for A. If people agree, the loss is small (${f(-Math.log(sig(1.5)), 2)}). If they disagree, it is large (${f(-Math.log(1 - sig(1.5)), 2)}).`)),
      gapWidget(),
      prose('Think of a coach who has watched many practice runs and learns to score a new one. Later, the coach’s score can guide training when no person is available to compare answers.')]],
    ['8.4', 'Stage four: practice with rewards', [
      prose('For some tasks, no human taste is needed. A math answer is right or wrong. Code either passes its tests or does not.',
        'Here the model can practice on its own. It tries a problem many times and is rewarded when an attempt succeeds.',
        'The same method works when the reward is a reward model’s score instead of a test result. That is how RLHF finishes the job.'),
      fig(3, '8.4', 'Eight attempts, one verdict each', 'Each attempt earns 1 if right and 0 if wrong. It is then compared with the average reward.'),
      box('def', 'Definition', P(`${T('Reinforcement learning')} (RL) makes the attempts that scored above average more likely, and the others less likely. Comparing each attempt with the average reward tells us which way to push. A push is a small change to the weights.`)),
      box('example', 'Worked example 8.3  ·  Right and wrong attempts', P('A model tries a problem 8 times and gets it right 3 times. Reward is 1 for right and 0 for wrong. How far is each attempt from the average? This is only adding and subtracting.'),
        h('ol', { class: 'steps' }, [h('li', { html: `Average reward: 3 ÷ 8 = <b>${mean}</b>.` }), h('li', { html: `Right attempts: 1 − ${mean} = <b>+${f(1 - mean, 3)}</b>.` }), h('li', { html: `Wrong attempts: 0 − ${mean} = <b>−${f(mean, 3)}</b>.` })]),
        tab(['Attempts', 'Count', 'Reward', 'Compared with average'], [{ cells: ['Right', '3', '1', `+${f(1 - mean, 3)}`], hl: [3] }, { cells: ['Wrong', '5', '0', `−${f(mean, 3)}`] }, { cls: 'sum', cells: ['Total of the scores', '', '', f(3 * (1 - mean) - 5 * mean, 3)] }]),
        P(`<b>Answer:</b> right attempts score +${f(1 - mean, 3)} and wrong ones −${f(mean, 3)}. Measured against the average, the scores always add up to zero. Real systems use a more refined version of the same idea.`)),
      ref(P(`<b>Karpathy on the Dwarkesh Patel podcast</b> (October 2025, about 40:05 to 45:00). He is blunt about reinforcement learning: worse than most people think, though better than what came before. After many attempts, every step of a successful attempt is made more likely, wrong turns included. One right-or-wrong verdict is spread across the whole attempt, which he calls “sucking supervision through a straw”. People, by contrast, review their work and reason about which parts went well. ${a(YT, 'Watch')} · ${a(DW, 'Transcript')}`)),
      box('key', 'Key idea', P('RL can find answers that people would not have written, but one verdict per attempt is a thin signal.'))]],
    ['8.5', 'When the reward is gamed', [
      prose('Suppose people slightly prefer longer answers. The reward model learns that. The assistant then learns to pad every answer with filler, and the score rises while the answers get worse.',
        'This is called <b>reward hacking</b>. A reward is only a stand-in for what we really want.'),
      box('analogy', 'Analogy', P('A student who studies the test’s quirks instead of the subject. The grade rises. The learning does not.')),
      prose('A <b>judge</b> is any scorer, human or AI, that decides how good an answer is. One safeguard is a penalty for drifting too far from the fine-tuned model it started as. Another is to retrain the scorer on fresh examples. Neither removes the problem.'),
      ref(P(`<b>Karpathy on the Dwarkesh Patel podcast</b> (October 2025, around 45:00 to 49:00). He says that scoring each step is hard, so AI companies often use another AI as the judge, and that such judges can be gamed. He describes a training run against an AI judge where the score suddenly became perfect, but the answers were nonsense that the judge rated as perfect. Fixing each trick, he suggests, only creates a new judge with new tricks. ${a(YT, 'Watch')} · ${a(DW, 'Transcript')}`)),
      box('check', 'Check your understanding', h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> A model’s reward score keeps rising, but its answers are getting worse. What is the most likely cause?' }), ans('Reward hacking. The model has found ways to raise the score that do not make the answers better.')))]],
    ['8.6', 'Further listening', [
      prose('This chapter paraphrases public talks. Listen to the originals for Karpathy’s exact words and the context around them.'),
      h('table', { class: 'summary-table' }, h('tr', {}, ['Talk', 'Worth listening for'].map(t => h('th', {}, t))),
        h('tr', {}, h('td', { html: `${a(SG, 'State of GPT')}<br><span style="font-weight:400;color:var(--muted)">Microsoft Build, May 2023</span>` }), h('td', { style: { fontFamily: 'var(--sans)', color: 'var(--ink)' } }, 'The four stages of training an assistant, from pretraining to reinforcement learning.')),
        h('tr', {}, h('td', { html: `${a(YT, 'Dwarkesh Patel')}<br><span style="font-weight:400;color:var(--muted)">October 2025 · ${a(DW, 'transcript')}</span>` }), h('td', { style: { fontFamily: 'var(--sans)', color: 'var(--ink)' } }, 'Why fine-tuning on examples works so well (about 41:00). The limits of RL, and what it still does well (about 40:05 to 45:00). Gaming the judge (about 45:00 to 49:00). A side topic: why he calls models “ghosts” rather than animals (starting about 7:41).'))),
      box('note', 'A note on sources', P('Timestamps are approximate and may be off by a minute or so. Apart from two short phrases in quotation marks, Karpathy’s views here are paraphrased, so check the original before quoting him.'))]],
    ['8.7', 'Chapter summary and practice', [
      tab(['Word', 'Plain meaning'], [{ cells: ['Base model', 'Trained only to continue text'] }, { cells: ['Post-training', 'Extra tuning that makes it an assistant'] }, { cells: ['Fine-tuning (SFT)', 'Learn from example answers; loss on the answer only (the usual choice)'] }, { cells: ['Reward model', 'A network that scores answers the way people would'] }, { cells: ['Sigmoid', 'Turns a score gap into a chance from 0% to 100%'] }, { cells: ['Reinforcement learning', 'Make rewarded attempts more likely'] }, { cells: ['RLHF', 'Reinforcement learning guided by a reward model'] }, { cells: ['Judge', 'Any scorer, human or AI, of answers'] }, { cells: ['Reward hacking', 'Raising the score without improving the answer'] }]),
      box('key', 'Chapter in one line', P('Pretraining teaches a model language. Post-training teaches it to help, using examples, human preferences and rewards, and each of those can be gamed.')),
      prose('Try these before you open the answers.'),
      box('check', 'Exercises',
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">1.</span> A reward model scores two answers 1.0 and 1.0. What is the chance it prefers the first?' }), ans('50%. The gap is 0, and sigmoid(0) = 0.5.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">2.</span> A model gets a problem right 4 times out of 8. What is the average reward, and how far is a right attempt above it?' }), ans('The average is 4 ÷ 8 = 0.5. A right attempt is 1 − 0.5 = +0.5 above it, and a wrong one is −0.5 below.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">3.</span> In fine-tuning, the model gave two answer tokens a chance of 50% each. What is the average loss?' }), ans(`−ln(0.5) = ${f(loss(.5), 3)} for each token, so the average is ${f(loss(.5), 2)}.`)),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">4.</span> A reward model scores two answers 3.0 and 0.5. Is its chance of preferring the first above or below 90%?' }), ans('Above. The gap is 2.5, and sigmoid(2.5) = 1 ÷ (1 + 0.082) = 92.4%.')),
        h('div', { class: 'q' }, h('div', { class: 'qt', html: '<span class="qn">5.</span> Why is a base model not a good assistant?' }), ans('It was trained to continue documents, not to answer questions, so it may just write more questions.')))]]
  ];

  Book.render({ n: 8, secs, crumb: 'Chapter 8  ·  How chat models are tuned', kicker: 'Chapter 8  ·  From model to assistant', title: 'How chat models are tuned',
    sub: 'How a raw next-word predictor becomes an assistant, through examples, human preferences and rewards, and how those rewards can be gamed.',
    meta: '<span><b>7</b> sections</span><span><b>3</b> worked examples</span><span><b>4</b> figures</span><span><b>About 25</b> minutes</span>' });
})();

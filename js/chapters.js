/* The course: one shared list that feeds the home page, the Chapters menu and the Previous / Next links. */
window.SITE = { name: 'AI Mechanics', short: 'AM' };
window.PARTS = [
  { id: 'orientation', name: 'Orientation', blurb: 'The big picture, in one sentence.' },
  { id: 'machine', name: 'The machine', blurb: 'How the model is built, how it learns, and how it picks a word.' },
  { id: 'scale', name: 'Scale', blurb: 'What happens when the model gets bigger.' },
  { id: 'assistant', name: 'From model to assistant', blurb: 'How a prompt teaches it, and how a raw model becomes a helpful one.' },
  { id: 'further', name: 'Going further', blurb: 'An optional deep dive.' }
];
window.CHAPTERS = [
  { n: 1, file: 'chapter1.html', part: 0, minutes: 25, title: 'The full pipeline', blurb: 'Follow one sentence from text to next token in seven stages.', needs: 'Basic arithmetic.' },
  { n: 2, file: 'chapter2.html', part: 1, minutes: 25, title: 'Attention', blurb: 'How each word borrows context from the words before it.', needs: 'Chapter 1.' },
  { n: 3, file: 'chapter3.html', part: 1, minutes: 25, title: 'The transformer block', blurb: 'Heads, a private thinking step and corrections, stacked into the unit a model repeats.', needs: 'Chapter 2.' },
  { n: 4, file: 'chapter4.html', part: 1, minutes: 25, title: 'Loss and gradient descent', blurb: 'How a model measures its mistakes and sets its billions of numbers.', needs: 'Chapters 1 to 3.' },
  { n: 5, file: 'chapter5.html', part: 1, minutes: 25, title: 'Softmax and decoding', blurb: 'How scores become chances, and how one token is chosen.', needs: 'Chapters 1 and 4.' },
  { n: 6, file: 'chapter6.html', part: 2, minutes: 25, title: 'Scaling laws', blurb: 'How to forecast quality before you build, and why each extra bit of size buys less.', needs: 'Chapters 3 and 4.' },
  { n: 7, file: 'chapter7.html', part: 3, minutes: 25, title: 'In-context learning', blurb: 'How a prompt teaches a model without changing it.', needs: 'Chapters 2 and 4.' },
  { n: 8, file: 'chapter8.html', part: 3, minutes: 25, title: 'How chat models are tuned', blurb: 'From autocomplete to assistant: examples, preferences and rewards.', needs: 'Chapter 4.' },
  { n: 9, file: 'chapter9.html', part: 4, minutes: 25, title: 'Mixture of experts', blurb: 'How a model can store far more than it uses.', needs: 'Chapters 3 and 6.' }
];

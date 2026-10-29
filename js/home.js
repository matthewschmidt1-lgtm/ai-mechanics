/* Course home: parts, chapter cards, and where you left off. */
(function () {
  'use strict';
  const { h } = Kit, CH = window.CHAPTERS, PARTS = window.PARTS, SITE = window.SITE;
  let progress = {}; try { progress = JSON.parse(localStorage.getItem('course-progress-v1') || '{}'); } catch (e) { }
  const done = (n) => !!progress['done' + n], seen = (n) => !!progress['seen' + n];
  const next = CH.find(c => !done(c.n)) || CH[0], started = CH.some(c => seen(c.n)), finished = CH.every(c => done(c.n));
  const themeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark theme', onclick() {
    const c = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', c === 'light' ? 'dark' : 'light');
  } }, '◐');
  const total = CH.reduce((a, c) => a + c.minutes, 0);
  const card = (c) => h('a', { class: 'cc', href: c.file },
    h('div', { class: 'n' }, 'CHAPTER ' + c.n), h('b', {}, c.title), h('p', {}, c.blurb),
    h('div', { class: 'm' }, `${c.minutes} min  ·  assumes ${c.needs.replace(/\.$/, '').toLowerCase()}`, done(c.n) ? h('span', { class: 'ok' }, '  ·  ✓ Finished') : seen(c.n) ? '  ·  In progress' : ''));
  const parts = PARTS.map((p, i) => { const list = CH.filter(c => c.part === i); return list.length ? h('section', { class: 'part', id: p.id }, h('h2', {}, `Part ${i + 1}  ·  ${p.name}`), h('p', { class: 'pb' }, p.blurb), h('div', { class: 'cards' }, list.map(card))) : null; });
  const root = h('div', {},
    h('header', { class: 'top' }, h('a', { class: 'brand', href: 'index.html' }, h('span', { class: 'logo' }, SITE.short), SITE.name), h('span', { class: 'crumb' }, 'The course'), themeBtn),
    h('section', { class: 'home-hero' }, h('div', { class: 'in' }, h('div', { class: 'kicker' }, 'A course in nine chapters'), h('h1', {}, 'How large language models work.'),
      h('p', { class: 'sub' }, 'From one sentence to a working assistant. Plain words, small numbers you can check by hand, and pictures for every idea.'),
      h('div', { class: 'row' }, h('a', { class: 'btn primary', href: next.file }, finished ? 'Review from the start' : started ? `Continue: Chapter ${next.n}` : 'Start with Chapter 1'), h('span', { class: 'hint', style: { color: 'var(--muted)' } }, `${CH.length} chapters  ·  about ${Math.round(total / 60)} hours  ·  no maths beyond basic arithmetic`)))),
    h('main', { class: 'home-main' }, parts, h('div', { class: 'foot' }, 'Examples and numbers are illustrative.')));
  document.title = `${SITE.name}: The course`;
  document.getElementById('app').replaceChildren(root);
})();

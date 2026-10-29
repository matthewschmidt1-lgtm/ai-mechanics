/* Chapter 1 as a digital textbook: exposition, definitions, figures, worked problems, analogies, checks. */
(function () {
  'use strict';
  const { h, S } = Kit;
  const sm = (z, t = 1) => Kit.softmax(z, t);
  const f = (v, d = 2) => v.toFixed(d), pc = (p, d = 0) => (p * 100).toFixed(d) + '%';
  const P = (html) => h('p', { html });
  const prose = (...ps) => h('div', { class: 'prose' }, ps.map(P));
  const box = (cls, label, ...kids) => h('div', { class: 'box ' + cls }, h('span', { class: 'lab' }, label), ...kids);
  const eq = (html) => h('div', { class: 'eq', html });
  const T = (w) => `<span class="term">${w}</span>`;
  const ans = (...ps) => h('details', {}, h('summary', {}, 'Show the answer'), h('div', { class: 'ans' }, ps.map(P)));

  /* figures: draw (and animate) when scrolled into view; Replay redraws */
  const figs = [];
  function fig(stage, num, title, cap, ST = window.__STAGES) {
    const svg = S('svg', { viewBox: '0 0 1200 600', role: 'img', 'aria-label': title }), g = S('g'); svg.append(g);
    const art = h('div', { class: 'fig-art' }, svg); let panId = 0;
    const stopPan = () => { panId++; };
    ['touchstart', 'pointerdown', 'wheel'].forEach(ev => art.addEventListener(ev, stopPan, { passive: true }));
    /* on phones the figure is wider than the screen: glide across it once so nothing is missed */
    const pan = () => {
      if (!matchMedia('(max-width:620px)').matches || document.documentElement.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const id = ++panId, max = art.scrollWidth - art.clientWidth; if (max < 8) return;
      art.scrollLeft = 0; let t0 = null; const dur = 5200, hold = 700;
      const step = (t) => { if (id !== panId) return; if (t0 == null) t0 = t; const k = Math.min(1, Math.max(0, (t - t0 - hold) / dur)), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; art.scrollLeft = max * e; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const draw = () => { g.replaceChildren(); ST[stage].ill(g); pan(); };
    const el = h('figure', {}, art, h('div', { class: 'fig-hint' }, 'Swipe sideways to see the whole figure'), h('figcaption', {}, h('span', { html: `<b>Figure ${num}.</b> ${cap}` }), h('button', { class: 'replay', onclick: draw, 'aria-label': `Replay Figure ${num} animation` }, 'Replay')));
    figs.push({ el, draw, done: false }); return el;
  }

  /* ---------- page ---------- */
  function render(cfg) {
    const secs = cfg.secs;
    const themeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark theme', onclick() {
      const c = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', c === 'light' ? 'dark' : 'light');
    } }, '\u25d0');
    const pbar = h('div', { class: 'pbar' });
    const toc = h('nav', { class: 'toc', 'aria-label': 'Chapter contents' }, h('h4', {}, 'Contents'), secs.map(([n, t]) => h('a', { href: '#s' + n.replace('.', '-') }, h('span', {}, n), t)), h('div', { class: 'count' }));
    const article = h('article', {}, secs.map(([n, t, kids]) => h('section', { class: 'sec', id: 's' + n.replace('.', '-') }, h('div', { class: 'sec-n' }, n), h('h2', {}, t), kids)));
    const CH = window.CHAPTERS || [], SITE = window.SITE || { name: 'AI Academy', short: 'AI' }, me = cfg.n, prevC = CH[me - 2], nextC = CH[me];
    document.title = `${SITE.name}: Chapter ${me}, ${cfg.title}`;
    const card = (c, label, cls) => h('a', { class: cls || '', href: c.file }, h('span', {}, label), `Chapter ${c.n}  \u00b7  ${c.title}`, h('small', {}, c.blurb));
    const nav = h('div', { class: 'chnav' }, prevC ? card(prevC, 'Previous chapter') : h('i'), nextC ? card(nextC, 'Next chapter', 'nx') : card({ file: 'index.html', n: '', title: 'Back to the course', blurb: 'All chapters, with your progress.' }, 'You finished the course', 'nx'));
    let progress = {}; try { progress = JSON.parse(localStorage.getItem('course-progress-v1') || '{}'); } catch (e) { }
    const save = () => { try { localStorage.setItem('course-progress-v1', JSON.stringify(progress)); } catch (e) { } };
    progress['seen' + me] = true; save();
    const menu = h('details', { class: 'ch' }, h('summary', {}, 'Chapters'), h('ul', {}, h('li', {}, h('a', { href: 'index.html' }, 'Course home')), CH.map(c => h('li', {}, h('a', { href: c.file, 'aria-current': c.n === me ? 'page' : null }, h('b', {}, String(c.n)), c.title, progress['done' + c.n] ? h('i', { class: 'tick' }, ' \u2713') : null)))));
    const root = h('div', {},
      h('header', { class: 'top' }, h('a', { class: 'brand', href: 'index.html' }, h('span', { class: 'logo' }, SITE.short), SITE.name), menu, h('span', { class: 'crumb' }, cfg.crumb), window.Prefs ? Prefs.button() : themeBtn, pbar),
      h('section', { class: 'chapter-hero' }, h('div', { class: 'in' }, h('div', { class: 'kicker' }, cfg.kicker), h('h1', {}, cfg.title), h('p', { class: 'sub' }, cfg.sub), h('div', { class: 'meta', html: cfg.meta }))),
      h('div', { class: 'layout' }, toc, h('div', {}, article, nav, h('div', { class: 'foot' }, h('p', {}, 'Examples and numbers are illustrative.')))));
    document.getElementById('app').replaceChildren(root);
    const hdr = root.querySelector('.top'), setH = () => document.documentElement.style.setProperty('--hdr', hdr.offsetHeight + 'px'); setH(); addEventListener('resize', setH); document.addEventListener('prefschange', () => setTimeout(setH, 60));
    root.querySelectorAll('table.calc').forEach(t => { const r0 = t.querySelector('tr'); if (r0 && r0.children.length === 2 && [...t.querySelectorAll('td:last-child')].some(c => /[A-Za-z]{4,}/.test(c.textContent))) t.classList.add('text'); });
    const fio = new IntersectionObserver(es => es.forEach(e => { const fg = figs.find(x => x.el === e.target); if (e.isIntersecting && fg && !fg.done) { fg.done = true; fg.draw(); } }), { threshold: .35 });
    figs.forEach(x => fio.observe(x.el));
    const links = [...toc.querySelectorAll('a')], secEls = [...article.children], crumbEl = root.querySelector('.crumb'), cnt = toc.querySelector('.count'), base = cfg.crumb;
    const onScroll = () => {
      const y = scrollY + 140; let k = 0; secEls.forEach((s, i) => { if (s.offsetTop <= y) k = i; });
      links.forEach((a, i) => { a.classList.toggle('on', i === k); a.classList.toggle('done', i < k); });
      if (crumbEl) crumbEl.textContent = scrollY > 400 ? `${secs[k][0]}  \u00b7  ${secs[k][1]}` : base; if (cnt) cnt.textContent = `Section ${k + 1} of ${secs.length}`; toc.dataset.count = `${k + 1} / ${secs.length}`;
      if (links[k] && matchMedia('(max-width:860px)').matches) links[k].scrollIntoView({ inline: 'center', block: 'nearest' });
      const d = document.documentElement, pr = scrollY / Math.max(1, d.scrollHeight - innerHeight); pbar.style.width = Math.min(100, pr * 100) + '%'; if (pr > .92 && !progress['done' + me]) { progress['done' + me] = true; save(); }
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  window.Book = { h, S, sm, f, pc, P, prose, box, eq, T, ans, fig, render };
})();

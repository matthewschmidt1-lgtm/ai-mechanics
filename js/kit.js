/* Shared kit for picture-driven lessons: DOM + SVG helpers and the page shell. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  function props(e, p) {
    for (const [k, v] of Object.entries(p || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.setAttribute('class', v);
      else if (k === 'style' && typeof v === 'object') { for (const [a, b] of Object.entries(v)) a.startsWith('--') ? e.style.setProperty(a, b) : (e.style[a] = b); }
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
  }
  const add = (e, kids) => { for (const k of kids.flat(Infinity)) { if (k == null || k === false) continue; e.append(k.nodeType ? k : document.createTextNode(k)); } };
  const h = (t, p, ...k) => { const e = document.createElement(t); props(e, p); add(e, k); return e; };
  const S = (t, p, ...k) => { const e = document.createElementNS(NS, t); props(e, p); add(e, k); return e; };

  const C = { bg: '#0b0b0d', ink: '#f5f5f7', mute: '#a1a1a6', dim: '#636366', line: '#2c2c2e', panel: '#1c1c1e', panel2: '#2c2c2e',
    blue: '#0a84ff', cyan: '#64d2ff', yellow: '#ffd60a', pink: '#ff375f', green: '#30d158', orange: '#ff9f0a' };
  const FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,system-ui,"Helvetica Neue",Arial,sans-serif';
  const MONO = 'ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace';

  function T(p, str, x, y, o = {}) {
    const e = S('text', { x, y, 'font-size': o.size || 24, 'font-weight': o.weight || 500, fill: o.fill || C.ink, 'text-anchor': o.anchor || 'start',
      'font-family': o.mono ? MONO : FONT, 'letter-spacing': o.ls || 0 }, str); p.append(e); return e;
  }
  function R(p, x, y, w, hh, o = {}) {
    const e = S('rect', { x, y, width: w, height: hh, rx: o.r ?? 10, fill: o.fill || C.panel, stroke: o.stroke || 'none', 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash || 'none' }); p.append(e); return e;
  }
  function L(p, x1, y1, x2, y2, o = {}) {
    const e = S('line', { x1, y1, x2, y2, stroke: o.stroke || C.line, 'stroke-width': o.sw || 2, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || 'none' }); p.append(e); return e;
  }
  function P(p, d, o = {}) {
    const e = S('path', { d, fill: o.fill || 'none', stroke: o.stroke || C.ink, 'stroke-width': o.sw || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: o.op ?? 1 }); p.append(e); return e;
  }
  const rise = (e, d = 0) => { e.classList.add('rise'); e.style.setProperty('--d', d + 's'); return e; };
  const label = (g, str, x, y, anchor = 'middle') => T(g, str, x, y, { size: 17, fill: C.mute, anchor, ls: 3, weight: 600 });
  const softmax = (z, t = 1) => { const s = z.map(v => v / t), m = Math.max(...s), e = s.map(v => Math.exp(v - m)), n = e.reduce((a, b) => a + b, 0); return e.map(v => v / n); };

  const ICONS = {
    text: 'M8 12h24M8 20h24M8 28h14', scores: 'M9 31V19M16 31V11M23 31V24M30 31V15', prob: 'M8 28h24M10 28V16M20 28V9M30 28V22',
    exp: 'M6 32C16 31 24 26 29 8', divide: 'M8 20h24M20 11v.01M20 29v.01', temp: 'M6 12h28M6 20h28M6 28h28M14 9v6M26 17v6M18 25v6',
    dice: 'M9 9h22v22H9zM15 15v.01M25 15v.01M20 20v.01M15 25v.01M25 25v.01', cut: 'M8 30V18M16 30V10M24 30V22M32 30V26M5 17h30',
    loss: 'M6 8C14 30 26 32 34 31', descent: 'M6 10l8 12 6-6 14 16', attn: 'M8 30C12 8 28 8 32 30M8 30h24'
  };
  function icon(kind) {
    const s = S('svg', { viewBox: '0 0 40 40', width: 34, height: 34, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
    s.append(S('path', { d: ICONS[kind] || ICONS.text })); return s;
  }


  /* Cartoon helpers: Tok the mascot, and peeking eyes for token chips. */
  function eyes(p, x, y, o = {}) {
    const g = S('g', { class: 'eyes' }), r = o.r || 7, d = o.gap || 13;
    [-d, d].forEach(dx => { g.append(S('circle', { cx: x + dx, cy: y, r, fill: '#fff' }), S('circle', { cx: x + dx + (o.look || 2), cy: y + 1, r: r * .5, fill: '#111' })); });
    p.append(g); return g;
  }
  function mascot(mood) {
    const m = S('svg', { viewBox: '0 0 110 110', class: 'mascot', 'aria-hidden': 'true' });
    const look = { look: [4, 0], think: [3, -4], wow: [0, 0], happy: [0, 1], grin: [0, 1] }[mood] || [0, 1];
    const mouth = { happy: S('path', { d: 'M38 60 Q50 70 62 60', fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }),
      grin: S('path', { d: 'M34 56 Q50 76 66 56 Z', fill: '#fff' }), wow: S('ellipse', { cx: 50, cy: 64, rx: 6, ry: 8, fill: '#fff' }),
      think: S('path', { d: 'M42 62 H58', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }), look: S('path', { d: 'M40 61 Q50 66 60 61', fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }) }[mood] || null;
    const body = S('g', { class: 'm-body' });
    body.append(S('line', { x1: 50, y1: 14, x2: 50, y2: 4, stroke: '#0a6fd8', 'stroke-width': 4, 'stroke-linecap': 'round' }), S('circle', { cx: 50, cy: 5, r: 5, fill: '#ffd60a' }),
      S('rect', { x: 28, y: 76, width: 16, height: 14, rx: 6, fill: '#0a6fd8' }), S('rect', { x: 56, y: 76, width: 16, height: 14, rx: 6, fill: '#0a6fd8' }),
      S('rect', { x: 14, y: 14, width: 72, height: 66, rx: 24, fill: '#0a84ff' }),
      S('circle', { cx: 38, cy: 42, r: 10, fill: '#fff' }), S('circle', { cx: 62, cy: 42, r: 10, fill: '#fff' }),
      S('circle', { cx: 38 + look[0], cy: 42 + look[1], r: 5, fill: '#111' }), S('circle', { cx: 62 + look[0], cy: 42 + look[1], r: 5, fill: '#111' }),
      S('rect', { x: 26, y: 31, width: 24, height: 22, rx: 11, fill: '#0a84ff', class: 'lid' }), S('rect', { x: 50, y: 31, width: 24, height: 22, rx: 11, fill: '#0a84ff', class: 'lid' }));
    if (mouth) body.append(mouth);
    if (mood === 'think') body.append(S('circle', { cx: 94, cy: 22, r: 3.5, fill: '#8e8e93' }), S('circle', { cx: 101, cy: 11, r: 5.5, fill: '#8e8e93' }));
    m.append(body); return m;
  }

  /* Page shell: top bar, hero with stage rail, click-through explorer, plus caller-supplied sections. */
  function shell(cfg) {
    const stages = cfg.stages, n = stages.length; let idx = 0;
    const themeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark theme', onclick() {
      const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', cur === 'light' ? 'dark' : 'light');
    } }, '◐');
    const heroRail = h('div', { class: 'hero-rail', style: { '--n': n } }, stages.map((st, i) => h('button', { class: 'hr-node', style: { '--i': i }, onclick: () => openStage(i), 'aria-label': `Open stage ${i + 1}: ${st.name}` },
      h('span', { class: 'hr-ic' }, icon(st.icon)), h('span', { class: 'hr-n' }, String(i + 1).padStart(2, '0')), h('b', {}, st.name))));

    const stageSvg = S('svg', { viewBox: '0 0 1200 600', class: 'ex-svg', role: 'img', 'aria-label': 'Illustration of the current stage' });
    const g = S('g'); stageSvg.append(g);
    const idxLabel = h('div', { class: 'ex-idx' });
    const prev = h('button', { class: 'ex-arrow left', 'aria-label': 'Previous stage', onclick: () => go(idx - 1) }, '‹');
    const next = h('button', { class: 'ex-arrow right', 'aria-label': 'Next stage', onclick: () => go(idx + 1) }, '›');
    const canvas = h('div', { class: 'ex-canvas' }, stageSvg, idxLabel, prev, next);
    const tabs = h('div', { class: 'ex-tabs', role: 'tablist', style: { '--n': n } }, stages.map((st, i) => h('button', { class: 'ex-tab', role: 'tab', onclick: () => go(i) }, h('span', {}, String(i + 1).padStart(2, '0')), st.name)));
    const fill = h('i'); const bar = h('div', { class: 'ex-bar' }, fill);
    const tTitle = h('h3'), tBody = h('p', { class: 'ex-body' }), tMath = h('div', { class: 'formula' }), tNote = h('p', { class: 'ex-note' });
    const text = h('div', { class: 'ex-text' }, h('div', { class: 'ex-stagehead' }, tTitle), h('div', { class: 'ex-detail' }, tBody, tMath, tNote));
    let timer = null;
    const playBtn = h('button', { class: 'btn play', onclick() { timer ? stop() : play(); } });
    const setPlay = () => { playBtn.textContent = timer ? 'Pause' : (idx >= n - 1 ? 'Replay' : 'Play all stages'); playBtn.classList.toggle('on', !!timer); };
    const explorer = h('section', { class: 'explorer', id: 'explore' }, h('div', { class: 'wrap' },
      h('div', { class: 'sec-head' }, h('div', { class: 'eyebrow' }, cfg.exploreEyebrow), h('h2', {}, cfg.exploreTitle), h('p', {}, cfg.exploreSub)), h('div', { class: 'ex-ctrl' }, playBtn, h('span', { class: 'hint' }, 'or step through with the arrows')), tabs, bar, canvas, text));

    function stop() { clearInterval(timer); timer = null; setPlay(); }
    function play() {
      if (idx >= n - 1) go(0, true);
      clearInterval(timer); timer = setInterval(() => { if (idx >= n - 1) return stop(); go(idx + 1, true); if (idx >= n - 1) stop(); }, cfg.dwell || 5200); setPlay();
    }
    function go(i, auto) {
      if (!auto) stop();
      idx = Math.max(0, Math.min(n - 1, i)); const st = stages[idx];
      [...tabs.children].forEach((t, j) => { t.classList.toggle('on', j === idx); t.classList.toggle('past', j < idx); t.setAttribute('aria-selected', j === idx); });
      fill.style.width = (idx / (n - 1)) * 100 + '%';
      g.replaceChildren(); st.ill(g);
      idxLabel.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}  ·  ${st.name.toUpperCase()}`;
      tTitle.textContent = st.title; tBody.textContent = st.body; tMath.textContent = st.math; tNote.textContent = st.note || ''; tNote.style.display = st.note ? '' : 'none';
      text.classList.remove('swap'); void text.offsetWidth; text.classList.add('swap');
      prev.disabled = idx === 0; next.disabled = idx === n - 1; setPlay();
    }
    function openStage(i) { go(i); explorer.scrollIntoView({ behavior: 'smooth' }); }

    const node = h('div', { id: 'top' },
      h('header', { class: 'top' }, h('a', { class: 'brand', href: 'index.html' }, h('span', { class: 'logo' }, 'AI'), 'AI Academy'), h('span', { class: 'crumb' }, cfg.crumb), h('div', { class: 'tools' }, themeBtn)),
      h('section', { class: 'hero' }, h('div', { class: 'wrap' },
        h('div', { class: 'eyebrow' }, cfg.eyebrow), h('h1', {}, ...cfg.heroTitle), h('p', { class: 'lead' }, cfg.lead),
        h('div', { class: 'row' }, h('a', { class: 'btn primary lg', href: '#explore', onclick(e) { e.preventDefault(); openStage(0); } }, 'Start exploring'), h('span', { class: 'hint' }, 'or choose a stage below')), heroRail)),
      ...cfg.before, explorer, ...cfg.after, h('footer', { class: 'foot2' }, 'Examples and numbers are illustrative.'));

    const rev = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    requestAnimationFrame(() => { node.querySelectorAll('.reveal').forEach(e => rev.observe(e)); });
    document.addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      const r = explorer.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      if (e.key === 'ArrowRight') { go(idx + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { go(idx - 1); e.preventDefault(); }
    });
    window.__go = go;
    document.getElementById('app').replaceChildren(node); go(0);
  }


  /* Scroll-driven story: one pinned scene; scrolling scrubs the animation of the current stage. */
  function story(cfg) {
    const stages = cfg.stages, n = stages.length, mkIcon = cfg.iconFn || icon, PER = 1.35; let cur = -1;
    const themeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark theme', onclick() {
      const c = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', c === 'light' ? 'dark' : 'light');
    } }, '◐');
    const svg = S('svg', { viewBox: '0 0 1200 600', class: 'st-svg', role: 'img', 'aria-label': 'Illustration of the current stage' }); const g = S('g'); svg.append(g);
    const kick = h('div', { class: 'st-kick' }), tTitle = h('h3'), tBody = h('p', { class: 'st-body' }), mHold = h('div', { class: 'st-mascot' }), say = h('div', { class: 'st-say' }, mHold, tBody), tMath = h('div', { class: 'st-math' }), tNote = h('p', { class: 'st-note' });
    const cap = h('div', { class: 'st-cap' }, kick, tTitle, say, tMath, tNote);
    const dots = h('nav', { class: 'st-dots', 'aria-label': 'Stages' }, stages.map((st, i) => h('button', { 'aria-label': st.name, title: st.name, onclick: () => seek(i) }, h('i'), h('span', {}, st.name))));
    const cue = h('div', { class: 'st-cue', 'aria-hidden': 'true' }, h('span', { class: 'mouse' }, h('i')), h('b', {}, 'Scroll to play'));
    const prog = h('div', { class: 'st-prog' }, h('i'));
    const pin = h('div', { class: 'st-pin' }, prog, h('div', { class: 'st-canvas' }, svg), cap, dots, cue);
    const track = h('section', { class: 'story', id: 'explore', style: { height: `calc(${n * PER * 100}vh + 100vh)` } }, pin);
    const seek = (i) => scrollTo({ top: track.offsetTop + (i + .02) * PER * innerHeight, behavior: 'smooth' });
    const heroRail = h('div', { class: 'hero-rail', style: { '--n': n } }, stages.map((st, i) => h('button', { class: 'hr-node', style: { '--i': i }, onclick: () => seek(i), 'aria-label': `Go to stage ${i + 1}: ${st.name}` },
      h('span', { class: 'hr-ic' }, mkIcon(st.icon)), h('span', { class: 'hr-n' }, String(i + 1).padStart(2, '0')), h('b', {}, st.name))));

    let scrub = [];
    function draw(i) {
      cur = i; const st = stages[i]; g.replaceChildren(); st.ill(g);
      scrub = [...g.querySelectorAll('.rise,.fadeout')].map(el => ({ el, base: parseFloat(getComputedStyle(el).animationDelay) || 0 }));
      scrub.forEach(({ el }) => { el.style.animationPlayState = 'paused'; });
      kick.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}  ·  ${st.name.toUpperCase()}`;
      mHold.replaceChildren(mascot(st.mood)); say.classList.remove('hop'); void say.offsetWidth; say.classList.add('hop');
      tTitle.textContent = st.title; tBody.textContent = st.body; tMath.textContent = st.math; tNote.textContent = st.note || ''; tNote.style.display = st.note ? '' : 'none';
      [...dots.children].forEach((d, j) => { d.classList.toggle('on', j === i); d.classList.toggle('past', j < i); });
    }
    let ticking = false;
    function update() {
      ticking = false;
      const r = track.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
      const P = Math.min(n - 1e-6, Math.max(0, (-r.top / span) * n)), i = Math.floor(P), loc = P - i;
      const live = r.top < 56 && r.bottom > 56; pin.classList.toggle('live', live); topbar.classList.toggle('dark', live);
      if (i !== cur) draw(i);
      prog.firstChild.style.width = (P / n) * 100 + '%'; cue.classList.toggle('gone', P > .35);
      const t = Math.min(1, loc / .6) * (cfg.scrubSeconds || 2.6);
      scrub.forEach(({ el, base }) => { el.style.animationDelay = (base - t) + 's'; });
      const fadeIn = Math.min(1, loc / .05), fadeOut = i < n - 1 ? Math.min(1, (1 - loc) / .08) : 1, o = Math.max(0, Math.min(fadeIn, fadeOut));
      svg.style.opacity = o; cap.style.opacity = o; cap.style.transform = `translateY(${(1 - o) * 14}px)`;
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);

    const topbar = h('header', { class: 'top' }, h('a', { class: 'brand', href: 'index.html' }, h('span', { class: 'logo' }, 'AI'), 'AI Academy'), h('span', { class: 'crumb' }, cfg.crumb), h('div', { class: 'tools' }, themeBtn));
    const node = h('div', { id: 'top' }, topbar,
      h('section', { class: 'hero' }, h('div', { class: 'wrap' }, h('div', { class: 'eyebrow' }, cfg.eyebrow), h('h1', {}, ...cfg.heroTitle), h('p', { class: 'lead' }, cfg.lead),
        h('div', { class: 'row' }, h('a', { class: 'btn primary lg', href: '#explore', onclick(e) { e.preventDefault(); seek(0); } }, 'Begin'), h('span', { class: 'hint' }, 'The lesson plays as you scroll')), heroRail), h('div', { class: 'hero-cue', 'aria-hidden': 'true' }, h('span', { class: 'mouse' }, h('i')), h('b', {}, 'Scroll'))),
      ...cfg.before, track, ...cfg.after, h('footer', { class: 'foot2' }, 'Examples and numbers are illustrative.'));
    const rev = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.getElementById('app').replaceChildren(node);
    requestAnimationFrame(() => { node.querySelectorAll('.reveal').forEach(e => rev.observe(e)); update(); });
    window.__seek = seek;
  }

  /* Comic strip: one panel per stage. Panels pop in as they scroll into view and their art plays then. */
  function comic(cfg) {
    const stages = cfg.stages, n = stages.length, mkIcon = cfg.iconFn || icon;
    const themeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark theme', onclick() {
      const c = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', c === 'light' ? 'dark' : 'light');
    } }, '◐');
    const panels = stages.map((st, i) => {
      const svg = S('svg', { viewBox: '0 0 1200 600', class: 'cm-svg', role: 'img', 'aria-label': st.name + ' illustration' }), g = S('g'); svg.append(g);
      const say = h('div', { class: 'cm-say' }, h('div', { class: 'st-mascot' }, mascot(st.mood)), h('div', { class: 'cm-bubble' }, h('p', {}, st.body)));
      const fx = h('div', { class: 'cm-fx' }, h('code', {}, st.math), st.note ? h('p', {}, st.note) : null);
      const el = h('article', { class: 'cm-panel' + (i % 2 ? ' flip' : ''), id: 'p' + (i + 1) },
        h('header', { class: 'cm-head' }, h('span', { class: 'cm-n' }, String(i + 1)), h('h3', {}, st.title), h('span', { class: 'cm-of' }, `${i + 1} / ${n}`)),
        h('div', { class: 'cm-art' }, svg), h('div', { class: 'cm-talk' }, say, fx));
      return { el, g, st, drawn: false };
    });
    const strip = h('section', { class: 'comic', id: 'explore' }, h('div', { class: 'wrap cm-wrap' }, panels.map(p => p.el)));
    const go = (i) => document.getElementById('p' + (i + 1)).scrollIntoView({ behavior: 'smooth', block: 'start' });
    const heroRail = h('div', { class: 'hero-rail', style: { '--n': n } }, stages.map((st, i) => h('button', { class: 'hr-node', style: { '--i': i }, onclick: () => go(i), 'aria-label': `Go to panel ${i + 1}: ${st.name}` },
      h('span', { class: 'hr-ic' }, mkIcon(st.icon)), h('span', { class: 'hr-n' }, String(i + 1).padStart(2, '0')), h('b', {}, st.name))));
    const node = h('div', { id: 'top' },
      h('header', { class: 'top' }, h('a', { class: 'brand', href: 'index.html' }, h('span', { class: 'logo' }, 'AI'), 'AI Academy'), h('span', { class: 'crumb' }, cfg.crumb), h('div', { class: 'tools' }, themeBtn)),
      h('section', { class: 'hero' }, h('div', { class: 'wrap' }, h('div', { class: 'eyebrow' }, cfg.eyebrow), h('h1', {}, ...cfg.heroTitle), h('p', { class: 'lead' }, cfg.lead),
        h('div', { class: 'row' }, h('a', { class: 'btn primary lg', href: '#p1', onclick(e) { e.preventDefault(); go(0); } }, 'Read the strip'), h('span', { class: 'hint' }, `${n} panels, top to bottom`)), heroRail),
        h('div', { class: 'hero-cue', 'aria-hidden': 'true' }, h('span', { class: 'mouse' }, h('i')), h('b', {}, 'Scroll'))),
      ...cfg.before, strip, ...cfg.after, h('footer', { class: 'foot2' }, 'Examples and numbers are illustrative.'));
    document.getElementById('app').replaceChildren(node);
    panels.forEach(p => { p.st.ill(p.g); p.drawn = true; });
    const rev = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    const pio = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); pio.unobserve(e.target); } }), { threshold: .3 });
    requestAnimationFrame(() => { node.querySelectorAll('.reveal').forEach(e => rev.observe(e)); panels.forEach(p => pio.observe(p.el)); });
    window.__seek = go;
  }

  window.Kit = { eyes, mascot, h, S, C, T, R, L, P, rise, label, softmax, icon, shell, story, comic, FONT, MONO };
})();

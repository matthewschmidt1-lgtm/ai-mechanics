/* Reader preferences: text size, theme, high contrast, reduced motion. Applied before first paint and remembered on this device only. */
(function () {
  'use strict';
  const KEY = 'ai-mechanics-prefs-v1', SIZES = [90, 100, 112.5, 125, 150], DEF = { theme: 'auto', contrast: false, size: 1, motion: false };
  let st = Object.assign({}, DEF);
  try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { }
  st.size = Math.max(0, Math.min(SIZES.length - 1, +st.size || 1));
  const root = document.documentElement;
  function apply() {
    if (st.theme === 'light' || st.theme === 'dark') root.setAttribute('data-theme', st.theme); else root.removeAttribute('data-theme');
    if (st.contrast) root.setAttribute('data-contrast', 'high'); else root.removeAttribute('data-contrast');
    if (st.motion) root.setAttribute('data-motion', 'reduce'); else root.removeAttribute('data-motion');
    root.style.fontSize = SIZES[st.size] + '%';
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  function set(patch) { Object.assign(st, patch); save(); apply(); document.dispatchEvent(new Event('prefschange')); }
  apply();

  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, ...k) => { const e = document.createElement(t); for (const [n, v] of Object.entries(a || {})) { if (n === 'class') e.className = v; else if (n.startsWith('on')) e.addEventListener(n.slice(2), v); else if (v !== null && v !== false) e.setAttribute(n, v === true ? '' : v); } k.flat().forEach(c => e.append(c.nodeType ? c : document.createTextNode(c))); return e; };
  function icon() {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '22'); s.setAttribute('height', '22'); s.setAttribute('aria-hidden', 'true');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.innerHTML = '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="7.3" r="1.3" fill="currentColor" stroke="none"/><path d="M7 10.2l5 1.1 5-1.1M12 11.3v3.2M12 14.5l-2.6 4M12 14.5l2.6 4"/>'; return s;
  }

  /* the Accessibility button and its panel */
  function button() {
    const out = el('output', { class: 'a11y-size-out', 'aria-live': 'polite' });
    const smaller = el('button', { type: 'button', class: 'a11y-step', 'aria-label': 'Smaller text', onclick: () => set({ size: Math.max(0, st.size - 1) }) }, 'A−');
    const larger = el('button', { type: 'button', class: 'a11y-step', 'aria-label': 'Larger text', onclick: () => set({ size: Math.min(SIZES.length - 1, st.size + 1) }) }, 'A+');
    const themes = [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([v, t]) => el('button', { type: 'button', 'data-v': v, onclick: () => set({ theme: v }) }, t));
    const seg = el('div', { class: 'a11y-seg', role: 'group', 'aria-label': 'Theme' }, themes);
    const sw = (label, key) => { const i = el('input', { type: 'checkbox', role: 'switch', onchange: () => set({ [key]: i.checked }) }); return [el('label', { class: 'a11y-sw' }, i, el('span', {}, label)), i]; };
    const [hcLabel, hc] = sw('High contrast', 'contrast'), [moLabel, mo] = sw('Reduce motion', 'motion');
    const reset = el('button', { type: 'button', class: 'a11y-reset', onclick: () => set(Object.assign({}, DEF)) }, 'Reset to defaults');
    const panel = el('div', { id: 'a11y-panel', class: 'a11y-panel', role: 'dialog', 'aria-label': 'Accessibility settings', hidden: true },
      el('div', { class: 'a11y-row' }, el('span', { class: 'a11y-lab' }, 'Text size'), el('div', { class: 'a11y-sizebox' }, smaller, out, larger)),
      el('div', { class: 'a11y-row' }, el('span', { class: 'a11y-lab' }, 'Theme'), seg), hcLabel, moLabel, reset);
    const btn = el('button', { type: 'button', class: 'a11y-btn', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'a11y-panel', 'aria-label': 'Accessibility settings', title: 'Accessibility settings' }, icon(), el('span', { class: 'a11y-txt' }, 'Accessibility'));
    const wrap = el('div', { class: 'a11y' }, btn, panel);
    const sync = () => { out.textContent = SIZES[st.size] + '%'; smaller.disabled = st.size === 0; larger.disabled = st.size === SIZES.length - 1; themes.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === st.theme))); hc.checked = st.contrast; mo.checked = st.motion; };
    const close = (ret) => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (ret) btn.focus(); };
    const open = () => { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); sync(); const f = panel.querySelector('button:not(:disabled),input'); if (f) f.focus(); };
    btn.addEventListener('click', () => panel.hidden ? open() : close(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); close(true); } });
    document.addEventListener('click', e => { if (!panel.hidden && !wrap.contains(e.target)) close(false); });
    document.addEventListener('prefschange', sync); sync(); return wrap;
  }

  /* a small number cruncher for the page footer: digit wheels that keep rolling */
  function cruncher() {
    const wheel = (d) => { const digits = []; for (let i = 0; i < 11; i++) digits.push(el('span', {}, String(i % 10))); return el('span', { class: 'wheel', style: `--d:${d}s` }, el('span', { class: 'strip' }, digits)); };
    return el('div', { class: 'cruncher', role: 'img', 'aria-label': 'An animated number cruncher' }, el('span', { class: 'cr-sigma', 'aria-hidden': 'true' }, 'Σ'), el('span', { class: 'cr-wheels', 'aria-hidden': 'true' }, [0.9, 1.3, 1.9, 2.7, 3.7].map(wheel)), el('span', { class: 'cr-eq', 'aria-hidden': 'true' }, '='));
  }
  window.Prefs = { get: () => Object.assign({}, st), set, button, cruncher, SIZES };
})();

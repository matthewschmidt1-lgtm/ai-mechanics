# AI Mechanics

A nine-chapter course on how large language models work. Plain words, small numbers you can check by hand, and a figure for every idea.

It is a static site: HTML, CSS and JavaScript, with no build step and no dependencies.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## How it is organised

| Path | What it is |
|---|---|
| `index.html` | Course home |
| `chapter1.html` to `chapter9.html` | One page per chapter |
| `js/chapters.js` | The shared chapter list: titles, parts, summaries, site name. Edit this to rename the site or reorder chapters. |
| `js/chapterN.js` | The text, worked examples and exercises for chapter N |
| `js/illN.js` | The figures for chapter N |
| `js/book.js` | The shared page engine (contents, boxes, figures, navigation, progress) |
| `js/kit.js` | Drawing helpers for the figures |
| `js/prefs.js` | The Accessibility button: text size, theme, high contrast and reduced motion, remembered on the reader's device; also the footer number cruncher |
| `css/book.css` | All styles, light and dark |

Progress (which chapters you have finished) is stored only in the reader's own browser. The site collects no data.

## Sources and accuracy

All example numbers are illustrative unless a source is named. Chapters 7 and 8 paraphrase public interviews with Andrej Karpathy, with links and approximate timestamps. Check the original before quoting anyone.

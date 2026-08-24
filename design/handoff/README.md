# Handoff: Guía de Apertura de Negocios en Puerto Rico

## Overview
A bilingual (ES/EN), tool-first single-page guide for people opening a business in Puerto Rico. The centerpiece is a live decision tool: the user answers up to 10 questions and the page assembles their actual sequence of steps (agency, deadline, cost), plus applicable incentives, warnings, and an honest "what we couldn't verify" list. Below the tool: a swimlane diagram of the whole process, a municipal comparison table, and a legend explaining the sourcing marks. Every substantive claim in the copy carries a sourcing mark: confirmed (primary source), secondary, or unverified.

Target repo: `Sacarianos/pr-business-guide` (Astro, static output, GitHub Pages). Per the repo's own spec (`issues/0001-guia-apertura-de-negocios.md`), content should live in `content/*.yaml` collections with Zod schemas, and the decision-tree logic should be a pure function (answers + content → result) with no DOM/network access, importable by both the Astro page and a Node test suite.

## About the Design Files
The file in this bundle (`Guia Negocios PR.dc.html`) is a **design reference** built in an HTML prototyping tool — it is not production code to copy directly. It demonstrates exact layout, copy, colors, typography, the decision logic, and interaction states. The task is to **recreate this design in Astro** (the repo's existing framework), porting:
- the decision-tree logic into a pure, framework-free module (this is Seam A in the repo's testing spec — the porting target for the prior artifact's 44-assertion Node suite)
- the content (question copy, step copy, municipal data, sourcing marks) into `content/*.yaml` collections
- the visual design into Astro components, static HTML/CSS with minimal client JS (the spec calls for zero JS by default; only the language toggle, theme toggle, and the interactive question panel need client-side interactivity — candidates for small islands or vanilla JS, consistent with the repo's "zero JavaScript by default" principle)

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy in the HTML file are final. Recreate pixel-perfectly; do not restyle.

## Screens / Views
This is a single scrolling page with four sections, not separate routes.

### Section 1 — "Tu ruta" (the tool)
**Purpose:** user answers questions; sees their personalized sequence build live.
**Layout:** two-column grid, `330px` question column + flexible results column, `52px` gap. Question column is `position: sticky; top: 64px` (clears the sticky top bar) with its own scroll (`max-height: calc(100vh - 88px); overflow-y: auto`) so it doesn't run off-page on short viewports.
**Question column:** one block per question — a mono, teal (`var(--sello)`, `#0D5C63` light / `#5FB8BF` dark) number (no leading zero) + a 13px/600-weight Libre Franklin label. Below: either (a) wrapping flex row of pill-style option buttons, (b) a native `<select>` for municipality, or (c) a number `<input>` for volume. Optional 11.5px hint text below in `--ink-3`. A "start over" button (mono, uppercase, bordered) below the last question.
**Option buttons:** unselected = `1px solid var(--rule)` border, white/surface background, `--ink-2` text, 400 weight. Selected = solid `var(--sello)` background and border, surface-colored text, 600 weight. `transition: border-color .12s, background .12s, color .12s`. Hover (unselected): border → `var(--sello)`. Focus: `2px solid var(--sello)` outline, 2px offset.
**Empty state** (fewer than 3 questions answered): dashed border box, centered italic-toned message, ~64px vertical padding.
**Results (once ≥3 answered):**
- "At a glance" strip: 4-column grid, `border-top: 2px solid var(--ink)`, `border-bottom: 1px solid var(--rule)`. Each cell: 9.5px uppercase mono label in `--ink-3`, then a 26px/800-weight Libre Franklin value (tabular numerals), then an 11px `--ink-3` sub-label. Cells after the first get a `1px solid var(--rule-soft)` left border as a divider.
- "Your sequence" list: numbered rows, `44px` number column (mono, teal, bold) + content column. Each row has a colored left border (`2px solid`, transparent by default; teal/amber/red for flagged steps — "key"/"warn"/"stop") and `1px solid var(--rule-soft)` bottom divider. Row: 16px/700 Libre Franklin title, then a row of 10.5px mono meta (agency, timing, cost) in `--ink-3`, then a 15.5px note paragraph (rendered from HTML — contains `<b>`, `<a>`, inline sourcing-mark spans) in `--ink-2` at 1.55 line-height.
- "Incentives" and "Warnings" groups (rendered only if non-empty): 11px uppercase mono section header with `1px solid var(--rule)` bottom border, then cards with a colored left border (green=good/verificado, amber=warn, red=stop) and the same note-paragraph styling.
- "What we couldn't verify": same header style, then a stack of paragraphs each with a `2px solid var(--ambar)` left border.

### Section 2 — "La forma del proceso" (swimlane diagram)
**Purpose:** explain the two-chain structure (legal/tax identity chain + premises chain) converging on the Permiso Único, plus parallel municipal/employer obligations and a recurring-compliance strip.
**Layout:** full-width `<svg viewBox="0 0 1180 700">` inside a bordered, padded (`20px`) surface box, horizontally scrollable on narrow viewports (`min-width: 960px` on the SVG). Figcaption below, 15.5px, `--ink-2`.
**Diagram content (built as SVG shapes + real text nodes — not HTML — because SVG `<text>` cannot contain block-level markup):** two lane header labels (mono, teal, letter-spaced) each with a subtitle; 4 boxed nodes per lane connected by arrows; an amber-outlined callout box with the "ordering rule people get wrong"; a solid teal "PERMISO ÚNICO" box that both lanes' last node arrows into; a bundle box below listing the 5 things it consolidates; an "OPEN FOR BUSINESS" outlined box below that; a third lane of parallel obligations (municipal patente, DTRH, CFSE, chauffeur's insurance) that don't gate opening; and a bottom timeline strip (week 0/2/6/14+ labels over three colored horizontal bars: green/amber/teal).

### Section 3 — Municipal comparison table
**Purpose:** show why the same business pays very differently depending on municipality.
**Layout:** `border-top: 2px solid var(--ink)`, standard HTML table, 13.5px Libre Franklin. Columns: Municipality (name + sourcing mark stacked — name on its own line via `display:block`, mark below it, not inline, so wrapping is consistent across rows), Rate, Permits (Delegated/OGPe), Portal/note. Header row: 9.5px uppercase mono, `--ink-3`. Rows: `1px solid var(--rule-soft)` bottom border, hover background = `var(--surface)`.
**9 municipalities** with real per-municipality rate structures (flat rates, tiered rates for San Juan/Ponce/Camuy) plus an "other" fallback row.

### Section 4 — Sourcing legend
**Purpose:** explain the confirmed/secondary/unverified marks used throughout.
**Layout:** 3-column grid, each cell `1px solid var(--rule)` top border, 9.5px uppercase mono tag in the mark's color, 15.5px description below in `--ink-2`.

### Chrome (all sections)
- **Top bar:** `position: sticky; top: 0; z-index: 20`, `1px solid var(--rule)` bottom border, surface background. Left: 10.5px uppercase mono brand string. Right: a two-button ES/EN segmented control (bordered, active = solid teal bg) + a bordered theme-toggle button (text reads "Modo oscuro"/"Light mode" depending on current theme).
- **Masthead:** surface background, `2px solid var(--ink)` bottom border. Eyebrow (mono, teal, uppercase), then an H1 in Libre Franklin 800-weight (`clamp(34px,5.4vw,60px)`, `-.035em` tracking) with an italic Newsreader sub-line below it at 0.42em scale, then a 19px dek paragraph.
- **Alert strip:** one full-width band below the masthead (originally two side-by-side; the countdown/deadline alert was removed per user request — only the "most guidance online is out of date" alert remains), `210px` label column + content, `1px solid var(--rule)` top border.
- **Footer:** 3 stacked paragraphs (sourcing note, a caution about stale government consolidations, a not-legal-advice disclaimer), 14.5px, `--ink-3`, `1px solid var(--rule)` top border.

## Interactions & Behavior
- **Language toggle:** switches all copy (ES default). Every string in the page has an ES and EN variant — see the `dict()` method in the DC's logic class for the full bilingual string table.
- **Theme toggle:** light (default) / dark. Persisted to `localStorage` under the key `pr-guia-theme` and re-applied via a `data-theme` attribute on `<html>` on load. Toggling swaps ~16 CSS custom properties (see `:root` and `:root[data-theme="dark"]` blocks).
- **Question answering:** each option button toggles selection (click again to deselect). Selecting `hiring !== 'yes'` clears any `driving` answer and hides that question. Municipality is a native select; volume is a native number input (both drive the results the moment they change — no submit step).
- **Results assembly:** results appear once ≥3 questions are answered (see `answered()` / `showResults` logic) — not on a fixed schedule, and not gated behind all 10.
- **Reset:** clears all answers, returns to the empty state.
- No page navigation/routing — everything is one continuously scrolling document with in-page anchors implied by section order (no nav bar; not required per spec).

## State Management
Minimal client state, no backend, no forms submitted anywhere:
```
lang: 'es' | 'en'
theme: 'light' | 'dark'   // persisted to localStorage
answers: {
  type: 'retail'|'food'|'prof'|'mfg'|null,
  entity: 'llc'|'corp'|'sole'|'unsure'|null,
  premises: 'commercial'|'home'|'mobile'|null,
  buildout: 'yes'|'no'|null,
  muni: string,            // key into the municipality table, or '' / 'other'
  vol: number|null,        // expected first-year gross volume
  hiring: 'yes'|'no'|null,
  driving: 'yes'|'no'|null,  // only asked/used if hiring === 'yes'
  exportsvc: 'yes'|'no'|null,
  young: 'yes'|'no'|null,
}
```
The decision logic (`build(answers, lang)` in the DC) is a pure function of `answers` + `lang` — no side effects, no DOM, no network. This maps directly onto the repo's planned Seam A (`decision-tree` module) — port this function's structure (not its literal JS) into that module, sourcing its content from the new YAML collections instead of inline strings.

## Design Tokens

**Colors (CSS custom properties, light / dark):**
| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#F4F2ED` | `#14171B` | page background |
| `--surface` | `#FBFAF7` | `#1B1F24` | cards, top bar, inputs |
| `--surface-2` | `#EAE7E0` | `#232830` | (reserved, table header tint) |
| `--ink` | `#16191C` | `#E8E6E1` | primary text |
| `--ink-2` | `#4B5259` | `#A9AFB6` | secondary text |
| `--ink-3` | `#7A828A` | `#79818A` | tertiary/meta text |
| `--rule` | `#CFCBC2` | `#333A43` | strong dividers, borders |
| `--rule-soft` | `#E2DED6` | `#272D35` | soft dividers |
| `--sello` (teal) | `#0D5C63` | `#5FB8BF` | brand accent, links, "confirmed"-adjacent emphasis, selection |
| `--ambar` | `#B96A00` | `#D9A441` | "secondary" sourcing mark, warnings |
| `--derogado` (red) | `#C22B20` | `#E58080` | "unverified" sourcing mark, stop-level warnings |
| `--verificado` (green) | `#1F7A55` | `#6BB894` | "confirmed" sourcing mark, incentive cards |

**Typography:**
- Headings / UI labels: **Libre Franklin** (400/500/600/700/800)
- Body / long-form copy: **Newsreader** (400/500/600, italic 400) — serif, used for the H1 sub-line, deks, diagram lane subtitles, note bodies inside SVG-adjacent text
- Mono (numbers, meta, uppercase labels, tags): **IBM Plex Mono** (400/500/600)
- Base body: 17px / 1.62 line-height, Newsreader
- H1: `clamp(34px, 5.4vw, 60px)`, weight 800, `-.035em` letter-spacing
- Section H2: `clamp(24px, 3vw, 34px)`, weight 700, `-.028em`
- Section number (1–4): 26px mono, weight 600, teal, no leading zero
- At-a-glance value: 26px Libre Franklin, weight 800, tabular numerals

**Spacing scale in use:** 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 28, 30, 32, 38, 44, 52, 54, 56, 60, 64px (no strict 8pt grid — organic editorial spacing; match values as given per component above rather than rounding to a system).

**Borders:** hairline (1px) throughout; no border-radius anywhere in this design (sharp corners is a deliberate stylistic choice — do not round corners when recreating).

**No box-shadows** are used in the current version.

## Assets
No images or icons. The only graphic is the hand-built SVG process diagram (Section 2) — reproduce as inline SVG or a component; do not rasterize it, since its labels must stay in sync with the bilingual copy.

Fonts loaded via Google Fonts (`Newsreader`, `Libre Franklin`, `IBM Plex Mono`) — self-host or use `@next/font`/Astro's font handling per the target repo's conventions instead of the Google Fonts CDN link if the repo prefers that.

## Files
- `Guia Negocios PR.dc.html` — the full design reference (single file, inline styles, includes the bilingual string table and decision logic in its script). This is the file to read for exact copy, exact colors/spacing, and the full decision-tree logic (methods: `dict()`, `build()`, `patente()`, `diagram()`, `renderVals()`).

---
id: 0002
title: Route redesign, the page rebuilt around the reader's route
labels: [ready-for-agent]
status: open
created: 2026-09-27
---

# Route redesign, the page rebuilt around the reader's route

**Visual reference:** `design/route-redesign/index.html`. Serve it with the `design reference` launch configuration and open `http://localhost:4400/route-redesign/`. Jaime approved it on 2026-09-27. Where this spec and the reference disagree, this spec wins. The reference uses one real answer set, a restaurant in San Juan organized as an LLC, and its step titles, agencies, costs and sourcing marks come from the content.

**Seams:** three, from highest to lowest cost to run.

1. **Seam A**, the pure `decision-tree` module. It already exists. Every new piece of logic in this spec lands there and is tested with `node:test`.
2. **The build output.** The suite already loads `dist/content.json` as its fixture. A new built-page suite reads the built HTML and CSS the same way, for anything static: tokens, contrast, section order, the hero's sample route, print rules.
3. **The browser protocol.** Interaction can't be checked from the build output, and the repo has no browser test runner by design, since dependency install scripts are denied. Each work item below lists exact browser checks an agent runs through the preview tools against a **DOM contract** of `data-*` attributes. The contract is part of the interface and is listed under Implementation Decisions.

---

## Problem Statement

Jaime looked at the running site and said it doesn't look good. The three redesign phases already on the `redesign-phase-1-tokens` branch fixed contrast and the type scale and split the questions into stages. The page still reads as a form with a results box bolted on.

Measured on 2026-09-27 at 1440 by 900:

- The page follows the operating system's dark theme, so on Jaime's machine it has always rendered dark. That is the look he's been judging.
- The three stage buttons render as unstyled browser defaults.
- The question column scrolls inside its own box.
- The results area is empty until three questions are answered. A first-time visitor sees a form and nothing that shows what they get for filling it in.
- The route itself is a flat numbered list. One-time steps, warnings that aren't steps at all, and duties that come back every month all look alike.

A first-time owner lands on the page and can't tell within a few seconds what the tool gives them. When they do get a route, they can't see which part of the process each step belongs to.

## Solution

Rebuild the page's presentation around the route, following the approved reference and the structure StartPermit uses:

- A light, warm page with full-width bands and a 1280px content column, so wide screens have no empty side bars.
- A hero that shows a finished sample route on the first screen, before the reader answers anything.
- Questions on the left, held in place while the reader scrolls. The route sits on the right and fills in as they answer.
- The route grouped into five named phases. Each step is a numbered marker on a line, with the agency and timing under the title and the cost in its own column. Warnings that aren't actions become callouts, and recurring duties get their own phase.
- A summary strip with counts, the patente estimate and the verification date.
- The answers live in the URL, so a route can be copied, shared, reopened and printed.
- Incentives, the process diagram, the entity comparison and the "what we could not verify" section restyled in the same visual language.

The decision tree's behavior doesn't change. The same answers produce the same steps. This spec changes how they're grouped and shown, and adds two small content fields to support that.

## User Stories

1. As a first-time owner, I want to see an example of a finished route on the first screen, so that I know what the tool gives me before I invest time in it.
2. As a first-time owner, I want one obvious button to start, so that I don't have to figure out where the tool is.
3. As a first-time owner, I want a "see an example" button that fills the tool with a real sample, so that I can explore a full route without answering anything.
4. As a skeptical reader, I want to see how many procedures the guide documents, how many municipios have rates, and when it was last verified, so that I can judge whether to trust it.
5. As a reader on a wide monitor, I want the page to use the width sensibly, so that I don't see a narrow column between two empty bars.
6. As a reader whose computer uses dark mode, I want the page to look the way it was designed, so that I don't get a half-tuned dark variant.
7. As a reader answering questions, I want to see which of the three stages I'm in and how many questions each one has left, so that I know how much is left.
8. As a reader, I want answer options as large cards with a one-line explanation where it helps, so that I can choose without guessing what a term means.
9. As a reader, I want the explainer for a hard question one click away next to the question, so that it doesn't clutter the question for people who don't need it.
10. As a reader on a desktop, I want the questions to stay in view while I scroll through a long route, so that I can change an answer and watch the route react.
11. As a reader, I want the route to start filling in as soon as there's enough to say, and until then to show me the shape of what's coming, so that the panel is never a blank box.
12. As a reader, I want the route grouped into phases with plain names, so that I understand which steps belong together.
13. As a reader, I want each step numbered in the order to do it, so that I know what comes first.
14. As a reader, I want the agency and timing under each step's title and the cost aligned in its own column, so that I can scan costs down the page.
15. As a reader, I want the steps that gate everything else to stand out, so that I don't miss the critical path.
16. As a reader, I want steps whose figures aren't confirmed by a primary source to carry a visible mark, so that I don't treat an estimate as fact.
17. As a reader, I want any step where practice contradicts the documents to show that warning without my having to expand anything, so that the most important caveat can't be missed.
18. As a reader, I want to see what each step blocks, so that I don't sign a lease before checking zoning.
19. As a reader, I want steps that need a CPA or an attorney to say so, so that I know when this guide isn't enough.
20. As a reader, I want each step's long explanation hidden until I ask for it, so that the route stays scannable.
21. As a reader, I want warnings that aren't actions, like the Reglamento Conjunto being voided, shown as callouts inside the phase they affect, so that they don't pose as steps I have to complete.
22. As a reader, I want recurring duties like IVU, CRIM and the patente in their own phase with a repeat marker, so that I don't think I'm done with them after the first time.
23. As a reader, I want a summary at the top of my route with the number of procedures, the number of recurring duties, my estimated patente and the verification date, so that I get the answer before the detail.
24. As a reader, I want my route's heading to name my business type, municipio and legal form, so that a printout or shared link says whose route it is.
25. As a reader, I want the route to end with a clear "ready to open" marker, so that I know where the process ends.
26. As a reader, I want the incentives that apply to me shown as cards with the law that creates each one, so that I can look them up or ask about them by name.
27. As a reader, I want a link that reopens my exact answers, so that I can come back later without starting over.
28. As a reader, I want to send my route to a partner or accountant with one click, so that we're looking at the same thing.
29. As a reader, I want to print my route with every detail expanded and nothing else on the page, so that I can take it to an agency.
30. As a reader, I want "start over" to clear my answers and the link, so that a new route doesn't inherit old answers.
31. As a Spanish-first reader, I want everything new on the page in Spanish by default, so that I don't hit English labels.
32. As an English-speaking reader, I want the toggle to switch every new label, phase name and heading without losing my answers, so that I can read the same route in English.
33. As a phone user, I want the page in one column with no sideways scrolling and targets big enough to tap, so that I can use it on the go.
34. As a phone user, I want the button on the last stage to take me to my route, so that I don't have to scroll to find it.
35. As a keyboard user, I want every control reachable and visibly focused, and step details to open with Enter or Space, so that I can use the tool without a mouse.
36. As a screen-reader user, I want the route announced as lists grouped under phase headings, with details that announce whether they're expanded, so that the structure isn't only visual.
37. As a low-vision reader, I want all text to meet WCAG AA contrast, so that I can read it.
38. As a reader who reaches the process diagram, the entity comparison or the list of what couldn't be verified, I want them in the same visual language as the route, so that the page feels like one product.
39. As a maintainer, I want every new grouping and count computed by the pure module and tested, so that the UI can't drift from the logic.
40. As a maintainer, I want the phase of each step stored in the content, so that moving a step between phases is a content edit and not a code change.
41. As a maintainer, I want the hero's sample route built from the same logic and content as the tool, so that it can't go stale.
42. As a maintainer, I want the build output checked for tokens, contrast and print rules, so that visual regressions show up in CI.

## Implementation Decisions

### Visual language

- **Light only.** The automatic dark palette under `prefers-color-scheme: dark` is removed. A dark theme can return later as an explicit toggle. It's out of scope here.
- **Palette "Verde ruta"**, the reference's default. Tokens on `:root`:
  - `--paper #f5f3ee`, `--surface #ffffff`, `--sunk #efece5`
  - `--ink #15181b`, `--ink-2 #474d54`, `--ink-3 #62686f`
  - `--rule #e2ded4`, `--rule-strong #cfcabd`
  - `--brand #0b5a48`, `--brand-hover #084636`, `--brand-tint #e3eee9`, `--on-brand #ffffff`
  - `--mark #f2b233`
  - `--warn-ink #8a5a00`, `--warn-bg #fdf3dc`, `--stop-ink #a4251c`, `--stop-bg #fbe9e6`
  - `--ok #1f6b45`, `--ok-bg #e5f1ea`

  The old `--sello*`, `--ambar`, `--derogado` and `--verificado` tokens go away. The reference's second palette, "Marino y flamboyán", swaps `--brand*`, `--mark` and the grays. It's recorded here only so a later swap is a token edit.
- **Type.** Archivo for display and headings, Public Sans for body, IBM Plex Mono for eyebrows, counts and costs, using tabular numerals for money. These are the same three families already loaded. The reference's sizes are the targets: hero h1 58px on desktop and 38px on phones, section h2 40px, route heading 22px, step title 16px, body 16px, meta 14px, eyebrow 12px uppercase mono.
- **Layout.** Every section is a full-bleed band with an inner `.wrap` of `max-width: 1280px` and a 40px side gutter, 16px at 720px and below. Bands alternate between `--paper` and `--surface`, separated by `--rule`. Breakpoints: two columns above 1080px, one column at 1080px and below, phone rules at 720px and below.
- **Sourcing marks** keep the G-15 rule: primary-sourced steps carry no mark. Secondary and unverified steps carry the reference's pill, with the wording from the existing sourcing-label module, "sin confirmar" and "sin verificar". The reference originally had an "Oficial" pill on primary steps. It was dropped so the marks keep meaning "look twice at this".
- **Markers.** An action step's marker is a 32px circle on a 2px line. Default is an outline with the number. Severity `key` fills it with `--brand`. An action with severity `warn` uses the amber pair, and one with severity `stop` uses the red pair. Recurring steps show ↻ in place of a number.
- **Advisory callouts** use the red pair for severity `stop` and the amber pair for `warn`. Each shows the title in bold, then the note, collapsed behind a "Leer más" / "Read more" toggle when the note runs past two lines.

### Page order and anchors

Header, then hero, then the tool at `#ruta`, then the incentives band at `#incentivos`, then the process diagram at `#proceso`, then the entity comparison at `#entidades`, then the "what we could not verify" section at `#limites`, then the footer.

- **Header:** the brand mark and name, nav links to `#ruta`, `#proceso`, `#entidades` and `#limites`, and the ES/EN toggle. The nav hides at 720px and below.
  - Nav labels: "Arma tu ruta" / "Build your route", "El proceso" / "The process", "Formas legales" / "Legal forms", "Lo que no sabemos" / "What we don't know".
- **The vigencia paragraph** about stale laws cited online moves to the top of `#limites`. The hero shows the research date, and so does the footer.
- **The single-location assumption** (G-20) sits in the tool header, on the right, as in the reference.
- **The incentives band** stays hidden until results exist.

### Content changes

- **Step `phase`**, required, one of `formation | premises | operate | people | recurring`. Invariant: `phase === 'recurring'` exactly when `recurring === true`.
- **Step `kind`** fills the slot reserved in G-02: `action | advisory`, default `action`. An advisory is a warning with no procedure behind it.
- **Phase titles** live in a new content collection keyed by phase id, with `order` and a bilingual `title`. The schema requires exactly the five ids.

  | id | es | en |
  |---|---|---|
  | formation | Forma el negocio | Form the business |
  | premises | El local, antes de firmar | Your location, before you sign |
  | operate | Permisos para operar | Permits to operate |
  | people | Personal y seguro obrero | Staff and workers' insurance |
  | recurring | Lo que se repite | What repeats |

- **Assignment of all 31 steps.** Advisories are marked with *.

  | phase | steps |
  |---|---|
  | formation | entity-sole-proprietor, entity-organize-llc, entity-llc-tax-classification, entity-incorporate-corp, entity-undecided*, ein-federal, merchant-registration |
  | premises | zoning-verification, construction-permit |
  | operate | permiso-unico, reglamento-conjunto-legally-unstable*, fire-inspection, sanitary-license, food-handler-certification, home-based-permiso-unico-question, provisional-patente-occasional-sales, confirm-delegated-hierarchy*, above-3m-obligations-change* |
  | people | employer-registration-dtrh, cfse-policy, cfse-individual-track, drivers-social-security, new-hire-reporting-asume, christmas-bonus-and-21-employee-cliff*, vacation-sick-leave-accrual* |
  | recurring | patente-municipal, crim-personal-property-return, crim-personal-property-return-above-ceiling, ivu-monthly-general, ivu-monthly-b2b-professional, state-annual-fee-survives |

- **Incentive `law`**, optional plain string, the same in both languages. The citation now written after the dash in a title moves into `law`, and the title keeps the rest. Apply the same split to the `en` titles.

  | id | law | es title after the split |
  |---|---|---|
  | act60-export-services | Ley 60 Cap. 3 | Exportación de servicios, 4% fijo |
  | first-semester-provisional-patente | Art. 7.210 | Patente provisional del primer semestre |
  | optional-tax-1022-07 | §1022.07 | Contribución opcional, 6% del bruto |
  | pyme-120-2014-rates | Ley 120-2014 | Tasas PYME de 5%, 10% y 15% |
  | act60-not-applicable | none | La Ley 60 no aplica, y conviene saberlo ya |
  | bde-technical-assistance | none | BDE y la asistencia técnica gratuita que casi nadie usa |
  | pridco-industrial-space | none | PRIDCO, espacio industrial ya zonificado |
  | young-entrepreneur-exemption | none | Joven empresario, exención sobre los primeros $500,000 |

### Seam A additions

These go in the decision-tree module, which stays pure: no DOM, no network, no clock. The shapes came from the prototype:

```ts
type Phase = 'formation' | 'premises' | 'operate' | 'people' | 'recurring';

type RouteStop = StepResult & { number: number | null }; // null for advisories and recurring
type PhaseGroup = { phase: Phase; title: Bilingual; stops: RouteStop[] };

groupByPhase(result: Result, content: Content): PhaseGroup[];
// Phases in `order`, empty phases omitted. Within a phase, buildSequence order is kept.
// One-time action stops are numbered 1..n continuously across phases.

routeSummary(result: Result): { steps: number; recurring: number; patente: PatenteEstimate | null };
// steps = one-time action stops; recurring = stops in the recurring phase.

routeHeading(answers: Answers, content: Content): { title: Bilingual; subline: Bilingual };
// title = the `type` option label, or "Tu negocio" / "Your business" when unanswered.
// subline = municipio label and entity label joined by " · ", unanswered parts omitted;
// entity `unsure` reads "forma legal por decidir" / "legal form undecided".

SAMPLE_ANSWERS: Answers;
// type food, entity llc, premises commercial, buildout no, muni sanjuan, vol 120000,
// hiring yes, driving no, exportsvc no, young no.

answersToQuery(answers: Answers, questions): string;
// Keys in question order, unanswered keys omitted, no leading "?".
answersFromQuery(search: string, questions): Answers;
// Unknown keys ignored. Values outside a question's options dropped.
// vol parsed as a finite number >= 0 or dropped.
```

The freshness module gains a short date label: "6 ago 2026" / "Aug 6, 2026".

### Behavior

- **The URL is the state.** Every answer change calls `history.replaceState` with `answersToQuery`, so no history entry is added per click. On load, `answersFromQuery(location.search)` seeds the answers before the first render. "Empezar de nuevo" / "Start over" clears the query. The language isn't part of the URL.
- **"Ver un ejemplo" / "See an example"** navigates to `?{answersToQuery(SAMPLE_ANSWERS)}#ruta`.
- **The hero's sample card** is rendered at build time from `groupByPhase(buildSequence(SAMPLE_ANSWERS))`. It shows the first four one-time action stops, then "y N trámites más" / "and N more procedures", where N is the rest of `routeSummary().steps`. It shows three stats: steps, recurring, and patente.
- **Proof numbers in the hero** are computed at build time:
  - how many steps the content has
  - how many municipios have patente rate data, which excludes `other`
  - the research date
- **Before results exist**, meaning `hasEnoughAnswers` is false, the route panel shows its heading, the line "Contesta 3 preguntas y tu ruta aparece aquí." / "Answer 3 questions and your route appears here.", and the five phase titles as muted placeholders.
- **The patente stat** reads `$240/año` / `$240/yr` for a positive estimate, `$0` for an exemption, and "Sin estimar" / "Not estimated" when there's no estimate. A non-primary estimate also carries its sourcing pill.
- **What's always visible on a stop:** the title, sourcing pill, agency, timing, cost, the "Bloquea" / "Blocks" line, the professional note, and the practice banner. Only the long `note` sits behind the stop's toggle. Every stop starts collapsed.
- **Option grid:** two columns when a question has an even number of options, one column when odd. One column for every question at 720px and below.
- **Explainers** stay as the G-27 `<details>`. The summary sits on its own line under the question, styled as a link. The reference put it on the right of the label row, but some summaries run past 40 characters, such as "¿Qué cambia de un municipio a otro?", and don't fit there beside a long question.
- **Stage navigation:**
  - The rail shows each stage's number, answered count, total and name, with states `done`, `current` or `todo`.
  - "Continuar" / "Continue" moves to the next stage.
  - On the last stage the button reads "Ver mi ruta" / "See my route" and scrolls the route panel into view.
- **The question column** is `position: sticky; top: 24px` above 1080px and static below.
- **The route header** has "Copiar enlace" / "Copy link" and "Imprimir" / "Print".
  - Copy writes `location.href` to the clipboard and announces "Enlace copiado" / "Link copied" in an `aria-live` region.
  - If the clipboard write rejects, a read-only input with the URL appears, selected, with the status "Copia el enlace" / "Copy the link".
- **Print** hides everything except the route panel and the incentives. Every stop prints expanded.
- **The route ends** with the brand-colored "Listo para abrir" / "Ready to open" bar and the line "Revisa los incentivos antes de radicar." / "Check the incentives before you file."
- **New UI strings** follow the existing pattern: paired `[lang]` spans in the markup, or the tool script's bilingual dictionary for text rendered on the client.

### DOM contract

The browser checks depend on these attributes. Keep existing hooks unless listed as replaced.

| Hook | On |
|---|---|
| `data-hero`, `data-sample-route` | hero section, sample card |
| `data-proof="steps\|municipios\|date"` | hero proof numbers |
| `data-see-example` | the example button |
| `data-questions`, `data-question`, `data-option` with `aria-pressed` | existing, kept; options switch from the `is-selected` class to `aria-pressed` |
| `data-stage-rail`, `data-stage-go`, `data-state="done\|current\|todo"` | rail and its buttons |
| `data-stage-next`, `data-stage-prev`, `data-start-over` | existing, kept |
| `data-route` | the route panel |
| `data-route-empty`, `data-phase-placeholder` | state before results |
| `data-route-heading`, `data-route-subline` | heading text |
| `data-summary="steps\|recurring\|patente\|verified"` | summary stats, value only |
| `data-phase="<id>"` | each phase group |
| `data-stop`, `data-kind`, `data-severity`, `data-sourcing` | each stop or callout |
| `data-stop-num` | marker text: a number or ↻ |
| `data-stop-toggle` with `aria-expanded`, `data-stop-detail` | detail toggle |
| `data-copy-link`, `data-copy-status`, `data-copy-fallback`, `data-print` | route actions |
| `data-incentive`, `data-law` | incentive cards |

These hooks replace `data-glance`, `data-sequence` and `data-recurring`. `data-incentives` stays on the band.

## Testing Decisions

- **A good test here checks what a reader or the next module sees:** which stops land in which phase, which numbers they carry, what the URL holds, which pixels meet contrast. It doesn't check how a function builds its answer, and it doesn't pin CSS values that aren't a decision in this spec.
- **Seam A, in the existing decision-tree suite:**
  - `groupByPhase`, `routeSummary`, `routeHeading`, the query round trip and `SAMPLE_ANSWERS` validity, with the same scenario style as the seven existing scenarios.
  - Prior art: the `stageBreakdown` block. (G-34 retired `partitionRecurring` and its block, since `groupByPhase` now owns the recurring split.)
- **Content, in the existing content-schema suite:**
  - the `phase` and `kind` enums
  - the recurring invariant across all real steps
  - the exact five phase ids
  - the optional `law`
  - Prior art: the G-18 `professional` and G-27 `help` tests.
- **Build output, in a new built-page suite:**
  - It reads the built HTML and every built stylesheet after `pretest`, the same way the decision-tree suite reads `dist/content.json`.
  - It parses `:root` tokens out of the CSS and computes WCAG contrast itself. There are no new dependencies.
- **Browser protocol, for interaction.** Every check below is a JavaScript expression run with the preview's `javascript_tool` and compared to an expected JSON value. Screenshots are supporting evidence. The expression result is the pass or fail.
- **The existing suite has to keep passing untouched**, except for assertions this spec changes on purpose.

### How to run the browser protocol

1. `npm test` and `npm run typecheck` pass first. Both run in CI.
2. Start the site with the preview tool's `cud-guia dev` configuration, `http://localhost:4321`. Start the reference with `design reference`, `http://localhost:4400/route-redesign/`.
3. For each check, set the viewport with `resize_window` to the size given. Use `colorScheme: "dark"` where a check says so. Navigate to the URL given, run the expression, and compare.
4. For visual checks, take a screenshot of the site and the reference at the same viewport and scroll position. Compare the elements the check names: alignment, spacing, type and color. Report any difference larger than 2px or any color that doesn't match a token.
5. The preview pane sometimes times out on screenshots while hidden. Retry once, then rely on the expression results and say so in the report.

`Q` below stands for the sample query, `type=food&entity=llc&premises=commercial&buildout=no&muni=sanjuan&vol=120000&hiring=yes&driving=no&exportsvc=no&young=no`.

## Work items

Each item has one objective, the tests that prove it, and the browser checks that prove the rest. An item is done when its tests are green in CI and every check returns the expected value.

### G-29 · Tokens, light-only palette, bands and page width

**Objective:** the page uses the Verde ruta tokens, ignores the operating system's dark theme, and lays every section out as a full-bleed band with a 1280px inner column.

**Depends on:** nothing.

**Tests, built-page suite:**
- No built stylesheet contains `prefers-color-scheme`.
- None contains `--sello`, `--ambar`, `--derogado` or `--verificado`.
- `:root` defines every token listed under Visual language, with those values.

**Browser checks:**

At 1440×900 with `colorScheme: "dark"`, on `/`:
```js
({ bg: getComputedStyle(document.body).backgroundColor,
   wrap: (r => [Math.round(r.x - (document.documentElement.clientWidth - r.width) / 2), Math.round(r.width)])(document.querySelector('header .wrap').getBoundingClientRect()),
   overflow: document.documentElement.scrollWidth > innerWidth })
```
expects `{"bg":"rgb(245, 243, 238)","wrap":[0,1280],"overflow":false}`. The first `wrap` number is the column's offset from center. It's measured against `clientWidth` because a classic vertical scrollbar takes 15px out of the 1440, so the column sits at x 73, not 80.

At 375×812, the same expression expects `wrap` `[0,375]` and `overflow` false. Also run:
```js
getComputedStyle(document.querySelector('header .wrap')).paddingLeft
```
It expects `"16px"`.

### G-30 · Phases and advisories in the content and in Seam A

**Objective:** every step carries a `phase` and a `kind`, and Seam A groups a result into numbered phases and summarizes it.

**Depends on:** nothing.

**Tests:**
- **Schema:**
  - A step without `phase` fails validation.
  - `kind` rejects values outside `action | advisory` and defaults to `action`.
  - The phase collection must hold exactly the five ids.
- **Content:**
  - Every real step satisfies the recurring invariant.
  - The assignment matches the table in this spec, one assertion per phase listing its step ids.
- **Seam A:**
  - For `SAMPLE_ANSWERS`, `groupByPhase` returns phases `formation, premises, operate, people, recurring`.
    - Action counts are 4, 1, 4, 3, 0.
    - Advisory counts are 0, 0, 1, 2, 0.
    - The recurring phase has 4 stops.
    - Action numbers are 1 through 12 in order. Every advisory and recurring stop has `number: null`.
  - `routeSummary` returns `steps: 12, recurring: 4`, with a patente amount of 240.
  - Scenario 1 of the existing seven, the home-based sole proprietor, has no `premises` phase, since empty phases are omitted.
  - The order of stops inside a phase matches their relative order in `buildSequence`.

No browser checks. This item has no UI.

### G-31 · Answers in the URL

**Objective:** a route can be reopened and shared from its URL, and the URL follows every answer without adding history entries.

**Depends on:** nothing for the pure part. The wiring needs G-33's `aria-pressed` hook.

**Tests, Seam A:**
- `answersToQuery(emptyAnswers())` is `""`.
- `answersToQuery(SAMPLE_ANSWERS)` equals `Q` exactly, in question order.
- Round trip: `answersFromQuery(answersToQuery(a))` deep-equals `a` for `SAMPLE_ANSWERS` and for each of the seven scenario answer sets.
- `answersFromQuery('type=spaceship&muni=sanjuan&foo=1')` gives `type: null, muni: 'sanjuan'`, with every other key null.
- `vol=-5`, `vol=abc` and `vol=` each give `vol: null`. `vol=120000` gives `120000`.

**Browser checks at 1440×900:**

Navigate to `/?Q`, then run:
```js
[...document.querySelectorAll('[data-option][aria-pressed="true"]')].map(b => b.closest('[data-question]').dataset.question + '=' + b.dataset.option).sort()
```
It expects the eight option answers from `Q`, sorted. `muni` and `vol` aren't option buttons, so also check `document.querySelector('[data-question="muni"] select').value === 'sanjuan'` is true.

Then run:
```js
(() => { const h = history.length;
  document.querySelector('[data-question="type"] [data-option="retail"]').click();
  return { type: new URLSearchParams(location.search).get('type'), sameHistory: history.length === h }; })()
```
It expects `{"type":"retail","sameHistory":true}`.

Then run:
```js
(() => { document.querySelector('[data-start-over]').click(); return location.search; })()
```
It expects `""`.

### G-32 · Header and hero with a build-time sample route

**Objective:** the first screen shows the header, the headline, the two calls to action, the computed proof numbers and a sample route built from the real logic.

**Depends on:** G-29, G-30, and G-31 for the example button.

**Tests, built-page suite:**
- The built HTML has exactly one `data-hero`.
- Inside `data-sample-route`, exactly four `data-stop` elements whose Spanish titles are, in order:
  - "Organizar la LLC"
  - "Decidir la clasificación contributiva de la LLC"
  - "Obtener el EIN federal"
  - "Registro de Comerciantes"

  These come from the content through `groupByPhase`, not typed in.
- The "more" line says 8.
- `data-proof="steps"` holds the number of steps in `content.json`.
- `data-proof="municipios"` holds the number of municipio keys other than `other`.
- `data-proof="date"` holds the freshness module's short label.

**Browser checks:**

At 1440×900 on `/`, run:
```js
(() => { const h = document.querySelector('[data-hero]').getBoundingClientRect(); const s = document.querySelector('[data-sample-route]').getBoundingClientRect();
  return { sampleAboveFold: s.bottom <= innerHeight, sideBySide: s.left > h.left + h.width / 2 - 1 }; })()
```
It expects both true.

Click `[data-see-example]`, then check that `location.search.slice(1) === Q && location.hash === '#ruta'` is true.

Visual: compare the header and hero against the reference at 1440×900 and 375×812. Check:
- brand mark
- nav
- language toggle
- h1 wrap and weight
- the brand color on "en orden."
- button heights of 50px
- the proof row rule
- the sample card's header, stats row and footer strip

### G-33 · Question column

**Objective:** the questions read as the reference shows, with a stage rail, option cards, link-style explainers and stage navigation, and they stay in view on desktop.

**Depends on:** G-29.

**Tests:** the existing `stageBreakdown` tests stay green. There's no new logic.

**Browser checks:**

At 1440×900 on `/`, run:
```js
({ sticky: getComputedStyle(document.querySelector('[data-questions]')).position,
   rail: [...document.querySelectorAll('[data-stage-go]')].map(b => b.dataset.state),
   typeCols: getComputedStyle(document.querySelector('[data-question="type"] [role="group"]')).gridTemplateColumns.split(' ').length,
   premisesCols: getComputedStyle(document.querySelector('[data-question="premises"] [role="group"]')).gridTemplateColumns.split(' ').length })
```
It expects `{"sticky":"sticky","rail":["current","todo","todo"],"typeCols":2,"premisesCols":1}`.

On `/?Q`, run:
```js
[...document.querySelectorAll('[data-stage-go]')].map(b => b.dataset.state)
```
It expects `["current","done","done"]`. A page opened from a URL starts on stage 1, and every complete stage other than the current one reads `done`.

On `/`, run:
```js
(() => { const d = document.querySelector('[data-question="entity"] details'); d.querySelector('summary').click(); return d.open; })()
```
It expects true.

At 1024×768, check that `getComputedStyle(document.querySelector('[data-questions]')).position` is `"static"`.

At 375×812 on `/?Q`:
1. Click `[data-stage-next]` until the button reads "Ver mi ruta", then click it once more.
2. Check that `Math.abs(document.querySelector('[data-route]').getBoundingClientRect().top) < 40` is true.

Visual: compare the rail, option cards in their selected and unselected states, the explainer link, and the Continuar row against the reference.

### G-34 · Route panel

**Objective:** the route shows the heading, summary strip, phase groups, numbered stops, callouts, recurring markers and finish bar from the reference, driven only by Seam A.

**Depends on:** G-30 and G-33.

**Tests, Seam A:**
- `routeHeading(SAMPLE_ANSWERS)` gives title `Restaurante / cafetería` and subline `San Juan · LLC`.
- With `entity: 'unsure'` and no municipio, the subline is `forma legal por decidir`.
- With nothing answered, the title is `Tu negocio` and the subline is `""`.
- English variants for each.

**Browser checks:**

At 1440×900 on `/`, run:
```js
({ empty: !document.querySelector('[data-route-empty]').hidden,
   placeholders: document.querySelectorAll('[data-phase-placeholder]').length })
```
It expects `{"empty":true,"placeholders":5}`.

On `/?Q`, run:
```js
({ heading: document.querySelector('[data-route-heading]').textContent.trim(),
   subline: document.querySelector('[data-route-subline]').textContent.trim(),
   summary: Object.fromEntries([...document.querySelectorAll('[data-route] [data-summary]')].map(e => [e.dataset.summary, e.textContent.trim()])),
   phases: [...document.querySelectorAll('[data-route] [data-phase]')].map(p => [p.dataset.phase,
     p.querySelectorAll('[data-stop][data-kind="action"]').length, p.querySelectorAll('[data-stop][data-kind="advisory"]').length]),
   nums: [...document.querySelectorAll('[data-route] [data-stop-num]')].map(e => e.textContent.trim()).join(',') })
```
It expects:
- heading `Restaurante / cafetería`
- subline `San Juan · LLC`
- summary `{"steps":"12","recurring":"4","patente":"$240/año","verified":"6 ago 2026"}`
- phases `[["formation",4,0],["premises",1,0],["operate",4,1],["people",3,2],["recurring",4,0]]`
- nums `1,2,3,4,5,6,7,8,9,10,11,12,↻,↻,↻,↻`

Then run:
```js
(() => { const s = document.querySelector('[data-route] [data-stop][data-kind="action"]'); const t = s.querySelector('[data-stop-toggle]');
  const before = [t.getAttribute('aria-expanded'), s.querySelector('[data-stop-detail]').hidden]; t.click();
  return { before, after: [t.getAttribute('aria-expanded'), s.querySelector('[data-stop-detail]').hidden] }; })()
```
It expects `{"before":["false",true],"after":["true",false]}`.

Check that the zoning stop's "Bloquea" line is visible while collapsed:
```js
document.querySelector('[data-route] [data-phase="premises"] [data-stop]').innerText.includes('Bloquea')
```
It expects true.

Check the sourcing pills:
```js
[...document.querySelectorAll('[data-route] [data-stop][data-sourcing="primary"] .tag')].length
```
It expects 0.

Click the EN toggle, then check that the heading reads `Restaurant / café` and that the first phase title is `Form the business`. Check `location.search.slice(1) === Q` to confirm the answers were kept.

Visual: compare the panel against the reference at 1440×900:
- header and actions
- the four-cell stats strip
- phase eyebrows with rule and count
- marker styles for default, key, warn, stop and recurring
- cost column alignment
- the Reglamento callout
- the finish bar

At 375×812, the cost drops under the meta line as in the reference.

### G-35 · Copy link and print

**Objective:** a reader can copy their route's link and print a clean, fully expanded route.

**Depends on:** G-31 and G-34.

**Tests, built-page suite:** the built CSS has an `@media print` block that:
- hides the header, the hero, `[data-questions]`, and the diagram, entity and limits sections
- forces `[data-stop-detail]` visible

**Browser checks at 1440×900 on `/?Q`:**

Run:
```js
(async () => { document.querySelector('[data-copy-link]').click(); await new Promise(r => setTimeout(r, 300));
  const status = document.querySelector('[data-copy-status]').textContent.trim(); const fb = document.querySelector('[data-copy-fallback]');
  return { status, fallbackOk: !fb || fb.hidden || fb.value === location.href }; })()
```
It expects `status` to be `"Enlace copiado"` or `"Copia el enlace"`, with `fallbackOk` true.

Check that `document.querySelector('[data-print]')` exists and that clicking it calls `window.print`. Stub it first:
```js
(() => { let called = false; const p = window.print; window.print = () => { called = true; };
  document.querySelector('[data-print]').click(); window.print = p; return called; })()
```
It expects true.

### G-36 · Incentive cards and the remaining sections

**Objective:** incentives, the process diagram, the entity comparison, the limits section and the footer use the new visual language, and the old palette is gone from every rendered pixel.

**Depends on:** G-29 and G-30.

**Tests:**
- **Schema:** `law` is an optional string on incentives.
- **Content:** each incentive's `law` and titles match the table in this spec. No incentive title in either language contains an em dash.

**Browser checks at 1440×900 on `/?Q`:**

Run:
```js
({ order: [...document.querySelectorAll('[id]')].map(e => e.id).filter(id => ['ruta', 'incentivos', 'proceso', 'entidades', 'limites'].includes(id)),
   cards: [...document.querySelectorAll('[data-incentive]')].map(c => c.querySelector('[data-law]')?.textContent.trim() ?? null) })
```
It expects `order` to be `["ruta","incentivos","proceso","entidades","limites"]`, and `cards` to be `["Art. 7.210","Ley 120-2014",null,null]`. That's the four incentives `SAMPLE_ANSWERS` yields: first-semester, pyme, act60-not-applicable, bde.

Then check that no rendered element still uses the old teal:
```js
[...document.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e);
  return [s.color, s.backgroundColor, s.borderTopColor, s.fill, s.stroke].some(c => c === 'rgb(10, 95, 107)'); }).length
```
It expects 0.

Visual: compare the incentive cards against the reference. The diagram, entity and limits sections have no reference frame. Check them against the rules in Visual language: band, wrap, eyebrow, h2 size, token colors.

### G-37 · Responsive and accessibility pass

**Objective:** the finished page holds up at every width, meets AA contrast, and works with a keyboard and a screen reader.

**Depends on:** G-29 through G-36.

**Tests, built-page suite:** every one of these text pairs, read from the built `:root`, is at least 4.5:1:
- ink, ink-2 and ink-3 on paper, surface and sunk
- on-brand on brand
- brand on surface and on paper
- brand on brand-tint
- warn-ink on warn-bg
- stop-ink on stop-bg
- ok on ok-bg
- ink on mark

The reference's first `--ink-3`, `#767c83`, measured 3.57:1 on sunk. `#62686f` measures 4.77:1, which is why the spec uses it.

**Browser checks:**

At each of 375×812, 768×1024, 1080×800 and 1440×900, on `/`, on `/?Q`, and on `/?Q` after the EN toggle, run:
```js
document.documentElement.scrollWidth <= innerWidth
```
It expects true every time.

At 375×812 on `/?Q`, run:
```js
[...document.querySelectorAll('button, select, input, [role="button"], summary')].filter(e => e.offsetParent && e.getBoundingClientRect().height < 44).map(e => e.outerHTML.slice(0, 60))
```
It expects `[]`.

Keyboard, at 1440×900:
1. Press Tab from the top of the page.
2. After each press, run `document.activeElement.matches(':focus-visible') && getComputedStyle(document.activeElement).outlineStyle !== 'none'`. It expects true for every control.
3. Reach a `[data-stop-toggle]` and press Enter. Its `aria-expanded` becomes `"true"`.

Screen reader structure: each `[data-phase]` has a heading element followed by an `ol` or `ul`. Run:
```js
[...document.querySelectorAll('[data-route] [data-phase]')].every(p => p.querySelector('h3, h4') && p.querySelector('ol, ul'))
```
It expects true.

## Out of scope

- A dark theme, including an explicit toggle.
- The paid layer: filing requests, checkout, intake. Those belong to the separate business the analysis recommends and live in a separate private repo.
- Indexable guide pages per business type and municipio.
- Putting the language in the URL.
- Any change to what the decision tree returns for a given set of answers.
- A browser test runner in CI.
- The Marino y flamboyán palette, beyond the note that it's a token swap.

## Further Notes

- The reference is a static HTML file with hand-written stops. Its counts match the logic after the corrections made on 2026-09-27: 12 steps, not the 15 first shown, and "y 8 trámites más". Its hero card lists zoning as the fourth stop. Seam A puts the LLC's tax classification there instead, and G-32's test follows Seam A. Treat anything else in the reference that disagrees with the logic as illustrative.
- This work continues on the branch behind PR #8. G-27 and G-28 already shipped there, and this spec restyles both without changing their behavior.
- The hero's sample route and the "see an example" button share `SAMPLE_ANSWERS`. If the content changes the sample's route, the hero changes with it, and G-32's built-page test fails loudly if the first four titles move. That failure is intended: it tells whoever edited the content that the first screen changed.

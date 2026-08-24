# Backlog — Guía de Apertura de Negocios

Decomposition of [0001](0001-guia-apertura-de-negocios.md) into work items, grouped by the repository that will own them. **This file is the migration source**: each row becomes a GitHub issue in `cud-guia` or `cud-agente`. The `GH` column is filled in as issues are created.

`0001` itself does not migrate as a ticket. It stays here as the spec of record, and each GitHub issue links back to it.

**Deadline: 24 August 2026** — 17 days from spec. The milestones below follow the spec's delivery order, which is chosen so that running out of time degrades gracefully: each milestone is demoable on its own.

| Milestone | Meaning | Repo |
|---|---|---|
| `M1 site` | Content extracted, Astro site on Pages. Already better than the artifact. | `cud-guia` |
| `M2 agent` | Agent wired in. The AI-engineering story. | `cud-agente` |
| `M3 eval` | Eval suite and model sweep. What makes the agent credible rather than impressive. | `cud-agente` |

If the agent is not working by roughly day ten, M1 ships alone and the agent is presented as in progress. CI is deliberately absent from this backlog.

**Amendment, 2026-08-07:** Claude Design sync was originally excluded alongside CI, briefly reinstated as G-26, then blocked the same day — see G-26's note. Visual work continues as plain CSS in the Astro project instead.

**Amendment, 2026-08-07 (later the same day) — design handoff arrived.** A full design reference landed outside this backlog's own blocked Claude Design attempt, saved at [`design/handoff/`](../design/handoff/). It's a working prototype, not just visuals: a bilingual dictionary, a `patente()` calculator, a `build()` decision-tree function, and an SVG process diagram, all built on real content from the research document. This turns several tickets below from "design from scratch" into "port an existing reference" — see the per-ticket notes. It does not cover everything: G-15's `practice.contradicted` treatment has no design yet, and the countdown originally specified in G-14 was deliberately cut in the handoff (confirmed by Jaime — see G-14's note).

## Labels

Carried from [README.md](README.md): `needs-verification`, `research`, `blocked-external`. Added for GitHub: `content`, `logic`, `ui`, `i18n`, `infra`, `test`, `guardrail`.

`needs-verification` marks issues that put unconfirmed claims in front of a reader. They are not blocked by it — the whole sequencing decision is that unverified content is what gets demonstrated on the 24th — but they are the ones Alan is being asked about, and they must be findable as a set.

---

## `cud-guia` — site, content, research

| ID | GH | Title | Labels | Depends on |
|---|---|---|---|---|
| G-01 | | Bootstrap repo, commit research document first | `infra` | — |
| G-02 | | Content schema: collections + Zod, `sourcing`/`practice`, reserved `kind` | `content` | G-01 |
| G-03 | | Extract research into `content/*.yaml` | `content` `needs-verification` | G-02 |
| G-04 | | Build `content.json`, publish as static asset on Pages | `infra` `content` | G-03 |
| G-05 | | Build fails on any claim missing its sourcing mark | `content` `test` | G-02 |
| G-06 | | `decision-tree` module — pure, no DOM, no network, no clock | `logic` | G-02 |
| G-07 | | Node test suite over the ported decision-tree module | `test` `logic` | G-06 |
| G-08 | | Ten-question flow producing a personal sequence | `ui` `logic` | G-06 |
| G-09 | | Patente municipal estimator from municipio + volume | `logic` `needs-verification` | G-06 |
| G-10 | | Process overview diagram: whole shape, parallelism, dominant step | `ui` | G-04 |
| G-11 | | Step cards: agency, deadline, cost, what it blocks | `ui` `content` | G-04 |
| G-12 | | Entity comparison — DBA vs LLC vs corporación | `content` `needs-verification` | G-03 |
| G-13 | | Recurring obligations listed separately from one-time | `ui` `content` | G-11 |
| G-14 | | Act 60 relevance gate (no countdown — cut 2026-08-07) | `content` `needs-verification` | G-03 |
| G-15 | | Sourcing marks in the UI, `practice.contradicted` most prominent | `ui` `content` | G-02 |
| G-16 | | Permanent "what I could not verify" section | `ui` `content` | G-15 |
| G-17 | | Research date and freshness stamp | `ui` `content` | G-15 |
| G-18 | | Mark decisions that need a CPA or attorney | `content` | G-03 |
| G-19 | | Bilingual: Spanish default, toggle preserves answers | `i18n` `ui` | G-06 |
| G-20 | | State the single-location assumption in the UI | `ui` `content` | G-08 |
| G-21 | | Chat widget: one Preact island, docked per step, carries context | `ui` | G-08, A-03 |
| G-22 | | Page fully usable before any JavaScript loads | `ui` | G-08 |
| G-23 | | Attribution format for a verifier's correction | `content` `blocked-external` | G-15 |
| G-24 | | Deploy to GitHub Pages | `infra` | G-04 |
| G-25 | | Privacy footer stating what is and is not logged | `ui` | A-09 |
| G-26 | | Design sync: push the page shell to a Claude Design project for visual iteration | `ui` `blocked-external` | G-01 |

### Notes on specific items

**G-01** — The research document is the asset: ~1,240 lines, 170 cited sources, built from consolidated statute texts. It is committed before anything else and treated as the thing under version control that matters. Everything else in both repos is presentation.

**G-02** — Two orthogonal fields, not one scale. `sourcing: primary | secondary | unverified` is document provenance; `practice: {status, by, at}` is practitioner knowledge. A claim can be `primary`-sourced and practically wrong at the same time, and that combination is the most valuable content on the page. The design handoff's sourcing marks (`vt()` in `design/handoff/`) are inline HTML spans inside prose, not structured per-claim fields — extracting into this schema is real restructuring work, not a copy.

**G-05** — This is the mechanism that makes G-03's `needs-verification` label safe: an unmarked claim cannot reach production, so the risk is a *visible* unverified figure, never an invisible one.

**G-06 / G-07** — Seam A: a pure function, answers plus content in, result out. No DOM, no network, no clock.

**Resolved, 2026-08-08:** neither "the current artifact" nor its 44-assertion suite could be located — only two untested design references exist (`design/mockup/`, `design/handoff/`). Jaime's call: the design handoff (`design/handoff/`) is canonical. G-06 ports its `build()`/`patente()`/`dict()` logic, stripped of the `React.createElement` rendering it's currently coupled to. G-07 is no longer a port of an existing suite — it's a new Node suite written against the ported module, aimed at the same shape the spec describes (the seven scenarios, dictionary key parity, cross-language leakage) since that shape is still the right coverage target, even though the original suite it was drawn from is not in hand.

**G-09** — Carries the San Juan $12,500 exemption, the 30-day opening-semester notification, the CRIM $50,000 exemption that must be requested, and the 16–35 exemption on the first $500,000. Municipal rates vary by ordinance; rates that could not be confirmed must surface as uncertain rather than being rendered as plain numbers. The handoff's `patente()` already implements exactly this — San Juan's tiers, the $25 minimum, Ponce's and Camuy's tiers, a `verified` flag per municipality — ready to port directly into the pure module.

**G-08 / G-10** — Both fully specified in the handoff: the ten questions and their branching (`driving` only asked if `hiring === 'yes'`), the ≥3-answered threshold for showing results, and the full SVG diagram (two converging lanes, the ordering-rule callout, the parallel-obligations lane, the week 0/2/6/14+ timeline). Porting is mechanical — translating `React.createElement` calls into Astro-native markup/inline SVG — not a redesign.

**G-11** — The handoff's `steps` array carries agency (`ag`), timing (`when`), and cost (`cost`) per the ticket title, plus a severity flag (`key`/`warn`/`stop`). "What it blocks" isn't a structured field — it's implicit in step ordering and mentioned in prose ("no puede radicar sin...").

**Resolved, 2026-08-08:** gave it a structured field after all, but a small, prose-length one rather than a step-id dependency graph — `blocks: Bilingual`, optional, on `stepSchema` (`src/lib/content-schema.ts`). The handoff's blocking relationships are few (Registro de Comerciantes → Permiso Único/CFSE; zoning → signing the lease; construction permit → the use permit and Permiso Único; Permiso Único → opening; undecided entity → everything downstream) and already named loosely enough in prose ("todo lo que sigue") that a real graph would manufacture structure the content doesn't have. Populated on five steps in `content/steps.yaml`; rendered as a `→ Bloquea: …` line in teal mono on the step card (`src/scripts/tool.ts`), between the agency/timing/cost meta line and the note, so a reader sees the blocking step 11 asked for without reading the paragraph. While wiring this up, found that `src/pages/index.astro`'s scoped `<style>` block was never actually applying to the results panel — Astro only stamps its scoping attribute onto elements present in the static template, and the entire step/glance/incentive-card markup is built client-side via `innerHTML` in `tool.ts`, so `.step`, `.step-meta`, `.mark`, `.incentive-card`, etc. had been unstyled since G-08. Fixed by wrapping those selectors in `:global()`.

**G-12** — Not covered by the handoff. DBA/LLC/corporación differences exist only as inline notes inside sequence steps (the `S.entity` branches in `build()`), not as a standalone comparison the way municipalities get one in Section 3. Still needs its own design pass.

**Resolved, 2026-08-08:** added as its own collection, `content/entities.yaml` (schema: `entityFormSchema` in `src/lib/content-schema.ts`), rather than folded into the existing `entity-*` steps — those only ever surface the one branch a reader already picked, and this ticket is explicitly the side-by-side a reader wants *before* answering question 2. Rendered as Section 3 on `src/pages/index.astro`, a plain server-rendered table (liability shield, filing, default PR tax treatment, formation cost, annual obligation) with a note per row for the caveats that don't fit a cell — no client JS, since it doesn't depend on the reader's answers. `sourcing` on the LLC and corporación rows deliberately matches the `unverified` mark already on their corresponding steps (`entity-organize-llc`, `entity-incorporate-corp`): the *annual* fee is confirmed on two `.pr.gov` portals, but the *formation* fee (the ~$250 LLC / ~$150 corp figures) is not confirmed on any primary source, and one `sourcing` field can't carry two different confidence levels.

**G-13** — Partially covered. The handoff's diagram has a distinct "CUMPLIMIENTO RECURRENTE" lane separating recurring obligations visually, but the results step list interleaves recurring items (monthly IVU, annual CRIM) with one-time steps rather than grouping them. Decide whether the diagram's separation is enough or the step list needs its own recurring/one-time split.

**Resolved, 2026-08-24:** the step list needed its own split — the diagram's lane only separates *possible* recurring obligations in the abstract shape of the process, not a given reader's actual sequence. Added `partitionRecurring()` to `src/lib/decision-tree.ts`, a pure function over an already-built `Result.steps` (same seam as the rest of G-06, tested first per G-07's pattern) that groups by the `recurring` flag `content/steps.yaml` already carried since G-11, preserving each group's original relative order. `src/scripts/tool.ts` renders the two groups as separate lists under a new "Obligaciones recurrentes" section in `src/pages/index.astro`, reusing the existing step-card markup and severity styling; the only visual difference is the marker in `.step-num` — a sequence number for the one-time list, `↻` for the recurring one, since a recurring duty has no "step N" to be.

**G-14** — Countdown cut 2026-08-07, confirmed by Jaime. The handoff's `dict()` still carries the countdown strings (`al1tag`, `al1body`, `cdDays`, `cdClosed`) but the rendered markup only shows the second alert ("most guidance online is out of date") — the countdown one was deliberately dropped. Port the relevance gate (the `S.exportsvc` branching in `build()`) without reviving the countdown UI; drop the unused dictionary strings during the YAML extraction rather than carrying them forward.

**Resolved (retroactively), 2026-08-24:** already done. The `exportsvc` branching landed as part of the G-04..G-09 decision-tree port (`incentiveIds()` in `src/lib/decision-tree.ts`, commit 717a06d) without this ticket ever being called out by name — `content/incentives.yaml` only ever carried `act60-export-services` and `act60-not-applicable`, and no countdown string was extracted into any `content/*.yaml` file at any point, so there was nothing left to drop. `test/decision-tree.test.ts` scenarios 1, 2, 3, 4, 5, and 6 already cover all three branches (yes / no / unanswered). No code changed for this ticket.

**G-15** — The biggest remaining design gap, and the one Alan's meeting is actually about. The handoff's `vt()` fully covers the *sourcing* axis (confirmed/secondary/unverified, green/amber/red) — ready to port. It has no treatment at all for the *practice* axis or a `contradicted` state; nothing in the design distinguishes "statute says X, practice says Y" from a plain unverified claim. This needs original design work, not porting.

**G-16** — Ready to port. The handoff's `gaps` array and its rendered "Lo que no pude verificar" section already match this ticket directly.

**G-19** — Ready to port. `lang` and `S` (answers) are already separate state slices in the handoff, so switching language never touches answers — satisfies the ticket as specified.

**G-20** — Not covered by the handoff. No single-location disclaimer appears anywhere in the design; still needs to be written and placed.

**G-21** — Depends on A-03 for the endpoint contract only. Build the island against a stubbed stream so M1 does not wait on M2.

**G-22** — The handoff is fully client-rendered and stateful (a single `Component` class re-rendering everything, including the top bar, on `setState`), which is the opposite of this ticket's requirement. Porting means designing an SSR default (empty state, no answers) that Astro renders server-side, then re-adding the question panel, language toggle, and theme toggle as small islands or vanilla JS on top — real architecture work, not a straight port. The handoff's own README already anticipates this ("candidates for small islands or vanilla JS").

**G-23** — Blocked on the 24th by design. The format ships; the first correction arrives at the meeting.

**G-26** — Blocked, 2026-08-07. The intended flow: push a self-contained preview of the page shell to a Claude Design project as a `design/` component library kept in the repo, edit visually, pull changes back and translate into `src/pages/index.astro` by hand. Blocked because this environment's Claude Design authorization is a separate identity from Jaime's `claude.ai` account — projects created on either side are invisible to the other, and `/design-login` (the fix) isn't available here. `design/page-shell/index.html` and the orphaned `pr-business-guide` project are stranded artifacts of the attempt; the directory stays as a placeholder in case a linkable session becomes available later. Visual work proceeds as plain CSS against the Astro dev server instead, unblocked and not tracked as a separate ticket.

---

## `cud-agente` — API and evals

| ID | GH | Title | Labels | Depends on |
|---|---|---|---|---|
| A-01 | | Bootstrap Hono on Cloudflare Workers | `infra` | — |
| A-02 | | Fetch and cache `content.json` from Pages at startup | `infra` | A-01, G-04 |
| A-03 | | `/chat` endpoint with SSE streaming | `logic` | A-01 |
| A-04 | | Prompt assembly: full corpus, no retrieval, page's vocabulary | `logic` | A-02 |
| A-05 | | Agent answer contract enforced in the prompt | `guardrail` | A-04 |
| A-06 | | Answer in the language the reader wrote in | `i18n` | A-04 |
| A-07 | | Guardrails: per-IP rate limit, turn cap, output cap, CORS | `guardrail` | A-03 |
| A-08 | | Monthly spend ceiling that fails closed with an honest message | `guardrail` | A-07 |
| A-09 | | Log question text and tree state — no IP, no session, no cookies | `infra` | A-03 |
| A-10 | | Functional tests over `/chat` | `test` | A-07 |
| A-11 | | Eval: ~20 grounding cases, 5 must-refuse cases | `test` | A-05 |
| A-12 | | Model sweep across candidates, pick on eval results | `test` `research` | A-11 |

### Notes on specific items

**A-01** — Workers over FastAPI on hosting behavior: no cold starts, 100k requests/day free, no wall-clock limit, network wait not charged against CPU budget — so SSE streaming is viable on the free plan. A Render free-tier service sleeps after ~15 minutes and wakes in 30–60 seconds, which is the wrong first impression for a demo link sent to one busy reader. *Reversal condition: if TypeScript friction consumes time that should go to content and prompt work, switch to FastAPI and accept cold starts.*

**A-02** — `cud-guia` owns the content; this repo consumes it over HTTP. One source of truth for both surfaces, and content edits reach the agent on its next restart. Do not vendor a copy.

**A-04** — No retrieval. The corpus is ~34k tokens against 262k+ context on every candidate model. Retrieval would solve a constraint that does not exist and introduce one this product cannot absorb: a retrieved fragment can arrive separated from the caveat attached to it in the source, so a figure appears without its `unverified` mark. Full context keeps every claim beside its provenance.

**A-05** — The agent may reason, compare, and explain freely. It may not state any number, deadline, agency name, or citation that is not in the corpus. An `unverified` figure is never asserted as fact. LLC tax classification, Permiso Único specifics, and Ley 60 route to a CPA or attorney. The Permiso Único renewal interval is never stated — its governing regulation has been in litigation since 2023.

**A-11** — The five refusals are the point: OGPe's fee schedule, the Permiso Único renewal interval, CFSE premium rates, 2026 DTRH rates, and whether a home-based business needs a Permiso Único. On these, a confident answer is a failing grade. This is the primary filter on model selection, which is why A-12 depends on it rather than the reverse.

**A-12** — Model identity is a configuration string, which is what makes the eval a model-selection instrument rather than a regression test. No model is chosen in the spec; the eval chooses it. Open question worth settling here: whether `:free` variants support prompt caching is undocumented — it barely affects cost at these prices, but it affects latency.

---

## Critical path

Only G-01 and A-01 have no dependencies. The longest chain to a demoable M1 is:

```
G-01 → G-02 → G-03 → G-04 → G-11 → G-13
                └──→ G-06 → G-08 → G-19 / G-22
```

G-03 is still the widest item in the backlog, though less likely to slip than before: the design handoff (`design/handoff/`) already drafted most of the copy this ticket needs to produce. What's left is restructuring that copy into the `content/*.yaml` schema with `sourcing`/`practice` as real fields rather than inline HTML tags — and, separately from G-03, designing the `practice.contradicted` treatment that G-15 still has no reference for at all (see G-15's note). If a day is going to be lost now, it is more likely lost there than in G-03 itself.

M2's chain is short (`A-01 → A-03 → A-04 → A-05`) but cannot start meaningfully until G-04 publishes real content for A-02 to fetch.

## Out of scope

Recorded here so it is not re-litigated per issue: multi-location and multi-municipality businesses; any transactional capability; construction permits beyond acknowledging they precede the use permit; a CMS; authentication and saved progress; the buyer-side and seller-side acquisition tools discussed with Alan; enumerating IVU exemptions; automated freshness monitoring of the underlying law.

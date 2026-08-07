# Backlog — Guía de Apertura de Negocios

Decomposition of [0001](0001-guia-apertura-de-negocios.md) into work items, grouped by the repository that will own them. **This file is the migration source**: each row becomes a GitHub issue in `cud-guia` or `cud-agente`. The `GH` column is filled in as issues are created.

`0001` itself does not migrate as a ticket. It stays here as the spec of record, and each GitHub issue links back to it.

**Deadline: 24 August 2026** — 17 days from spec. The milestones below follow the spec's delivery order, which is chosen so that running out of time degrades gracefully: each milestone is demoable on its own.

| Milestone | Meaning | Repo |
|---|---|---|
| `M1 site` | Content extracted, Astro site on Pages. Already better than the artifact. | `cud-guia` |
| `M2 agent` | Agent wired in. The AI-engineering story. | `cud-agente` |
| `M3 eval` | Eval suite and model sweep. What makes the agent credible rather than impressive. | `cud-agente` |

If the agent is not working by roughly day ten, M1 ships alone and the agent is presented as in progress. Claude Design sync and CI are deliberately absent from this backlog.

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
| G-07 | | Port the existing 44-assertion Node suite unchanged | `test` `logic` | G-06 |
| G-08 | | Ten-question flow producing a personal sequence | `ui` `logic` | G-06 |
| G-09 | | Patente municipal estimator from municipio + volume | `logic` `needs-verification` | G-06 |
| G-10 | | Process overview diagram: whole shape, parallelism, dominant step | `ui` | G-04 |
| G-11 | | Step cards: agency, deadline, cost, what it blocks | `ui` `content` | G-04 |
| G-12 | | Entity comparison — DBA vs LLC vs corporación | `content` `needs-verification` | G-03 |
| G-13 | | Recurring obligations listed separately from one-time | `ui` `content` | G-11 |
| G-14 | | Act 60 relevance gate + Ley 38-2026 countdown | `content` `needs-verification` | G-03 |
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

### Notes on specific items

**G-01** — The research document is the asset: ~1,240 lines, 170 cited sources, built from consolidated statute texts. It is committed before anything else and treated as the thing under version control that matters. Everything else in both repos is presentation.

**G-02** — Two orthogonal fields, not one scale. `sourcing: primary | secondary | unverified` is document provenance; `practice: {status, by, at}` is practitioner knowledge. A claim can be `primary`-sourced and practically wrong at the same time, and that combination is the most valuable content on the page.

**G-05** — This is the mechanism that makes G-03's `needs-verification` label safe: an unmarked claim cannot reach production, so the risk is a *visible* unverified figure, never an invisible one.

**G-06 / G-07** — Seam A. The existing suite covers seven scenarios plus dictionary key parity and cross-language leakage, and it already runs through exactly this interface. It should survive the Astro migration without edits — if it needs edits, the seam moved and that is worth knowing.

**G-09** — Carries the San Juan $12,500 exemption, the 30-day opening-semester notification, the CRIM $50,000 exemption that must be requested, and the 16–35 exemption on the first $500,000. Municipal rates vary by ordinance; rates that could not be confirmed must surface as uncertain rather than being rendered as plain numbers.

**G-21** — Depends on A-03 for the endpoint contract only. Build the island against a stubbed stream so M1 does not wait on M2.

**G-23** — Blocked on the 24th by design. The format ships; the first correction arrives at the meeting.

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

G-03 is the widest item in the backlog and the one most likely to slip — it is the entire research document reduced to structured content, by one person, in a language the toolchain does not help with. Everything visual downstream waits on it. If a day is going to be lost, lose it here rather than discovering the loss at G-11.

M2's chain is short (`A-01 → A-03 → A-04 → A-05`) but cannot start meaningfully until G-04 publishes real content for A-02 to fetch.

## Out of scope

Recorded here so it is not re-litigated per issue: multi-location and multi-municipality businesses; any transactional capability; construction permits beyond acknowledging they precede the use permit; a CMS; authentication and saved progress; the buyer-side and seller-side acquisition tools discussed with Alan; enumerating IVU exemptions; automated freshness monitoring of the underlying law.

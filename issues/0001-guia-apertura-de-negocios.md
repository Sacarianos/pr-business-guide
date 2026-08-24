---
id: 0001
title: Guía de Apertura de Negocios en Puerto Rico
labels: [ready-for-agent]
status: open
created: 2026-08-07
due: 2026-08-24
---

# Guía de Apertura de Negocios en Puerto Rico

**Deadline: 24 August 2026** — the CUD meeting. The build ships *before* Alan sees anything; he is shown the finished product at the meeting rather than the artifact beforehand. Seventeen days from spec.

**Seams settled:** two, one per repository — the `decision-tree` module and the `/chat` endpoint. See [Testing Decisions](#testing-decisions).

---

## Problem Statement

Someone in Puerto Rico who wants to open a business cannot find out what the process actually is. The information exists, but it is scattered across a dozen agencies, written in the language of statutes rather than of shopkeepers, and — critically — **most of what is published online is wrong**. Guides cite Ley 113-1974 for the patente municipal, a statute repealed in 2020. They state that corporations must file an annual report, abolished for 2025 onward. They quote Act 60 terms amended in 2026.

The result is that a would-be merchant either pays a professional to tell them what a well-written page could have, or proceeds on stale advice and discovers the error after signing a lease or missing a deadline that cost them a semester of exempt patente.

The same problem shapes what a *reader* can trust: when every guide sounds equally confident, there is no way to tell a figure traced to the statute from one someone guessed. And there are genuine unknowns — OGPe publishes no fee schedule; the Permiso Único's governing regulation has been in litigation since 2023 — which every existing guide papers over rather than admitting.

## Solution

A bilingual, single-page guide that assembles the reader's actual sequence from ten questions, and an agent that answers follow-up questions without inventing facts.

Two things distinguish it from what exists:

**Every claim carries its provenance.** A figure traced to the statute looks different from one taken from a law firm's blog, which looks different from one nobody could confirm. The reader can see which is which, and the "what I could not verify" section is permanent and prominent rather than hidden.

**Practitioner knowledge is modeled as a first-class citizen, separate from document provenance.** When someone who files these permits weekly says the statute says one thing but practice is another, that contradiction is the most valuable content on the page — not an awkward exception to be smoothed over.

## User Stories

**Comerciante — orientation**

1. As a comerciante, I want the guide in Spanish by default, so that I am not reading my own country's law in a second language.
2. As a bilingual reader, I want a language toggle that preserves my answers, so that I can switch without starting over.
3. As a comerciante, I want to see the whole process as one diagram before answering anything, so that I know how large the task is before I commit to it.
4. As a comerciante, I want to see which parts run in parallel, so that I do not serialize work that could overlap.
5. As a comerciante, I want to know which single step dominates the timeline, so that I start it first.

**Comerciante — my path**

6. As a comerciante, I want to answer questions about my own situation, so that I get my sequence rather than a generic checklist.
7. As a retailer, I want steps that apply to inventory and premises, so that I am not reading about export-services decrees.
8. As a restaurateur, I want the health and sanitary requirements surfaced, so that I can plan for the inspection cycle that will dominate my timeline.
9. As a consultant, I want to know that my IVU rate is likely 4% rather than 11.5%, so that I neither overcharge my clients nor misfile.
10. As a comerciante, I want each step to name the agency, the deadline, and the cost, so that I can act on it without a second search.
11. As a comerciante, I want to know which steps block which, so that I do not discover a missing prerequisite at the counter.
12. As a comerciante, I want to be told that the Registro de Comerciantes must exist *before* the Permiso Único application, so that I do not sequence them the way most guides imply.
13. As a comerciante, I want a realistic elapsed-time estimate, so that I can plan a lease start date.
14. As a comerciante with no entity yet, I want the consequences of DBA vs LLC vs corporación explained plainly, so that I can decide.
15. As someone forming an LLC, I want to be warned that a Puerto Rico LLC is taxed as a corporation by default, so that I do not carry a mainland assumption into a filing.

**Comerciante — money**

16. As a comerciante, I want my patente municipal estimated from my municipio and my volume, so that I see a number rather than a formula.
17. As a comerciante in San Juan under $12,500 of volume, I want to learn I am exempt, so that I do not budget for a tax I do not owe.
18. As a new comerciante, I want to know the opening semester's patente is exempt if I notify within 30 days, so that I do not forfeit it by being late.
19. As a small retailer, I want to know the CRIM $50,000 exemption exists and must be requested, so that I do not lose it by assuming it is automatic.
20. As a comerciante, I want the recurring obligations listed separately from the one-time ones, so that I know what never ends.
21. As a young comerciante, I want to know about the 16–35 exemption on the first $500,000, so that I can pursue what is likely my largest available incentive.
22. As a comerciante selling locally, I want to be told plainly that Act 60 does not apply to me, so that I stop reading about it.

**Comerciante — trust**

23. As a comerciante, I want to see how well-sourced each figure is, so that I know which numbers to double-check.
24. As a comerciante, I want the guide to say when it could not verify something, so that I do not act on a confident guess.
25. As a comerciante, I want to be told when a rate for my municipio is uncertain, so that I check the ordinance before budgeting.
26. As a comerciante, I want to be told when the statute and actual practice disagree, so that I plan for what will happen rather than what is written.
27. As a comerciante, I want to know when the research was done, so that I can judge whether it has gone stale.
28. As a comerciante, I want to be told which decisions need a CPA or attorney, so that I know where self-service ends.

**Comerciante — the agent**

29. As a comerciante reading a step, I want to ask a question about *that step*, so that I do not have to re-explain my situation.
30. As a comerciante, I want the agent to already know my municipio, business type, and volume, so that its answer is about me.
31. As a comerciante, I want the agent to answer in the language I wrote in, so that the conversation is natural.
32. As a comerciante, I want the agent to refuse to invent a fee it does not know, so that I can trust the fees it does give.
33. As a comerciante, I want the agent to use the same words as the page, so that it feels like one product.
34. As a comerciante, I want responses to stream, so that I am not staring at a spinner.
35. As a comerciante on a phone with a weak connection, I want the page usable before any JavaScript loads, so that I am not blocked by my signal.

**Jaime — owner**

36. As the owner, I want content in editable files separate from code, so that I can correct a fee without touching logic.
37. As the owner, I want the build to fail on content missing its sourcing mark, so that an unmarked claim cannot reach production.
38. As the owner, I want an eval suite I can point at several models, so that model choice is measured rather than guessed.
39. As the owner, I want the eval to fail a model that answers a question it should refuse, so that confident invention is caught before users see it.
40. As the owner, I want to see what people actually ask, so that I learn what the guide is missing.
41. As the owner, I want hosting to cost nothing at demo volume, so that the project has no burn.

**Alan — verifier**

42. As a verifier, I want the unverified claims listed explicitly, so that I can answer the specific questions rather than review everything.
43. As a verifier, I want my correction attributed and dated, so that a future reader knows where it came from and how old it is.

## Implementation Decisions

**Repositories.** Two. `cud-guia` holds the site, the content, and the research document. `cud-agente` holds the API and the eval suite. The guide is Jaime's, published under his name; CUD verifies and may link to it, but does not own it.

**Content is published, not duplicated.** `cud-guia` owns `content/*.yaml` and publishes a built `content.json` as a static asset on GitHub Pages. `cud-agente` fetches that URL at startup and caches it. One source of truth for both surfaces; content edits reach the agent on its next restart.

**Site.** Astro, static output, deployed to GitHub Pages. Zero JavaScript by default — the diagram, tables, and reference sections are server-rendered HTML. The decision-tree logic lives in a pure module with no DOM and no network access, imported by the page. Content collections with Zod schemas replace a hand-written validator.

**Chat widget.** A single Preact island (~3KB), the only hydrated component on the page. Markdown rendering via a minimal renderer, not a full parser. Attached per-step rather than as a floating bubble, opening a docked panel with the step already in context — so the agent begins knowing which step, which municipio, and which archetype the reader is looking at.

**API.** Hono on Cloudflare Workers. Chosen over FastAPI on hosting behavior: Workers has no cold starts (V8 isolates), allows 100,000 requests/day free, imposes no wall-clock limit on HTTP responses, and does not charge network wait against its CPU budget — so SSE streaming is viable on the free plan. A Render free-tier FastAPI service sleeps after ~15 minutes and wakes in 30–60 seconds, which is the wrong first impression for a demo link sent to one busy reader. *Reversal condition: if TypeScript friction consumes time that should go to content and prompt work, switch to FastAPI and accept cold starts.*

**The API's primary job is holding the OpenRouter key.** There is no browser-safe key mechanism, so the service is mandatory regardless of how thin it is. Everything else it does — rate limiting, prompt assembly, streaming — is secondary.

**LLM access.** OpenRouter. Model identity is a configuration string, which makes the eval a model-selection instrument rather than a regression test. No model is chosen in this spec; the eval chooses it.

**No retrieval.** The corpus is ~34k tokens. Every candidate model, free tier included, offers 262k or more context. Retrieval would add an embedding pipeline and a chunking strategy to solve a constraint that does not exist — and would introduce a correctness risk this product cannot absorb: a retrieved fragment can arrive separated from the caveat attached to it in the source, so a figure appears without its "unverified" mark. Full context keeps every claim beside its provenance. Revisit only if the corpus grows to include full statute texts or all 78 municipal ordinances, and then with plain vector RAG over the document's existing section headings — not a graph store, since the one graph-shaped relationship (which step blocks which) is already encoded in the decision logic.

**Sourcing is two orthogonal fields, not one scale.**

```yaml
sourcing: primary | secondary | unverified     # document provenance
practice:                                       # practitioner knowledge, optional
  status: confirmed | contradicted | unknown
  by: "Alan Taveras / CUD"
  at: 2026-08-24
```

A single scale cannot express *"the statute says X but in practice it is Y"* — that claim is `primary`-sourced and practically wrong at the same time. When `practice.status` is `contradicted`, the UI treats it as the most prominent state on the page, not an exception.

**Step remains untyped, with a slot reserved.** Steps are heterogeneous — actions, artifacts, recurring duties, and decisions — but typing them (`Trámite` / `Obligación` / `Decisión`) is deferred. The schema reserves an optional `kind` field so adding it later is additive rather than a migration.

**Single-location assumption, stated aloud.** The flow assumes one commercial local in one municipio. The statute does not: business volume is attributed per municipality, merchant registration is per location, and the municipal 1% IVU follows the location of the sale. Modeling this correctly requires per-municipality volume attribution that a ten-question flow cannot collect. The UI states the limit rather than being quietly wrong.

**Agent answer contract.** The agent may reason, compare, and explain freely. It may not state any number, deadline, agency name, or statutory citation that is not in the corpus. A figure marked `unverified` is never asserted as fact. Anything touching LLC tax classification, Permiso Único specifics, or Ley 60 routes to a CPA or attorney. The Permiso Único renewal interval is never stated — its governing regulation is in litigation.

**Guardrails.** Per-IP rate limiting, a cap on turns per conversation, a cap on output tokens, a hard monthly spend ceiling that fails closed with an honest message, and CORS restricted to the Pages origin.

**Logging.** Question text and tree state are stored. No IP addresses, no session identifiers, no cookies. The footer says so in plain language.

**Sequencing.** The build completes before Alan sees it; the demo happens at the 24 August meeting, not over LinkedIn beforehand. This trades earlier verification for a stronger demonstration and a better verification setting — five specific questions asked face to face are more likely to get real answers than the same five in a message to a busy reader.

Two consequences follow. First, the 24th is a **deadline, not a checkpoint**, and seventeen days is tight for a solo build in an unfamiliar language. Second, **unverified content is now what gets demonstrated** — which promotes the sourcing marks and the "what I could not verify" section from a nice touch to the thing that makes showing unchecked research to the person best placed to catch errors a deliberate act rather than a careless one.

**Delivery order — every stopping point must be demoable.** Given a fixed date and an unfamiliar toolchain, the build order is chosen so that running out of time degrades gracefully rather than leaving nothing to show:

1. Content extracted + Astro site on Pages — already better than the artifact.
2. Agent wired in — the AI-engineering story.
3. Eval suite and model sweep — what makes the agent credible rather than impressive.

CI is explicitly *not* on the path to the 24th. If the agent is not working by roughly day ten, ship the site alone and present the agent as in progress.

**Amendment, 2026-08-07 — Claude Design sync tried and blocked.** Originally excluded alongside CI, briefly reinstated as [G-26](BACKLOG.md) once the bootstrap page shipped with no styling at all. Blocked the same day: this environment's Claude Design authorization is a separate identity from Jaime's `claude.ai` account, so projects created from either side are invisible to the other, and `/design-login` isn't available here to link them. Visual work proceeds as plain CSS against the Astro dev server, outside the tracker.

## Testing Decisions

**What makes a good test here:** it asserts on external behavior — the sequence a given profile produces, the answer a given question receives — never on how that behavior is produced. A test that knows the shape of an internal helper will break on every refactor and catch nothing.

**Two seams. One per repository.**

**Seam A — the `decision-tree` module.** A pure function: answers plus content in, result out. No DOM, no network, no clock. This covers all branching logic, patente arithmetic, content wiring, and both languages through a single interface.

Prior art exists and should be preserved: the current artifact has a 44-assertion Node suite covering seven scenarios plus dictionary key parity and cross-language leakage. It runs against the logic through exactly this seam and should survive the Astro migration unchanged.

The content build is deliberately *not* a separate seam — tests feed the real built `content.json` into Seam A as a fixture, so the build is validated by being used. Schema validation is covered by a small number of assertions that malformed content fails loudly.

**Seam B — the `/chat` HTTP endpoint.** Request in, streamed response out, tested over HTTP with no access to internals. Covers prompt assembly, guardrails, provider integration, and language handling.

Two categories of test run against this one seam:

- *Functional* — rate limits reject, malformed requests are refused, CORS blocks foreign origins, the response streams.
- *Behavioral (the eval)* — roughly twenty grounding cases with a known correct answer from the research document, plus **five cases the agent must refuse**: OGPe's fee schedule, the Permiso Único renewal interval, CFSE premium rates, 2026 DTRH rates, and whether a home-based business needs a Permiso Único. On these, a confident answer is a failing grade. This is the primary filter on model selection.

**Explicitly not a seam:** the rendered page. Browser-driven tests would couple to markup and run slowly while catching less than Seam A already does.

## Out of Scope

- Multi-location and multi-municipality businesses.
- Any transactional capability — no filing, no payment, no account creation. The guide tells you what to do; it never does it.
- Construction permits beyond acknowledging they precede the use permit.
- A CMS. Content is YAML edited in the repository by one person; the schema is designed so a CMS can be added later without restructuring.
- Authentication, accounts, saved progress.
- The buyer-side and seller-side acquisition tools discussed with Alan. This guide is a demonstration of the pattern, not the product.
- Enumerating IVU exemptions, which the research explicitly did not cover.
- Automated freshness monitoring of the underlying law.

## Further Notes

**The research document is the asset.** `docs/research/starting-a-business-in-puerto-rico.md` — roughly 1,240 lines, 170 cited sources, built from consolidated statute texts rather than search results. Everything else is presentation. It should be committed first and treated as the thing under version control that matters.

**The freshest finding is also the most perishable.** Ley 38-2026 created a 31 December 2026 filing cliff for Act 60 investor decrees. The page counts down to it. That countdown is correct today and becomes wrong on 1 January 2027 — a reminder that this guide's value is entirely a function of its currency, and that nothing currently re-checks it.

**Free-tier request limits, not cost, are the binding constraint.** OpenRouter's free models allow 20 requests/minute and 50 requests/day, counted globally across the account. That is adequate for a demo and inadequate for a launch. A one-time $10 raises it to 1,000/day. At the cheap paid tier — roughly $0.02 per million input tokens — a five-turn conversation costs a fraction of a cent, so $10 covers months.

**Whether `:free` model variants support prompt caching is undocumented.** Verify before assuming; at these prices the answer barely affects cost, but it affects latency.

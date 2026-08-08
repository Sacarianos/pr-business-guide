# PR Business Guide

Guía de Apertura de Negocios en Puerto Rico — the site, the content, and the research behind both.

The companion repository, `cud-agente`, holds the API and the eval suite. It consumes this repository's
content over HTTP rather than vendoring a copy, so a corrected fee reaches both surfaces from one edit.

## The research document is the asset

[`docs/research/starting-a-business-in-puerto-rico.md`](docs/research/starting-a-business-in-puerto-rico.md)
— roughly 1,240 lines and 170 cited sources, assembled from consolidated statute texts rather than search
results. It was committed before any code, and it is the thing under version control that matters.
Everything else in this repository is presentation.

Two conventions in it carry through into the site's content schema, and they are orthogonal:

- **Sourcing** is document provenance — `primary`, `secondary`, or `unverified`.
- **Practice** is practitioner knowledge — whether someone who files these permits weekly confirms or
  contradicts what the statute says.

A claim can be primary-sourced and practically wrong at the same time. That combination is the most
valuable content on the page, not an exception to be smoothed over.

## Layout

```
content/          content collections (content/*.yaml), validated by src/lib/content-schema.ts
docs/research/    the research document
issues/           the tracker — 0001 is the spec of record, BACKLOG.md decomposes it
src/lib/          the schemas and the decision-tree module — no DOM, no network, no clock
src/pages/        Astro pages, plus content.json as a published static asset
src/scripts/      the one client-side island, hand-written and framework-free
test/             node:test suites, run against the built content.json
```

The schemas live in `src/lib/content-schema.ts` as plain Zod rather than inside
`src/content.config.ts`, which only wires them into Astro's collection loader. That split is what
lets the test suite and the decision-tree module import them without pulling in the `astro:content`
virtual module.

## Working on it

Requires Node ≥ 22.18 (see `engines`). Install with `npm install`.

| Command | Does |
|---|---|
| `npm run dev` | Astro dev server |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run typecheck` | `astro check` over `.astro` and `.ts` |
| `npm test` | `astro build`, then `node --test` over `test/**/*.test.ts` |

### Why the test suite has no framework

The spec settles two test seams, one per repository. This repository's is the `decision-tree` module: a
pure function taking answers plus content and returning a result, with no DOM, no network, and no clock.
The suite runs against exactly that interface, and it stays plain `node:test` — no framework, no runner
config, no transpile step for the test code itself.

That is why `tsconfig.json` sets `erasableSyntaxOnly`, and why the Node floor is 22.18 rather than the
22.12 Astro itself asks for: the suite runs TypeScript through Node's native type-stripping, which became
the unflagged default on the 22.x line in 22.18.0. Below that, the suite does not fail an assertion — it
fails to load.

`npm test` does run `astro build` first, through `pretest`. That is not a build step for the tests; it is
the fixture. The spec is deliberate that the content build is *not* a separate seam — "tests feed the real
built `content.json` into Seam A as a fixture, so the build is validated by being used" — so the suite
loads `dist/content.json`, the same artifact `cud-agente` fetches, rather than a hand-maintained copy that
could drift from the YAML it claims to mirror.

### Why dependency install scripts are blocked

`allowScripts` in `package.json` records the decision explicitly: no third-party package runs code during
`npm install`. esbuild is the only dependency that asks, and it does not need to — its platform binary
arrives through optional dependencies, and the build, typecheck, and test suite all pass from a clean
install with the script denied.

## Scope

The guide tells you what to do; it never does it. No filing, no payment, no accounts, no saved progress.
The flow assumes a single commercial location in a single municipio, and says so on the page rather than
being quietly wrong — business volume is attributed per municipality and merchant registration is per
location, which a ten-question flow cannot collect correctly.

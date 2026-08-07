# Issue tracker

Plain markdown, one file per issue, versioned with the code. No external service.

```
issues/
  README.md
  BACKLOG.md                          # 0001 decomposed into work items, per repo
  0001-guia-apertura-de-negocios.md
```

[BACKLOG.md](BACKLOG.md) is the migration source for GitHub. Epics stay here as the spec of record; the work items derived from them live as GitHub issues in `cud-guia` and `cud-agente`.

## File convention

`NNNN-kebab-case-slug.md`, numbered sequentially from `0001`. The number is permanent; the slug may be corrected.

Every issue opens with frontmatter:

```yaml
---
id: 0001
title: Guía de Apertura de Negocios en Puerto Rico
labels: [ready-for-agent]
status: open
created: 2026-08-07
due: 2026-08-24        # optional
blocked-by: [0002]     # optional
---
```

## Status

| Status | Meaning |
|---|---|
| `open` | Not started |
| `in-progress` | Being worked |
| `blocked` | Waiting on something named in `blocked-by`, or on an external answer |
| `done` | Complete |
| `dropped` | Deliberately abandoned — keep the file and say why at the top |

Closed issues stay in place. The history is the point.

## Labels

| Label | Meaning |
|---|---|
| `ready-for-agent` | Specified well enough to hand to an agent without further interviewing |
| `needs-triage` | Captured, not yet specified |
| `needs-verification` | Contains claims a human practitioner must confirm |
| `research` | Produces findings rather than code |
| `blocked-external` | Waiting on a person or agency outside the project |

`needs-verification` carries weight in this project specifically: the guide's content is derived from documents rather than practice, and anything a practitioner has not confirmed should be findable by label.

## Working the tracker

Issues are written by `/to-spec` and consumed by `/implement`. An issue labelled `ready-for-agent` should be actionable with no further conversation — if an agent has to ask what was meant, the spec was incomplete and belongs back at `needs-triage`.

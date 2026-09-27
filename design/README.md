# design/

Local component library kept in sync with a Claude Design project ([G-26](../issues/BACKLOG.md)). Each
subdirectory is one component: a self-contained preview HTML file, editable visually in Claude Design and
synced back here incrementally, one component at a time.

Nothing in this directory is served by Astro. When a preview settles, its markup and styling get
translated by hand into the real `.astro` component — this directory is the design surface, not the site.

| Component | Astro counterpart |
|---|---|
| `page-shell/` | [`src/pages/index.astro`](../src/pages/index.astro) |
| `route-redesign/` | [`src/pages/index.astro`](../src/pages/index.astro). The approved visual reference for [0002](../issues/0002-route-redesign.md). Serve it with the `design reference` launch configuration. |

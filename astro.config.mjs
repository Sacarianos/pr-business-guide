// @ts-check
import { defineConfig } from 'astro/config';

// Static output is a product decision, not a default: the guide must be fully
// usable before any JavaScript loads (0001, user story 35). The only hydrated
// component on the page will be the chat island (G-21).
//
// `site` and `base` are deliberately absent until G-24 wires up GitHub Pages —
// serving from a project page means `base` has to match the repository name,
// and a wrong value here breaks every asset URL silently.
export default defineConfig({
  output: 'static',
});

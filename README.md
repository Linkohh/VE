# VibeMe — Motivational Quote Generator

VibeMe is a cinematic motivational quote generator built with Svelte, Vite, and Tailwind CSS. The experience renders an animated matrix backdrop, curated quote history, favorites, and theme controls in a single-page application.

## Development

```bash
npm install
npm run dev
```

Key scripts:

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot module reloading. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run check` | Run `svelte-check` for type and accessibility diagnostics. |
| `npm run test` | Execute Vitest unit tests. |
| `npm run lint` | Lint Svelte, TypeScript, and configuration files with ESLint. |
| `npm run security:audit` | Scan the npm dependency tree for known vulnerabilities. |

## Continuous Integration

GitHub Actions runs linting, type checks, tests, the production build, and a security audit on every push or pull request targeting the default branches. Automated dependency updates are handled via Dependabot (npm and GitHub Actions ecosystems).

## Fonts & Assets

All typographic assets are self-hosted through [`@fontsource`](https://fontsource.org/) packages so the application does not rely on third-party CDNs. Favicons and the web manifest live in the `meta/` directory.

## Quotes Dataset

Quotes are managed in `data/quotes.json` and loaded into the app at build time. The dataset is typed and test-covered through the modules in `src/features/quotes/`.

## Project Structure

```
src/
├── App.svelte           # SPA entry point
├── app/                 # Shell, components, pages
├── features/            # Thematic domains (quotes, matrix, theme)
├── app.css              # Tailwind and design tokens
└── main.ts              # Bootstraps the Svelte application
```

Refer to `meta/framework-modernization-rubric.md` for the rubric used to evaluate modernization progress and the current self-assessment checkpoints.

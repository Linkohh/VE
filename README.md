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
| `npm run dev:lan` | Serve the dev build on all interfaces for local network testing. |
| `npm run dev:https` | Run the dev server over HTTPS using a self-signed certificate. |
| `npm run dev:lan:https` | Combine LAN access with HTTPS for multi-device secure testing. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run preview:https` | Preview the production build over HTTPS. |
| `npm run check` | Run `svelte-check` for type and accessibility diagnostics. |
| `npm run test` | Execute Vitest unit tests. |
| `npm run lint` | Lint Svelte, TypeScript, and configuration files with ESLint. |
| `npm run security:audit` | Scan the npm dependency tree for known vulnerabilities. |

### Customizing host & HTTPS

The Vite configuration respects the following environment variables so you can tailor how the dev and preview servers bind:

| Variable | Purpose |
| --- | --- |
| `VITE_DEV_HOST` | Set to a hostname/IP (or `true` to bind all interfaces) before running `npm run dev`/`preview`. |
| `VITE_DEV_HTTPS` | Set to `true` to enable HTTPS. When used without key/cert paths, Vite generates a temporary self-signed certificate. |
| `VITE_DEV_HTTPS_KEY` / `VITE_DEV_HTTPS_CERT` | Absolute or relative paths to custom TLS key/certificate files when `VITE_DEV_HTTPS=true`. |

Example (Unix-like shells):

```bash
VITE_DEV_HOST=0.0.0.0 VITE_DEV_HTTPS=true npm run dev
```

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

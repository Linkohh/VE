# VibeMe — Motivational Quote Generator

VibeMe is a cinematic motivational quote generator built with Svelte, Vite, and Tailwind CSS. The experience renders an animated matrix backdrop, curated quote history, favorites, and theme controls in a single-page application.

## Getting Started

```bash
npm install
npm run dev
```

### Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server bound to localhost over HTTP. |
| `npm run dev:lan` | Start the dev server bound to `0.0.0.0` for LAN/device testing. |
| `npm run dev:https` | Serve locally over HTTPS using a self-signed certificate (or custom certs if provided). |
| `npm run dev:lan:https` | Combine LAN access with HTTPS. |
| `npm run build` | Generate a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |
| `npm run check` | Type-check Svelte components via `svelte-check`. |
| `npm run test` | Execute the Vitest unit test suite. |

### HTTPS configuration

When enabling HTTPS you can optionally provide your own key and certificate. Set the following environment variables (shown here using `cross-env` for portability):

```bash
cross-env VITE_DEV_HTTPS=true \
  VITE_DEV_HTTPS_KEY=./.cert/dev.key \
  VITE_DEV_HTTPS_CERT=./.cert/dev.crt \
  npm run dev:https
```

If no paths are provided, or if the files cannot be read, Vite falls back to generating a self-signed certificate.

### Host configuration

Host resolution is controlled by `VITE_DEV_HOST`:

- unset/`false`: keep Vite's default (`localhost`).
- `true`: let Vite decide the best host (mirrors `--host` flag without arguments).
- `lan`: bind to `0.0.0.0` for access from other devices.
- any other value: forwarded directly to Vite.

## Project Structure

```
src/
├── App.svelte           # SPA entry point
├── app/                 # Shell, components, pages
├── features/            # Thematic domains (quotes, matrix, theme)
├── app.css              # Tailwind and design tokens
└── main.ts              # Bootstraps the Svelte application
```

## Additional Notes

- Refer to `meta/framework-modernization-rubric.md` for the modernization rubric and checkpoints.
- CI/CD guidance lives in `meta/ci/README.md`.
- Font usage and other assets are documented within `src/app/styles` alongside Tailwind configuration comments.
- Contribution conventions and architectural decisions are tracked in `meta/architecture/`.

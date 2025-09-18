# VibeMe 2.0

A modernization of the original VibeMe inspirational quote generator, rebuilt with Svelte, TypeScript, and Vite. This branch focuses on establishing the new application shell, global styling system, and foundational state management that future phases will expand upon.

## Getting Started

```bash
npm install
npm run dev -- --open
```

## Available Scripts

- `npm run dev` – start the Vite development server.
- `npm run build` – create an optimized production build.
- `npm run preview` – preview the production build locally.
- `npm run check` – run type-checking and Svelte diagnostics.

## Project Structure Highlights

- `src/app.css` – global theme variables, base styles, and generated theme classes.
- `src/App.svelte` – application shell that wires up the core layout.
- `src/lib/stores` – Svelte stores that manage quotes, settings, and UI state.
- `public` – static assets including quote data and offline fallbacks.

## Data Sources

Quotes are fetched from `public/data/quotes.json` with a graceful fallback to `public/js/quotes.js` when offline, matching the behavior of the legacy application.

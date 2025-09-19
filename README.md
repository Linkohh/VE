# VibeMe - Motivational Quote Generator

VibeMe is a beautiful motivational quote generator with dynamic themes, inspiring messages, and a modern React interface powered by Vite. The experience now runs as a single-page application that renders quotes, favorites, search, and accessibility tooling directly from JSX components.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The app will open automatically in your browser.
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
  components/    # React components, including Home and About pages
  css/           # Global styling imported into the React entry point
  data/          # quotes.json (single source of truth)
  meta/          # Additional metadata consumed by the app
public/
  site.webmanifest
  quotes.json    # Generated from src/data/quotes.json for portability
```

## Quote Management

The quotes used by the experience live in `src/data/quotes.json`. Update this file whenever you want to add, edit, or remove entries. To refresh the distributable copy in `public/quotes.json`, run:

```bash
npm run sync-quotes
```

This command ensures that the static JSON served with the production build mirrors the source data consumed by the React components.

## Available Scripts

- `npm run dev` – Start the Vite development server with hot reloading.
- `npm run build` – Create an optimized production bundle in `dist/`.
- `npm run preview` – Preview the production build locally.
- `npm run sync-quotes` – Sync `src/data/quotes.json` to `public/quotes.json`.

## Accessibility & Features

- Random quote generator with category filtering and auto-refresh controls.
- Favorites list preserved in local storage for quick access.
- Search overlay with instant filtering across all categories.
- Optional speech synthesis for accessible quote playback.
- Responsive layout with retained background effects and dark mode toggle.

Enjoy crafting your next vibe!

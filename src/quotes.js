export async function loadQuotes() {
  const isFile = location.protocol === 'file:';

  // --- Primary Loading Strategy ---
  if (isFile) {
    // OFFLINE: Use quotes.js, loaded by the injector script in index.html
    console.info('[quotes] Offline mode: waiting for quotes.js...');
    if (window.__QUOTES_JS_PROMISE) {
      const loaded = await window.__QUOTES_JS_PROMISE;
      if (loaded && window.quotesData && window.quotesData.categories) {
        window.__QUOTES_SOURCE = 'js';
        console.info('[quotes] Success: Loaded from quotes.js');
        return window.quotesData;
      }
    }
    console.warn('[quotes] Failed to load from quotes.js promise.');
  } else {
    // ONLINE: Fetch from data/quotes.json
    console.info('[quotes] Online mode: fetching data/quotes.json...');
    try {
      const res = await fetch('data/quotes.json', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        window.__QUOTES_SOURCE = 'json';
        console.info('[quotes] Success: Loaded from data/quotes.json');
        return data;
      }
      console.warn(`[quotes] Fetch failed with status: ${res.status}`);
    } catch (err) {
      console.warn('[quotes] Fetch failed with error:', err);
    }
  }

  // --- Fallback Loading Strategies ---

  // 1) Inline fallback (manual JSON paste into #quotes-inline element)
  const inline = document.getElementById('quotes-inline');
  if (inline && inline.textContent.trim()) {
    try {
      const data = JSON.parse(inline.textContent);
      if (data && data.categories) {
        window.__QUOTES_SOURCE = 'inline';
        console.info('[quotes] Fallback: Using inline JSON.');
        return data;
      }
    } catch (e) {
      console.error('[quotes] Fallback: Inline JSON is invalid.', e);
    }
  }

  // 2) Final fallback if all else fails (should be rare)
  window.__QUOTES_SOURCE = 'minimal';
  console.error('[quotes] CRITICAL: All quote sources failed. Using minimal fallback.');
  return { categories: {} };
}

export const QUOTES_PROMISE = loadQuotes();

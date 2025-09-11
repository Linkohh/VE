export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem('vibeme-favorites') || '[]');
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem('vibeme-favorites', JSON.stringify(favorites));
  document.dispatchEvent(new CustomEvent('vibeme:favorites:changed'));
}

export function toggleFavorite(favorites, quote) {
  const existingIndex = favorites.findIndex(
    (fav) => fav.text === quote.text && fav.author === quote.author
  );
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    saveFavorites(favorites);
    return false;
  }
  favorites.push(quote);
  saveFavorites(favorites);
  return true;
}

export function clearFavorites(favorites) {
  favorites.splice(0, favorites.length);
  saveFavorites(favorites);
}

export function initFavoritesPanel(favorites) {
  if (window.__favoritesInit) return; // double-load guard
  window.__favoritesInit = true;

  function $(id) { return document.getElementById(id); }

  function readRaw() {
    const merge = [];
    const push = (val) => { if (Array.isArray(val)) merge.push(...val); };
    push(favorites);
    try { push(JSON.parse(localStorage.getItem('vibeme-favorites') || '[]')); } catch {}
    try { push(JSON.parse(localStorage.getItem('favorites') || '[]')); } catch {}
    try { push(JSON.parse(localStorage.getItem('vibemeFavorites') || '[]')); } catch {}
    return merge;
  }

  function saveRaw(raw) {
    try { localStorage.setItem('vibeme-favorites', JSON.stringify(raw)); } catch {}
    favorites.length = 0;
    favorites.push(...raw);
    refreshCount();
  }

  function normalize(raw) {
    const items = (raw || []).map((it) => {
      if (typeof it === 'string') return { text: it, author: null };
      if (it && typeof it === 'object') {
        const text = it.text ?? it.quote ?? it.q ?? '';
        const author = it.author ?? it.a ?? null;
        return { text, author };
      }
      return { text: String(it ?? ''), author: null };
    }).filter((x) => x.text);
    const seen = new Set();
    return items.filter((x) => {
      const k = (x.text + '|' + (x.author ?? '')).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function favKey(q) {
    return ((q?.text ?? '') + '|' + (q?.author ?? '')).toLowerCase();
  }

  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[c]);
  }

  function refreshCount(forceN) {
    const el = $('favorites-count');
    if (!el) return;
    if (typeof forceN === 'number') {
      el.textContent = forceN;
      return;
    }
    el.textContent = normalize(readRaw()).length;
  }

  function renderList() {
    const listEl = $('favorites-list');
    const emptyEl = $('favorites-empty');
    if (!listEl) return;

    const items = normalize(readRaw());
    listEl.innerHTML = '';
    if (!items.length) {
      if (emptyEl) emptyEl.style.display = '';
      refreshCount(0);
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    items.forEach((q, idx) => {
      const row = document.createElement('div');
      row.className = 'fav-item';
      row.innerHTML = `
        <div class="fav-text-wrap">
          <div class="fav-quote">"${escapeHTML(q.text)}"</div>
          ${q.author ? `<div class="fav-author">— ${escapeHTML(q.author)}</div>` : ''}
        </div>
        <div class="fav-actions">
          <button class="fav-copy" title="Copy"><i class="fas fa-copy"></i></button>
          <button class="fav-remove" title="Remove"><i class="fas fa-trash"></i></button>
        </div>`;
      row.dataset.index = String(idx);
      listEl.appendChild(row);
    });

    listEl.onclick = async (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;

      const row = ev.target.closest('.fav-item');
      if (!row) return;

      const idx = Number(row.dataset.index);
      const itemsNow = normalize(readRaw());
      const target = itemsNow[idx];
      if (!target) return;

      if (btn.classList.contains('fav-copy')) {
        const toCopy = target.text || '';
        try { await navigator.clipboard?.writeText(toCopy); } catch {}
        return;
      }

      if (btn.classList.contains('fav-remove')) {
        const keyToRemove = favKey(target);
        const raw = readRaw();
        let removeAt = -1;
        for (let i = 0; i < raw.length; i++) {
          const r = raw[i];
          const norm = typeof r === 'string'
            ? { text: r, author: null }
            : r && typeof r === 'object'
              ? { text: (r.text ?? r.quote ?? r.q ?? ''), author: (r.author ?? r.a ?? null) }
              : { text: String(r ?? ''), author: null };
          if (!norm.text) continue;
          if (favKey(norm) === keyToRemove) { removeAt = i; break; }
        }
        if (removeAt >= 0) {
          raw.splice(removeAt, 1);
          saveRaw(raw);
          renderList();
        }
        return;
      }
    };

    refreshCount(items.length);
  }

  (function patchSetItem() {
    const _set = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (k, v) {
      const r = _set(k, v);
      if (k === 'vibeme-favorites') {
        refreshCount();
        if ($('favorites-panel')?.dataset.state === 'open') renderList();
      }
      return r;
    };
  })();

  function init() {
    const toggleBtn = $('favorites-toggle');
    const panel = $('favorites-panel');
    const btnClose = $('favorites-close');
    if (!toggleBtn || !panel || !btnClose) { requestAnimationFrame(init); return; }

    const STATES = { CLOSED: 'closed', OPEN: 'open' };
    let state = (localStorage.getItem('favorites:state') === 'open') ? 'open' : 'closed';

    function apply(next) {
      state = next;
      panel.dataset.state = state;
      localStorage.setItem('favorites:state', state);
      if (state === STATES.OPEN) {
        toggleBtn.setAttribute('aria-label', 'Close favorites');
        toggleBtn.setAttribute('title', 'Close favorites');
        toggleBtn.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-modal', 'true');
        renderList();
      } else {
        toggleBtn.setAttribute('aria-label', 'Open favorites');
        toggleBtn.setAttribute('title', 'Open favorites');
        toggleBtn.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-modal', 'false');
      }
    }

    apply(state);

    toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); apply(state === 'open' ? 'closed' : 'open'); });
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); apply('closed'); });

    panel.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', (e) => {
      const outside = !panel.contains(e.target) && e.target !== toggleBtn;
      if (outside && state === 'open') apply('closed');
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state === 'open') apply('closed'); });

    window.addEventListener('storage', (ev) => {
      if (ev.key === 'vibeme-favorites') {
        refreshCount();
        if (state === 'open') renderList();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}

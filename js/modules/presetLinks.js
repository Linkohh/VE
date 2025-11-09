(function () {
  const KEY = 'vibe';
  const PresetLinks = {
    serializeCurrentPreset,
    applyPresetObject,
    parseAndOfferPresetFromURL
  };

  const ui = {
    copyBtn: null,
    importBtn: null,
    importForm: null,
    importInput: null,
    importCancel: null,
    drawer: null,
    drawerPreview: null,
    drawerApply: null,
    drawerIgnore: null,
    drawerClose: null
  };

  let pendingPreset = null;

  document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    attachListeners();
    parseAndOfferPresetFromURL();
  });

  window.PresetLinks = PresetLinks;

  function cacheElements() {
    ui.copyBtn = document.getElementById('preset-copy-btn');
    ui.importBtn = document.getElementById('preset-import-btn');
    ui.importForm = document.getElementById('preset-import-inline');
    ui.importInput = document.getElementById('preset-import-input');
    ui.importCancel = document.getElementById('preset-import-cancel');
    ui.drawer = document.getElementById('preset-import-drawer');
    ui.drawerPreview = document.getElementById('preset-import-preview');
    ui.drawerApply = document.getElementById('preset-import-apply');
    ui.drawerIgnore = document.getElementById('preset-import-ignore');
    ui.drawerClose = document.getElementById('preset-import-close');
  }

  function attachListeners() {
    if (ui.copyBtn) {
      ui.copyBtn.addEventListener('click', async () => {
        try {
          const url = serializeCurrentPreset();
          await navigator.clipboard.writeText(url);
          toast('Preset copied ✅', 'success');
        } catch (err) {
          fallbackCopy();
        }
      });
    }

    if (ui.importBtn) {
      ui.importBtn.addEventListener('click', () => {
        if (!ui.importForm) return;
        const isHidden = ui.importForm.classList.contains('hidden');
        ui.importBtn.setAttribute('aria-expanded', String(isHidden));
        ui.importForm.classList.toggle('hidden', !isHidden);
        if (isHidden && ui.importInput) {
          setTimeout(() => ui.importInput.focus(), 0);
        }
      });
    }

    if (ui.importForm) {
      ui.importForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!ui.importInput) return;
        handlePresetString(ui.importInput.value);
      });
    }

    if (ui.importCancel) {
      ui.importCancel.addEventListener('click', () => {
        if (!ui.importForm) return;
        ui.importForm.classList.add('hidden');
        ui.importBtn?.setAttribute('aria-expanded', 'false');
        if (ui.importInput) ui.importInput.value = '';
      });
    }

    if (ui.drawerApply) {
      ui.drawerApply.addEventListener('click', () => {
        if (!pendingPreset) return;
        applyPresetObject(pendingPreset);
        toast('Preset applied 🎉', 'success');
        closeDrawer();
      });
    }

    if (ui.drawerIgnore) {
      ui.drawerIgnore.addEventListener('click', () => {
        closeDrawer();
      });
    }

    if (ui.drawerClose) {
      ui.drawerClose.addEventListener('click', () => closeDrawer());
    }
  }

  function fallbackCopy() {
    try {
      const url = serializeCurrentPreset();
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast('Preset copied ✅', 'success');
    } catch (err) {
      toast('Unable to copy preset', 'error');
    }
  }

  function serializeCurrentPreset() {
    const data = collectCurrentPreset();
    const json = JSON.stringify(data);
    const encoded = base64UrlEncode(json);
    const origin = `${location.origin}${location.pathname}`;
    return `${origin}#${KEY}=${encoded}`;
  }

  function collectCurrentPreset() {
    const payload = {};
    const vibe = window.VibeMe || {};

    const themePreset = safeGetLocalStorage('vibeme-theme-preset');
    if (themePreset && themePreset !== 'auto') {
      payload.themePreset = themePreset;
    }

    const colorPrefs = parseJSON(safeGetLocalStorage('vibeme-color-preferences')) || {};
    if (colorPrefs.harmonyType && colorPrefs.harmonyType !== 'auto') {
      payload.colorHarmony = colorPrefs.harmonyType;
    }
    if (typeof colorPrefs.vibrancy !== 'undefined') {
      payload.vibrancy = Number(colorPrefs.vibrancy);
    }
    if (typeof colorPrefs.warmth !== 'undefined') {
      payload.warmth = Number(colorPrefs.warmth);
    }
    if (typeof colorPrefs.accessibility === 'boolean') {
      payload.a11yMode = colorPrefs.accessibility;
    }

    const matrixPrefs = parseJSON(safeGetLocalStorage('vibeme-matrix-preferences')) || {};
    if (typeof matrixPrefs.opacity !== 'undefined') {
      payload.matrixVisibility = Number(matrixPrefs.opacity);
    }
    if (typeof matrixPrefs.density !== 'undefined') {
      payload.streamDensity = Number(matrixPrefs.density);
    }
    if (typeof matrixPrefs.speed !== 'undefined') {
      payload.animSpeed = Number(matrixPrefs.speed);
    }
    if (typeof matrixPrefs.highContrast === 'boolean') {
      payload.highContrast = matrixPrefs.highContrast;
    }
    if (matrixPrefs.blendMode && matrixPrefs.blendMode !== 'auto') {
      payload.blendMode = matrixPrefs.blendMode;
    }
    if (typeof matrixPrefs.maxFps !== 'undefined') {
      payload.fpsCap = Number(matrixPrefs.maxFps);
    }

    const matrixPreset = safeGetLocalStorage('vibeme-matrix-preset');
    if (matrixPreset && matrixPreset !== 'auto') {
      payload.matrixPreset = matrixPreset;
    }

    if (vibe.matrixConfig?.renderMode) {
      payload.engine = vibe.matrixConfig.renderMode;
    }
    if (vibe.matrixConfig?.densityMultiplier && typeof payload.streamDensity === 'undefined') {
      payload.streamDensity = Number(vibe.matrixConfig.densityMultiplier);
    }

    if (vibe.matrixConfig?.updateInterval && typeof payload.animSpeed === 'undefined') {
      const speed = 500 / vibe.matrixConfig.updateInterval;
      if (Number.isFinite(speed)) payload.animSpeed = Number(speed.toFixed(2));
    }

    if (vibe.matrixConfig?.canvasConfig?.maxFPS && typeof payload.fpsCap === 'undefined') {
      payload.fpsCap = Number(vibe.matrixConfig.canvasConfig.maxFPS);
    }

    const category = vibe.state?.categoryFilter;
    if (category && category !== 'all') {
      payload.quoteCategory = category;
    }

    const ttsSettings = vibe.settings?.tts;
    if (ttsSettings) {
      payload.speechOn = !!ttsSettings.enabled;
      if (typeof ttsSettings.rate === 'number') {
        payload.speechSpeed = Number(ttsSettings.rate);
      }
      if (ttsSettings.voiceURI) {
        payload.voice = ttsSettings.voiceURI;
      }
    }

    if (vibe.settings?.tts?.voiceURI) {
      payload.voice = vibe.settings.tts.voiceURI;
    }

    return payload;
  }

  function parseAndOfferPresetFromURL() {
    const token = extractToken(location.hash);
    if (!token) return;
    const obj = decodeToken(token);
    const valid = validatePreset(obj);
    if (!valid) {
      toast('Invalid preset link', 'error');
      clearHash();
      return;
    }
    openDrawer(valid);
    clearHash();
  }

  function handlePresetString(input) {
    const token = extractToken(input);
    if (!token) {
      toast('No preset token found', 'error');
      return;
    }
    const obj = decodeToken(token);
    const valid = validatePreset(obj);
    if (!valid) {
      toast('Invalid preset link', 'error');
      return;
    }
    openDrawer(valid);
  }

  function extractToken(str) {
    if (!str) return null;
    const match = str.match(new RegExp(`${KEY}=([^&]+)`));
    if (match && match[1]) return match[1];
    if (/^[A-Za-z0-9_-]+$/.test(str)) return str;
    const parts = str.split('#');
    if (parts.length > 1) {
      return extractToken(parts[1]);
    }
    const queryMatch = str.match(/vibe=([^&]+)/);
    return queryMatch ? queryMatch[1] : null;
  }

  function decodeToken(token) {
    try {
      const padded = padBase64(token.replace(/-/g, '+').replace(/_/g, '/'));
      const decoded = atob(padded);
      const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json);
    } catch (err) {
      console.warn('[preset] decode failed', err);
      return null;
    }
  }

  function validatePreset(obj) {
    if (!obj || typeof obj !== 'object') return null;
    const clean = {};

    if (typeof obj.themePreset === 'string') clean.themePreset = obj.themePreset;
    if (typeof obj.matrixPreset === 'string') clean.matrixPreset = obj.matrixPreset;
    if (typeof obj.colorHarmony === 'string') clean.colorHarmony = obj.colorHarmony;
    if (typeof obj.vibrancy === 'number') clean.vibrancy = clamp(obj.vibrancy, 0, 100);
    if (typeof obj.warmth === 'number') clean.warmth = clamp(obj.warmth, 0, 100);
    if (typeof obj.a11yMode === 'boolean') clean.a11yMode = obj.a11yMode;

    if (typeof obj.matrixVisibility === 'number') clean.matrixVisibility = clamp(obj.matrixVisibility, 0, 100);
    if (typeof obj.streamDensity === 'number') clean.streamDensity = clamp(obj.streamDensity, 0.5, 3);
    if (typeof obj.animSpeed === 'number') clean.animSpeed = clamp(obj.animSpeed, 0.5, 2.5);
    if (typeof obj.highContrast === 'boolean') clean.highContrast = obj.highContrast;
    if (typeof obj.blendMode === 'string') clean.blendMode = obj.blendMode;
    if (typeof obj.fpsCap === 'number') clean.fpsCap = clamp(Math.round(obj.fpsCap), 30, 240);
    if (typeof obj.engine === 'string') clean.engine = obj.engine;

    if (typeof obj.quoteCategory === 'string') clean.quoteCategory = obj.quoteCategory;

    if (typeof obj.speechOn === 'boolean') clean.speechOn = obj.speechOn;
    if (typeof obj.speechSpeed === 'number') clean.speechSpeed = clamp(obj.speechSpeed, 0.6, 1.6);
    if (typeof obj.voice === 'string') clean.voice = obj.voice;

    return Object.keys(clean).length ? clean : {};
  }

  function applyPresetObject(obj) {
    if (!obj) return;
    const vibe = window.VibeMe;

    if (obj.themePreset) {
      localStorage.setItem('vibeme-theme-preset', obj.themePreset);
      const select = document.getElementById('theme-preset');
      if (select) {
        select.value = obj.themePreset;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    if (obj.matrixPreset) {
      localStorage.setItem('vibeme-matrix-preset', obj.matrixPreset);
      const select = document.getElementById('matrix-preset');
      if (select) {
        select.value = obj.matrixPreset;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    if (obj.colorHarmony || typeof obj.vibrancy !== 'undefined' || typeof obj.warmth !== 'undefined' || typeof obj.a11yMode !== 'undefined') {
      const prefs = parseJSON(safeGetLocalStorage('vibeme-color-preferences')) || {};
      if (obj.colorHarmony) prefs.harmonyType = obj.colorHarmony;
      if (typeof obj.vibrancy !== 'undefined') prefs.vibrancy = obj.vibrancy;
      if (typeof obj.warmth !== 'undefined') prefs.warmth = obj.warmth;
      if (typeof obj.a11yMode !== 'undefined') prefs.accessibility = obj.a11yMode;
      localStorage.setItem('vibeme-color-preferences', JSON.stringify(prefs));
      if (vibe?.applyRandomTheme) vibe.applyRandomTheme();
      if (obj.colorHarmony) {
        const select = document.getElementById('harmony-type');
        if (select) select.value = obj.colorHarmony;
      }
      if (typeof obj.vibrancy !== 'undefined') {
        const slider = document.getElementById('vibrancy-slider');
        const label = document.getElementById('vibrancy-value');
        if (slider) slider.value = obj.vibrancy;
        if (label) label.textContent = `${Math.round(obj.vibrancy)}%`;
      }
      if (typeof obj.warmth !== 'undefined') {
        const slider = document.getElementById('warmth-slider');
        const label = document.getElementById('warmth-value');
        if (slider) slider.value = obj.warmth;
        if (label) label.textContent = `${Math.round(obj.warmth)}%`;
      }
      if (typeof obj.a11yMode !== 'undefined') {
        const checkbox = document.getElementById('accessibility-mode');
        if (checkbox) checkbox.checked = obj.a11yMode;
      }
    }

    if (typeof obj.matrixVisibility !== 'undefined' && vibe?.updateMatrixSetting) {
      vibe.updateMatrixSetting('opacity', obj.matrixVisibility);
    }
    if (typeof obj.streamDensity !== 'undefined' && vibe?.updateMatrixSetting) {
      vibe.updateMatrixSetting('density', obj.streamDensity);
    }
    if (typeof obj.animSpeed !== 'undefined' && vibe?.updateMatrixSetting) {
      vibe.updateMatrixSetting('speed', obj.animSpeed);
    }
    if (typeof obj.highContrast !== 'undefined' && vibe?.updateMatrixSetting) {
      vibe.updateMatrixSetting('highContrast', obj.highContrast);
    }
    if (obj.blendMode && vibe?.updateMatrixSetting) {
      vibe.updateMatrixSetting('blendMode', obj.blendMode);
      const select = document.getElementById('matrix-blend-mode');
      if (select) select.value = obj.blendMode;
    }
    if (typeof obj.fpsCap !== 'undefined' && vibe?.updateMatrixSetting) {
      vibe.updateMatrixSetting('maxFps', obj.fpsCap);
      const slider = document.getElementById('canvas-max-fps');
      const label = document.getElementById('canvas-max-fps-value');
      if (slider) slider.value = obj.fpsCap;
      if (label) label.textContent = obj.fpsCap;
    }

    if (obj.engine && vibe?.updateMatrixRenderMode) {
      vibe.updateMatrixRenderMode(obj.engine);
      const select = document.getElementById('matrix-render-mode');
      if (select) select.value = obj.engine;
    }

    if (obj.quoteCategory) {
      const select = document.getElementById('category-filter');
      if (select) {
        select.value = obj.quoteCategory;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    if (typeof obj.speechOn !== 'undefined' && vibe?.settings?.tts) {
      vibe.settings.tts.enabled = obj.speechOn;
      const checkbox = document.getElementById('tts-enable-checkbox');
      if (checkbox) checkbox.checked = obj.speechOn;
    }
    if (typeof obj.speechSpeed !== 'undefined' && vibe?.settings?.tts) {
      vibe.settings.tts.rate = obj.speechSpeed;
      const slider = document.getElementById('tts-rate');
      const label = document.getElementById('tts-rate-value');
      if (slider) slider.value = obj.speechSpeed;
      if (label) label.textContent = `${obj.speechSpeed.toFixed(1)}x`;
    }
    if (obj.voice && vibe?.tts?.voices?.length) {
      const match = vibe.tts.voices.find((voice) => voice.voiceURI === obj.voice);
      if (match) {
        vibe.settings.tts.voiceURI = obj.voice;
        const select = document.getElementById('tts-voice');
        if (select) select.value = obj.voice;
      }
    }
  }

  function openDrawer(presetObj) {
    pendingPreset = presetObj;
    if (!ui.drawer || !ui.drawerPreview) return;
    if (ui.importForm) ui.importForm.classList.add('hidden');
    if (ui.importBtn) ui.importBtn.setAttribute('aria-expanded', 'false');
    ui.drawerPreview.innerHTML = renderPreview(presetObj);
    ui.drawer.classList.remove('hidden');
    requestAnimationFrame(() => ui.drawer.classList.add('is-open'));
  }

  function closeDrawer() {
    pendingPreset = null;
    if (!ui.drawer) return;
    ui.drawer.classList.remove('is-open');
    setTimeout(() => ui.drawer?.classList.add('hidden'), 260);
  }

  function renderPreview(obj) {
    const vibe = window.VibeMe || {};
    const colors = pickPaletteColors(obj.themePreset, vibe);
    const swatches = colors.map((color) => `<span class="preset-preview-swatch" style="background:${color}"></span>`).join('');

    const voiceLabel = obj.voice
      ? `Voice: ${obj.voice}`
      : `Voice: ${typeof obj.speechOn === 'boolean' ? (obj.speechOn ? 'Default' : 'Off') : 'unchanged'}`;
    const engineLabel = obj.engine ? `Engine: ${obj.engine}` : '';
    const quoteLabel = obj.quoteCategory ? `Quotes: ${obj.quoteCategory}` : '';

    return `
      <div class="preset-preview-swatches">${swatches}</div>
      <div class="preset-import-meta">
        <span>${obj.themePreset ? `Theme: ${obj.themePreset}` : 'Theme: current'}</span>
        ${obj.colorHarmony ? `<span>Harmony: ${obj.colorHarmony}</span>` : ''}
        ${obj.matrixPreset ? `<span>Matrix preset: ${obj.matrixPreset}</span>` : ''}
        ${engineLabel ? `<span>${engineLabel}</span>` : ''}
        ${quoteLabel ? `<span>${quoteLabel}</span>` : ''}
        <span>${voiceLabel}</span>
      </div>
    `;
  }

  function pickPaletteColors(presetName, vibe) {
    const bank = vibe?.themes?.colorPalettes?.[presetName];
    if (Array.isArray(bank) && bank.length) {
      const palette = bank[0];
      return [palette.color1, palette.color2, palette.color3].filter(Boolean);
    }
    const current = vibe?.currentTheme;
    if (current) {
      return [current.color1, current.color2, current.color3].filter(Boolean);
    }
    return ['#6366f1', '#8b5cf6', '#c4b5fd'];
  }

  function parseJSON(str) {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch (_) {
      return null;
    }
  }

  function safeGetLocalStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function base64UrlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function padBase64(str) {
    const pad = str.length % 4;
    if (!pad) return str;
    return str + '='.repeat(4 - pad);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function toast(message, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type || 'info', 2400);
    }
  }

  function clearHash() {
    if (history.replaceState) {
      history.replaceState(null, document.title, `${location.pathname}${location.search}`);
    } else {
      location.hash = '';
    }
  }
})();

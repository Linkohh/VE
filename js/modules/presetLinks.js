/*
 * Shareable preset links + import workflow
 * Encodes the current VibeMe appearance/effects configuration into
 * a compact Base64URL token that can be copied or opened to preview
 * and apply the preset.
 */
(function () {
  'use strict';

  const KEY = 'vibe';
  const DEFAULTS = {
    themePreset: 'auto',
    colorHarmony: 'auto',
    vibrancy: 70,
    warmth: 50,
    a11yMode: true,
    matrixVisibility: 80,
    streamDensity: 1,
    animSpeed: 1,
    speechSpeed: 1
  };

  let cachedPreset = null;
  let vibeReady = false;

  const dom = {
    copyBtn: null,
    importBtn: null,
    importForm: null,
    importCancel: null,
    inlineInput: null,
    drawer: null,
    drawerPreview: null,
    drawerApply: null,
    drawerIgnore: null,
    drawerClose: null,
    drawerInput: null
  };

  function init() {
    cacheDom();
    attachEvents();

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      waitForVibe();
    } else {
      document.addEventListener('DOMContentLoaded', waitForVibe, { once: true });
    }
  }

  function cacheDom() {
    dom.copyBtn = document.getElementById('preset-copy-btn');
    dom.importBtn = document.getElementById('preset-import-btn');
    dom.importForm = document.getElementById('preset-import-inline');
    dom.importCancel = document.getElementById('preset-import-cancel');
    dom.inlineInput = dom.importForm ? dom.importForm.querySelector('input[type="url"], input') : null;
    dom.drawer = document.getElementById('preset-import-drawer');
    dom.drawerPreview = document.getElementById('preset-import-preview');
    dom.drawerApply = document.getElementById('preset-import-apply');
    dom.drawerIgnore = document.getElementById('preset-import-ignore');
    dom.drawerClose = document.getElementById('preset-import-close');
    // Drawer has its own input element (if present)
    if (dom.drawer) {
      dom.drawerInput = dom.drawer.querySelector('input[type="url"], input');
    }
  }

  function attachEvents() {
    if (dom.copyBtn) {
      dom.copyBtn.addEventListener('click', copyPresetToClipboard);
    }

    if (dom.importBtn && dom.importForm) {
      dom.importBtn.addEventListener('click', () => toggleInlineImport());
      dom.importForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = dom.inlineInput?.value?.trim();
        if (!value) return;
        handlePresetValue(value);
      });
    }

    if (dom.importCancel && dom.importForm) {
      dom.importCancel.addEventListener('click', () => toggleInlineImport(false));
    }

    if (dom.drawerApply) {
      dom.drawerApply.addEventListener('click', () => {
        if (!cachedPreset) return;
        applyPresetObject(cachedPreset);
        toast('Preset applied 🎉', 'success');
        closeDrawer();
      });
    }

    if (dom.drawerIgnore) {
      dom.drawerIgnore.addEventListener('click', () => {
        toast('Preset ignored', 'info');
        closeDrawer();
      });
    }

    if (dom.drawerClose) {
      dom.drawerClose.addEventListener('click', closeDrawer);
    }
  }

  function waitForVibe() {
    if (vibeReady || typeof window.VibeMe !== 'object') {
      vibeReady = !!window.VibeMe;
      if (vibeReady) {
        parseAndOfferPresetFromURL();
      } else {
        document.addEventListener('vibeme:ready', () => {
          vibeReady = true;
          parseAndOfferPresetFromURL();
        }, { once: true });
      }
      return;
    }

    document.addEventListener('vibeme:ready', () => {
      vibeReady = true;
      parseAndOfferPresetFromURL();
    }, { once: true });
  }

  /** Copy current preset */
  async function copyPresetToClipboard() {
    try {
      const url = serializeCurrentPreset();
      await navigator.clipboard.writeText(url);
      toast('Preset link copied ✅', 'success');
    } catch (err) {
      console.warn('[preset] clipboard write failed', err);
      toast('Unable to copy preset', 'error');
    }
  }

  function toggleInlineImport(force) {
    if (!dom.importForm || !dom.importBtn) return;
    const shouldOpen = typeof force === 'boolean' ? force : dom.importForm.classList.contains('hidden');
    dom.importForm.classList.toggle('hidden', !shouldOpen);
    dom.importBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    if (shouldOpen) {
      dom.inlineInput?.focus();
    }
  }

  function handlePresetValue(value) {
    const token = extractToken(value);
    if (!token) {
      toast('Preset link missing token', 'error');
      return;
    }
    const preset = decodePresetToken(token);
    if (!preset) {
      toast('Preset link is invalid', 'error');
      return;
    }
    cachedPreset = preset;
    renderPreview(preset);
    openDrawer();
  }

  function openDrawer() {
    if (!dom.drawer) return;
    dom.drawer.classList.remove('hidden');
    dom.drawer.classList.add('is-open');
    dom.drawer.setAttribute('aria-hidden', 'false');
    dom.drawer.focus?.();
  }

  function closeDrawer() {
    if (!dom.drawer) return;
    dom.drawer.classList.remove('is-open');
    dom.drawer.classList.add('hidden');
    dom.drawer.setAttribute('aria-hidden', 'true');
    cachedPreset = null;
  }

  /** Serialize current preset */
  function serializeCurrentPreset() {
    const preset = collectCurrentPreset();
    const json = JSON.stringify(preset);
    const encoded = base64UrlEncode(json);
    const origin = location.origin || `${location.protocol}//${location.host}`;
    const path = `${location.pathname || ''}${location.search || ''}`;
    return `${origin}${path}#${KEY}=${encoded}`;
  }

  function collectCurrentPreset() {
    const preset = {};
    try {
      const themePreset = localStorage.getItem('vibeme-theme-preset') || DEFAULTS.themePreset;
      if (themePreset && themePreset !== DEFAULTS.themePreset) preset.themePreset = themePreset;

      const colorPrefs = safeParse(localStorage.getItem('vibeme-color-preferences')) || {};
      if (colorPrefs.harmonyType && colorPrefs.harmonyType !== DEFAULTS.colorHarmony) {
        preset.colorHarmony = colorPrefs.harmonyType;
      }
      if (isFiniteNumber(colorPrefs.vibrancy) && colorPrefs.vibrancy !== DEFAULTS.vibrancy) {
        preset.vibrancy = clamp(colorPrefs.vibrancy, 0, 100);
      }
      if (isFiniteNumber(colorPrefs.warmth) && colorPrefs.warmth !== DEFAULTS.warmth) {
        preset.warmth = clamp(colorPrefs.warmth, 0, 100);
      }
      if (typeof colorPrefs.accessibility === 'boolean' && colorPrefs.accessibility !== DEFAULTS.a11yMode) {
        preset.a11yMode = !!colorPrefs.accessibility;
      }

      const matrixPrefs = safeParse(localStorage.getItem('vibeme-matrix-preferences')) || {};
      if (isFiniteNumber(matrixPrefs.opacity) && matrixPrefs.opacity !== DEFAULTS.matrixVisibility) {
        preset.matrixVisibility = clamp(matrixPrefs.opacity, 10, 100);
      }
      if (isFiniteNumber(matrixPrefs.density) && matrixPrefs.density !== DEFAULTS.streamDensity) {
        preset.streamDensity = clamp(matrixPrefs.density, 0.5, 3);
      }
      if (isFiniteNumber(matrixPrefs.speed) && matrixPrefs.speed !== DEFAULTS.animSpeed) {
        preset.animSpeed = clamp(matrixPrefs.speed, 0.5, 2);
      }
      if (typeof matrixPrefs.blendMode === 'string') preset.blendMode = matrixPrefs.blendMode;
      if (typeof matrixPrefs.highContrast === 'boolean') preset.highContrast = matrixPrefs.highContrast;

      const engine = window.VibeMe?.matrixConfig?.renderMode;
      if (engine) preset.engine = engine;
      const fpsCap = window.VibeMe?.matrixConfig?.canvasConfig?.maxFPS;
      if (isFiniteNumber(fpsCap)) preset.fpsCap = clamp(fpsCap, 30, 144);

      const matrixPreset = localStorage.getItem('vibeme-matrix-preset');
      if (matrixPreset && matrixPreset !== 'auto') preset.matrixPreset = matrixPreset;

      const category = localStorage.getItem('vibeme-category-filter');
      if (category && category !== 'all') preset.quoteCategory = category;

      const speechEnabled = window.VibeMe?.settings?.tts?.enabled;
      if (typeof speechEnabled === 'boolean') preset.speechOn = speechEnabled;
      const speechSpeed = window.VibeMe?.settings?.tts?.rate;
      if (isFiniteNumber(speechSpeed) && Math.abs(speechSpeed - DEFAULTS.speechSpeed) > 0.01) {
        preset.speechSpeed = clamp(speechSpeed, 0.7, 1.5);
      }
      const voice = window.VibeMe?.settings?.tts?.voiceURI;
      if (voice) preset.voice = voice;

      if (window.VibeMe?.settings?.tts?.voiceURI && !preset.voice) {
        preset.voice = window.VibeMe.settings.tts.voiceURI;
      }
    } catch (err) {
      console.warn('[preset] collect failed', err);
    }
    return preset;
  }

  /** Apply preset object */
  function applyPresetObject(raw) {
    if (!vibeReady || !window.VibeMe || !raw) return;
    const preset = normalizePreset(raw);
    if (!preset) return;

    try {
      if (preset.themePreset) {
        applyThemePreset(preset.themePreset);
      }

      if (preset.colorHarmony || isFiniteNumber(preset.vibrancy) || isFiniteNumber(preset.warmth) || typeof preset.a11yMode === 'boolean') {
        applyColorPreferences(preset);
      }

      if (preset.matrixPreset) {
        window.VibeMe.applyMatrixPreset?.(preset.matrixPreset);
        const matrixSelect = document.getElementById('matrix-preset');
        if (matrixSelect) matrixSelect.value = preset.matrixPreset;
      }

      if (isFiniteNumber(preset.matrixVisibility)) {
        const slider = document.getElementById('matrix-opacity');
        if (slider) slider.value = String(Math.round(preset.matrixVisibility));
        window.VibeMe.setMatrixDensity?.(clamp(preset.matrixVisibility / 100, 0.3, 1));
        window.VibeMe.updateMatrixSetting?.('opacity', Math.round(preset.matrixVisibility));
      }

      if (isFiniteNumber(preset.streamDensity)) {
        const slider = document.getElementById('matrix-density');
        if (slider) slider.value = String(preset.streamDensity);
        window.VibeMe.setStreamDensity?.(clamp(preset.streamDensity, 0.5, 3));
        window.VibeMe.updateMatrixSetting?.('density', preset.streamDensity);
      }

      if (isFiniteNumber(preset.animSpeed)) {
        const slider = document.getElementById('matrix-speed');
        if (slider) slider.value = String(preset.animSpeed);
        window.VibeMe.setAnimationSpeed?.(clamp(preset.animSpeed, 0.5, 2));
        window.VibeMe.updateMatrixSetting?.('speed', preset.animSpeed);
      }

      if (typeof preset.blendMode === 'string') {
        const select = document.getElementById('matrix-blend-mode');
        if (select) select.value = preset.blendMode;
        window.VibeMe.updateMatrixSetting?.('blendMode', preset.blendMode);
      }

      if (typeof preset.highContrast === 'boolean') {
        const checkbox = document.getElementById('matrix-high-contrast');
        if (checkbox) checkbox.checked = preset.highContrast;
        window.VibeMe.updateMatrixSetting?.('highContrast', preset.highContrast);
      }

      if (preset.engine) {
        window.VibeMe.setRenderingEngine?.(preset.engine);
        const select = document.getElementById('matrix-render-mode');
        if (select) select.value = preset.engine;
      }

      if (isFiniteNumber(preset.fpsCap)) {
        const slider = document.getElementById('canvas-max-fps');
        if (slider) slider.value = String(Math.round(preset.fpsCap));
        window.VibeMe.setFpsCap?.(clamp(preset.fpsCap, 30, 144));
        window.VibeMe.updateMatrixSetting?.('maxFps', Math.round(preset.fpsCap));
      }

      if (preset.quoteCategory) {
        const select = document.getElementById('category-filter');
        if (select) {
          select.value = preset.quoteCategory;
          select.dispatchEvent(new Event('change'));
        } else {
          localStorage.setItem('vibeme-category-filter', preset.quoteCategory);
          window.VibeMe.state = window.VibeMe.state || {};
          window.VibeMe.state.categoryFilter = preset.quoteCategory;
        }
      }

      if (typeof preset.speechOn === 'boolean' && window.VibeMe.settings?.tts) {
        window.VibeMe.settings.tts.enabled = preset.speechOn;
        updateTtsControls('enabled', preset.speechOn);
      }

      if (isFiniteNumber(preset.speechSpeed) && window.VibeMe.settings?.tts) {
        const rate = clamp(preset.speechSpeed, 0.7, 1.5);
        window.VibeMe.settings.tts.rate = rate;
        updateTtsControls('rate', rate);
      }

      if (preset.voice && window.VibeMe.tts?.voices?.length) {
        const hasVoice = window.VibeMe.tts.voices.some((v) => v.voiceURI === preset.voice);
        if (hasVoice) {
          window.VibeMe.settings.tts.voiceURI = preset.voice;
          updateTtsControls('voice', preset.voice);
        } else {
          toast('Voice not available on this device. Skipped.', 'info');
        }
      }
    } catch (err) {
      console.warn('[preset] failed to apply', err);
      toast('Preset apply failed', 'error');
    }
  }

  function applyThemePreset(name) {
    try {
      localStorage.setItem('vibeme-theme-preset', name);
    } catch (_) {}

    if (!window.VibeMe) return;

    if (name === 'auto') {
      const idx = window.VibeMe.state?.currentQuoteIndex || 0;
      const quote = window.VibeMe.quotes?.[idx];
      const category = quote?.category || 'default';
      const palette = pickPalette(category) || pickPalette('retro_neon');
      if (palette) applyPalette(palette);
    } else {
      const palette = pickPalette(name);
      if (palette) applyPalette(palette);
    }

    const select = document.getElementById('theme-preset');
    if (select) select.value = name;
  }

  function applyColorPreferences(preset) {
    const prefs = safeParse(localStorage.getItem('vibeme-color-preferences')) || {};
    if (preset.colorHarmony) prefs.harmonyType = preset.colorHarmony;
    if (isFiniteNumber(preset.vibrancy)) prefs.vibrancy = clamp(preset.vibrancy, 0, 100);
    if (isFiniteNumber(preset.warmth)) prefs.warmth = clamp(preset.warmth, 0, 100);
    if (typeof preset.a11yMode === 'boolean') prefs.accessibility = preset.a11yMode;
    try {
      localStorage.setItem('vibeme-color-preferences', JSON.stringify(prefs));
    } catch (_) {}

    if (typeof window.VibeMe.updateColorSetting === 'function') {
      if (isFiniteNumber(preset.vibrancy)) window.VibeMe.updateColorSetting('vibrancy', prefs.vibrancy);
      if (isFiniteNumber(preset.warmth)) window.VibeMe.updateColorSetting('warmth', prefs.warmth);
      if (typeof preset.a11yMode === 'boolean') window.VibeMe.updateColorSetting('accessibility', prefs.accessibility);
    }

    const vibrancySlider = document.getElementById('vibrancy-slider');
    if (vibrancySlider && isFiniteNumber(prefs.vibrancy)) {
      vibrancySlider.value = String(prefs.vibrancy);
      const label = document.getElementById('vibrancy-value');
      if (label) label.textContent = `${Math.round(prefs.vibrancy)}%`;
    }
    const warmthSlider = document.getElementById('warmth-slider');
    if (warmthSlider && isFiniteNumber(prefs.warmth)) {
      warmthSlider.value = String(prefs.warmth);
      const label = document.getElementById('warmth-value');
      if (label) label.textContent = `${Math.round(prefs.warmth)}%`;
    }
    const a11yCheckbox = document.getElementById('accessibility-mode');
    if (a11yCheckbox && typeof prefs.accessibility === 'boolean') {
      a11yCheckbox.checked = prefs.accessibility;
    }

    window.VibeMe.applyRandomTheme?.();

    const harmonySelect = document.getElementById('harmony-type');
    if (harmonySelect && prefs.harmonyType) harmonySelect.value = prefs.harmonyType;
  }

  function pickPalette(name) {
    const bank = window.VibeMe?.themes?.colorPalettes?.[name];
    if (!bank || !bank.length) return null;
    return bank[0];
  }

  function applyPalette(palette) {
    if (!palette) return;
    if (typeof window.applyPalette === 'function') {
      window.applyPalette(palette);
      return;
    }
    const root = document.documentElement;
    root.style.setProperty('--color1', palette.color1);
    root.style.setProperty('--color2', palette.color2);
    root.style.setProperty('--color3', palette.color3);
    if (palette.accent) root.style.setProperty('--social-icon-bg', palette.accent);
  }

  function updateTtsControls(key, value) {
    if (key === 'enabled') {
      const checkbox = document.getElementById('tts-enable-checkbox');
      if (checkbox) checkbox.checked = !!value;
    }
    if (key === 'rate') {
      const slider = document.getElementById('tts-rate');
      if (slider) slider.value = String(value);
      const label = document.getElementById('tts-rate-value');
      if (label) label.textContent = `${Number(value).toFixed(1)}x`;
    }
    if (key === 'voice') {
      const select = document.getElementById('tts-voice');
      if (select && [...select.options].some((opt) => opt.value === value)) {
        select.value = value;
      }
    }
  }

  /** Parse preset token from URL hash or query */
  function parseAndOfferPresetFromURL() {
    const token = extractTokenFromLocation();
    if (!token) return;
    const preset = decodePresetToken(token);
    if (!preset) {
      toast('Shared preset was invalid', 'error');
      clearUrlToken();
      return;
    }
    cachedPreset = preset;
    renderPreview(preset);
    openDrawer();
    clearUrlToken();
  }

  function extractTokenFromLocation() {
    const hashMatch = location.hash && location.hash.includes(`${KEY}=`) ? location.hash.match(new RegExp(`${KEY}=([^&]+)`)) : null;
    if (hashMatch && hashMatch[1]) return hashMatch[1];
    const params = new URLSearchParams(location.search || '');
    return params.get(KEY);
  }

  function clearUrlToken() {
    try {
      const url = new URL(location.href);
      url.hash = url.hash.replace(new RegExp(`${KEY}=[^&]+`), '').replace(/^#&?/, '#');
      if (url.hash === '#') url.hash = '';
      url.searchParams.delete(KEY);
      history.replaceState({}, '', url.toString());
    } catch (_) {}
  }

  function extractToken(raw) {
    if (!raw) return null;
    const match = raw.match(new RegExp(`${KEY}=([^&]+)`));
    if (match && match[1]) return match[1];
    return raw.replace(/^#+/, '').trim();
  }

  function decodePresetToken(token) {
    try {
      const json = base64UrlDecode(token);
      const parsed = JSON.parse(json);
      return normalizePreset(parsed);
    } catch (err) {
      console.warn('[preset] decode failed', err);
      return null;
    }
  }

  function normalizePreset(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const preset = {};
    if (typeof raw.themePreset === 'string') preset.themePreset = raw.themePreset;
    if (typeof raw.colorHarmony === 'string') preset.colorHarmony = raw.colorHarmony;
    if (isFiniteNumber(raw.vibrancy)) preset.vibrancy = clamp(raw.vibrancy, 0, 100);
    if (isFiniteNumber(raw.warmth)) preset.warmth = clamp(raw.warmth, 0, 100);
    if (typeof raw.a11yMode === 'boolean') preset.a11yMode = raw.a11yMode;

    if (isFiniteNumber(raw.matrixVisibility)) {
      const value = raw.matrixVisibility <= 1 ? raw.matrixVisibility * 100 : raw.matrixVisibility;
      preset.matrixVisibility = clamp(value, 10, 100);
    }
    if (isFiniteNumber(raw.streamDensity)) preset.streamDensity = clamp(raw.streamDensity, 0.5, 3);
    if (isFiniteNumber(raw.animSpeed)) preset.animSpeed = clamp(raw.animSpeed, 0.5, 2);
    if (typeof raw.blendMode === 'string') preset.blendMode = raw.blendMode;
    if (typeof raw.highContrast === 'boolean') preset.highContrast = raw.highContrast;

    if (typeof raw.engine === 'string') preset.engine = raw.engine;
    if (isFiniteNumber(raw.fpsCap)) preset.fpsCap = clamp(raw.fpsCap, 30, 144);
    if (typeof raw.matrixPreset === 'string') preset.matrixPreset = raw.matrixPreset;
    if (typeof raw.quoteCategory === 'string') preset.quoteCategory = raw.quoteCategory;

    if (typeof raw.speechOn === 'boolean') preset.speechOn = raw.speechOn;
    if (isFiniteNumber(raw.speechSpeed)) preset.speechSpeed = clamp(raw.speechSpeed, 0.7, 1.5);
    if (typeof raw.voice === 'string') preset.voice = raw.voice;

    return preset;
  }

  function renderPreview(preset) {
    if (!dom.drawerPreview) return;
    const colors = getPreviewColors(preset);
    const swatches = colors
      .map((color) => `<span class="preset-preview-swatch" style="background:${color}"></span>`)
      .join('');

    const meta = [];
    if (preset.themePreset) meta.push(`<div><strong>Theme:</strong> ${preset.themePreset}</div>`);
    if (preset.colorHarmony) meta.push(`<div><strong>Harmony:</strong> ${preset.colorHarmony}</div>`);
    if (preset.matrixPreset) meta.push(`<div><strong>Matrix preset:</strong> ${preset.matrixPreset}</div>`);
    if (preset.engine) meta.push(`<div><strong>Engine:</strong> ${preset.engine}</div>`);
    if (preset.fpsCap) meta.push(`<div><strong>FPS cap:</strong> ${Math.round(preset.fpsCap)}</div>`);
    if (preset.quoteCategory) meta.push(`<div><strong>Quotes:</strong> ${preset.quoteCategory}</div>`);
    if (typeof preset.speechOn === 'boolean') meta.push(`<div><strong>Speech:</strong> ${preset.speechOn ? 'On' : 'Off'}</div>`);
    if (preset.voice) meta.push(`<div><strong>Voice:</strong> ${preset.voice}</div>`);

    dom.drawerPreview.innerHTML = `
      <div class="preset-preview-swatches" aria-hidden="true">${swatches}</div>
      <div class="preset-import-meta">${meta.join('') || '<div>No additional metadata</div>'}</div>
    `;
  }

  function getPreviewColors(preset) {
    if (preset.themePreset) {
      const palette = pickPalette(preset.themePreset);
      if (palette) return [palette.color1, palette.color2, palette.color3];
    }
    const root = getComputedStyle(document.documentElement);
    return [
      root.getPropertyValue('--color1') || '#6366f1',
      root.getPropertyValue('--color2') || '#8b5cf6',
      root.getPropertyValue('--color3') || '#a855f7'
    ];
  }

  /** Helpers */
  function base64UrlEncode(input) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64UrlDecode(input) {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (padded.length % 4)) % 4;
    const base64 = padded + '='.repeat(padLen);
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function toast(message, type = 'info', duration = 2200) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type, duration } }));
  }

  function safeParse(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (_) {
      return null;
    }
  }

  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // Initialise immediately
  init();

  // Expose API on window for legacy consumers
  window.PresetLinks = {
    serializeCurrentPreset,
    applyPresetObject,
    parseAndOfferPresetFromURL
  };
})();

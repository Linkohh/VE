import {
  runPerfAutotune,
  applyPerfProfile,
  getPersistedPerfProfile,
  clearPerfProfile,
  deviceHint as getDeviceHint
} from './modules/perfAutotune.js';

const STORAGE_KEY = 'vibeme.perf';
const VARIANT_KEY = 'vibeme.perfVariant';
const OVERRIDE_KEY = 'vibeme.perfOverride';
const SHEET_ID = 'perf-autotune-sheet';
const SUMMARY_ID = 'perf-autotune-summary';
const OVERRIDE_NOTICE_ID = 'perf-manual-override';
const VARIANT_BUTTON_SELECTOR = '[data-perf-variant]';
const RERUN_BUTTON_ID = 'perf-autotune-rerun';

const HIGH_JANK_THRESHOLD_MS = 7;
const MEDIUM_JANK_THRESHOLD_MS = 4;

const state = {
  baselineProfile: null,
  appliedProfile: null,
  variant: loadVariant(),
  running: false
};

let listenersController = new AbortController();

function getListenerSignal() {
  if (listenersController.signal.aborted) {
    listenersController = new AbortController();
  }
  return listenersController.signal;
}

function removeAllListeners() {
  if (!listenersController.signal.aborted) {
    listenersController.abort();
  }
}

function loadVariant() {
  try {
    return localStorage.getItem(VARIANT_KEY) || 'balanced';
  } catch (err) {
    return 'balanced';
  }
}

function persistVariant(variant) {
  try {
    localStorage.setItem(VARIANT_KEY, variant);
  } catch (err) {
    console.warn('[perfAutotuneEntry] failed to persist variant', err);
  }
}

function persistProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('[perfAutotuneEntry] failed to persist profile', err);
  }
}

/**
 * Resolve once the global VibeMe object is available.
 * Prefers an explicit readiness event to avoid polling.
 * @returns {Promise<void>}
 */
function waitForVibeMe() {
  if (window.VibeMe) return Promise.resolve();
  return new Promise((resolve) => {
    const handleReady = () => {
      if (window.VibeMe) {
        window.removeEventListener('vibeme:ready', handleReady);
        resolve();
      }
    };
    window.addEventListener('vibeme:ready', handleReady, { signal: getListenerSignal() });
  });
}

function showSheet() {
  const sheet = document.getElementById(SHEET_ID);
  if (sheet) sheet.classList.remove('hidden');
}

function hideSheet() {
  const sheet = document.getElementById(SHEET_ID);
  if (sheet) sheet.classList.add('hidden');
}

function setSheetStatus(text) {
  const label = document.querySelector('#perf-autotune-sheet [data-status]');
  if (label) label.textContent = text;
}

/**
 * Update the persisted summary element if values changed.
 * @param {import('./modules/perfAutotune.js').PerfProfile | null} profile
 */
function updateSummary(profile) {
  const summaryEl = document.getElementById(SUMMARY_ID);
  if (!summaryEl || !profile) return;
  const engineName = { dom: 'DOM', canvas: 'Canvas', hybrid: 'Hybrid' }[profile.engine] || 'DOM';
  const fps = Math.round(profile.fpsCap || 60);
  const density = profile.matrixDensity ?? 0.8;
  const densityLabel = density < 0.65 ? 'Low density' : density > 0.95 ? 'High density' : 'Medium density';
  const measured = profile.measured || {};
  const avg = measured.avgFPS ? measured.avgFPS.toFixed(0) : '—';
  const stdev = measured.stdevMs || 0;
  const jankLabel = stdev >= HIGH_JANK_THRESHOLD_MS
    ? 'high jank'
    : stdev >= MEDIUM_JANK_THRESHOLD_MS
      ? 'moderate jank'
      : 'low jank';
  const variant = profile.variant || state.variant || 'balanced';
  const variantLabel = variant === 'battery' ? 'Battery Saver' : variant === 'max' ? 'Max Glow' : 'Balanced';

  const nextSummary = `Tuned (${variantLabel}): ${engineName} · ${fps} FPS · ${densityLabel} (avg ${avg} FPS, ${jankLabel}).`;
  if (summaryEl.textContent !== nextSummary) {
    summaryEl.textContent = nextSummary;
  }
}

function updateVariantButtons() {
  const buttons = document.querySelectorAll(VARIANT_BUTTON_SELECTOR);
  buttons.forEach((btn) => {
    const variant = btn.getAttribute('data-perf-variant');
    const isActive = variant === state.variant;
    btn.setAttribute('aria-pressed', String(isActive));
    btn.classList.toggle('bg-emerald-500/30', isActive);
    btn.classList.toggle('text-white', isActive);
  });
}

function updateManualOverrideNotice() {
  const notice = document.getElementById(OVERRIDE_NOTICE_ID);
  if (!notice) return;
  let isActive = false;
  try {
    isActive = Boolean(localStorage.getItem(OVERRIDE_KEY));
  } catch (err) {
    isActive = false;
  }
  notice.classList.toggle('hidden', !isActive);
}

/**
 * Build a derived profile for the selected intensity preset.
 * @param {'balanced'|'battery'|'max'} variant
 * @returns {import('./modules/perfAutotune.js').PerfProfile | null}
 */
function deriveVariantProfile(variant) {
  const base = state.baselineProfile;
  if (!base) return null;
  const profile = {
    ...base,
    measured: base.measured,
    lastRun: base.lastRun,
    deviceHint: base.deviceHint,
    variant
  };
  if (variant === 'battery') {
    profile.fpsCap = Math.max(30, Math.round((base.fpsCap || 60) - 15));
    profile.matrixDensity = Math.max(0.3, Math.min(1.0, (base.matrixDensity ?? 0.8) - 0.2));
    profile.streamDensity = Math.max(0.6, (base.streamDensity ?? 1) - 0.2);
    profile.animSpeed = Math.max(0.7, (base.animSpeed ?? 1) - 0.1);
  } else if (variant === 'max') {
    if ((base.engine || 'dom') === 'canvas') {
      profile.fpsCap = Math.min(144, Math.round((base.fpsCap || 60) + 10));
    }
    profile.matrixDensity = Math.min(1.0, (base.matrixDensity ?? 0.8) + 0.15);
    profile.streamDensity = Math.min(2.0, (base.streamDensity ?? 1) + 0.15);
    profile.animSpeed = Math.min(1.3, (base.animSpeed ?? 1) + 0.05);
  }
  return profile;
}

/**
 * Apply one of the preset variants derived from the baseline profile.
 * @param {'balanced'|'battery'|'max'} variant
 */
function applyVariant(variant) {
  if (!state.baselineProfile) return;
  state.variant = variant;
  persistVariant(variant);
  const profile = deriveVariantProfile(variant) || state.baselineProfile;
  state.appliedProfile = profile;
  applyPerfProfile({ ...profile });
  updateSummary(profile);
  updateVariantButtons();
}

/**
 * Run the autotune workflow and synchronise UI state.
 * @param {{force?: boolean}} [options]
 */
async function runAndApplyAutotune({ force = false } = {}) {
  if (state.running) return;
  state.running = true;
  setRunning(true);
  try {
    await waitForVibeMe();
    const profile = await runPerfAutotune({ force });
    state.baselineProfile = profile;
    state.appliedProfile = profile;
    persistVariant(state.variant);
    if (state.variant && state.variant !== 'balanced') {
      const variantProfile = deriveVariantProfile(state.variant);
      if (variantProfile) {
        state.appliedProfile = variantProfile;
        applyPerfProfile({ ...variantProfile });
      }
    }
    updateSummary(state.appliedProfile);
    updateVariantButtons();
    updateManualOverrideNotice();
  } catch (err) {
    console.error('[perfAutotuneEntry] autotune failed', err);
  } finally {
    state.running = false;
    setRunning(false);
    hideSheet();
  }
}

function setRunning(isRunning) {
  const rerunBtn = document.getElementById(RERUN_BUTTON_ID);
  if (rerunBtn) {
    rerunBtn.disabled = isRunning;
    rerunBtn.textContent = isRunning ? 'Calibrating…' : 'Re-run Autotune';
  }
  setSheetStatus(isRunning ? 'Running device benchmark…' : 'Optimizing performance for your device…');
}

/**
 * Load persisted profile or schedule the first autotune execution.
 */
function scheduleInitialRun() {
  const persisted = getPersistedPerfProfile();
  if (persisted) {
    state.baselineProfile = persisted;
    state.appliedProfile = persisted;
    waitForVibeMe().then(() => {
      applyPerfProfile({ ...persisted });
      updateSummary(persisted);
      updateVariantButtons();
      updateManualOverrideNotice();
      if (state.variant && state.variant !== 'balanced') {
        const variantProfile = deriveVariantProfile(state.variant);
        if (variantProfile) {
          state.appliedProfile = variantProfile;
          applyPerfProfile({ ...variantProfile });
          updateSummary(variantProfile);
        }
      }
    });
    return;
  }

  showSheet();
  const start = () => runAndApplyAutotune({ force: true });
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 2000 });
  } else {
    setTimeout(start, 1000);
  }
}

/**
 * Attach UI event handlers and initialise control states.
 */
function setupUi() {
  const rerun = document.getElementById(RERUN_BUTTON_ID);
  if (rerun) {
    rerun.addEventListener('click', () => runAndApplyAutotune({ force: true }), { signal: getListenerSignal() });
  }

  document.querySelectorAll(VARIANT_BUTTON_SELECTOR).forEach((btn) => {
    btn.addEventListener('click', () => {
      const variant = btn.getAttribute('data-perf-variant');
      applyVariant(variant || 'balanced');
    }, { signal: getListenerSignal() });
  });

  const skipBtn = document.querySelector('#perf-autotune-sheet [data-skip]');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      const fallback = {
        engine: 'dom',
        fpsCap: 45,
        matrixDensity: 0.6,
        streamDensity: 1.0,
        animSpeed: 0.9,
        measured: { avgFPS: 0, stdevMs: 0, samples: 0 },
        lastRun: Date.now(),
        deviceHint: getDeviceHint(),
        variant: 'balanced'
      };
      persistProfile(fallback);
      state.variant = 'balanced';
      persistVariant('balanced');
      state.baselineProfile = fallback;
      state.appliedProfile = fallback;
      applyPerfProfile({ ...fallback });
      updateSummary(fallback);
      updateVariantButtons();
      updateManualOverrideNotice();
      hideSheet();
    }, { signal: getListenerSignal() });
  }

  updateVariantButtons();
  updateManualOverrideNotice();
}

function handleManualOverride() {
  updateManualOverrideNotice();
  const summaryEl = document.getElementById(SUMMARY_ID);
  if (summaryEl) {
    summaryEl.textContent = 'Manual override active. Re-run Autotune to retune based on your device.';
  }
}

function bindGlobalListeners() {
  const signal = getListenerSignal();

  window.addEventListener('vibeme:perfProfileApplied', (event) => {
    const profile = event.detail?.profile;
    if (!profile) return;
    if (!profile.variant) {
      state.baselineProfile = profile;
    }
    state.appliedProfile = profile;
    updateSummary(profile);
    updateVariantButtons();
    updateManualOverrideNotice();
  }, { signal });

  window.addEventListener('vibeme:perf:manualOverride', handleManualOverride, { signal });
  window.addEventListener('storage', (ev) => {
    if (ev.key === OVERRIDE_KEY) {
      updateManualOverrideNotice();
    }
  }, { signal });
}

/**
 * Initialise the autotune entrypoint, binding listeners and scheduling runs.
 */
function initializePerfAutotuneEntry() {
  bindGlobalListeners();
  setupUi();
  scheduleInitialRun();
}

document.addEventListener('DOMContentLoaded', () => {
  initializePerfAutotuneEntry();
}, { once: true, signal: getListenerSignal() });

window.addEventListener('pagehide', () => {
  removeAllListeners();
}, { once: true });

export {
  runAndApplyAutotune,
  applyVariant,
  updateSummary,
  scheduleInitialRun,
  clearPerfProfile,
  initializePerfAutotuneEntry,
  removeAllListeners as disposePerfAutotuneEntry
};

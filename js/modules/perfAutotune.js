const STORAGE_KEY = 'vibeme.perf';
const OVERRIDE_KEY = 'vibeme.perfOverride';
const TWELVE_HOURS = 12 * 60 * 60 * 1000;
const APPLY_GUARD = '__vibemePerfApplying';

export async function runPerfAutotune({ durationMs = 3000, force = false } = {}) {
  const reducedMotion = supportsReducedMotion();
  const persisted = getPersistedPerfProfile();
  const now = Date.now();

  if (reducedMotion) {
    const profile = makeProfile(
      'dom',
      45,
      0.5,
      0.8,
      0.8,
      { avgFPS: 0, stdevMs: 0, samples: 0 }
    );
    applyPerfProfile(profile);
    persist(profile);
    return profile;
  }

  if (!force && persisted && persisted.lastRun && now - persisted.lastRun < TWELVE_HOURS) {
    applyPerfProfile(persisted);
    return persisted;
  }

  try {
    const measured = await microBenchmark(durationMs);
    let profile = chooseProfile(measured);

    const batteryAdjusted = await maybeAdjustForBattery(profile);
    if (batteryAdjusted) {
      profile = batteryAdjusted;
    }

    profile.measured = {
      avgFPS: Number(measured.avgFPS.toFixed(1)),
      stdevMs: Number(measured.stdevMs.toFixed(2)),
      samples: measured.samples
    };
    profile.lastRun = Date.now();
    profile.deviceHint = deviceHint();

    applyPerfProfile(profile);
    persist(profile);
    return profile;
  } catch (err) {
    console.warn('[perfAutotune] benchmark failed, applying safe fallback', err);
    const fallback = makeProfile(
      'dom',
      45,
      0.6,
      1.0,
      0.9,
      { avgFPS: 0, stdevMs: 0, samples: 0 }
    );
    applyPerfProfile(fallback);
    persist(fallback);
    return fallback;
  }
}

export function applyPerfProfile(profile) {
  if (!profile) return;
  try {
    window[APPLY_GUARD] = true;
    clearManualOverrideFlag();
    const engine = profile.engine || 'dom';
    const fpsCap = profile.fpsCap || 60;
    const matrixDensity = profile.matrixDensity ?? 0.8;
    const streamDensity = profile.streamDensity ?? 1.0;
    const animSpeed = profile.animSpeed ?? 1.0;

    callSetter('setRenderingEngine', engine);
    callSetter('setFpsCap', fpsCap);
    callSetter('setMatrixDensity', matrixDensity);
    callSetter('setStreamDensity', streamDensity);
    callSetter('setAnimationSpeed', animSpeed);

    syncUiControls({ engine, fpsCap, matrixDensity, streamDensity, animSpeed });
    dispatchProfileApplied(profile);
  } catch (err) {
    console.error('[perfAutotune] failed to apply profile', err);
  } finally {
    window[APPLY_GUARD] = false;
  }
}

export function getPersistedPerfProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[perfAutotune] unable to parse persisted profile', err);
    return null;
  }
}

export const loadPerfProfile = getPersistedPerfProfile;

export function clearPerfProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[perfAutotune] unable to clear profile', err);
  }
}

function persist(profile) {
  if (!profile) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('[perfAutotune] unable to persist profile', err);
  }
}

async function maybeAdjustForBattery(profile) {
  try {
    const getter = navigator?.getBattery;
    if (!getter) return null;
    const battery = await getter.call(navigator);
    if (!battery || !('savingMode' in battery)) return null;
    if (!battery.savingMode) return null;
    return adjustForBattery(profile);
  } catch (err) {
    console.warn('[perfAutotune] battery query failed', err);
    return null;
  }
}

function adjustForBattery(profile) {
  const adjusted = { ...profile };
  adjusted.fpsCap = Math.max(30, (profile.fpsCap || 60) - 15);
  adjusted.matrixDensity = Math.max(0.4, (profile.matrixDensity ?? 0.8) - 0.1);
  adjusted.streamDensity = Math.max(0.8, (profile.streamDensity ?? 1) - 0.1);
  adjusted.animSpeed = Math.max(0.7, (profile.animSpeed ?? 1) - 0.05);
  adjusted.deviceHint = `${profile.deviceHint || deviceHint()} | battery-saver`;
  return adjusted;
}

async function microBenchmark(durationMs) {
  if (document.visibilityState !== 'visible') {
    throw new Error('hidden-tab');
  }

  const ctxInfo = createBenchmarkContext();
  if (!ctxInfo) {
    return { avgFPS: 60, stdevMs: 0, samples: 1 };
  }

  const { ctx } = ctxInfo;

  // Warmup ~250ms
  const warmupEnd = performance.now() + 250;
  while (performance.now() < warmupEnd) {
    renderTestFrame(ctx);
  }

  const times = [];
  let frames = 0;
  let start = 0;
  let last = 0;

  await new Promise((resolve, reject) => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') {
        cleanup();
        reject(new Error('hidden-tab'));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    function cleanup() {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (ctxInfo.cleanup) {
        try { ctxInfo.cleanup(); } catch (err) { console.warn('[perfAutotune] cleanup failed', err); }
      }
    }

    function finish() {
      cleanup();
      resolve();
    }

    const step = (timestamp) => {
      if (document.visibilityState !== 'visible') {
        cleanup();
        reject(new Error('hidden-tab'));
        return;
      }
      if (!start) {
        start = timestamp;
        last = timestamp;
      }
      renderTestFrame(ctx);
      frames += 1;
      const delta = timestamp - last;
      if (frames > 1) {
        times.push(delta);
      }
      last = timestamp;
      if (timestamp - start >= durationMs) {
        finish();
      } else {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  });

  const stats = computeStats(times);
  return { ...stats, samples: times.length };
}

function createBenchmarkContext() {
  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(320, 160);
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return null;
      return { ctx, cleanup() {} };
    }
  } catch (err) {
    console.warn('[perfAutotune] OffscreenCanvas failed', err);
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 160;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return null;
    return { ctx, cleanup() { canvas.width = 0; canvas.height = 0; } };
  } catch (err) {
    console.warn('[perfAutotune] Canvas creation failed', err);
    return null;
  }
}

function renderTestFrame(ctx) {
  if (!ctx) return;
  const { width, height } = ctx.canvas || { width: 320, height: 160 };
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < 5; i += 1) {
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    const radius = 30 + Math.random() * 80;
    ctx.arc(Math.random() * width, Math.random() * height, radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 60%)`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.font = '16px "Roboto Mono", monospace';
  for (let i = 0; i < 140; i += 1) {
    const charCode = 0x30A0 + Math.floor(Math.random() * 96);
    ctx.fillStyle = i % 2 === 0 ? '#b3f5ff' : '#00d0ff';
    ctx.fillText(String.fromCharCode(charCode), Math.random() * width, Math.random() * height);
  }
}

function computeStats(times) {
  if (!times.length) {
    return { avgFPS: 60, stdevMs: 0 };
  }
  const total = times.reduce((acc, val) => acc + val, 0);
  const mean = total / times.length;
  const variance = times.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / times.length;
  const stdevMs = Math.sqrt(Math.max(variance, 0));
  const avgFPS = 1000 / mean;
  return { avgFPS, stdevMs };
}

function chooseProfile({ avgFPS, stdevMs }) {
  const janky = stdevMs >= 7;
  if (avgFPS < 30 || janky) {
    return makeProfile('dom', 45, 0.6, 1.0, 0.9, { avgFPS, stdevMs });
  }
  if (avgFPS <= 50) {
    return makeProfile('hybrid', 60, 0.85, 1.2, 1.0, { avgFPS, stdevMs });
  }
  return makeProfile('canvas', 90, 1.0, 1.5, 1.1, { avgFPS, stdevMs });
}

function makeProfile(engine, fpsCap, matrixDensity, streamDensity, animSpeed, measured) {
  return {
    engine,
    fpsCap,
    matrixDensity,
    streamDensity,
    animSpeed,
    measured: measured || { avgFPS: 0, stdevMs: 0, samples: 0 },
    lastRun: Date.now(),
    deviceHint: deviceHint()
  };
}

function supportsReducedMotion() {
  try {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    return false;
  }
}

function deviceHint() {
  const parts = [];
  try {
    parts.push(navigator.platform || 'unknown-platform');
  } catch (err) {
    parts.push('platform-unknown');
  }
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        parts.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (err) {
    parts.push('gl-unknown');
  }
  return parts.filter(Boolean).join(' | ');
}

function callSetter(name, value) {
  const target = window.VibeMe && typeof window.VibeMe[name] === 'function'
    ? window.VibeMe[name]
    : window[name];
  if (typeof target === 'function') {
    target(value);
  }
}

function syncUiControls(profile) {
  const { engine, fpsCap, matrixDensity, streamDensity, animSpeed } = profile;
  const engineSelect = document.querySelector('[data-setting="rendering-engine"]')
    || document.getElementById('matrix-render-mode');
  if (engineSelect) {
    engineSelect.value = engine;
  }
  const fpsSlider = document.querySelector('[data-setting="max-fps"]')
    || document.getElementById('canvas-max-fps');
  if (fpsSlider) {
    fpsSlider.value = String(Math.round(fpsCap));
    fpsSlider.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const matrixOpacity = document.querySelector('[data-setting="matrix-visibility"]')
    || document.getElementById('matrix-opacity');
  if (matrixOpacity) {
    matrixOpacity.value = String(Math.round(matrixDensity * 100));
    matrixOpacity.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const densitySlider = document.querySelector('[data-setting="stream-density"]')
    || document.getElementById('matrix-density');
  if (densitySlider) {
    densitySlider.value = String(streamDensity);
    densitySlider.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const speedSlider = document.querySelector('[data-setting="anim-speed"]')
    || document.getElementById('matrix-speed');
  if (speedSlider) {
    speedSlider.value = String(animSpeed);
    speedSlider.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function dispatchProfileApplied(profile) {
  try {
    const event = new CustomEvent('vibeme:perfProfileApplied', { detail: { profile } });
    window.dispatchEvent(event);
  } catch (err) {
    console.warn('[perfAutotune] unable to dispatch profile event', err);
  }
}

function clearManualOverrideFlag() {
  try {
    localStorage.removeItem(OVERRIDE_KEY);
  } catch (err) {
    console.warn('[perfAutotune] unable to clear override flag', err);
  }
}

if (typeof window !== 'undefined') {
  window.VibeMePerfAutotune = {
    runPerfAutotune,
    applyPerfProfile,
    getPersistedPerfProfile,
    clearPerfProfile,
    loadPerfProfile
  };
}

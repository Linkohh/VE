(function () {
  const STORAGE_KEY = 'ambient:lastSession';
  const HISTORY_KEY = 'ambient:sessionHistory';
  const CIRCUMFERENCE = 2 * Math.PI * 54;
  const DEFAULT_DURATION = 15;
  const MIN_DURATION = 3;
  const MAX_DURATION = 90;
  const BREATHE_STEPS = [
    { name: 'inhale', label: 'Inhale', duration: 4000 },
    { name: 'hold', label: 'Hold', duration: 4000 },
    { name: 'exhale', label: 'Exhale', duration: 6000 }
  ];
  const PROFILES = {
    focus: {
      quoteIntervalMs: 90_000,
      speechOn: true,
      speechSpeed: 0.9,
      matrixDensity: 1.25,
      matrixDensityReduced: 0.95,
      animInterval: 620,
      animIntervalReduced: 780,
      chime: false
    },
    breathe: {
      quoteIntervalMs: 0,
      speechOn: false,
      speechSpeed: 0.85,
      matrixDensity: 0.85,
      matrixDensityReduced: 0.7,
      animInterval: 880,
      animIntervalReduced: 980,
      chime: true
    },
    reset: {
      quoteIntervalMs: 30_000,
      speechOn: true,
      speechSpeed: 1.05,
      matrixDensity: 1.55,
      matrixDensityReduced: 1.1,
      animInterval: 480,
      animIntervalReduced: 560,
      chime: false
    }
  };

  const state = {
    running: false,
    paused: false,
    type: 'focus',
    phase: 'idle',
    phaseIndex: 0,
    phaseStart: 0,
    phaseEnds: 0,
    totalMs: 0,
    remainingMs: 0,
    endsAt: 0,
    durations: { windIn: 0, active: 0, windDown: 0 },
    lastPhaseIntensity: null,
    pauseRemaining: 0,
    pausePhaseRemaining: 0
  };

  const timers = {
    tick: 0,
    cadence: 0,
    breathe: 0
  };

  const ui = {
    typeSelect: null,
    durationButtons: [],
    customInput: null,
    startBtn: null,
    pauseBtn: null,
    stopBtn: null,
    quickBtn: null,
    hud: null,
    hudPhase: null,
    hudRemaining: null,
    hudPause: null,
    hudStop: null,
    ring: null,
    streakLabel: null,
    breatheOverlay: null,
    breatheLabel: null
  };

  let vibe = null;
  let baseline = null;
  let lastApplied = { density: null, interval: null };
  let lastSelection = { type: 'focus', minutes: DEFAULT_DURATION };
  let reduceMotion = false;
  let initDone = false;

  const AmbientSessions = {
    initAmbientSessions,
    startSession,
    pauseSession,
    stopSession,
    getSessionState,
    toggleQuickStart
  };

  function initAmbientSessions() {
    if (initDone) return;
    initDone = true;

    reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      document.body.classList.add('ambient-reduced');
    }

    document.addEventListener('DOMContentLoaded', () => {
      cacheElements();
      attachUIHandlers();
      hydrateFromStorage();
      updateUIState();
    });

    document.addEventListener('vibeme:ready', (event) => {
      const instance = event?.detail?.vibeMe || window.VibeMe;
      if (instance) {
        vibe = instance;
      }
    });

    if (window.VibeMe) {
      vibe = window.VibeMe;
    }
  }

  function cacheElements() {
    ui.typeSelect = document.getElementById('ambient-session-type');
    ui.durationButtons = Array.from(document.querySelectorAll('.ambient-duration-btn'));
    ui.customInput = document.getElementById('ambient-session-custom');
    ui.startBtn = document.getElementById('ambient-session-start');
    ui.pauseBtn = document.getElementById('ambient-session-pause');
    ui.stopBtn = document.getElementById('ambient-session-stop');
    ui.quickBtn = document.getElementById('ambient-session-quick-btn');
    ui.hud = document.getElementById('ambient-session-hud');
    ui.hudPhase = document.getElementById('ambient-session-phase');
    ui.hudRemaining = document.getElementById('ambient-session-remaining');
    ui.hudPause = document.getElementById('ambient-hud-pause');
    ui.hudStop = document.getElementById('ambient-hud-stop');
    ui.ring = document.querySelector('.ambient-session-ring-progress');
    ui.streakLabel = document.getElementById('ambient-session-streak');
    ui.breatheOverlay = document.getElementById('ambient-breathe-overlay');
    ui.breatheLabel = document.getElementById('ambient-breathe-label');
  }

  function attachUIHandlers() {
    if (ui.typeSelect) {
      ui.typeSelect.addEventListener('change', (e) => {
        lastSelection.type = sanitizeType(e.target.value);
        persistSelection();
      });
    }

    ui.durationButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = Number(btn.getAttribute('data-minutes'));
        if (!Number.isFinite(value)) return;
        lastSelection.minutes = clamp(value, MIN_DURATION, MAX_DURATION);
        markActiveDuration(btn);
        if (ui.customInput) {
          ui.customInput.value = '';
        }
        persistSelection();
      });
    });

    if (ui.customInput) {
      ui.customInput.addEventListener('input', (event) => {
        const value = Number(event.target.value);
        if (!Number.isFinite(value)) return;
        lastSelection.minutes = clamp(value, MIN_DURATION, MAX_DURATION);
        clearDurationHighlights();
        persistSelection();
      });
    }

    if (ui.startBtn) {
      ui.startBtn.addEventListener('click', () => {
        if (state.running && state.paused) {
          resumeSession();
        } else {
          startSession({ type: lastSelection.type, minutes: lastSelection.minutes });
        }
      });
    }

    if (ui.pauseBtn) {
      ui.pauseBtn.addEventListener('click', () => {
        if (!state.running) return;
        if (state.paused) {
          resumeSession();
        } else {
          pauseSession();
        }
      });
    }

    if (ui.stopBtn) {
      ui.stopBtn.addEventListener('click', () => stopSession());
    }

    if (ui.quickBtn) {
      ui.quickBtn.addEventListener('click', () => toggleQuickStart());
    }

    if (ui.hudPause) {
      ui.hudPause.addEventListener('click', () => {
        if (state.paused) {
          resumeSession();
        } else {
          pauseSession();
        }
      });
    }

    if (ui.hudStop) {
      ui.hudStop.addEventListener('click', () => stopSession());
    }
  }

  function hydrateFromStorage() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored && stored.type) {
        lastSelection.type = sanitizeType(stored.type);
      }
      if (stored && Number.isFinite(stored.minutes)) {
        lastSelection.minutes = clamp(stored.minutes, MIN_DURATION, MAX_DURATION);
      }
    } catch (err) {
      console.warn('[ambient] failed to parse stored session selection', err);
    }

    updateSelectionUI();
    updateStreak();
  }

  function sanitizeType(type) {
    return Object.prototype.hasOwnProperty.call(PROFILES, type) ? type : 'focus';
  }

  function updateSelectionUI() {
    if (ui.typeSelect) {
      ui.typeSelect.value = lastSelection.type;
    }
    if (ui.customInput) {
      ui.customInput.value = '';
    }
    let matchedPreset = false;
    ui.durationButtons.forEach((btn) => {
      const value = Number(btn.getAttribute('data-minutes'));
      if (value === lastSelection.minutes) {
        matchedPreset = true;
        markActiveDuration(btn);
      }
    });
    if (!matchedPreset && ui.customInput) {
      ui.customInput.value = lastSelection.minutes;
      clearDurationHighlights();
    }
  }

  function markActiveDuration(button) {
    clearDurationHighlights();
    button.classList.add('is-active');
  }

  function clearDurationHighlights() {
    ui.durationButtons.forEach((btn) => btn.classList.remove('is-active'));
  }

  function persistSelection() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lastSelection));
    } catch (_) {}
    updateSelectionUI();
  }

  function updateStreak() {
    if (!ui.streakLabel) return;
    let count = 0;
    try {
      count = Number(localStorage.getItem(HISTORY_KEY) || '0');
    } catch (_) {}
    if (count > 0) {
      ui.streakLabel.textContent = `${count} session${count === 1 ? '' : 's'} completed`;
    } else {
      ui.streakLabel.textContent = '';
    }
  }

  function startSession(options = {}) {
    const requestedType = sanitizeType(options.type || lastSelection.type);
    const requestedMinutes = clamp(Number(options.minutes) || lastSelection.minutes || DEFAULT_DURATION, MIN_DURATION, MAX_DURATION);

    if (!vibe) {
      vibe = window.VibeMe;
    }

    if (!vibe) {
      console.warn('[ambient] VibeMe instance not ready; session postponed');
      return;
    }

    if (state.running) {
      stopSession({ silent: true });
    }

    lastSelection = { type: requestedType, minutes: requestedMinutes };
    persistSelection();

    captureBaseline();
    prepareEnvironment();

    const now = performance.now();
    const totalMs = requestedMinutes * 60_000;
    const durations = computePhaseDurations(totalMs);

    state.running = true;
    state.paused = false;
    state.type = requestedType;
    state.durations = durations;
    state.totalMs = totalMs;
    state.remainingMs = totalMs;
    state.phaseIndex = 0;
    state.phase = 'windIn';
    state.phaseStart = now;
    state.phaseEnds = now + durations.windIn;
    state.endsAt = now + totalMs;
    state.lastPhaseIntensity = null;

    applyProfileSpeech();
    updateBodyClasses();
    showHud(true);
    updateUIState();
    scheduleCadence();
    startTickLoop();
    if (state.type === 'breathe') {
      startBreathingLoop();
    }

    dispatch('sessionstart', { type: state.type, minutes: requestedMinutes });
  }

  function computePhaseDurations(totalMs) {
    let windIn = clamp(totalMs * 0.1, 10_000, 20_000);
    let windDown = clamp(totalMs * 0.12, 20_000, 30_000);
    let active = totalMs - windIn - windDown;
    if (active < 60_000) {
      const deficit = 60_000 - active;
      const reduceIn = Math.min(deficit / 2, Math.max(0, windIn - 8_000));
      const reduceDown = Math.min(deficit - reduceIn, Math.max(0, windDown - 12_000));
      windIn -= reduceIn;
      windDown -= reduceDown;
      active = Math.max(30_000, totalMs - windIn - windDown);
    }
    if (active <= 0) {
      active = Math.max(20_000, totalMs * 0.6);
      const remainder = totalMs - active;
      windIn = remainder / 2;
      windDown = remainder / 2;
    }
    return { windIn, active, windDown };
  }

  function captureBaseline() {
    baseline = {
      matrixDensity: vibe?.matrixConfig?.densityMultiplier,
      matrixInterval: vibe?.matrixConfig?.updateInterval,
      ttsEnabled: vibe?.settings?.tts?.enabled,
      ttsRate: vibe?.settings?.tts?.rate,
      timerWasRunning: vibe?.state?.timerInterval ? !vibe.state.isPaused : false,
      countdownValue: vibe?.state?.countdown,
      quoteTimer: vibe?.state?.timerInterval
    };
    if (vibe?.state) {
      vibe.state.isPaused = true;
      if (vibe.state.timerInterval) {
        clearInterval(vibe.state.timerInterval);
        vibe.state.timerInterval = null;
      }
    }
  }

  function prepareEnvironment() {
    lastApplied = { density: vibe?.matrixConfig?.densityMultiplier ?? null, interval: vibe?.matrixConfig?.updateInterval ?? null };
  }

  function applyProfileSpeech() {
    if (!vibe?.settings?.tts) return;
    const profile = PROFILES[state.type];
    if (!profile) return;

    const enable = !!profile.speechOn;
    if (typeof baseline.ttsEnabled === 'boolean') {
      vibe.settings.tts.enabled = enable;
      const checkbox = document.getElementById('tts-enable-checkbox');
      if (checkbox) checkbox.checked = enable;
    }

    if (typeof profile.speechSpeed === 'number' && typeof baseline.ttsRate === 'number') {
      const clamped = clamp(profile.speechSpeed, 0.7, 1.4);
      vibe.settings.tts.rate = clamped;
      const slider = document.getElementById('tts-rate');
      const label = document.getElementById('tts-rate-value');
      if (slider) slider.value = String(clamped);
      if (label) label.textContent = `${clamped.toFixed(1)}x`;
    }
  }

  function startTickLoop() {
    cancelAnimationFrame(timers.tick);
    const loop = () => {
      if (!state.running) return;
      if (!state.paused) {
        const now = performance.now();
        state.remainingMs = Math.max(0, state.endsAt - now);
        if (now >= state.phaseEnds) {
          advancePhase(now);
        }
        if (state.remainingMs <= 0) {
          completeSession();
          return;
        }
        updateEnvironment(now);
      }
      updateHud();
      timers.tick = requestAnimationFrame(loop);
    };
    timers.tick = requestAnimationFrame(loop);
  }

  function scheduleCadence() {
    clearTimeout(timers.cadence);
    const profile = PROFILES[state.type];
    if (!profile || state.paused) return;
    if (!profile.quoteIntervalMs) return;

    const phaseMultiplier = state.phase === 'windIn' ? 1.25 : state.phase === 'windDown' ? 1.4 : 1;
    const nextDelay = profile.quoteIntervalMs * phaseMultiplier;
    timers.cadence = setTimeout(() => {
      if (!state.running || state.paused) return;
      if (typeof vibe?.updateQuote === 'function') {
        vibe.updateQuote();
      }
      scheduleCadence();
    }, nextDelay);
  }

  function startBreathingLoop() {
    clearTimeout(timers.breathe);
    if (!state.running || state.type !== 'breathe') return;

    let index = 0;
    const loop = () => {
      if (!state.running || state.type !== 'breathe' || state.paused) return;
      const step = BREATHE_STEPS[index];
      applyBreatheStep(step);
      index = (index + 1) % BREATHE_STEPS.length;
      timers.breathe = setTimeout(loop, step.duration);
    };
    loop();
  }

  function applyBreatheStep(step) {
    if (!step) return;
    if (ui.breatheLabel) {
      ui.breatheLabel.textContent = step.label;
    }
    document.body.dataset.breathePhase = step.name;
    const profile = PROFILES[state.type];
    if (profile?.chime && typeof vibe?.playSound === 'function') {
      try {
        vibe.playSound('success');
      } catch (_) {}
    }
  }

  function updateEnvironment(now) {
    const profile = PROFILES[state.type];
    if (!profile || !vibe?.matrixConfig) return;

    const phaseDuration = state.durations[state.phase];
    const elapsed = now - state.phaseStart;
    let intensity = 1;
    if (state.phase === 'windIn') {
      intensity = clamp(elapsed / Math.max(1, phaseDuration), 0, 1);
    } else if (state.phase === 'windDown') {
      intensity = 1 - clamp(elapsed / Math.max(1, phaseDuration), 0, 1);
    }

    if (state.lastPhaseIntensity === intensity) return;
    state.lastPhaseIntensity = intensity;

    const targetDensity = reduceMotion ? profile.matrixDensityReduced ?? profile.matrixDensity : profile.matrixDensity;
    const targetInterval = reduceMotion ? profile.animIntervalReduced ?? profile.animInterval : profile.animInterval;

    if (typeof targetDensity === 'number') {
      const base = typeof baseline.matrixDensity === 'number' ? baseline.matrixDensity : vibe.matrixConfig.densityMultiplier || 1.2;
      const applied = lerp(base, targetDensity, intensity);
      if (Math.abs((vibe.matrixConfig.densityMultiplier || 0) - applied) > 0.05) {
        vibe.matrixConfig.densityMultiplier = applied;
        if (typeof vibe.handleMatrixResize === 'function') {
          vibe.handleMatrixResize();
        }
      }
    }

    if (typeof targetInterval === 'number') {
      const baseInterval = typeof baseline.matrixInterval === 'number' ? baseline.matrixInterval : vibe.matrixConfig.updateInterval || 600;
      const appliedInterval = lerp(baseInterval, targetInterval, intensity);
      if (Math.abs((vibe.matrixConfig.updateInterval || 0) - appliedInterval) > 5) {
        vibe.matrixConfig.updateInterval = appliedInterval;
        if (typeof vibe.startMatrixUpdates === 'function') {
          vibe.startMatrixUpdates();
        }
      }
    }
  }

  function advancePhase(now) {
    const order = ['windIn', 'active', 'windDown'];
    state.phaseIndex = Math.min(order.length - 1, state.phaseIndex + 1);
    state.phase = order[state.phaseIndex];
    state.phaseStart = now;
    state.phaseEnds = now + state.durations[state.phase];
    state.lastPhaseIntensity = null;
    scheduleCadence();
    if (state.type === 'breathe' && !state.paused) {
      startBreathingLoop();
    }
    updateHud();
    dispatch('phasechange', { phase: state.phase });
  }

  function updateHud() {
    if (!ui.hudPhase || !ui.hudRemaining || !ui.ring) return;
    if (!state.running) {
      ui.hudPhase.textContent = 'Idle';
      ui.hudRemaining.textContent = '00:00';
      ui.ring.style.strokeDashoffset = String(CIRCUMFERENCE);
      return;
    }

    const phaseLabel = state.paused ? 'Paused' : phaseName(state.phase);
    ui.hudPhase.textContent = phaseLabel;

    const remaining = Math.max(0, state.remainingMs);
    const minutes = Math.floor(remaining / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1000);
    ui.hudRemaining.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const progress = 1 - remaining / Math.max(1, state.totalMs);
    const offset = CIRCUMFERENCE * (1 - clamp(progress, 0, 1));
    ui.ring.style.strokeDashoffset = String(offset);

    const pauseLabel = state.paused ? 'Resume' : 'Pause';
    if (ui.pauseBtn) {
      ui.pauseBtn.textContent = pauseLabel;
      ui.pauseBtn.classList.remove('hidden');
      ui.pauseBtn.setAttribute('aria-pressed', state.paused ? 'true' : 'false');
    }
    if (ui.hudPause) {
      ui.hudPause.innerHTML = state.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }
    if (ui.stopBtn) {
      ui.stopBtn.classList.remove('hidden');
    }
  }

  function phaseName(phase) {
    switch (phase) {
      case 'windIn':
        return 'Wind In';
      case 'active':
        return 'Active';
      case 'windDown':
        return 'Wind Down';
      default:
        return 'Session';
    }
  }

  function pauseSession() {
    if (!state.running || state.paused) return;
    state.paused = true;
    const now = performance.now();
    state.pauseRemaining = state.endsAt - now;
    state.pausePhaseRemaining = state.phaseEnds - now;
    clearTimeout(timers.cadence);
    clearTimeout(timers.breathe);
    updateHud();
    updateUIState();
    dispatch('sessionpause', { type: state.type });
  }

  function resumeSession() {
    if (!state.running || !state.paused) return;
    const now = performance.now();
    state.paused = false;
    state.endsAt = now + state.pauseRemaining;
    state.phaseEnds = now + state.pausePhaseRemaining;
    scheduleCadence();
    if (state.type === 'breathe') {
      startBreathingLoop();
    }
    updateHud();
    updateUIState();
    dispatch('sessionresume', { type: state.type });
  }

  function stopSession(options = {}) {
    if (!state.running) return;
    clearTimeout(timers.cadence);
    clearTimeout(timers.breathe);
    cancelAnimationFrame(timers.tick);

    restoreBaseline();
    state.running = false;
    state.paused = false;
    state.phase = 'idle';
    state.phaseIndex = 0;
    state.remainingMs = 0;
    state.lastPhaseIntensity = null;

    updateBodyClasses();
    showHud(false);
    updateHud();
    updateUIState();

    if (options.completed) {
      incrementHistory();
    }

    dispatch('sessionstop', { type: state.type, completed: !!options.completed });
  }

  function restoreBaseline() {
    if (!baseline || !vibe) return;
    if (typeof baseline.matrixDensity === 'number') {
      vibe.matrixConfig.densityMultiplier = baseline.matrixDensity;
      if (typeof vibe.handleMatrixResize === 'function') {
        vibe.handleMatrixResize();
      }
    }
    if (typeof baseline.matrixInterval === 'number') {
      vibe.matrixConfig.updateInterval = baseline.matrixInterval;
      if (typeof vibe.startMatrixUpdates === 'function') {
        vibe.startMatrixUpdates();
      }
    }
    if (typeof baseline.ttsEnabled === 'boolean' && vibe?.settings?.tts) {
      vibe.settings.tts.enabled = baseline.ttsEnabled;
      const checkbox = document.getElementById('tts-enable-checkbox');
      if (checkbox) checkbox.checked = baseline.ttsEnabled;
    }
    if (typeof baseline.ttsRate === 'number' && vibe?.settings?.tts) {
      vibe.settings.tts.rate = baseline.ttsRate;
      const slider = document.getElementById('tts-rate');
      const label = document.getElementById('tts-rate-value');
      if (slider) slider.value = String(baseline.ttsRate);
      if (label) label.textContent = `${baseline.ttsRate.toFixed(1)}x`;
    }
    if (baseline.timerWasRunning && typeof vibe.startTimer === 'function') {
      vibe.state.isPaused = false;
      vibe.startTimer();
    }
    if (ui.breatheOverlay) {
      document.body.removeAttribute('data-breathe-phase');
    }
  }

  function completeSession() {
    stopSession({ completed: true });
    showToast('Session complete 🎉', 'success', 2400);
  }

  function updateBodyClasses() {
    document.body.classList.toggle('ambient-active', state.running);
    document.body.classList.toggle('ambient-breathe', state.running && state.type === 'breathe');
  }

  function showHud(show) {
    if (!ui.hud) return;
    if (show) {
      ui.hud.classList.remove('hidden');
    } else {
      ui.hud.classList.add('hidden');
    }
  }

  function updateUIState() {
    if (ui.startBtn) {
      ui.startBtn.textContent = state.running && !state.paused ? 'Restart Session' : (state.paused ? 'Resume Session' : 'Start Session');
    }
    if (ui.pauseBtn) {
      ui.pauseBtn.classList.toggle('hidden', !state.running);
      ui.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
    }
    if (ui.stopBtn) {
      ui.stopBtn.classList.toggle('hidden', !state.running);
    }
    if (ui.quickBtn) {
      const label = ui.quickBtn.querySelector('span');
      if (label) {
        label.textContent = state.running ? 'Stop Session' : 'Start Session';
      }
    }
    updateStreak();
  }

  function incrementHistory() {
    let count = 0;
    try {
      count = Number(localStorage.getItem(HISTORY_KEY) || '0');
    } catch (_) {}
    count += 1;
    try {
      localStorage.setItem(HISTORY_KEY, String(count));
    } catch (_) {}
    updateStreak();
  }

  function getSessionState() {
    return {
      running: state.running,
      paused: state.paused,
      type: state.type,
      phase: state.phase,
      remainingMs: state.remainingMs
    };
  }

  function toggleQuickStart() {
    if (state.running) {
      stopSession();
    } else {
      startSession({ type: lastSelection.type, minutes: lastSelection.minutes });
    }
  }

  function dispatch(name, detail) {
    document.dispatchEvent(new CustomEvent(`ambient:${name}`, { detail }));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function showToast(message, type, ms) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type, ms);
    }
  }

  initAmbientSessions();

  window.AmbientSessions = AmbientSessions;
})();

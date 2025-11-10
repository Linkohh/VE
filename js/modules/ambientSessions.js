/*
 * Ambient Sessions Orchestrator
 * ---------------------------------------------
 * Provides guided ambient sessions (focus / breathe / reset)
 * that temporarily orchestrate quotes, visuals, audio cues,
 * and timing. Integrates directly with the legacy VibeMe app
 * without requiring ES module imports.
 */
(function () {
  'use strict';

  const STORAGE_LAST = 'vibeme.ambient:last';
  const STORAGE_HISTORY = 'vibeme.ambient:history';
  const WIND_IN_MS = 15_000;
  const WIND_DOWN_MS = 25_000;
  const MIN_MINUTES = 3;
  const DEFAULT_MINUTES = 15;
  const HUD_CIRCUMFERENCE = 2 * Math.PI * 54; // r=54 from SVG

  const PROFILES = {
    focus: {
      label: 'Focus',
      quoteIntervalMs: 90_000,
      mantraIntervalMs: 0,
      speech: { enabled: true, rate: 0.9 },
      matrix: { density: 0.82, stream: 1.05, speed: 0.92 },
      fpsCap: 55,
      chime: false
    },
    breathe: {
      label: 'Breathe',
      quoteIntervalMs: 0,
      mantraIntervalMs: 14_000,
      speech: { enabled: false, rate: 1.0 },
      matrix: { density: 0.68, stream: 0.9, speed: 0.78 },
      fpsCap: 48,
      chime: true
    },
    reset: {
      label: 'Reset',
      quoteIntervalMs: 30_000,
      mantraIntervalMs: 0,
      speech: { enabled: true, rate: 1.05 },
      matrix: { density: 0.88, stream: 1.18, speed: 1.04 },
      fpsCap: 60,
      chime: true
    }
  };

  const BREATHE_STEPS = [
    { phase: 'inhale', label: 'Inhale', duration: 4000 },
    { phase: 'hold', label: 'Hold', duration: 4000 },
    { phase: 'exhale', label: 'Exhale', duration: 6000 }
  ];

  const BREATHE_MANTRAS = [
    'Breathe in calm, breathe out tension.',
    'You are here. You are safe.',
    'Soften the shoulders. Lengthen the spine.',
    'Inhale clarity. Exhale the clutter.',
    'Let the mind rest like still water.'
  ];

  const PHASE_LABELS = {
    idle: 'Idle',
    windIn: 'Wind In',
    active: 'Active',
    windDown: 'Wind Down'
  };

  const state = {
    running: false,
    paused: false,
    type: null,
    minutes: DEFAULT_MINUTES,
    phase: 'idle',
    phases: [],
    phaseIndex: -1,
    totalMs: 0,
    remainingMs: 0,
    endsAt: 0,
    phaseEndsAt: 0,
    phaseStartedAt: 0,
    pausePhaseRemaining: 0,
    profile: null
  };

  let rafId = 0;
  let cadenceTimer = 0;
  let breatheTimer = 0;
  let breatheIndex = 0;
  let lastMantraIndex = -1;
  let currentMantra = '';
  let currentBreathStepLabel = '';
  let vibeReady = false;
  let baseline = null;
  let reduceMotion = false;

  const dom = {
    typeSelect: null,
    durationButtons: [],
    customInput: null,
    startBtn: null,
    pauseBtn: null,
    stopBtn: null,
    quickBtn: null,
    hud: null,
    hudPhase: null,
    hudTime: null,
    hudRing: null,
    hudPauseBtn: null,
    hudStopBtn: null,
    streakLabel: null,
    breatheOverlay: null,
    breathePrompt: null,
    breatheStart: null,
    breathePause: null,
    breatheClose: null
  };

  /** --------------------
   * Initialization
   * -------------------- */
  function initAmbientSessions() {
    cacheDom();
    const mql = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    reduceMotion = !!(mql && mql.matches);

    attachUiListeners();
    loadLastSession();
    updateStreakLabel();

    if (reduceMotion && dom.typeSelect) {
      dom.typeSelect.value = 'focus';
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      waitForVibe();
    } else {
      document.addEventListener('DOMContentLoaded', waitForVibe, { once: true });
    }
  }

  function waitForVibe() {
    if (vibeReady || typeof window.VibeMe !== 'object') {
      vibeReady = !!window.VibeMe;
      return;
    }

    const ready = () => {
      vibeReady = true;
      document.removeEventListener('vibeme:ready', ready);
    };

    document.addEventListener('vibeme:ready', ready, { once: true });
  }

  function cacheDom() {
    dom.typeSelect = document.getElementById('ambient-session-type');
    dom.durationButtons = Array.from(document.querySelectorAll('.ambient-duration-btn'));
    dom.customInput = document.getElementById('ambient-session-custom');
    dom.startBtn = document.getElementById('ambient-session-start');
    dom.pauseBtn = document.getElementById('ambient-session-pause');
    dom.stopBtn = document.getElementById('ambient-session-stop');
    dom.quickBtn = document.getElementById('ambient-session-quick-btn');
    dom.hud = document.getElementById('ambient-session-hud');
    dom.hudPhase = document.getElementById('ambient-session-phase');
    dom.hudTime = document.getElementById('ambient-session-remaining');
    dom.hudRing = document.querySelector('.ambient-session-ring-progress');
    dom.hudPauseBtn = document.getElementById('ambient-hud-pause');
    dom.hudStopBtn = document.getElementById('ambient-hud-stop');
    dom.streakLabel = document.getElementById('ambient-session-streak');
    dom.breatheOverlay = document.getElementById('ambient-breathe-overlay');
    dom.breathePrompt = document.getElementById('ambient-breathe-prompt');
    dom.breatheStart = document.getElementById('ambient-breathe-start');
    dom.breathePause = document.getElementById('ambient-breathe-pause');
    dom.breatheClose = document.getElementById('ambient-breathe-close');

    if (dom.hudRing) {
      dom.hudRing.style.strokeDasharray = `${HUD_CIRCUMFERENCE}`;
    }
  }

  function attachUiListeners() {
    if (dom.typeSelect) {
      dom.typeSelect.addEventListener('change', () => {
        persistLastSession({ type: dom.typeSelect.value });
      });
    }

    dom.durationButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const minutes = Number(btn.dataset.minutes || DEFAULT_MINUTES);
        selectDuration(minutes);
      });
    });

    if (dom.customInput) {
      dom.customInput.addEventListener('change', () => {
        const raw = Number(dom.customInput.value);
        if (!Number.isFinite(raw)) return;
        const clamped = Math.max(MIN_MINUTES, Math.min(60, raw));
        selectDuration(clamped, true);
      });
    }

    if (dom.startBtn) {
      dom.startBtn.addEventListener('click', () => {
        const minutes = getSelectedMinutes();
        startSession({ type: getSelectedType(), minutes });
      });
    }

    if (dom.pauseBtn) {
      dom.pauseBtn.addEventListener('click', () => pauseSession());
    }

    if (dom.stopBtn) {
      dom.stopBtn.addEventListener('click', () => stopSession('manual'));
    }

    if (dom.quickBtn) {
      dom.quickBtn.addEventListener('click', () => toggleQuickStart());
    }

    if (dom.hudPauseBtn) {
      dom.hudPauseBtn.addEventListener('click', () => pauseSession());
    }

    if (dom.hudStopBtn) {
      dom.hudStopBtn.addEventListener('click', () => stopSession('manual'));
    }

    if (dom.breatheStart) {
      dom.breatheStart.addEventListener('click', () => {
        if (!state.running || state.type !== 'breathe') {
          const minutes = getSelectedMinutes();
          startSession({ type: 'breathe', minutes });
        } else if (state.paused) {
          pauseSession();
        }
      });
    }

    if (dom.breathePause) {
      dom.breathePause.addEventListener('click', () => {
        if (!state.running) return;
        pauseSession();
      });
    }

    if (dom.breatheClose) {
      dom.breatheClose.addEventListener('click', () => stopSession('manual'));
    }
  }

  /** --------------------
   * Session persistence helpers
   * -------------------- */
  function loadLastSession() {
    try {
      const raw = localStorage.getItem(STORAGE_LAST);
      if (!raw) {
        updateQuickButtonLabel();
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.type && PROFILES[parsed.type]) {
        if (dom.typeSelect) dom.typeSelect.value = parsed.type;
      }
      if (Number.isFinite(parsed?.minutes)) {
        selectDuration(parsed.minutes);
      } else {
        updateDurationButtons(DEFAULT_MINUTES);
      }
    } catch (err) {
      console.warn('[ambient] unable to parse last session', err);
      updateDurationButtons(DEFAULT_MINUTES);
    }
    updateQuickButtonLabel();
  }

  function persistLastSession(partial) {
    let next = { type: getSelectedType(), minutes: getSelectedMinutes() };
    try {
      const raw = localStorage.getItem(STORAGE_LAST);
      if (raw) {
        const parsed = JSON.parse(raw);
        next = { ...parsed, ...next };
      }
    } catch (_) {}

    if (partial && typeof partial === 'object') {
      next = { ...next, ...partial };
    }

    try {
      localStorage.setItem(STORAGE_LAST, JSON.stringify(next));
    } catch (err) {
      console.warn('[ambient] persist last session failed', err);
    }
    updateQuickButtonLabel(next);
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY);
      if (!raw) return { total: 0, streak: 0, lastDate: null };
      const parsed = JSON.parse(raw);
      return {
        total: Number(parsed.total) || 0,
        streak: Number(parsed.streak) || 0,
        lastDate: parsed.lastDate || null
      };
    } catch (err) {
      console.warn('[ambient] unable to parse history', err);
      return { total: 0, streak: 0, lastDate: null };
    }
  }

  function saveHistory(history) {
    try {
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
    } catch (err) {
      console.warn('[ambient] unable to persist history', err);
    }
  }

  function updateStreakLabel() {
    if (!dom.streakLabel) return;
    const { streak } = loadHistory();
    dom.streakLabel.textContent = streak > 0 ? `Streak • ${streak} day${streak === 1 ? '' : 's'}` : '';
  }

  function updateQuickButtonLabel(last) {
    if (!dom.quickBtn) return;
    const data = last || (() => {
      try {
        const raw = localStorage.getItem(STORAGE_LAST);
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    })();

    if (!data || !PROFILES[data.type]) {
      const span = dom.quickBtn.querySelector('span');
      if (span) {
        span.textContent = 'Start Session';
        span.classList.remove('has-alt');
      }
      dom.quickBtn.setAttribute('data-label', 'Start Session');
      dom.quickBtn.dataset.type = 'focus';
      dom.quickBtn.dataset.minutes = String(DEFAULT_MINUTES);
      return;
    }

    const label = `${PROFILES[data.type].label} • ${Math.round(data.minutes || DEFAULT_MINUTES)}m`;
    dom.quickBtn.dataset.type = data.type;
    dom.quickBtn.dataset.minutes = String(Math.round(data.minutes || DEFAULT_MINUTES));
    const textSpan = dom.quickBtn.querySelector('span');
    if (textSpan) {
      textSpan.textContent = label;
    }
  }

  /** --------------------
   * Session control helpers
   * -------------------- */
  function getSelectedType() {
    const type = dom.typeSelect?.value || 'focus';
    return PROFILES[type] ? type : 'focus';
  }

  function getSelectedMinutes() {
    if (state.running) return state.minutes;
    const activeBtn = dom.durationButtons.find((btn) => btn.classList.contains('is-active'));
    if (activeBtn) return Number(activeBtn.dataset.minutes || DEFAULT_MINUTES);
    const custom = Number(dom.customInput?.value);
    if (Number.isFinite(custom)) {
      return Math.max(MIN_MINUTES, Math.min(60, custom));
    }
    return DEFAULT_MINUTES;
  }

  function selectDuration(minutes, isCustom = false) {
    const safe = Math.max(MIN_MINUTES, Math.min(60, Math.round(minutes)));
    if (isCustom && dom.customInput) {
      dom.customInput.value = String(safe);
    }
    updateDurationButtons(safe, isCustom);
    persistLastSession({ minutes: safe });
  }

  function updateDurationButtons(minutes, isCustom = false) {
    dom.durationButtons.forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.minutes || 0) === Math.round(minutes) && !isCustom);
    });
    if (dom.customInput && isCustom) {
      dom.customInput.value = String(minutes);
    }
  }

  function captureBaseline() {
    if (!vibeReady || !window.VibeMe) return null;
    const matrixPrefs = safeParse(localStorage.getItem('vibeme-matrix-preferences')) || {};
    return {
      matrixDensity: toNumber(matrixPrefs.opacity) / 100 || 0.8,
      streamDensity: toNumber(matrixPrefs.density) || (window.VibeMe.matrixConfig?.densityMultiplier ?? 1),
      animSpeed: toNumber(matrixPrefs.speed) || (window.VibeMe.matrixConfig ? 500 / (window.VibeMe.matrixConfig.updateInterval || 500) : 1),
      fpsCap: window.VibeMe.matrixConfig?.canvasConfig?.maxFPS || 60,
      ttsEnabled: !!window.VibeMe.settings?.tts?.enabled,
      ttsRate: Number(window.VibeMe.settings?.tts?.rate ?? 1),
      ttsVoice: window.VibeMe.settings?.tts?.voiceURI ?? null,
      autoTimerPaused: !!window.VibeMe.state?.isPaused
    };
  }

  function restoreBaseline() {
    if (!baseline || !vibeReady || !window.VibeMe) return;
    try {
      window.VibeMe.setMatrixDensity?.(baseline.matrixDensity);
      window.VibeMe.setStreamDensity?.(baseline.streamDensity);
      window.VibeMe.setAnimationSpeed?.(baseline.animSpeed);
      window.VibeMe.setFpsCap?.(baseline.fpsCap);

      if (typeof window.VibeMe.settings === 'object' && window.VibeMe.settings.tts) {
        window.VibeMe.settings.tts.enabled = baseline.ttsEnabled;
        window.VibeMe.settings.tts.rate = baseline.ttsRate;
        window.VibeMe.settings.tts.voiceURI = baseline.ttsVoice;
      }

      syncTtsUi(baseline.ttsEnabled, baseline.ttsRate, baseline.ttsVoice);

      if (window.VibeMe.state) {
        window.VibeMe.state.isPaused = baseline.autoTimerPaused;
        if (!baseline.autoTimerPaused) {
          window.VibeMe.startTimer?.();
        }
      }
    } catch (err) {
      console.warn('[ambient] failed to restore baseline', err);
    }
  }

  function syncTtsUi(enabled, rate, voice) {
    const enableCheckbox = document.getElementById('tts-enable-checkbox');
    const rateSlider = document.getElementById('tts-rate');
    const rateLabel = document.getElementById('tts-rate-value');
    const voiceSelect = document.getElementById('tts-voice');

    if (enableCheckbox) {
      enableCheckbox.checked = !!enabled;
    }
    if (rateSlider && Number.isFinite(rate)) {
      rateSlider.value = String(rate);
      if (rateLabel) rateLabel.textContent = `${Number(rate).toFixed(1)}x`;
    }
    if (voiceSelect && voice && [...voiceSelect.options].some((opt) => opt.value === voice)) {
      voiceSelect.value = voice;
    }
  }

  function suspendAutoTimer() {
    if (!vibeReady || !window.VibeMe) return;
    if (window.VibeMe.state?.timerInterval) {
      clearInterval(window.VibeMe.state.timerInterval);
      window.VibeMe.state.timerInterval = null;
    }
    if (window.VibeMe.state) {
      window.VibeMe.state.isPaused = true;
    }
    const countdown = document.getElementById('countdown');
    if (countdown) countdown.textContent = '—';
  }

  function scheduleCadence() {
    clearTimeout(cadenceTimer);
    if (!state.running || state.paused) return;
    const profile = state.profile;
    if (!profile) return;

    let interval = profile.quoteIntervalMs;
    if (state.phase !== 'active' && interval > 0) {
      interval *= state.phase === 'windIn' ? 1.25 : 0.85;
    }

    if (profile.quoteIntervalMs === 0 && profile.mantraIntervalMs) {
      interval = profile.mantraIntervalMs;
    }

    if (!interval || interval <= 0) {
      return;
    }

    cadenceTimer = setTimeout(() => {
      cadenceTick();
      scheduleCadence();
    }, interval);
  }

  function cadenceTick() {
    if (!state.running || state.paused || !state.profile) return;
    if (!vibeReady || !window.VibeMe) return;

    if (state.profile.quoteIntervalMs === 0) {
      updateBreatheMantra();
      return;
    }

    try {
      window.VibeMe.updateQuote?.();
      if (state.profile.chime) {
        window.VibeMeAudioSafetyNet?.beep?.(640, 0.08, 0.12);
      }
    } catch (err) {
      console.warn('[ambient] cadence quote failed', err);
    }
  }

  function startBreathingLoop() {
    clearTimeout(breatheTimer);
    if (!state.running || state.paused || state.type !== 'breathe' || !dom.breatheOverlay) return;

    const step = BREATHE_STEPS[breatheIndex % BREATHE_STEPS.length];
    breatheIndex = (breatheIndex + 1) % BREATHE_STEPS.length;

    document.body.dataset.breathePhase = step.phase;
    if (dom.breatheOverlay) dom.breatheOverlay.setAttribute('data-phase', step.phase);
    currentBreathStepLabel = step.label;
    applyBreathePrompt(step.label);
    if (state.profile?.chime) {
      window.VibeMeAudioSafetyNet?.beep?.(step.phase === 'exhale' ? 420 : 520, 0.08, 0.1);
    }

    breatheTimer = setTimeout(() => startBreathingLoop(), step.duration);
  }

  function stopBreathingLoop() {
    clearTimeout(breatheTimer);
    breatheTimer = 0;
    document.body.removeAttribute('data-breathe-phase');
  }

  function updateBreatheMantra(force = false) {
    if (!dom.breathePrompt) return;
    if (!force && state.type !== 'breathe') return;
    const nextIndex = (lastMantraIndex + 1) % BREATHE_MANTRAS.length;
    lastMantraIndex = nextIndex;
    currentMantra = BREATHE_MANTRAS[nextIndex];
    applyBreathePrompt(currentBreathStepLabel || 'Breathe');
  }

  function applyBreathePrompt(stepLabel) {
    if (!dom.breathePrompt) return;
    if (currentMantra) {
      dom.breathePrompt.textContent = `${stepLabel} • ${currentMantra}`;
    } else {
      dom.breathePrompt.textContent = stepLabel;
    }
  }

  function updateHud() {
    if (!dom.hud) return;
    dom.hud.classList.toggle('hidden', !state.running);
    dom.hud.classList.toggle('is-paused', state.paused);

    if (!state.running) return;
    const phaseLabel = PHASE_LABELS[state.phase] || state.phase;
    if (dom.hudPhase) dom.hudPhase.textContent = state.paused ? `${phaseLabel} • Paused` : phaseLabel;
    if (dom.hudTime) dom.hudTime.textContent = formatTime(state.remainingMs);

    if (dom.hudRing) {
      const progress = state.totalMs > 0 ? (state.totalMs - state.remainingMs) / state.totalMs : 0;
      dom.hudRing.style.strokeDashoffset = `${HUD_CIRCUMFERENCE * Math.max(0, 1 - progress)}`;
    }
  }

  function updateControlsForState() {
    const running = state.running;
    const paused = state.paused;
    if (dom.startBtn) {
      dom.startBtn.classList.toggle('hidden', running);
      dom.startBtn.disabled = running;
    }
    if (dom.pauseBtn) {
      dom.pauseBtn.classList.toggle('hidden', !running);
      dom.pauseBtn.textContent = paused ? 'Resume' : 'Pause';
      dom.pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    }
    if (dom.stopBtn) {
      dom.stopBtn.classList.toggle('hidden', !running);
    }
    if (dom.quickBtn) {
      dom.quickBtn.querySelector('span')?.classList.toggle('text-amber-200', running);
      dom.quickBtn.querySelector('span')?.classList.toggle('font-semibold', running);
      if (running) {
        dom.quickBtn.querySelector('span').textContent = 'Stop Session';
      } else {
        updateQuickButtonLabel();
      }
    }
    if (dom.hudPauseBtn) {
      dom.hudPauseBtn.setAttribute('aria-label', paused ? 'Resume session' : 'Pause session');
      dom.hudPauseBtn.innerHTML = paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }
  }

  function applyVisuals(phaseProgress) {
    if (!vibeReady || !window.VibeMe || !baseline || !state.profile) return;
    const target = state.profile.matrix;
    const baseDensity = baseline.matrixDensity;
    const baseStream = baseline.streamDensity;
    const baseSpeed = baseline.animSpeed;
    const activeDensity = target.density;
    const activeStream = target.stream;
    const activeSpeed = target.speed;

    const blend = (from, to) => from + (to - from) * phaseProgress;

    let density;
    let stream;
    let speed;

    if (state.phase === 'windIn') {
      density = blend(baseDensity, activeDensity);
      stream = blend(baseStream, activeStream);
      speed = blend(baseSpeed, activeSpeed);
    } else if (state.phase === 'windDown') {
      density = blend(activeDensity, baseDensity);
      stream = blend(activeStream, baseStream);
      speed = blend(activeSpeed, baseSpeed);
    } else if (state.phase === 'active') {
      density = activeDensity;
      stream = activeStream;
      speed = activeSpeed;
    } else {
      density = baseDensity;
      stream = baseStream;
      speed = baseSpeed;
    }

    window.VibeMe.setMatrixDensity?.(clamp(density, 0.3, 1));
    window.VibeMe.setStreamDensity?.(clamp(stream, 0.5, 2.5));
    window.VibeMe.setAnimationSpeed?.(clamp(speed, 0.5, 1.6));
  }

  function tick(now) {
    if (!state.running) return;
    if (state.paused) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const remaining = Math.max(0, state.endsAt - now);
    state.remainingMs = remaining;

    if (now >= state.phaseEndsAt - 16 && state.phaseIndex < state.phases.length - 1) {
      advancePhase();
    }

    const phaseDuration = state.phases[state.phaseIndex]?.durationMs || 1;
    const elapsed = Math.max(0, now - state.phaseStartedAt);
    const phaseProgress = phaseDuration > 0 ? clamp(elapsed / phaseDuration, 0, 1) : 0;
    applyVisuals(clamp(phaseProgress, 0, 1));
    updateHud();

    dispatch('tick', {
      remainingMs: state.remainingMs,
      totalMs: state.totalMs,
      phase: state.phase,
      type: state.type
    });

    if (remaining <= 0) {
      completeSession();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function advancePhase() {
    state.phaseIndex += 1;
    const next = state.phases[state.phaseIndex];
    if (!next) return;
    state.phase = next.name;
    state.phaseEndsAt = performance.now() + next.durationMs;
    state.phaseStartedAt = performance.now();
    state.phaseEndsAt = state.phaseStartedAt + next.durationMs;
    dispatch('phasechange', { phase: state.phase, type: state.type });

    if (state.phase === 'active' && state.type === 'breathe') {
      updateBreatheMantra(true);
    }
    scheduleCadence();
  }

  function completeSession() {
    stopSession('complete');
    const history = loadHistory();
    const today = toDateKey(new Date());
    const yesterday = toDateKey(new Date(Date.now() - 86_400_000));
    const isSameDay = history.lastDate === today;
    const newStreak = history.lastDate === yesterday ? history.streak + 1 : isSameDay ? history.streak : 1;
    const total = (history.total || 0) + 1;
    const nextHistory = { total, streak: newStreak, lastDate: today };
    saveHistory(nextHistory);
    updateStreakLabel();
    toast('Session complete. Nice work!', 'success');
    dispatch('sessioncomplete', { type: state.type, minutes: state.minutes });
  }

  /** --------------------
   * Public API
   * -------------------- */
  function startSession({ type, minutes } = {}) {
    const chosenType = PROFILES[type] ? type : getSelectedType();
    const chosenMinutes = Math.max(MIN_MINUTES, Math.min(60, minutes || getSelectedMinutes()));

    if (!vibeReady) {
      toast('Ambient sessions will start once VibeMe finishes loading.', 'info');
      return;
    }

    if (reduceMotion && chosenType !== 'focus') {
      toast('Reduced motion is enabled. Starting a Focus session instead.', 'info');
    }

    const effectiveType = reduceMotion ? 'focus' : chosenType;
    if (state.running) {
      stopSession('replace');
    }

    const profile = PROFILES[effectiveType] || PROFILES.focus;
    const totalMs = Math.max(chosenMinutes * 60_000, WIND_IN_MS + WIND_DOWN_MS + 60_000);
    const activeMs = Math.max(60_000, totalMs - (WIND_IN_MS + WIND_DOWN_MS));

    state.running = true;
    state.paused = false;
    state.type = effectiveType;
    state.profile = profile;
    state.minutes = chosenMinutes;
    state.totalMs = totalMs;
    state.remainingMs = totalMs;
    state.phases = [
      { name: 'windIn', durationMs: WIND_IN_MS },
      { name: 'active', durationMs: activeMs },
      { name: 'windDown', durationMs: WIND_DOWN_MS }
    ];
    state.phaseIndex = 0;
    state.phase = 'windIn';
    const now = performance.now();
    state.phaseStartedAt = now;
    state.endsAt = now + totalMs;
    state.phaseEndsAt = now + WIND_IN_MS;
    state.pausePhaseRemaining = 0;

    baseline = captureBaseline();
    suspendAutoTimer();
    applySessionOverrides(profile);

    document.body.classList.add('ambient-active');
    document.body.classList.toggle('ambient-breathe', effectiveType === 'breathe');

    if (effectiveType === 'breathe' && dom.breatheOverlay) {
      dom.breatheOverlay.classList.remove('hidden');
      dom.breatheOverlay.setAttribute('data-state', 'running');
      updateBreatheMantra(true);
      startBreathingLoop();
    } else {
      if (dom.breatheOverlay) {
        dom.breatheOverlay.classList.add('hidden');
        dom.breatheOverlay.removeAttribute('data-state');
      }
    }

    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
    scheduleCadence();
    updateHud();
    updateControlsForState();

    persistLastSession({ type: effectiveType, minutes: chosenMinutes });
    dispatch('sessionstart', { type: effectiveType, minutes: chosenMinutes });
  }

  function applySessionOverrides(profile) {
    if (!vibeReady || !window.VibeMe) return;
    try {
      const fps = Math.min(baseline?.fpsCap || profile.fpsCap, profile.fpsCap);
      window.VibeMe.setFpsCap?.(fps);
      window.VibeMe.setMatrixDensity?.(clamp(profile.matrix.density, 0.3, 1));
      window.VibeMe.setStreamDensity?.(clamp(profile.matrix.stream, 0.5, 2.5));
      window.VibeMe.setAnimationSpeed?.(clamp(profile.matrix.speed, 0.5, 1.6));

      if (typeof window.VibeMe.settings === 'object' && window.VibeMe.settings.tts) {
        window.VibeMe.settings.tts.enabled = !!profile.speech.enabled;
        window.VibeMe.settings.tts.rate = profile.speech.rate ?? window.VibeMe.settings.tts.rate;
      }
      syncTtsUi(!!profile.speech.enabled, profile.speech.rate, window.VibeMe.settings?.tts?.voiceURI ?? null);
    } catch (err) {
      console.warn('[ambient] failed to apply overrides', err);
    }
  }

  function pauseSession() {
    if (!state.running) return;
    state.paused = !state.paused;
    if (state.paused) {
      state.pausePhaseRemaining = Math.max(0, state.phaseEndsAt - performance.now());
      clearTimeout(cadenceTimer);
      clearTimeout(breatheTimer);
      breatheTimer = 0;
      dispatch('sessionpause', { paused: true });
    } else {
      const now = performance.now();
      state.endsAt = now + state.remainingMs;
      const currentPhase = state.phases[state.phaseIndex];
      const duration = currentPhase?.durationMs || 0;
      const remainingPhase = state.pausePhaseRemaining || Math.max(0, state.phaseEndsAt - now);
      const elapsed = clamp(duration - remainingPhase, 0, duration);
      state.phaseStartedAt = now - elapsed;
      state.phaseEndsAt = now + remainingPhase;
      state.pausePhaseRemaining = 0;
      scheduleCadence();
      if (state.type === 'breathe') startBreathingLoop();
      dispatch('sessionpause', { paused: false });
    }
    updateControlsForState();
    updateHud();
  }

  function stopSession(reason = 'manual') {
    if (!state.running) return;
    clearTimeout(cadenceTimer);
    clearTimeout(breatheTimer);
    breatheTimer = 0;
    cancelAnimationFrame(rafId);

    const stoppedType = state.type;
    const stoppedMinutes = state.minutes;

    state.running = false;
    state.paused = false;
    state.type = null;
    state.profile = null;
    state.phase = 'idle';
    state.phaseIndex = -1;
    state.remainingMs = 0;
    state.totalMs = 0;
    state.pausePhaseRemaining = 0;
    state.phaseStartedAt = 0;
    currentMantra = '';
    currentBreathStepLabel = '';

    document.body.classList.remove('ambient-active', 'ambient-breathe');
    stopBreathingLoop();
    if (dom.breatheOverlay) {
      dom.breatheOverlay.classList.add('hidden');
      dom.breatheOverlay.removeAttribute('data-state');
      dom.breatheOverlay.removeAttribute('data-phase');
    }

    restoreBaseline();
    updateControlsForState();
    updateHud();
    dispatch('sessionstop', { reason, type: stoppedType, minutes: stoppedMinutes });
  }

  function toggleQuickStart() {
    if (state.running) {
      stopSession('manual');
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_LAST);
      const parsed = raw ? JSON.parse(raw) : null;
      const type = parsed?.type && PROFILES[parsed.type] ? parsed.type : 'focus';
      const minutes = Number(parsed?.minutes) || DEFAULT_MINUTES;
      startSession({ type, minutes });
    } catch (_) {
      startSession({ type: 'focus', minutes: DEFAULT_MINUTES });
    }
  }

  function getSessionState() {
    return { ...state };
  }

  /** --------------------
   * Utilities
   * -------------------- */
  function safeParse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function toast(message, type = 'info', duration = 2200) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type, duration } }));
  }

  function dispatch(name, detail) {
    try {
      document.dispatchEvent(new CustomEvent(`ambient:${name}`, { detail }));
    } catch (err) {
      console.warn('[ambient] dispatch failed', err);
    }
  }

  // Initialise automatically
  initAmbientSessions();

  // Expose API
  window.AmbientSessions = {
    init: initAmbientSessions,
    startSession,
    pauseSession,
    stopSession,
    getSessionState,
    toggleQuickStart
  };
})();

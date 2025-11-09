const overlay = document.getElementById('ambient-breathe-overlay');
const card = overlay?.querySelector('.ambient-breathe-card') ?? null;
const pulse = overlay?.querySelector('.ambient-breathe-pulse') ?? null;
const promptEl = overlay?.querySelector('#ambient-breathe-prompt') ?? null;
const startBtn = document.getElementById('ambient-breathe-start');
const pauseBtn = document.getElementById('ambient-breathe-pause');
const closeBtn = document.getElementById('ambient-breathe-close');

const phases = [
  { name: 'inhale', duration: 4000, scale: 1.3, prompt: 'Inhale' },
  { name: 'hold', duration: 2000, scale: 1.3, prompt: 'Hold' },
  { name: 'exhale', duration: 4000, scale: 0.8, prompt: 'Exhale' },
  { name: 'reset', duration: 2000, scale: 1, prompt: 'Hold' }
];

let phaseIndex = 0;
let running = false;
let timer = 0;

function updateBodyScrollLock() {
  const needsLock = document.querySelectorAll('[data-scroll-lock="true"]').length > 0;
  document.body.classList.toggle('overflow-hidden', needsLock);
}

function setOverlayVisible(visible) {
  if (!overlay) return;
  overlay.classList.toggle('hidden', !visible);
  overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
  overlay.dataset.scrollLock = visible ? 'true' : 'false';
  updateBodyScrollLock();
}

function applyPhase(phase) {
  if (!overlay) return;
  overlay.dataset.phase = phase.name;
  if (pulse) {
    pulse.style.transition = `transform ${phase.duration / 1000}s ease-in-out`;
    pulse.style.transform = `scale(${phase.scale})`;
  }
  if (promptEl) {
    promptEl.textContent = phase.prompt;
  }
}

function scheduleNextPhase() {
  if (!overlay || !running) return;
  clearTimeout(timer);
  const current = phases[phaseIndex];
  applyPhase(current);
  timer = window.setTimeout(() => {
    if (!running) return;
    phaseIndex = (phaseIndex + 1) % phases.length;
    scheduleNextPhase();
  }, current.duration);
}

function startBreathingCycle() {
  if (!overlay) return;
  running = true;
  overlay.dataset.state = 'running';
  if (phaseIndex >= phases.length) {
    phaseIndex = 0;
  }
  scheduleNextPhase();
}

function pauseBreathingCycle() {
  if (!overlay) return;
  running = false;
  overlay.dataset.state = 'paused';
  clearTimeout(timer);
}

function resetBreathingCycle() {
  phaseIndex = 0;
  applyPhase(phases[phaseIndex]);
  if (overlay) {
    overlay.dataset.state = 'paused';
  }
}

export function openAmbientBreathing() {
  if (!overlay) return;
  resetBreathingCycle();
  setOverlayVisible(true);
  startBreathingCycle();
}

export function closeAmbientBreathing() {
  if (!overlay) return;
  pauseBreathingCycle();
  setOverlayVisible(false);
}

export function toggleAmbientBreathing(forceState) {
  if (!overlay) return;
  const visible = overlay.classList.contains('hidden') ? false : true;
  const shouldShow = typeof forceState === 'boolean' ? forceState : !visible;
  if (shouldShow) {
    openAmbientBreathing();
  } else {
    closeAmbientBreathing();
  }
}

function handleKeydown(event) {
  if (!overlay || overlay.classList.contains('hidden')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeAmbientBreathing();
  }
}

if (overlay) {
  resetBreathingCycle();
  overlay.dataset.scrollLock = 'false';

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeAmbientBreathing();
    }
  });

  if (card) {
    card.addEventListener('click', (event) => event.stopPropagation());
  }

  startBtn?.addEventListener('click', () => {
    if (!running) {
      startBreathingCycle();
    } else {
      resetBreathingCycle();
    }
  });

  pauseBtn?.addEventListener('click', () => {
    if (running) {
      pauseBreathingCycle();
    } else {
      startBreathingCycle();
    }
  });

  closeBtn?.addEventListener('click', () => closeAmbientBreathing());

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('vibeme:ambient:open', () => openAmbientBreathing());
  document.addEventListener('vibeme:ambient:close', () => closeAmbientBreathing());
  document.addEventListener('vibeme:ambient:toggle', () => toggleAmbientBreathing());
}

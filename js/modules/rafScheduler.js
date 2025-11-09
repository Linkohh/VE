const MIN_FPS = 15;
const MAX_FPS = 240;

let targetFrameTimeMs = 1000 / 60;
let lastFrameTimestamp = 0;
let rafHandle = 0;
let frameCallback = null;

/**
 * Configure the rAF loop target frame rate.
 * @param {number} fps
 */
export function setFpsCap(fps = 60) {
  const numericFps = Number(fps);
  if (!Number.isFinite(numericFps)) {
    console.warn('[rafScheduler] Invalid FPS cap supplied, falling back to 60');
    targetFrameTimeMs = 1000 / 60;
    return;
  }
  const safeFps = Math.max(MIN_FPS, Math.min(MAX_FPS, numericFps));
  targetFrameTimeMs = 1000 / safeFps;
}

/**
 * Start a throttled requestAnimationFrame loop.
 * @param {(timestamp:number, delta:number)=>void} callback
 */
export function startRafLoop(callback) {
  frameCallback = typeof callback === 'function' ? callback : null;
  if (!frameCallback) {
    stopRafLoop();
    return;
  }
  if (rafHandle) {
    cancelAnimationFrame(rafHandle);
    rafHandle = 0;
  }
  lastFrameTimestamp = performance.now();
  loop(lastFrameTimestamp);
}

/**
 * Stop the throttled requestAnimationFrame loop.
 */
export function stopRafLoop() {
  if (rafHandle) {
    cancelAnimationFrame(rafHandle);
    rafHandle = 0;
  }
  frameCallback = null;
}

function loop(timestamp) {
  rafHandle = requestAnimationFrame(loop);
  if (!frameCallback) return;
  const delta = timestamp - lastFrameTimestamp;
  if (delta >= targetFrameTimeMs) {
    lastFrameTimestamp = timestamp - (delta % targetFrameTimeMs);
    try {
      frameCallback(timestamp, delta);
    } catch (err) {
      console.error('[rafScheduler] callback error', err);
      frameCallback = null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.VibeMeRafScheduler = { setFpsCap, startRafLoop, stopRafLoop };
}

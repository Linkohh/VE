let targetMs = 1000 / 60;
let last = 0;
let handle = 0;
let cb = null;

export function setFpsCap(fps = 60) {
  const safeFps = Math.max(15, Math.min(240, Number(fps) || 60));
  targetMs = 1000 / safeFps;
}

export function startRafLoop(callback) {
  cb = typeof callback === 'function' ? callback : null;
  if (!cb) {
    stopRafLoop();
    return;
  }
  if (handle) {
    cancelAnimationFrame(handle);
    handle = 0;
  }
  last = performance.now();
  loop(last);
}

export function stopRafLoop() {
  if (handle) {
    cancelAnimationFrame(handle);
    handle = 0;
  }
  cb = null;
}

function loop(timestamp) {
  handle = requestAnimationFrame(loop);
  if (!cb) return;
  const delta = timestamp - last;
  if (delta >= targetMs) {
    last = timestamp - (delta % targetMs);
    try {
      cb(timestamp, delta);
    } catch (err) {
      console.error('[rafScheduler] callback error', err);
      cb = null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.VibeMeRafScheduler = { setFpsCap, startRafLoop, stopRafLoop };
}

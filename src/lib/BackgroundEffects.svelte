<script>
  import { onMount, onDestroy } from 'svelte';
  import { effectsEnabled, themeColors } from './store.js';
  import { get } from 'svelte/store';

  // Element bindings
  let mouseGlowElement;
  let matrixCanvasElement;

  // State for effects
  let matrixState = {
    canvasContext: null,
    canvasAnimationId: null,
    canvasDrops: [],
    lastFrameTime: 0,
    resizeHandler: null,
  };

  let mouseGlowState = {
    animationId: null,
    hue: 200,
  };

  // Matrix Configuration (ported from main.js)
  const matrixConfig = {
    characters: ['0', '1', '|', '/', '\\', '-', '+', '*', '#', '@', '&', '%', '$', '〃', '¦', '｜'],
    trailLength: 20,
    canvasConfig: {
      fontSize: 16,
      columnSpacing: 20,
      maxFPS: 30, // Optimized for background effect
      globalOpacity: 0.9,
    },
    colors: ['#CC00FF', '#A104C1', '#4400F6', '#0050FF', '#03A0C5', '#00E5FF']
  };

  // --- Lifecycle ---
  onMount(() => {
    const unsubscribeEffects = effectsEnabled.subscribe(enabled => {
      if (enabled) {
        startEffects();
      } else {
        stopEffects();
      }
    });

    const unsubscribeTheme = themeColors.subscribe(colors => {
      matrixConfig.colors = [colors.color1, colors.color2, colors.color3];
    });

    // Initial start if enabled
    if (get(effectsEnabled)) {
        startEffects();
    }

    onDestroy(() => {
      unsubscribeEffects();
      unsubscribeTheme();
      stopEffects();
    });
  });

  function startEffects() {
    setupMouseGlow();
    initializeCanvasMatrix();
  }

  function stopEffects() {
    stopMouseGlow();
    stopCanvasMatrix();
  }


  // --- Mouse Glow Effect ---

  function setupMouseGlow() {
    if (!mouseGlowElement) return;

    document.addEventListener('mousemove', handleMouseMove);

    const interactiveElements = document.querySelectorAll('a, button, .social-bubble, .action-button, .generate-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnterInteractive);
        el.addEventListener('mouseleave', handleMouseLeaveInteractive);
    });

    document.body.addEventListener('mouseleave', () => {
        if(mouseGlowElement) mouseGlowElement.style.opacity = '0';
    });

    animateMouseGlowColor();
  }

  function stopMouseGlow() {
    document.removeEventListener('mousemove', handleMouseMove);
    if (mouseGlowState.animationId) {
        cancelAnimationFrame(mouseGlowState.animationId);
        mouseGlowState.animationId = null;
    }
    if (mouseGlowElement) mouseGlowElement.style.opacity = '0';

    const interactiveElements = document.querySelectorAll('a, button, .social-bubble, .action-button, .generate-btn');
    interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnterInteractive);
        el.removeEventListener('mouseleave', handleMouseLeaveInteractive);
    });
  }

  function handleMouseMove(e) {
    if (!get(effectsEnabled) || !mouseGlowElement) return;
    requestAnimationFrame(() => {
        mouseGlowElement.style.left = `${e.clientX}px`;
        mouseGlowElement.style.top = `${e.clientY}px`;
        mouseGlowElement.style.opacity = '0.8';
    });
  }

  function handleMouseEnterInteractive() {
      if(mouseGlowElement) mouseGlowElement.classList.add('hover-effect');
  }

  function handleMouseLeaveInteractive() {
      if(mouseGlowElement) mouseGlowElement.classList.remove('hover-effect');
  }

  function animateMouseGlowColor() {
      const animate = () => {
          if (!get(effectsEnabled) || !mouseGlowElement) {
              mouseGlowState.animationId = requestAnimationFrame(animate);
              return;
          }
          mouseGlowState.hue = (mouseGlowState.hue + 0.5) % 360;
          mouseGlowElement.style.setProperty('--glow-hue', mouseGlowState.hue.toFixed(2));
          mouseGlowState.animationId = requestAnimationFrame(animate);
      };
      animate();
  }

  // --- Canvas Matrix Effect ---

  function initializeCanvasMatrix() {
    if (!matrixCanvasElement || !get(effectsEnabled)) return;

    matrixState.canvasContext = matrixCanvasElement.getContext('2d');
    if (!matrixState.canvasContext) return;

    matrixCanvasElement.style.display = 'block';

    resizeCanvasMatrix();
    initializeCanvasDrops();
    startCanvasAnimation();

    matrixState.resizeHandler = debounce(handleCanvasResize, 250);
    window.addEventListener('resize', matrixState.resizeHandler);
  }

  function stopCanvasMatrix() {
    if (matrixState.canvasAnimationId) {
        cancelAnimationFrame(matrixState.canvasAnimationId);
        matrixState.canvasAnimationId = null;
    }
    if (matrixState.resizeHandler) {
        window.removeEventListener('resize', matrixState.resizeHandler);
    }
    if (matrixCanvasElement) {
        matrixCanvasElement.style.display = 'none';
        const ctx = matrixCanvasElement.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, matrixCanvasElement.width, matrixCanvasElement.height);
    }
  }

  function handleCanvasResize() {
      resizeCanvasMatrix();
      initializeCanvasDrops();
  }

  function resizeCanvasMatrix() {
    if (!matrixCanvasElement) return;
    const dpr = window.devicePixelRatio || 1;
    matrixCanvasElement.width = window.innerWidth * dpr;
    matrixCanvasElement.height = window.innerHeight * dpr;
    if (matrixState.canvasContext) {
        matrixState.canvasContext.scale(dpr, dpr);
    }
  }

  function initializeCanvasDrops() {
    if (!matrixCanvasElement) return;
    const cfg = matrixConfig.canvasConfig;
    const columns = Math.floor(matrixCanvasElement.width / (window.devicePixelRatio || 1) / cfg.columnSpacing);
    matrixState.canvasDrops = [];
    for (let i = 0; i < columns; i++) {
        matrixState.canvasDrops[i] = 1;
    }
  }

  function startCanvasAnimation() {
    const animate = (timestamp) => {
      if (!get(effectsEnabled) || !matrixState.canvasContext) {
        matrixState.canvasAnimationId = requestAnimationFrame(animate);
        return;
      }
      const maxFPS = matrixConfig.canvasConfig.maxFPS;
      const minFrameTime = 1000 / maxFPS;
      const delta = timestamp - (matrixState.lastFrameTime || 0);

      if (delta >= minFrameTime) {
        matrixState.lastFrameTime = timestamp;
        drawCanvasMatrix();
      }
      matrixState.canvasAnimationId = requestAnimationFrame(animate);
    };
    matrixState.canvasAnimationId = requestAnimationFrame(animate);
  }

  function drawCanvasMatrix() {
    const ctx = matrixState.canvasContext;
    const canvas = matrixCanvasElement;
    const cfg = matrixConfig.canvasConfig;

    if (!ctx || !canvas) return;

    ctx.fillStyle = `rgba(0, 0, 0, ${1 - cfg.globalOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = matrixConfig.colors[0] || '#00FF00';
    ctx.font = `${cfg.fontSize}px 'Roboto Mono', monospace`;

    for (let i = 0; i < matrixState.canvasDrops.length; i++) {
      const text = matrixConfig.characters[Math.floor(Math.random() * matrixConfig.characters.length)];

      const colorIndex = i % matrixConfig.colors.length;
      ctx.fillStyle = matrixConfig.colors[colorIndex];

      const x = i * cfg.columnSpacing;
      const y = matrixState.canvasDrops[i] * cfg.fontSize;

      ctx.fillText(text, x, y);

      if (y > canvas.height / (window.devicePixelRatio || 1) && Math.random() > 0.975) {
        matrixState.canvasDrops[i] = 0;
      }
      matrixState.canvasDrops[i]++;
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
</script>

<!-- Decorative background effects -->
<div bind:this={mouseGlowElement} id="mouse-glow" class="mouse-glow" aria-hidden="true"></div>
<div id="matrix-bg" class="matrix-bg" aria-hidden="true"></div>
<canvas bind:this={matrixCanvasElement} id="matrix-canvas" class="matrix-canvas" aria-hidden="true"></canvas>

<style>
  .mouse-glow {
    position: fixed;
    width: var(--glow-size);
    height: var(--glow-size);
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
    mix-blend-mode: screen;
    filter: blur(40px);
    will-change: transform, background;
    --glow-hue: 200;
    --glow-saturation: 100%;
    --glow-lightness: 60%;
    background: radial-gradient(
        circle,
        hsla(var(--glow-hue), var(--glow-saturation), var(--glow-lightness), 0.8) 0%,
        hsla(var(--glow-hue), var(--glow-saturation), var(--glow-lightness), 0.5) 30%,
        hsla(var(--glow-hue), var(--glow-saturation), var(--glow-lightness), 0.2) 50%,
        hsla(var(--glow-hue), var(--glow-saturation), var(--glow-lightness), 0) 70%
    );
  }
  .mouse-glow.hover-effect {
    width: 200px;
    height: 200px;
    filter: blur(50px);
    opacity: 1 !important;
  }
  .matrix-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-negative);
    overflow: hidden;
    opacity: 0.7;
    background: rgba(0, 0, 0, 0.1);
  }
  .matrix-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: calc(var(--z-negative) + 1);
    pointer-events: none;
    opacity: 0.4; /* Adjusted for better blend */
    display: none;
    mix-blend-mode: screen;
  }
  :global(.binary-column) {
    position: absolute;
    top: -100%;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-family: 'Roboto Mono', 'Courier New', 'Monaco', 'Menlo', monospace;
    font-size: 14px;
    line-height: 1.1;
    font-weight: bold;
    color: rgba(0, 255, 0, 0.9);
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.7);
    will-change: transform;
    animation: matrix-fall 10s linear infinite;
  }
  @keyframes matrix-fall {
    from { transform: translateY(0vh); }
    to { transform: translateY(110vh); }
  }
</style>
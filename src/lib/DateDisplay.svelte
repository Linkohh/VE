<script>
  import { onMount } from 'svelte';

  let formattedDate = '';
  let isoDate = '';

  function renderDate() {
    const now = new Date();
    const narrow = window.matchMedia('(max-width: 520px)').matches;

    const format = narrow
      ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
      : { weekday: 'long',  month: 'long',  day: 'numeric', year: 'numeric' };

    formattedDate = now.toLocaleDateString(undefined, format);
    isoDate = now.toISOString().slice(0,10);
  }

  function scheduleMidnightTick() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const ms = Math.max(1000, next - now);
    setTimeout(function(){
      renderDate();
      scheduleMidnightTick();
    }, ms);
  }

  onMount(() => {
    renderDate();
    scheduleMidnightTick();
    window.addEventListener('resize', renderDate);

    return () => {
      window.removeEventListener('resize', renderDate);
    }
  });
</script>

<!-- Date mount (top-left, moved right) -->
<div id="date-mount" class="fc-date" aria-live="off" aria-label="Today's date">
  <time id="date-time" datetime={isoDate}>{formattedDate}</time>
</div>

<style>
  .fc-date {
    position: fixed;
    top: 1rem;
    left: 8rem;
    z-index: 10001;
    padding: 0.4rem 0.6rem;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(6px) saturate(120%);
    -webkit-backdrop-filter: blur(6px) saturate(120%);
    color: #fff;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
    box-shadow: 0 8px 24px rgba(0,0,0,.18);
  }

  #date-time {
    font-variant-numeric: tabular-nums;
  }

  :global(html:not([data-theme="dark"])) .fc-date {
    background: rgba(0,0,0,0.45);
  }

  @media (forced-colors: active) {
    .fc-date {
      background: Canvas;
      color: CanvasText;
      box-shadow: none;
    }
  }

  @media (max-width: 480px) {
    .fc-date {
      top: 0.75rem;
      left: 3rem;
      font-size: 1rem;
      padding: 0.35rem 0.55rem;
    }
  }
</style>

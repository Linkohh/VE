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

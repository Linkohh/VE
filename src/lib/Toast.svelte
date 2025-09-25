<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  const toasts = writable([]);

  function showToast(message, type = 'info', duration = 3000) {
    const id = Date.now();
    toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  function removeToast(id) {
    toasts.update(t => t.filter(toast => toast.id !== id));
  }

  onMount(() => {
    const handler = (e) => {
      const { message, type, duration } = e.detail || {};
      if (message) {
        showToast(message, type, duration);
      }
    };
    document.addEventListener('show-toast', handler);

    return () => {
      document.removeEventListener('show-toast', handler);
    };
  });
</script>

<div id="toast-root" class="toast-root">
  {#each $toasts as toast (toast.id)}
    <div class="toast toast-{toast.type}" role="alert" aria-live="assertive">
      <div class="flex items-center justify-between space-x-3">
        <div class="flex items-center space-x-2">
          {#if toast.type === 'success'}
            <i class="fas fa-check-circle"></i>
          {:else if toast.type === 'error'}
            <i class="fas fa-exclamation-circle"></i>
          {:else}
            <i class="fas fa-info-circle"></i>
          {/if}
          <span class="text-sm">{toast.message}</span>
        </div>
        <button class="text-white/60 hover:text-white/80 text-xs" on:click={() => removeToast(toast.id)}>✕</button>
      </div>
    </div>
  {/each}
</div>

<style>
  .toast-root {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--z-tooltip);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    min-width: 220px;
    max-width: 92vw;
    margin-inline: auto;
    color: #fff;
    background: rgba(25,25,25,.88);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px;
    padding: 10px 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    transform: translateY(8px);
    opacity: 0;
    animation: toast-in .18s ease-out forwards;
  }

  .toast.toast-success {
    background: rgba(24, 160, 88, .92);
  }

  .toast.toast-error {
    background: rgba(200, 60, 60, .92);
  }

  .toast.toast-info {
    background: rgba(40, 120, 220, .92);
  }

  @keyframes toast-in {
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes toast-out {
    to {
      transform: translateY(8px);
      opacity: 0;
    }
  }
</style>
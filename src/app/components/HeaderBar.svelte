<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
 
</script>

 

    <div class="action-pill" role="group" aria-label="Quick actions">
      <button
        type="button"
        class="pill-button"
        aria-label="Cycle theme"
        on:click={handleTheme}
      >
        <Fa icon={faMoon} class="h-4 w-4" />
      </button>

 

      <button
        type="button"
        class="pill-button"
        aria-label="Open settings"
        on:click={handleSettings}
      >
        <Fa icon={faGear} class="h-4 w-4" />
      </button>
    </div>
 
  </div>

 
  </div>
</header>

<style>
  .hero-header {
 
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .action-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.65rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.5);
  }

  .pill-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.2rem;
    width: 2.2rem;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(56, 189, 248, 0.25));
    color: rgba(255, 255, 255, 0.9);
    transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 8px 18px rgba(79, 70, 229, 0.25);
  }

  .pill-button:hover,
  .pill-button:focus-visible {
    transform: translateY(-1px) scale(1.04);
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(56, 189, 248, 0.45));
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      0 16px 30px rgba(59, 130, 246, 0.3);
  }

  .pill-button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.65);
    outline-offset: 2px;
  }

  .hero-core {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  .wordmark {
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
    font-size: clamp(3rem, 7vw, 5rem);
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-shadow:
      0 0 14px rgba(56, 189, 248, 0.65),
      0 0 28px rgba(236, 72, 153, 0.6);
  }

  .wordmark-vibe {
    color: #38bdf8;
  }

  .wordmark-me {
    color: #ec4899;
  }

  @media (max-width: 768px) {
    .hero-header {
      gap: 2rem;
    }

    .status-row {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .status-row :global(.date-stamp) {
      align-items: center;
    }

    .action-pill {
      align-self: center;
    }
  }

  .timing {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .timing-label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.65);
  }

  .progress-track {
    position: relative;
    width: 12rem;
    max-width: 100%;
    height: 0.35rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(255, 0, 255, 0.6), rgba(0, 255, 255, 0.6));
    transform-origin: left;
    transition: width 0.2s ease;
  }
</style>

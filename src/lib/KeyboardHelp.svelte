<script>
  import { onMount } from 'svelte';

  let dialog;

  function showModal() {
    if (dialog) {
      dialog.showModal();
    }
  }

  function closeModal() {
    if (dialog) {
      dialog.close();
    }
  }

  onMount(() => {
    dialog = document.querySelector('#keyboard-help-dialog');

    document.addEventListener('keydown', (e) => {
      if (e.key === '?') {
        e.preventDefault();
        showModal();
      }
    });
  });
</script>

<dialog id="keyboard-help-dialog" on:close={closeModal}>
  <div class="keyboard-help-content">
    <h2>Keyboard Shortcuts</h2>
    <ul>
      <li><kbd>?</kbd> - Show this help dialog</li>
      <li><kbd>Space</kbd> or <kbd>N</kbd> - Generate new quote</li>
      <li><kbd>T</kbd> - Toggle timer</li>
      <li><kbd>C</kbd> - Copy quote</li>
      <li><kbd>F</kbd> - Favorite quote</li>
      <li><kbd>D</kbd> - Toggle dark mode</li>
      <li><kbd>S</kbd> - Toggle settings</li>
      <li><kbd>Esc</kbd> - Close dialog/panel</li>
    </ul>
    <button on:click={closeModal}>Close</button>
  </div>
</dialog>

<style>
  dialog {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(31, 41, 55, 0.9);
    color: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-xl);
    max-width: 500px;
    width: 90%;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
  }

  .keyboard-help-content h2 {
    font-family: var(--font-heading);
    margin-top: 0;
    color: var(--text-color-main);
  }

  .keyboard-help-content ul {
    list-style: none;
    padding: 0;
  }

  .keyboard-help-content li {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  kbd {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-family: 'Roboto Mono', monospace;
  }

  button {
    margin-top: var(--spacing-lg);
    width: 100%;
    padding: var(--spacing-sm);
    background: var(--color1);
    color: var(--text-color-main);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
  }
</style>
<script>
  import { isDarkMode, isSettingsOpen } from './store.js';

  function toggleDarkMode() {
    isDarkMode.update(value => !value);
  }

  $: {
    if (typeof document !== 'undefined') {
      if ($isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }

  function toggleSettings() {
    isSettingsOpen.update(value => !value);
  }
</script>

<!-- Top controls -->
<div class="fixed top-4 right-4 z-[10001] flex space-x-2">
    <!-- Dark mode toggle -->
    <button on:click={toggleDarkMode} type="button"
            class="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            aria-label="Toggle dark mode"
            title="Toggle dark/light mode">
        <i class="fas fa-moon text-white text-lg" aria-hidden="true"></i>
    </button>

    <!-- Settings toggle -->
    <button on:click={toggleSettings} type="button"
            class="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
            aria-label="Open settings menu"
            aria-expanded="false"
            aria-controls="settings-panel">
        <i class="fas fa-cog text-white text-lg" aria-hidden="true"></i>
    </button>
</div>
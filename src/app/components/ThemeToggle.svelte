<script lang="ts">
  import { currentTheme, setThemeByKey, themes } from '../../features/theme';

  export type ThemeToggleSize = 'md' | 'sm';

  export let size: ThemeToggleSize = 'md';
  export let className = '';

  const containerBase =
    'inline-flex items-center gap-1 rounded-full bg-white/10 p-1 text-white transition hover:bg-white/15 focus-within:bg-white/15';
  const buttonBase =
    'rounded-full font-semibold capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
  const activeClasses = 'bg-white/25 text-white shadow-sm';
  const inactiveClasses = 'text-white/70 hover:bg-white/10 hover:text-white';
  const sizeClasses = {
    md: 'px-3 py-1.5 text-xs',
    sm: 'px-2.5 py-1 text-[0.65rem]',
  } as const;

  function formatLabel(key: string): string {
    return key
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  function handleSelect(key: string): void {
    if ($currentTheme.key === key) return;
    setThemeByKey(key);
  }

  $: containerClasses = [containerBase, size === 'sm' ? 'text-[0.7rem]' : 'text-xs', className]
    .filter(Boolean)
    .join(' ');
</script>

<div class={containerClasses} role="group" aria-label="Select theme">
  {#each themes as theme (theme.key)}
    <button
      type="button"
      class={`${buttonBase} ${sizeClasses[size]} ${
        theme.key === $currentTheme.key ? activeClasses : inactiveClasses
      }`}
      aria-pressed={theme.key === $currentTheme.key}
      aria-label={`Activate ${formatLabel(theme.key)} theme`}
      title={`${formatLabel(theme.key)} theme`}
      on:click={() => handleSelect(theme.key)}
    >
      {formatLabel(theme.key)}
    </button>
  {/each}
</div>

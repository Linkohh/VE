import AppShell from './AppShell.svelte';

const target = document.getElementById('app');

if (target) {
  new AppShell({ target });
}

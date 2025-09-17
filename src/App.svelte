<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import AppShell from './app/AppShell.svelte';
  import AboutPage from './app/pages/AboutPage.svelte';

  type Route = 'home' | 'about';

  function pathToRoute(pathname: string): Route {
    if (pathname.endsWith('/about') || pathname.endsWith('/about.html')) {
      return 'about';
    }
    return 'home';
  }

  function routeToPath(route: Route): string {
    return route === 'about' ? '/about' : '/';
  }

  function currentPath(): Route {
    if (typeof window === 'undefined') return 'home';
    return pathToRoute(window.location.pathname);
  }

  const route = writable<Route>(currentPath());

  function updateFromLocation(): void {
    route.set(currentPath());
  }

  function navigateTo(routeName: Route): void {
    if (typeof window !== 'undefined') {
      const target = routeToPath(routeName);
      if (window.location.pathname !== target) {
        window.history.pushState({}, '', target);
      }
    }
    route.set(routeName);
  }

  onMount(() => {
    updateFromLocation();
    const handler = () => updateFromLocation();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  });

  let View: typeof AppShell | typeof AboutPage = AppShell;
  const unsubscribe = route.subscribe((value) => {
    View = value === 'about' ? AboutPage : AppShell;
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<svelte:component this={View} {navigateTo} />

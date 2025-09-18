<script lang="ts">
  import MatrixLayer from '../features/matrix/MatrixLayer.svelte';
  import { FontAwesomeIcon as Fa } from '@fortawesome/svelte-fontawesome';
  import {
    faArrowLeft,
    faBolt,
    faCode,
    faInfinity,
    faLayerGroup,
    faRocket,
  } from '@fortawesome/free-solid-svg-icons';

  export let navigateTo: (route: 'home' | 'about') => void = () => {};

  const highlights = [
    {
      icon: faLayerGroup,
      title: 'Unified experience',
      body:
        'Legacy DOM controls have been retired. The entire surface now runs as a Svelte application so the matrix engine, quote pipeline, and favorites live in one component tree.',
    },
    {
      icon: faCode,
      title: 'Type-safe quote catalog',
      body:
        'Quotes are bundled directly into the module graph with TypeScript validation, enabling reliable filtering, deduplication, and testing without global window shims.',
    },
    {
      icon: faBolt,
      title: 'First-class tooling',
      body:
        'Tailwind CSS, PostCSS, and Font Awesome now ship through Vite, unlocking hot-module reload, tree-shaking, and offline builds with zero CDN dependencies.',
    },
  ];

  const roadmap = [
    {
      title: 'Progressive web app shell',
      detail:
        'Bundle the manifest, service worker, and offline quote cache together so users can install VibeMe and keep vibing without a network connection.',
    },
    {
      title: 'Deeper accessibility audits',
      detail:
        'Expand automated tests around keyboard flows, reduced motion, and screen-reader output to guarantee parity for every interaction.',
    },
    {
      title: 'Curated quote playlists',
      detail:
        'Introduce thematic journeys and scheduled drops powered by the new typed quote engine.',
    },
  ];

  function goHome(): void {
    navigateTo('home');
  }
</script>

<MatrixLayer />

<main class="relative z-[100] mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16 text-white">
  <header class="flex flex-col gap-6">
    <button
      type="button"
      class="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
      on:click={goHome}
    >
      <Fa icon={faArrowLeft} class="h-4 w-4" />
      Back to generator
    </button>

    <div class="panel-surface p-8">
      <h1 class="heading-font text-4xl font-semibold">About VibeMe</h1>
      <p class="mt-3 text-base text-white/70">
        VibeMe started as a handcrafted quote generator. With this modernization we have a fast, component-first
        foundation ready for rapid experimentation, richer personalization, and offline-first goodness.
      </p>
    </div>
  </header>

  <section class="panel-surface p-8">
    <h2 class="heading-font text-2xl font-semibold">What changed in this rebuild</h2>
    <p class="mt-2 text-white/70">
      Each highlight below comes directly from the migration work completed in this update.
    </p>
    <div class="mt-6 grid gap-5 md:grid-cols-3">
      {#each highlights as item (item.title)}
        <article class="rounded-2xl bg-white/5 p-5 shadow-inner">
          <Fa icon={item.icon} class="h-6 w-6 text-cyan-300" />
          <h3 class="mt-3 text-lg font-semibold">{item.title}</h3>
          <p class="mt-2 text-sm text-white/70">{item.body}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="panel-surface p-8">
    <h2 class="heading-font text-2xl font-semibold">Launch-ready foundation</h2>
    <p class="mt-2 text-white/70">
      The modern quote engine guarantees deterministic results and ships with a repeat-safe history buffer, so every
      click surfaces a fresh line of inspiration.
    </p>
    <div class="mt-6 rounded-2xl bg-white/5 p-6 shadow-inner">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-lg font-semibold">New Svelte runtime</h3>
          <p class="mt-1 text-sm text-white/70">
            Routing, modals, favorites, and matrix effects now render within one reactive graph. The store-driven quote
            flow replaces the global event soup from the legacy build.
          </p>
        </div>
        <Fa icon={faInfinity} class="h-12 w-12 text-indigo-300" />
      </div>
    </div>
  </section>

  <section class="panel-surface p-8">
    <h2 class="heading-font text-2xl font-semibold">Next up on the roadmap</h2>
    <div class="mt-6 space-y-5">
      {#each roadmap as item (item.title)}
        <article class="rounded-2xl bg-white/5 p-5 shadow-inner">
          <div class="flex items-start gap-3">
            <Fa icon={faRocket} class="mt-1 h-5 w-5 text-rose-300" />
            <div>
              <h3 class="text-lg font-semibold">{item.title}</h3>
              <p class="mt-1 text-sm text-white/70">{item.detail}</p>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </section>
</main>

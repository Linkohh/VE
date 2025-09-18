<script lang="ts">
    import App from './App.svelte';
    import ErrorBoundary from './lib/components/ErrorBoundary.svelte';
</script>

<ErrorBoundary onError={(error) => console.error('App-level error:', error)}>
    {#snippet children()}
        <App />
    {/snippet}
</ErrorBoundary>
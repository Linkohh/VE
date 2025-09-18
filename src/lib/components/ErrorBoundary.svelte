<script lang="ts">
    import { onMount } from 'svelte';
    import type { Snippet } from 'svelte';

    interface Props {
        fallback?: Snippet;
        children: Snippet;
        onError?: (error: Error) => void;
    }

    let { fallback, children, onError }: Props = $props();
    let hasError = $state(false);
    let errorMessage = $state('');

    onMount(() => {
        const handleError = (event: ErrorEvent) => {
            hasError = true;
            errorMessage = event.error?.message || 'An unexpected error occurred';

            if (onError) {
                onError(event.error);
            } else {
                console.error('ErrorBoundary caught:', event.error);
            }

            // Prevent the error from bubbling up
            event.preventDefault();
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            hasError = true;
            errorMessage = event.reason?.message || 'An unhandled promise rejection occurred';

            if (onError) {
                onError(new Error(event.reason));
            } else {
                console.error('ErrorBoundary caught unhandled rejection:', event.reason);
            }

            event.preventDefault();
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    });
</script>

{#if hasError}
    {#if fallback}
        {@render fallback()}
    {:else}
        <div class="error-boundary">
            <h2>Something went wrong</h2>
            <p>{errorMessage}</p>
            <button onclick={() => { hasError = false; errorMessage = ''; }}>
                Try again
            </button>
        </div>
    {/if}
{:else}
    {@render children()}
{/if}

<style>
    .error-boundary {
        padding: 2rem;
        text-align: center;
        color: var(--text-primary);
    }

    .error-boundary h2 {
        margin-bottom: 1rem;
        color: var(--accent);
    }

    .error-boundary p {
        margin-bottom: 1.5rem;
        opacity: 0.8;
    }

    .error-boundary button {
        padding: 0.75rem 1.5rem;
        background: var(--accent);
        color: var(--background);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: opacity 0.2s;
    }

    .error-boundary button:hover {
        opacity: 0.9;
    }
</style>
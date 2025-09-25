<script>
  import { customQuotes } from '../store.js';

  let newQuoteText = '';
  let newQuoteAuthor = '';
  let addQuoteFormVisible = false;

  function submitQuote() {
    if (newQuoteText.trim()) {
      const newQuote = { text: newQuoteText.trim(), author: newQuoteAuthor.trim() || 'Anonymous', category: 'custom' };
      customQuotes.update(quotes => [...quotes, newQuote]);
      newQuoteText = '';
      newQuoteAuthor = '';
      addQuoteFormVisible = false;
      document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Custom quote added!', type: 'success' } }));
    }
  }
</script>

<div class="space-y-2 border-t border-gray-600 pt-3">
    <button on:click={() => addQuoteFormVisible = !addQuoteFormVisible} class="w-full text-sm bg-green-500/80 hover:bg-green-600/80 px-2 py-1.5 rounded transition-colors">
        {addQuoteFormVisible ? 'Cancel' : 'Add Custom Quote'}
    </button>
    {#if addQuoteFormVisible}
    <div class="mt-2 space-y-2 p-2 bg-black/20 rounded">
        <textarea bind:value={newQuoteText} rows="3" class="w-full text-black p-2 rounded resize-none" placeholder="Your inspirational quote..."></textarea>
        <input bind:value={newQuoteAuthor} type="text" class="w-full text-black p-1 rounded" placeholder="Author (optional)">
        <button on:click={submitQuote} disabled={!newQuoteText.trim()} class="w-full text-sm bg-blue-500/80 hover:bg-blue-600/80 px-2 py-1.5 rounded transition-colors disabled:opacity-50">Add Quote</button>
    </div>
    {/if}
</div>
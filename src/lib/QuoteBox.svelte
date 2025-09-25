<script>
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import {
    allQuotes,
    currentQuoteIndex,
    isPaused,
    countdown,
    favorites,
    quoteRatings,
    stats,
    ttsEnabled,
    ttsRate,
    ttsVoiceURI,
    applyTheme,
    categoryFilter,
    themePreset
  } from '../store.js';
  import * as themes from '../themes.js';

  // Element bindings
  let quoteTextElement;
  let quoteAuthorElement;

  // Local state
  let currentQuote = { text: 'Loading...', author: 'VibeMe' };
  let isFavorite = false;
  let timerInterval;

  // Social share URLs
  let twitterShareUrl = '';
  let facebookShareUrl = '';
  let linkedinShareUrl = '';
  let whatsappShareUrl = '';
  let pinterestShareUrl = '';

  // --- Core Logic ---

  function newQuote() {
    const quotesPool = get(allQuotes);
    const filter = get(categoryFilter);

    let filteredQuotes = quotesPool;
    if (filter !== 'all') {
      filteredQuotes = quotesPool.filter(q => q.category === filter);
    }
    if (filteredQuotes.length === 0) {
      filteredQuotes = quotesPool; // Fallback to all if filter yields no results
    }

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * filteredQuotes.length);
    } while (filteredQuotes[newIndex]?.text === currentQuote.text && filteredQuotes.length > 1);

    const newQuote = filteredQuotes[newIndex];
    if (!newQuote) return;

    // Find the global index to update the store
    const globalIndex = quotesPool.findIndex(q => q.text === newQuote.text && q.author === newQuote.author);
    currentQuoteIndex.set(globalIndex);

    // Update stats
    stats.update(s => ({ ...s, quotesGenerated: s.quotesGenerated + 1 }));
    startTimer();
    updateTheme();
    speakQuote(newQuote.text, newQuote.author);
  }

  function updateTheme() {
      const preset = get(themePreset);
      let palette;
      if (preset === 'auto') {
          const category = currentQuote.category || 'default';
          palette = themes.pickPaletteFromCategory(category);
      } else {
          palette = themes.pickPaletteFromPreset(preset);
      }
      if (palette) {
          applyTheme(palette);
      }
  }

  function speakQuote(text, author) {
      if (get(ttsEnabled) && text) {
          const utterance = new SpeechSynthesisUtterance(`"${text}" — ${author}`);
          const voiceURI = get(ttsVoiceURI);
          const voices = window.speechSynthesis.getVoices();
          if (voiceURI) {
              utterance.voice = voices.find(v => v.voiceURI === voiceURI);
          }
          utterance.rate = get(ttsRate);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
      }
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    countdown.set(10);

    if (!get(isPaused)) {
      timerInterval = setInterval(() => {
        countdown.update(c => {
          if (c <= 1) {
            newQuote();
            return 10;
          }
          return c - 1;
        });
      }, 1000);
    }
  }

  function toggleTimer() {
    isPaused.update(p => !p);
    if (get(isPaused)) {
      clearInterval(timerInterval);
    } else {
      startTimer();
    }
  }

  async function copyQuote() {
    try {
      await navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`);
      document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Copied to clipboard!', type: 'success' } }));
    } catch (err) {
      console.error('Failed to copy: ', err);
      document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to copy', type: 'error' } }));
    }
  }

  function toggleFavorite() {
    favorites.update(favs => {
      const existingIndex = favs.findIndex(fav => fav.text === currentQuote.text && fav.author === currentQuote.author);
      if (existingIndex >= 0) {
        document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Removed from favorites', type: 'info' } }));
        return favs.filter((_, i) => i !== existingIndex);
      } else {
        document.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Added to favorites! ❤️', type: 'success' } }));
        return [...favs, currentQuote];
      }
    });
  }

  function rateQuote(direction) {
    const quoteId = `${currentQuote.text}-${currentQuote.author}`;
    quoteRatings.update(ratings => {
      const newRatings = { ...ratings };
      if (!newRatings[quoteId]) {
        newRatings[quoteId] = { up: 0, down: 0 };
      }
      if (direction === 'up') {
        newRatings[quoteId].up++;
      } else {
        newRatings[quoteId].down++;
      }
      return newRatings;
    });
    const message = direction === 'up' ? 'Thanks for the feedback!' : 'Noted. Thanks for the feedback!';
    document.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type: 'info' } }));
  }

  function updateSocialLinks(quote) {
    if (!quote) return;
    const text = `"${quote.text}" — ${quote.author}`;
    const url = "https://vibeme.app";
    twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=Inspirational%20Quote&summary=${encodeURIComponent(text)}`;
    whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`;
  }

  // --- Subscriptions ---

  const unsubscribeQuote = currentQuoteIndex.subscribe(idx => {
    const all = get(allQuotes);
    if (all.length > 0) {
      currentQuote = all[idx] || all[0];
      updateSocialLinks(currentQuote);

      if (quoteTextElement && quoteAuthorElement) {
        quoteTextElement.classList.remove('enter-active');
        quoteAuthorElement.classList.remove('author-enter');
        quoteTextElement.classList.add('exit-active');
        quoteAuthorElement.classList.add('author-exit');

        setTimeout(() => {
            quoteTextElement.textContent = currentQuote.text;
            quoteAuthorElement.textContent = `— ${currentQuote.author}`;
            quoteTextElement.classList.remove('exit-active');
            quoteTextElement.classList.add('enter-active');
            quoteAuthorElement.classList.remove('author-exit');
            quoteAuthorElement.classList.add('author-enter');
        }, 400);
      }
    }
  });

  const unsubscribeFavorites = favorites.subscribe(favs => {
    if (currentQuote) {
      isFavorite = favs.some(fav => fav.text === currentQuote.text && fav.author === currentQuote.author);
    }
  });

  // --- Lifecycle ---

  onMount(() => {
    newQuote(); // Load initial quote

    // Update stats on visit
    stats.update(s => {
      const now = new Date();
      const lastVisit = s.lastVisit ? new Date(s.lastVisit) : null;
      let dayStreak = s.dayStreak;
      if (lastVisit) {
        const diffDays = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          dayStreak++;
        } else if (diffDays > 1) {
          dayStreak = 1;
        }
      } else {
        dayStreak = 1;
      }
      return { ...s, dayStreak, lastVisit: now.toISOString() };
    });

    // Keyboard shortcuts
    const handleKeydown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('[role="dialog"]')) {
        return;
      }
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'n':
          e.preventDefault(); newQuote(); break;
        case 't':
          e.preventDefault(); toggleTimer(); break;
        case 'c':
          e.preventDefault(); copyQuote(); break;
        case 'f':
          e.preventDefault(); toggleFavorite(); break;
        case 'd':
          e.preventDefault(); document.getElementById('dark-mode-toggle')?.click(); break;
        case 's':
          e.preventDefault(); document.getElementById('settings-toggle')?.click(); break;
      }
    };
    window.addEventListener('keydown', handleKeydown);

    onDestroy(() => {
      window.removeEventListener('keydown', handleKeydown);
    });
  });

  onDestroy(() => {
    unsubscribeQuote();
    unsubscribeFavorites();
    if (timerInterval) clearInterval(timerInterval);
  });
</script>

<main id="main-content" class="container mx-auto max-w-4xl relative z-10 pt-8">
    <div id="app-title-bar" class="app-title-bar" role="banner" aria-label="Application Title">
      <h1 class="vb-logo heading-font" data-title="VibeMe">VibeMe</h1>
      <span class="logo-underline" aria-hidden="true"></span>
      <div id="flip-clock-mount" class="flip-clock-mount" data-skin="v2" aria-label="Current time" role="timer"></div>
    </div>
    <div class="quote-container-outer">
        <div class="quote-container-inner">
            <div class="quote-pattern" id="quote-pattern" aria-hidden="true"></div>
            <div class="relative z-10">
                <header></header>
                <section class="quote-animation-container text-center mb-8 min-h-[120px] md:min-h-[150px]"
                         aria-live="polite" aria-atomic="true">
                    <blockquote>
                        <p bind:this={quoteTextElement} id="quote-text"
                           class="quote-text-font text-2xl md:text-3xl mb-4 leading-relaxed dynamic-text-main quote-text-animate">
                           {currentQuote.text}
                        </p>
                        <footer>
                            <cite bind:this={quoteAuthorElement} id="quote-author"
                                  class="text-lg italic dynamic-text-secondary author-font author-animate">
                                  — {currentQuote.author}
                            </cite>
                        </footer>
                    </blockquote>
                </section>
                <section class="flex justify-center items-center space-x-3 mb-6 text-xl"
                         aria-label="Quote actions">
                    <button on:click={copyQuote} id="copy-quote-btn" type="button"
                            title="Copy quote to clipboard (C)"
                            class="dynamic-text-secondary hover:text-white/80 transition-colors p-2 rounded-full hover:bg-white/10 action-button"
                            aria-label="Copy quote to clipboard">
                        <i class="fas fa-copy" aria-hidden="true"></i>
                    </button>
                    <button on:click={toggleFavorite} id="favorite-quote-btn" type="button"
                            title="Add to favorites (F)"
                            class="dynamic-text-secondary hover:text-white/80 transition-colors p-2 rounded-full hover:bg-white/10 action-button"
                            aria-label="Add quote to favorites">
                        <i class="fa-heart" class:fas={isFavorite} class:far={!isFavorite} aria-hidden="true"></i>
                    </button>
                    <button on:click={() => rateQuote('up')} id="rate-up-btn" type="button"
                            title="Rate this quote positively"
                            class="dynamic-text-secondary hover:text-green-400 transition-colors p-2 rounded-full hover:bg-white/10 action-button"
                            aria-label="Rate quote positively">
                        <i class="far fa-thumbs-up" aria-hidden="true"></i>
                    </button>
                    <button on:click={() => rateQuote('down')} id="rate-down-btn" type="button"
                            title="Rate this quote negatively"
                            class="dynamic-text-secondary hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/10 action-button"
                            aria-label="Rate quote negatively">
                        <i class="far fa-thumbs-down" aria-hidden="true"></i>
                    </button>
                </section>
                <section class="flex flex-col items-center space-y-6" aria-label="Quote generation">
                    <button on:click={newQuote} id="generate-btn" type="button"
                            class="generate-btn font-semibold"
                            title="Generate new quote (Spacebar)"
                            aria-label="Generate new inspirational quote">
                        <i class="fas fa-sync-alt" aria-hidden="true"></i>
                        <span class="text-sm">New Vibe</span>
                    </button>
                    <div class="flex items-center dynamic-text-secondary text-sm space-x-3"
                         aria-label="Auto-generation timer">
                        <button on:click={toggleTimer} id="timer-toggle-btn" type="button"
                                title="Pause automatic quote generation (T)"
                                class="hover:text-white/80 transition-colors"
                                aria-label="Pause automatic quote generation">
                            <i class="fas" class:fa-pause={!$isPaused} class:fa-play={$isPaused} aria-hidden="true"></i>
                        </button>
                        <span>
                            New quote in <span id="countdown">{$countdown}</span>s
                        </span>
                    </div>
                    <nav class="flex space-x-3 md:space-x-4 mt-6"
                         aria-label="Share quote on social media">
                        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer"
                           class="social-bubble" aria-label="Share on Twitter" title="Share on Twitter">
                            <i class="fab fa-twitter" aria-hidden="true"></i>
                        </a>
                        <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer"
                           class="social-bubble" aria-label="Share on Facebook" title="Share on Facebook">
                            <i class="fab fa-facebook-f" aria-hidden="true"></i>
                        </a>
                        <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer"
                           class="social-bubble" aria-label="Share on LinkedIn" title="Share on LinkedIn">
                            <i class="fab fa-linkedin-in" aria-hidden="true"></i>
                        </a>
                        <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer"
                           class="social-bubble" aria-label="Share on WhatsApp" title="Share on WhatsApp">
                            <i class="fab fa-whatsapp" aria-hidden="true"></i>
                        </a>
                        <a href={pinterestShareUrl} target="_blank" rel="noopener noreferrer"
                           class="social-bubble" aria-label="Share on Pinterest" title="Share on Pinterest">
                            <i class="fab fa-pinterest-p" aria-hidden="true"></i>
                        </a>
                    </nav>
                </section>
            </div>
        </div>
    </div>
</main>

<style>
  .quote-container-outer {
    position: relative;
    padding: 4px;
    border-radius: var(--radius-xl);
    background: linear-gradient(135deg, var(--color1), var(--color2), var(--color3));
    box-shadow: var(--shadow-lg);
    border: 3px solid;
    animation: rgb-border-spin 8s linear infinite;
    z-index: var(--z-base);
    overflow: clip;
    contain: layout paint;
  }

  .quote-container-outer::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 22px;
    border: 2px solid;
    z-index: var(--z-negative);
    animation: rgb-border-spin 8s linear infinite reverse;
    filter: blur(8px);
    opacity: 0.7;
  }

  .quote-container-inner {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(var(--container-blur)) saturate(180%);
    -webkit-backdrop-filter: blur(var(--container-blur)) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: var(--shadow-lg);
    border-radius: var(--card-radius);
    padding: var(--spacing-lg);
    position: relative;
    overflow: hidden;
  }

  .quote-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    mix-blend-mode: multiply;
    border-radius: var(--radius-lg);
    transition: background-image var(--transition-medium);
  }

  .quote-animation-container {
    perspective: 1000px;
  }

  .quote-text-animate {
    transform-style: preserve-3d;
    backface-visibility: hidden;
    will-change: transform, opacity;
    transition: transform 0.5s, opacity 0.5s;
  }

  .exit-active {
    transform: translateY(50px) rotateX(90deg);
    opacity: 0;
  }

  .enter-active {
    transform: translateY(0) rotateX(0deg);
    opacity: 1;
  }

  .author-animate {
    transition: transform 0.5s, opacity 0.5s;
  }

  .author-exit {
    transform: translateX(50px);
    opacity: 0;
  }

  .author-enter {
    transform: translateX(0);
    opacity: 1;
  }

  .generate-btn {
    width: 110px;
    height: 110px;
    padding: 5px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--color1), var(--color2));
    color: white;
    border: none;
    position: relative;
    box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
    transform: translatey(0px);
    animation: float 6s ease-in-out infinite;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: none;
    overflow: hidden;
    cursor: pointer;
    z-index: var(--z-elevated);
  }

  .generate-btn::before {
    content: '';
    position: absolute;
    z-index: var(--z-negative);
    inset: -3px;
    border-radius: var(--radius-full);
    background: linear-gradient(60deg, var(--color1), var(--color2), var(--color3), var(--color1));
    background-size: 300% 300%;
    animation: gradient-border-flow 4s linear infinite;
    filter: blur(2px);
  }

  .generate-btn i {
    font-size: 1.4rem;
    margin-bottom: 0.2rem;
    margin-right: 0;
  }

  .generate-btn span {
    font-size: 0.7rem;
    line-height: 1.1;
    display: block;
    font-weight: 600;
  }

  .generate-btn:hover {
    transform: translatey(0px);
  }

  .generate-btn:hover::before {
    filter: blur(4px);
  }

  .generate-btn:active {
    transform: translateY(2px);
  }

  .social-bubble {
    position: relative;
    z-index: var(--z-elevated);
    transition: all var(--transition-medium);
    border-radius: var(--radius-full);
    background-color: var(--social-icon-bg);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-md);
    text-decoration: none;
  }

  .social-bubble::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.2);
    z-index: var(--z-negative);
    opacity: 0;
    transition: all var(--transition-medium);
  }

  .social-bubble:hover {
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.25);
  }

  .social-bubble:hover::before {
    opacity: 1;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
  }

  .social-bubble i {
    color: white;
    font-size: 1rem;
    width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .action-button {
    padding: var(--spacing-sm);
    border-radius: var(--radius-full);
    transition: all var(--transition-medium);
  }

  .action-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
</style>
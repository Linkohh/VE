<script>
  import './app.css';
  import '@fortawesome/fontawesome-free/css/all.min.css';

  import BackgroundEffects from './lib/BackgroundEffects.svelte';
  import TopControls from './lib/TopControls.svelte';
  import DateDisplay from './lib/DateDisplay.svelte';
  import SettingsPanel from './lib/SettingsPanel.svelte';
  import QuoteBox from './lib/QuoteBox.svelte';
  import KeyboardHelp from './lib/KeyboardHelp.svelte';
  import Footer from './lib/Footer.svelte';
  import FavoritesPanel from './lib/FavoritesPanel.svelte';
  import Toast from './lib/Toast.svelte';
</script>


<div class="min-h-screen flex items-center justify-center p-0 gradient-bg">
  <BackgroundEffects />
  <TopControls />
  <DateDisplay />
  <SettingsPanel />
  <QuoteBox />
  <KeyboardHelp />
  <Footer />
  <FavoritesPanel />
  <Toast />
</div>

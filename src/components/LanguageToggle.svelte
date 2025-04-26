<script lang="ts">
  import { onMount } from 'svelte';
  import { language, initializeLanguageStore } from '../stores/languageStore'; // Import from the new store

  let currentLang: 'en' | 'zh';

  // Subscribe to the store to update the local variable for the button label/aria-label
  language.subscribe(value => {
    currentLang = value;
  });

  onMount(() => {
    // Initialize the store (which handles localStorage)
    initializeLanguageStore();
  });

  function toggleLanguage() {
    language.update(lang => (lang === 'en' ? 'zh' : 'en'));
  }
</script>

<button
  on:click={toggleLanguage}
  class="px-3 cursor-pointer py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
  aria-label={currentLang === 'en' ? 'Switch to Chinese' : '切换到英文'}
>
  {currentLang === 'en' ? 'Switch to Chinese' : '切换到英文'}
</button>

<style>
  /* Add any specific styles if needed, otherwise rely on Tailwind */
</style>
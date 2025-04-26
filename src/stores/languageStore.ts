import { writable } from 'svelte/store';

// Define the store for language preference
export const language = writable<'en' | 'zh'>('zh'); // Default to Chinese

// Function to initialize the store from localStorage on the client-side
export function initializeLanguageStore() {
  // Use !import.meta.env.SSR for client-side check in Astro
  if (!import.meta.env.SSR) { // Ensure this runs only in the browser
    const storedLang = localStorage.getItem('preferredLang');
    if (storedLang === 'en' || storedLang === 'zh') {
      language.set(storedLang);
    }

    // Subscribe to changes and update localStorage
    language.subscribe(value => {
      localStorage.setItem('preferredLang', value);
    });
  }
}
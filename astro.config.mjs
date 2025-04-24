// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()]
	},
	output: 'server',
	adapter: vercel(),
	env: {
		schema: {
			GEMINI_API_KEY: envField.string({ context: "server", access: "secret" }),
		},
	},
	integrations: [react(), svelte()]
});

import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({ preprocess: vitePreprocess(), adapter: adapter() })
	],
	// @atproto/oauth-client's loopback handling and workerd's local DNS both
	// expect the literal 127.0.0.1, not the hostname "localhost".
	server: { host: '127.0.0.1' }
});

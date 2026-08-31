import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// @atproto/oauth-client's loopback handling and workerd's local DNS both
	// expect the literal 127.0.0.1, not the hostname "localhost".
	server: { host: '127.0.0.1' }
});

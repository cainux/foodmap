import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import type { VitePluginPWAAPI } from 'vite-plugin-pwa';

/**
 * @vite-pwa/sveltekit generates the service worker in `closeBundle` of what it
 * assumes is SvelteKit's separate SSR build (`build.ssr`). SvelteKit 3 builds
 * every environment under one config, so that never fires and no `sw.js` is
 * emitted. Generate it from a `buildApp` hook instead: those run after SvelteKit
 * has built and prerendered, and before the adapter copies the output. The
 * plugin's `outDir` must point at the client output for the same reason.
 */
function pwaServiceWorker(): Plugin {
	return {
		name: 'foodmap:pwa-service-worker',
		apply: 'build',
		buildApp: {
			async handler(builder) {
				const api = builder.config.plugins.find((p) => p.name === 'vite-plugin-pwa')?.api as
					| VitePluginPWAAPI
					| undefined;
				if (!api || api.disabled) return;

				await api.generateSW();
			}
		}
	};
}

export default defineConfig({
	plugins: [
		sveltekit({
			// Consult https://svelte.dev/docs/kit/integrations
			// for more information about preprocessors
			preprocess: vitePreprocess(),

			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: undefined,
				precompress: false,
				strict: true
			})
		}),

		SvelteKitPWA({
			srcDir: './src',
			outDir: '.svelte-kit/output/client',
			mode: 'production',
			scope: '/',
			base: '/',
			// SvelteKit 3 sets Vite's base to './', which the plugin would otherwise inherit
			kit: { base: '/' },
			selfDestroying: false,
			manifest: {
				name: 'FoodMap - Interactive Restaurant Map',
				short_name: 'FoodMap',
				description: 'Personal restaurant map for tracking favorite dining locations',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#1095c1',
				orientation: 'any',
				icons: [
					{
						src: '/icon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
				runtimeCaching: [
					{
						// Cache OpenStreetMap tiles
						urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'osm-tiles',
							expiration: {
								maxEntries: 500,
								maxAgeSeconds: 60 * 60 * 24 * 30 /* 30 days */
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						// Cache other tile providers (CartoDB, etc.)
						urlPattern: /^https:\/\/.*\.(carto|cartodb).*\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'map-tiles',
							expiration: {
								maxEntries: 500,
								maxAgeSeconds: 60 * 60 * 24 * 30
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						// Cache MapLibre fonts
						urlPattern: /^https:\/\/.*demotiles\.maplibre\.org\/font\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'maplibre-fonts',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 365 /* 1 year */
							}
						}
					}
				]
			},
			registerType: 'prompt',
			devOptions: {
				enabled: true,
				type: 'module',
				navigateFallback: '/'
			}
		}),
		pwaServiceWorker()
	]
});

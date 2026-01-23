import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			srcDir: './src',
			mode: 'production',
			scope: '/',
			base: '/',
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
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
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
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
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
		})
	]
});

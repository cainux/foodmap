<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import '@picocss/pico/css/pico.min.css';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let { children } = $props();

	// Register service worker for PWA
	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('Service Worker registered:', registration.scope);

					// Handle updates
					registration.addEventListener('updatefound', () => {
						const newWorker = registration.installing;
						if (newWorker) {
							newWorker.addEventListener('statechange', () => {
								if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
									// New service worker available, reload page
									if (confirm('New version available! Reload to update?')) {
										newWorker.postMessage({ type: 'SKIP_WAITING' });
										window.location.reload();
									}
								}
							});
						}
					});
				})
				.catch((error) => {
					console.error('Service Worker registration failed:', error);
				});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

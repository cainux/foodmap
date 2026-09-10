<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@picocss/pico/css/pico.min.css';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { pwaInfo } from 'virtual:pwa-info';

	let { children } = $props();

	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{@html webManifestLink}
</svelte:head>

{@render children()}

<style>
	/* The clearance every element at the bottom edge of the screen keeps from the OS
	   home-gesture strip. Declared once here so the sheet and the map's floating
	   controls cannot drift apart. Desktop has no such strip, so it is a real 0px
	   rather than undefined - consumers can then use it unconditionally, with no
	   breakpoint of their own. `:root` is not scoped by Svelte, so this reaches every
	   component. */
	:root {
		--mobile-bottom-inset: 0px;
	}

	@media (max-width: 768px) {
		:root {
			/* env() only reports a real value under viewport-fit=cover, which this site
			   deliberately does not set (keep-sheet-clear-of-home-gesture/design.md -
			   Decision 1), so the 28px floor carries the fix today. */
			--mobile-bottom-inset: max(env(safe-area-inset-bottom), 28px);
		}
	}

	:global(html),
	:global(body) {
		margin: 0;
		height: 100%;
	}

	:global(body) {
		overflow: hidden;
	}
</style>

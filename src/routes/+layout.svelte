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

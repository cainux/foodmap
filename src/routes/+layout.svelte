<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@picocss/pico/css/pico.min.css';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

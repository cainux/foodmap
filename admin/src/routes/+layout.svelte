<script lang="ts">
	import '@picocss/pico/css/pico.min.css';

	let { children } = $props();
</script>

<main class="container">
	{@render children()}
</main>

<style>
	:global([role='alert']) {
		color: var(--pico-del-color);
		font-weight: bold;
	}
</style>

<script lang="ts">
	import RestaurantForm from '$lib/components/RestaurantForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let confirmingDelete = $state(false);
</script>

<h1>Edit restaurant</h1>

<RestaurantForm restaurant={data.restaurant} existing={data.all} formError={form?.formError} />

<form method="POST" action="?/delete">
	{#if confirmingDelete}
		<p role="alert">Delete "{data.restaurant.name}"? This can't be undone.</p>
		<button type="submit">Confirm delete</button>
		<button type="button" onclick={() => (confirmingDelete = false)}>Cancel</button>
	{:else}
		<button type="button" onclick={() => (confirmingDelete = true)}>Delete</button>
	{/if}
</form>

<a href="/">Back to list</a>

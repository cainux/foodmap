<script lang="ts">
	import RestaurantForm from '$lib/components/RestaurantForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>Add restaurant</h1>

<RestaurantForm existing={data.all} formError={form?.formError} />

<script lang="ts">
	import RestaurantForm from '$lib/components/RestaurantForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>foodmap admin</h1>

<div class="layout">
	<section class="list">
		<form method="GET">
			<input name="q" type="search" placeholder="Search name or tags" value={data.q} />
			<button type="submit">Search</button>
		</form>

		<ul>
			{#each data.restaurants as restaurant (restaurant.id)}
				<li>
					<a href="/restaurants/{restaurant.id}/edit">{restaurant.name}</a>
					{#if restaurant.tags}<small>{restaurant.tags}</small>{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section class="form">
		<h2>Add restaurant</h2>
		<RestaurantForm existing={data.all} formError={form?.formError} />
	</section>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	@media (min-width: 900px) {
		.layout {
			flex-direction: row;
			align-items: flex-start;
		}
		.list {
			flex: 1;
		}
		.form {
			flex: 1;
		}
	}
</style>

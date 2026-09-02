<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>foodmap admin</h1>

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

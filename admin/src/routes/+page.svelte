<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let query = $state('');

	let matches = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.restaurants;
		return data.restaurants.filter((r) => r.name.toLowerCase().includes(q));
	});
</script>

<search>
	<input type="search" bind:value={query} placeholder="Search by name" aria-label="Search by name" />
</search>

<p class="count">
	{matches.length}
	{matches.length === 1 ? 'restaurant' : 'restaurants'}
	{#if query.trim()}matching “{query.trim()}”{/if}
</p>

{#if matches.length === 0}
	<p>No restaurants match that name.</p>
{:else}
	<ul>
		{#each matches as restaurant (restaurant.id)}
			<li>
				<a href="/restaurants/{restaurant.id}/edit">
					<article>
						<strong>{restaurant.name}</strong>
						{#if restaurant.tags}<small>{restaurant.tags}</small>{/if}
					</article>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	search {
		display: block;
	}

	search input {
		margin-bottom: calc(var(--pico-spacing) * 0.5);
	}

	.count {
		margin-bottom: var(--pico-spacing);
		color: var(--pico-muted-color);
		font-size: 0.875rem;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		margin: 0;
		padding: 0;
	}

	a {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	article {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin: 0 0 calc(var(--pico-spacing) * 0.5);
		padding: 0.875rem var(--pico-spacing);
	}

	small {
		color: var(--pico-muted-color);
	}
</style>

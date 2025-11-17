<script lang="ts">
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import restaurantsData from '$lib/restaurants.json';

	const restaurants = restaurantsData;
	const restaurantCount = restaurants.filter((r) => r.coordinates !== null).length;
</script>

<main class="container">
	<header>
		<h1>🍽️ Food Map</h1>
		<p>Discover great restaurants in London</p>
	</header>

	<article>
		<RestaurantMap {restaurants} />
	</article>

	<section>
		<h2>Restaurants ({restaurantCount})</h2>
		<div class="restaurant-grid">
			{#each restaurants as restaurant}
				{#if restaurant.coordinates}
					<article class="restaurant-card">
						<h3>{restaurant.name}</h3>
						<a href={restaurant.url} target="_blank" rel="noopener noreferrer">
							View on Google Maps →
						</a>
					</article>
				{/if}
			{/each}
		</div>
	</section>
</main>

<style>
	main {
		padding: 2rem 0;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
	}

	header h1 {
		margin-bottom: 0.5rem;
	}

	header p {
		color: var(--pico-muted-color);
		margin-top: 0;
	}

	.restaurant-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.restaurant-card {
		padding: 1rem;
		margin: 0;
	}

	.restaurant-card h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
	}

	.restaurant-card a {
		font-size: 0.9rem;
		text-decoration: none;
	}

	.restaurant-card a:hover {
		text-decoration: underline;
	}
</style>

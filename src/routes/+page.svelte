<script lang="ts">
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import restaurantsData from '$lib/restaurants.json';

	let sortedRestaurants = $state(restaurantsData);
	let userLocation = $state<{ lat: number; lng: number } | null>(null);

	function handleLocationUpdate(location: { lat: number; lng: number }) {
		userLocation = location;

		// Calculate distances and sort restaurants
		const withDistances = restaurantsData
			.filter(r => r.coordinates)
			.map(r => {
				const distance = calculateDistance(
					location.lat,
					location.lng,
					r.coordinates!.lat,
					r.coordinates!.lng
				);
				return { ...r, distance };
			})
			.sort((a, b) => a.distance - b.distance);

		sortedRestaurants = withDistances;
	}

	// Haversine formula to calculate distance between two points
	function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371; // Radius of Earth in km
		const dLat = toRad(lat2 - lat1);
		const dLon = toRad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	function toRad(degrees: number): number {
		return degrees * (Math.PI / 180);
	}
</script>

<main class="container">
	<header>
		<h1>🍽️ Food Map</h1>
		<p>Where I like to eat</p>
	</header>

	<article>
		<RestaurantMap restaurants={restaurantsData} onLocationUpdate={handleLocationUpdate} />
	</article>

	<section>
		<h2>Restaurants</h2>
		<div class="restaurant-grid">
			{#each sortedRestaurants as restaurant}
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

	section {
		margin-top: 2rem;
	}

	section h2 {
		margin-bottom: 1rem;
	}

	@media (max-width: 768px) {
		section h2 {
			text-align: center;
		}
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

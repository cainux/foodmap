<script lang="ts">
	import { flip } from 'svelte/animate';
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import restaurantsData from '$lib/restaurants.json';

	let sortedRestaurants = $state(restaurantsData.filter(r => r.coordinates));
	let userLocation = $state<{ lat: number; lng: number } | null>(null);
	let navigateToRestaurant: ((coords: { lat: number; lng: number }) => void) | null = null;
	let mapSection: HTMLElement;

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

	function handleMapReady(navFunction: (coords: { lat: number; lng: number }) => void) {
		navigateToRestaurant = navFunction;
	}

	function handleCardClick(coords: { lat: number; lng: number }) {
		if (navigateToRestaurant) {
			navigateToRestaurant(coords);

			// Scroll to map on mobile devices
			if (mapSection) {
				// Small delay to allow map animation to start
				setTimeout(() => {
					mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}, 100);
			}
		}
	}

	function handleCardKeyPress(event: KeyboardEvent, coords: { lat: number; lng: number }) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick(coords);
		}
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

	<article bind:this={mapSection}>
		<RestaurantMap
			restaurants={restaurantsData}
			onLocationUpdate={handleLocationUpdate}
			onMapReady={handleMapReady}
		/>
	</article>

	<section>
		<h2>Restaurants</h2>
		<div class="restaurant-grid">
			{#each sortedRestaurants as restaurant (restaurant.url)}
				<div
					class="restaurant-card"
					onclick={() => handleCardClick(restaurant.coordinates!)}
					onkeydown={(e) => handleCardKeyPress(e, restaurant.coordinates!)}
					role="button"
					tabindex="0"
					animate:flip={{ duration: 300 }}
				>
					<div class="card-content">
						<h3>{restaurant.name}</h3>
						<a
							href={restaurant.url}
							target="_blank"
							rel="noopener noreferrer"
							class="maps-button"
							onclick={(e) => e.stopPropagation()}
							title="Open in Google Maps"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
								<path
									fill="#4285F4"
									d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
								/>
							</svg>
						</a>
					</div>
				</div>
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
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		background: var(--pico-card-background-color);
		border-radius: var(--pico-border-radius);
		box-shadow: var(--pico-card-box-shadow);
	}

	.restaurant-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.restaurant-card:active {
		transform: translateY(0);
	}

	.card-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.restaurant-card h3 {
		margin: 0;
		font-size: 1.1rem;
		flex: 1;
	}

	.maps-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: white;
		border: 2px solid #e0e0e0;
		border-radius: 6px;
		padding: 6px;
		text-decoration: none;
		flex-shrink: 0;
		transition: all 0.2s ease;
	}

	.maps-button:hover {
		background: #f5f5f5;
		border-color: #4285F4;
		transform: scale(1.05);
	}

	.maps-button svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>

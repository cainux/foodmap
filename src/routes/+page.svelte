<script lang="ts">
	import { flip } from 'svelte/animate';
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import restaurantsData from '$lib/restaurants.json';
	import { calculateDistance } from '$lib/geo';

	let sortedRestaurants = $state(restaurantsData.filter(r => r.coordinates));
	let userLocation = $state<{ lat: number; lng: number } | null>(null);
	let navigateToRestaurant: ((coords: { lat: number; lng: number }) => void) | null = null;
	let mapSection: HTMLElement;

	// Social media preview metadata
	const siteUrl = 'https://food.oha.me';
	const title = 'Food Map';
	const description = 'Where I like to eat';
	const imageUrl = `${siteUrl}/social-preview.png`;

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

</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={title} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={siteUrl} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={imageUrl} />

	<!-- WhatsApp -->
	<meta property="og:site_name" content={title} />
</svelte:head>

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
						<div class="card-header">
							<h3>{restaurant.name}</h3>
						</div>
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

	.restaurant-card h3 {
		margin: 0;
		font-size: 1.1rem;
	}
</style>

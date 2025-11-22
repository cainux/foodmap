<script lang="ts">
	import { MapLibre, GeoJSONSource, CircleLayer, Marker, Popup } from 'svelte-maplibre-gl';
	import type { Map, LngLatLike, MapLayerMouseEvent } from 'maplibre-gl';

	interface Restaurant {
		name: string;
		url: string;
		coordinates: { lat: number; lng: number } | null;
	}

	let { restaurants, onLocationUpdate, onMapReady }: {
		restaurants: Restaurant[];
		onLocationUpdate: (location: { lat: number; lng: number }) => void;
		onMapReady?: (navigateToRestaurant: (coords: { lat: number; lng: number }) => void) => void;
	} = $props();

	let map = $state<Map>();
	let hasGeolocation = $state(false);
	let isLocating = $state(false);
	let moveTimeout: ReturnType<typeof setTimeout> | null = null;
	let highlightedRestaurantId = $state<string | null>(null);
	let userLocation = $state<{ lng: number; lat: number } | null>(null);
	let selectedRestaurant = $state<Restaurant | null>(null);

	// OpenStreetMap style
	const mapStyle = {
		version: 8 as const,
		sources: {
			'osm-tiles': {
				type: 'raster' as const,
				tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
				tileSize: 256,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}
		},
		layers: [
			{
				id: 'osm-tiles',
				type: 'raster' as const,
				source: 'osm-tiles',
				minzoom: 0,
				maxzoom: 19
			}
		]
	};

	// Calculate center of all restaurants
	const validRestaurants = restaurants.filter((r) => r.coordinates !== null);
	const avgLat =
		validRestaurants.reduce((sum, r) => sum + r.coordinates!.lat, 0) /
		validRestaurants.length;
	const avgLng =
		validRestaurants.reduce((sum, r) => sum + r.coordinates!.lng, 0) /
		validRestaurants.length;

	const initialCenter: LngLatLike = [avgLng, avgLat];

	// Create GeoJSON feature collection for restaurant markers
	let restaurantFeatures = $derived({
		type: 'FeatureCollection' as const,
		features: validRestaurants.map((restaurant) => ({
			type: 'Feature' as const,
			properties: {
				name: restaurant.name,
				url: restaurant.url,
				id: `${restaurant.coordinates!.lat},${restaurant.coordinates!.lng}`
			},
			geometry: {
				type: 'Point' as const,
				coordinates: [restaurant.coordinates!.lng, restaurant.coordinates!.lat]
			}
		}))
	});

	// Circle paint properties with conditional styling for highlighted marker
	let circlePaint = $derived(highlightedRestaurantId ? {
		'circle-radius': ['case', ['==', ['get', 'id'], highlightedRestaurantId], 12, 8] as any,
		'circle-color': ['case', ['==', ['get', 'id'], highlightedRestaurantId], '#ff6b6b', '#1095c1'] as any,
		'circle-stroke-width': ['case', ['==', ['get', 'id'], highlightedRestaurantId], 3, 2] as any,
		'circle-stroke-color': '#fff',
		'circle-opacity': 1
	} : {
		'circle-radius': 8,
		'circle-color': '#1095c1',
		'circle-stroke-width': 2,
		'circle-stroke-color': '#fff',
		'circle-opacity': 1
	});

	// Check if geolocation is available
	if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
		hasGeolocation = true;
	}

	function handleMapLoad(e: any) {
		// Get map from event to ensure it's available immediately
		const mapInstance = e.target as Map;
		if (!mapInstance) return;

		// Also ensure our bound map variable is set
		if (!map) map = mapInstance;

		// Fit bounds to show all markers
		if (validRestaurants.length > 0) {
			const bounds = validRestaurants.reduce((bounds, restaurant) => {
				return bounds.extend([restaurant.coordinates!.lng, restaurant.coordinates!.lat]);
			}, new (window as any).maplibregl.LngLatBounds(
				[validRestaurants[0].coordinates!.lng, validRestaurants[0].coordinates!.lat],
				[validRestaurants[0].coordinates!.lng, validRestaurants[0].coordinates!.lat]
			));

			mapInstance.fitBounds(bounds, { padding: 50 });
		}

		// Expose navigation function to parent component
		if (onMapReady) {
			onMapReady(navigateToRestaurant);
		}
	}

	function handleMoveEnd() {
		// Clear existing timeout
		if (moveTimeout) {
			clearTimeout(moveTimeout);
		}

		// Set new timeout to update sorting 500ms after movement stops
		moveTimeout = setTimeout(() => {
			if (map) {
				const center = map.getCenter();
				onLocationUpdate({ lat: center.lat, lng: center.lng });
			}
		}, 500);
	}

	function handleMarkerClick(e: MapLayerMouseEvent) {
		if (!e.features || e.features.length === 0) return;

		const feature = e.features[0];
		const { name, url } = feature.properties as { name: string; url: string };

		// Find the restaurant
		const restaurant = restaurants.find(r => r.name === name && r.url === url);
		if (restaurant) {
			selectedRestaurant = restaurant;
		}
	}

	function handleMouseEnter() {
		if (map) {
			map.getCanvas().style.cursor = 'pointer';
		}
	}

	function handleMouseLeave() {
		if (map) {
			map.getCanvas().style.cursor = '';
		}
	}

	// Function to navigate to and highlight a restaurant marker
	function navigateToRestaurant(coords: { lat: number; lng: number }) {
		const id = `${coords.lat},${coords.lng}`;

		// Close previous popup
		selectedRestaurant = null;

		// Set highlighted restaurant
		highlightedRestaurantId = id;

		// Fly to the marker location with smooth animation
		if (map) {
			map.flyTo({
				center: [coords.lng, coords.lat],
				zoom: 16,
				duration: 1200
			});

			// Find the restaurant data for the popup
			const restaurant = restaurants.find(
				r => r.coordinates && r.coordinates.lat === coords.lat && r.coordinates.lng === coords.lng
			);

			if (restaurant) {
				// Open popup after animation
				setTimeout(() => {
					selectedRestaurant = restaurant;
				}, 1300);
			}
		}
	}

	async function findMyLocation() {
		if (!navigator.geolocation) return;

		isLocating = true;

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;

				// Set user location marker
				userLocation = { lng: longitude, lat: latitude };

				// Notify parent component
				onLocationUpdate({ lat: latitude, lng: longitude });

				// Find nearest restaurant
				const validRestaurants = restaurants.filter(r => r.coordinates !== null);
				if (validRestaurants.length > 0 && map) {
					// Calculate distances and find nearest
					const restaurantsWithDistance = validRestaurants.map(r => {
						const distance = calculateDistance(
							latitude,
							longitude,
							r.coordinates!.lat,
							r.coordinates!.lng
						);
						return { restaurant: r, distance };
					});

					// Sort by distance and get the nearest
					restaurantsWithDistance.sort((a, b) => a.distance - b.distance);
					const nearestRestaurant = restaurantsWithDistance[0].restaurant;

					// Highlight the nearest restaurant
					const id = `${nearestRestaurant.coordinates!.lat},${nearestRestaurant.coordinates!.lng}`;
					highlightedRestaurantId = id;

					// Fit map bounds to show both user location and nearest restaurant
					const bounds = new (window as any).maplibregl.LngLatBounds(
						[longitude, latitude],
						[longitude, latitude]
					);
					bounds.extend([nearestRestaurant.coordinates!.lng, nearestRestaurant.coordinates!.lat]);

					map.fitBounds(bounds, {
						padding: { top: 80, bottom: 80, left: 80, right: 80 },
						duration: 1200
					});

					// Open popup for nearest restaurant after animation
					setTimeout(() => {
						selectedRestaurant = nearestRestaurant;
					}, 1300);
				} else if (map) {
					// No restaurants found, just zoom to user location
					map.flyTo({
						center: [longitude, latitude],
						zoom: 15,
						duration: 1200
					});
				}

				isLocating = false;
			},
			(error) => {
				console.error('Geolocation error:', error);
				isLocating = false;
				alert('Unable to get your location. Please check your browser permissions.');
			}
		);
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

<div class="map-wrapper">
	<div class="map-container">
		<MapLibre
			bind:map
			class="map"
			style={mapStyle}
			center={initialCenter}
			zoom={13}
			onload={handleMapLoad}
			onmoveend={handleMoveEnd}
		>
			<GeoJSONSource data={restaurantFeatures}>
				<CircleLayer
					paint={circlePaint}
					onclick={handleMarkerClick}
					onmouseenter={handleMouseEnter}
					onmouseleave={handleMouseLeave}
				/>
			</GeoJSONSource>

			{#if userLocation}
				<Marker lnglat={userLocation} anchor="bottom">
					<div class="user-location-marker">📍</div>
				</Marker>
			{/if}

			{#if selectedRestaurant && selectedRestaurant.coordinates}
				<Popup
					lnglat={[selectedRestaurant.coordinates.lng, selectedRestaurant.coordinates.lat]}
					open={true}
					onclose={() => selectedRestaurant = null}
				>
					<strong>{selectedRestaurant.name}</strong><br>
					<a href={selectedRestaurant.url} target="_blank" rel="noopener noreferrer">View on Google Maps</a>
				</Popup>
			{/if}
		</MapLibre>
	</div>

	{#if hasGeolocation}
		<div class="location-button-container">
			<button onclick={findMyLocation} disabled={isLocating}>
				{isLocating ? 'Locating...' : 'Find My Location'}
			</button>
		</div>
	{/if}
</div>

<style>
	.map-wrapper {
		width: 100%;
	}

	.map-container {
		width: 100%;
		height: 600px;
		border-radius: var(--pico-border-radius);
		overflow: hidden;
		box-shadow: var(--pico-card-box-shadow);
	}

	@media (max-width: 768px) {
		.map-container {
			height: 400px;
		}
	}

	:global(.map) {
		width: 100%;
		height: 100%;
	}

	.location-button-container {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.location-button-container button {
		padding: 0.5rem 1.5rem;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.location-button-container button:disabled {
		cursor: wait;
		opacity: 0.7;
	}

	:global(.maplibregl-popup-content) {
		padding: 12px;
		border-radius: var(--pico-border-radius);
	}

	:global(.maplibregl-popup-content strong) {
		font-size: 1.1em;
		color: var(--pico-primary);
	}

	.user-location-marker {
		font-size: 32px;
		line-height: 1;
		cursor: pointer;
	}
</style>

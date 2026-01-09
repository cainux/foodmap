<script lang="ts">
	import { MapLibre, Marker, Popup } from 'svelte-maplibre-gl';
	import maplibregl, { type Map, type LngLatLike } from 'maplibre-gl';

	interface Restaurant {
		name: string;
		url: string;
		coordinates: { lat: number; lng: number } | null;
		tags?: string[];
		comment?: string;
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

	// CartoCDN Voyager style
	const mapStyle = {
		version: 8 as const,
		glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
		sources: {
			'carto-tiles': {
				type: 'raster' as const,
				tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
				tileSize: 256,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
			}
		},
		layers: [
			{
				id: 'carto-tiles',
				type: 'raster' as const,
				source: 'carto-tiles',
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

		// Set maximum zoom to match restaurant navigation zoom level
		mapInstance.setMaxZoom(16);

		console.log('Adding restaurants source with', restaurantFeatures.features.length, 'features');
		console.log('Sample feature:', restaurantFeatures.features[0]);

		// Add the restaurants source with clustering
		mapInstance.addSource('restaurants', {
			type: 'geojson',
			data: restaurantFeatures,
			cluster: true,
			clusterMaxZoom: 16,
			clusterRadius: 30
		});

		console.log('Added source, now adding layers...');

		// Add cluster circle layer
		mapInstance.addLayer({
			id: 'clusters',
			type: 'circle',
			source: 'restaurants',
			filter: ['has', 'point_count'],
			paint: {
				'circle-color': '#1095c1',
				'circle-radius': [
					'step',
					['get', 'point_count'],
					20,  // 2 markers
					3,
					25,  // 3-4 markers
					5,
					30,  // 5-9 markers
					10,
					35,  // 10-19 markers
					20,
					40   // 20+ markers
				],
				'circle-stroke-width': 3,
				'circle-stroke-color': '#fff',
				'circle-opacity': 1
			}
		});

		// Add cluster count label layer
		mapInstance.addLayer({
			id: 'cluster-count',
			type: 'symbol',
			source: 'restaurants',
			filter: ['has', 'point_count'],
			layout: {
				'text-field': '{point_count_abbreviated}',
				'text-font': ['Noto Sans Regular'],
				'text-size': 18
			},
			paint: {
				'text-color': '#ffffff'
			}
		});

		// Add unclustered point layer
		mapInstance.addLayer({
			id: 'unclustered-point',
			type: 'circle',
			source: 'restaurants',
			filter: ['!', ['has', 'point_count']],
			paint: {
				'circle-radius': 8,
				'circle-color': '#1095c1',
				'circle-stroke-width': 2,
				'circle-stroke-color': '#fff',
				'circle-opacity': 1
			}
		});

		// Add click handler for clusters
		mapInstance.on('click', 'clusters', async (e) => {
			if (!e.features || e.features.length === 0) return;
			const feature = e.features[0];
			const clusterId = feature.properties.cluster_id;
			const source = mapInstance.getSource('restaurants') as maplibregl.GeoJSONSource;

			try {
				const zoom = await source.getClusterExpansionZoom(clusterId);
				if (feature.geometry.type === 'Point') {
					mapInstance.easeTo({
						center: feature.geometry.coordinates as [number, number],
						zoom: zoom
					});
				}
			} catch (err) {
				console.error('Error getting cluster expansion zoom:', err);
			}
		});

		// Add click handler for unclustered points
		mapInstance.on('click', 'unclustered-point', (e) => {
			if (!e.features || e.features.length === 0) return;
			const feature = e.features[0];
			const { name, url } = feature.properties as { name: string; url: string };
			const restaurant = restaurants.find(r => r.name === name && r.url === url);
			if (restaurant) {
				selectedRestaurant = restaurant;
			}
		});

		// Add cursor pointer on hover
		mapInstance.on('mouseenter', 'clusters', () => {
			mapInstance.getCanvas().style.cursor = 'pointer';
		});
		mapInstance.on('mouseleave', 'clusters', () => {
			mapInstance.getCanvas().style.cursor = '';
		});
		mapInstance.on('mouseenter', 'unclustered-point', () => {
			mapInstance.getCanvas().style.cursor = 'pointer';
		});
		mapInstance.on('mouseleave', 'unclustered-point', () => {
			mapInstance.getCanvas().style.cursor = '';
		});

		console.log('All layers added successfully');
		console.log('Map layers:', mapInstance.getStyle().layers.map((l: any) => l.id));

		// Fit bounds to show all markers
		if (validRestaurants.length > 0) {
			const bounds = validRestaurants.reduce((bounds, restaurant) => {
				return bounds.extend([restaurant.coordinates!.lng, restaurant.coordinates!.lat]);
			}, new maplibregl.LngLatBounds(
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
					const bounds = new maplibregl.LngLatBounds(
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
			maxZoom={16}
			onload={handleMapLoad}
			onmoveend={handleMoveEnd}
		>
			{#if userLocation}
				<Marker lnglat={userLocation} />
			{/if}

			{#if selectedRestaurant && selectedRestaurant.coordinates}
				<Popup
					lnglat={[selectedRestaurant.coordinates.lng, selectedRestaurant.coordinates.lat]}
					open={true}
					closeButton={false}
					onclose={() => selectedRestaurant = null}
				>
					<strong>{selectedRestaurant.name}</strong><br>
					{#if selectedRestaurant.tags && selectedRestaurant.tags.length > 0}
						<div class="tags">
							{#each selectedRestaurant.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					{/if}
					{#if selectedRestaurant.comment}
						<p class="comment">{selectedRestaurant.comment}</p>
					{/if}
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
		font-size: 1.3em;
		color: var(--pico-primary);
	}

	:global(.maplibregl-popup-content .tags) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin: 0.25rem 0 0.5rem 0;
	}

	:global(.maplibregl-popup-content .tag) {
		display: inline-block;
		padding: 0.05rem 0.3rem;
		font-size: 0.55rem;
		background-color: var(--pico-primary);
		color: white;
		border-radius: 8px;
		border: none;
	}

	:global(.maplibregl-popup-content .comment) {
		margin: 0.5rem 0;
		font-size: 0.75rem;
		font-style: italic;
		color: var(--pico-muted-color);
	}
</style>

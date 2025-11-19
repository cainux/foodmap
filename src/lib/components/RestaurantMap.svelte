<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map, Marker, LngLatBounds, LngLatLike, MapMouseEvent } from 'maplibre-gl';

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

	let mapContainer: HTMLDivElement;
	let map: Map;
	let userMarker: Marker | null = null;
	let hasGeolocation = $state(false);
	let isLocating = $state(false);
	let moveTimeout: ReturnType<typeof setTimeout> | null = null;
	let highlightedRestaurantId: string | null = null;
	let currentPopup: any | null = null; // Track the currently open popup

	onMount(async () => {
		// Dynamically import MapLibre GL to avoid SSR issues
		const maplibregl = await import('maplibre-gl');

		// Check if geolocation is available
		if ('geolocation' in navigator) {
			hasGeolocation = true;
		}

		// Calculate center of all restaurants
		const validRestaurants = restaurants.filter((r) => r.coordinates !== null);
		const avgLat =
			validRestaurants.reduce((sum, r) => sum + r.coordinates!.lat, 0) /
			validRestaurants.length;
		const avgLng =
			validRestaurants.reduce((sum, r) => sum + r.coordinates!.lng, 0) /
			validRestaurants.length;

		// Initialize map with OpenStreetMap style
		map = new maplibregl.Map({
			container: mapContainer,
			style: {
				version: 8,
				sources: {
					'osm-tiles': {
						type: 'raster',
						tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
						tileSize: 256,
						attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					}
				},
				layers: [
					{
						id: 'osm-tiles',
						type: 'raster',
						source: 'osm-tiles',
						minzoom: 0,
						maxzoom: 19
					}
				]
			},
			center: [avgLng, avgLat],
			zoom: 13
		});

		// Wait for map to load before adding markers
		map.on('load', () => {
			// Create GeoJSON feature collection for restaurant markers
			const features = validRestaurants.map((restaurant) => ({
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
			}));

			// Add restaurant markers source
			map.addSource('restaurants', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: features
				}
			});

			// Add circle layer for restaurant markers
			map.addLayer({
				id: 'restaurants-circle',
				type: 'circle',
				source: 'restaurants',
				paint: {
					'circle-radius': 8,
					'circle-color': '#1095c1',
					'circle-stroke-width': 2,
					'circle-stroke-color': '#fff',
					'circle-opacity': 1
				}
			});

			// Add click handler for restaurant markers
			map.on('click', 'restaurants-circle', (e: MapMouseEvent) => {
				if (!e.features || e.features.length === 0) return;

				const feature = e.features[0];
				const coordinates = (feature.geometry as any).coordinates.slice();
				const { name, url } = feature.properties as { name: string; url: string };

				// Close previous popup if it exists
				if (currentPopup) {
					currentPopup.remove();
				}

				// Create and track new popup
				currentPopup = new maplibregl.Popup()
					.setLngLat(coordinates)
					.setHTML(`
						<strong>${name}</strong><br>
						<a href="${url}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
					`)
					.addTo(map);

				// Clear reference when popup is closed manually
				currentPopup.on('close', () => {
					currentPopup = null;
				});
			});

			// Change cursor on hover
			map.on('mouseenter', 'restaurants-circle', () => {
				map.getCanvas().style.cursor = 'pointer';
			});

			map.on('mouseleave', 'restaurants-circle', () => {
				map.getCanvas().style.cursor = '';
			});

			// Fit bounds to show all markers
			if (validRestaurants.length > 0) {
				const bounds = validRestaurants.reduce((bounds, restaurant) => {
					return bounds.extend([restaurant.coordinates!.lng, restaurant.coordinates!.lat]);
				}, new maplibregl.LngLatBounds(
					[validRestaurants[0].coordinates!.lng, validRestaurants[0].coordinates!.lat],
					[validRestaurants[0].coordinates!.lng, validRestaurants[0].coordinates!.lat]
				));

				map.fitBounds(bounds, { padding: 50 });
			}
		});

		// Function to navigate to and highlight a restaurant marker
		async function navigateToRestaurant(coords: { lat: number; lng: number }) {
			const maplibregl = await import('maplibre-gl');
			const id = `${coords.lat},${coords.lng}`;

			// Close previous popup immediately if it exists
			if (currentPopup) {
				currentPopup.remove();
				currentPopup = null;
			}

			// Reset previous highlighted marker
			if (highlightedRestaurantId) {
				// Update the paint properties to reset the previous marker
				map.setPaintProperty('restaurants-circle', 'circle-radius', [
					'case',
					['==', ['get', 'id'], id],
					12,
					8
				]);

				map.setPaintProperty('restaurants-circle', 'circle-color', [
					'case',
					['==', ['get', 'id'], id],
					'#ff6b6b',
					'#1095c1'
				]);

				map.setPaintProperty('restaurants-circle', 'circle-stroke-width', [
					'case',
					['==', ['get', 'id'], id],
					3,
					2
				]);
			} else {
				// First time highlighting, set up the conditional styling
				map.setPaintProperty('restaurants-circle', 'circle-radius', [
					'case',
					['==', ['get', 'id'], id],
					12,
					8
				]);

				map.setPaintProperty('restaurants-circle', 'circle-color', [
					'case',
					['==', ['get', 'id'], id],
					'#ff6b6b',
					'#1095c1'
				]);

				map.setPaintProperty('restaurants-circle', 'circle-stroke-width', [
					'case',
					['==', ['get', 'id'], id],
					3,
					2
				]);
			}

			highlightedRestaurantId = id;

			// Fly to the marker location with smooth animation
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
					// Create and track new popup
					currentPopup = new maplibregl.Popup()
						.setLngLat([coords.lng, coords.lat])
						.setHTML(`
							<strong>${restaurant.name}</strong><br>
							<a href="${restaurant.url}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
						`)
						.addTo(map);

					// Clear reference when popup is closed manually
					currentPopup.on('close', () => {
						currentPopup = null;
					});
				}, 1300);
			}
		}

		// Expose navigation function to parent component
		if (onMapReady) {
			onMapReady(navigateToRestaurant);
		}

		// Add moveend listener to update sorting when map is moved
		map.on('moveend', () => {
			// Clear existing timeout
			if (moveTimeout) {
				clearTimeout(moveTimeout);
			}

			// Set new timeout to update sorting 500ms after movement stops
			moveTimeout = setTimeout(() => {
				const center = map.getCenter();
				onLocationUpdate({ lat: center.lat, lng: center.lng });
			}, 500);
		});

		// Cleanup on unmount
		return () => {
			if (map) {
				map.remove();
			}
		};
	});

	async function findMyLocation() {
		if (!navigator.geolocation) return;

		isLocating = true;

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;

				// Import MapLibre GL again
				const maplibregl = await import('maplibre-gl');

				// Remove existing user marker if any
				if (userMarker) {
					userMarker.remove();
				}

				// Create custom marker element for user location
				const el = document.createElement('div');
				el.className = 'user-location-marker';

				// Add user location marker with anchor at the pin point
				userMarker = new maplibregl.Marker({
					element: el,
					anchor: 'bottom'
				})
					.setLngLat([longitude, latitude])
					.setPopup(new maplibregl.Popup().setHTML('<strong>You are here</strong>'))
					.addTo(map);

				// Move map to user location and zoom to show ~10 minute walk area
				map.flyTo({
					center: [longitude, latitude],
					zoom: 15,
					duration: 1200
				});

				// Notify parent component
				onLocationUpdate({ lat: latitude, lng: longitude });

				isLocating = false;
			},
			(error) => {
				console.error('Geolocation error:', error);
				isLocating = false;
				alert('Unable to get your location. Please check your browser permissions.');
			}
		);
	}
</script>

<div class="map-wrapper">
	<div class="map-container">
		<div bind:this={mapContainer} class="map"></div>
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

	.map {
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

	:global(.user-location-marker) {
		width: 28px;
		height: 40px;
		position: relative;
	}

	/* Google Maps style pin */
	:global(.user-location-marker::before) {
		content: '';
		width: 28px;
		height: 28px;
		background-color: #ea4335;
		position: absolute;
		top: 0;
		left: 0;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
	}

	/* White center dot */
	:global(.user-location-marker::after) {
		content: '';
		position: absolute;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background-color: #fff;
		top: 5px;
		left: 7px;
		z-index: 2;
	}
</style>

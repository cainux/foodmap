<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map, Marker, CircleMarker } from 'leaflet';

	interface Restaurant {
		name: string;
		url: string;
		coordinates: { lat: number; lng: number } | null;
	}

	let { restaurants, onLocationUpdate }: {
		restaurants: Restaurant[];
		onLocationUpdate: (location: { lat: number; lng: number }) => void;
	} = $props();

	let mapContainer: HTMLDivElement;
	let map: Map;
	let markers: (Marker | CircleMarker)[] = [];
	let userMarker: CircleMarker | null = null;
	let hasGeolocation = $state(false);
	let isLocating = $state(false);
	let moveTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(async () => {
		// Dynamically import Leaflet to avoid SSR issues
		const L = await import('leaflet');

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

		// Initialize map
		map = L.map(mapContainer, { zoomControl: false }).setView([avgLat, avgLng], 13);

		// Add OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		// Add circle markers for each restaurant
		validRestaurants.forEach((restaurant) => {
			const marker = L.circleMarker([restaurant.coordinates!.lat, restaurant.coordinates!.lng], {
				radius: 8,
				fillColor: '#ff6b6b',
				color: '#fff',
				weight: 2,
				opacity: 1,
				fillOpacity: 0.8
			}).addTo(map);

			// Add popup with restaurant name and link
			marker.bindPopup(`
				<strong>${restaurant.name}</strong><br>
				<a href="${restaurant.url}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
			`);

			markers.push(marker);
		});

		// Fit bounds to show all markers
		if (validRestaurants.length > 0) {
			const group = L.featureGroup(markers);
			map.fitBounds(group.getBounds().pad(0.1));
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
	});

	async function findMyLocation() {
		if (!navigator.geolocation) return;

		isLocating = true;

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;

				// Import Leaflet again in case it's needed
				const L = await import('leaflet');

				// Remove existing user marker if any
				if (userMarker) {
					userMarker.remove();
				}

				// Add user location marker
				userMarker = L.circleMarker([latitude, longitude], {
					radius: 10,
					fillColor: '#4285f4',
					color: '#fff',
					weight: 3,
					opacity: 1,
					fillOpacity: 0.9
				}).addTo(map);

				userMarker.bindPopup('<strong>You are here</strong>');

				// Move map to user location and zoom to show ~10 minute walk area
				// 10 minute walk is roughly 800m, which corresponds to zoom level ~15
				map.setView([latitude, longitude], 15);

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

	:global(.leaflet-popup-content) {
		margin: 8px;
	}

	:global(.leaflet-popup-content strong) {
		font-size: 1.1em;
		color: var(--pico-primary);
	}
</style>

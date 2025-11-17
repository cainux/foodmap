<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map, Marker } from 'leaflet';

	interface Restaurant {
		name: string;
		url: string;
		coordinates: { lat: number; lng: number } | null;
	}

	let { restaurants }: { restaurants: Restaurant[] } = $props();

	let mapContainer: HTMLDivElement;
	let map: Map;
	let markers: Marker[] = [];

	onMount(async () => {
		// Dynamically import Leaflet to avoid SSR issues
		const L = await import('leaflet');

		// Fix for default marker icon in Leaflet with bundlers
		// @ts-ignore
		delete L.Icon.Default.prototype._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
		});

		// Calculate center of all restaurants
		const validRestaurants = restaurants.filter((r) => r.coordinates !== null);
		const avgLat =
			validRestaurants.reduce((sum, r) => sum + r.coordinates!.lat, 0) /
			validRestaurants.length;
		const avgLng =
			validRestaurants.reduce((sum, r) => sum + r.coordinates!.lng, 0) /
			validRestaurants.length;

		// Initialize map
		map = L.map(mapContainer).setView([avgLat, avgLng], 13);

		// Add OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		// Add markers for each restaurant
		validRestaurants.forEach((restaurant) => {
			const marker = L.marker([restaurant.coordinates!.lat, restaurant.coordinates!.lng]).addTo(
				map
			);

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
	});
</script>

<div class="map-container">
	<div bind:this={mapContainer} class="map"></div>
</div>

<style>
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

	:global(.leaflet-popup-content) {
		margin: 8px;
	}

	:global(.leaflet-popup-content strong) {
		font-size: 1.1em;
		color: var(--pico-primary);
	}
</style>

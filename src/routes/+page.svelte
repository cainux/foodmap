<script lang="ts">
	import RestaurantMap from '$lib/components/RestaurantMap.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import restaurantsData from '$lib/restaurants.json';
	import { calculateDistance } from '$lib/geo';

	let sidebarOpen = $state(false);
	let searchQuery = $state('');
	let userLocation = $state<{ lat: number; lng: number } | null>(null);
	let navigateToRestaurant: ((coords: { lat: number; lng: number }) => void) | null = null;

	// Social media preview metadata
	const siteUrl = 'https://food.oha.me';
	const title = 'Food Map';
	const description = 'Where I like to eat';
	const imageUrl = `${siteUrl}/social-preview.png`;

	// Name/tag filter only — feeds the map markers (no sort needed).
	let filtered = $derived.by(() => {
		const list = restaurantsData.filter((r) => r.coordinates);
		const q = searchQuery.trim().toLowerCase();
		if (!q) return list;
		return list.filter(
			(r) =>
				r.name.toLowerCase().includes(q) ||
				(r.tags ?? []).some((t) => t.toLowerCase().includes(q))
		);
	});

	// Filter + distance sort — feeds the sidebar list.
	let displayed = $derived.by(() => {
		if (!userLocation) return filtered;
		const loc = userLocation;
		return [...filtered].sort(
			(a, b) =>
				calculateDistance(loc.lat, loc.lng, a.coordinates!.lat, a.coordinates!.lng) -
				calculateDistance(loc.lat, loc.lng, b.coordinates!.lat, b.coordinates!.lng)
		);
	});

	function handleLocationUpdate(location: { lat: number; lng: number }) {
		userLocation = location;
	}

	function handleMapReady(navFunction: (coords: { lat: number; lng: number }) => void) {
		navigateToRestaurant = navFunction;
	}

	function handleCardClick(coords: { lat: number; lng: number }) {
		navigateToRestaurant?.(coords);

		// Collapse the bottom sheet on mobile so the map is visible.
		if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
			sidebarOpen = false;
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

<div class="app">
	<RestaurantMap
		restaurants={filtered}
		onLocationUpdate={handleLocationUpdate}
		onMapReady={handleMapReady}
		{sidebarOpen}
	/>

	<div class="search-box">
		<button
			class="menu-toggle"
			onclick={() => (sidebarOpen = !sidebarOpen)}
			aria-label={sidebarOpen ? 'Hide restaurant list' : 'Show restaurant list'}
			aria-expanded={sidebarOpen}
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
				<line x1="3" y1="6" x2="21" y2="6" />
				<line x1="3" y1="12" x2="21" y2="12" />
				<line x1="3" y1="18" x2="21" y2="18" />
			</svg>
		</button>
		<input
			type="search"
			placeholder="Search restaurants…"
			bind:value={searchQuery}
			onfocus={() => (sidebarOpen = true)}
			aria-label="Search restaurants"
		/>
	</div>

	<Sidebar
		restaurants={displayed}
		open={sidebarOpen}
		{userLocation}
		onCardClick={handleCardClick}
		onToggle={() => (sidebarOpen = !sidebarOpen)}
	/>
</div>

<style>
	.app {
		position: relative;
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
	}

	.search-box {
		position: absolute;
		z-index: 30;
		top: 1rem;
		left: 1rem;
		width: 320px;
		max-width: calc(100vw - 2rem);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background: var(--pico-card-background-color);
		border-radius: 999px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.menu-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		padding: 0;
		margin: 0;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--pico-color);
		cursor: pointer;
	}

	.menu-toggle:hover {
		background: var(--pico-secondary-background);
	}

	.search-box input[type='search'] {
		flex: 1;
		min-width: 0;
		margin: 0;
		padding: 0.35rem 0.5rem;
		border: none;
		background: transparent;
		box-shadow: none;
		font-size: 0.95rem;
		--pico-form-element-focus-color: transparent;
	}

	.search-box input[type='search']:focus {
		outline: none;
		box-shadow: none;
	}

	@media (max-width: 768px) {
		.search-box {
			left: 50%;
			transform: translateX(-50%);
			width: calc(100vw - 2rem);
		}
	}
</style>

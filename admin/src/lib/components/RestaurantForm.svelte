<script lang="ts">
	import { calculateDistance } from '$lib/geo';
	import type { Restaurant } from '$lib/server/db/queries';

	type Props = {
		restaurant?: Restaurant;
		existing: Restaurant[];
		formError?: string;
	};

	let { restaurant, existing, formError }: Props = $props();

	let name = $state(restaurant?.name ?? '');
	let url = $state(restaurant?.url ?? '');
	let coordinates = $state(restaurant ? `${restaurant.lat},${restaurant.lng}` : '');
	let tags = $state(restaurant?.tags ?? '');
	let comment = $state(restaurant?.comment ?? '');
	let locating = $state(false);
	let locateError = $state('');

	const DUPLICATE_RADIUS_KM = 0.05; // 50m

	let parsedCoords = $derived.by(() => {
		const match = coordinates.trim().match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
		if (!match) return null;
		return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
	});

	let duplicates = $derived.by(() => {
		if (!parsedCoords) return [];
		return existing.filter(
			(r) =>
				r.id !== restaurant?.id &&
				r.lat !== null &&
				r.lng !== null &&
				calculateDistance(parsedCoords!.lat, parsedCoords!.lng, r.lat, r.lng) <= DUPLICATE_RADIUS_KM
		);
	});

	function useCurrentLocation() {
		locateError = '';
		locating = true;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				coordinates = `${pos.coords.latitude.toFixed(15)},${pos.coords.longitude.toFixed(15)}`;
				locating = false;
			},
			(err) => {
				locateError = err.message || 'Could not get your location';
				locating = false;
			},
			{ enableHighAccuracy: true }
		);
	}
</script>

<form method="POST" action={restaurant ? '?/update' : '?/create'}>
	<label>
		Name
		<input name="name" type="text" bind:value={name} required />
	</label>

	<label>
		URL
		<input name="url" type="url" bind:value={url} required />
	</label>

	<label>
		Coordinates (lat,lng)
		<input name="coordinates" type="text" bind:value={coordinates} placeholder="51.5163842,-0.0693367" />
	</label>
	<button type="button" onclick={useCurrentLocation} disabled={locating}>
		{locating ? 'Locating…' : 'Use current location'}
	</button>
	{#if locateError}
		<p role="alert">{locateError}</p>
	{/if}

	{#if duplicates.length > 0}
		<p role="alert">
			Possible duplicate nearby: {duplicates.map((d) => d.name).join(', ')}
		</p>
	{/if}

	<label>
		Tags (space-separated)
		<input name="tags" type="text" bind:value={tags} />
	</label>

	<label>
		Comment
		<textarea name="comment" bind:value={comment}></textarea>
	</label>

	{#if formError}
		<p role="alert">{formError}</p>
	{/if}

	<button type="submit">{restaurant ? 'Save changes' : 'Add restaurant'}</button>
</form>

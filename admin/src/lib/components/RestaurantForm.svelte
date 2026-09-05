<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { calculateDistance, coordinateError, parseCoordinates } from '$lib/geo';
	import type { Restaurant } from '$lib/server/db/queries';
	import type { RestaurantFormValues, RestaurantInputField } from '$lib/server/restaurantInput';

	type Props = {
		restaurant?: Restaurant;
		existing: Restaurant[];
		knownTags: string[];
		formError?: string;
		invalidField?: RestaurantInputField;
		submitted?: RestaurantFormValues;
		submitLabel: string;
	};

	let {
		restaurant,
		existing,
		knownTags,
		formError,
		invalidField,
		submitted,
		submitLabel
	}: Props = $props();

	// Captured once: the form owns its values from here on. A parent that needs a
	// fresh form re-mounts this component rather than pushing new props in.
	const start = untrack(
		() =>
			submitted ?? {
				name: restaurant?.name ?? '',
				url: restaurant?.url ?? '',
				coordinates: restaurant ? `${restaurant.lat},${restaurant.lng}` : '',
				tags: restaurant?.tags ?? '',
				comment: restaurant?.comment ?? ''
			}
	);
	const editingId = untrack(() => restaurant?.id);

	let name = $state(start.name);
	let url = $state(start.url);
	let coordinates = $state(start.coordinates);
	let tags = $state(start.tags);
	let comment = $state(start.comment);

	let submitting = $state(false);
	let locating = $state(false);
	let locateError = $state('');
	let coordinatesTouched = $state(untrack(() => invalidField === 'coordinates'));

	const DUPLICATE_RADIUS_KM = 0.05; // 50m

	let parsed = $derived(parseCoordinates(coordinates));
	let coordinatesMessage = $derived(parsed.ok ? '' : coordinateError(parsed.reason));
	let showCoordinatesError = $derived(coordinatesTouched && !parsed.ok);

	let duplicates = $derived.by(() => {
		if (!parsed.ok) return [];
		const { lat, lng } = parsed.value;
		return existing.filter(
			(r) =>
				r.id !== editingId &&
				r.lat !== null &&
				r.lng !== null &&
				calculateDistance(lat, lng, r.lat, r.lng) <= DUPLICATE_RADIUS_KM
		);
	});

	// A datalist matches against the whole input value, so each suggestion carries
	// the tags already typed and appends one that is not yet present.
	let tagSuggestions = $derived.by(() => {
		const prefix = tags.replace(/\S*$/, '');
		const chosen = new Set(tags.split(/\s+/).filter(Boolean));
		return knownTags.filter((tag) => !chosen.has(tag)).map((tag) => `${prefix}${tag} `);
	});

	const submit: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	};

	function onsubmit(event: SubmitEvent) {
		if (parsed.ok) return;
		// Block the submission the server would reject anyway, and say why.
		coordinatesTouched = true;
		event.preventDefault();
	}

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

<form
	method="POST"
	action={restaurant ? '?/update' : '?/create'}
	use:enhance={submit}
	{onsubmit}
>
	<label>
		Name
		<input
			name="name"
			type="text"
			bind:value={name}
			required
			aria-invalid={invalidField === 'name' ? 'true' : undefined}
		/>
	</label>

	<label>
		URL
		<input
			name="url"
			type="url"
			bind:value={url}
			required
			aria-invalid={invalidField === 'url' ? 'true' : undefined}
		/>
	</label>

	<label>
		Coordinates (lat,lng)
		<input
			name="coordinates"
			type="text"
			bind:value={coordinates}
			onblur={() => (coordinatesTouched = true)}
			placeholder="51.5163842,-0.0693367"
			required
			aria-invalid={showCoordinatesError ? 'true' : undefined}
			aria-describedby="coordinates-help"
		/>
	</label>
	{#if showCoordinatesError}
		<p id="coordinates-help" class="field-message error" role="alert">{coordinatesMessage}</p>
	{:else if duplicates.length > 0}
		<p id="coordinates-help" class="field-message">
			<small>Possible duplicate nearby: {duplicates.map((d) => d.name).join(', ')}</small>
		</p>
	{/if}

	<button
		type="button"
		class="secondary outline locate"
		onclick={useCurrentLocation}
		disabled={locating || submitting}
	>
		{locating ? 'Locating…' : 'Use current location'}
	</button>
	{#if locateError}
		<p role="alert" class="error">{locateError}</p>
	{/if}

	<label>
		Tags (space-separated)
		<input name="tags" type="text" bind:value={tags} list="known-tags" autocomplete="off" />
	</label>
	<datalist id="known-tags">
		{#each tagSuggestions as suggestion (suggestion)}
			<option value={suggestion}></option>
		{/each}
	</datalist>

	<label>
		Comment
		<textarea name="comment" bind:value={comment}></textarea>
	</label>

	{#if formError}
		<p role="alert" class="error">{formError}</p>
	{/if}

	<button type="submit" disabled={submitting} aria-busy={submitting}>
		{submitting ? 'Saving…' : submitLabel}
	</button>
</form>

<style>
	.field-message {
		margin-top: calc(var(--pico-spacing) * -0.75);
		margin-bottom: var(--pico-spacing);
	}

	.locate {
		width: auto;
	}
</style>

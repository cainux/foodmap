import { coordinateError, parseCoordinates } from '$lib/geo';
import type { NewRestaurant } from './db/queries';

/** The raw form values, echoed back on failure so nothing typed is lost. */
export type RestaurantFormValues = {
	name: string;
	url: string;
	coordinates: string;
	tags: string;
	comment: string;
};

export type RestaurantInputField = 'name' | 'url' | 'coordinates';

export type RestaurantInput =
	| { ok: true; record: Omit<NewRestaurant, 'id'>; values: RestaurantFormValues }
	| {
			ok: false;
			field: RestaurantInputField;
			formError: string;
			values: RestaurantFormValues;
	  };

/**
 * Reads and validates a restaurant submission. Name, URL and coordinates are all
 * required, and coordinates must parse — a record with no coordinates is dropped
 * by the public site's build, so accepting one loses the restaurant silently.
 */
export function readRestaurantInput(data: FormData): RestaurantInput {
	const values: RestaurantFormValues = {
		name: String(data.get('name') ?? '').trim(),
		url: String(data.get('url') ?? '').trim(),
		coordinates: String(data.get('coordinates') ?? '').trim(),
		tags: String(data.get('tags') ?? '').trim(),
		comment: String(data.get('comment') ?? '').trim()
	};

	if (!values.name) {
		return { ok: false, field: 'name', formError: 'Name is required', values };
	}
	if (!values.url) {
		return { ok: false, field: 'url', formError: 'URL is required', values };
	}

	const coordinates = parseCoordinates(values.coordinates);
	if (!coordinates.ok) {
		return {
			ok: false,
			field: 'coordinates',
			formError: coordinateError(coordinates.reason),
			values
		};
	}

	return {
		ok: true,
		values,
		record: {
			name: values.name,
			url: values.url,
			lat: coordinates.value.lat,
			lng: coordinates.value.lng,
			tags: values.tags,
			comment: values.comment || null
		}
	};
}

/** The distinct tags already in use, for offering an established vocabulary. */
export function collectTags(restaurants: { tags: string }[]): string[] {
	const seen = new Set<string>();
	for (const restaurant of restaurants) {
		for (const tag of restaurant.tags.split(/\s+/)) {
			if (tag) seen.add(tag);
		}
	}
	return [...seen].sort();
}

/**
 * Haversine formula to calculate distance between two points in km
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export type Coordinates = { lat: number; lng: number };

export type ParsedCoordinates =
	| { ok: true; value: Coordinates }
	| { ok: false; reason: 'empty' | 'malformed' | 'out-of-range' };

const COORDINATE_PATTERN = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;

/**
 * Parses a `lat,lng` pair. The single home for coordinate parsing — callers must
 * not re-inline the pattern, so client and server agree by construction.
 *
 * Returns an explicit failure rather than a null pair: a parse failure and
 * absent data are different things, and storing the latter for the former
 * silently drops the restaurant from the public map.
 */
export function parseCoordinates(input: string): ParsedCoordinates {
	const trimmed = input.trim();
	if (!trimmed) return { ok: false, reason: 'empty' };

	const match = trimmed.match(COORDINATE_PATTERN);
	if (!match) return { ok: false, reason: 'malformed' };

	const lat = parseFloat(match[1]);
	const lng = parseFloat(match[2]);
	if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
		return { ok: false, reason: 'out-of-range' };
	}

	return { ok: true, value: { lat, lng } };
}

export type CoordinateFailure = Extract<ParsedCoordinates, { ok: false }>['reason'];

/** The message shown against the coordinate field for each parse failure. */
export function coordinateError(reason: CoordinateFailure): string {
	switch (reason) {
		case 'empty':
			return 'Coordinates are required';
		case 'out-of-range':
			return 'Latitude must be between -90 and 90, longitude between -180 and 180';
		default:
			return 'Enter coordinates as latitude,longitude — for example 51.5163842,-0.0693367';
	}
}

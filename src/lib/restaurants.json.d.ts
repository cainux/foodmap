interface Restaurant {
	name: string;
	url: string;
	coordinates: { lat: number; lng: number } | null;
}

declare const restaurants: Restaurant[];
export default restaurants;

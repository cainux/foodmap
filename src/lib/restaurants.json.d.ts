interface Restaurant {
	name: string;
	url: string;
	coordinates: { lat: number; lng: number } | null;
	tags?: string[];
	comment?: string;
}

declare const restaurants: Restaurant[];
export default restaurants;

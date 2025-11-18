// Restaurant Coordinate Extractor
// Copy and paste this entire script into your browser console (F12 -> Console tab)
// Run on any webpage - it will extract coordinates and output a new restaurants.md format

const restaurants = [
  { name: "Grounded London", url: "https://maps.app.goo.gl/mTG2MTWQWzVsuGE89" },
  { name: "Pizza Union", url: "https://maps.app.goo.gl/E6s3Tma5Y9ii5Wpu5" },
  { name: "Sushinoen (Japanese)", url: "https://maps.app.goo.gl/FoHeA91P96ZncT8XA" },
  { name: "Bari Bari (Korean)", url: "https://maps.app.goo.gl/g9dsuQ2AnZguY1jF7" },
  { name: "Bento Bab (Korean)", url: "https://maps.app.goo.gl/CkZtHM7o1McDu9Fb8" },
  { name: "DanDan (Chinese)", url: "https://maps.app.goo.gl/ZqokZt26F2YC1zD18" },
  { name: "Xi'an Biang Biang (Chinese)", url: "https://maps.app.goo.gl/676otiTF4T3LSsch6" },
  { name: "Yeye's Noodle & Dumpling (Chinese)", url: "https://maps.app.goo.gl/A1LU7Y1vbdDmf1pu6" },
  { name: "Three Uncles (Chinese place that Kev loves)", url: "https://maps.app.goo.gl/S6w85Mfp9AkDRX9n6" },
  { name: "Kova Aldgate", url: "https://maps.app.goo.gl/sCJCw3aEXshmLgQn7" },
  { name: "Mr Wang's Aldgate", url: "https://maps.app.goo.gl/ksTBwqg1pxecBgLs7" },
  { name: "Xi Home Dumpling", url: "https://maps.app.goo.gl/4BpmRFQnWxVT4gdH7" },
  { name: "JWD Lamian", url: "https://maps.app.goo.gl/FQi7Z1HbkiZYRCvY9" },
  { name: "Little Green Vietnamese", url: "https://maps.app.goo.gl/MYYMkUczYDHkzHL16" }
];

async function extractCoordinates(url) {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const finalUrl = response.url;

    console.log('Final URL:', finalUrl);

    // Try different coordinate patterns found in Google Maps URLs
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,  // @lat,lng format
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,  // !3dlat!4dlng format
      /place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/  // place/@lat,lng format
    ];

    for (const pattern of patterns) {
      const match = finalUrl.match(pattern);
      if (match) {
        return { lat: match[1], lng: match[2] };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching:', error);
    return null;
  }
}

async function processAllRestaurants() {
  console.log('🍽️ Starting coordinate extraction...\n');
  const results = [];

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    console.log(`[${i + 1}/${restaurants.length}] Processing: ${restaurant.name}`);

    const coords = await extractCoordinates(restaurant.url);

    if (coords) {
      console.log(`   ✓ Found: ${coords.lat}, ${coords.lng}`);
      results.push({
        name: restaurant.name,
        url: restaurant.url,
        coords: `${coords.lat},${coords.lng}`
      });
    } else {
      console.log(`   ✗ No coordinates found`);
      results.push({
        name: restaurant.name,
        url: restaurant.url,
        coords: null
      });
    }

    // Delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n📄 === NEW restaurants.txt FORMAT ===\n');

  // Output in restaurants.md format
  let output = '';
  results.forEach(r => {
    output += `${r.name}\n`;
    output += `${r.url}\n`;
    if (r.coords) {
      output += `${r.coords}\n`;
    }
    output += `\n`;
  });

  console.log(output);
  console.log('=== END ===\n');
  console.log('✅ Done! Copy the text above and save it to data/restaurants.txt');

  return results;
}

// Run the extraction
console.log('Starting in 2 seconds...');
setTimeout(() => {
  processAllRestaurants();
}, 2000);

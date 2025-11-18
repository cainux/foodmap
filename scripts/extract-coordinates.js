import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse restaurants.txt into structured data
 */
function parseRestaurants(content) {
  const lines = content.split('\n');
  const restaurants = [];
  let i = 0;

  while (i < lines.length) {
    const name = lines[i]?.trim();
    const url = lines[i + 1]?.trim();
    const coords = lines[i + 2]?.trim();

    if (name && url && url.startsWith('http')) {
      restaurants.push({
        name,
        url,
        coordinates: coords && coords.match(/^-?\d+\.\d+,-?\d+\.\d+$/) ? coords : null,
        lineNumber: i
      });
    }

    // Move to next restaurant (skip blank line)
    i += 4;
  }

  return restaurants;
}

/**
 * Validate coordinate precision (must have at least 10 decimal places)
 */
function hasHighPrecision(coordString) {
  const parts = coordString.split(',');
  if (parts.length !== 2) return false;

  for (const part of parts) {
    const decimalPart = part.trim().split('.')[1];
    if (!decimalPart || decimalPart.length < 10) {
      return false;
    }
  }

  return true;
}

/**
 * Extract coordinates from Google Maps URL using browser automation
 */
async function extractCoordinates(url, restaurantName) {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();

  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  const page = await context.newPage();

  try {
    console.log(`  Opening Google Maps...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for the map to load
    console.log(`  Waiting for map to load...`);
    await page.waitForTimeout(2000);

    // Handle EU cookie consent if it appears
    try {
      console.log(`  Checking for cookie consent dialog...`);
      const acceptButton = page.locator('button:has-text("Accept all"), button:has-text("Reject all")').first();
      await acceptButton.waitFor({ timeout: 3000 });

      console.log(`  Cookie consent found, clicking Accept all...`);
      // Try to find specifically "Accept all" button
      const acceptAllButton = page.locator('button:has-text("Accept all")').first();
      await acceptAllButton.click();
      await page.waitForTimeout(1000);
      console.log(`  ✓ Cookie consent accepted`);
    } catch (error) {
      console.log(`  No cookie consent dialog detected`);
    }

    // Manual coordinate extraction via right-click
    console.log(`\n  📍 Please extract coordinates manually:`);
    console.log(`     1. Right-click on the red pin/marker on the map`);
    console.log(`     2. Click on the coordinates in the context menu (first item) to copy them`);
    console.log(`     3. The script will detect the coordinates automatically...`);
    console.log(`\n  NOTE: Coordinates must have 10+ decimal places for precision`);
    console.log(`  Waiting 30 seconds for manual interaction...\n`);

    // Poll clipboard for valid coordinates
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);

      try {
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        const coordinates = clipboardText.replace(/,\s+/, ',').trim();

        if (coordinates.match(/^-?\d+\.\d+,-?\d+\.\d+$/)) {
          if (hasHighPrecision(coordinates)) {
            console.log(`  ✓ Got high-precision coordinates from clipboard: ${coordinates}`);
            await browser.close();
            return coordinates;
          } else {
            console.log(`  ⚠️  Clipboard has low-precision coordinates: ${coordinates} - waiting for high-precision...`);
          }
        }
      } catch {
        // Ignore clipboard read errors
      }
    }

    console.log(`  ✗ Failed to get high-precision coordinates (need 10+ decimal places)`);
    await browser.close();
    throw new Error('Could not extract high-precision coordinates (minimum 10 decimal places required)');
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    await browser.close();
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const dataPath = join(__dirname, '../data/restaurants.txt');
  const content = readFileSync(dataPath, 'utf-8');
  const restaurants = parseRestaurants(content);

  console.log(`Found ${restaurants.length} restaurants\n`);

  const needsCoords = restaurants.filter(r => !r.coordinates);

  if (needsCoords.length === 0) {
    console.log('✅ All restaurants already have coordinates!');
    return;
  }

  console.log(`${needsCoords.length} restaurants need coordinates\n`);

  // Process each restaurant that needs coordinates
  for (const restaurant of needsCoords) {
    console.log(`\n📍 ${restaurant.name}`);
    console.log(`   URL: ${restaurant.url}`);

    try {
      const coords = await extractCoordinates(restaurant.url, restaurant.name);
      restaurant.coordinates = coords;
      console.log(`   ✅ Coordinates: ${coords}`);
    } catch (error) {
      console.error(`   ❌ Failed to extract coordinates: ${error.message}`);
      console.error(`\n⚠️  Stopping script - fix the issue above before continuing`);
      process.exit(1);
    }
  }

  // Rebuild the file content
  const newContent = restaurants.map(r => {
    const parts = [r.name, r.url];
    if (r.coordinates) {
      parts.push(r.coordinates);
    }
    return parts.join('\n');
  }).join('\n\n') + '\n';

  // Write back to file
  writeFileSync(dataPath, newContent);

  const successCount = needsCoords.filter(r => r.coordinates).length;
  console.log(`\n✨ Done! Successfully extracted ${successCount}/${needsCoords.length} coordinates`);
  console.log(`📝 Updated ${dataPath}`);
}

main().catch(console.error);

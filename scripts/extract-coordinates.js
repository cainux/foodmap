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
 * Extract coordinates from Google Maps URL using browser automation
 */
async function extractCoordinates(url, restaurantName) {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions for better visibility
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
    await page.waitForTimeout(3000);

    // Strategy 1: Try to extract from URL (fastest and most reliable)
    const currentUrl = page.url();
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    ];

    for (const pattern of patterns) {
      const match = currentUrl.match(pattern);
      if (match) {
        const coords = `${match[1]},${match[2]}`;
        console.log(`  ✓ Extracted from URL: ${coords}`);
        await browser.close();
        return coords;
      }
    }

    // Strategy 2: Right-click approach
    console.log(`  Attempting to right-click on the map marker...`);
    console.log(`  (You may need to manually right-click on the pin and click the coordinates)`);

    // Wait a bit for any overlays or popups
    await page.waitForTimeout(2000);

    // Try to find the button element that represents the marker
    // Google Maps often has a button element for the place marker
    try {
      // Look for the marker button - it usually has the restaurant name in aria-label
      const markerButton = page.locator('button[aria-label*="' + restaurantName.split('(')[0].trim().substring(0, 10) + '"]').first();
      await markerButton.waitFor({ timeout: 5000 });

      console.log(`  Found marker button, right-clicking...`);
      await markerButton.click({ button: 'right' });
      await page.waitForTimeout(1000);

      // Look for the coordinates in the context menu
      const coordsElement = page.locator('[role="menuitem"]').filter({ hasText: /^-?\d+\.\d+,\s*-?/ }).first();
      await coordsElement.waitFor({ timeout: 3000 });

      console.log(`  Clicking coordinates to copy...`);
      await coordsElement.click();
      await page.waitForTimeout(1000);

      // Read from clipboard
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      const coordinates = clipboardText.replace(/,\s+/, ',').trim();

      if (coordinates.match(/^-?\d+\.\d+,-?\d+\.\d+$/)) {
        console.log(`  ✓ Copied from clipboard: ${coordinates}`);
        await browser.close();
        return coordinates;
      }
    } catch (error) {
      console.log(`  Automated right-click failed: ${error.message}`);
    }

    // Strategy 3: Manual intervention
    console.log(`\n  ⚠️  Automated extraction failed. Please manually:`);
    console.log(`     1. Right-click on the red pin/marker on the map`);
    console.log(`     2. Click on the coordinates in the context menu to copy them`);
    console.log(`     3. Wait for the script to continue...`);
    console.log(`\n  Waiting 30 seconds for manual interaction...\n`);

    // Poll clipboard for valid coordinates
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);

      try {
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        const coordinates = clipboardText.replace(/,\s+/, ',').trim();

        if (coordinates.match(/^-?\d+\.\d+,-?\d+\.\d+$/)) {
          console.log(`  ✓ Got coordinates from clipboard: ${coordinates}`);
          await browser.close();
          return coordinates;
        }
      } catch {
        // Ignore clipboard read errors
      }
    }

    console.log(`  ✗ Timeout - no valid coordinates found`);
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
  }

  await browser.close();
  return null;
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

    const coords = await extractCoordinates(restaurant.url, restaurant.name);

    if (coords) {
      restaurant.coordinates = coords;
      console.log(`   ✅ Coordinates: ${coords}`);
    } else {
      console.log(`   ❌ Could not extract coordinates`);
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

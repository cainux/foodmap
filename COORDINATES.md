# Extracting Coordinates

This document explains how to extract high-precision coordinates for restaurants in the FoodMap project.

## The Automated Script

The project includes a Playwright-based script that opens Google Maps URLs in a browser and helps you extract coordinates with **manual intervention**.

### Prerequisites

1. Playwright must be installed (already done if you ran `pnpm install`)
2. Chromium browser must be available (run `pnpx playwright install chromium` if needed)

### How It Works

The script automates the boring parts:
- Opens each Google Maps URL in a browser window
- Handles cookie consent dialogs automatically
- Monitors your clipboard for coordinates
- Validates precision (requires 10+ decimal places)
- Updates `data/restaurants.txt` automatically

**You handle the important part**: Right-clicking on the pin to extract coordinates.

### Usage

1. **Add restaurants** to `data/restaurants.txt` with just name and URL:
   ```
   New Restaurant Name
   https://maps.app.goo.gl/...

   ```

2. **Run the extraction script**:
   ```bash
   pnpm extract:coords
   ```

3. **For each restaurant**, the script will:
   - Open the Google Maps URL in a browser
   - Wait for you to manually extract coordinates
   - Show these instructions:
     ```
     📍 Please extract coordinates manually:
        1. Right-click on the red pin/marker on the map
        2. Click on the coordinates in the context menu (first item) to copy them
        3. The script will detect the coordinates automatically...
     ```

4. **Right-click on the pin** and click the coordinates to copy them
   - The script automatically detects when you've copied coordinates to the clipboard
   - Validates that coordinates have at least 10 decimal places
   - If precision is too low, it will wait for you to try again

5. **Script continues** to the next restaurant automatically

6. **When done**, `data/restaurants.txt` is updated with all coordinates

### Coordinate Precision

The script requires **high-precision coordinates** (10+ decimal places) to match the existing data quality.

- ✅ **Accepted**: `51.516355592157986,-0.06930076315515116` (15 decimal places)
- ❌ **Rejected**: `51.5163842,-0.0693367` (7 decimal places)

When you right-click on the pin in Google Maps and click the coordinates in the context menu, you automatically get the high-precision version.

### Important Notes

- The browser window stays open during extraction (not headless)
- Each restaurant requires manual intervention (right-click + copy)
- The script **fails fast** if it can't get high-precision coordinates
- Cookie consent is handled automatically
- You have 30 seconds per restaurant to extract coordinates
- The script validates coordinates before accepting them

### Troubleshooting

**"Failed to get high-precision coordinates"**
- Make sure you're right-clicking on the actual pin/marker (not somewhere else on the map)
- Click the coordinates in the context menu (first item) to copy them
- Ensure you're getting 10+ decimal places (Google Maps provides this by default)

**"Clipboard has low-precision coordinates"**
- You may have copied coordinates from the URL instead of the right-click menu
- Right-click directly on the pin and use the context menu

**Script exits with error**
- This is intentional - the script won't write partial/low-quality data
- Fix the issue and run the script again
- It will skip restaurants that already have coordinates

## Alternative: Fully Manual Extraction

If you prefer not to use the script:

1. Open each Google Maps URL from `data/restaurants.txt`
2. Right-click on the pin/marker
3. Click the coordinates in the context menu to copy them
4. Paste as a third line in `data/restaurants.txt` (remove space after comma)
5. Leave a blank line between restaurants

Format:
```
Restaurant Name
https://maps.app.goo.gl/...
51.516355592157986,-0.06930076315515116

Next Restaurant
https://maps.app.goo.gl/...
51.513884434412034,-0.07050150185264993

```

Then run `pnpm parse:restaurants` to generate the JSON file.

## After Extraction

Once you have coordinates in `data/restaurants.txt`:

1. **Parse the data**:
   ```bash
   pnpm parse:restaurants
   ```
   This generates `src/lib/restaurants.json`

2. **Test locally**:
   ```bash
   pnpm dev
   ```
   Open http://localhost:5173 to see the map

3. **Build for production**:
   ```bash
   pnpm build
   ```

The parsing step runs automatically when you use `pnpm dev` or `pnpm build`, so you usually don't need to run it manually.

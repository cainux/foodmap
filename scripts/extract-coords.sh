#!/bin/bash

# This script extracts coordinates from Google Maps shortened URLs
# Output will be saved to restaurants.json

output_file="../src/lib/restaurants.json"

echo '['

first=true

while IFS= read -r name; do
  read -r url
  read -r blank

  if [ -z "$name" ]; then
    continue
  fi

  echo "Processing: $name" >&2

  # Follow redirects and extract coordinates from final URL
  final_url=$(curl -sL -w "%{url_effective}" -o /dev/null "$url" 2>&1 | tail -1)

  echo "  Final URL: $final_url" >&2

  # Extract coordinates using regex
  if [[ $final_url =~ @(-?[0-9]+\.[0-9]+),(-?[0-9]+\.[0-9]+) ]]; then
    lat="${BASH_REMATCH[1]}"
    lng="${BASH_REMATCH[2]}"
    echo "  Found: $lat, $lng" >&2
  elif [[ $final_url =~ !3d(-?[0-9]+\.[0-9]+)!4d(-?[0-9]+\.[0-9]+) ]]; then
    lat="${BASH_REMATCH[1]}"
    lng="${BASH_REMATCH[2]}"
    echo "  Found: $lat, $lng" >&2
  else
    echo "  No coordinates found" >&2
    lat="null"
    lng="null"
  fi

  if [ "$first" = false ]; then
    echo ","
  fi
  first=false

  # Output JSON
  if [ "$lat" = "null" ]; then
    echo "  {\"name\": \"$name\", \"url\": \"$url\", \"coordinates\": null}"
  else
    echo "  {\"name\": \"$name\", \"url\": \"$url\", \"coordinates\": {\"lat\": $lat, \"lng\": $lng}}"
  fi

  sleep 0.5
done < "../data/restaurants.md"

echo ''
echo ']'

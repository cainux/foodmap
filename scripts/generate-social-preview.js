#!/usr/bin/env node
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, '../static/social-preview.svg');
const pngPath = join(__dirname, '../static/social-preview.png');

try {
  const svgBuffer = readFileSync(svgPath);

  await sharp(svgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(pngPath);

  console.log('✅ Social preview PNG generated successfully at static/social-preview.png');
} catch (error) {
  console.error('❌ Error generating social preview:', error.message);
  process.exit(1);
}

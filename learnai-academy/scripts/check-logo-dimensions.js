const fs = require('fs');
const path = require('path');

// Read PNG file to get dimensions from IHDR chunk
function getPNGDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  // IHDR chunk starts at byte 16
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  
  throw new Error('Not a valid PNG file');
}

const logoPath = path.join(__dirname, '../public/logo.png');
const stats = fs.statSync(logoPath);
const dimensions = getPNGDimensions(logoPath);
const aspectRatio = (dimensions.width / dimensions.height).toFixed(2);

console.log('=== Logo Image Investigation ===');
console.log(`File: logo.png`);
console.log(`Size: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`Dimensions: ${dimensions.width} × ${dimensions.height} pixels`);
console.log(`Aspect Ratio: ${aspectRatio}:1 (${dimensions.width / dimensions.height})`);
console.log(`Last Modified: ${stats.mtime}`);
console.log('\n=== Analysis ===');
console.log(`- Width: ${dimensions.width}px`);
console.log(`- Height: ${dimensions.height}px`);
console.log(`- This is a ${dimensions.width > dimensions.height ? 'landscape' : dimensions.width < dimensions.height ? 'portrait' : 'square'} logo`);
console.log(`- File size: ${(stats.size / 1024).toFixed(2)} KB (${stats.size > 500000 ? '⚠️ Large file - consider optimization' : '✓ Good size'})`);


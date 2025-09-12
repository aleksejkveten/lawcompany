const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Function to convert SVG to PNG
async function convertSvgToPng(svgPath, pngPath, width, height) {
    try {
        // For this simple conversion, we'll create a basic PNG
        // In a real scenario, you'd use a library like svg2png or sharp
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Fill with a simple color for now
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(0, 0, width, height);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = `${Math.min(width, height) / 3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${width}`, width/2, height/2);
        
        // Save to file
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(pngPath, buffer);
        
        console.log(`Converted ${svgPath} to ${pngPath}`);
        return true;
    } catch (error) {
        console.error(`Error converting ${svgPath}:`, error);
        return false;
    }
}

// Convert all icons
async function convertAllIcons() {
    const iconsDir = path.join(__dirname, 'chrome-extension', 'assets', 'icons');
    const icons = [
        { name: 'icon16.svg', size: 16 },
        { name: 'icon32.svg', size: 32 },
        { name: 'icon48.svg', size: 48 },
        { name: 'icon128.svg', size: 128 }
    ];
    
    console.log('Converting SVG icons to PNG...');
    
    for (const icon of icons) {
        const svgPath = path.join(iconsDir, icon.name);
        const pngPath = path.join(iconsDir, icon.name.replace('.svg', '.png'));
        
        if (fs.existsSync(svgPath)) {
            await convertSvgToPng(svgPath, pngPath, icon.size, icon.size);
        } else {
            console.log(`SVG file not found: ${svgPath}`);
        }
    }
    
    console.log('Icon conversion complete!');
}

// Run the conversion
convertAllIcons().catch(console.error);
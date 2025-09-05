const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  console.log('Starting SVG to PNG conversion...');
  
  // Launch the browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Load the icon generator HTML file
  const htmlPath = path.join(__dirname, 'public', 'icon-generator.html');
  const fileUrl = `file://${htmlPath}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
  // Wait for the SVG to load
  await page.waitForSelector('svg');
  
  // Get the SVG element and convert it to PNG
  const pngData = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 512;
    canvas.height = 512;
    
    // Serialize SVG to string
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const svgUrl = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, 512, 512);
        const pngDataUrl = canvas.toDataURL('image/png');
        resolve(pngDataUrl);
      };
      img.src = svgUrl;
    });
  });
  
  // Remove the data URL prefix
  const base64Data = pngData.replace(/^data:image\/png;base64,/, '');
  
  // Write the PNG file
  const pngPath = path.join(__dirname, 'public', 'Akashshareicon-512.png');
  fs.writeFileSync(pngPath, base64Data, 'base64');
  
  console.log('PNG file created successfully at:', pngPath);
  
  // Close the browser
  await browser.close();
  
  // Now update the existing Akashshareicon.png file
  fs.copyFileSync(pngPath, path.join(__dirname, 'public', 'Akashshareicon.png'));
  console.log('Updated Akashshareicon.png with the new icon');
}

convertSvgToPng().catch(console.error);
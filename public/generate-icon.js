const fs = require('fs');
const path = require('path');

console.log('🎨 Creating modern Akash Share icon...');

// Since we can't use external libraries for SVG to PNG conversion,
// we'll create a simple HTML file that can be used to generate the PNG

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Icon Generator</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
        }
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        svg {
            border: 1px solid #ddd;
            border-radius: 8px;
            background: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .instructions {
            max-width: 600px;
            text-align: center;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .download-btn {
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        .download-btn:hover {
            background: #5a6fd8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Akash Share Modern Icon</h1>
        
        ${fs.readFileSync(path.join(__dirname, 'Akashshareicon.svg'), 'utf8')}
        
        <div class="instructions">
            <h3>📝 How to Generate PNG:</h3>
            <p><strong>Method 1 - Browser Screenshot:</strong></p>
            <ol>
                <li>Right-click on the icon above</li>
                <li>Select "Save image as..." or "Copy image"</li>
                <li>Save as "Akashshareicon.png" in the public folder</li>
            </ol>
            
            <p><strong>Method 2 - Canvas Download:</strong></p>
            <button class="download-btn" onclick="downloadPNG()">Download as PNG (512x512)</button>
            
            <p><strong>Method 3 - Online Converter:</strong></p>
            <p>Copy the SVG code and use an online SVG to PNG converter like:</p>
            <ul>
                <li>convertio.co</li>
                <li>cloudconvert.com</li>
                <li>online-convert.com</li>
            </ul>
        </div>
    </div>

    <script>
        function downloadPNG() {
            const svg = document.querySelector('svg');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set high resolution
            canvas.width = 512;
            canvas.height = 512;
            
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, 512, 512);
                
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Akashshareicon.png';
                    a.click();
                    URL.revokeObjectURL(url);
                }, 'image/png', 1.0);
                
                URL.revokeObjectURL(svgUrl);
            };
            
            img.src = svgUrl;
        }
    </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'icon-generator.html'), htmlContent);

console.log('✅ Created icon-generator.html');
console.log('🌐 Open icon-generator.html in your browser to download the PNG');
console.log('📁 Save the PNG as "Akashshareicon.png" in the public folder');

console.log('\n🎯 Icon Features:');
console.log('• Modern gradient backgrounds');
console.log('• Professional typography');
console.log('• Animated data flow indicators');
console.log('• Drop shadows and glow effects');
console.log('• High-contrast design');
console.log('• Scalable vector graphics');
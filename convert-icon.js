const fs = require('fs');
const { pngToIco } = require('png-to-ico');

pngToIco('public/Akashshareicon.png')
  .then(buf => {
    fs.writeFileSync('public/icon.ico', buf);
    console.log('Successfully converted PNG to ICO');
  })
  .catch(console.error);
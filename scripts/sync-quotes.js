// scripts/sync-quotes.js

const fs = require('fs');
const path = require('path');

const quotesJsonPath = path.join(__dirname, '..', 'data', 'quotes.json');
const quotesJsPath = path.join(__dirname, '..', 'js', 'quotes.js');

try {
    // Read the JSON file
    const quotesJsonContent = fs.readFileSync(quotesJsonPath, 'utf8');

    // We don't need to parse and re-stringify if we're just wrapping it.
    // This preserves the original formatting of the JSON data.
    const quotesJsContent = `window.quotesData = \n${quotesJsonContent}\n;`;

    // Write the new content to the .js file
    fs.writeFileSync(quotesJsPath, quotesJsContent, 'utf8');

    console.log('✅ Success: js/quotes.js has been updated from data/quotes.json');

} catch (error) {
    console.error('❌ Error synchronizing quote files:', error);
    process.exit(1); // Exit with an error code
}

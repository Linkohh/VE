// scripts/sync-quotes.js

const fs = require('fs');
const path = require('path');

const quotesJsonPath = path.join(__dirname, '..', 'src', 'data', 'quotes.json');
const publicQuotesPath = path.join(__dirname, '..', 'public', 'quotes.json');

try {
    // Read the JSON file
    const quotesJsonContent = fs.readFileSync(quotesJsonPath, 'utf8');

    fs.mkdirSync(path.dirname(publicQuotesPath), { recursive: true });
    fs.writeFileSync(publicQuotesPath, quotesJsonContent, 'utf8');

    console.log('✅ Success: public/quotes.json has been refreshed from src/data/quotes.json');

} catch (error) {
    console.error('❌ Error synchronizing quote files:', error);
    process.exit(1); // Exit with an error code
}

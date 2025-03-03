/* eslint-disable no-console, no-process-exit */
const vinted = require('./websites/vinted');

async function sandbox (website = 'https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739194384&search_text=42181&catalog_ids=&size_ids=&brand_ids=&status_ids=&material_ids=') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const deals = await vinted.scrapeWithCookies(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);

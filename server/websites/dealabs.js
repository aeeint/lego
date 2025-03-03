const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');


/**
 * Parse webpage data response
 * @param  {String} data - HTML response
 * @return {Array} deals
 */
const parse = data => {
  const $ = cheerio.load(data, {'xmlMode': true});

  return $('div.js-threadList article') 
    .map((i, element) => {
      const link = $(element)
        .find('a[data-t="threadLink"]')
        .attr('href');

      const data = JSON.parse($(element)
        .find('div.js-vue2')
        .attr('data-vue2'));

      //console.log(data);

      const thread = data.props.thread|| null;
      const retail = thread.nextBestPrice|| null;
      const price = thread.price|| null;
      const discount = parseInt((1 - price / retail) * 100)|| null;
      const temperature = +thread.temperature|| null;
      const image = 'https://static-pepper.dealabs.com/threads/raw/${thread.mainImage.slotId}/${thread.mainImage.name}/re/300x300/qt/60/${thread.mainImage.name}.${thread.mainImage.ext}';
      const comments = +thread.commentCount|| 0;
      const published = thread.publishedAt|| null;
      const title = thread.title|| null;
      const id = thread.threadId || null; //extractSetId(title);


      return {
        link, 
        retail,
        price,
        discount,
        temperature,
        image,
        comments,
        published,
        title,
        id,
      };
    })
    .get();
};

/**
 * Scrape a given URL page
 * @param {String} url - URL to parse
 * @returns {Promise<Array|null>} Extracted deals
 */
const scrape = async url => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const body = await response.text();
    const newDeals = parse(body) || [];

    let existingDeals = [];

    if (fs.existsSync('DEALS.json')) {
      const fileContent = fs.readFileSync('DEALS.json', 'utf-8');
      try {
        existingDeals = JSON.parse(fileContent);
      } catch (error) {
        console.warn("⚠️ Fichier JSON corrompu, réécriture depuis zéro.");
      }
    }

    const allDeals = [...existingDeals, ...newDeals].reduce((acc, deal) => {
      if (!acc.find(d => d.id === deal.id)) {
        acc.push(deal);
      }
      return acc;
    }, []);

    fs.writeFileSync('DEALS.json', JSON.stringify(allDeals, null, 2), 'utf-8');

  } catch (error) {
    console.error(`❌ Erreur lors du scraping de ${url}: ${error.message}`);
  }
};

module.exports = { scrape };

if (require.main === module) {
  const url = "https://www.dealabs.com/groupe/lego";
  scrape(url);
}
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage data response
 * @param  {String} data - HTML response
 * @return {Array} deals
 */
const parse = data => {
  const $ = cheerio.load(data);
  let deals = [];

  $('div.js-threadList article').each((i, element) => {
    const link = $(element).find('a[data-t="threadLink"]').attr('href');
    const dataVue2 = $(element).find('div.js-vue2').attr('data-vue2');

    if (!dataVue2) return; // Éviter les erreurs si aucune donnée JSON

    const data = JSON.parse(dataVue2);
    const thread = data.props.thread || null;
    if (!thread) return;

    // Vérifier si l'offre est expirée
    if (thread.isExpired === true) {
      console.log(`⏩ Offre expirée ignorée: ${thread.title}`);
      return; // ❌ On passe à l'offre suivante
    }

    const price = thread.price || null;
    const nextBestPrice = thread.nextBestPrice || null; // ✅ Ajout du prix normal (référence)
    const title = thread.title || null;
    const published = thread.publishedAt ? new Date(thread.publishedAt * 1000).toISOString() : null;
    const comments = thread.commentCount || 0;
    const temperature = thread.temperature || null;

    // 🔍 Extraction de l'ID LEGO (5 chiffres dans le titre)
    const idMatch = title.match(/\b\d{5}\b/);
    const id = idMatch ? idMatch[0] : null;

    deals.push({
      link,
      price,
      nextBestPrice, // ✅ Ajout du prix de référence
      title,
      published,
      comments,
      temperature,
      id, // ✅ ID LEGO extrait du titre
    });
  });

  console.log(`📌 ${deals.length} offres valides trouvées sur cette page.`);
  return deals;
};

/**
 * Scrape uniquement la première page
 * @param {String} url - URL de la première page
 * @returns {Promise<void>}
 */
const scrape = async (url) => {
  try {
    console.log(`🕵️‍♂️ Scraping: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const body = await response.text();
    const deals = parse(body);

    // Charger les anciennes données
    let existingDeals = [];
    if (fs.existsSync('DEALS.json')) {
      try {
        existingDeals = JSON.parse(fs.readFileSync('DEALS.json', 'utf-8'));
      } catch (error) {
        console.warn("⚠️ Fichier JSON corrompu, réécriture depuis zéro.");
      }
    }

    // Fusionner les nouvelles et anciennes données sans doublon
    const uniqueDeals = [...existingDeals, ...deals].reduce((acc, deal) => {
      if (!acc.find(d => d.link === deal.link)) {
        acc.push(deal);
      }
      return acc;
    }, []);

    // Enregistrer les résultats
    fs.writeFileSync('DEALS.json', JSON.stringify(uniqueDeals, null, 2), 'utf-8');
    console.log(`✅ ${uniqueDeals.length} offres LEGO sauvegardées dans DEALS.json !`);

  } catch (error) {
    console.error(`❌ Erreur lors du scraping de ${url}: ${error.message}`);
  }
};

// Exécution du scraping (première page uniquement)
if (require.main === module) {
  const url = "https://www.dealabs.com/groupe/lego";
  scrape(url);
}

module.exports = { scrape };

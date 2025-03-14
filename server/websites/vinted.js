const fs = require("fs");
const path = require("path");
const { v5: uuidv5 } = require("uuid");
const fetch = require("node-fetch");

/**
 * Liste des ID LEGO à scraper
 */
const LEGO_IDS = [
  "42171", "31212", "42202", "31213", "72037", "76435", "60453", "72032", "71437",
  "60444", "71438", "42158", "71411", "60445", "76919", "21061", "77071", "77073",
  "75405", "42172", "43272", "76291", "42174", "10338", "42182"
];

/**
 * Lit un fichier JSON
 * @param {String} filename - Nom du fichier JSON
 * @returns {Array} - Contenu du fichier JSON
 */
function readJsonFile(filename) {
  if (!fs.existsSync(filename)) return [];
  try {
    return JSON.parse(fs.readFileSync(filename, "utf-8"));
  } catch (error) {
    console.error(`❌ Erreur de lecture du fichier ${filename} :`, error);
    return [];
  }
}

/**
 * Scrape Vinted pour un ID LEGO donné, avec support de la pagination
 * @param {String} legoId - ID du set LEGO
 */
const scrapeWithCookies = async (legoId) => {
  try {
    console.log(`🔍 Scraping en cours pour LEGO ID: ${legoId}...`);
    let page = 1;
    let allDeals = [];
    let hasNextPage = true;

    while (hasNextPage) {
      const url = `https://www.vinted.fr/api/v2/catalog/items?page=${page}&per_page=96&search_text=${legoId}`;
      console.log(`📄 Scraping page ${page} pour ${legoId}...`);

      const response = await fetch(url, {
        "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "fr",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
    "sec-ch-ua-arch": "\"\"",
    "sec-ch-ua-bitness": "\"64\"",
    "sec-ch-ua-full-version": "\"134.0.6998.89\"",
    "sec-ch-ua-full-version-list": "\"Chromium\";v=\"134.0.6998.89\", \"Not:A-Brand\";v=\"24.0.0.0\", \"Google Chrome\";v=\"134.0.6998.89\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-model": "\"Nexus 5\"",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-ch-ua-platform-version": "\"6.0\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-anon-id": "5a1fd8c7-c590-4fdc-9554-f0dc0e632abe",
    "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
    "x-money-object": "true",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "cookie": "v_udt=ZXRtRTlSeFoxQndxSU1BK3U0NUVYb0tRUGVsMy0tcm1qczNDeDhuWTBxRXNhQy0tKzdJVXY3enhHdGNyWDhERkk1QkdpZz09; anonymous-locale=fr; anon_id=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe; OTAdditionalConsentString=1~; domain_selected=true; OptanonAlertBoxClosed=2025-03-10T17:25:01.254Z; eupubconsent-v2=CQODSZgQODSZgAcABBENBgFgAAAAAAAAAChQAAAAAAFBIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3QB5QD5AH7gQEAgZBBEEEwIMAQrAhcOAYAAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AF0AMQAYsAyEBkwDRgGmgNTAa8A2gBtgDbgHHwOdA58B5QD4gH2wP2A_cCB4EEQIMAQbAhWOglAALgAoACoAHAAQAAugBkAGoAPAAiABMACrAFwAXQAxABvAD0AH6AQwBEgCWAE0AKMAVoAwwBlADRAGyAO8Ae0A-wD9gIoAjABQQCrgFiALmAXkAxQBtADcAHEAOoAh0BF4CRAEyAJ2AUOAo-BTQFNgKsAWKAtgBcAC5AF2gLvAXmAvoBhoDHgGSAMnAZVAywDLgGcgNVAawA28BuoDiwHJgOXAeOA9oB9YEAQIWkACYACAA0ADnALEAj0BNoCkwF5ANTAbYA24Bz4DygHxAP2AgeBBgCDYEKyEBsABYAFAAXABVAC4AGIAN4AegB3gEUAJSAUEAq4BcwDFAG0AOpApoCmwFigLRAXAAuQBk4DOQGqgPHAhaSgRAAIAAWABQADgAPAAiABMACqAFwAMUAhgCJAEcAKMAVoA2QB3gD8AKuAYoA6gCHQEXgJEAUeAsUBbAC8wGTgMsAZyA1gBt4D2gIHkgB4AFwB3AEAAKgAj0BIoCVgE2gKTAYsA3IB5QD9wIIgQYKQNgAFwAUABUADgAIIAZABoADwAIgATAAqgBiAD9AIYAiQBRgCtAGUANEAbIA74B9gH6ARYAjABQQCrgFzALyAYoA2gBuAEOgIvASIAnYBQ4CmwFigLYAXAAuQBdoC8wF9AMNAZIAyeBlgGXAM5gawBrIDbwG6gOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWA.YAAAAAAAAAAA; v_sid=e58595af-1741623473; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxOTUwMDk3LCJzaWQiOiJlNTg1OTVhZi0xNzQxNjIzNDczIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE5NTcyOTcsInB1cnBvc2UiOiJhY2Nlc3MifQ.HmbmLre_dURcie4Z3CCa-sGAuD2_B3GbVRANp9TAO7h6REH_mqdRBUGtWSIwK6515thZj2F8F6k1xv0lykXuHbFxOOEBbsgbDAfHxP-Jweo_FDhIGh7oL5skMMG2mvUoxIJvJpgJnqflaaWgkoP0gce-JJi6LpGsfzIbvN_gP9XyDxVMh5_XDZCaERd36BF7aGNtj1pDFqPcf9HeBU0LdW6Utctr2iSlF-z5h1oP7-cng2iwQdIRRybxuDbJ7l-NZHT2g-IPo0N6hRMfICPv6Sqd2y24J7JZiW8opXu12gdP6t0lqoSV-Apt5ymWpdBUyStMTadkLID-YC3JFmGmkA; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxOTUwMDk3LCJzaWQiOiJlNTg1OTVhZi0xNzQxNjIzNDczIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDI1NTQ4OTcsInB1cnBvc2UiOiJyZWZyZXNoIn0.u4PWae0qu-ee2TsKFiRXBBdnP-RyODDRIrWG0t36bAMJ_IBoePcXHfJJuJAs4SPCQsEaQ0JNeR_kPeUpVpo8_ZrsztjlbWYVioybESwYKc8mSVjYo6V68333rLqSS5zLz6ioTMUZTwmrBYQI40fcjQ3yzMGfjxdjeonO-RtWFoDH1caFN8MCPvkLPu2c9B_fJiwfaTFui4lBFk4kY6umFdxf65u_OWJ1xnSaUX3oCUGGFeIJ-DBQzWGSRC_qP58pcZ7_Ux1VM9a-XB2HYWYsRNrHcP59haLCCSFwiaFjou9EORXNehCaBlQLBk9Hguk9zuDdmecDeO8A7f9J-WtKOQ; viewport_size=594; cf_clearance=HEgOaz3iIUSkMmhZumVBZb8M7u.nQDnkOaCT5g6UOiQ-1741954349-1.2.1.1-Ar7Kf8jYRXMucexd42nv7_d4SB4RDppc_F9j6gf_U7mxyGs07nDGRb7_7Dz_h7KspQG1UXagZBkWpZOdxBmET_o7HkSLhWefxCvYH6pO1qjE.SUC0JX.PiHtpVWXFP.K0IqNaIewRLKYzz35Ky44MWKTqOghaUygoptdey1nZwhQD1lD_LQ4joow7cuUb1VXdj9L5o3mIoXXHZ7Mc5kQlu6QfXmU4gJvIe2iuLYZpOl3XCgb7Fsd1Su8rKtReQOZF8Ydy.p8tv9AGtttlW9_pFyDNr3Pc4yaW7WPT6ifSRf_Rm8SgiBLJPdX8lqjCj1JgX9Ek1e.917XSXCMg5G7KZP0IJisKIYkpKjfoXhzySpMGCcjPUJXgz12MrspKQhaZKq0AGZfqiu0AOaVsElM1xTzbjbVW7CZ0oqEG3nXuW8; datadome=TdYf2ppDXvCrbXqyUr7VSSxaB5vRsTG59D0C211KBwQFziouKwH4GEoEpRRiXPj_C0bzm0BICOu4PkMeQhSdHfC01w4dBdT3PCjEwCEjC3xFgZpqYo_gppQfqvKQyIYj; OptanonConsent=isGpcEnabled=0&datestamp=Fri+Mar+14+2025+13%3A12%3A29+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe&interactionCount=31&hosts=&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&landingPath=NotLandingPage&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3B&AwaitingReconsent=false; __cf_bm=M.QPOMImVBxSAcZYBEPq6c7Ha4GHPUuyiahWgycag.E-1741954374-1.0.1.1-V1VsydWwFhTBKV.cZeeDKflXtyCEFthwGLGdUfqcreNmRQ3Agq.G_EBXsTYWcWiamCw_fizAPvqllYpQpOTi3f5sZNd7FCadoDjjZt91qOfXK3j.XaZdw7MQeCiMb4Vg; _vinted_fr_session=YWtpaWoxY1o1Z0NlRWVSM1Z4REEvcWRaUzFaclBKSXBGT3lPWW12QWlsU3oxbDBMQjQvSVhSR2VDcGdIWjN2VWV2M3krWUJEaDNUK1JpdFBjSG5na1VjcndmWkJDam12akZ0Qlc5cW5ZbVFBWUZ5KzFXTXkvTFl2Y2VUVngvLzFUd254UTIzQWFQR2E1UzA4WSs5ZWdlOU9WclNXN0ZLR2MyeXpEZ2ZRWVVlU3l3UkJKSVNDazRsMklYTHpwSWl3b1lGdC9DaHZMTFl2S1dQWm9NRUMvZWZtRHM1K1F4VGZpRkpHRzNreUwrdmhWcG1EeE5GaXVKeGVqbXNCdEIvVlUzaVlVSklxbms2RG9NYjRVQVY4Vk8yV09aYmVQTm9BZ3lDVEhxWDdCTXUxL0ZvQmRJOVlCQ2NxeU9jQmo5SEd5TDFPdS82Z3Z0NjVMVDNDNnpPZnVkRFhGZHJZUXRuRVd3Y2dhYXBpVXZQWjYzVHhNK2JyV0JyUUVwdFR1eXJsc2EyVk5Cd3Q1c0xUNkFTdFQ4b2p4Y3BSVDJZVlduNXQrbDlEVFhZbkdSeU4wL3RSMHdpc3M1YmxWS0NoOVRVOFM5UUxjNnFqcnRYbGYzSjF2MlMyTmxDRTFSNU5EdU52Tld5cUlDZHErL3pPRitUZ2NoWC90byt3NGlyQzV4VWVocERRQUZvbng1eVZmQ0ZpNVd3OG9Uc2tXUHhWaTRSbFVhRkZzQTdpeFh2c3JhN0IrazNIbFRIR2x1QzVnNjNmSmp0UU5GamFVVjhZSElqK3EyOEVBeUNXazBzSzFQR3Q1TEdWVHNGektkSCtETGQ4ajhVcS9od2RKeVhaUEVSYWc2RzVNeWR4cjJSOFMrbjc5aXBwcEJDeC92OUJCNGdRNXJxQnp1NkhGdXh0TzVueHNndVVLWEJ5L0ZHRUd5c2JBdDloQ3BoWEZxcEVQdlVNYmhHOXQ0VURYNHVFNFVqaVBjanNQWWlYbU5ucGh6OHdiRm1uOHBpNkx6aENSY2tIWGZZNnZybXRSVDBwTXdDOUV3czVoSHB1NW1JQ0tpSkVzem1kVW9wOVZGZWRHZVZYWUhNVE81NEpURmJWeGNXOTJuUzVyTk1KOW03K21ZY1VVZFVtWkc1WEVnekpJV2ZuOGpaQ2hRSXFNb0ZZWEVqTlhVVUtEaGRQQVg5Q2J3VmNVQ04rSktYTW5jcis4YzJQNlZuN3NVTzFvWkJXY0RWeld3a0d4MUp4V3JtNXYvRmNCa0FHeG4wdTlieVhjdDNkamJyN2l0UjBIVHdNTG0zTzNxbzd1a0xFNWNXSU9HRzZ1ZDVVQUlvNDd2UnRYVlhBeEh4OHhqMHlUUmdhMWhsTHJWOWpNNXU2QXVQeDJHazRRZ3FMTmV5VWtSZy9ETjJnTnAxamRJZmFHRVExdHQrc2psQzdVK040TUJyV3Evd0txV2Q3RDFlWEU1SWl5M2ZCUWtnNzdvT1d0Z1kyYkJHUldORWVBSkppbVU2ZTYyaFRWSmY0azNWcUxVQUFNNjFJSzZoNUVFQnZWUy8wYkNtNXgrTVZ4RE5qNnUzaHhDem0wWWlaU3FtOEpOTGhUeVpOeDI2aHJnZFZjZnVwN1pLOW5OZ1I5NFVldWpXZ3l2SlR5Yit0RkpyZVZNVmlrZjY3NXZuYmU1c2RyeTBEc1hFL1Q4d256VHNMNnRmdVZXSm5YcU1ZaTBPa2lCdG5tbjFKajVCTkhkNjVpcmNzb2lBUDNROHZQV09vazJlaW1HdG05SDlFQkE5U1ZFVUc3M3VaUjNMVDgzbDhRYVVmWG1vRjl5QTJRWTZuRy9RanN0TWJDcnREZGRqcm1WTkdzcEdrYno2cTFyRy9yRDVCUi93S1BRZHl2VzZCS1U4c3hrQU5sTzF0L1VMRE00V0JPOGRFT0Z2bkJPcTFxWWtGSVFaRTFwSjNReEs4UWdTeWxTdlp4S3pLQ0VjMjB6SU1VTFJ6SUFRRjJqN3dPMmRLSFNucWlKbHAwaHVLR3k5L3R3Umt5WVBpSG4zVWcvSWpjSFcyKzVMR2c0ZmEveEQvREw1YlpKeDdpNmlGZG1wdE1KWGVZQjlXakQ2R29KSVRUcVpTZWlySlh1QXhWaGdDRkJZczN0NEZXSFJqSUw1bzBEQldlVDJwcFBqQmpMR1BHdy9qNVdxVjBvekMvZEI0dG45d0hpMXkzek8zVXpTUlA0UFlJQUdoRUo1bjF0czgyUFhlRWRzdFhvb1R3R3JkYVZ2SEU3RVpiWmFZamlOVXZlKzJDeHZQcFhQRmdYVVNLSU1xYjBBWnc1ZjFUZGRrSWVZVHJoMUk2V2ZFbGovVDcra1pjNk9zdWJDSyt0T3NqTys3RWVHUUJ4Y0hJckV4aVJhRS0tNlY5ZENWR2VRK0VrVDRTb1dpT0FFQT09--5350e53b59b8400dd3c4c7181690a8adb7fc137f; banners_ui_state=PENDING",
    "Referer" :`https://www.vinted.fr/catalog?search_text=${legoId}`,
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
});

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const body = await response.json();
      const newDeals = parseJSON(body, legoId);

      if (!newDeals.length) {
        console.warn(`⚠️ Aucun deal trouvé pour LEGO ID ${legoId} (page ${page}) !`);
        hasNextPage = false;
      } else {
        allDeals = [...allDeals, ...newDeals];
        page++;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Pause 1s entre les pages
      }
    }

    if (allDeals.length > 0) {
      saveDeals(allDeals);
    }
  } catch (error) {
    console.error(`❌ Erreur lors du scraping de l'ID ${legoId} : ${error.message}`);
  }
};

/**
 * Parse JSON response from Vinted API
 * @param {Object} data - JSON response from Vinted API
 * @param {String} legoId - The LEGO ID being searched
 * @return {Array} - List of sales with extracted info
 */
const parseJSON = (data, legoId) => {
  try {
    return (data.items || [])
      .filter((item) => item.brand_title && item.brand_title.toLowerCase() === "lego") // 🔥 Filtre uniquement LEGO
      .map((item) => ({
        id: legoId,
        link: item.url,
        price: item.total_item_price.amount,
        title: item.title,
        brand: item.brand_title,
        published: item.photo?.high_resolution?.timestamp
          ? new Date(item.photo.high_resolution.timestamp * 1000).toISOString()
          : "Invalid Date",
        uuid: uuidv5(item.url, uuidv5.URL),
      }));
  } catch (error) {
    console.error("❌ Error parsing JSON:", error);
    return [];
  }
};

/**
 * Sauvegarde tous les deals dans un fichier unique "DEALSVinted.json"
 * @param {Array} newDeals - Nouveaux deals à ajouter
 */
const saveDeals = (newDeals) => {
  const filename = path.join(__dirname, "DEALSVinted.json"); // 📂 Sauvegarde dans le même dossier que le script
  let existingDeals = readJsonFile(filename);

  // Ajouter les nouveaux deals sans doublons
  const finalDeals = [...existingDeals, ...newDeals].reduce((acc, deal) => {
    if (!acc.find((d) => d.uuid === deal.uuid)) {
      acc.push(deal);
    }
    return acc;
  }, []);

  // Sauvegarde des résultats
  fs.writeFileSync(filename, JSON.stringify(finalDeals, null, 2), "utf-8");
  console.log(`✅ ${newDeals.length} nouveaux deals ajoutés à ${filename} !`);
};

/**
 * Scrape Vinted pour tous les IDs LEGO listés
 */
const scrapeAllLegoIds = async () => {
  console.log(`📦 Scraping ${LEGO_IDS.length} LEGO IDs sur Vinted...`);

  for (const legoId of LEGO_IDS) {
    await scrapeWithCookies(legoId);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Pause 2s pour éviter d'être bloqué
  }

  console.log("🎉 Scraping terminé !");
};

// Lancer le scraping pour tous les LEGO IDs
if (require.main === module) {
  scrapeAllLegoIds();
}

// Exporter les fonctions pour un usage externe
module.exports = { scrapeWithCookies, scrapeAllLegoIds, LEGO_IDS };

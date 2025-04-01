const fs = require("fs");
const path = require("path");
const { v5: uuidv5 } = require("uuid");
const fetch = require("node-fetch");

/**
 * Liste des ID LEGO à scraper
 */
const LEGO_IDS = [
  "76444", "77073", "77072", "31141", "42154", "10343",
  "77073", "75390", "76446", "31156", "31163", "77071",
  "21273", "60423", "31162", "76315", "43262", "42202",
  "75192", "75358", "31164", "31172", "10330", "43231"
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
    "cookie": "v_udt=ZXRtRTlSeFoxQndxSU1BK3U0NUVYb0tRUGVsMy0tcm1qczNDeDhuWTBxRXNhQy0tKzdJVXY3enhHdGNyWDhERkk1QkdpZz09; anonymous-locale=fr; anon_id=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe; OTAdditionalConsentString=1~; domain_selected=true; OptanonAlertBoxClosed=2025-03-10T17:25:01.254Z; eupubconsent-v2=CQODSZgQODSZgAcABBENBgFgAAAAAAAAAChQAAAAAAFBIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3QB5QD5AH7gQEAgZBBEEEwIMAQrAhcOAYAAIgAcAB4AFwASAA_ADQAOcAdwBAICDgIQAT8AqABegDpAIQAR6AkUBKwCYgEygJtAUgApMBXYC1AF0AMQAYsAyEBkwDRgGmgNTAa8A2gBtgDbgHHwOdA58B5QD4gH2wP2A_cCB4EEQIMAQbAhWOglAALgAoACoAHAAQAAugBkAGoAPAAiABMACrAFwAXQAxABvAD0AH6AQwBEgCWAE0AKMAVoAwwBlADRAGyAO8Ae0A-wD9gIoAjABQQCrgFiALmAXkAxQBtADcAHEAOoAh0BF4CRAEyAJ2AUOAo-BTQFNgKsAWKAtgBcAC5AF2gLvAXmAvoBhoDHgGSAMnAZVAywDLgGcgNVAawA28BuoDiwHJgOXAeOA9oB9YEAQIWkACYACAA0ADnALEAj0BNoCkwF5ANTAbYA24Bz4DygHxAP2AgeBBgCDYEKyEBsABYAFAAXABVAC4AGIAN4AegB3gEUAJSAUEAq4BcwDFAG0AOpApoCmwFigLRAXAAuQBk4DOQGqgPHAhaSgRAAIAAWABQADgAPAAiABMACqAFwAMUAhgCJAEcAKMAVoA2QB3gD8AKuAYoA6gCHQEXgJEAUeAsUBbAC8wGTgMsAZyA1gBt4D2gIHkgB4AFwB3AEAAKgAj0BIoCVgE2gKTAYsA3IB5QD9wIIgQYKQNgAFwAUABUADgAIIAZABoADwAIgATAAqgBiAD9AIYAiQBRgCtAGUANEAbIA74B9gH6ARYAjABQQCrgFzALyAYoA2gBuAEOgIvASIAnYBQ4CmwFigLYAXAAuQBdoC8wF9AMNAZIAyeBlgGXAM5gawBrIDbwG6gOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhWA.YAAAAAAAAAAA; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzNTA3NTgzLCJzaWQiOiI5YzFhYjhjOS0xNzQzMzM1OTQzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM1MTQ3ODMsInB1cnBvc2UiOiJhY2Nlc3MifQ.XXTs5qDCAVhOxk26kbHzbIJVcv90qBtF-4T7BXVLq2JqK2_BkwL0FMjjeKCVkLg8H2HcawpFLASOPCPfiyFa8JJBwBEIrZ0OUM9vjvnDvGwOHZXpkLPzObiKm7dRepqWZtpOJrVVk_RcIHeaKQipHG_13RtAfEhshiZJ3r1EqdCezTu-ynmnzYATQHUHIMA-13dKUzimbpUbwSCZHGIRVkNc2indOh3-4NTn48sZEB3Fy6f9DpNHsITISLLrCZDtuOdNM-riTrOUo0AY1lFCNeFmRlpsslpt9EQzTfD5VJ46eaXjzLYWbWHJ-nSlaIMCzrVIvkYuc_JxPMZePwMkJw; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQzNTA3NTgzLCJzaWQiOiI5YzFhYjhjOS0xNzQzMzM1OTQzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDQxMTIzODMsInB1cnBvc2UiOiJyZWZyZXNoIn0.LFr4PsS9ulU02oGhLLc47Vs_PTfWFalB5rj54rj_U7p1bEa_0IkaZIpBUY7ozkXLkypmOffi0ip4It2ptbS8juyro-_kv4NlrRnQSK6tGacGbFdmNhfzITb-yfyJIZrcmR1K4h-2qdU6LG9ACa4JEy36rhV2qcuSxQedbjwWHs5GSw-ya3pb3mS6rfB7yVgCfm854YhCbSnkHtTT7z-Ngxl4D2u1UaoD_hvwAYTqzC4iAq9h-pGvomVeU_o5YKJEiwaOC8itbi4BW8W95s0xXAbU4ykws7xM9wyFTheNoRT7dH4tzpON3xP-u_TpwN-S1V7KQ1NuMyLlyeRQ8L3jEw; v_sid=9c1ab8c9-1743335943; OptanonConsent=isGpcEnabled=0&datestamp=Tue+Apr+01+2025+13%3A39%3A52+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe&interactionCount=35&hosts=&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&landingPath=NotLandingPage&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3B&AwaitingReconsent=false; datadome=Y27Y0zYJKUxEkhnxNSiaURobZG5NHDwzm7GBZouMKuIbvLLRug9GBpCPorjS~QXYRki7PJk9IVR6EmB9VICxCwzDVQXNeUD5XNVxunea6lS62lv7Y4xj5ZNsFMJx7J7o; viewport_size=594; __cf_bm=o0RY7ueRttFtuVpDSyZYzKi7MEOBpW1zI64gokJx1uQ-1743507914-1.0.1.1-gHzKbQluhdrcmffkUjKgwVyr1hIsDZ3JBGoysQZV4MsOPBqS0bPhekJ2zeswvet3xWwVtDVCeBYBHjVLvV_bTWfvfqNH2r9HIjIEKraY.PYHvMlSAIyvuUqaQb7SpRAi; cf_clearance=VNo80CsgLTf.cUKmb2RYvn0XK812Ag9xuM5rLXmhQU8-1743507916-1.2.1.1-qyO3JxDLhzBbgMEwYtrJ7S7GC0uekyf6ZJLwgjNQSQWn0HoemHz6uvdDru8w2_b22nU3aKD1T9Permd.lLnr3jkA2Oy.ExHuOgTrz2wTjnodTWmgqcryL3rpvRlp0yn2Gtn.bL9en3ghEq2Tpd4IUO9rfRz8rBxqjQpSK5rfgGYfr6COJS0dec610hY_ykYKm8zDTySmVLsRhL5hTWvsd4OobVvHdkMEZH0g6GdNKm7CZoj1CqxfT5TtDnj7jktyXigTC4tXXvoIxHW7ZWZ1b2DTQA2I_vEyniviJq6V76Twlt8KRj2_BKDoii0rLCD3D6ATdiFpX0BjjinxilpqJ.OYgAleBiyr6qYI4l77Y74; _vinted_fr_session=NHdlbGJvYTV5NFk1MHIwY0hGb25iY1BYWFdGYW5FQ050UmJIRldDS3ZkRVRTMzRuM2VxMzBRK1c0SjJDTjZ4Y0JUd29tS0pHQnM4Q2dSYXE1Z2pJeitWTzhmdktuWHMxNHN4ZEIyNHBXMWlEU3JxaGpXc2JxK2xYNzNEd2lGd1ptOENRUXF6b09vQjd6UEhabmFmT1NIcXFXWTJ5blRGS3RzbHI1YWxIV3ByZWxoS2VscWVpMG80dEg5UEdpUkFQREo4eVN5TVJMY0I2aWF2Wm9UejNzOXViK1ByTm1mam1Rd0tyY01NQmFiZDRRdGN6a2VUQ3J1THVycExQV0w0ZWVqcE1oUTViRVMvdEF6UkUrUGlvTDk5OVRoL3RmUHlsZ2c4RzdCTDhmY1pMQVEwWTVONExoMDFqQXdsNS9UeG56cGVWZ3h2YzlVMjJ2Ykg3ZEU2RkVEK09NeHoyTkdwQkJQdUM5cWJvWk1nT1lXby9KTG5zVlcvUHYxZElRVHprYkR5NlhqbjlFR29TRW0ydHI4WHF4TUtXZjA3UXNiOE5VY0p6WlVlaGJVTGtmdC8zaTREVGJHZHZaR3JNQ0tsd3MzL1BSa1FwTktCRFdQY0ZQNmdnTWl6RDVYZWxRTi9MZ3A0RmNpbURpaWhiVFc0UjJVYmFBVjN5T0c1VUJ4TGd2L29YK3k2LzE2MEVMYzRJRmhYeE1uSHRIYTNCdnBqRnY0RHlWTHlJdjdWVkJTb21sbXppTlhQQVdJbWJvK3RDQ2dQODdVb1dKK0FnUEZPZEVtNmx3b2dPUTJqaHVSby9wT1ZXZHFIU21vS1dFa0V6Y0ZMd1FHb1gvbURrYXl5OFp3QnQwT0VjUmFhWWVWekwxRHE5c0lLTFFyS2ZhanFwd21TOWxZckZvQURHV2pIMkdZbG91elRDRis1NkplbytiYjJoTm5zVHlUOTg1ZWxSSFo5WW55UFR1enFyTk9QTUdsd2Y3dkR3cW1YQzJrUUo0cWdtQldvdWZOTTd1OXpGRWZkT3lvUjUzbCtpTWJ6ZGNGUDRsQTZ1Um9rTXVoU2tkT2drRGtDUlBmVjAvOTNQMk0vcFRmekh0T0xjdkpQelE1QmI4RzUzMU9DcDlLclNrYWV6S3Jsd2RsTUZPdm9mK3VxYWptMCtVTFlHNFE0ZTRtQk80V0Q0NmxWUTZsRmg3Y0JHRXhMcjMwODV4M3lVNGh2UFhoVnp0VkZRWlVaV3hMaUtrMU1wYXU0Q1o0N1ZuSGJvUCt4cmxyb2lPQ2xZZlBBQjFjc3F5UEtsVXk5a0ZKTTRLR2pRR0hGd3dsVDBEYit5aEM3bmMvbU0yYTVXaHRKSG9OMHBsVDdaTG05NytQY0c2d3puWXU2QU5rN0xia0ZyMFI0MG5VYUlXeXQ2UFlnZ3RKWEt2WCtuS2JEUVNkSVN6RXB4NnNwOUZ1d2xjZ2pMVWNOd1JseGxLSXZZT1JBczhVTXFHYTM4TTgyNHdFTTNEK0FaM1dMUjJmcG5RYkM0UFI0eGNlbXRmVWtiQi92eFVYU3QvaldYMWNudFdLTnBjVzNFUDc2Qjh5VlBaMXo0cStNcXUweWhHVGUzS1lrclhkV0ptUlRhS2diMGFCNTdPa1pJeUVWa2RhWUJ5OUF5dWtEVkFMeWxtcmxsUGlycXpKZjE5cm5rdVFpYk1hOWRPeko2T3pIUEZtMDBuVEo4dFJhRkt0U21IdXZUem9uc1VNRmZLU1RCb1MwMmd5cmZvSE0wOHM1S2ZlTTlkUmo3ZDZTZW42QmUyRFVNZEc3TUlNbkx6aUQwdUN3M0M3YkNaQm93dmx4eWtnSnJMeWR6d1JJeU8zbUtKWFFQM20vb1M1RHQzYUJDc2JPMkNMenYrenJPSzZCYWpDMGcxdmwxbTAwZUxGNVU0blJ4RmtJbTVVeUdZZE9UaUkzWmpCRnl0a0g0ai9ySlZVOVBpRnlkM2lNcENWZGJ6QU5QTHlEWlhjaU0vaDVqTzdoV1ZRaE5aNVRIVWJKNkNGMnN5cUNnaWNBa0NIV1llQTlRQWxUelptZHQ2MHhNcFJHdVRjVDAzYS94Zm9XbkJhNm9rMm5KVmZGc1RXRjRKZUdoMDhiSUxJWWVqNTZDYmloUVgzaFlKcVY3MTJhU08rYTRUR2xxdFJxY3RSVFpHWGpDQVZpdEVJZ1BNaEhHN0ZkWlJxTGRsZWMxKzhZazVyNHpOYi9DeXZnQ0JIMHVCSmNRTXpYZGd6cXBhVE9tMUhnUHp6KytFQmY2L0Rpc2xoOXJOQkpDTDIralNFSllaZjZNU0pvaDIzTVZyb0I2TTJlWkpnL3BiNjFjR0cxOUlSVXlib0kyTGdLU0hYU3ZibjBOeWtMMnF0MHIwQmlFZmQzcS0tbkRPN1VlTit6ZzVwbXJ1YXpHeWRFZz09--65b0e5766e1007a578767edb175a059c1d1e3398; banners_ui_state=PENDING",
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

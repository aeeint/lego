const fs = require('fs');
const cheerio = require('cheerio');
const { v5: uuidv5 } = require('uuid');

/**
 * Parse webpage HTML response
 * @param {String} data - html response
 * @return {Object} deals
 */
const parseHTML = data => {
  const $ = cheerio.load(data, { 'xmlMode': true });

  return $('div.prods a')
    .map((i, element) => {
      const price = parseFloat($(element).find('span.prodl-prix span').text());
      const discount = Math.abs(parseInt($(element).find('span.prodl-reduc').text()));

      return {
        discount,
        price,
        'title': $(element).attr('title')
      };
    })
    .get();
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns 
 */
const scrape = async url => {
  const response = await fetch(url);

  if (response.ok) {
    const body = await response.text();
    return parseHTML(body);
  }

  console.error(response);
  return null;
};

// New code for scraping with predefined cookies and headers
 const scrapeWithCookies = async searchText => {
   try {
     const response = await fetch("https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1741008833&search_text=42181&catalog_ids=&size_ids=&brand_ids=&status_ids=&color_ids=&material_ids=", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "fr",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-anon-id": "5a1fd8c7-c590-4fdc-9554-f0dc0e632abe",
        "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
        "x-money-object": "true",
        "cookie": "v_udt=ZXRtRTlSeFoxQndxSU1BK3U0NUVYb0tRUGVsMy0tcm1qczNDeDhuWTBxRXNhQy0tKzdJVXY3enhHdGNyWDhERkk1QkdpZz09; anonymous-locale=fr; anon_id=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe; OptanonAlertBoxClosed=2025-01-24T17:37:25.879Z; eupubconsent-v2=CQLu-NgQLu-NgAcABBENBZFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; __cf_bm=uoOoVZ.IgeKzLbSCe2T_h.4qRbO9g.gKWakipjrA9e0-1741008637-1.0.1.1-V0Rg4ciKsi81MjQktKOqRXdNmcOkUVBsv.obZs21sVRGgueHQ5a3_yZWQb3FXfPDk7lRADhfvHFD18aI6zATj00MkQxtC22XfPqMk9h32X3IhZ8DiTK9xmjWE2A79m8V; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxMDA4NjUzLCJzaWQiOiIyOWZmMzA0NC0xNzQxMDA4NjUzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDEwMTU4NTMsInB1cnBvc2UiOiJhY2Nlc3MifQ.MPkR912VKOy5XMDoVHpRZuaYNbVmfbN4Fuvivm1lvv4_RsiQgFO6tno09Vk0ircX9aOAnHssObRcwqDNvsWhKhFPMwJHDaHG34YjO85U9q5BT0i4hjyK-Vht38DBBNJo45g2rCiNW2jxmKcW183sQaljA54s2LYB0hHej-9iAasEI5dHSsqQruPQ_nJUKDZIFAFHSUd4t8CGykH5xOVZQYUkK_NTWSfRagG4uVViXyF-d6Q7xPtdk3-VmWyfsdWlGWeipzu41-4GXg6L6DtWGz660x-BSXb-sDiU8NAG-V1dF2MB2YqyaqUaf85QWao0WliCIjmqdtqGOtlPO5noDg; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxMDA4NjUzLCJzaWQiOiIyOWZmMzA0NC0xNzQxMDA4NjUzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE2MTM0NTMsInB1cnBvc2UiOiJyZWZyZXNoIn0.NQeVPNdUdhjYBlOKoDBdR3sUny1yYtnEbkKYfjZNM98TgrE-4QrwwMupC02-Twxzpjn89KHL25JOhlnt7-cvz59sI0hTyu1plQ-_9NLWpM7plSJiGbZa0I9gatnYELp_lj4FyZsVOsIn2QRrD-Jq2IyLslAGnFUyuQV7WLqCz3UO1jGABoIn5Gu8QYMnP1vtim1-NoIXOVsgBV79LxEaiGMK1cT5kxLEYappjsLLWxjGUYGn-wm2_Pdgk8BIk92vp70HMTkUOJADUMEDQVFHr66_VLnPqNqX4kAgh0tCUooP9rQRC5fdFpfKvpGElZZgNfwzWi9pgmngk5Ulroj6-w; cf_clearance=Ya6cBdbJNaJFcVJQzmC4aOwjNKY3DnbmlVwhjiwt0x8-1741008656-1.2.1.1-LFTBAV2jrK62rdvunBZfHqvhTvm4hI4WX8kbtI6fT1d9AqCMNJxxDrMfsr9HtuhV9MJYfxc..jHS0dcTAw1._EY8uRnox0l5Iin2gGe3p4oDgfnl_m7HtUHatwHZIXzdPF9Az7WbNAJ7uvqHnsU9Z_POQWfKiXGSvmFx.mZrRQNY5cAYO3lqbJYHqpiTEWr0BMv5E27OBPYw2m98KKwv3sfM30O25cR7QmtOFWoFogSqWxAfBJE9253AHe8RuKByWC4Eap5R4WWVUmDucYJv.6WK0m3QCRAWL2AWEJAIqqWE6KvB4q2QL_bstVCWhwYgvpCuonlykDoK32N3J6k6wvDXnjqsj.7ixFVrdyZVv_YFIzGecboV6RE.9fegMvhvgrOsa4HIk_ntNwJ_k.lB_xZ73b7lw.q78z5UGjw3w4I; v_sid=5a55ab51677be4f1e5576a0f9735d469; v_sid=5a55ab51677be4f1e5576a0f9735d469; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+03+2025+14%3A33%3A53+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe&interactionCount=16&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&AwaitingReconsent=false&geolocation=FR%3BIDF; viewport_size=231; _vinted_fr_session=WG5sek1BNnJCRVRxYlFPSExWWDBDQlVFQXdmYmhqWGsxU2swQjdpRzI2L3oxQWZvSkNLZGwxVzNJUk93Smt0aUQrUmhTc0tqTWhTLzNFYkczWk90QTh3TitrYjJockh4VHVBZGpBcFZ1UytIbU1rbFdRRStjUDQ1VEcwMEdkQVMxMUNBTzN4RXgwK2w2R0NzNlhqakZEcDhrYVBvWWJYSU5zaWZDNlpNbnFFK0RtTENiMWRNTThxTzh6RjgrLzdYR05xKzM5WnlsNVlrRURrVHZBa1JDcWRwZkxXc0ZHSlJaZG5PZmFjMWVLaFRvL1l1VkU3QTQvOEEySlBwQ0pKcC0tSFFqZzZQdVBFMy9kSHJIZG9DMkF0UT09--50748f3396129cea6509e62a964599709d378ab6; datadome=bLM5UVdqv41kzuQoaIwapC_eyBb7pKX5dukNaQz8R38y~VYgZEdGeklSI7NNtOjqNA6ESryPUjqBeNHrqz0oWavLviujG8Xr59V5~XqYtObS5CGNPaqETdBEQEb1cbF~; banners_ui_state=PENDING",
        "Referer": "https://www.vinted.fr/catalog?search_text=42181&time=1741008833&page=1",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
       const body = await response.json();
       const newDeals = parseJSON(body);// Adjusted to use JSON parsing function

     if (!newDeals.length) {
      console.warn("⚠️ Aucun deal trouvé !");
      return;
    }

    let existingDeals = [];

    if (fs.existsSync('DEALSVinted.json')) {
      try {
        const fileContent = fs.readFileSync('DEALSVinted.json', 'utf-8');
        existingDeals = JSON.parse(fileContent);
      } catch (error) {
        console.warn("⚠️ Fichier JSON corrompu, réécriture depuis zéro.");
      }
    }

    const allDeals = [...existingDeals, ...newDeals].reduce((acc, deal) => {
      if (!acc.find(d => d.uuid === deal.uuid)) {
        acc.push(deal);
      }
      return acc;
    }, []);

    fs.writeFileSync('DEALSVinted.json', JSON.stringify(allDeals, null, 2), 'utf-8');
    console.log(`✅ ${newDeals.length} nouveaux deals ajoutés ! Total : ${allDeals.length}`);

   } catch (error) {
    console.error(`❌ Erreur lors du scraping : ${error.message}`);
   }
 };
  
  scrapeWithCookies('42181').catch(console.error);

/**
 * Parse JSON response
 * @param {String} data - json response
 * @return {Object} sales
 */
const parseJSON = data => {
  try {
    const { items } = data;
    return items.map(item => {
      const link = item.url;
      const price = item.total_item_price;
      const photo = item;
      const published = photo.high_resolution && photo.high_resolution.timestamp;

      return {
        link,
        'price': price.amount,
        'title': item.title,
        'published': new Date(published * 1000).toUTCString(),
        'uuid': uuidv5(link, uuidv5.URL)
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Exporting the scraping functions
module.exports = { scrapeWithCookies };

if (require.main === module) {
  scrapeWithCookies('42181');
}

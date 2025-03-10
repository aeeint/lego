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
     const response = await fetch("https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1741623480&search_text=lego&catalog_ids=&size_ids=&brand_ids=&status_ids=&color_ids=&material_ids=", {
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
        "cookie": "v_udt=ZXRtRTlSeFoxQndxSU1BK3U0NUVYb0tRUGVsMy0tcm1qczNDeDhuWTBxRXNhQy0tKzdJVXY3enhHdGNyWDhERkk1QkdpZz09; anonymous-locale=fr; anon_id=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe; OptanonAlertBoxClosed=2025-01-24T17:37:25.879Z; eupubconsent-v2=CQLu-NgQLu-NgAcABBENBZFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjIzNDczLCJzaWQiOiJlNTg1OTVhZi0xNzQxNjIzNDczIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE2MzA2NzMsInB1cnBvc2UiOiJhY2Nlc3MifQ.XrgewxFdiKbr2b3IVb9whnQ_2QaC-DYgUHajIhDoH7-WWPMtd3lr7-bGtvMmbjNs4Cvy_Xp3qGD48I5JnMr3pPDEHTIs3B6z74QlStLVxZdvzgStXkIQbkylZshDbQDW4NpKaDv6k5GW1DLmTaygqVLO5jx3mc0fZaWseVOZq_rwPo_k_ru55FuJ4XlMKnN0jnfEnZq5q-BvVusWHijhy7fr1L__RryrzIx2baUn3e1b_hnlnrDy1jHBMhaVMQJTe0Uw7mG2zEgbcTJA35Jo7yZ5hyvrKi6FaLM9orHF4Jy-D5xoR1EypTTVHI22i32kVvggd3yR2VyBQMigiEcCZg; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxNjIzNDczLCJzaWQiOiJlNTg1OTVhZi0xNzQxNjIzNDczIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDIyMjgyNzMsInB1cnBvc2UiOiJyZWZyZXNoIn0.tmUewFr_oCXT85Q--8SIaMcJvox5v1nQtdR-dFl6GbcF_uicp9JEfH7iDgyo0C9jq7PtFY5JgMnysZX2gzL0M4BwHHcjCpRHwzLTK7-IyGE_j4VIVWuVU9r86AGpcGSfS9YFIkM9wGWkaLQ8fYk0sux5ej5VJUAZ9H77_efs5F5VGCSpbDilo73jpNDkN8BvmHjMg5bOwJWWNf68W9tJrynx6qoOYrnhhgR7BiFXTrtpIfM4mMe2yy5VMEaI2M8xXOaSnQu_SlPgIoKjivIlPJOkN_XphrdTOXq0BbGqKsk8J0io-MFx7z9lDWOgIyyt0uOUcQ8GqpIMv1iY6eh2fw; __cf_bm=07SfL9lZRO9IVSOjJ4YRl_JRn5Wa2NKlpZPMc5hnmLs-1741623473-1.0.1.1-T0bXvk.geMlbUHUcT9PSUwBsm2JRYZzvNe4hg8E3sGznUPo8vrZtEpA.FW4_bEc5hu6i9ELgSnoq2g9poHQgqNk0j4NSat7WI27RFR_3i0MgNDFOSuv57.ZHqhAihaBW; cf_clearance=a_Bkz33mUPlJPploUHCIAmiz4ehXeOGn.sKnaLr5B6c-1741623475-1.2.1.1-izuRlRQIO0sPTGmSs0DIzLGTaKOsEdUQ7neoiGjlY_KSOS5MxpH_AZE3WQURc0o1HckCsyXCK_kSIyU9cKh3Js1jv3ZSXtD7ymCYJCasmWp6w.aq.xPonDYr_PeywBJGFtsmws7vq8gpDdKmIGD_dozwBA_GOnm66sQAvXj5_QtnNWu7Mf3dlcMiTzF7XD3PKMZhutXYbysGKTNAxzYVTDC8jJ9JWQeKh5lukM9m3oleyw8hJPsBsyXMZZMAZjiJ7bJNuHNyE33Vx_ild0AUlbpcYSnTjv21HyQgYAEZuwhrn12kMMD1wGKIW1YiX.GgHBN8q5dpzBfMFjEr4K.b7zDlL4eQ9pF8F1GHiq_J9lY; v_sid=d16c2462f8e6345e90f221aed52e3a7b; viewport_size=231; datadome=KfWelNkddNouJaK07nkGI08bPzZ3nksfzkJaTUbNJ3di06emqaC33QwHmSBTQf9TGVBgQipx2Kw4JiiarTNsr_7rz~AIIRoUz4O~wD1k1YsDITdObBrz723biOUToz8D; _vinted_fr_session=Q255Z0tBQWtPNGcvOUoxKzA0am15VUw3ZXYvR09ESWI1RU8yTUhocUJnSnd1ckVvMFdXMFhXUzRsM095SkM4eFJuR0tleFJycmtXVkxKWmZSSGJ5ZGRJclNRckxjQmJmbGhaYjhPQTg3c2VFRmZFdjZZWmZFRWNPclFyVWlJekROZnZBdmNuK1BiS1ZCTHF6WGQva3ZZRUtQc2psMjh5Z2pvTWwxMTRTRUdjMmdtVXBMTkdCWVlMY25WYTdSSnFIVFo2RC9zZHNHRzRFOXVSbHhmVFUySkszYWJCalFDRDFXV0FjMjZjam1QS1FjT0pGNnY2N1FQQUJHQTlTakNyQy0tWDl3bFBYNjdEdzcrK3FkanJhN2laZz09--7c67012faa1e748ceba451a92db22fb18ee3ff83; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+10+2025+17%3A18%3A15+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe&interactionCount=20&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&AwaitingReconsent=false&geolocation=FR%3BIDF; banners_ui_state=PENDING",
        "Referer": "https://www.vinted.fr/catalog?search_text=lego&time=1741623480",
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

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
     const response = await fetch("https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739194384&search_text=42181&catalog_ids=&size_ids=&brand_ids=&status_ids=&material_ids=", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "fr",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-anon-id": "5a1fd8c7-c590-4fdc-9554-f0dc0e632abe",
          "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
          "x-money-object": "true",
          "cookie": "v_udt=ZXRtRTlSeFoxQndxSU1BK3U0NUVYb0tRUGVsMy0tcm1qczNDeDhuWTBxRXNhQy0tKzdJVXY3enhHdGNyWDhERkk1QkdpZz09; anonymous-locale=fr; anon_id=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe; OptanonAlertBoxClosed=2025-01-24T17:37:25.879Z; eupubconsent-v2=CQLu-NgQLu-NgAcABBENBZFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzM5MTk0MDQwLCJzaWQiOiIwZjJjMmRjYi0xNzM5MTk0MDQwIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3MzkyMDEyNDAsInB1cnBvc2UiOiJhY2Nlc3MifQ.I_icA2phuC1_Fk4eQGpqYAz3VPL60XACFeXFGpMDus-Qv4br-BY2P_307EdDNlpF_CvJxoXJDR6RH-1Tl0XWWJXconV5pl9ZENt5azCoufrVogjDMpsx3bA0kVm-5IDHHryUt0PDlCIGYU13oMQwId76KtBTjy8fRM0J67lxjDsyjjwBk8TGE665bGp3rnV-AzjMuYGI5DIljFxC6zHIRu684EOX3V1GoQEF5_va6m_5-WfTa-HXCtH_RejraJaK0nue0pa0-TZzY5uMvD99qFaWZu-MUky46WuFvTE8c0qhCNzHQcoCHBqEjSyZTZ-CnA694F_Uch9UKyJdxMaeFw; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzM5MTk0MDQwLCJzaWQiOiIwZjJjMmRjYi0xNzM5MTk0MDQwIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3Mzk3OTg4NDAsInB1cnBvc2UiOiJyZWZyZXNoIn0.CfIWCcxRm1ohqXDH2viXEymIlGdzobfIGl1L-mCZv_wVOz93APoZg5UH-KmZYJzj6fM7Rqp_lEoycgfv1V_mbkZufV01uQjJv4NzHSIoMdfGpdLBuB8QrxZm14XeSwntOXUCrYshHdBJUMdxQGye4V3PZhE5qILaAU-OAex7WYFl4Ig5TaSdp5a0UAsryrRuV63LdzdcaUT3rH7rpIJGPxiwaljL82VX3trx_ELBQGZE2Rx3uRZtEo2qmdkIgvIO1RUd1GNRH9QbjBrtJ8mmBwNK89TIfl8jdj3v4B3JEVI_cXKQgDvsXQXnJyLtZ2S-eDBJbS4HgUlvzTQYUnBteA; v_sid=3a8f0ba638dfbaa9dfcaa69a92e65f3c; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Feb+10+2025+14%3A33%3A05+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=5a1fd8c7-c590-4fdc-9554-f0dc0e632abe&interactionCount=12&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&AwaitingReconsent=false&geolocation=FR%3BIDF; datadome=ZlkAEYL4uGf9QZxPTo5FRwDRtYhLIRmil3PTAjz3peyZSj0LSXKOQKVD4Pu84AqLreLo~aOQyQLH8nJtAiIRWa~_gVSn1Z3qXdWbX_5KljVLMfb_mBl4XpzzJAXXeoEO; __cf_bm=DSxjxaQGfprHGvWy4APVo_JnFmhS3J6PN40HYltcf_A-1739198185-1.0.1.1-J92yCguEjrcZSfnFx06BlSFLT2hWPMKS7patnoxaequW5ioj1K6671bkIIr7Bs1SYVBPKalniTY72cp98fjZ2euvEY461MbFh.7RQgX56N4; viewport_size=231; cf_clearance=fSJKGjlDaiFmYxnqL.WtlQd0D63PQuPaccbD9OimE_U-1739198189-1.2.1.1-UuW8BFo90ZCDxAsPPzZkVYdZOBhdDE4bzfryOeVtqiJKO3kbf5Gh9RjlR7T9VDnuJej4o9HDDo9jxq9j8FSZVNw.EFJNoLvAiI4ByWT5.Vw_p5BUmL0KIK_vGapauOcRnuwIg4SS3nWK2hJZFku8SClnkx2dlDAOX8QJS4jt3byotVgM9PSHUAwCYTKjNz1FRBlhRGLt5T.x4wwBzrCfq5l2EoMx0btrqV2HczcmGHikHSg6_3382wSErLrzNgUPDM8vK1.TaDmZ7QQ_4P1vH_qkE9dbqFqWZwluF6FiRfU; _vinted_fr_session=OU5iaHczQytnKzB6K0d1NHV6aVZBdE9wTG5YditCVlNaTmcvdGxXQiszaGs3NWVyWkUwN21oN1FBMUdmZHE0VDRlQjNXRVVlY1BVTXQ2YnJRbkRDWDBGaVFnd2ZpVkE0M3gweWpkUDBIY2p5cnVUMllnMXhjVlNrWFlpZ0ZVakwyY1RQWkFGeDB6RUpLVVp3VWx2WHVDVkdKL2xJUnZ3SU5SNFUxd2JRKytPZGdWaHVlVHVvbGpzUVp0U3ErNWljZXd0R1JPam9aTTllNEcxTGpzUldaM0twK1FwOENhZE1aUldwUnBPNlZFQTdzT1F5K3JnN09UbUdOUldPc2d4bC0tbWtRRVROdCtCV1QyUXc2cDB1L29kdz09--da51f13efcf37801fcf32110429fa800f502a4f5; banners_ui_state=PENDING",
          "Referer": "https://www.vinted.fr/catalog?search_text=42181&time=1739194384&page=1",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      });
     if (response.ok) {
       const body = await response.json();
       return parseJSON(body);  // Adjusted to use JSON parsing function
     }
     console.error(response);
     return null;
   } catch (error) {
     console.error(error);
     return null;
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
module.exports = {
//   scrape,
  scrapeWithCookies
};

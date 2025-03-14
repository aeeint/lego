/* eslint-disable no-console, no-process-exit */
const vinted = require('./websites/vinted');

async function scrapeAllLegos() {
  console.log(`📦 Scraping ${vinted.LEGO_IDS.length} LEGO IDs sur Vinted...`);

  for (const legoId of vinted.LEGO_IDS) {
    console.log(`🔍 Scraping en cours pour LEGO ID: ${legoId}...`);
    await vinted.scrapeWithCookies(legoId);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Pause 2s pour éviter d’être bloqué
  }

  console.log("🎉 Scraping terminé !");
  process.exit(0);
}

scrapeAllLegos();

const fs = require('fs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://aeeint:0111Holeinone2003@cluster0.36n1q.mongodb.net/?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'lego';

/**
 * Connexion à MongoDB
 */
async function connectToMongoDB() {
  try {
    console.log("🔄 Connexion à MongoDB...");
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connecté à MongoDB !");
    return client.db(MONGODB_DB_NAME);
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB :", error);
    process.exit(1);
  }
}

/**
 * Lit et parse un fichier JSON
 * @param {String} filename - Nom du fichier JSON
 * @returns {Array} - Données extraites du fichier
 */
function readJsonFile(filename) {
  if (!fs.existsSync(filename)) {
    console.warn(`⚠️ Le fichier ${filename} n'existe pas.`);
    return [];
  }

  try {
    const data = fs.readFileSync(filename, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture de ${filename} :`, error);
    return [];
  }
}

/**
 * Insère les données dans une collection MongoDB
 * @param {String} collectionName - Nom de la collection
 * @param {Array} data - Données à insérer
 */
async function insertData(collectionName, data) {
  if (data.length === 0) {
    console.log(`🔄 Aucun élément à insérer dans "${collectionName}".`);
    return;
  }

  const db = await connectToMongoDB();
  const collection = db.collection(collectionName);

  try {
    const result = await collection.insertMany(data);
    console.log(`✅ ${result.insertedCount} éléments insérés dans "${collectionName}" !`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'insertion dans "${collectionName}" :`, error);
  }
}

/**
 * Insère les deals et les ventes dans MongoDB
 */
async function insertDealsAndSales() {
  const deals = readJsonFile('DEALS.json');
  const sales = readJsonFile('DEALSVinted.json');

  await insertData('deals', deals);
  await insertData('sales', sales);
}

/**
 * Find all best discount deals
 */
async function findBestDiscounts() {
  const db = await connectToMongoDB();
  const collection = db.collection('deals');

  try {
    const bestDiscounts = await collection
      .find()
      .sort({ discount: -1 }) //ascending sort
      .limit(10) // to display the 10 first
      .toArray();

    console.log("Meilleures réductions trouvées :", bestDiscounts);

    return bestDiscounts;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des meilleures réductions :", error);
    return [];
  }
}


// Exécute la fonction si le fichier est lancé directement
if (require.main === module) {
  //insertDealsAndSales();
  findBestDiscounts();
}

module.exports = { insertDealsAndSales };

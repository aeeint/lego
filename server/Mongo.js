const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://<user>:<password>@<cluster-url>?retryWrites=true&writeConcern=majority';
const MONGODB_DB_NAME = 'lego';

const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
const db =  client.db(MONGODB_DB_NAME)

const deals = [];


const collection = db.collection('deals');
const result = collection.insertMany(deals);

console.log(result);
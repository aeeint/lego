const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const deals = require('./DEALS.json');

const sales = require('./DEALSVinted.json');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/deals/search', (req, res) => {
  const { limit = 12, price, date } = req.query;

  let results = [...deals];

  if (price) {
    results = results.filter(d => d.price <= parseFloat(price));
  }

  if (date) {
    const timestamp = new Date(date).getTime() / 1000;
    results = results.filter(d => d.published >= timestamp);
  }

  results = results.sort((a, b) => a.price - b.price).slice(0, limit);

  res.json({
    limit: parseInt(limit),
    total: results.length,
    results
  });
});

app.get('/deals/:id', (req, res) => {
  const deal = deals.find(d => d.id === req.params.id);
  if (!deal) {
    return res.status(404).json({ error: 'Deal non trouvé' });
  }
  res.json(deal);
});


app.get('/sales/search', (req, res) => {
  const { limit = 12, legoSetId } = req.query;

  let results = [...sales];

  if (legoSetId) {
    results = results.filter(s => s.link.includes(legoSetId));
  }

  results = results.sort((a, b) => b.published - a.published).slice(0, limit);

  res.json({
    limit: parseInt(limit),
    total: results.length,
    results
  });
});

module.exports = app;

console.log(`📡 Running on port ${PORT}`);

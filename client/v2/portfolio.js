// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');

  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const template = deals
    .map(deal => {
      // Vérifier si le deal est déjà dans les favoris
      const isFavorite = favorites.some(favorite => favorite.uuid === deal.uuid);
      return `
      <div class="deal" id="${deal.uuid}">
        <span>${deal.id}</span>
        <a href="${deal.link}" target="_blank" rel="noopener noreferrer">${deal.title}</a>
        <span>${deal.price} €</span>
        <span 
          class="favorite-btn" 
          data-id="${deal.uuid}" 
          style="cursor: pointer; color: ${isFavorite ? 'red' : 'black'};"
        >
          ❤
        </span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  const sectionDeals = document.querySelector('#deals');
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);

  const favoriteButtons = div.querySelectorAll('.favorite-btn');
  favoriteButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const dealId = event.target.getAttribute('data-id');
      toggleFavoriteDeal(dealId, deals);
      renderDeals(deals); 
    });
  });
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// Feature 1 - Browse pages
selectPage.addEventListener('change', async (event) => {
  const page = parseInt(event.target.value); // Récupère la page sélectionnée
  const pageSize = parseInt(selectShow.value); // Garde la taille actuelle

  const deals = await fetchDeals(page, pageSize); // Récupère les deals pour cette page

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// Feature 2 - Filter by best discount
const filterDealsByDiscount = (deals) => {
  return deals.filter(deal => {
    return parseFloat(deal.discount) > 50;
  });
};
const filterDiscountBtn = document.getElementById('filter-discount');

filterDiscountBtn.addEventListener('click', () => {
  const filteredDeals = filterDealsByDiscount(currentDeals);
  renderDeals(filteredDeals);
});

//Feature 3 - Filter by most commented
const filterDealsByComments = (deals) => {
  return deals.filter(deal => {
    return deal.comments >= 15;
  });
};
const filterCommentsBtn = document.getElementById('filter-commented');

filterCommentsBtn.addEventListener('click', () => {
  const filteredDeals = filterDealsByComments(currentDeals);
  renderDeals(filteredDeals);
});

//Feature 4 - Filter by hot deals
const filterDealsByHotDeals = (deals) => {
  return deals.filter(deal => {
    return deal.temperature >= 100;
  });
};
const filterHotDealsBtn = document.getElementById('filter-hot-deals');

filterHotDealsBtn.addEventListener('click', () => {
  const filteredDeals = filterDealsByHotDeals(currentDeals);
  renderDeals(filteredDeals);
});

// Feature 5 - Sort by price
const sortByPriceAscending = (deals) => {
  return deals.sort((a, b) => {
    return parseFloat(a.price) - parseFloat(b.price);
  });
};

const sortByPriceDescending = (deals) => {
  return deals.sort((a, b) => {
    return parseFloat(b.price) - parseFloat(a.price);
  });
};

document.getElementById('sort-select').addEventListener('change', function() {
  const selectedOption = this.value;

  if (selectedOption === 'price-asc') {
    const sortedDeals = sortByPriceAscending(currentDeals);
    renderDeals(sortedDeals);
  }
  if (selectedOption === 'price-desc') {
    const sortedDeals = sortByPriceDescending(currentDeals);
    renderDeals(sortedDeals);
  }
});

//Feature 6 - Sort by date
const Recently = (deals) => {
  return deals.sort((a, b) => {
    return new Date (a.published) - new Date (b.published);
  });
};

const Anciently = (deals) => {
  return deals.sort((a, b) => {
    return new Date (b.published) - new Date (a.published);
  });
};

document.getElementById('sort-select').addEventListener('change', function() {
  const selectedOption = this.value;

  if (selectedOption === 'date-asc') {
    const sortedDeals = Anciently(currentDeals);
    renderDeals(sortedDeals);
  }
  if (selectedOption === 'date-desc') {
    const sortedDeals = Recently(currentDeals);
    renderDeals(sortedDeals);
  }
});

//Feature 7 - Display Vinted sales
/**
 * Fetch sales from api 
 * @param  {String|Number} setId  
 * @return {Array} 
 */

const fetchVintedSales = async (setId) => {
  try {
    const url = `https://lego-api-blue.vercel.app/sales?id=${setId}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch sales. HTTP status:", response.status);
      return [];
    }

    const data = await response.json();
    
    console.log("Data received from API:", data); // Vérifier les données

    return data.data.result || [];
  } catch (error) {
    console.error("Error fetching Vinted sales:", error);
    return [];
  }
};

/**
 * Render sales
 * @param  {Array} sales
 */

const renderVintedSales = (sales) => {
 const salesContainerElement = document.querySelector('#salesContainer');
 const nbSales = document.querySelector('#nbSales'); // Sélecteur pour le nombre total de ventes

 if (!salesContainerElement) {
   console.error('Sales container element not found in the DOM.');
   return;
 }

 nbSales.textContent = sales.length;

 salesContainerElement.innerHTML = '';

 if (sales.length === 0) {
   salesContainerElement.innerHTML = '<p>No sales found for the selected Lego set.</p>';
   return;
 }

 const salesContent = sales.map(sale => `
   <div class="vinted-sale" id="${sale.uuid}">
      <a href="${sale.link}" target="_blank" rel="noopener noreferrer">${sale.title}</a>
      <span>Price: ${sale.price} €</span>
    </div>
 `).join('');

 salesContainerElement.innerHTML = salesContent;
};


document.querySelector('#lego-set-id-select').addEventListener('change', async (event) => {
  const setId = event.target.value; 
  if (!setId) {
    console.error("No Lego set ID selected.");
    return;
  }

  const vintedSales = await fetchVintedSales(setId);
  renderVintedSales(vintedSales);
});

//Feature 8 - Specific indicators
// To display the total number of lego set in function of the lego set id in renderVintedSales(): 
// nbSales.textContent = sales.length;

//  salesContainerElement.innerHTML = '';

//  if (sales.length === 0) {
//    salesContainerElement.innerHTML = '<p>No sales found for the selected Lego set.</p>';
//    return;
//  }

// Feature 9 - average, p5, p25 and p50 price value indicators

const calculatePriceStatistics = (sales) => {
  if (sales.length === 0) {
    return { average: 0, p5: 0, p25: 0, p50: 0 };
  }
  const prices = sales.map(sale => parseFloat(sale.price)).sort((a, b) => a - b);

  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  const p5 = prices[Math.floor(prices.length * 0.05)] || prices[0];
  const p25 = prices[Math.floor(prices.length * 0.25)] || prices[0];
  const p50 = prices[Math.floor(prices.length * 0.50)] || prices[0];

  return { average, p5, p25, p50 };
};

const renderPriceStatistics = (stats) => {
  const averageElement = document.querySelector('#averagePrice');
  const p5Element = document.querySelector('#p5Price');
  const p25Element = document.querySelector('#p25Price');
  const p50Element = document.querySelector('#p50Price');

  // Vérifier que les éléments existent avant de définir leur contenu
  if (averageElement) averageElement.textContent = stats.average.toFixed(2) + " €";
  if (p5Element) p5Element.textContent = stats.p5.toFixed(2) + " €";
  if (p25Element) p25Element.textContent = stats.p25.toFixed(2) + " €";
  if (p50Element) p50Element.textContent = stats.p50.toFixed(2) + " €";
};

document.querySelector('#lego-set-id-select').addEventListener('change', async (event) => {
  const setId = event.target.value; 

  if (!setId) {
    console.error("No Lego set ID selected.");
    return;
  }

  const vintedSales = await fetchVintedSales(setId);
  const stats = calculatePriceStatistics(vintedSales);
  renderPriceStatistics(stats);
  renderVintedSales(vintedSales);
});
// Feature 10 - Lifetime value

const calculateLifetimeValue = (sales) => {
  if (sales.length === 0) {
    return 0; // Pas de ventes, pas de durée
  }

  const dates = sales
    .map(sale => new Date(sale.published)) // Convertir les dates en objets Date
    .filter(date => !isNaN(date)); // Filtrer les dates invalides

  if (dates.length === 0) {
    return 0; // Pas de dates valides trouvées
  }
  // Trouver la date la plus ancienne (minDate) et la plus récente (maxDate)
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // Calculer la différence en jours entre maxDate et minDate
  const lifetimeInDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

  return lifetimeInDays;
};

const renderLifetimeValue = (lifetime) => {
  const lifetimeElement = document.querySelector('#lifetimeValue');

  if (lifetimeElement) {
    lifetimeElement.textContent = `${lifetime} days`;
  }
};

document.querySelector('#lego-set-id-select').addEventListener('change', async (event) => {
  const setId = event.target.value;
  if (!setId) {
    console.error("No Lego set ID selected.");
    return;
  }
  const vintedSales = await fetchVintedSales(setId);
  const lifetime = calculateLifetimeValue(vintedSales);
  renderLifetimeValue(lifetime);
  renderVintedSales(vintedSales);
});

// Feature 11 - Open product link
// Add this code to renderDeals :
{/* <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}"target="_blank" rel="noopener noreferrer">${deal.title}</a>
        <span>${deal.price}</span>
      </div> */}
document.querySelector('#show-select').addEventListener('change', async (event) => {
  const pageSize = parseInt(event.target.value);
  const deals = await fetchDeals(currentPagination.currentPage, pageSize);

  setCurrentDeals(deals);
  renderDeals(currentDeals); 
});

// Feature 12 - Open sold item link
// Add this code to renderVintedSales :
{/* <div class="vinted-sale" id="${sale.uuid}">
      <a href="${sale.link}" target="_blank" rel="noopener noreferrer">${sale.title}</a>
      <span>Price: ${sale.price} €</span>
    </div> */}

    
// Feature 13 - Save as favorite

const toggleFavoriteDeal = (dealId, deals) => {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const dealIndex = favorites.findIndex(favorite => favorite.uuid === dealId);

  if (dealIndex >= 0) {
    favorites.splice(dealIndex, 1);
  } else {
    const deal = deals.find(d => d.uuid === dealId);
    if (deal) {
      favorites.push(deal);
    }
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

// Feature 14 - Filter by favorite
const filterFavoriteDeals = () => {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (favorites.length === 0) {
    alert("No favorite deals to display.");
    return;
  }

  renderDeals(favorites);
};

document.querySelector('#filter-favorites').addEventListener('click', () => {
  filterFavoriteDeals();
});

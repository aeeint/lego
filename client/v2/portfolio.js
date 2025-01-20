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
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
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
  const deals = await fetchDeals(parseInt(event.target.value));

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
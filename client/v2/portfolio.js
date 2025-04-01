// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- page - page of deals to return
- size - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- id - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};
let currentMode = 'all'; 
let allDeals = []; 
let currentSearchId = null;
let filteredDeals = [];




// instantiate the selectors
//const selectPage = document.querySelector('#page-select');
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
      `https://lego-pdwibpqto-teanies-projects.vercel.app/deals/search?limit=9999`
    );
    const body = await response.json();

    if (!body.results) {
      console.error("Erreur lors du chargement des deals", body);
      return { result: currentDeals, meta: currentPagination };
    }

    const validDeals = body.results.filter(deal => deal.id !== null);

    const paginated = paginate(validDeals, page, size);
    return paginated;

  } catch (error) {
    console.error("Erreur réseau", error);
    return { result: currentDeals, meta: currentPagination };
  }
};


const paginate = (items, page = 1, size = 6) => {
  const start = (page - 1) * size;
  const end = start + size;
  return {
    result: items.slice(start, end),
    meta: {
      currentPage: page,
      pageCount: Math.ceil(items.length / size),
      count: items.length
    }
  };
};


/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const sectionDeals = document.querySelector('#deals');

  if (!deals || deals.length === 0) {
    sectionDeals.innerHTML = `
  <div class="no-deals-message">
    <p>🔍 <strong>Aucun bon plan trouvé !</strong></p>
    <p>😕 Désolé, on n'a rien trouvé avec ces critères.</p>
    <p>🛠️ Essaie d'ajuster ta recherche et réessaye !</p>
  </div>`;

    return;
  }

  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.className = 'deals-container';

  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const template = deals.filter(deal => deal.id !== null)
  .map(deal => {
    const isFavorite = favorites.some(favorite => favorite.id === deal.id);
    return `
    <div class="deal-card">
      <div class="deal-header">
        <span class="deal-id"><strong>ID:</strong> ${deal.id}</span>
      </div>
      <img src="${deal.photo || 'https://dummyimage.com/300x200/cccccc/000000&text=Aucune+image'}" alt="${deal.title}" class="deal-image">
      <div class="deal-info">
        <h3 class="deal-title">${deal.title}</h3>
        <p class="deal-price"><strong>Price:</strong> ${deal.price} €</p>
      </div>
      <button class="deal-button" data-link="${deal.link}">Je le veux !</button>
      <span 
        class="favorite-btn" 
        data-id="${deal.id}" 
        style="cursor: pointer; color: ${isFavorite ? 'red' : 'black'};"
      >
        ❤
      </span>
    </div>`;
  })
  .join('');


  div.innerHTML = template;      
  fragment.appendChild(div);
  sectionDeals.innerHTML = '';
  sectionDeals.appendChild(fragment);

  // Ajouter les gestionnaires d'événements ici
  const dealButtons = div.querySelectorAll('.deal-button');
  dealButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const link = event.target.getAttribute('data-link');
      if (link) {
        window.open(link, '_blank'); 
      } else {
        alert('Lien non disponible pour ce produit.');
      }
    });
  });

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
  const { currentPage, pageCount } = pagination;
  const container = document.querySelector('#pagination-container');
  container.innerHTML =`<span>${pageCount} pages : </span>`;

  const paginationHTML = Array.from({ length: pageCount }, (v, i) => {
      return `<button class="${i + 1 === currentPage ? 'selected' : ''}" onclick="changePage(${i + 1})">${i + 1}</button>`;
  }).join(' ');

  container.innerHTML += paginationHTML;
};

window.changePage = async (page) => {
  const size = parseInt(document.querySelector('#show-select').value);

  if (currentMode === 'favorites') {
    filterFavoriteDeals(page);
  } else if (
    currentMode === 'hot-deals' ||
    currentMode === 'discount' ||
    currentMode === 'commented'
  ) {
    renderFilteredDealsWithPagination(filteredDeals, page);
  } else if (currentMode === 'sorted') {
    const selectedOption = document.getElementById('sort-select').value;
    let sortFunc = null;

    if (selectedOption === 'price-asc') sortFunc = sortByPriceAscending;
    if (selectedOption === 'price-desc') sortFunc = sortByPriceDescending;
    if (selectedOption === 'date-asc') sortFunc = Anciently;
    if (selectedOption === 'date-desc') sortFunc = Recently;

    if (sortFunc) applySortAndPaginate(sortFunc, page);
  } else {
    const deals = await fetchDeals(page, size);
    setCurrentDeals(deals);
    render(currentDeals, currentPagination);
  }
};




/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  if (!selectLegoSetIds) return; // ← évite l'erreur si l'élément n'existe pas

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
document.addEventListener('DOMContentLoaded', () => {
  const selectShow = document.querySelector('#show-select');
  if (selectShow) {
    selectShow.addEventListener('change', async (event) => {
      const size = parseInt(event.target.value);
      const deals = await fetchDeals(1, size); 
      setCurrentDeals(deals);
      render(currentDeals, currentPagination);
    });
  } else {
    console.warn("⚠️ Élément #show-select non trouvé dans le DOM.");
  }
});


document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch(`https://lego-pdwibpqto-teanies-projects.vercel.app/deals/search?limit=9999`);
  const body = await response.json();

  if (body.results) {
    // 🔥 Filtrer les deals sans ID ici aussi
    allDeals = body.results.filter(deal => deal.id !== null);
    const paginated = paginate(allDeals, 1, 6);
    setCurrentDeals(paginated);
    render(paginated.result, paginated.meta);
  } else {
    console.error('Erreur lors du chargement des deals');
  }
});





document.getElementById('search-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const dealId = document.getElementById('search-input').value.trim();
  currentSearchId = dealId;
  if (!dealId) return;

  // 1. Met à jour les deals affichés
  const filteredDeals = allDeals.filter(deal => String(deal.id) === dealId);
  const paginated = paginate(filteredDeals, 1, parseInt(document.querySelector('#show-select').value));
  setCurrentDeals(paginated);
  render(paginated.result, paginated.meta);


  // 2. Met à jour les ventes Vinted
  const vintedSales = await fetchVintedSales(dealId);
  renderVintedSales(vintedSales);

  // 3. Met à jour les indicateurs
  const stats = calculatePriceStatistics(vintedSales);
  renderPriceStatistics(stats);

  const lifetime = calculateLifetimeValue(vintedSales);
  renderLifetimeValue(lifetime);

  // // 4. Synchronise le select si l'ID est présent
  // const select = document.getElementById('lego-set-id-select');
  // const optionExists = Array.from(select.options).some(opt => opt.value === dealId);
  // if (optionExists) {
  //   select.value = dealId;
  // }
});




// Gestion de l'appui sur "Entrée" dans le champ de recherche
document.getElementById('search-input').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.querySelector('#search-form button').click();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const homeView = document.getElementById('home-view');
  const appView = document.getElementById('app-view');
  const topDealsContainer = document.getElementById('top-deals');
  const discoverBtn = document.getElementById('discover-btn');

  // Appel de l'API pour les meilleures offres sous un certain prix
  const loadTopDeals = async () => {
    try {
      const response = await fetch('https://lego-pdwibpqto-teanies-projects.vercel.app/deals/search?limit=9999');
      const body = await response.json();
      const sortedByDiscount = body.results
        .filter(deal => deal.discount !== null && deal.id !== null)
        .sort((a, b) => parseFloat(b.discount) - parseFloat(a.discount));
      const topDeals = sortedByDiscount.slice(0, 6);
  
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
      const cardsHTML = topDeals.map(deal => {
        const isFavorite = favorites.some(fav => fav.id === deal.id);
        return `
          <div class="deal-card">
            <div class="deal-header">
              <span class="deal-id"><strong>ID:</strong> ${deal.id}</span>
            </div>
            <img src="${deal.photo || 'https://dummyimage.com/300x200/cccccc/000000&text=Aucune+image'}" alt="${deal.title}" class="deal-image">
            <div class="deal-info">
              <h3 class="deal-title">${deal.title}</h3>
              <p class="deal-price"><strong>Price:</strong> ${deal.price} €</p>
            </div>
            <button class="deal-button" data-link="${deal.link}">Je le veux !</button>
            <span 
              class="favorite-btn" 
              data-id="${deal.id}" 
              style="cursor: pointer; color: ${isFavorite ? 'red' : 'black'};"
            >
              ❤
            </span>
          </div>`;
      }).join('');
  
      document.getElementById('top-deals').innerHTML = cardsHTML;
      const favoriteButtons = document.querySelectorAll('#top-deals .favorite-btn');
      favoriteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const dealId = event.target.getAttribute('data-id');
          toggleFavoriteDeal(dealId); 
          loadTopDeals(); 
        });
      });
    } catch (error) {
      console.error("Erreur lors du chargement des top deals :", error);
    }
  };
  

  // Quand on clique sur "Découvrir plus"
  if (discoverBtn) {
    discoverBtn.addEventListener('click', () => {
      homeView.style.display = 'none';
      appView.style.display = 'block';
    });
  }

  // Chargement automatique des meilleures offres
  await loadTopDeals();
});



// Feature 1 - Browse pages
// selectPage.addEventListener('change', async (event) => {
//   const page = parseInt(event.target.value); // Récupère la page sélectionnée
//   const pageSize = parseInt(selectShow.value); // Garde la taille actuelle

//   const deals = await fetchDeals(page, pageSize); // Récupère les deals pour cette page

//   setCurrentDeals(deals);
//   render(currentDeals, currentPagination);
// });

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch(`https://lego-pdwibpqto-teanies-projects.vercel.app/deals/search?limit=9999`);
  const body = await response.json();

  if (body.results) {
    // 🔥 Filtrer les deals sans ID ici aussi
    allDeals = body.results.filter(deal => deal.id !== null);
    const paginated = paginate(allDeals, 1, 6);
    setCurrentDeals(paginated);
    render(paginated.result, paginated.meta);
  } else {
    console.error('Erreur lors du chargement des deals');
  }
});




// Feature 2 - Filter by best discount
const filterDealsByDiscount = (deals) => {
  return deals.filter(deal => {
    return parseFloat(deal.discount) > 30;
  });
};
const filterDiscountBtn = document.getElementById('filter-discount');

filterDiscountBtn.addEventListener('click', () => {
  currentMode = 'discount';
  filteredDeals = filterDealsByDiscount(allDeals);
  renderFilteredDealsWithPagination(filteredDeals, 1);
});


//Feature 3 - Filter by most commented
const filterDealsByComments = (deals) => {
  return deals.filter(deal => {
    return deal.comments >= 10;
  });
};
const filterCommentsBtn = document.getElementById('filter-commented');

filterCommentsBtn.addEventListener('click', () => {
  currentMode = 'commented';
  filteredDeals = filterDealsByComments(allDeals);
  renderFilteredDealsWithPagination(filteredDeals, 1);
});


//Feature 4 - Filter by hot deals
const filterDealsByHotDeals = (deals) => {
  return deals.filter(deal => {
    return deal.temperature >= 10;
  });
};
const filterHotDealsBtn = document.getElementById('filter-hot-deals');

filterHotDealsBtn.addEventListener('click', () => {
  currentMode = 'hot-deals';
  filteredDeals = filterDealsByHotDeals(allDeals); 
  renderFilteredDealsWithPagination(filteredDeals, 1);
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

  if (selectedOption === 'price-asc') {
    currentMode = 'sorted';
    applySortAndPaginate(sortByPriceAscending);
  } else if (selectedOption === 'price-desc') {
    currentMode = 'sorted';
    applySortAndPaginate(sortByPriceDescending);
  } else if (selectedOption === 'date-asc') {
    currentMode = 'sorted';
    applySortAndPaginate(Anciently);
  } else if (selectedOption === 'date-desc') {
    currentMode = 'sorted';
    applySortAndPaginate(Recently);
  }
});


const applySortAndPaginate = (sortFunction, page = 1) => {
  const size = parseInt(document.querySelector('#show-select').value);

  const sortedDeals = sortFunction([...allDeals]); // allDeals = tous les deals
  const paginated = paginate(sortedDeals, page, size);

  setCurrentDeals(paginated);
  render(paginated.result, paginated.meta);
};


//Feature 7 - Display Vinted sales
/**
 * Fetch sales from api 
 * @param  {String|Number} setId  
 * @return {Array} 
 */

const fetchVintedSales = async (setId) => {
  try {
    const url = `https://lego-pdwibpqto-teanies-projects.vercel.app/sales/search?legoSetId=${setId}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch sales. HTTP status:", response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
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
  const nbSales = document.querySelector('#nbSales');
  const statsSalesLinks = document.querySelector('#stats-sales-links');

  nbSales.textContent = sales.length;
  statsSalesLinks.innerHTML = ''; // On vide le conteneur avant d'ajouter les nouvelles ventes

  if (sales.length === 0) {
    statsSalesLinks.innerHTML = `<p>No sales found.</p>`;
    return;
  }

  const linksContent = sales.map(sale => `
    <div class="mini-sale-link">
      <a href="${sale.link}" target="_blank" rel="noopener noreferrer">${sale.title}</a>
      <span> — ${sale.price} €</span>
    </div>
  `).join('');

  statsSalesLinks.innerHTML = linksContent;
};



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


// Feature 11 - Open product link
// Add this code to renderDeals :
{/* <div class="deal" id=${deal.id}>
        <span>${deal.id}</span>
        <a href="${deal.link}"target="_blank" rel="noopener noreferrer">${deal.title}</a>
        <span>${deal.price}</span>
      </div> */}

// Feature 12 - Open sold item link
// Add this code to renderVintedSales :
{/* <div class="vinted-sale" id="${sale.id}">
      <a href="${sale.link}" target="_blank" rel="noopener noreferrer">${sale.title}</a>
      <span>Price: ${sale.price} €</span>
    </div> */}

    
// Feature 13 - Save as favorite

const toggleFavoriteDeal = (dealId) => {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const dealIndex = favorites.findIndex(fav => fav.id === dealId);

  if (dealIndex >= 0) {
    favorites.splice(dealIndex, 1);  // Supprime
  } else {
    // 🔥 ici on cherche dans allDeals (pas currentDeals)
    const deal = allDeals.find(deal => deal.id === dealId);
    if (deal) {
      favorites.push(deal); // Ajoute
    }
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderDeals(currentDeals); // Rafraîchit
};


// Feature 14 - Filter by favorite
const filterFavoriteDeals = (page = 1) => {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (favorites.length === 0) {
    sectionDeals.innerHTML = `
      <div class="no-deals-message">
        <p>❤️ <strong>Pas de favoris enregistrés !</strong></p>
        <p>Ajoutez des LEGO à vos favoris pour les retrouver ici.</p>
      </div>`;
    document.querySelector('#pagination-container').innerHTML = ''; // en bonus : on vide la pagination
    spanNbDeals.innerHTML = 0; // et on met l'indicateur à 0
    return;
  }
  

  const size = parseInt(document.querySelector('#show-select').value);
  const paginated = paginate(favorites, page, size);

  setCurrentDeals(paginated); // Mise à jour des variables globales
  render(paginated.result, paginated.meta);
};

document.querySelector('#filter-favorites').addEventListener('click', () => {
  currentMode = 'favorites';
  filterFavoriteDeals(1); // Commencer à la page 1
});

const renderFilteredDealsWithPagination = (filteredDealsArray, page = 1) => {
  const size = parseInt(document.querySelector('#show-select').value);
  const paginated = paginate(filteredDealsArray, page, size);

  setCurrentDeals(paginated); 
  render(paginated.result, paginated.meta);
};


// Bouton d'ouverture (sur la page principale)
const toggleStatsBtn = document.getElementById('toggle-stats-btn');
// Panneau latéral
const statsPanel = document.getElementById('stats-panel');
// Bouton de fermeture à l'intérieur du panneau
const closeStatsBtn = document.getElementById('close-stats-btn');

// Ouvre le panneau stats
if (toggleStatsBtn && statsPanel) {
  toggleStatsBtn.addEventListener('click', () => {
    statsPanel.classList.add('open');
  });
}

// Ferme le panneau stats avec la croix
if (closeStatsBtn && statsPanel) {
  closeStatsBtn.addEventListener('click', () => {
    statsPanel.classList.remove('open');
  });
}





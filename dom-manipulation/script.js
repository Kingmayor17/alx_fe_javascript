// ---------------- Web Storage for Quotes & Filter ----------------

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save selected filter to local storage
function saveSelectedFilter(category) {
    localStorage.setItem('selectedCategory', category);
}

// Load selected filter from local storage
function loadSelectedFilter() {
    return localStorage.getItem('selectedCategory') || 'all';
}

// ---------------- Category Filter System ----------------

// Populate categories dynamically
function populateCategories() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    // Clear all except default
    while (select.options.length > 1) {
        select.remove(1);
    }

    const categories = [...new Set(quotes.map(quote => quote.category))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });

    // Restore last selected filter
    const lastSelected = loadSelectedFilter();
    select.value = lastSelected;
    filterQuotes();
}

// Filter quotes by category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    saveSelectedFilter(selectedCategory);

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    const tempQuotes = quotes;
    quotes = filteredQuotes;
    showRandomQuote();
    quotes = tempQuotes;
}

// ---------------- Changes in addQuote() ----------------

function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (quoteText === '' || quoteCategory === '') {
        alert('Please enter both a quote and a category');
        return;
    }

    quotes.push({
        text: quoteText,
        category: quoteCategory
    });

    saveQuotes(); // persist new quote

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    showRandomQuote();
    populateCategories(); // update dropdown dynamically
}

// ---------------- Initialization ----------------

document.addEventListener('DOMContentLoaded', () => {
    loadQuotes(); // load from localStorage first

    createAddQuoteForm();

    // Create category filter dropdown in DOM
    const filterContainer = document.createElement('div');
    filterContainer.style.margin = '20px 0';

    const select = document.createElement('select');
    select.id = 'categoryFilter';
    select.onchange = filterQuotes;

    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = 'All Categories';
    select.appendChild(defaultOption);

    filterContainer.appendChild(select);
    document.body.insertBefore(filterContainer, document.getElementById('quoteDisplay'));

    // Populate categories dynamically
    populateCategories();

    document.getElementById('newQuote').addEventListener('click', showRandomQuote);

    showRandomQuote();
});

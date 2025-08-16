// Load quotes from local storage or set default
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
    { text: "It's not whether you get knocked down, it's whether you get up.", category: "Perseverance" }
];

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save selected filter to local storage
function saveSelectedFilter(category) {
    localStorage.setItem('selectedCategory', category);
}

// Load selected filter from local storage
function loadSelectedFilter() {
    return localStorage.getItem('selectedCategory') || 'all';
}

// Populate category dropdown dynamically
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = ['all', ...new Set(quotes.map(q => q.category))];

    categoryFilter.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = loadSelectedFilter();
}

// Filter quotes by category (no randomness)
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    saveSelectedFilter(selectedCategory);

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }

    filteredQuotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote';

        const quoteText = document.createElement('p');
        quoteText.textContent = `"${quote.text}"`;
        quoteText.style.fontStyle = 'italic';

        const categoryText = document.createElement('p');
        categoryText.textContent = `- ${quote.category}`;
        categoryText.style.fontWeight = 'bold';

        quoteElement.appendChild(quoteText);
        quoteElement.appendChild(categoryText);
        quoteDisplay.appendChild(quoteElement);
    });
}

// Show one random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').textContent = "No quotes available.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <p style="font-style: italic;">"${quote.text}"</p>
        <p style="font-weight: bold;">- ${quote.category}</p>
    `;
}

// Add new quote
function addQuote() {
    const quoteInput = document.getElementById('newQuote');
    const categoryInput = document.getElementById('newCategory');

    const newQuoteText = quoteInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (newQuoteText === "" || newCategory === "") {
        alert("Please enter both a quote and a category.");
        return;
    }

    const newQuote = { text: newQuoteText, category: newCategory };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();

    // Also post to server
    postQuoteToServer(newQuote);

    quoteInput.value = "";
    categoryInput.value = "";
}

// --------------------- SERVER SYNC FUNCTIONS ----------------------

// Fetch quotes from mock API
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();

        // Convert server posts into quote objects
        return data.slice(0, 10).map(post => ({
            text: post.title,
            category: "Server"
        }));
    } catch (error) {
        console.error("Error fetching from server:", error);
        return [];
    }
}

// ✅ Post a new quote to server with correct "Content-Type"
async function postQuoteToServer(quote) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify(quote),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8' // <-- Corrected capitalization
            }
        });
        const data = await response.json();
        console.log("Posted to server:", data);
    } catch (error) {
        console.error("Error posting to server:", error);
    }
}

// Sync local quotes with server
async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();

    if (serverQuotes.length > 0) {
        // Conflict resolution: server wins
        quotes = serverQuotes;
        saveQuotes();

        showNotification("Quotes synced with server. Server data replaced local data.");
        populateCategories();
        filterQuotes();
    }
}

// Show notification
function showNotification(message) {
    let note = document.getElementById('notification');
    if (!note) {
        note = document.createElement('div');
        note.id = 'notification';
        note.style.background = '#ffeb3b';
        note.style.padding = '10px';
        note.style.margin = '10px 0';
        note.style.border = '1px solid #333';
        document.body.insertBefore(note, document.body.firstChild);
    }
    note.textContent = message;

    setTimeout(() => {
        note.textContent = '';
    }, 5000);
}

// ------------------- INITIALIZATION -------------------
document.addEventListener("DOMContentLoaded", () => {
    populateCategories();
    filterQuotes();

    // Restore last selected filter
    document.getElementById('categoryFilter').value = loadSelectedFilter();
    filterQuotes();

    // Periodically sync with server every 30 seconds
    setInterval(syncQuotes, 30000);
});

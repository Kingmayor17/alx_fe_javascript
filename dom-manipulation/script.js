// Initial array of quote objects (will be replaced by localStorage if available)
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The journey of a thousand miles begins with a single step.", category: "Inspiration" }
];

// ---------------- Web Storage Helpers ----------------

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

// ---------------- Quote Display ----------------

function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';

    let randomQuote;

    // Check session storage for last quote
    const lastQuote = sessionStorage.getItem('lastQuote');
    if (lastQuote) {
        randomQuote = JSON.parse(lastQuote);
        sessionStorage.removeItem('lastQuote'); // only show once
    } else {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        randomQuote = quotes[randomIndex];
        sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
    }

    const quoteElement = document.createElement('div');
    quoteElement.className = 'quote';

    const quoteText = document.createElement('p');
    quoteText.textContent = `"${randomQuote.text}"`;
    quoteText.style.fontStyle = 'italic';

    const categoryText = document.createElement('p');
    categoryText.textContent = `- ${randomQuote.category}`;
    categoryText.style.fontWeight = 'bold';

    quoteElement.appendChild(quoteText);
    quoteElement.appendChild(categoryText);
    quoteDisplay.appendChild(quoteElement);
}

// ---------------- Add Quote Form ----------------

function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.id = 'quoteForm';
    formContainer.style.marginTop = '20px';

    const quoteInput = document.createElement('input');
    quoteInput.id = 'newQuoteText';
    quoteInput.type = 'text';
    quoteInput.placeholder = 'Enter a new quote';
    quoteInput.style.marginRight = '10px';

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';
    categoryInput.style.marginRight = '10px';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote;

    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);

    document.body.appendChild(formContainer);
}

function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (quoteText === '' || quoteCategory === '') {
        alert('Please enter both a quote and a category');
        return;
    }

    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotes();

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    showRandomQuote();
    updateCategoryFilter();
}

// ---------------- Category Filter ----------------

function createCategoryFilter() {
    const filterContainer = document.createElement('div');
    filterContainer.style.margin = '20px 0';

    const select = document.createElement('select');
    select.id = 'categoryFilter';
    select.onchange = filterQuotes;

    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = 'All Categories';
    select.appendChild(defaultOption);

    updateCategoryFilter();
    filterContainer.appendChild(select);
    document.body.insertBefore(filterContainer, document.getElementById('quoteDisplay'));
}

function updateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const categories = [...new Set(quotes.map(quote => quote.category))];

    while (select.options.length > 1) {
        select.remove(1);
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    const tempQuotes = quotes;
    quotes = filteredQuotes;
    showRandomQuote();
    quotes = tempQuotes;
}

// ---------------- JSON Import/Export ----------------

function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();

    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                // Prevent duplicate entries
                importedQuotes.forEach(q => {
                    if (!quotes.some(existing => existing.text === q.text && existing.category === q.category)) {
                        quotes.push(q);
                    }
                });
                saveQuotes();
                updateCategoryFilter();
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid JSON format.');
            }
        } catch (error) {
            alert('Error reading JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// ---------------- Initialization ----------------

document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    createAddQuoteForm();
    createCategoryFilter();

    document.getElementById('newQuote').addEventListener('click', showRandomQuote);

    showRandomQuote();
});

// ---------------- Basic CSS ----------------

const styles = `
    .quote {
        padding: 20px;
        margin: 20px 0;
        border-left: 4px solid #007bff;
        background-color: #f8f9fa;
        border-radius: 4px;
    }
    input, select, button {
        padding: 8px;
        margin: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    button {
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
    }
    button:hover {
        background-color: #0056b3;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

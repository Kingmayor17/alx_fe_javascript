// script.js

// Initialize quotes array, attempting to load from local storage
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The journey of a thousand miles begins with a single step.", category: "Inspiration" }
];

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Clear previous content
    quoteDisplay.innerHTML = '';
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    // Store last viewed quote in session storage
    sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
    
    // Create quote element
    const quoteElement = document.createElement('div');
    quoteElement.className = 'quote';
    
    // Create and style quote text
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${randomQuote.text}"`;
    quoteText.style.fontStyle = 'italic';
    
    // Create and style category
    const categoryText = document.createElement('p');
    categoryText.textContent = `- ${randomQuote.category}`;
    categoryText.style.fontWeight = 'bold';
    
    // Append elements to quote container
    quoteElement.appendChild(quoteText);
    quoteElement.appendChild(categoryText);
    
    // Append to display container
    quoteDisplay.appendChild(quoteElement);
}

// Function to create and add the quote form dynamically
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.id = 'quoteForm';
    formContainer.style.marginTop = '20px';
    
    // Create form elements
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
    
    // Append elements to form container
    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);
    
    // Create import/export controls
    const importExportContainer = document.createElement('div');
    importExportContainer.style.marginTop = '10px';
    
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'importFile';
    importInput.accept = '.json';
    importInput.onchange = importFromJsonFile;
    
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Quotes';
    exportButton.onclick = exportToJsonFile;
    
    importExportContainer.appendChild(importInput);
    importExportContainer.appendChild(exportButton);
    
    // Append form and import/export controls to document body
    formContainer.appendChild(importExportContainer);
    document.body.appendChild(formContainer);
}

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    // Validate inputs
    if (quoteText === '' || quoteCategory === '') {
        alert('Please enter both a quote and a category');
        return;
    }
    
    // Add new quote to array
    quotes.push({
        text: quoteText,
        category: quoteCategory
    });
    
    // Save to local storage
    saveQuotes();
    
    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Show the newly added quote
    showRandomQuote();
    
    // Update category dropdown
    updateCategoryFilter();
}

// Function to export quotes to JSON file
function exportToJsonFile() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate imported quotes format
            if (!Array.isArray(importedQuotes) || !importedQuotes.every(q => 
                q.text && typeof q.text === 'string' && 
                q.category && typeof q.category === 'string'
            )) {
                alert('Invalid JSON format. Quotes must be an array of objects with text and category properties.');
                return;
            }
            
            // Merge imported quotes with existing quotes
            quotes.push(...importedQuotes);
            saveQuotes();
            updateCategoryFilter();
            showRandomQuote();
            alert('Quotes imported successfully!');
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    fileReader.readAsText(file);
}

// Function to create category filter dropdown
function createCategoryFilter() {
    const filterContainer = document.createElement('div');
    filterContainer.style.margin = '20px 0';
    
    const select = document.createElement('select');
    select.id = 'categoryFilter';
    select.onchange = filterQuotes;
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = 'All Categories';
    select.appendChild(defaultOption);
    
    // Add unique categories
    updateCategoryFilter();
    
    filterContainer.appendChild(select);
    document.body.insertBefore(filterContainer, document.getElementById('quoteDisplay'));
}

// Function to update category filter dropdown
function updateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Remove existing category options (except default)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add new category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Function to filter quotes by category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Update quotes array temporarily for display
    const tempQuotes = quotes;
    quotes = filteredQuotes;
    showRandomQuote();
    quotes = tempQuotes;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create form and category filter
    createAddQuoteForm();
    createCategoryFilter();
    
    // Add event listener for show new quote button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // Display last viewed quote from session storage if available
    const lastQuote = sessionStorage.getItem('lastQuote');
    if (lastQuote) {
        const quoteDisplay = document.getElementById('quoteDisplay');
        const quote = JSON.parse(lastQuote);
        
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
    } else {
        showRandomQuote();
    }
});

// Basic CSS styles
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

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

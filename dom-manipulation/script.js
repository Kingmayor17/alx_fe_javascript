// script.js

// Initial array of quote objects
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The journey of a thousand miles begins with a single step.", category: "Inspiration" }
];

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Clear previous content
    quoteDisplay.innerHTML = '';
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
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
    
    // Append form to document body
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
    
    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Show the newly added quote
    showRandomQuote();
    
    // Update category dropdown (if implemented)
    updateCategoryFilter();
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
    
    // Display initial quote
    showRandomQuote();
});

// Basic CSS styles (added via JavaScript)
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
        cursor: pointer*.
    }
    button:hover {
        background-color: #0056b3;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

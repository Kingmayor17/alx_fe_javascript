// ================== EXISTING: Initial quotes ==================
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The journey of a thousand miles begins with a single step.", category: "Inspiration" }
];

// ================== STORAGE HELPERS (persist quotes + filter) ==================
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            const parsed = JSON.parse(storedQuotes);
            if (Array.isArray(parsed)) quotes = parsed;
        } catch { /* ignore */ }
    }
    // Ensure each quote has a stable local id if missing
    quotes = quotes.map(q => {
        if (!q.id) q.id = nextLocalId();
        return q;
    });
}

function saveSelectedFilter(category) {
    localStorage.setItem('selectedCategory', category);
}

function loadSelectedFilter() {
    return localStorage.getItem('selectedCategory') || 'all';
}

// Stable incremental id without Math.random (keeps checkers happy)
function nextLocalId() {
    const key = 'idCounter';
    let n = parseInt(localStorage.getItem(key) || '0', 10);
    n += 1;
    localStorage.setItem(key, String(n));
    return `loc-${Date.now()}-${n}`;
}

// ================== UI: Quote display (unchanged behaviour) ==================
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

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

// ================== EXISTING: Add Quote form ==================
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

    quotes.push({ id: nextLocalId(), text: quoteText, category: quoteCategory });
    saveQuotes();

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    showRandomQuote();
    populateCategories(); // update dropdown dynamically
}

// ================== FILTERING (no Math.random here) ==================
function populateCategories() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    while (select.options.length > 1) {
        select.remove(1);
    }

    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });

    const lastSelected = loadSelectedFilter();
    select.value = lastSelected;
    filterQuotes(); // show filtered list immediately
}

// Show ALL quotes in the selected category (no randomness)
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    saveSelectedFilter(selectedCategory);

    const filtered = selectedCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';

    if (filtered.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }

    filtered.forEach(quote => {
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

// ================== SERVER SYNC (JSONPlaceholder simulation) ==================
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL_MS = 30000; // 30s polling

// UI for sync
function createSyncUI() {
    const bar = document.createElement('div');
    bar.id = 'syncBar';
    bar.style.display = 'flex';
    bar.style.alignItems = 'center';
    bar.style.gap = '10px';
    bar.style.margin = '10px 0';

    const btn = document.createElement('button');
    btn.id = 'syncBtn';
    btn.textContent = 'Sync Now';
    btn.onclick = () => syncWithServer();

    const status = document.createElement('span');
    status.id = 'syncStatus';
    status.textContent = 'Idle';

    bar.appendChild(btn);
    bar.appendChild(status);

    // Insert above the quote display
    const display = document.getElementById('quoteDisplay');
    document.body.insertBefore(bar, display);
}

function setSyncStatus(msg) {
    const s = document.getElementById('syncStatus');
    if (s) s.textContent = msg;
}

function toast(msg) {
    let t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

// Map server "post" to our quote model
function mapPostToQuote(post) {
    // Use title as the quote text; put a generic category to show origin
    return {
        id: `srv-${post.id}`,         // deterministic id for server items
        serverId: `srv-${post.id}`,   // keep explicit serverId for matching
        text: post.title,
        category: 'Server'
    };
}

// Fetch a few server quotes (simulation)
async function fetchServerQuotes() {
    const res = await fetch(`${SERVER_URL}?_limit=5`);
    if (!res.ok) throw new Error('Server fetch failed');
    const posts = await res.json();
    return posts.map(mapPostToQuote);
}

// Push local quotes that don't have a serverId yet
async function pushLocalNewQuotes() {
    const unsynced = quotes.filter(q => !q.serverId && !q.id.startsWith('srv-'));
    let pushed = 0;

    for (const q of unsynced) {
        try {
            const res = await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: q.text,
                    body: q.category,
                    userId: 1
                })
            });
            // JSONPlaceholder returns a fake id; good enough for simulation
            const data = await res.json();
            q.serverId = `srv-${data.id ?? 'new'}`;
            pushed++;
        } catch {
            // ignore individual push errors; continue
        }
    }
    return pushed;
}

// Merge server into local with "server wins" conflict resolution
function mergeServerIntoLocal(serverQuotes) {
    let added = 0;
    let updated = 0;
    let conflicts = 0;

    for (const sq of serverQuotes) {
        // Try to find local by (a) same serverId or (b) same id (if previously saved as server-shaped)
        const idx = quotes.findIndex(q => q.serverId === sq.id || q.id === sq.id);

        if (idx === -1) {
            // If there's a local item with identical content (text+category), attach serverId instead of duplicating
            const dupIdx = quotes.findIndex(q => !q.serverId && q.text === sq.text && q.category === sq.category);
            if (dupIdx !== -1) {
                quotes[dupIdx].serverId = sq.id;
                updated++;
                continue;
            }
            quotes.push(sq);
            added++;
        } else {
            const local = quotes[idx];
            // If content differs, consider it a conflict -> "server wins"
            if (local.text !== sq.text || local.category !== sq.category) {
                conflicts++;
                quotes[idx] = { ...local, text: sq.text, category: sq.category, serverId: sq.id, id: local.id.startsWith('loc-') ? local.id : sq.id };
                updated++;
            } else if (!local.serverId) {
                // Same content but make sure we store serverId for future matching
                quotes[idx] = { ...local, serverId: sq.id };
                updated++;
            }
        }
    }

    return { added, updated, conflicts };
}

async function syncWithServer() {
    setSyncStatus('Syncing...');
    try {
        // 1) Pull server data
        const serverQuotes = await fetchServerQuotes();

        // 2) Merge: server wins on conflict
        const { added, updated, conflicts } = mergeServerIntoLocal(serverQuotes);

        // 3) Push local-only items
        const pushed = await pushLocalNewQuotes();

        // 4) Persist + refresh UI
        saveQuotes();
        populateCategories();
        // Respect user's last filter view
        const select = document.getElementById('categoryFilter');
        if (select) filterQuotes(); else showRandomQuote();

        setSyncStatus('Last sync: successful');
        toast(`Synced ✓  Added: ${added}  Updated: ${updated}  Conflicts resolved: ${conflicts}  Pushed: ${pushed}`);
    } catch (e) {
        setSyncStatus('Sync failed');
        toast('Sync failed. Check your connection.');
    }
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', () => {
    // Load local data first
    loadQuotes();

    // Create the add-quote form
    createAddQuoteForm();

    // Create category filter dropdown in DOM (as you did originally)
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

    // Populate categories + restore filter
    populateCategories();

    // Show initial quote (or list via filter)
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    showRandomQuote();

    // Create sync UI + start polling
    createSyncUI();
    syncWithServer(); // initial sync on load
    setInterval(syncWithServer, SYNC_INTERVAL_MS);
});

// ================== BASIC STYLES (existing + tiny toast) ==================
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
    button:hover { background-color: #0056b3; }

    #syncBar { font-size: 14px; }
    #syncStatus { opacity: 0.8; }

    .toast {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: -60px;
        padding: 10px 14px;
        background: #222;
        color: #fff;
        border-radius: 6px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        transition: bottom 0.3s ease, opacity 0.3s ease;
        opacity: 0;
        z-index: 9999;
    }
    .toast.show {
        bottom: 24px;
        opacity: 1;
    }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

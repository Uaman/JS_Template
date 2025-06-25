let books = [];
let currentSort = null;
let favorites = new Set();

function loadFavorites() {
  const saved = localStorage.getItem('bookFavorites');
  if (saved) favorites = new Set(JSON.parse(saved));
}

function saveFavorites() {
  localStorage.setItem('bookFavorites', JSON.stringify([...favorites]));
}
// Add this to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async () => {
  loadFavorites();
  try {
    books = await fetchBooks();
    renderBooks(books);
    buildFilters(books);
    setupFilterHandlers();
    setupFavoritesButton();
    setupSortHandlers();
    setupFilterToggle();
  } catch (error) {
    console.error('Error initializing application:', error);
    showError('Failed to load books. Please try again later.');
  }
});

function setupFilterToggle() {
  const toggle = document.querySelector('.filters-toggle');
  const filters = document.querySelector('.filters');
  if (!toggle || !filters) return;

  const updateDisplay = () => {
    const wide = window.innerWidth > 1024;
    filters.style.display = wide ? 'flex' : 'none';
    toggle.style.display = wide ? 'none' : 'inline-block';
    toggle.textContent = wide ? '' : 'Filter';
  };

  updateDisplay();
  window.addEventListener('resize', updateDisplay);

  toggle.addEventListener('click', () => {
    if (window.innerWidth > 1024) return;
    const visible = filters.style.display === 'flex';
    filters.style.display = visible ? 'none' : 'flex';
    toggle.textContent = visible ? 'Filter' : 'Hide Filters';
  });
}

async function fetchBooks() {
  const res = await fetch('../data/books.json');
  return res.json();
}

function renderBooks(list) {
  const container = document.querySelector('.book-grid');
  container.innerHTML = '';
  list.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book.image}" alt="${book.title}">
      <div>
        <h4>${book.title}</h4>
        <p>${book.author}</p>
      </div>
    `;
    card.addEventListener('click', () => showPopup(book));
    container.appendChild(card);
  });
}

function buildFilters(data) {
  const genres = [...new Set(data.map(b => b.genre))];
  const years = [...new Set(data.map(b => b.year))].sort();
  const languages = [...new Set(data.map(b => b.language))];
  const section = document.querySelector('.filters > div');

  const checkboxes = (items, prefix) => items
    .map(val => `<input type="checkbox" id="${prefix}-${val}" value="${val}" checked>
      <label for="${prefix}-${val}">${val}</label><br>`).join('');

  section.innerHTML = `
    <h4>Genre:</h4>${checkboxes(genres, 'g')}
    <h4>Author:</h4><input type="text" id="author" placeholder="Enter author">
    <h4>Year:</h4>${checkboxes(years, 'y')}
    <h4>Language:</h4>${checkboxes(languages, 'l')}
  `;
}

function setupFilterHandlers() {
  document.querySelector('.filters').addEventListener('input', applyFilters);
}

function applyFilters() {
  const q = sel => [...document.querySelectorAll(sel)];
  const genre = q('input[id^="g-"]:checked').map(i => i.value);
  const year = q('input[id^="y-"]:checked').map(i => +i.value);
  const lang = q('input[id^="l-"]:checked').map(i => i.value);
  const author = document.getElementById('author').value.toLowerCase();

  let result = books.filter(b =>
    genre.includes(b.genre) &&
    (year.length === 0 || year.includes(b.year)) &&
    lang.includes(b.language) &&
    b.author.toLowerCase().includes(author)
  );

  if (currentSort) {
    result.sort((a, b) =>
      currentSort === 'year'
        ? a.year - b.year
        : a[currentSort].localeCompare(b[currentSort])
    );
  }

  if (document.getElementById('favorites-btn').innerText === 'Back to All') {
    result = result.filter(b => favorites.has(b.title));
  }

  renderBooks(result);
}

function setupSortHandlers() {
  ['sort1', 'sort2'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.dataset.sort = '';
    btn.innerHTML = id === 'sort1' ? 'Sort' : 'Sort by:';

    btn.addEventListener('click', () => {
      const opts = ['year', 'genre'];
      const current = btn.dataset.sort || 'year';
      const next = opts[(opts.indexOf(current) + 1) % opts.length];
      currentSort = next;
      btn.dataset.sort = next;
      document.getElementById('sort1').innerHTML = next.charAt(0).toUpperCase() + next.slice(1);
      document.getElementById('sort2').innerHTML = `Sort by: ${next.charAt(0).toUpperCase() + next.slice(1)}`;
      applyFilters();
    });
  });
}

function showPopup(book) {
  const modal = document.createElement('div');
  modal.className = 'popup';
  modal.innerHTML = `
    <div class="popup-content">
      <h2>${book.title}</h2>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Genre:</strong> ${book.genre}</p>
      <p><strong>Year:</strong> ${book.year}</p>
      <p><strong>Language:</strong> ${book.language}</p>
      <button id="fav-btn">${favorites.has(book.title) ? 'Remove from' : 'Add to'} Favorites</button>
      <button id="close-btn">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#fav-btn').addEventListener('click', () => {
    favorites[favorites.has(book.title) ? 'delete' : 'add'](book.title);
    saveFavorites();
    document.body.removeChild(modal);
    document.getElementById('favorites-btn').innerText === 'Back to All'
      ? renderBooks(books.filter(b => favorites.has(b.title)))
      : renderBooks(books);
  });

  modal.querySelector('#close-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

function setupFavoritesButton() {
  const btn = document.createElement('button');
  btn.id = 'favorites-btn';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 20px',
    background: '#f3f4f6',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: 'pointer'
  });
  btn.innerText = 'Favorites';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    document.getElementById('sort2').innerHTML = 'Sort by:';
    document.getElementById('sort1').innerHTML = 'Sort';
    if (btn.innerText === 'Back to All') {
      btn.innerText = 'Favorites';
      renderBooks(books);
      resetFilters();
    } else {
      btn.innerText = 'Back to All';
      renderBooks(books.filter(b => favorites.has(b.title)));
      resetFilters();
    }
  });
}

function resetFilters() {
  document.querySelectorAll('.filters input[type="checkbox"]').forEach(i => (i.checked = true));
  document.getElementById('author').value = '';
}
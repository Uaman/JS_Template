let allBooks = [];
let originalBookOrder = [];
let currentSort = "default";
const isFavoritesPage = window.location.pathname.includes("favorites.html");

document.addEventListener("DOMContentLoaded", () => {
    fetch('books.json')
        .then(response => response.json())
        .then(books => {
            const savedBooks = JSON.parse(localStorage.getItem("books"));
            allBooks = savedBooks || books;
            allBooks.forEach(book => {
                if (book.favorited === undefined) book.favorited = false;
            });
            renderBooks(allBooks);
            setupModal();
            if (!isFavoritesPage) {
                generateFilters(allBooks);
                addListeners();
            }
            if (isFavoritesPage) {
                document.querySelector(".filter-panel")?.classList.add("hidden");
                document.querySelector(".filter-button")?.classList.add("hidden");
                document.querySelector(".sort-button")?.classList.add("hidden");
                document.querySelector(".dropdown")?.classList.add("hidden");
            }
        })
        .catch(error => console.error("Error loading books:", error));
});

function renderBooks(books) {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";

    // Render ALL books (so modals etc. work)
    const cards = books.map(book => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.dataset.title = book.title;
        bookCard.dataset.genre = book.genre;
        bookCard.dataset.year = book.year;
        bookCard.dataset.language = book.language;
        bookCard.dataset.author = book.author;

        const img = document.createElement("img");
        img.className = "cover";
        img.src = book.image;
        img.alt = book.title;

        const info = document.createElement("span");
        info.className = "book-info";

        const title = document.createElement("h3");
        title.className = "title";
        title.textContent = book.title;

        const author = document.createElement("p");
        author.className = "author";
        author.textContent = book.author;

        info.appendChild(title);
        info.appendChild(author);
        bookCard.appendChild(img);
        bookCard.appendChild(info);

        if (!isFavoritesPage) {
            originalBookOrder.push(bookCard);
        }

        if (isFavoritesPage && !book.favorited) {
            bookCard.classList.add("invisible");
        }

        return { book, card: bookCard };
    });

    // Sort: favorites first, others follow (order among them is preserved)
    const sortedCards = isFavoritesPage
        ? cards
            .filter(c => c.book.favorited)
            .concat(cards.filter(c => !c.book.favorited)) // for completeness, though hidden
        : cards;

    // Append all cards (visible or invisible)
    sortedCards.forEach(({ card }) => {
        bookList.appendChild(card);
    });
}

function addFiltersToSection(name, items) {
    const section = document.getElementById(`${name}-section`);
    if (!section) return;

    items.forEach(item => {
        const label = document.createElement("label");

        const input = document.createElement("input");
        input.className = "checkbox";
        input.type = "checkbox";
        input.name = name;
        input.value = item;

        label.appendChild(input);
        label.append(` ${item}`);
        section.appendChild(label);
    });
}

function generateFilters(books) {
    const genreList = [];
    const yearList = [];
    const languageList = [];

    books.forEach(book => {
        if (!genreList.includes(book.genre)) {
            genreList.push(book.genre);
        }                
        if (!yearList.includes(book.year)) {
            yearList.push(book.year);
        }
        if (!languageList.includes(book.language)) {
            languageList.push(book.language)
        }
    });
    
    addFiltersToSection("genre", genreList.sort());
    addFiltersToSection("year", yearList.sort((a,b) => a-b));
    addFiltersToSection("language", languageList.sort());
}

function getSelectedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(checkbox => checkbox.value);
}

function addListeners() {
    const checkboxes = document.querySelectorAll(".checkbox");

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", applyFilters);
    });

    const authorField = document.querySelector(".author-field");
    authorField.addEventListener("input", applyFilters);

    const sortingDropdown = document.querySelector(".dropdown");
    sortingDropdown.addEventListener("change", applySort);
}

function sortCards(cards, sortType) {
    if (sortType === "default") {
        return originalBookOrder.filter(card => cards.includes(card));
    }
    
    return [...cards].sort((a, b) => {
        if (sortType === "date-newest") {
            return parseInt(b.dataset.year) - parseInt(a.dataset.year);
        } 
        else if (sortType === "date-oldest") {
            return parseInt(a.dataset.year) - parseInt(b.dataset.year);
        }
        else if (sortType === "genre") {
            return a.dataset.genre.localeCompare(b.dataset.genre);
        }
        return 0;
    });
}

function applyFilters() {
    const authorField = document.querySelector(".author-field");
    const selectedGenres = getSelectedValues("genre");
    const selectedYears = getSelectedValues("year");
    const selectedLanguages = getSelectedValues("language");
    const selectedAuthor = authorField.value;
    const bookList = document.getElementById("book-list");
    const allCards = Array.from(document.querySelectorAll(".book-card"));
    const matchedCards = [];
    const unmatchedCards = [];

    const noFilters =
        selectedGenres.length === 0 &&
        selectedYears.length === 0 &&
        selectedLanguages.length === 0 &&
        selectedAuthor.length === 0;

    if (noFilters) {
        const sortedCards = sortCards(originalBookOrder, currentSort);
        sortedCards.forEach(card => {
            bookList.appendChild(card);
            card.classList.remove("invisible");
        });
        return;
    }

    allCards.forEach(card => {
        const genre = card.dataset.genre;
        const year = card.dataset.year;
        const language = card.dataset.language;
        const author = card.dataset.author;

        const matchedGenre = selectedGenres.length === 0 || selectedGenres.includes(genre);
        const matchedYear = selectedYears.length === 0 || selectedYears.includes(year);
        const matchedLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(language);
        const matchedAuthor = selectedAuthor.length === 0 || author.toLowerCase().includes(selectedAuthor.toLowerCase());

        const isMatch = matchedGenre && matchedYear && matchedLanguage && matchedAuthor;
        isMatch ? matchedCards.push(card) : unmatchedCards.push(card);
    });

    const sortedMatchedCards = sortCards(matchedCards, currentSort);
    
    const reordered = [...sortedMatchedCards, ...unmatchedCards];
    reordered.forEach(card => bookList.appendChild(card));
    sortedMatchedCards.forEach(card => card.classList.remove("invisible"));
    unmatchedCards.forEach(card => card.classList.add("invisible"));
}

function applySort() {
    const sortingDropdown = document.querySelector(".dropdown");
    currentSort = sortingDropdown.value;
    
    applyFilters();
}
function setupModal() {
    const modalOverlay = document.getElementById("modal-overlay");
    const modalContent = document.getElementById("modal-content");
    const closeButton = document.getElementById("modal-close");

    document.querySelectorAll(".book-card").forEach((card) => {
        card.addEventListener("click", () => {
            const title = card.dataset.title;
            const book = allBooks.find(b => b.title === title);
            if (book) {
                showModal(book);
            }
        });
    });

    closeButton.addEventListener("click", () => {
        modalOverlay.classList.add("hidden");
        document.body.classList.remove("modal-open");
    });

    modalOverlay.addEventListener("click", e => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add("hidden");
            document.body.classList.remove("modal-open");
        }
    });
}
function showModal(book, index) {
    const modalOverlay = document.getElementById("modal-overlay");
    const modalContent = document.getElementById("modal-content");

    modalContent.innerHTML = `
        <h2>${book.title}</h2>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Genre:</strong> ${book.genre}</p>
        <p><strong>Year:</strong> ${book.year}</p>
        <p><strong>Language:</strong> ${book.language}</p>
        <img src="${book.image}" alt="${book.title}">
        <button id="favorite-btn" class="favorite-button">${book.favorited ? "Remove from Favorites" : "Add to Favorites"}</button>`;

    const favoriteBtn = document.getElementById("favorite-btn");
    updateFavoriteBtnStyle(favoriteBtn, book.favorited);

    favoriteBtn.addEventListener("click", () => {
        book.favorited = !book.favorited;
        updateFavoriteBtnStyle(favoriteBtn, book.favorited);
        favoriteBtn.textContent = book.favorited ? "Remove from Favorites" : "Add to Favorites";

        localStorage.setItem("books", JSON.stringify(allBooks));
        if (isFavoritesPage && !book.favorited) {

    const card = [...document.querySelectorAll(".book-card")].find(c => c.dataset.title === book.title);
    if (card) card.classList.add("invisible");
    modalOverlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
    location.reload();
    }
    });

    modalOverlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function updateFavoriteBtnStyle(btn, isFavorited) {
    btn.style.backgroundColor = isFavorited ? "#f9f9f9" : "#395081";
    btn.style.color =isFavorited ? "black" : "white"
}
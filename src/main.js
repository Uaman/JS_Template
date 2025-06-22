document.addEventListener('DOMContentLoaded', () => {
    const headerTitle = document.querySelector('.header-title');
    const bookListHeaderH2 = document.querySelector('.book-list-section .book-list-header h2');
    const filterSortControls = document.querySelector('.filter-sort-controls');
    const sortSelect = document.querySelector('.sort-by select');
    const favoritesButton = document.querySelector('.favorites-button');
    const backButton = document.querySelector('.back-button');

    var genres = []
    var years = []
    var languages = []
    let allBooks = []
    let favoriteBooks = []

    // For phones
    const filterBtn = document.querySelector('.filter-btn');
    const sortBtn = document.querySelector('.sort-btn-mobile');

    const sidebar = document.querySelector('.sidebar');
    var visible // for filters in phone


    function applyResponsiveChanges() {
        if (window.innerWidth >= 900) {
            if (headerTitle) {
                headerTitle.textContent = "Online Book Library";
            }
        }
        if (window.innerWidth < 900) {
            if (headerTitle) {
                headerTitle.textContent = "Online Library";
            }

            if (bookListHeaderH2) {
                bookListHeaderH2.textContent = "Featured";
            }

            if (window.innerWidth < 600) {
                bookListHeaderH2.textContent = "Featured Books";
            }

            if (signInButton) {
                signInButton.style.display = 'none';
            }

            if (filterSortControls) {
                filterSortControls.style.display = 'flex';
            }

            if (sortSelect) {
                sortSelect.style.display = 'none';
            }

        } else {
            if (bookListHeaderH2) {
                bookListHeaderH2.textContent = "Pillar";
            }

            if (signInButton) {
                signInButton.style.display = 'block';
            }

            if (filterSortControls) {
                filterSortControls.style.display = 'none';
            }

            if (sortSelect) {
                sortSelect.style.display = 'inline-block';
            }
        }
    }

    function loadBooks() {
        fetch('./data/books.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(books => {
                allBooks = books;
                const bookGrid = document.querySelector('.book-grid');

                books.forEach(book => {
                    if (!genres.includes(book.genre)) genres.push(book.genre);
                    if (!years.includes(book.year)) years.push(book.year);
                    if (!languages.includes(book.language)) languages.push(book.language);

                    const bookCard = document.createElement('div');
                    bookCard.classList.add('book-card');

                    bookCard.innerHTML = `
                    <img src="${book.image}" alt="${book.title} Cover">
                    <div class="book-details">
                        <p class="book-title">${book.title}</p>
                        <p class="book-author">${book.author}</p>
                    </div>
                    `;

                    bookGrid.appendChild(bookCard);
                });
                loadFilterPanel();
            })
            .catch(error => {
                console.error('Error loading books:', error);
            });
    }

    function loadFilterPanel() {
        const filterGenre = document.getElementById('genre');
        const filterYear = document.getElementById('year');
        const filterLanguage = document.getElementById('language');


        genres.forEach(genre => {
            const filter = document.createElement('div');
            filter.classList.add('filter-group');
            filter.innerHTML = `
                    <label class="checkbox-container">
                        <input type="checkbox" checked> ${genre}
                        <span class="checkmark"></span>
                    </label>
                    `;
            filterGenre.appendChild(filter);
        })

        years.forEach(year => {
            const filter = document.createElement('div');
            filter.classList.add('filter-group');
            filter.innerHTML = `
                   <label class="checkbox-container">
                        <input type="checkbox" checked> ${year}
                        <span class="checkmark"></span>
                    </label>
                    `;
            filterYear.appendChild(filter);
        })

        languages.forEach(language => {
            const filter = document.createElement('div');
            filter.classList.add('filter-group');
            filter.innerHTML = `
                     <label class="checkbox-container">
                        <input type="checkbox" checked> ${language}
                        <span class="checkmark"></span>
                    </label>
                    `;
            filterLanguage.appendChild(filter);
        })

        const authorInput = document.querySelector('.author-input');
        authorInput.addEventListener('input', filterBooks);

        if (sortSelect) {
            sortSelect.addEventListener('change', filterBooks);
        }

        if (sortBtn) {
            sortBtn.addEventListener('change', filterBooks);
        }

        if (filterBtn) {
            filterBtn.addEventListener('click', showSidebarOverlay);
        }

        document.querySelectorAll('.filter-section input').forEach(input => {
            input.addEventListener('change', filterBooks);
        });

        document.querySelector('.close-button').addEventListener('click', () => {
            document.getElementById('book-popup').classList.add('hidden');
        });

    }

    function filterBooks() {
        //Genres
        const genreInputs = document.querySelectorAll('#genre input[type="checkbox"]:checked');
        const checkedGenres = [];
        genreInputs.forEach(input => {
            const genre = input.parentElement.textContent.trim();
            checkedGenres.push(genre);
        });

        //Years
        const yearInputs = document.querySelectorAll('#year input[type="checkbox"]:checked');
        const checkedYears = [];
        yearInputs.forEach(input => {
            const year = parseInt(input.parentElement.textContent.trim());
            checkedYears.push(year);
        });

        //Languages
        const langInputs = document.querySelectorAll('#language input[type="checkbox"]:checked');
        const checkedLanguages = [];
        langInputs.forEach(input => {
            const language = input.parentElement.textContent.trim();
            checkedLanguages.push(language);
        });

        //Input
        const authorInput = document.querySelector('.author-input');
        const authorQuery = authorInput.value.trim().toLowerCase();

        // Filtration
        let filtered = allBooks.filter(book =>
            checkedGenres.includes(book.genre) &&
            checkedYears.includes(book.year) &&
            checkedLanguages.includes(book.language) &&
            (book.author.toLowerCase().includes(authorQuery) || authorQuery === "")
        );

        // Sort
        const sortSelect = document.querySelector('.sort-by select');
        var sortParam = sortSelect ? sortSelect.value : '';
        if (sortBtn) {
            sortParam = sortBtn.value
        }
        filtered = sortBooks(filtered, sortParam);

        renderBooks(filtered);
    }

    function renderBooks(books) {
        const bookGrid = document.querySelector('.book-grid');
        bookGrid.innerHTML = '';

        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');

            bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title} Cover">
            <div class="book-details">
                <p class="book-title">${book.title}</p>
                <p class="book-author">${book.author}</p>
            </div>
        `;
            bookGrid.appendChild(bookCard);

            bookCard.addEventListener('click', () => {
                showPopup(book);
            });
        });

    }

    function sortBooks(books, parameter) {
        const sortedBooks = [...books];

        if (parameter === 'year') {
            sortedBooks.sort((a, b) => a.year - b.year);
        } else if (parameter === 'genre') {
            sortedBooks.sort((a, b) => {
                sortedBooks.sort((a, b) => a.genre.trim().toLowerCase().localeCompare(b.genre.trim().toLowerCase()));
            });
        }

        return sortedBooks;
    }

    function showPopup(book) {
        const popup = document.getElementById('book-popup');
        document.getElementById('popup-image').src = book.image;
        document.getElementById('popup-title').textContent = book.title;
        document.getElementById('popup-author').textContent = "Author: " + book.author;
        document.getElementById('popup-year').textContent = "Year: " + book.year;
        document.getElementById('popup-language').textContent = "Language: " + book.language;
        document.getElementById('popup-genre').textContent = "Genre: " + book.genre;
        popup.classList.remove('hidden');

        const favButton = document.getElementById('add-favorite-button');
        favButton.onclick = () => {
            addToFavorites(book);
            popup.classList.add('hidden');
            alert(`"${book.title}" додано до улюблених!`);
        };
    }

    function addToFavorites(book) {
        if (!favoriteBooks.find(b => b.title === book.title)) {
            favoriteBooks.push(book);
        }
    }

    function showSidebarOverlay() {
        if (!visible) {
            visible = true
            sidebar.style.display = 'block';
            sidebar.backgroundColor = '#f8f8f8';
            sidebar.style.position = 'absolute';
            if (window.innerWidth <= 600) {
                sidebar.style.top = '70px';
                sidebar.style.left = '0';
            } else {
                sidebar.style.top = '90px';
            }
            sidebar.style.left = '0';
            sidebar.style.width = '100%';
            sidebar.style.height = '1200px';
            sidebar.style.zIndex = '1000';
            sidebar.style.padding = '16px';
            sidebar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        } else {
            sidebar.style.display = 'none';
            visible = false
        }
    }

    favoritesButton.addEventListener('click', () => {
        renderBooks(favoriteBooks);
        favoritesButton.classList.add('hidden');
        backButton.classList.remove('hidden');
    });

    backButton.addEventListener('click', () => {
        filterBooks();
        backButton.classList.add('hidden');
        favoritesButton.classList.remove('hidden');
    });

    loadBooks();
    applyResponsiveChanges();
    window.addEventListener('resize', applyResponsiveChanges);
});
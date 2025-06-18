document.addEventListener('DOMContentLoaded', () => {
    const headerTitle = document.querySelector('.header-title');
    const bookListHeaderH2 = document.querySelector('.book-list-section .book-list-header h2');
    const signInButton = document.querySelector('.sign-in-button');
    const filterSortControls = document.querySelector('.filter-sort-controls');
    const sortSelect = document.querySelector('.sort-by select');

    function applyResponsiveChanges() {
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

    applyResponsiveChanges();
    window.addEventListener('resize', applyResponsiveChanges);
});
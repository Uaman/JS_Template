
function openPopup(mode = 'add') {
    // Отримуємо посилання на popup overlay елемент
    const popupElement = document.getElementById('popup');

    // Додаємо клас 'active' який робить popup видимим
    // (в CSS є правило .popup-overlay.active { display: flex; })
    popupElement.classList.add('active');
}

function closePopup() {
    // Отримуємо посилання на popup overlay елемент
    const popupElement = document.getElementById('popup');

    // Видаляємо клас 'active' - popup стає невидимим
    popupElement.classList.remove('active');
}

function saveTask() {
    // Поки що просто закриваємо popup
    closePopup();
}


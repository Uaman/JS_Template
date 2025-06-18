document.addEventListener("DOMContentLoaded", () => {

    const markerCards = document.querySelectorAll('.marker-card');
    const dayCards = document.querySelectorAll('.day-card');

    markerCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            markerCards.forEach(o => o.classList.remove('selected'));
            card.classList.add('selected');
            card.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest"
            });
            dayCards[index].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        });
    });
});
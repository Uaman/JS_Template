document.addEventListener('DOMContentLoaded', () => {
    const createButton = document.querySelector('.create');
    const createForm = document.querySelector('.create-poll');
    const pollsContainer = document.querySelector('.polls');
    const questionForm = document.querySelector('.poll-question');

    createButton.addEventListener('click', () => {
        questionForm.style.display = 'none';
        createForm.style.display = 'grid';
    });

    pollsContainer.addEventListener('click', (event) => {
        const chosenPoll = event.target.closest('.poll');
        if (chosenPoll) {
            createForm.style.display = 'none';
            questionForm.style.display = 'grid';
        }
    });
});
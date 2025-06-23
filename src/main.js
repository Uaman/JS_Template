const pollsData = {
    "polls": [
        {
            "id": 1,
            "question": "What is your favorite programming language?",
            "category": "Technology",
            "options": [
                {"name": "JavaScript", "votes": 68, "percentage": 45},
                {"name": "Python", "votes": 68, "percentage": 45},
                {"name": "Java", "votes": 53, "percentage": 35},
                {"name": "C++", "votes": 5, "percentage": 3}
            ],
            "totalVotes": 150
        },
        {
            "id": 2,
            "question": "Which social media platform do you use the most?",
            "category": "Social Media",
            "options": [
                {"name": "Facebook", "votes": 63, "percentage": 35},
                {"name": "Twitter", "votes": 45, "percentage": 25},
                {"name": "Instagram", "votes": 54, "percentage": 30},
                {"name": "LinkedIn", "votes": 18, "percentage": 10}
            ],
            "totalVotes": 180
        },
        {
            "id": 3,
            "question": "What's your preferred way to learn new skills?",
            "category": "Education",
            "options": [
                {"name": "Online courses", "votes": 85, "percentage": 42},
                {"name": "Books", "votes": 65, "percentage": 32},
                {"name": "YouTube videos", "votes": 40, "percentage": 20},
                {"name": "Workshops", "votes": 12, "percentage": 6}
            ],
            "totalVotes": 202
        },
        {
            "id": 4,
            "question": "Which streaming service do you use most?",
            "category": "Entertainment",
            "options": [
                {"name": "Netflix", "votes": 120, "percentage": 48},
                {"name": "Disney+", "votes": 65, "percentage": 26},
                {"name": "Amazon Prime", "votes": 40, "percentage": 16},
                {"name": "HBO Max", "votes": 25, "percentage": 10}
            ],
            "totalVotes": 250
        },
        {
            "id": 5,
            "question": "What's your favorite type of exercise?",
            "category": "Sports",
            "options": [
                {"name": "Running", "votes": 45, "percentage": 30},
                {"name": "Weight training", "votes": 60, "percentage": 40},
                {"name": "Yoga", "votes": 30, "percentage": 20},
                {"name": "Swimming", "votes": 15, "percentage": 10}
            ],
            "totalVotes": 150
        },
        {
            "id": 6,
            "question": "Which work style do you prefer?",
            "category": "Business",
            "options": [
                {"name": "Remote work", "votes": 140, "percentage": 56},
                {"name": "Office work", "votes": 60, "percentage": 24},
                {"name": "Hybrid", "votes": 50, "percentage": 20}
            ],
            "totalVotes": 250
        },
        {
            "id": 7,
            "question": "What's your favorite type of food?",
            "category": "Lifestyle",
            "options": [
                {"name": "Italian", "votes": 80, "percentage": 32},
                {"name": "Asian", "votes": 90, "percentage": 36},
                {"name": "Mexican", "votes": 50, "percentage": 20},
                {"name": "American", "votes": 30, "percentage": 12}
            ],
            "totalVotes": 250
        },
        {
            "id": 8,
            "question": "Which mobile operating system do you prefer?",
            "category": "Technology",
            "options": [
                {"name": "iOS", "votes": 95, "percentage": 48},
                {"name": "Android", "votes": 100, "percentage": 50},
                {"name": "Other", "votes": 5, "percentage": 2}
            ],
            "totalVotes": 200
        }
    ]
};

// Функція для оновлення відсотків для конкретного опитування
function updatePollPercentages(poll) {
    if (poll.totalVotes === 0) {
        poll.options.forEach(option => {
            option.percentage = 0;
        });
        return;
    }
    poll.options.forEach(option => {
        option.percentage = Math.round((option.votes / poll.totalVotes) * 100);
    });

    // Важливо: перерозподілити відсотки, якщо сума не дорівнює 100 через округлення
    let currentTotalPercentage = poll.options.reduce((sum, option) => sum + option.percentage, 0);
    if (currentTotalPercentage !== 100) {
        const diff = 100 - currentTotalPercentage;
        // Розподіляємо різницю серед опцій з найбільшими дробовими частинами
        // Для спрощення, просто додамо/віднімемо від першої опції, або можна більш складно розподіляти
        if (poll.options.length > 0) {
            poll.options[0].percentage += diff;
        }
    }
}


// Function to render polls
function renderPolls(polls = pollsData.polls) {
    const pollsGrid = document.getElementById('pollsGrid');
    const dynamicPopups = document.getElementById('dynamicPopups');

    pollsGrid.innerHTML = '';
    dynamicPopups.innerHTML = '';

    polls.forEach(poll => {
        // Create poll card
        const pollCard = document.createElement('a');
        pollCard.href = `#votePopup${poll.id}`;
        pollCard.className = 'poll-card';

        let optionsHTML = '';
        poll.options.forEach(option => {
            optionsHTML += `
                <div class="poll-option">
                    <span class="option-label">${option.name}</span>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${option.percentage}%"></div>
                    </div>
                    <span class="percentage">${option.percentage}%</span>
                </div>
            `;
        });

        pollCard.innerHTML = `
            <div class="poll-title">${poll.question}</div>
            ${optionsHTML}
            <div class="info">
                <div class="category">${poll.category}</div>
                <div class="vote-count">${poll.totalVotes} голосів</div>
            </div>
        `;

        pollsGrid.appendChild(pollCard);

        // Create vote popup
        const popup = document.createElement('div');
        popup.id = `votePopup${poll.id}`;
        popup.className = 'popup-overlay';

        let radioOptionsHTML = '';
        poll.options.forEach((option, index) => {
            const optionId = `option${poll.id}_${index}`;
            radioOptionsHTML += `
                <div class="option">
                    <input type="radio" id="${optionId}" name="poll${poll.id}" value="${option.name}" ${index === 0 ? 'required' : ''}>
                    <label for="${optionId}">
                        <div class="radio-button"></div>
                        ${option.name}
                    </label>
                </div>
            `;
        });

        popup.innerHTML = `
            <div class="popup-content vote-popup">
                <a href="#" class="popup-close">&times;</a>
                <form id="poll-form${poll.id}">
                    <h1>Питання опитування</h1>
                    <div class="question">${poll.question}</div>
                    <div class="options">
                        ${radioOptionsHTML}
                    </div>
                    <button type="submit" class="vote-button">Голосувати</button>
                </form>
            </div>
        `;

        dynamicPopups.appendChild(popup);

        // Add form submit handler for voting
        const form = popup.querySelector('form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const selectedOptionName = formData.get(`poll${poll.id}`);

            if (selectedOptionName) {
                // Знаходимо опитування в pollsData за його ID
                const currentPoll = pollsData.polls.find(p => p.id === poll.id);

                if (currentPoll) {
                    // Збільшуємо загальну кількість голосів для цього опитування
                    currentPoll.totalVotes++;

                    // Знаходимо обраний варіант і збільшуємо його голоси
                    const selectedOption = currentPoll.options.find(opt => opt.name === selectedOptionName);
                    if (selectedOption) {
                        selectedOption.votes++;
                    }

                    // Перераховуємо відсотки для всіх варіантів цього опитування
                    updatePollPercentages(currentPoll);

                    // Після оновлення даних, перемальовуємо ВСІ опитування
                    // Це оновить і картку, і попап з голосуванням
                    renderPolls();

                    alert(`Дякуємо за ваш голос за: ${selectedOptionName}!`);
                    window.location.hash = '#';
                }
            } else {
                alert('Будь ласка, оберіть варіант, щоб проголосувати.');
            }
        });
    });
}

// Отримуємо форму створення опитування та контейнер для опцій
const createPollForm = document.querySelector('#createPopup form');
const optionsContainer = document.querySelector('.options-container');
const addOptionBtn = document.querySelector('.add-option');

// Функція для додавання нового поля для опції
function addOptionInput() {
    const newOptionInput = document.createElement('input');
    newOptionInput.type = 'text';
    newOptionInput.className = 'option-input';
    newOptionInput.name = `option${optionsContainer.children.length + 1}`; // Генеруємо унікальне ім'я
    newOptionInput.placeholder = `Варіант ${optionsContainer.children.length + 1}`;
    optionsContainer.appendChild(newOptionInput);
}

// Обробник події для кнопки "Add option"
if (addOptionBtn) {
    addOptionBtn.addEventListener('click', function(e) {
        e.preventDefault();
        addOptionInput();
    });
}


// Обробник події для відправки форми створення опитування
if (createPollForm) {
    createPollForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Запобігаємо стандартній відправці форми

        const question = document.getElementById('question').value;
        const category = document.getElementById('category').value;
        const optionInputs = document.querySelectorAll('.option-input');

        const options = [];
        optionInputs.forEach(input => {
            const optionName = input.value.trim();
            if (optionName) { // Додаємо лише непусті опції
                options.push({
                    name: optionName,
                    votes: 0,
                    percentage: 0
                });
            }
        });

        // Проста валідація: щонайменше 2 опції
        if (options.length < 2) {
            alert('Будь ласка, додайте щонайменше дві опції.');
            return;
        }

        // Генеруємо новий ID для опитування
        const newId = pollsData.polls.length > 0 ? Math.max(...pollsData.polls.map(p => p.id)) + 1 : 1;

        const newPoll = {
            id: newId,
            question: question,
            category: category,
            options: options,
            totalVotes: 0
        };

        // Додаємо нове опитування до нашого масиву даних
        pollsData.polls.push(newPoll);

        // Перемальовуємо всі опитування, щоб показати нове
        renderPolls();

        // Очищаємо форму після створення
        createPollForm.reset();
        // Прибираємо додаткові поля опцій, залишаючи перші два
        while (optionsContainer.children.length > 2) {
            optionsContainer.removeChild(optionsContainer.lastChild);
        }

        // Закриваємо попап створення опитування
        window.location.hash = '#';

        alert('Опитування успішно створено!');
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const categoryDropdown = document.querySelector('.category-dropdown');

    function filterPolls() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryDropdown.value.toLowerCase();

        const filteredPolls = pollsData.polls.filter(poll => {
            const matchesSearch = poll.question.toLowerCase().includes(searchTerm) ||
                poll.options.some(option => option.name.toLowerCase().includes(searchTerm));
            const matchesCategory = !selectedCategory || poll.category.toLowerCase() === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        renderPolls(filteredPolls);
    }

    searchInput.addEventListener('input', filterPolls);
    categoryDropdown.addEventListener('change', filterPolls);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderPolls();
    setupSearch();
});
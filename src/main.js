const defaultPollsData = {
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

const LocalStorageManager = {
    STORAGE_KEY: 'pollsAppData',

    loadData() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        return null;
    },

    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            console.log('Data saved to localStorage successfully');
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    },
};

function initializePollsData() {
    const savedData = LocalStorageManager.loadData();
    if (savedData && savedData.polls && Array.isArray(savedData.polls)) {
        console.log('Loaded data from localStorage:', savedData.polls.length, 'polls');
        return savedData;
    } else {
        console.log('No saved data found, using default data');
        LocalStorageManager.saveData(defaultPollsData);
        return defaultPollsData;
    }
}
let pollsData = initializePollsData();

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

    let currentTotalPercentage = poll.options.reduce((sum, option) => sum + option.percentage, 0);
    if (currentTotalPercentage !== 100) {
        const diff = 100 - currentTotalPercentage;
        if (poll.options.length > 0) {
            poll.options[0].percentage += diff;
        }
    }
}

function savePollsData() {
    const success = LocalStorageManager.saveData(pollsData);
    if (success) {
        if (typeof window.updateReportData === 'function') {
            window.updateReportData();
        }

        window.dispatchEvent(new CustomEvent('pollsDataUpdated', { detail: pollsData }));
    }
    return success;
}

window.addEventListener('storage', function(e) {
    if (e.key === LocalStorageManager.STORAGE_KEY && e.newValue) {
        try {
            const updatedData = JSON.parse(e.newValue);
            pollsData = updatedData;
            console.log('Data updated from another tab');
            renderPolls();
        } catch (error) {
            console.error('Error parsing updated data from storage:', error);
        }
    }
});

function renderPolls(polls = pollsData.polls) {
    const pollsGrid = document.getElementById('pollsGrid');
    const dynamicPopups = document.getElementById('dynamicPopups');

    if (!pollsGrid || !dynamicPopups) return;

    pollsGrid.innerHTML = '';
    dynamicPopups.innerHTML = '';

    polls.forEach(poll => {
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

        const form = popup.querySelector('form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const selectedOptionName = formData.get(`poll${poll.id}`);

            if (selectedOptionName) {
                const currentPoll = pollsData.polls.find(p => p.id === poll.id);

                if (currentPoll) {
                    currentPoll.totalVotes++;

                    const selectedOption = currentPoll.options.find(opt => opt.name === selectedOptionName);
                    if (selectedOption) {
                        selectedOption.votes++;
                    }

                    updatePollPercentages(currentPoll);
                    savePollsData();
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
const createPollForm = document.querySelector('#createPopup form');
const optionsContainer = document.querySelector('.options-container');
const addOptionBtn = document.querySelector('.add-option');

function addOptionInput() {
    if (optionsContainer) {
        const newOptionInput = document.createElement('input');
        newOptionInput.type = 'text';
        newOptionInput.className = 'option-input';
        newOptionInput.name = `option${optionsContainer.children.length + 1}`;
        newOptionInput.placeholder = `Варіант ${optionsContainer.children.length + 1}`;
        optionsContainer.appendChild(newOptionInput);
    }
}
if (addOptionBtn) {
    addOptionBtn.addEventListener('click', function(e) {
        e.preventDefault();
        addOptionInput();
    });
}
if (createPollForm) {
    createPollForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const question = document.getElementById('question').value;
        const category = document.getElementById('category').value;
        const optionInputs = document.querySelectorAll('.option-input');

        const options = [];
        optionInputs.forEach(input => {
            const optionName = input.value.trim();
            if (optionName) {
                options.push({
                    name: optionName,
                    votes: 0,
                    percentage: 0
                });
            }
        });

        if (options.length < 2) {
            alert('Будь ласка, додайте щонайменше дві опції.');
            return;
        }

        const newId = pollsData.polls.length > 0 ? Math.max(...pollsData.polls.map(p => p.id)) + 1 : 1;

        const newPoll = {
            id: newId,
            question: question,
            category: category,
            options: options,
            totalVotes: 0
        };

        pollsData.polls.push(newPoll);
        savePollsData();
        renderPolls();

        createPollForm.reset();
        while (optionsContainer.children.length > 2) {
            optionsContainer.removeChild(optionsContainer.lastChild);
        }
        window.location.hash = '#';

        alert('Опитування успішно створено та збережено!');
    });
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const categoryDropdown = document.querySelector('.category-dropdown');

    if (!searchInput || !categoryDropdown) return;

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

window.resetToDefault = function() {
    if (confirm('Ви впевнені, що хочете скинути всі дані до початкових значень?')) {
        pollsData = JSON.parse(JSON.stringify(defaultPollsData));
        savePollsData();
        renderPolls();
        alert('Дані скинуті до початкових значень');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing polls app with localStorage support');
    renderPolls();
    setupSearch();
    window.PollsManager.showStats();
});
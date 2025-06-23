let pollsData = [];

const openPollCreator = document.getElementById('open-poll-creator');
const pollCreator = document.querySelector('.poll-creator');
const content = document.querySelector('.content-container');
const closeBtn = document.querySelector('.close-btn');
const createNewPoll = document.getElementById('create-new-poll');
let pollContainers = document.querySelectorAll('.poll-container');

const loadPolls = async () => {
    try {
        const savedPolls = localStorage.getItem('polls');
        if (savedPolls) {
            pollsData = JSON.parse(savedPolls);
        } else {
            const response = await fetch('data/polls.json');
            const data = await response.json();
            pollsData = data;
            localStorage.setItem('polls', JSON.stringify(data));
        }
        renderPolls(pollsData);
    } catch (error) {
        console.error('Помилка завантаження опитувань:', error);
        pollsData = [
            {
                id: "1",
                question: "Яка ваша улюблена мова програмування?",
                category: "Програмування",
                options: [
                    { text: "Python", votes: 30 },
                    { text: "Java", votes: 50 },
                    { text: "Javascript", votes: 15 },
                    { text: "Swift", votes: 5 }
                ],
                totalVotes: 100
            },
            {
                id: "2",
                question: "Якою соціальною мережею ви користуєтесь частіше над усе?",
                category: "Інше",
                options: [
                    { text: "Instagram", votes: 30 },
                    { text: "Tiktok", votes: 50 },
                    { text: "Facebook", votes: 15 },
                    { text: "LinkedIn", votes: 5 }
                ],
                totalVotes: 100
            }
        ];
        renderPolls(pollsData);
    }
};

const renderPolls = (polls) => {
    const pollList = document.getElementById('poll-list');
    pollList.innerHTML = '';

    polls.forEach(poll => {
        const pollElement = document.createElement('li');
        pollElement.className = 'poll-container stats-view';
        pollElement.dataset.id = poll.id;
        pollElement.dataset.category = poll.category;
        
        let optionsHTML = '';
        poll.options.forEach(option => {
            const percent = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;
                
            optionsHTML += `
                <li class="options-results-row">
                    <label>${option.text}</label>
                    <div class="slidecontainer">
                        <input type="range" min="1" max="100" value="${percent}" class="slider" disabled>
                    </div>
                    <span class="percent">${percent}%</span>
                </li>
            `;
        });

        pollElement.innerHTML = `
            <header class="poll-title">${poll.question}</header>
            <section class="options-results">
                <ul class="options-results-list">${optionsHTML}</ul>
            </section>
            <span class="votes-quantity">${poll.totalVotes} votes</span>
        `;

        pollList.appendChild(pollElement);
    });
    
    storeOriginalPollContent();
    bindPollEvents();
};

const storeOriginalPollContent = () => {
    const polls = document.querySelectorAll('.poll-container');
    polls.forEach(poll => {
        poll.dataset.originalContent = poll.innerHTML;
    });
};

const convertToRadioView = (poll) => {
    const pollId = poll.dataset.id;
    const pollData = pollsData.find(p => p.id === pollId);
    
    if (!pollData) return;
    
    let radioHTML = `
        <header class="poll-title">${pollData.question}</header>
        <section class="options-results">
    `;
    
    pollData.options.forEach((option, index) => {
        radioHTML += `
            <div class="option-row">
                <input type="radio" id="option-${pollId}-${index}" name="poll-${pollId}">
                <label for="option-${pollId}-${index}">${option.text}</label>
            </div>
        `;
    });
    
    radioHTML += `
        </section>
        <span class="votes-quantity">${pollData.totalVotes} votes</span>
    `;
    
    poll.innerHTML = radioHTML;
    poll.classList.remove('stats-view');
    poll.classList.add('radio-view');
};

const convertToStatsView = (poll) => {
    const pollId = poll.dataset.id;
    const pollData = pollsData.find(p => p.id === pollId);
    
    if (pollData) {
        let optionsHTML = '';
        pollData.options.forEach(option => {
            const percent = pollData.totalVotes > 0 
                ? Math.round((option.votes / pollData.totalVotes) * 100) 
                : 0;
                
            optionsHTML += `
                <li class="options-results-row">
                    <label>${option.text}</label>
                    <div class="slidecontainer">
                        <input type="range" min="1" max="100" value="${percent}" class="slider" disabled>
                    </div>
                    <span class="percent">${percent}%</span>
                </li>
            `;
        });

        const newContent = `
            <header class="poll-title">${pollData.question}</header>
            <section class="options-results">
                <ul class="options-results-list">${optionsHTML}</ul>
            </section>
            <span class="votes-quantity">${pollData.totalVotes} votes</span>
        `;
        
        poll.innerHTML = newContent;
        poll.dataset.originalContent = newContent;
    }
    
    poll.classList.remove('radio-view');
    poll.classList.add('stats-view');
};

const togglePollView = (poll) => {
    if (poll.classList.contains('stats-view')) {
        convertToRadioView(poll);
    } else {
        convertToStatsView(poll);
    }
};

const filterPolls = () => {
    const searchInput = document.querySelector('.category-container input');
    const categorySelect = document.querySelector('.category-container select');
    
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    
    const filtered = pollsData.filter(poll => {
        const matchesCategory = selectedCategory === 'Категорія' || 
                              poll.category === selectedCategory;
        const matchesSearch = poll.question.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });
    
    renderPolls(filtered);
};

const addNewPoll = () => {
    const questionInput = document.getElementById('question');
    const categorySelect = document.getElementById('category');
    const optionInputs = document.querySelectorAll('.option-input');
    
    const question = questionInput.value.trim();
    const category = categorySelect.value;
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(text => text !== '');
    
    if (!question || options.length < 2) {
        alert('Будь ласка, введіть питання та щонайменше два варіанти');
        return;
    }
    
    const newPoll = {
        id: Date.now().toString(),
        question: question,
        category: category,
        options: options.map(text => ({ text, votes: 0 })),
        totalVotes: 0
    };
    
    pollsData.push(newPoll);
    localStorage.setItem('polls', JSON.stringify(pollsData));
    renderPolls(pollsData);
    
    questionInput.value = '';
    categorySelect.value = 'Категорія';
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = `
        <li class="option">
            <input class="option-input" placeholder="Варіант 1">
        </li>
        <li class="option">
            <input class="option-input" placeholder="Варіант 2">
        </li>
        <li class="option">
            <input class="option-input" placeholder="Варіант 3">
        </li>
        <li class="option">
            <input class="option-input" placeholder="Варіант 4">
        </li>
    `;
};

const addNewOption = () => {
    const optionsList = document.getElementById('options-list');
    const newOption = document.createElement('li');
    newOption.className = 'option';
    newOption.innerHTML = `
        <input class="option-input" placeholder="Варіант ${optionsList.children.length + 1}">
    `;
    optionsList.appendChild(newOption);
    
    newOption.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const bindPollEvents = () => {
    pollContainers = document.querySelectorAll('.poll-container');
    
    pollContainers.forEach((poll) => {
        poll.addEventListener('click', (event) => {
            if (event.target.tagName === 'INPUT' && event.target.type === 'radio') {
                const pollElement = event.target.closest('.poll-container');
                const pollId = pollElement.dataset.id;
                const poll = pollsData.find(p => p.id === pollId);
                
                if (poll) {
                    const hasVoted = localStorage.getItem(`voted_${pollId}`);
                    if (hasVoted) {
                        alert('Ви вже голосували в цьому опитуванні');
                        return;
                    }
                    
                    const optionIndex = Array.from(
                        pollElement.querySelectorAll('.option-row input')
                    ).indexOf(event.target);
                    
                    if (optionIndex !== -1) {
                        poll.options[optionIndex].votes++;
                        poll.totalVotes++;
                        localStorage.setItem('polls', JSON.stringify(pollsData));
                        localStorage.setItem(`voted_${pollId}`, 'true');
                        
                        const votesElement = pollElement.querySelector('.votes-quantity');
                        if (votesElement) {
                            votesElement.textContent = `${poll.totalVotes} votes`;
                        }
                    }
                }
                return;
            }
            
            if (event.target.tagName === 'LABEL') {
                return;
            }
            
            pollContainers.forEach((anotherPoll) => {
                if (anotherPoll !== poll) {
                    anotherPoll.classList.toggle('disappear');
                    anotherPoll.classList.add('slowly');
                }
            });
            
            poll.classList.toggle('big');
            
            const pollUpper = document.querySelector('.create-poll-container');
            pollUpper.classList.toggle('disappear');
            
            poll.classList.remove('slowly');
            
            togglePollView(poll);
        });
    });
};

const initEventListeners = () => {
    openPollCreator.addEventListener('click', () => {
        pollCreator.classList.toggle('appear');
        content.classList.toggle('disappear');
        
        document.body.classList.toggle('creator-open');
    });

    closeBtn.addEventListener('click', () => {
        pollCreator.classList.remove('appear');
        content.classList.remove('disappear');
        document.body.classList.remove('creator-open');
    });

    createNewPoll.addEventListener('click', () => {
        addNewPoll();
        pollCreator.classList.remove('appear');
        content.classList.remove('disappear');
        document.body.classList.remove('creator-open');
    });

    pollCreator.addEventListener('click', (event) => {
        if (event.target === pollCreator) {
            pollCreator.classList.remove('appear');
            content.classList.remove('disappear');
            document.body.classList.remove('creator-open');
        }
    });

    document.getElementById('add-new-option').addEventListener('click', addNewOption);

    const searchInput = document.querySelector('.category-container input');
    const categorySelect = document.querySelector('.category-container select');
    searchInput.addEventListener('input', filterPolls);
    categorySelect.addEventListener('change', filterPolls);

    document.getElementById('open-report').addEventListener('click', () => {
        window.location.href = 'report.html';
    });
};

document.addEventListener('DOMContentLoaded', () => {
    loadPolls();
    initEventListeners();
    storeOriginalPollContent();
});
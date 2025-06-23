const CONFIG = {
    POLLS_URL: 'polls.json',
    DEBOUNCE_DELAY: 300,
    NOTIFICATION_TIMEOUT: 3000,
    AUTO_SAVE_DELAY: 2000 
};

const state = {
    polls: [],
    filteredPolls: [],
    currentPollId: null,
    searchCache: new Map(),
    hasUnsavedChanges: false,
    autoSaveTimeout: null
};

const elements = {
    pollsGrid: document.getElementById('pollsGrid'),
    searchInput: document.getElementById('searchInput'),
    categorySelect: document.getElementById('categorySelect'),
    voteModal: document.getElementById('voteModal'),
    voteQuestion: document.getElementById('voteQuestion'),
    voteOptions: document.getElementById('voteOptions'),
    createModal: document.getElementById('createModal'),
    questionInput: document.getElementById('questionInput'),
    categorySelectCreate: document.getElementById('categorySelectCreate'),
    notification: document.getElementById('notification'),
    optionsGroup: document.getElementById('optionsGroup')
};

// Ініціалізація додатку
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Спроба відновити дані з localStorage
        restoreFromBackup();
        
        // Якщо відновлення не вдалося, завантажуємо з JSON
        if (state.polls.length === 0) {
            await initApp();
        } else {
            // Обробляємо відновлені дані
            state.filteredPolls = [...state.polls];
            renderPolls(state.filteredPolls);
            populateCategorySelect();
            markAsSaved();
        }
        
        setupEventListeners();
    } catch (error) {
        showNotification(`Помилка ініціалізації: ${error.message}`, 'error');
    }
});

async function initApp() {
    try {
        const response = await fetch(CONFIG.POLLS_URL);
        if (!response.ok) throw new Error('Не вдалося завантажити опитування');
        
        state.polls = await response.json();
        state.filteredPolls = [...state.polls];
        
        renderPolls(state.filteredPolls);
        populateCategorySelect();
    } catch (error) {
        elements.pollsGrid.innerHTML = '<div class="no-polls">Помилка завантаження опитувань</div>';
        throw error;
    }
}

function setupEventListeners() {
    elements.searchInput.addEventListener('input', debounce(performSearch, CONFIG.DEBOUNCE_DELAY));
    elements.categorySelect.addEventListener('change', performSearch);
    
    elements.searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
    
    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    elements.pollsGrid.addEventListener('click', e => {
        const pollCard = e.target.closest('.poll-card');
        if (pollCard) {
            const pollId = parseInt(pollCard.dataset.id);
            openVoteModal(pollId);
        }
    });

    window.addEventListener('beforeunload', e => {
        if (state.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'У вас є незбережені зміни. Ви впевнені, що хочете залишити сторінку?';
        }
    });
}

function populateCategorySelect() {
    const categories = [...new Set(state.polls.map(poll => poll.category))];
    
    const firstOption = elements.categorySelect.firstElementChild;
    elements.categorySelect.innerHTML = '';
    elements.categorySelect.appendChild(firstOption);
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        elements.categorySelect.appendChild(option);
    });
}

function renderPolls(polls) {
    if (!polls.length) {
        elements.pollsGrid.innerHTML = '<div class="no-polls">Опитування не знайдено</div>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    polls.forEach(poll => {
        const pollElement = createPollElement(poll);
        fragment.appendChild(pollElement);
    });
    
    elements.pollsGrid.innerHTML = '';
    elements.pollsGrid.appendChild(fragment);
}

function createPollElement(poll) {
    const pollCard = document.createElement('div');
    pollCard.className = 'poll-card';
    pollCard.dataset.id = poll.id;
    
    const optionsHTML = poll.options.map(option => {
        const percentage = poll.totalVotes > 0 ? 
            Math.round((option.votes / poll.totalVotes) * 100) : 0;
            
        return `
            <div class="poll-option">
                <span class="option-text">${option.text}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="percentage">${percentage}%</span>
            </div>
        `;
    }).join('');
    
    pollCard.innerHTML = `
        <div class="poll-category">${poll.category}</div>
        <h3 class="poll-question">${poll.question}</h3>
        <div class="poll-options">${optionsHTML}</div>
        <div class="vote-count">${poll.totalVotes} голосів</div>
    `;
    
    return pollCard;
}

function openCreateModal() {
    resetCreateForm();
    elements.createModal.style.display = 'flex';
    elements.questionInput.focus();
}

function resetCreateForm() {
    elements.questionInput.value = '';
    elements.categorySelectCreate.selectedIndex = 0;
    
    const optionInputs = elements.optionsGroup.querySelectorAll('.option-input');
    
    if (optionInputs.length > 4) {
        for (let i = 4; i < optionInputs.length; i++) {
            optionInputs[i].remove();
        }
    }
    
    const remainingInputs = elements.optionsGroup.querySelectorAll('.option-input');
    remainingInputs.forEach((input, index) => {
        input.value = '';
        input.placeholder = `Варіант ${index + 1}`;
    });
}

function openVoteModal(pollId) {
    const poll = state.polls.find(p => p.id === pollId);
    if (!poll) return;
    
    state.currentPollId = pollId;
    elements.voteQuestion.textContent = poll.question;
    elements.voteOptions.innerHTML = '';
    
    poll.options.forEach((option, index) => {
        const optionElement = document.createElement('label');
        optionElement.className = 'vote-option';
        optionElement.innerHTML = `
            <input type="radio" name="vote" value="${option.text}" 
                   class="vote-radio" ${index === 0 ? 'checked' : ''}>
            <span class="vote-text">${option.text}</span>
        `;
        elements.voteOptions.appendChild(optionElement);
    });
    
    elements.voteModal.style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'voteModal') {
        state.currentPollId = null;
    }
}

function submitVote() {
    const selected = document.querySelector('input[name="vote"]:checked');
    if (!selected || !state.currentPollId) {
        showNotification('Будь ласка, оберіть варіант відповіді', 'error');
        return;
    }
    
    const poll = state.polls.find(p => p.id === state.currentPollId);
    if (poll) {
        const option = poll.options.find(opt => opt.text === selected.value);
        if (option) {
            option.votes++;
            poll.totalVotes++;
            markAsChanged();
            updatePollCard(poll);
            closeModal('voteModal');
            showNotification(`Ваш голос за "${selected.value}" подано!`, 'success');
        }
    }
}

function updatePollCard(poll) {
    const pollCard = elements.pollsGrid.querySelector(`.poll-card[data-id="${poll.id}"]`);
    if (!pollCard) return;
    
    const optionsContainer = pollCard.querySelector('.poll-options');
    optionsContainer.innerHTML = '';
    
    poll.options.forEach(option => {
        const percentage = poll.totalVotes > 0 ? 
            Math.round((option.votes / poll.totalVotes) * 100) : 0;
        
        const optionElement = document.createElement('div');
        optionElement.className = 'poll-option';
        optionElement.innerHTML = `
            <span class="option-text">${option.text}</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="percentage">${percentage}%</span>
        `;
        
        optionsContainer.appendChild(optionElement);
    });
    
    pollCard.querySelector('.vote-count').textContent = `${poll.totalVotes} голосів`;
}

function createPoll() {
    const question = elements.questionInput.value.trim();
    const category = elements.categorySelectCreate.value;
    const optionInputs = document.querySelectorAll('.option-input');
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');

    if (!question) {
        showNotification('Будь ласка, введіть питання', 'error');
        return;
    }

    if (!category) {
        showNotification('Будь ласка, оберіть категорію', 'error');
        return;
    }

    if (options.length < 2) {
        showNotification('Будь ласка, додайте принаймні 2 варіанти відповідей', 'error');
        return;
    }

    const newPoll = {
        id: state.polls.length > 0 ? Math.max(...state.polls.map(p => p.id)) + 1 : 1,
        question,
        category,
        options: options.map(option => ({ text: option, votes: 0 })),
        totalVotes: 0
    };
    
    state.polls.push(newPoll);
    state.filteredPolls.push(newPoll);
    markAsChanged();
    
    populateCategorySelect();
    
    performSearch();
    closeModal('createModal');
    showNotification('Опитування створено успішно!', 'success');
}

function addOption() {
    const optionCount = elements.optionsGroup.querySelectorAll('.option-input').length;
    
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'form-input option-input';
    newInput.placeholder = `Варіант ${optionCount + 1}`;
    
    elements.optionsGroup.insertBefore(newInput, elements.optionsGroup.querySelector('.add-option-btn'));
}

function performSearch() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const selectedCategory = elements.categorySelect.value;
    
    const cacheKey = `${searchTerm}-${selectedCategory}`;
    if (state.searchCache.has(cacheKey)) {
        state.filteredPolls = state.searchCache.get(cacheKey);
        renderPolls(state.filteredPolls);
        return;
    }
    
    state.filteredPolls = state.polls.filter(poll => {
        const matchesSearch = !searchTerm || 
            poll.question.toLowerCase().includes(searchTerm) ||
            poll.options.some(option => option.text.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !selectedCategory || poll.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    state.searchCache.set(cacheKey, [...state.filteredPolls]);
    renderPolls(state.filteredPolls);
}

function markAsChanged() {
    state.hasUnsavedChanges = true;
    scheduleAutoSave();
}

function markAsSaved() {
    state.hasUnsavedChanges = false;
    clearAutoSave();
}

function scheduleAutoSave() {
    clearAutoSave();
    state.autoSaveTimeout = setTimeout(() => {
        autoSave();
    }, CONFIG.AUTO_SAVE_DELAY);
}

function clearAutoSave() {
    if (state.autoSaveTimeout) {
        clearTimeout(state.autoSaveTimeout);
        state.autoSaveTimeout = null;
    }
}

function autoSave() {
    if (state.hasUnsavedChanges) {
        try {
            localStorage.setItem('pollsBackup', JSON.stringify({
                polls: state.polls,
                timestamp: new Date().toISOString()
            }));
            
            markAsSaved();
            showNotification('Зміни автоматично збережено', 'success');
            
        } catch (error) {
            showNotification('Помилка автозбереження: ' + error.message, 'error');
        }
    }
}

function restoreFromBackup() {
    try {
        const backup = localStorage.getItem('pollsBackup');
        if (backup) {
            const data = JSON.parse(backup);
            state.polls = data.polls;
            
            // Перевіряємо, чи дані не застарілі (старші 7 днів)
            const backupDate = new Date(data.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            if (backupDate < weekAgo) {
                localStorage.removeItem('pollsBackup');
                state.polls = [];
                showNotification('Резервна копія застаріла та видалена', 'error');
            } else {
                showNotification(`Відновлено дані з резервної копії (${backupDate.toLocaleString()})`, 'success');
            }
        }
    } catch (error) {
        showNotification('Помилка відновлення: ' + error.message, 'error');
    }
}

function showNotification(message, type) {
    if (!elements.notification) return;
    
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        if (elements.notification) {
            elements.notification.classList.remove('show');
        }
    }, CONFIG.NOTIFICATION_TIMEOUT);
}

// Утиліти
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
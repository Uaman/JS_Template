class PollApp {
    constructor() {
        this.polls = [];
        this.filteredPolls = [];
        this.currentCategory = '';
        this.userVotes = this.getUserVotes();
        this.init();
    }

    async init() {
        await this.loadPolls();
        this.renderPolls();
        this.attachEventListeners();
    }

    async loadPolls() {
        try {
            const response = await fetch('/data/polls.json');
            const pollsData = await response.json();

            const localPolls = this.getLocalPolls();
            this.polls = [...pollsData, ...localPolls];
            this.filteredPolls = [...this.polls];
        } catch (error) {
            console.error('Error loading polls:', error);
            this.polls = this.getLocalPolls();
            this.filteredPolls = [...this.polls];
        }
    }

    getUserVotes() {
        const votes = localStorage.getItem('pollVotes');
        return votes ? JSON.parse(votes) : {};
    }

    saveUserVotes() {
        localStorage.setItem('pollVotes', JSON.stringify(this.userVotes));
    }

    getLocalPolls() {
        const localPolls = localStorage.getItem('localPolls');
        return localPolls ? JSON.parse(localPolls) : [];
    }

    saveLocalPolls() {
        const localPolls = this.polls.filter(poll => poll.isLocal);
        localStorage.setItem('localPolls', JSON.stringify(localPolls));
    }

    renderPolls() {
        const pollGrid = document.querySelector('.poll-grid');
        pollGrid.innerHTML = '';

        this.filteredPolls.forEach((poll, index) => {
            const pollCard = this.createPollCard(poll, index);
            pollGrid.appendChild(pollCard);
        });

        this.createVotingModals();
    }

    createPollCard(poll, index) {
        const hasVoted = this.userVotes[poll.id];

        const pollCard = document.createElement('a');
        pollCard.className = 'poll-card';
        pollCard.href = `#vote-modal-${index}`;

        const optionsHtml = poll.options.map(option => {
            const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
            return `
                <div class="poll-option">
                    <span class="option-label">${option.text}</span>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                    <span class="percentage">${percentage}%</span>
                </div>
            `;
        }).join('');

        pollCard.innerHTML = `
            <div class="poll-title">${poll.question}</div>
            ${optionsHtml}
            <div class="vote-count">${poll.totalVotes} votes ${hasVoted ? '(You voted)' : ''}</div>
        `;

        return pollCard;
    }

    createVotingModals() {
        const existingModals = document.querySelectorAll('[id^="vote-modal-"]');
        existingModals.forEach(modal => modal.remove());

        this.filteredPolls.forEach((poll, index) => {
            const modal = this.createVotingModal(poll, index);
            document.body.appendChild(modal);
        });
    }

    createVotingModal(poll, index) {
        const hasVoted = this.userVotes[poll.id];

        const modal = document.createElement('div');
        modal.id = `vote-modal-${index}`;
        modal.className = 'modal';

        const optionsHtml = poll.options.map((option, optionIndex) => `
            <div class="vote-option">
                <input type="radio" id="${poll.id}_option_${optionIndex}" name="${poll.id}" value="${optionIndex}" ${hasVoted ? 'disabled' : ''} required>
                <label for="${poll.id}_option_${optionIndex}">
                    <div class="radio-button"></div>
                    ${option.text}
                </label>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content vote-modal">
                <div class="modal-header">
                    <h2>Vote</h2>
                    <a href="#" class="close-btn">&times;</a>
                </div>
                <div class="question">${poll.question}</div>
                <form class="vote-form" data-poll-id="${poll.id}">
                    <div class="vote-options">
                        ${optionsHtml}
                    </div>
                    <div class="modal-actions">
                        <a href="#" class="cancel-btn">Cancel</a>
                        <button type="submit" class="vote-btn" ${hasVoted ? 'disabled' : ''}>
                            ${hasVoted ? 'Already Voted' : 'Vote'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        return modal;
    }

    attachEventListeners() {
        const categoryDropdown = document.querySelector('.category-dropdown');
        categoryDropdown.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.filterPolls();
        });

        const searchInput = document.querySelector('.search-input');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchPolls(e.target.value);
            }, 300);
        });

        const pollForm = document.querySelector('.poll-form');
        pollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewPoll(new FormData(pollForm));
        });

        const addOptionBtn = document.querySelector('.add-option-btn');
        addOptionBtn.addEventListener('click', () => {
            this.addOptionInput();
        });

        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('vote-form')) {
                e.preventDefault();
                this.handleVote(e.target);
            }
        });
    }

    filterPolls() {
        if (this.currentCategory === '') {
            this.filteredPolls = [...this.polls];
        } else {
            this.filteredPolls = this.polls.filter(poll => poll.category === this.currentCategory);
        }
        this.renderPolls();
    }

    searchPolls(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        if (term === '') {
            this.filterPolls();
            return;
        }

        let basePolls = this.currentCategory === '' ?
            this.polls :
            this.polls.filter(poll => poll.category === this.currentCategory);

        this.filteredPolls = basePolls.filter(poll =>
            poll.question.toLowerCase().includes(term) ||
            poll.options.some(option => option.text.toLowerCase().includes(term))
        );

        this.renderPolls();
    }

    createNewPoll(formData) {
        const question = formData.get('question').trim();
        const category = formData.get('category');

        if (!question || !category) {
            alert('Please fill in all required fields');
            return;
        }

        const options = [];
        for (let i = 1; i <= 10; i++) {
            const optionText = formData.get(`option${i}`);
            if (optionText && optionText.trim()) {
                options.push({ text: optionText.trim(), votes: 0 });
            }
        }

        if (options.length < 2) {
            alert('Please provide at least 2 options');
            return;
        }

        const newPoll = {
            id: `local_poll_${Date.now()}`,
            question: question,
            category: category,
            options: options,
            totalVotes: 0,
            isLocal: true
        };

        this.polls.push(newPoll);
        this.saveLocalPolls();
        this.filterPolls();

        document.querySelector('.poll-form').reset();
        document.querySelector('.options-container').innerHTML = `
            <input type="text" class="option-input" name="option1" placeholder="Option 1" required>
            <input type="text" class="option-input" name="option2" placeholder="Option 2" required>
            <input type="text" class="option-input" name="option3" placeholder="Option 3">
            <input type="text" class="option-input" name="option4" placeholder="Option 4">
        `;

        window.location.hash = '#';

        alert('Poll created successfully!');
    }

    addOptionInput() {
        const optionsContainer = document.querySelector('.options-container');
        const currentOptions = optionsContainer.querySelectorAll('.option-input').length;

        if (currentOptions >= 10) {
            alert('Maximum 10 options allowed');
            return;
        }

        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'option-input';
        newInput.name = `option${currentOptions + 1}`;
        newInput.placeholder = `Option ${currentOptions + 1}`;

        optionsContainer.appendChild(newInput);
    }

    handleVote(form) {
        const pollId = form.dataset.pollId;
        const selectedOption = form.querySelector('input[type="radio"]:checked');

        if (!selectedOption) {
            alert('Please select an option');
            return;
        }

        if (this.userVotes[pollId]) {
            alert('You have already voted on this poll');
            return;
        }

        const optionIndex = parseInt(selectedOption.value);

        const pollIndex = this.polls.findIndex(poll => poll.id === pollId);
        if (pollIndex !== -1) {
            this.polls[pollIndex].options[optionIndex].votes++;
            this.polls[pollIndex].totalVotes++;

            this.userVotes[pollId] = optionIndex;
            this.saveUserVotes();

            if (this.polls[pollIndex].isLocal) {
                this.saveLocalPolls();
            }

            this.filterPolls();

            window.location.hash = '#';

            alert('Thank you for voting!');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PollApp();
});
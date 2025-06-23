document.addEventListener('DOMContentLoaded', () => {
    const createButton = document.querySelector('.create');
    const createPollDialog = document.querySelector('.create-poll');
    const pollsContainer = document.querySelector('.polls');
    const pollQuestionDialog = document.querySelector('.poll-question');
    const createPollFormButton = createPollDialog.querySelector('.create-f');
    const optionsContainer = createPollDialog.querySelector('.options');
    const voteButton = pollQuestionDialog.querySelector('.vote');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search');
    const categorySelect = document.querySelector('select[name="category"]');
    const addOptionLink = document.querySelector('a');

    let pollsInfo = [];

    async function loadPolls() {
            const res = await fetch('./src/polls.json');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const info = await res.json();
            pollsInfo = info; 
            showPolls(pollsInfo);
            addCategories(pollsInfo);
    }

    function showPolls(polls) {
        pollsContainer.innerHTML = '';

        polls.forEach(poll => {
            const onePoll = document.createElement('div');
            onePoll.classList.add('poll');
            onePoll.dataset.question = poll.question;

            let optionsHtml = '';
            Object.entries(poll.options).forEach(([optText, votesCount]) => {
                const percentage = poll.votes > 0 ? ((votesCount / poll.votes) * 100).toFixed(0) : 0;
                optionsHtml += `
                    <div class="poll-row">
                        <span class="name">${optText}</span>
                        <div class="whole-line">
                            <div class="filled" style="width: ${percentage}%;"></div>
                        </div>
                        <span>${percentage}%</span>
                    </div>
                `;
            });

            onePoll.innerHTML = `
                <h4>${poll.question}</h4>
                ${optionsHtml}
                <span class="votes">${poll.votes} votes</span>
            `;
            pollsContainer.appendChild(onePoll);
        });
    }

    function addCategories(pollsData) {
        const categories = new Set();
        pollsData.forEach(poll => categories.add(poll.category));

        categorySelect.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    createButton.addEventListener('click', () => {
        pollQuestionDialog.style.display = 'none';
        createPollDialog.style.display = 'grid';

        createPollDialog.querySelector('input[placeholder="Enter your question"]').value = '';
        createPollDialog.querySelector('input[placeholder="Category"]').value = '';
        optionsContainer.innerHTML = `
            <input class="input-c" type="text" placeholder="Option 1"/>
            <input class="input-c" type="text" placeholder="Option 2"/>
        `;
    });

    addOptionLink.addEventListener('click', (e) => {
        e.preventDefault();
        const optionCount = optionsContainer.children.length + 1;
        const newInput = document.createElement('input');
        newInput.classList.add('input-c');
        newInput.type = 'text';
        newInput.placeholder = `Option ${optionCount}`;
        optionsContainer.appendChild(newInput);
    });

    createPollFormButton.addEventListener('click', () => {
        const questionInput = createPollDialog.querySelector('input[placeholder="Enter your question"]');
        const categoryInput = createPollDialog.querySelector('input[placeholder="Category"]');
        const optionInputs = optionsContainer.querySelectorAll('input');

        const question = questionInput.value.trim();
        const category = categoryInput.value.trim();
        const options = {};
        let optionsCount = 0;

        optionInputs.forEach(input => {
            const optValue = input.value.trim();
            if (optValue !== '') {
                options[optValue] = 0;
                optionsCount++;
            }
        });

        if (!question || !category || optionsCount < 2) {
            alert('Please provide a question, category, and at least two valid options.');
            return;
        }

        const newPoll = {
            question: question,
            category: category,
            options: options,
            votes: 0 
        };

        pollsInfo.push(newPoll); 
        showPolls(pollsInfo); 
        addCategories(pollsInfo);
        createPollDialog.style.display = 'none'; 
    });


    let wantedPoll = null;
    pollsContainer.addEventListener('click', (event) => {
        const chosenPoll = event.target.closest('.poll');
        if (chosenPoll) {
            createPollDialog.style.display = 'none';
            pollQuestionDialog.style.display = 'grid';

            wantedPoll = chosenPoll.dataset.question;
            const poll = pollsInfo.find(p => p.question ===  wantedPoll);

            if (poll) {
                pollQuestionDialog.querySelector('h3').textContent = 'Poll Question';
                pollQuestionDialog.querySelector('span').textContent = poll.question;

                const existingLabels = pollQuestionDialog.querySelectorAll('label');
                existingLabels.forEach(label => label.remove());

                let optionsHtml = '';
                Object.entries(poll.options).forEach(([optText, optVotes], index) => {
                    optionsHtml += `
                        <label>
                            <input type="radio" name="pollOption" value="${optText}" />
                            ${optText}
                        </label>
                    `;
                });
                voteButton.insertAdjacentHTML('beforebegin', optionsHtml);
            }
        }
    });

    voteButton.addEventListener('click', () => {
        if (!wantedPoll) return;

        const selectedOptionInput = pollQuestionDialog.querySelector('input[name="pollOption"]:checked');
        if (!selectedOptionInput) {
            alert('Please select an option to vote.');
            return;
        }

        const selectedOptionText = selectedOptionInput.value;
        const pollIndex = pollsInfo.findIndex(p => p.question ===  wantedPoll);

        if (pollIndex !== -1) {
            const poll = pollsInfo[pollIndex];
            poll.options[selectedOptionText]++;
            poll.votes++;

            updateOnePoll(poll);
            pollQuestionDialog.style.display = 'none';
        }
    });

    searchButton.addEventListener('click', () => {
        filterPolls();
    });

    function filterPolls() {
        const text = searchInput.value.toLowerCase().trim();
        const selectedCategory = categorySelect.value;

        let filteredPolls = pollsInfo;

        if (selectedCategory !== 'all') {
            filteredPolls = filteredPolls.filter(poll => poll.category === selectedCategory);
        }

        if (text) {
            filteredPolls = filteredPolls.filter(poll =>
                poll.question.toLowerCase().includes(text) ||
                poll.category.toLowerCase().includes(text)
            );
        }
        showPolls(filteredPolls);
    }

    categorySelect.addEventListener('change', () => {
        filterPolls();
    });


    function updateOnePoll(poll) {
    const pollDiv = pollsContainer.querySelector(`[data-question="${poll.question}"]`);
    if (!pollDiv) return;

    let optionsHtml = '';
    Object.entries(poll.options).forEach(([optText, votesCount]) => {
        const percentage = poll.votes > 0 ? ((votesCount / poll.votes) * 100).toFixed(0) : 0;
        optionsHtml += `
            <div class="poll-row">
                <span class="name">${optText}</span>
                <div class="whole-line">
                    <div class="filled" style="width: ${percentage}%;"></div>
                </div>
                <span>${percentage}%</span>
            </div>
        `;
    });

    pollDiv.innerHTML = `
        <h4>${poll.question}</h4>
        ${optionsHtml}
        <span class="votes">${poll.votes} votes</span>
    `;
}

    loadPolls();
});
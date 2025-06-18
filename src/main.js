const storeOriginalPollContent = () => {
            const polls = document.querySelectorAll('.poll-container');
            polls.forEach(poll => {
                poll.dataset.originalContent = poll.innerHTML;
            });
        };

        const convertToRadioView = (poll) => {
            const title = poll.querySelector('.poll-title').textContent;
            const options = poll.querySelectorAll('.options-results-row label');
            
            let radioHTML = `
                <header class="poll-title">${title}</header>
                <section class="options-results">
            `;
            
            options.forEach((option, index) => {
                radioHTML += `
                    <div class="option-row">
                        <input type="radio" id="option-${index}" name="poll">
                        <label for="option-${index}">${option.textContent}</label>
                    </div>
                `;
            });
            
            poll.innerHTML = radioHTML;
            poll.classList.remove('stats-view');
            poll.classList.add('radio-view');
        };

        const convertToStatsView = (poll) => {
            poll.innerHTML = poll.dataset.originalContent;
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

        const openPollCreator = document.getElementById('open-poll-creator');
        const pollCreator = document.querySelector('.poll-creator');
        const content = document.querySelector('.content-container');
        const closeBtn = document.querySelector('.close-btn');
        const createNewPoll = document.getElementById('create-new-poll');
        const pollContainers = document.querySelectorAll('.poll-container');

        document.addEventListener('DOMContentLoaded', () => {
            storeOriginalPollContent();
        });

        openPollCreator.addEventListener('click', () => {
            pollCreator.classList.toggle('appear');
            content.classList.toggle('disappear');
        });

        closeBtn.addEventListener('click', () => {
            pollCreator.classList.remove('appear');
            content.classList.remove('disappear');
        });

        createNewPoll.addEventListener('click', () => {
            pollCreator.classList.remove('appear');
            content.classList.remove('disappear');
        });

        pollCreator.addEventListener('click', (event) => {
            if (event.target === pollCreator) {
                pollCreator.classList.remove('appear');
                content.classList.remove('disappear');
            }
        });

        pollContainers.forEach((poll) => {
            poll.addEventListener('click', (event) => {
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'LABEL') {
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
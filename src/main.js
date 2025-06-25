document.getElementById('createPoll').addEventListener('click', () => {
  document.getElementById('createPollModal').style.display = 'flex';
  const baseOptions = document.querySelectorAll('.pollOption');
  baseOptions.forEach((input, index) => {
    if (index < 4) {
      input.value = '';
    } else {
      input.remove();
    }
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});


// Завантаження опитування з json
fetch('./src/polls.json')
  .then(response => response.json())
  .then(data => {
    const pollsContainer = document.querySelector('.polls');
    pollsContainer.innerHTML = ''; 

    const select = document.querySelector('.category');
    const uniqueCategories = new Set();

    data.forEach(poll => {
      const pollEl = document.createElement('div');
      pollEl.classList.add('poll-container');

      if (poll.category) {
        pollEl.setAttribute('data-category', poll.category);
        uniqueCategories.add(poll.category); 
      }

      const questionHTML = `<div class="question">${poll.question}</div>`;

      const optionsHTML = poll.options.map(opt => {
        const votesCount = Math.round(poll.votes * (opt.percent / 100));
        return `
          <div class="option" data-votes="${votesCount}">
            <div class="option-main">${opt.text}</div>
            <div class="option-bar-wrapper">
              <div class="option-bar" style="width: ${opt.percent}%;"></div>
            </div>
            <div class="option-percent">${opt.percent}%</div>
          </div>
        `;
      }).join('');

      const votesHTML = `<div class="votes">${poll.votes} votes</div>`;

      pollEl.innerHTML = questionHTML + optionsHTML + votesHTML;

      pollEl.addEventListener('click', () => openVoteModal(pollEl));

      pollsContainer.appendChild(pollEl);
    });

    uniqueCategories.forEach(cat => {
      const option = document.createElement('option');
      option.textContent = cat;
      option.value = cat;
      select.appendChild(option);
    });
  });

// Створення нового опитування
  document.getElementById('submitPoll').addEventListener('click', () => {
  const question = document.getElementById('pollQuestion').value.trim();
  const category = document.getElementById('pollCategory').value.trim();

  const options = Array.from(document.querySelectorAll('.pollOption'))
    .map(input => input.value.trim())
    .filter(opt => opt !== '');

  if (question === '' || options.length < 2) {
    alert('Заповніть запитання та мінімум 2 варіанти!');
    return;
  }

  const pollContainer = document.createElement('div');
  pollContainer.className = 'poll-container';
  pollContainer.setAttribute('data-category', category); 

  const questionHTML = `<div class="question">${question}</div>`;

  const optionsHTML = options.map(opt => `
    <div class="option">
      <div class="option-main">${opt}</div>
      <div class="option-bar-wrapper">
        <div class="option-bar" style="width: 0%;"></div>
      </div>
      <div class="option-percent">0%</div>
    </div>
  `).join('');

  const votesHTML = `<div class="votes">0 votes</div>`;

  pollContainer.innerHTML = questionHTML + optionsHTML + votesHTML;

  document.querySelector('.polls').prepend(pollContainer);

  document.getElementById('pollQuestion').value = '';
  document.getElementById('pollCategory').value = '';
  document.querySelectorAll('.pollOption').forEach(input => input.value = '');

  document.getElementById('createPollModal').style.display = 'none';
  addCategoryOption(category);
  pollContainer.addEventListener('click', () => openVoteModal(pollContainer));
});

// Додавання нового варіанта до опитування
document.getElementById('addOption').addEventListener('click', (e) => {
  e.preventDefault();

  const optionInputs = document.querySelectorAll('.pollOption');

  const newOptionNumber = optionInputs.length + 1;

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.className = 'pollOption';
  newInput.placeholder = `Варіант ${newOptionNumber}`;

  const addOptionLink = document.getElementById('addOption');
  addOptionLink.parentNode.insertBefore(newInput, addOptionLink);
});

// Пошук за категоріями
document.querySelector('.category').addEventListener('change', function () {
  const selectedCategory = this.value;
  const polls = document.querySelectorAll('.poll-container');

  polls.forEach(poll => {
    if (selectedCategory === 'Категорія' || poll.dataset.category === selectedCategory) {
      poll.style.display = 'block';
    } else {
      poll.style.display = 'none';
    }
  });
});

// Додавання нової категорії
function addCategoryOption(category) {
  const select = document.querySelector('.category');
  const options = Array.from(select.options).map(opt => opt.value);
  if (!options.includes(category)) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  }
}

let currentPoll = null;

// Голосування — натиснути кнопку "Проголосувати"
document.querySelector('#votePollModal button').addEventListener('click', () => {
  if (!currentPoll) return alert('Опитування не вибране.');

  const selectedOption = document.querySelector('input[name="voteOption"]:checked');
  if (!selectedOption) {
    alert('Будь ласка, виберіть варіант для голосування.');
    return;
  }

  const optionIndex = Number(selectedOption.value);
  const optionEls = currentPoll.querySelectorAll('.option');
  const votesEl = currentPoll.querySelector('.votes');

  let totalVotesBefore = parseInt(votesEl.textContent) || 0;
  if (totalVotesBefore === 0) {
    optionEls.forEach(optEl => {
      const percent = parseInt(optEl.querySelector('.option-percent').textContent) || 0;
      const votes = Math.round((percent / 100) * 100); // груба оцінка
      optEl.dataset.votes = votes;
    });
  }

  const currentVotes = Number(optionEls[optionIndex].dataset.votes || 0);
  optionEls[optionIndex].dataset.votes = currentVotes + 1;

  let totalVotes = 0;
  optionEls.forEach(optEl => {
    totalVotes += Number(optEl.dataset.votes);
  });

  optionEls.forEach(optEl => {
    const votes = Number(optEl.dataset.votes);
    const percent = Math.round((votes / totalVotes) * 100);
    optEl.querySelector('.option-percent').textContent = percent + '%';
    optEl.querySelector('.option-bar').style.width = percent + '%';
  });

  votesEl.textContent = totalVotes + ' votes';

  document.getElementById('votePollModal').style.display = 'none';
});

// Відкриття вікна для голосування
function openVoteModal(pollEl) {
  currentPoll = pollEl;

  const questionText = pollEl.querySelector('.question').textContent;
  document.getElementById('voteQuestion').textContent = questionText;

  const optionsContainer = document.getElementById('voteOptionsContainer');
  optionsContainer.innerHTML = '';

  const optionElements = pollEl.querySelectorAll('.option-main');
  optionElements.forEach((optEl, idx) => {
    const label = document.createElement('label');
    label.style.display = 'block';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'voteOption';
    radio.value = idx;

    label.appendChild(radio);
    label.appendChild(document.createTextNode(' ' + optEl.textContent));

    optionsContainer.appendChild(label);
  });

  document.getElementById('votePollModal').style.display = 'flex';
}

// Пошук опитувань за словами
document.getElementById('searchInput').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const polls = document.querySelectorAll('.poll-container');

  polls.forEach(poll => {
    const question = poll.querySelector('.question').textContent.toLowerCase();

    const options = Array.from(poll.querySelectorAll('.option-main'))
      .map(opt => opt.textContent.toLowerCase());

    const matchInQuestion = question.includes(query);
    const matchInOptions = options.some(opt => opt.includes(query));

    if (matchInQuestion || matchInOptions) {
      poll.style.display = 'block';
    } else {
      poll.style.display = 'none';
    }
  });
});
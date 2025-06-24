clearCreateForm()
const STORAGE_KEY = 'pollsData';
let polls = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let voteIndex = null;

const pollsContainer = document.getElementById('polls');
const modalCreate = document.getElementById('modal-create');
const modalVote = document.getElementById('modal-vote');

function savePolls() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
}

function open(elem) { elem.style.display = 'flex'; }
function close(elem) { elem.style.display = 'none'; }

function renderPolls() {
  const search = document.getElementById('search').value.toLowerCase();
  const categoryFilter = document.getElementById('category').value;
  pollsContainer.innerHTML = '';

  polls.forEach((p, i) => {
    if (!p.question.toLowerCase().includes(search)) return;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return;

    const card = document.createElement('div'); card.className = 'poll-card';
    const title = document.createElement('div'); title.className = 'poll-title'; title.textContent = p.question;
    card.appendChild(title);

    const total = p.options.reduce((sum, o) => sum + o.count, 0) || 1;
    p.options.forEach(o => {
      const optEl = document.createElement('div'); optEl.className = 'option';
      const label = document.createElement('div'); label.textContent = o.text;
      const barCont = document.createElement('div'); barCont.className = 'bar-container';
      const bar = document.createElement('div'); bar.className = 'bar';
      const pct = Math.round(o.count / total * 100);
      bar.style.width = pct + '%';
      barCont.appendChild(bar);
      const percent = document.createElement('div'); percent.className = 'option-percent'; percent.textContent = pct + '%';
      optEl.append(label, barCont, percent);
      card.appendChild(optEl);
    });

    const footer = document.createElement('div'); footer.className = 'poll-footer';
    const count = document.createElement('div'); count.textContent = p.options.reduce((s, o) => s + o.count, 0) + ' votes';
    const btn = document.createElement('button'); btn.className = 'btn-vote'; btn.textContent = 'Vote';
    btn.onclick = () => openVote(i);
    footer.append(count, btn);
    card.appendChild(footer);

    pollsContainer.appendChild(card);
  });
}

document.getElementById('open-create').onclick = () => open(modalCreate);
document.getElementById('close-create').onclick = () => {
  close(modalCreate);
  clearCreateForm();
};

document.getElementById('add-option').onclick = () => {
  const container = document.getElementById('option-fields');
  const idx = container.children.length + 1;
  const div = document.createElement('div'); div.className = 'option-field';
  const inp = document.createElement('input'); inp.placeholder = 'Option ' + idx;
  div.appendChild(inp); container.appendChild(div);
};

document.getElementById('submit-poll').onclick = () => {
  const q = document.getElementById('poll-question').value.trim();
  const cat = document.getElementById('poll-category').value;
  const optsEls = Array.from(document.querySelectorAll('#option-fields input'));
  const opts = optsEls.map(i => i.value.trim()).filter(v => v);
  if (!q || opts.length < 2) return;
  polls.push({ question: q, options: opts.map(t => ({ text: t, count: 0 })), category: cat });
  savePolls();
  renderPolls();
  close(modalCreate);
  clearCreateForm();
};

function clearCreateForm() {
  document.getElementById('poll-question').value = '';
  document.getElementById('poll-category').value = 'general';
  const container = document.getElementById('option-fields');
  container.innerHTML =
    '<div class="option-field"><input placeholder="Option 1" class="input"/></div>' +
    '<div class="option-field"><input placeholder="Option 2" class="input"/></div>';
}

function openVote(i) {
  voteIndex = i;
  const p = polls[i];
  document.getElementById('vote-title').textContent = p.question;
  const form = document.getElementById('vote-form'); form.innerHTML = '';
  p.options.forEach((o, idx) => {
    const label = document.createElement('label'); label.classList.add("radio-vote");
    const inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'vote'; inp.value = idx;
    label.appendChild(inp);
    label.appendChild(document.createTextNode(' ' + o.text));
    form.appendChild(label);
  });
  open(modalVote);
}

document.getElementById('close-vote').onclick = () => close(modalVote);
document.getElementById('submit-vote').onclick = () => {
  const sel = document.querySelector('#vote-form input[name=vote]:checked');
  if (!sel) return;
  polls[voteIndex].options[+sel.value].count++;
  savePolls();
  renderPolls();
  close(modalVote);
};

document.getElementById('search').oninput = renderPolls;
document.getElementById('category').onchange = renderPolls;

renderPolls();
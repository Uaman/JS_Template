let polls = [];

fetch("./src/polls.json")
  .then(response => response.json())
  .then(data => {
    polls = data;
    renderPolls();
  })
  .catch(error => console.error("Error loading JSON:", error));

function totalVotes(poll) {
  return poll.options.reduce((acc, option) => acc + option.votes, 0);
}


function renderPolls(filterText = "", filterCategory = "") {
  const container = document.querySelector("body");
  document.querySelectorAll(".poll-card").forEach(el => el.remove());

  let filtered = polls.filter(poll => {
    const matchText = poll.question.toLowerCase().includes(filterText.toLowerCase());
    const matchCategory = filterCategory === "" || poll.category === filterCategory;
    return matchText && matchCategory;
  });

  filtered.forEach(poll => {
    const pollDiv = document.createElement("div");
    pollDiv.className = "poll-card";
    pollDiv.style.cursor = "pointer";
    pollDiv.dataset.pollId = poll.id;

    const questionDiv = document.createElement("div");
    questionDiv.className = "poll-question";
    questionDiv.textContent = poll.question;
    pollDiv.appendChild(questionDiv);

    const total = totalVotes(poll);
    poll.options.forEach(option => {
      const optionDiv = document.createElement("div");
      optionDiv.className = "poll-option";

      const spanText = document.createElement("span");
      spanText.textContent = option.text;
      optionDiv.appendChild(spanText);

      const barContainer = document.createElement("div");
      barContainer.className = "poll-bar-container";

      const bar = document.createElement("div");
      bar.className = "poll-bar";
      const widthPercent = total > 0 ? (option.votes / total) * 100 : 0;
      bar.style.width = widthPercent + "%";

      barContainer.appendChild(bar);
      optionDiv.appendChild(barContainer);

      const spanPercent = document.createElement("span");
      spanPercent.textContent = Math.round(widthPercent) + "%";
      optionDiv.appendChild(spanPercent);

      pollDiv.appendChild(optionDiv);
    });

    const votesDiv = document.createElement("div");
    votesDiv.className = "poll-votes";
    votesDiv.textContent = `${total} votes`;
    pollDiv.appendChild(votesDiv);
    container.appendChild(pollDiv);
    pollDiv.addEventListener("click", () => openVoteModal(poll.id));
  });
}

function openVoteModal(pollId) {
  const voteModal = document.getElementById("modal");
  voteModal.style.display = "flex";

  const poll = polls.find(p => p.id === pollId);
  const form = voteModal.querySelector("form");
  form.innerHTML = "";

  poll.options.forEach((option, idx) => {
    const label = document.createElement("label");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "voteOption";
    input.value = idx;

    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + option.text));
    form.appendChild(label);
  });

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Submit Vote";
  form.appendChild(submitBtn);

  form.onsubmit = function (e) {
    e.preventDefault();
    const selected = form.querySelector('input[name="voteOption"]:checked');
    if (!selected) return alert("Choose option");
    const idx = Number(selected.value);
    poll.options[idx].votes++;
    voteModal.style.display = "none";
    renderPolls();
  };
}

document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

document.querySelector(".search-bar input").addEventListener("input", function () {
  renderPolls(this.value, document.querySelector(".search-bar select").value);
});

document.querySelector(".search-bar select").addEventListener("change", function () {
  renderPolls(document.querySelector(".search-bar input").value, this.value);
});
document.querySelector(".create-btn").addEventListener("click", () => {
  document.getElementById("create-modal").style.display = "flex";
});

document.querySelector(".close-create").addEventListener("click", () => {
  document.getElementById("create-modal").style.display = "none";
});

document.getElementById("add-option").addEventListener("click", (e) => {
  e.preventDefault();
  const container = document.getElementById("options-container");
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Option " + (container.children.length + 1);
  container.appendChild(input);
});

document.getElementById("create-poll-btn").addEventListener("click", () => {
  const question = document.getElementById("poll-question").value.trim();
  const inputs = document.querySelectorAll("#options-container input");
  const options = Array.from(inputs)
    .map(input => input.value.trim())
    .filter(text => text !== "")
    .map(text => ({ text, votes: 0 }));

  if (!question || options.length < 2) {
    alert("Enter a question and at least 2 options.");
    return;
  }

  polls.push({
    id: Date.now(),
    question,
    category: "custom",
    options
  });

  document.getElementById("create-modal").style.display = "none";
  renderPolls();
});
window.addEventListener("DOMContentLoaded", () => {
  renderPolls();
});

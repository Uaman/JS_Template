document.addEventListener("DOMContentLoaded", function () {
    const polls = [];
    const docContainer = document.querySelector(".container");
    const createBtn = document.querySelector(".create-form-btn");
    const questionInput = document.querySelector(".question-input");
    const optionInputs = document.querySelectorAll(".option-input");
    const categorySelect = document.querySelector(".category-select");

    fetch("polls.json")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load polls.");
            return response.json();
        })
        .then(data => {
            const categories = new Set();

            data.forEach(poll => {
                polls.push(poll);
                categories.add(poll.category);
            });

            // Populate dropdown
            categories.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat;
                option.innerText = cat;
                categorySelect.appendChild(option);
            });

            renderPolls(polls);
        })
        .catch(error => console.error("Error loading polls:", error));

    categorySelect.addEventListener("change", function () {
        const selected = categorySelect.value;
        const filtered = selected === "Category"
            ? polls
            : polls.filter(p => p.category === selected);

        clearRenderedPolls();
        renderPolls(filtered);
    });

    createBtn.addEventListener("click", function (event) {
        event.preventDefault();

        const question = questionInput.value.trim();
        const options = [];

        optionInputs.forEach(input => {
            const val = input.value.trim();
            if (val !== "") options.push({ text: val, votes: 0 });
        });

        const category = categorySelect.value;

        if (question === "" || options.length < 2) {
            alert("Please enter a question, select a category, and at least two options.");
            return;
        }

        const newPoll = {
            question: question,
            options: options,
            category: category
        };

        polls.push(newPoll);
        renderPoll(newPoll);

        questionInput.value = "";
        optionInputs.forEach(input => input.value = "");
        categorySelect.value = "Other";

        document.getElementById("poll-toggle").checked = false;
    });


    function clearRenderedPolls() {
        const oldPolls = document.querySelectorAll(".vote-container");
        oldPolls.forEach(p => p.remove());
    }

    function renderPolls(pollsToRender) {
        pollsToRender.forEach(poll => renderPoll(poll));
    }

    function renderPoll(poll) {
        const pollContainerNew = document.createElement("div");
        pollContainerNew.className = "vote-container";

        const pollBox = document.createElement("div");
        pollBox.className = "vote-box";

        const questionLabel = document.createElement("label");
        questionLabel.className = "poll-question";
        questionLabel.innerText = "Poll Question";

        const questionText = document.createElement("p");
        questionText.className = "question";
        questionText.innerText = poll.question;

        const form = document.createElement("form");

        poll.options.forEach((opt, idx) => {
            const label = document.createElement("label");
            label.className = "option";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = poll.question;
            input.className = "vote-option-radio";
            input.value = idx; // use index to track selection
            if (idx === 0) input.checked = true;

            const optionLabel = document.createElement("label");
            optionLabel.className = "vote-option";
            optionLabel.innerText = opt.text;

            label.appendChild(input);
            label.appendChild(optionLabel);
            form.appendChild(label);
        });

        const voteBtn = document.createElement("button");
        voteBtn.type = "submit";
        voteBtn.className = "vote-btn";
        voteBtn.innerText = "Vote";

        voteBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const selected = form.querySelector("input[type='radio']:checked");
            if (!selected) return;

            const selectedIndex = parseInt(selected.value);
            poll.options[selectedIndex].votes++;

            pollContainerNew.innerHTML = "";
            renderResults(poll, pollContainerNew);
        });

        form.appendChild(voteBtn);
        pollBox.appendChild(questionLabel);
        pollBox.appendChild(questionText);
        pollBox.appendChild(form);
        pollContainerNew.appendChild(pollBox);
        docContainer.appendChild(pollContainerNew);
    }


    function renderResults(poll, container) {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

        const resultBox = document.createElement("div");
        resultBox.className = "poll";

        const questionLabel = document.createElement("label");
        questionLabel.className = "poll-result-question";
        questionLabel.innerText = poll.question;
        resultBox.appendChild(questionLabel);

        poll.options.forEach(opt => {
            const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

            const optionDiv = document.createElement("div");
            optionDiv.className = "option";

            const textSpan = document.createElement("span");
            textSpan.className = "answer-option";
            textSpan.innerText = opt.text;

            const barContainer = document.createElement("div");
            barContainer.className = "bar-container";

            const bar = document.createElement("div");
            bar.className = "bar";
            bar.style.width = percent + "%";

            const percentSpan = document.createElement("span");
            percentSpan.className = "percent";
            percentSpan.innerText = percent + "%";

            barContainer.appendChild(bar);
            optionDiv.appendChild(textSpan);
            optionDiv.appendChild(barContainer);
            optionDiv.appendChild(percentSpan);
            resultBox.appendChild(optionDiv);
        });

        const votesText = document.createElement("div");
        votesText.className = "votes";
        votesText.innerText = totalVotes + " votes";
        resultBox.appendChild(votesText);

        container.appendChild(resultBox);
    }
});
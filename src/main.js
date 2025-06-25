const taskList = document.querySelector(".task-list");
const sortSelect = document.getElementById("sort-select");
const addButton = document.getElementById("add-button");
const taskPopUp = document.getElementById("taskPopUp");
const closePopUpBtn = document.getElementById("closePopUpBtn");
const cancelPopUpBtn = document.getElementById("cancelPopUpBtn");
const addTaskBtn = document.querySelector(".add-task-btn");
const filterSelectSpan = document.getElementById("filterSelect");
const filterByDatePopup = document.getElementById("filterByDate");
const filterByDateSelect = document.querySelector(".filterByDate-select");
const filterByDateInput = document.querySelector(".filterByDate-date");
const applyFilterBtn = document.getElementById("apply-button");
const defaultFilterBtn = document.getElementById("default-button");
const taskTitlePlaceholder = document.getElementById("taskTitlePlaceholder");

let tasks = []; // список всіх задач
let editingTask = null; // якщо щось редагую зараз — зберігаю
let currentFilter = { type: "All", date: null }; // що фільтрується
let currentSort = "none"; // як сортуємо

fetch("../tasks.json")
  .then((res) => res.json())
  .then((data) => {
    tasks = data;
    renderTasksWithFilters();
  })
  .catch((err) => {
    console.error("Помилка завантаження tasks.json:", err);
  });

// -------- Попап відкриття (додавання) --------
addButton.addEventListener("click", () => {
  const nameInput = taskPopUp.querySelector('input[type="text"]');
  if (taskTitlePlaceholder.value.trim()) {
    nameInput.placeholder = "";
    nameInput.value = taskTitlePlaceholder.value.trim();
  } else {
    nameInput.value = "";
    nameInput.placeholder = "Назва завдання";
  }

  const dateInput = taskPopUp.querySelector('input[type="date"]');
  const priorityInputs = taskPopUp.querySelectorAll('input[name="priority"]');

  dateInput.value = "";
  priorityInputs[1].checked = true;

  editingTask = null;
  taskPopUp.querySelector("h2").textContent = "Додати завдання";
  addTaskBtn.textContent = "Додати";

  taskPopUp.classList.remove("hidden");
});

// -------- Закриття попапу --------
closePopUpBtn.addEventListener("click", () => {
  editingTask = null;
  taskPopUp.classList.add("hidden");
  taskTitlePlaceholder.value = "";
});

cancelPopUpBtn.addEventListener("click", () => {
  editingTask = null;
  taskPopUp.classList.add("hidden");
  taskTitlePlaceholder.value = "";
});

// -------- Збереження (додати або редагувати) --------
addTaskBtn.addEventListener("click", () => {
  const nameInput = taskPopUp.querySelector('input[type="text"]');
  const dateInput = taskPopUp.querySelector('input[type="date"]');
  const priorityInputs = taskPopUp.querySelectorAll('input[name="priority"]');

  const title = nameInput.value.trim();
  const date = dateInput.value.trim();

  let priority = "medium";
  priorityInputs.forEach((input, index) => {
    if (input.checked) {
      if (index === 0) priority = "high";
      else if (index === 1) priority = "medium";
      else if (index === 2) priority = "low";
    }
  });

  if (!title || !date) return;

  if (editingTask) {
    editingTask.title = title;
    editingTask.date = date;
    editingTask.priority = priority;
  } else {
    tasks.push({ title, date, priority, completed: false });
  }

  editingTask = null;
  nameInput.value = "";
  dateInput.value = "";
  priorityInputs[1].checked = true;
  taskPopUp.classList.add("hidden");

  

  renderTasksWithFilters();
});

// ----------- Редагування кнопка -----------
function addEditButtonListener(editBtn, task) {
  editBtn.addEventListener("click", () => {
    editingTask = task;

    const nameInput = taskPopUp.querySelector('input[type="text"]');
    const dateInput = taskPopUp.querySelector('input[type="date"]');
    const priorityInputs = taskPopUp.querySelectorAll('input[name="priority"]');

    nameInput.value = task.title;
    dateInput.value = task.date;
    priorityInputs[0].checked = task.priority === "high";
    priorityInputs[1].checked = task.priority === "medium";
    priorityInputs[2].checked = task.priority === "low";

    taskPopUp.querySelector("h2").textContent = "Редагувати завдання";
    addTaskBtn.textContent = "Зберегти";

    taskPopUp.classList.remove("hidden");
  });
}

// ---------- Сортування ----------
sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  renderTasksWithFilters();
});

// ---------- Фільтр відкриття ----------
filterSelectSpan.addEventListener("click", () => {
  filterByDatePopup.classList.remove("hidden");
});

// ---------- Застосувати фільтр ----------
applyFilterBtn.addEventListener("click", () => {
  const type = filterByDateSelect.value;
  const dateStr = filterByDateInput.value;

  if (!dateStr) return alert("Вибери дату для фільтрації");

  currentFilter.type = type;
  currentFilter.date = dateStr;

  filterSelectSpan.textContent = `Filter: ${type} ${dateStr}`;
  filterByDatePopup.classList.add("hidden");

  renderTasksWithFilters();
});

// ---------- Скидання фільтра ----------
defaultFilterBtn.addEventListener("click", () => {
  currentFilter = { type: "All", date: null };
  filterSelectSpan.textContent = "All";
  filterByDatePopup.classList.add("hidden");
  renderTasksWithFilters();
});

// ------- Основний рендер з фільтрами + сортуванням + completed вниз -------
function renderTasksWithFilters() {
  let result = [...tasks];

  if (currentFilter.date) {
    const filterDate = new Date(currentFilter.date);
    result = result.filter((task) => {
      const taskDate = new Date(task.date);
      if (currentFilter.type === "Current") {
        return (
          taskDate.getFullYear() === filterDate.getFullYear() &&
          taskDate.getMonth() === filterDate.getMonth() &&
          taskDate.getDate() === filterDate.getDate()
        );
      } else if (currentFilter.type === "Past") {
        return taskDate < filterDate;
      } else if (currentFilter.type === "Upcoming") {
        return taskDate > filterDate;
      }
      return true;
    });
  }

  if (currentSort === "date-asc") {
    result.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (currentSort === "date-desc") {
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (currentSort === "priority") {
    const order = { high: 1, medium: 2, low: 3 };
    result.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  result.sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  renderTasks(result);
}

// ---------- Рендер задач ----------
function renderTasks(tasksArray) {
  taskList.innerHTML = "";
  tasksArray.forEach((task) => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });
}

// ---------- Створення елементу задачі ----------
function createTaskElement(task) {
  const taskDiv = document.createElement("div");
  taskDiv.className = `task${task.completed ? " completed" : ""}`;

  const checkboxBtn = document.createElement("button");
  checkboxBtn.className = `checkbox-btn${task.completed ? " checked" : ""}`;
  checkboxBtn.addEventListener("click", () => {
    task.completed = !task.completed;
    renderTasksWithFilters();
  });

  const taskInfo = document.createElement("div");
  taskInfo.className = "task-info";

  const titleSpan = document.createElement("span");
  titleSpan.className = "task-title";
  titleSpan.textContent = task.title;

  const prioritySpan = document.createElement("span");
  prioritySpan.className = `priority ${task.priority}`;
  prioritySpan.textContent = task.priority;

  taskInfo.appendChild(titleSpan);
  taskInfo.appendChild(prioritySpan);

  const rightSide = document.createElement("div");
  rightSide.className = "right-side";

  const dateSpan = document.createElement("span");
  dateSpan.className = "date";
  dateSpan.textContent = new Date(task.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "🖉";
  addEditButtonListener(editBtn, task);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "🗑️";
  deleteBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => t !== task);
    renderTasksWithFilters();
  });

  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);

  rightSide.appendChild(dateSpan);
  rightSide.appendChild(actionsDiv);

  taskDiv.appendChild(checkboxBtn);
  taskDiv.appendChild(taskInfo);
  taskDiv.appendChild(rightSide);

  return taskDiv;
}
renderTasksWithFilters(); // початковий рендер
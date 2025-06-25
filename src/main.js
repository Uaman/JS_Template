const taskList = document.querySelector('.task-list');
const taskForm = document.querySelector('.task-form');
const addTaskButton = document.querySelector('.add-button');
const cancelTaskButton = document.querySelector('.cancel-button');
const cancelImageButton = document.querySelector('.cancel-image-button');
const taskNameInput = document.querySelector('#task-name');
const taskDateInput = document.querySelector('#task-date');
const priorityInputs = document.querySelectorAll('input[name="priority"]');

const filterButton = document.querySelector('.filter-button');
const filterContainer = document.querySelector('.filter-container');
const applyFilterButton = document.querySelector('#apply-filter');
const dateFilterSelect = document.querySelector('.date-filter');
const filterDateInput = document.querySelector('#filter-date-pick');
const customDatePicker = document.querySelector('.custom-date-picker');

let currentFilter = 'all'; // all, current, last, next
let selectedFilterDate = ''; // 'YYYY-MM-DD'
let currentSort = 'none'; // none, date, priority

let taskToEdit = null;
let elementToEdit = null;

let tasks = [];

const tasksFromLocalStorage = localStorage.getItem('tasks');

if (tasksFromLocalStorage) {
  tasks = JSON.parse(tasksFromLocalStorage);
  renderTasks(tasks);
} else {
  fetch('./task.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Помилка завантаження task.json: ' + response.status);
      }
      return response.json();
    })
    .then((json) => {
        tasks = json.map((task, index) => ({ ...task, taskIndex: Date.now() + index }));
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks(tasks);
    })
    .catch((error) => {
      console.error('Сталася помилка при завантаженні завдань:', error);
    });
}

document.querySelector('.add-form-button').addEventListener('click', showTaskForm); // Відриває форму

// Показує форму для додавання/редагування задачі
function showTaskForm() {
    taskForm.style.display = 'flex';
    document.querySelector('.to-do-container').classList.add('disabled');
}

// Приховує форму для додавання/редагування задачі
function hideTaskForm() {
    taskForm.style.display = 'none';
    taskForm.reset();
    taskToEdit = null;
    elementToEdit = null;
    document.querySelector('.to-do-container').classList.remove('disabled');
}

// Відображає список задач
function renderTasks(taskArray) {
    taskList.innerHTML = '';

    taskArray.forEach((task) => {
        const taskElement = generateTask(task);
        taskList.appendChild(taskElement);
    });
}

// При натисканні кнопки приховує форму для додавання/редагування задачі
[cancelTaskButton, cancelImageButton].forEach(button => {
    button.addEventListener('click', (e) => {
        hideTaskForm();
    });
});

//Слухач зміни сортування задач
document.querySelector('#sort-by').addEventListener('change', (e) => {
    currentSort = e.target.value;
    updateTasksView();
});

// Показує контейнер для фільтрації задач
filterButton.addEventListener('click', () => {
    filterContainer.style.display = 'flex';
    document.querySelector('.to-do-container').classList.add('disabled');
});

// Застосовує фільтр задач
applyFilterButton.addEventListener('click', () => {
    currentFilter = dateFilterSelect.value; //all, current, last, next
    selectedFilterDate = filterDateInput.value; // 'YYYY-MM-DD'
    updateTasksView();
    filterContainer.style.display = 'none';
    document.querySelector('.to-do-container').classList.remove('disabled');
});

//Оновлює список задач після застосування фільтру або сортування
function updateTasksView() {
    const filtered = filterTasks(tasks);
    const sorted = sortTasks(filtered);
    renderTasks(sorted);
}

// Сортує задачі за обраним критерієм
function sortTasks(taskArray) {
    if (currentSort === 'none') return taskArray;
    const sorted = [...taskArray];

    if (currentSort === 'date') {
        sorted.sort((task1, task2) => new Date(task2.date) - new Date(task1.date));
    } else if (currentSort === 'priority') {
        const order = { high: 1, medium: 2, low: 3 };
        sorted.sort((task1, task2) => order[task1.priority] - order[task2.priority]);
    }
    return sorted;
}

// Слухач зміни вибору дати фільтру
dateFilterSelect.addEventListener('change', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDayCurrent = new Date(year, month, 1);
    const lastDayCurrent = new Date(year, month + 1, 0);

    const lastDayLast = new Date(year, month, 0);
    const firstDayNext = new Date(year, month + 1, 1);

    const valueNext = new Date(year, month + 1, today.getDate())
    const valueLast = new Date(year, month - 1, today.getDate());

    const selected = dateFilterSelect.value;

    if (selected === 'current') {
        filterDateInput.min = formatDate(firstDayCurrent);
        filterDateInput.max = formatDate(lastDayCurrent);
        filterDateInput.value = formatDate(today);
        customDatePicker.style.display = 'flex';
    } else if (selected === 'last') {
        filterDateInput.min = '';
        filterDateInput.max = formatDate(lastDayLast);
        filterDateInput.value = formatDate(valueLast);
        customDatePicker.style.display = 'flex';
    } else if (selected === 'next') {
        filterDateInput.min = formatDate(firstDayNext);
        filterDateInput.max = '';
        filterDateInput.value = formatDate(valueNext);
        customDatePicker.style.display = 'flex';
    } else {
        filterDateInput.min = '';
        filterDateInput.max = '';
        filterDateInput.value = '';
        customDatePicker.style.display = 'none';
    }
});

// Форматує дату у формат YYYY-MM-DD
function formatDate(date) {
    const yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();

    if (mm < 10) {
        mm = '0' + mm;
    }

    if (dd < 10) {
        dd = '0' + dd;
    }

    return yyyy + '-' + mm + '-' + dd;
}

// Фільтрує задачі за обраним критерієм
function filterTasks(taskArray) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const selectedDay = new Date(selectedFilterDate);
    const first = new Date(year, month, 1); // Перший день поточного місяця
    const last = new Date(year, month + 1, 0); // Останній день поточного місяця

    if (currentFilter === 'all') return taskArray;

    if (currentFilter === 'current') {
        if (!selectedFilterDate) {
            return taskArray.filter(task => {
                const day = new Date(task.date);
                return day >= first && day <= last;
        });
        
        } else {
                return taskArray.filter(task => new Date(task.date).toDateString() === selectedDay.toDateString());
            }

    } else if (currentFilter === 'last') {
        if(!selectedFilterDate) {
            return taskArray.filter(task => {
                const d = new Date(task.date);
                return d < first;
        });

        } else {
                return taskArray.filter(task => new Date(task.date).toDateString() === selectedDay.toDateString());
            }

    } else if (currentFilter === 'next') {
        if(!selectedFilterDate) {
            return taskArray.filter(task => {
                const d = new Date(task.date);
                return d > last;
        });

        } else {
                return taskArray.filter(task => new Date(task.date).toDateString() === selectedDay.toDateString());
            }
    }
    return taskArray;
}

// Слухач події відправки форми для додавання/редагування задачі
taskForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = taskNameInput.value.trim();
    const date = taskDateInput.value;
    const priority = Array.from(priorityInputs).find(input => input.checked)?.value;

    if (!name || !date || !priority) return;

    if (taskToEdit) {
        taskToEdit.name = name;
        taskToEdit.date = date;
        taskToEdit.priority = priority;

        const newElement = generateTask(taskToEdit);
        taskList.replaceChild(newElement, elementToEdit);

        taskToEdit = null;
        elementToEdit = null;
    } else {
        const newTask = {
            name,
            priority,
            completed: false,
            date,
            taskIndex: Date.now()
        };

        tasks.push(newTask);

        const taskElement = generateTask(newTask);
        const taskItems = Array.from(taskList.children);

        let added = false;
        for (let i = 0; i < taskItems.length; i++) {
            const checkbox = taskItems[i].querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                taskList.insertBefore(taskElement, taskItems[i]);
                added = true;
                break;
            }
        }
        if (!added) {
            taskList.appendChild(taskElement);
        }
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTasksView();
    hideTaskForm();
});

// Створення елемента задачі
function generateTask(task) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');

    if (task.taskIndex !== undefined) {
        taskItem.dataset.index = task.taskIndex;
    }

    const leftSide = document.createElement('div');
    leftSide.classList.add('left-side');

    const customCheckbox = document.createElement('label');
    customCheckbox.classList.add('custom-checkbox');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;

    if (task.completed) {
        setTimeout(() => {
            changeTaskPosition(taskItem, true);
        });
    }

    checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        changeTaskPosition(taskItem, checkbox.checked);
        localStorage.setItem("tasks", JSON.stringify(tasks)); 
    });

    const checkmark = document.createElement('span');
    checkmark.classList.add('checkmark');

    customCheckbox.append(checkbox, checkmark);

    const textBlock = document.createElement('div');
    textBlock.classList.add('text-block');

    const taskText = document.createElement('span');
    taskText.classList.add('task-text');
    taskText.textContent = task.name;

    const tag = document.createElement('span');
    tag.classList.add('tag', task.priority);
    tag.textContent = capitalize(task.priority.toLowerCase());

    textBlock.append(taskText, tag);
    leftSide.append(customCheckbox, textBlock);

    const rightSide = document.createElement('div');
    rightSide.classList.add('right-side');

    const taskDate = document.createElement('span');
    taskDate.classList.add('task-date');
    taskDate.textContent = task.date;

    rightSide.appendChild(taskDate);

    if(!taskItem.querySelector('.edit-and-delete-buttons')) {
        const buttons = document.createElement('div');
        buttons.classList.add('edit-and-delete-buttons');

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => {
            taskForm.style.display = 'flex';
            taskNameInput.value = task.name;
            taskDateInput.value = task.date;

            priorityInputs.forEach(input => {
                input.checked = input.value === task.priority;
            });

            taskToEdit = task;
            elementToEdit = taskItem;
            document.querySelector('.to-do-container').classList.add('disabled')
        });

        const editImage = document.createElement('img');
        editImage.src = './images/edit.svg';
        editImage.alt = 'Edit';
        editButton.appendChild(editImage);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            const index = parseInt(taskItem.dataset.index);
            tasks = tasks.filter(task => task.taskIndex !== index);
            taskItem.remove();
            localStorage.setItem("tasks", JSON.stringify(tasks));
        });

        const deleteImage = document.createElement('img');
        deleteImage.src = './images/delete.svg';
        deleteImage.alt = 'Delete';
        deleteButton.appendChild(deleteImage);

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);

        rightSide.appendChild(buttons);
    }

    taskItem.append(leftSide, rightSide);

    return taskItem;
}

// Функція для капіталізації першої літери
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Функція для зміни позиції задачі в списку
function changeTaskPosition(taskItem, isCompleted) {
    const taskItems = Array.from(taskList.children);
    taskList.removeChild(taskItem);

    const taskIndex = parseInt(taskItem.dataset.index);
    const taskData = tasks.find(task => task.taskIndex === taskIndex);

    if (isCompleted) {
        taskList.appendChild(taskItem);
        return;
    }

    let added = false;

    // Якщо сортування за датою
    if (currentSort === 'date') {
        const date = new Date(taskData.date);
        for (let i = 0; i < taskItems.length; i++) {
            const checkbox = taskItems[i].querySelector('input[type="checkbox"]');
            const index = parseInt(taskItems[i].dataset.index);
            const elementTask = tasks.find(task => task.taskIndex === index);
            const elementDate = new Date(elementTask.date);

            if (!checkbox.checked && (date > elementDate || (date.toDateString === elementDate.toDateString && taskData.taskIndex < elementTask.taskIndex))) {
                taskList.insertBefore(taskItem, taskItems[i]);
                added = true;
                break;
            }
        }
    }

    // Якщо сортування за пріоритетом
    else if (currentSort === 'priority') {
        const order = { high: 1, medium: 2, low: 3 };
        const priority = order[taskData.priority];

        for (let i = 0; i < taskItems.length; i++) {
            const checkbox = taskItems[i].querySelector('input[type="checkbox"]');
            const index = parseInt(taskItems[i].dataset.index);
            const elementTask = tasks.find(t => t.taskIndex === index);
            const elementPriority = order[elementTask.priority];

            if (!checkbox.checked && (priority < elementPriority || (priority === elementPriority && taskData.taskIndex < elementTask.taskIndex))) {
                taskList.insertBefore(taskItem, taskItems[i]);
                added = true;
                break;
            }
        }
    }

    // Якщо сортування none — вставляємо за taskIndex
    else {
        for (let i = 0; i < taskItems.length; i++) {
            const elementIndex = parseInt(taskItems[i].dataset.index);
            const checkbox = taskItems[i].querySelector('input[type="checkbox"]');

            if (!checkbox.checked && elementIndex > taskIndex) {
                taskList.insertBefore(taskItem, taskItems[i]);
                added = true;
                break;
            }
        }
    }

    // Якщо не вставилось у жодному випадку, шукаємо першу виконану або додаємо в кінець
    if (!added) {
        let placed = false;
        for (let i = 0; i < taskItems.length; i++) {
            const checkbox = taskItems[i].querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                taskList.insertBefore(taskItem, taskItems[i]);
                placed = true;
                break;
            }
        }
        if (!placed) {
            taskList.appendChild(taskItem);
        }
    }
}
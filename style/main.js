document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('newTaskInput');
    const addBtn = document.querySelector('.add-btn');
    const sortBySelect = document.getElementById('sortBy');
    const filterBySelect = document.getElementById('filterBy');
    const taskList = document.querySelector('.task-list');

    const taskModal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title-input');
    const taskDateInput = document.getElementById('task-date-input');
    const taskPrioritySelect = document.getElementById('task-priority-select');
    const cancelBtn = document.querySelector('.cancel-btn');

    let tasks = [];
    let editingTaskId = null;

    const renderTasks = () => {
        taskList.innerHTML = '';
        
        let tasksToRender = [...tasks];

        const filterValue = filterBySelect.value;
        if (filterValue === 'completed') {
            tasksToRender = tasksToRender.filter(task => task.completed);
        } else if (filterValue === 'pending') {
            tasksToRender = tasksToRender.filter(task => !task.completed);
        }

        const sortByValue = sortBySelect.value;
        const priorityValues = { high: 3, medium: 2, low: 1 };

        tasksToRender.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            if (sortByValue === 'date') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (sortByValue === 'priority') {
                return priorityValues[b.priority] - priorityValues[a.priority];
            }
            return 0;
        });

        tasksToRender.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;

            const priorityClass = task.priority.toLowerCase();
            const formattedDate = new Date(task.dueDate).toLocaleDateString('uk-UA', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            
            taskItem.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="task-${task.id}">${task.title}</label>
                </div>
                <div class="task-details">
                    <span class="priority ${priorityClass}">${task.priority}</span>
                    <span class="due-date">${formattedDate}</span>
                    <div class="task-actions">
                        <button class="icon-btn edit-btn">✎</button>
                        <button class="icon-btn delete-btn">🗑</button>
                    </div>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
    };

    const openModal = (mode = 'add', taskId = null) => {
        taskForm.reset();
        editingTaskId = taskId;

        if (mode === 'edit' && taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                modalTitle.textContent = 'Редагувати завдання';
                taskTitleInput.value = task.title;
                taskDateInput.value = task.dueDate;
                taskPrioritySelect.value = task.priority;
            }
        } else {
            modalTitle.textContent = 'Додати завдання';
        }
        taskModal.style.display = 'flex';
    };

    const closeModal = () => {
        taskModal.style.display = 'none';
        editingTaskId = null;
    };
    
    const loadTasks = async () => {
        try {
            const response = await fetch('tasks.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const initialTasks = await response.json();
            tasks = initialTasks.map(task => ({ ...task, id: Date.now() + Math.random() }));
        } catch (error) {
            console.error("Не вдалося завантажити завдання з tasks.json:", error);
            tasks = [];
        }
    };

    addBtn.addEventListener('click', () => {
        const title = newTaskInput.value.trim();
        openModal('add');
        if (title) {
             taskTitleInput.value = title;
             newTaskInput.value = '';
        }
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        const dueDate = taskDateInput.value;
        const priority = taskPrioritySelect.value;

        if (!title || !dueDate) {
            alert('Заповніть назву завдання та дату.');
            return;
        }
        
        if (editingTaskId) {
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) {
                task.title = title;
                task.dueDate = dueDate;
                task.priority = priority;
            }
        } else {
            const newTask = {
                id: Date.now(),
                title,
                dueDate,
                priority,
                completed: false,
            };
            tasks.push(newTask);
        }

        closeModal();
        renderTasks();
    });

    cancelBtn.addEventListener('click', closeModal);
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });
    
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;

        const taskId = Number(taskItem.dataset.id);

        if (target.type === 'checkbox') {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = target.checked;
                renderTasks();
            }
        } else if (target.matches('.delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
        } else if (target.matches('.edit-btn')) {
            openModal('edit', taskId);
        }
    });

    sortBySelect.addEventListener('change', renderTasks);
    filterBySelect.addEventListener('change', renderTasks);

    const initializeApp = async () => {
        await loadTasks();
        renderTasks();
    };

    initializeApp();
});
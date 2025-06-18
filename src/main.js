// DOM elements
let App = () => {
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskInput = document.getElementById('taskTitle');
  const taskList = document.getElementById('taskList');
  const taskModal = document.getElementById('taskModal');
  const taskForm = document.getElementById('taskForm');
  const closeModal = document.getElementById('closeModal');
  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  const openBtn = document.getElementById('openDateFilter');
  const popup = document.getElementById('dateFilterPopup');
  const applyBtn = document.getElementById('applyDateFilter');
  const modalTitle = document.getElementById('modalTitle');
  const saveTaskBtn = document.getElementById('saveTaskBtn');
  const sortOptions = document.getElementById('sortSelect');

  let allTasks = [];
  let originalTasks = [];
  let editingTask = null;
  let isFiltered = false;

  // Функція для завантаження завдань з JSON
  const loadTasksFromJSON = async () => {
    try {
      const response = await fetch('task.json');
      if (!response.ok) throw new Error('Не вдалося завантажити завдання');
      const tasks = await response.json();
      
      taskList.innerHTML = '';
      allTasks = [];
      originalTasks = [];
      
      tasks.forEach(task => {
        addTask(task.title, task.date, task.priority, task.completed);
      });
    } catch (error) {
      console.error('Помилка завантаження завдань:', error);
    
      initializeDefaultTasks();
    }
  };

  // Завантажуємо завдання при старті додатка
  loadTasksFromJSON();

  addTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'flex';
    taskForm.reset();
    document.querySelector('input[name="priority"][value="medium"]').checked = true;
    document.getElementById('taskTitle').focus();
    modalTitle.textContent = 'Додати нове завдання';
    saveTaskBtn.textContent = 'Додати завдання';
    editingTask = null;
  });

  closeModal.addEventListener('click', () => {
    taskModal.style.display = 'none';
  });

  cancelTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === taskModal) {
      taskModal.style.display = 'none';
    }
  });

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const date = document.getElementById('taskDate').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;

    if (!title) return;

    if (editingTask) {
      updateTask(editingTask, title, date, priority);
      editingTask = null;
    } else {
      addTask(title, date, priority);
    }
    taskModal.style.display = 'none';
  });

  // Функція addTask
  function addTask(title, date = '', priority = 'medium', completed = false) {
    const priorityClasses = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };

    const priorityTexts = {
      high: 'Високий',
      medium: 'Середній',
      low: 'Низький'
    };

    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';

    const formattedDate = date ? formatDate(date) : '';

    taskItem.innerHTML = `
      <label>
          <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
      </label>
      <div class="task-content">
        <div class="task-title ${completed ? 'completed' : ''}">${title}</div>
        <div class="task-meta">
          <span class="task-priority ${priorityClasses[priority]}">${priorityTexts[priority]}</span>
        </div>
      </div>
      ${formattedDate ? `<div class="task-date">${formattedDate}</div>` : ''}
      <div class="task-actions">
        <button class="action-btn edit-btn"><i class="fas fa-pencil-alt"></i></button>
        <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    `;

    if (completed) {
      taskItem.classList.add('task-completed');
    }

    initTaskEventListeners(taskItem);
    allTasks.push(taskItem);
    originalTasks.push(taskItem); 
    insertTask(taskItem, completed);
    sortOptions.dispatchEvent(new Event('change'));
  }

  function updateTask(taskItem, newTitle, newDate, newPriority) {
    const priorityClasses = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };

    const priorityTexts = {
      high: 'Високий',
      medium: 'Середній',
      low: 'Низький'
    };

    taskItem.querySelector('.task-title').textContent = newTitle;

    const prioritySpan = taskItem.querySelector('.task-priority');
    prioritySpan.textContent = priorityTexts[newPriority];
    Object.values(priorityClasses).forEach(cls => prioritySpan.classList.remove(cls));
    prioritySpan.classList.add(priorityClasses[newPriority]);

    const taskDateElement = taskItem.querySelector('.task-date');
    const formattedDate = newDate ? formatDate(newDate) : '';

    if (formattedDate) {
      if (taskDateElement) {
        taskDateElement.textContent = formattedDate;
      } else {
        const newDateDiv = document.createElement('div');
        newDateDiv.className = 'task-date';
        newDateDiv.textContent = formattedDate;
        taskItem.querySelector('.task-actions').before(newDateDiv);
      }
    } else {
      if (taskDateElement) {
        taskDateElement.remove();
      }
    }
    sortOptions.dispatchEvent(new Event('change'));
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  function parseFormattedDateToInputDate(formattedDateStr) {
    if (!formattedDateStr) return '';
    const date = parseDate(formattedDateStr);
    if (!date || isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function insertTask(taskItem, completed) {
    if (taskItem.parentNode === taskList) {
      taskItem.remove();
    }

    const tasksInDom = Array.from(taskList.children);

    if (completed) {
      taskList.appendChild(taskItem);
    } else {
      const firstCompletedTask = tasksInDom.find(task =>
          task.classList.contains('task-completed')
      );

      if (firstCompletedTask) {
        taskList.insertBefore(taskItem, firstCompletedTask);
      } else {
        taskList.appendChild(taskItem);
      }
    }
  }

  function initTaskEventListeners(taskItem) {
    const checkbox = taskItem.querySelector('.task-checkbox');
    checkbox.addEventListener('change', function() {
      taskItem.classList.toggle('task-completed', this.checked);
      taskItem.querySelector('.task-title').classList.toggle('completed', this.checked);
      insertTask(taskItem, this.checked);
      sortOptions.dispatchEvent(new Event('change'));
    });

    const deleteBtn = taskItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
      taskItem.remove();
      allTasks = allTasks.filter(t => t !== taskItem);
      originalTasks = originalTasks.filter(t => t !== taskItem);
      sortOptions.dispatchEvent(new Event('change'));
    });

    const editBtn = taskItem.querySelector('.edit-btn');
    editBtn.addEventListener('click', function() {
      editingTask = taskItem;
      const title = taskItem.querySelector('.task-title').textContent;
      const prioritySpan = taskItem.querySelector('.task-priority');
      const priority = prioritySpan.classList.contains('priority-high') ? 'high' :
          prioritySpan.classList.contains('priority-medium') ? 'medium' : 'low';
      const date = taskItem.querySelector('.task-date')?.textContent || '';

      document.getElementById('taskTitle').value = title;
      document.getElementById('taskDate').value = parseFormattedDateToInputDate(date);
      document.querySelector(`input[name="priority"][value="${priority}"]`).checked = true;

      modalTitle.textContent = 'Редагувати завдання';
      saveTaskBtn.textContent = 'Зберегти зміни';
      taskModal.style.display = 'flex';
    });
  }

  document.querySelectorAll('.task-item').forEach(taskItem => {
    initTaskEventListeners(taskItem);
  });

  sortOptions.addEventListener('change', (e) => {
    const value = e.target.value;
    switch (value) {
      case 'date':
        sortByDate();
        break;
      case 'priority':
        sortByPriority();
        break;
      case 'name':
        sortByName();
        break;
    }
  });

  openBtn.addEventListener('click', () => {
    popup.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && e.target !== openBtn) {
      popup.classList.add('hidden');
    }
  });

  applyBtn.addEventListener('click', () => {
    const mode = document.getElementById('dateFilterMode').value;
    const selectedDateInput = document.getElementById('dateInput').value;

    popup.classList.add('hidden');

    if (!selectedDateInput) {
      // Якщо дата не вибрана, показуємо всі завдання
      resetFilter();
      return;
    }

    const selectedFilterDate = new Date(selectedDateInput);
    selectedFilterDate.setHours(0, 0, 0, 0);

    // Фільтруємо оригінальні завдання
    const filteredTasks = originalTasks.filter(task => {
      const dateEl = task.querySelector('.task-date');
      if (!dateEl) return false;

      const parsedTaskDate = parseDate(dateEl.textContent);
      if (!parsedTaskDate) return false;

      parsedTaskDate.setHours(0, 0, 0, 0);

      switch (mode) {
        case 'current':
          return parsedTaskDate.getTime() === selectedFilterDate.getTime();
        case 'past':
          return parsedTaskDate.getTime() < selectedFilterDate.getTime();
        case 'upcoming':
          return parsedTaskDate.getTime() > selectedFilterDate.getTime();
        default:
          return false;
      }
    });

    // Оновлюємо поточний список завдань
    allTasks = [...filteredTasks];
    isFiltered = true;
    
    // Відображаємо відфільтровані завдання
    renderFilteredTasks();
    sortOptions.dispatchEvent(new Event('change'));
  });

  function resetFilter() {
    allTasks = [...originalTasks];
    isFiltered = false;
    renderFilteredTasks();
    sortOptions.dispatchEvent(new Event('change'));
  }

  function renderFilteredTasks() {
    taskList.innerHTML = '';
    
    const completedTasks = allTasks.filter(task => task.classList.contains('task-completed'));
    const incompleteTasks = allTasks.filter(task => !task.classList.contains('task-completed'));

    incompleteTasks.forEach(task => taskList.appendChild(task));
    completedTasks.forEach(task => taskList.appendChild(task));
  }

  function parseDate(dateStr) {
    const months = {
      'Січень': 0, 'Лютий': 1, 'Березень': 2, 'Квітень': 3, 'Травень': 4,
      'Червень': 5, 'Липень': 6, 'Серпень': 7, 'Вересень': 8, 'Жовтень': 9,
      'Листопад': 10, 'Грудень': 11
    };

    const [monthName, dayStr, yearStr] = dateStr.replace(',', '').split(' ');
    const month = months[monthName];
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);

    if (month === undefined || isNaN(day) || isNaN(year)) {
      return null;
    }

    return new Date(year, month, day);
  }

  function sortByDate() {
    const incompleteTasks = allTasks.filter(task => !task.classList.contains('task-completed'));
    const completedTasks = allTasks.filter(task => task.classList.contains('task-completed'));

    incompleteTasks.sort((a, b) => {
      const dateA = a.querySelector('.task-date')?.textContent;
      const dateB = b.querySelector('.task-date')?.textContent;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      const parsedDateA = parseDate(dateA);
      const parsedDateB = parseDate(dateB);

      if (!parsedDateA && !parsedDateB) return 0;
      if (!parsedDateA) return 1;
      if (!parsedDateB) return -1;

      return parsedDateA - parsedDateB;
    });

    taskList.innerHTML = '';
    incompleteTasks.forEach(task => taskList.appendChild(task));
    completedTasks.forEach(task => taskList.appendChild(task));
  }

  function sortByPriority() {
    const incompleteTasks = allTasks.filter(task => !task.classList.contains('task-completed'));
    const completedTasks = allTasks.filter(task => task.classList.contains('task-completed'));
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    incompleteTasks.sort((a, b) => {
      const prioA = getPriorityValue(a);
      const prioB = getPriorityValue(b);
      return priorityOrder[prioA] - priorityOrder[prioB];
    });

    taskList.innerHTML = '';
    incompleteTasks.forEach(task => taskList.appendChild(task));
    completedTasks.forEach(task => taskList.appendChild(task));
  }

  function getPriorityValue(taskItem) {
    if (taskItem.querySelector('.priority-high')) return 'high';
    if (taskItem.querySelector('.priority-medium')) return 'medium';
    if (taskItem.querySelector('.priority-low')) return 'low';
    return 'medium';
  }

  function sortByName() {
    const incompleteTasks = allTasks.filter(task => !task.classList.contains('task-completed'));
    const completedTasks = allTasks.filter(task => task.classList.contains('task-completed'));

    incompleteTasks.sort((a, b) => {
      const nameA = a.querySelector('.task-title').textContent.toLowerCase();
      const nameB = b.querySelector('.task-title').textContent.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    taskList.innerHTML = '';
    incompleteTasks.forEach(task => taskList.appendChild(task));
    completedTasks.forEach(task => taskList.appendChild(task));
  }
};

window.onload = () => {
  App();
};
const addTaskBtn = document.querySelector('.add-task-button');
const editBtn = document.querySelectorAll('.edit-button');
const taskForm = document.querySelector('.task-form');
const cancelFormBtn = document.querySelector('.cancel-button');
const filterSelect = document.querySelector('#filter-by');
const dateFilterInput = document.querySelector('.date-filter-input');
const applyFilterBtn = document.querySelector('#apply-filter');

addTaskBtn.addEventListener('click', () => {
    taskForm.classList.remove('hidden');
});

editBtn.forEach(button => {
    button.addEventListener('click', () => {
        taskForm.classList.remove('hidden');
    });
});

cancelFormBtn.addEventListener('click', () => {
    taskForm.classList.add('hidden');
});

filterSelect.addEventListener('change', () => {
    if (filterSelect.value === 'date') {
        dateFilterInput.classList.remove('hidden');
    } else {
        dateFilterInput.classList.add('hidden');
    }
});

applyFilterBtn.addEventListener('click', () => {
    dateFilterInput.classList.add('hidden');
});

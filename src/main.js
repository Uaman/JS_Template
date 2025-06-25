const taskPopUp = document.getElementById('taskPopUp');
const openBtn = document.getElementById('add-button');
const closeBtn = document.getElementById('closePopUpBtn');
const cancelBtn = document.getElementById('cancelPopUpBtn');

const filterByDate = document.getElementById('filterByDate');
const filetDateBtn = document.getElementById('sortSelect');
const applyBtn = document.getElementById('apply-button');

const checkButtons = document.querySelectorAll('.checkbox-btn');

openBtn.addEventListener('click', () => {
  taskPopUp.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => {
  taskPopUp.classList.add('hidden');
});

cancelBtn.addEventListener('click', () => {
  taskPopUp.classList.add('hidden');
});

filetDateBtn.addEventListener('click', () => {
  filterByDate.classList.remove('hidden');
});

applyBtn.addEventListener('click', () => {
  filterByDate.classList.add('hidden');
});

checkButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('checked');
  });
});



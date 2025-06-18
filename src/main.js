document.getElementById('createPoll').addEventListener('click', () => {
  document.getElementById('createPollModal').style.display = 'flex';
});

document.querySelectorAll('.poll-container').forEach(container => {
  container.addEventListener('click', () => {
    document.getElementById('votePollModal').style.display = 'flex';
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});
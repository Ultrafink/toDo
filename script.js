let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentTaskId = null; // Добавляем переменную для отслеживания редактируемой задачи

document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  updateDate();

  document.getElementById('submit-task').addEventListener('click', handleTaskSubmit);
  document.getElementById('search').addEventListener('input', renderTasks);
});

// Обновить дату и день недели
function updateDate() {
  const date = new Date();
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  document.getElementById('weekday').textContent = days[date.getDay()];
  document.getElementById('date').textContent = `${date.getDate()} ${months[date.getMonth()]}`;
}

// 24 формаь
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}


function handleTaskSubmit() {
  const desc = document.getElementById('task-desc').value.trim();
  const date = document.getElementById('task-date').value;
  const remind = document.getElementById('remind-checkbox').checked;

  if (!desc) return;

  if (currentTaskId) {
    // Обновление существующей задачи
    const task = tasks.find(t => t.id === currentTaskId);
    task.description = desc;
    task.date = date;
    task.remind = remind;

    currentTaskId = null; // Сбросить текущую задачу
  } else {
    // Добавление новой задачи
    const task = {
      id: Date.now(),
      description: desc,
      date,
      remind,
      done: false,
    };
    tasks.push(task);
  }

  // Сохраняем задачи в localStorage
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Перерисовываем задачи
  renderTasks();

  // Закрываем модальное окно
  closeModal();
}

function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  const query = document.getElementById('search').value.toLowerCase();
  const filtered = tasks.filter(t => {
    if (currentFilter === 'active' && t.done) return false;
    if (currentFilter === 'done' && !t.done) return false;
    return t.description.toLowerCase().includes(query);
  });

  const template = document.getElementById('task-template');

  filtered.forEach(task => {
    const taskEl = template.content.cloneNode(true);

    const checkbox = taskEl.querySelector('.task-checkbox');
    const description = taskEl.querySelector('.task-description');
    const date = taskEl.querySelector('.task-date');
    const editBtn = taskEl.querySelector('.edit-btn');
    const deleteBtn = taskEl.querySelector('.delete-btn');

    checkbox.checked = task.done;
    description.textContent = task.description;
    date.textContent = formatDateTime(task.date);

    
    editBtn.setAttribute('onclick', `editTask(${task.id})`);
    deleteBtn.setAttribute('onclick', `deleteTask(${task.id})`);

    checkbox.addEventListener('change', () => toggleTask(task.id));
    if (task.done) {
      taskEl.querySelector('.task').classList.add('completed');
    }

    list.appendChild(taskEl);
  });
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  task.done = !task.done;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  document.getElementById('task-desc').value = task.description;
  document.getElementById('task-date').value = task.date;
  document.getElementById('remind-checkbox').checked = task.remind;

  currentTaskId = task.id; // Запоминаем редактируемую задачу
  openModal();

  const btn = document.getElementById('submit-task');
  btn.textContent = 'Сохранить';
}

function openModal() {
  document.getElementById('task-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('task-desc').value = '';
  document.getElementById('task-date').value = '';
  document.getElementById('remind-checkbox').checked = false;
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab[onclick="setFilter('${filter}')"]`).classList.add('active');
  renderTasks();
}

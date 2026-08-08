// LocalStorage se tasks load karna
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  registerServiceWorker();
});

const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");

addBtn.addEventListener("click", addTask);

function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  const task = { text, completed: false };
  saveTaskToStorage(task);
  renderTask(task);
  todoInput.value = "";
}

function renderTask(task) {
  const li = document.createElement("li");
  li.className = `todo-item ${task.completed ? "completed" : ""}`;

  const span = document.createElement("span");
  span.textContent = task.text;
  span.addEventListener("click", () => {
    task.completed = !task.completed;
    li.classList.toggle("completed");
    updateStorage();
  });

  const delBtn = document.createElement("button");
  delBtn.textContent = "✖";
  delBtn.className = "delete-btn";
  delBtn.addEventListener("click", () => {
    li.remove();
    updateStorage();
  });

  li.appendChild(span);
  li.appendChild(delBtn);
  todoList.appendChild(li);
}

function saveTaskToStorage(task) {
  const tasks = getTasksFromStorage();
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasksFromStorage() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function loadTasks() {
  const tasks = getTasksFromStorage();
  tasks.forEach(renderTask);
}

function updateStorage() {
  const tasks = [];
  document.querySelectorAll(".todo-item").forEach(item => {
    tasks.push({
      text: item.querySelector("span").textContent,
      completed: item.classList.contains("completed")
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Service Worker Register karna
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.log('Service Worker Failed', err));
  }
}

// PWA Installation Control
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      deferredPrompt = null;
    });
  });
});

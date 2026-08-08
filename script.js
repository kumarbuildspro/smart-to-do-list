// App State
let tasks = JSON.parse(localStorage.getItem('smart_tasks')) || [];
let currentFilter = 'all';
let deferredPrompt;

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const taskList = document.getElementById('task-list');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const filterBtns = document.querySelectorAll('.filter-btn');
const installBtn = document.getElementById('install-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    registerServiceWorker();
});

// Add Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const newTask = {
        id: Date.now(),
        text: taskText,
        priority: prioritySelect.value,
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    taskInput.value = '';
});

// Toggle Complete & Delete Task
taskList.addEventListener('click', (e) => {
    const parentLi = e.target.closest('.task-item');
    if (!parentLi) return;
    const id = Number(parentLi.dataset.id);

    if (e.target.classList.contains('task-checkbox')) {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveAndRender();
    }

    if (e.target.closest('.delete-btn')) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }
});

// Filter Functionality
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Render Tasks & Progress
function renderTasks() {
    taskList.innerHTML = '';
    
    let filteredTasks = tasks.filter(t => {
        if (currentFilter === 'active') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHtml(task.text)}</span>
            </div>
            <button class="delete-btn" title="Delete Task">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        taskList.appendChild(li);
    });

    updateProgress();
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${completed} of ${total} tasks completed`;
}

function saveAndRender() {
    localStorage.setItem('smart_tasks', JSON.stringify(tasks));
    renderTasks();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Service Worker & PWA Install Logic
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('SW Registered'))
            .catch(err => console.error('SW Failed', err));
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        installBtn.classList.add('hidden');
    }
    deferredPrompt = null;
});

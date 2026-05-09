const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const statusInput = document.getElementById('status');
const taskList = document.getElementById('taskList');
const message = document.getElementById('message');
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.origin;

// Modal elements
const editModal = document.getElementById('editModal');
const modalTitle = document.getElementById('modalTitle');
const modalStatus = document.getElementById('modalStatus');
const modalSave = document.getElementById('modalSave');
const modalCancel = document.getElementById('modalCancel');
let currentEditId = null;

function openEditModal(id, title, status) {
  currentEditId = id;
  modalTitle.value = title || '';
  modalStatus.value = status || 'todo';
  editModal.setAttribute('aria-hidden', 'false');
  modalTitle.focus();
}

function closeEditModal() {
  currentEditId = null;
  editModal.setAttribute('aria-hidden', 'true');
}

async function saveEditFromModal() {
  if (!currentEditId) return;
  const newTitle = modalTitle.value.trim();
  const newStatus = modalStatus.value.trim();
  if (!newTitle) {
    showMessage('Title cannot be empty', true);
    return;
  }
  const res = await fetch(`${API_BASE}/task/${currentEditId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle, status: newStatus }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    showMessage(data.error || 'Unable to update task', true);
    return;
  }
  showMessage('Task updated');
  closeEditModal();
  loadTasks();
}

// keyboard handling
document.addEventListener('keydown', (e) => {
  if (editModal.getAttribute('aria-hidden') === 'false') {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeEditModal();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditFromModal();
    }
  }
});

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#b42318' : '#667085';
}

async function loadTasks() {
  const response = await fetch(`${API_BASE}/tasks`);
  const tasks = await response.json();
  taskList.innerHTML = '';

  if (!tasks.length) {
    taskList.innerHTML = '<div class="meta">No tasks yet. Add one above.</div>';
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement('div');
    row.className = 'task';
    // store current values to prefill edit form
    row.dataset.title = task.title;
    row.dataset.status = task.status;
    const visibleId = task._id || task.id;
    const statusClass = (task.status || 'todo').toLowerCase().replace(/\s+/g, '-');
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(task.title)}</strong>
        <div class="meta">ID: ${visibleId} <span class="badge badge-${statusClass}">${escapeHtml(task.status)}</span></div>
      </div>
      <div class="actions">
        <button class="secondary" data-action="edit" data-id="${visibleId}">Edit</button>
        <button class="danger" data-action="delete" data-id="${visibleId}">Delete</button>
      </div>
    `;
    taskList.appendChild(row);
  });
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const status = statusInput.value;

  const response = await fetch(`${API_BASE}/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, status }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    showMessage(data.error || 'Unable to create task', true);
    return;
  }

  taskForm.reset();
  statusInput.value = 'todo';
  showMessage('Task created');
  loadTasks();
});

taskList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (button.dataset.action === 'delete') {
    const response = await fetch(`${API_BASE}/task/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showMessage(data.error || 'Unable to delete task', true);
      return;
    }
    showMessage('Task deleted');
    loadTasks();
    return;
  }

  if (button.dataset.action === 'edit') {
    // open modal for editing
    const row = button.closest('.task');
    const currentTitle = row.dataset.title || '';
    const currentStatus = row.dataset.status || 'todo';
    openEditModal(id, currentTitle, currentStatus);
    return;
  }

  // Save handler
  if (button.dataset.action === 'save') {
    const row = button.closest('.task');
    const newTitle = (row.querySelector('.edit-title') || {}).value || '';
    const newStatus = (row.querySelector('.edit-status') || {}).value || '';
    if (!newTitle.trim()) {
      showMessage('Title cannot be empty', true);
      return;
    }
    const response = await fetch(`${API_BASE}/task/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), status: newStatus.trim() }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showMessage(data.error || 'Unable to update task', true);
      return;
    }

    showMessage('Task updated');
    loadTasks();
    return;
  }

  // Cancel handler
  if (button.dataset.action === 'cancel') {
    loadTasks();
    return;
  }
});

// modal button handlers
modalSave.addEventListener('click', (e) => {
  e.preventDefault();
  saveEditFromModal();
});
modalCancel.addEventListener('click', (e) => {
  e.preventDefault();
  closeEditModal();
});

loadTasks().catch((error) => showMessage(error.message, true));

// small helper to avoid XSS when injecting values
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

import http from '../api/http';

export async function fetchTasks(params = {}) {
  const { data } = await http.get('/tasks', { params });
  return data.tasks;
}

export async function createTask(payload) {
  const { data } = await http.post('/tasks', payload);
  return data.task;
}

export async function updateTask(id, payload) {
  const { data } = await http.put(`/tasks/${id}`, payload);
  return data.task;
}

export async function toggleTask(id) {
  const { data } = await http.patch(`/tasks/${id}/toggle`);
  return data.task;
}

export async function deleteTask(id) {
  const { data } = await http.delete(`/tasks/${id}`);
  return data.message;
}

export async function reorderTasks(orderedIds) {
  const { data } = await http.patch('/tasks/reorder', { orderedIds });
  return data.message;
}

export async function createSubtask(taskId, payload) {
  const { data } = await http.post(`/tasks/${taskId}/subtasks`, payload);
  return data.task;
}

export async function toggleSubtask(taskId, subtaskIndex, completed) {
  const { data } = await http.patch(`/tasks/${taskId}/subtasks/${subtaskIndex}`, { completed });
  return data.task;
}

import http from '../api/http';

export async function generateTaskPlan(prompt) {
  const { data } = await http.post('/ai/generate', { prompt });
  return data;
}

export async function prioritizeTasks(tasks) {
  const { data } = await http.post('/ai/prioritize', { tasks });
  return data;
}

export async function parseNaturalLanguageTask(text) {
  const { data } = await http.post('/ai/parse', { text });
  return data;
}

export async function askAssistant(prompt, context = {}) {
  const { data } = await http.post('/ai/assistant', { prompt, context });
  return data.reply;
}

export async function fetchDailySchedule() {
  const { data } = await http.get('/ai/schedule');
  return data.schedule;
}
